import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDeveloperLab } from './developer-lab.js';
import { SITE_FILES } from '../tools/build-site.mjs';
import { PREMIUM_BUNDLE } from './premium-payments.js';

const scrypt = promisify(scryptCallback);
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const digest = value => createHash('sha256').update(value).digest('hex');
const SESSION_MS = 24 * 60 * 60 * 1000;
class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function requireValue(condition, status, message) { if (!condition) throw new ApiError(status, message); }
function text(value, label, max = 200) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.length <= max, 400, `${label} is required (maximum ${max} characters).`);
  return value.trim();
}
export async function passwordHash(password) {
  requireValue(typeof password === 'string' && password.length >= 12 && password.length <= 256, 400, 'Use a password of 12-256 characters.');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${Buffer.from(await scrypt(password, salt, 64)).toString('hex')}`;
}
async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const [salt, stored] = hash.split(':');
  const derived = await scrypt(password, salt, 64);
  return timingSafeEqual(Buffer.from(stored, 'hex'), derived);
}
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let length = 0, failed = false;
    const chunks = [];
    req.on('data', chunk => {
      if (failed) return;
      length += chunk.length;
      if (length > 1024 * 1024) {
        failed = true; chunks.length = 0;
        reject(new ApiError(413, 'This request is too large. Keep each story under 1 MB.'));
      } else chunks.push(chunk);
    });
    req.on('end', () => {
      if (failed) return;
      try {
        const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        requireValue(value && typeof value === 'object' && !Array.isArray(value), 400, 'Request must be a JSON object.');
        resolve(value);
      } catch (error) { reject(error instanceof ApiError ? error : new ApiError(400, 'Send a valid JSON request.')); }
    });
    req.on('error', reject);
  });
}

export async function createCommunityServer({
  database = process.env.GG_DATABASE_PATH || path.join(root, 'data', 'community.sqlite'),
  adminUsername = process.env.GG_ADMIN_USERNAME,
  adminPassword = process.env.GG_ADMIN_PASSWORD,
  origins = (process.env.GG_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  registration = process.env.GG_REGISTRATION !== 'closed',
} = {}) {
  if (database !== ':memory:') await mkdir(path.dirname(database), { recursive: true });
  const db = new DatabaseSync(database);
  const developerLab = createDeveloperLab(randomBytes(32).toString('hex'));
  db.exec(`
    PRAGMA foreign_keys=ON;
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('author','admin'))
    );
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, revision INTEGER NOT NULL, updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS revisions (
      draft_id TEXT NOT NULL REFERENCES drafts(id), revision INTEGER NOT NULL, content TEXT NOT NULL, created INTEGER NOT NULL,
      PRIMARY KEY(draft_id,revision)
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), draft_id TEXT NOT NULL,
      revision INTEGER NOT NULL, title TEXT NOT NULL, author TEXT NOT NULL, content TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending','approved','changes_requested','rejected','unpublished')),
      note TEXT NOT NULL DEFAULT '', created INTEGER NOT NULL, updated INTEGER NOT NULL,
      UNIQUE(draft_id,revision), FOREIGN KEY(draft_id,revision) REFERENCES revisions(draft_id,revision)
    );
    CREATE TABLE IF NOT EXISTS moderation (id TEXT PRIMARY KEY, submission_id TEXT NOT NULL REFERENCES submissions(id), admin_id TEXT NOT NULL REFERENCES users(id), decision TEXT NOT NULL, note TEXT NOT NULL, created INTEGER NOT NULL);
  `);
  if (adminUsername || adminPassword) {
    requireValue(adminUsername && adminPassword, 500, 'Set both GG_ADMIN_USERNAME and GG_ADMIN_PASSWORD to create the administrator.');
    const username = text(adminUsername, 'Admin username', 40).toLowerCase();
    const existing = db.prepare('SELECT * FROM users WHERE username=?').get(username);
    requireValue(!existing || existing.role === 'admin', 500, 'The bootstrap admin username belongs to an author. Choose a different admin username.');
    if (!existing) db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(randomUUID(), username, username, await passwordHash(adminPassword), 'admin');
  }
  const dummyPassword = await passwordHash(randomBytes(24).toString('hex'));
  const attempts = new Map();
  const rates = new Map();
  function throttle(map, key, limit, windowMs) {
    const now = Date.now();
    for (const [id, entry] of map) if (entry.until <= now) map.delete(id);
    requireValue(map.size < 10000 || map.has(key), 429, 'Service is busy; retry later.');
    const entry = map.get(key) || { count: 0, until: now + windowMs };
    entry.count++;
    map.set(key, entry);
    requireValue(entry.count <= limit, 429, 'Too many requests. Please wait before trying again.');
  }
  function userFor(req) {
    const token = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '')?.[1];
    const user = token && db.prepare('SELECT u.id,u.username,u.display_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?').get(digest(token), Date.now());
    requireValue(user, 401, 'Please log in again.');
    return user;
  }
  const profile = user => ({ id: user.id, username: user.username, name: user.display_name, role: user.role });
  function login(user) {
    db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
    const token = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), user.id, Date.now() + SESSION_MS);
    return { token, user: profile(user) };
  }
  async function api(req, pathname) {
    if (/^\/api\/(?:drafts|submissions|community|admin\/submissions)(?:\/|$)/.test(pathname)) {
      throw new ApiError(410, 'Story creation and community publishing have been retired. Choose a mystery from the site catalog.');
    }
    if (pathname === '/api/health' && req.method === 'GET') return { available: true, registration };
    const closedShop = () => ({ bundle: PREMIUM_BUNDLE, owned: false, orders: [], environment: 'live',
      checkoutEnabled: false, checkoutNotice: 'Purchases require the hosted Supabase payment service. This local community server does not accept payments.' });
    if (pathname === '/api/shop' && req.method === 'GET') return closedShop();
    if (['/api/auth/login', '/api/auth/register'].includes(pathname) && req.method === 'POST') {
      throttle(attempts, `ip:${req.socket.remoteAddress}`, 120, 15 * 60 * 1000);
      const body = await readBody(req);
      const username = text(body.username, 'Username', 40).toLowerCase();
      requireValue(/^[a-z0-9_-]{3,40}$/.test(username), 400, 'Username needs 3-40 letters, digits, underscores or hyphens.');
      throttle(attempts, `name:${username}`, 12, 15 * 60 * 1000);
      if (pathname.endsWith('register')) {
        requireValue(registration, 403, 'New account registration is closed.');
        const name = text(body.name, 'Author credit', 80);
        const hash = await passwordHash(body.password);
        requireValue(!db.prepare('SELECT id FROM users WHERE username=?').get(username), 409, 'That username is unavailable.');
        const user = { id: randomUUID(), username, display_name: name, role: 'author' };
        db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(user.id, username, name, hash, user.role);
        return login(user);
      }
      const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
      const valid = await verifyPassword(body.password, user?.password || dummyPassword);
      requireValue(user && valid, 401, 'Username or password is incorrect.');
      return login(user);
    }
    const user = userFor(req);
    if (pathname === '/api/purchases' && req.method === 'GET') return closedShop();
    if (pathname.startsWith('/api/purchases/') || pathname.startsWith('/api/premium/') || pathname.startsWith('/api/admin/purchases')) {
      throw new ApiError(501, 'Payments and purchased games require the hosted Supabase payment service.');
    }
    if (pathname === '/api/auth/me' && req.method === 'GET') return { user: profile(user) };
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      db.prepare('DELETE FROM sessions WHERE token=?').run(digest(req.headers.authorization.slice(7)));
      return { loggedOut: true };
    }
    throttle(rates, user.id, 120, 60000);
    if (pathname.startsWith('/api/admin/')) {
      requireValue(user.role === 'admin', 403, 'Only the site administrator can access developer controls.');
      if (pathname === '/api/admin/developer' && req.method === 'GET') return developerLab.catalog();
      if (pathname === '/api/admin/developer' && req.method === 'POST') return developerLab.act(await readBody(req), user.id);
    }
    throw new ApiError(404, 'API route not found.');
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    const origin = req.headers.origin;
    if (origin && origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    }
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        const sameOrigin = origin && origin === `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`;
        requireValue(!origin || sameOrigin || origins.includes(origin), 403, 'This website is not allowed to access the community service.');
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
        const data = await api(req, pathname);
        res.end(JSON.stringify(data));
        return;
      }
      requireValue(['GET', 'HEAD'].includes(req.method), 405, 'Method not allowed.');
      const decoded = decodeURIComponent(pathname);
      const file = path.resolve(root, `.${decoded}`);
      const relative = path.relative(root, file);
      requireValue(!relative.startsWith('..') && !path.isAbsolute(relative), 404, 'File not found.');
      const allowed = ['', ...SITE_FILES];
      requireValue(allowed.includes(relative) || /^(?:js|css|assets|vendor)[\\/]/.test(relative), 404, 'File not found.');
      const target = decoded === '/' ? path.join(root, 'index.html') : file;
      const data = await readFile(target);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.ogg': 'audio/ogg' };
      res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      const status = error.status || (error.code === 'ENOENT' ? 404 : 500);
      if (status === 500) console.error('Community request failed', error);
      res.writeHead(status);
      res.end(JSON.stringify({ error: status === 500 ? 'The service could not complete this request. Please retry or contact the site owner.' : error.message }));
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.on('close', () => db.close());
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await createCommunityServer();
  const port = Number(process.env.PORT || 8132);
  server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Grim Gatherings community service listening on port ${port}.`));
}
