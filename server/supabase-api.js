import { createDeveloperLab } from './developer-lab.js';
import { createPremiumPayments } from './premium-payments.js';
import { createPremiumRooms } from './premium-rooms.js';

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function requireValue(value, status, message) { if (!value) throw new ApiError(status, message); }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuid(value) {
  requireValue(typeof value === 'string' && UUID.test(value), 400, 'Choose a valid saved story or submission.');
  return value;
}

export function createSupabaseHandler({ url, anonKey, serviceKey, origins, siteUrl, registration = true, paypal = {}, fetchImpl = fetch }) {
  requireValue(url && anonKey && serviceKey && Array.isArray(origins) && origins.length &&
    siteUrl && origins.includes(new URL(siteUrl).origin), 500, 'Configure Supabase keys, GG_ALLOWED_ORIGINS and GG_SITE_URL on the server.');
  const project = new URL(url);
  requireValue(project.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(project.hostname), 500, 'Supabase must use HTTPS.');
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  const developerLab = createDeveloperLab(serviceKey);
  async function upstream(path, { method = 'GET', body, token, admin = false } = {}) {
    const response = await fetchImpl(project.origin + path, {
      method, headers: { 'Content-Type': 'application/json', apikey: admin ? serviceKey : anonKey,
        ...(admin || token ? { Authorization: `Bearer ${admin ? serviceKey : token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000),
    });
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : null; }
    catch { throw new ApiError(502, 'The hosted service returned an unexpected response. Please retry.'); }
    if (!response.ok) {
      const code = data?.code;
      if (/^P04\d\d$/.test(code || '')) throw new ApiError(Number(code.slice(1)), data.message);
      if (code === '23505') throw new ApiError(409, 'This version or account already exists.');
      if (path.startsWith('/auth/')) {
        const status = response.status === 429 ? 429 : response.status >= 500 ? 503 : response.status;
        throw new ApiError(status, data?.msg || data?.message || data?.error_description || 'Authentication failed. Try again.');
      }
      console.error('Supabase database request failed', response.status, code);
      throw new ApiError(503, 'The story database is unavailable. Contact the site owner if this continues.');
    }
    return data;
  }
  const rpc = (name, body) => upstream(`/rest/v1/rpc/${name}`, { method: 'POST', body, admin: true });
  const payments = createPremiumPayments({ rpc, config: paypal, siteUrl, fetchImpl });
  const premiumRooms = createPremiumRooms({ rpc, environment: payments.environment });
  const premiumGames = createDeveloperLab(serviceKey, { namespace: `premium-${payments.environment}`, resume: true });
  async function profile(authUser) {
    requireValue(authUser?.id && authUser?.email, 401, 'Please log in again.');
    const name = typeof authUser.user_metadata?.name === 'string' && authUser.user_metadata.name.trim()
      ? authUser.user_metadata.name.trim().slice(0, 80) : 'Story author';
    return rpc('gg_profile', { p_user: authUser.id, p_email: authUser.email, p_name: name });
  }
  async function session(data) {
    if (!data?.access_token) return { confirmationRequired: true };
    const authUser = await upstream('/auth/v1/user', { token: data.access_token });
    return { token: data.access_token, refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000, user: await profile(authUser) };
  }
  async function bodyFor(request) {
    const declared = Number(request.headers.get('content-length') || 0);
    requireValue(declared <= 1048576, 413, 'Request is too large; keep it under 1 MB.');
    const reader = request.body?.getReader();
    requireValue(reader, 400, 'Send a JSON request object.');
    let size = 0; const chunks = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 1048576) { await reader.cancel(); throw new ApiError(413, 'Request is too large; keep it under 1 MB.'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const combined = new Uint8Array(size); let offset = 0;
    chunks.forEach(chunk => { combined.set(chunk, offset); offset += chunk.length; });
    let value;
    try { value = JSON.parse(new TextDecoder().decode(combined)); }
    catch { throw new ApiError(400, 'Send valid JSON.'); }
    requireValue(value && typeof value === 'object' && !Array.isArray(value), 400, 'Request must be a JSON object.');
    return value;
  }
  function email(value) {
    requireValue(typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 400, 'Enter your email address.');
    return value.trim().toLowerCase();
  }
  function password(value) {
    requireValue(typeof value === 'string' && value.length >= 12 && value.length <= 256, 400, 'Use a password of 12-256 characters.');
    return value;
  }
  async function route(req, pathname) {
    if (/^\/api\/(?:drafts|submissions|community|admin\/submissions)(?:\/|$)/.test(pathname)) {
      throw new ApiError(410, 'Story creation and community publishing have been retired. Choose a mystery from the site catalog.');
    }
    if (pathname === '/api/health' && req.method === 'GET') {
      // Detect a missing migration instead of reporting a success-shaped health check.
      await rpc('gg_catalog', { p_id: null });
      return { available: true, registration, authMode: 'email' };
    }
    if (pathname.startsWith('/api/auth/') && req.method === 'POST') {
      if (['login', 'register', 'refresh', 'recover'].some(action => pathname === `/api/auth/${action}`)) {
        const body = await bodyFor(req);
        if (pathname.endsWith('/login')) return session(await upstream('/auth/v1/token?grant_type=password', {
          method: 'POST', body: { email: email(body.username), password: body.password },
        }));
        if (pathname.endsWith('/register')) {
          requireValue(registration, 403, 'New account registration is closed.');
          requireValue(typeof body.name === 'string' && body.name.trim().length > 0 && body.name.length <= 80, 400, 'Add a public author credit of 1-80 characters.');
          return session(await upstream(`/auth/v1/signup?redirect_to=${encodeURIComponent(siteUrl)}`, {
            method: 'POST', body: { email: email(body.username), password: password(body.password), data: { name: body.name.trim() } },
          }));
        }
        if (pathname.endsWith('/refresh')) {
          requireValue(typeof body.refreshToken === 'string' && body.refreshToken.length <= 2048, 400, 'Refresh session is invalid. Log in again.');
          return session(await upstream('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: body.refreshToken } }));
        }
        await upstream(`/auth/v1/recover?redirect_to=${encodeURIComponent(siteUrl)}`, { method: 'POST', body: { email: email(body.username) } });
        return { message: 'If this address has an account, a password-reset email will arrive. Check your inbox and spam folder.' };
      }
    }
    if (pathname === '/api/shop' && req.method === 'GET') return payments.catalog(null, req.headers.get('origin'));
    if (pathname === '/api/paypal/webhook' && req.method === 'POST') return payments.webhook(req, await bodyFor(req));
    if (pathname === '/api/premium/rooms/guest' && req.method === 'POST') return premiumRooms.guest(await bodyFor(req));
    const token = /^Bearer (.+)$/.exec(req.headers.get('authorization') || '')?.[1];
    requireValue(token && token.length <= 8192, 401, 'Please log in again.');
    // Never trust decoded JWT claims or user-supplied metadata roles.
    const user = await profile(await upstream('/auth/v1/user', { token }));
    if (pathname === '/api/auth/me' && req.method === 'GET') return { user };
    if (pathname === '/api/purchases' && req.method === 'GET') return payments.catalog(user, req.headers.get('origin'));
    if (pathname === '/api/purchases/orders' && req.method === 'POST') return payments.create(user, await bodyFor(req), req.headers.get('origin'));
    if (pathname === '/api/purchases/capture' && req.method === 'POST') return payments.capture(user, await bodyFor(req));
    if (pathname === '/api/premium/rooms' || pathname === '/api/premium/rooms/host') {
      const library = await rpc('gg_purchases', { p_user: user.id, p_environment: payments.environment });
      requireValue(library.owned && (payments.environment !== 'sandbox' || user.role === 'admin'), 403, 'Active bundle ownership is required to host. Guests join free with the room code.');
      requireValue(payments.environment !== 'live' || req.headers.get('origin') === new URL(siteUrl).origin, 403, 'Host paid rooms on the production website.');
      if (pathname.endsWith('/host') && req.method === 'POST') return premiumRooms.host(user, await bodyFor(req));
      if (pathname === '/api/premium/rooms' && req.method === 'GET') return premiumRooms.list(user);
      if (pathname === '/api/premium/rooms' && req.method === 'POST') return premiumRooms.create(user, await bodyFor(req));
    }
    if (pathname === '/api/premium/games') {
      const library = await rpc('gg_purchases', { p_user: user.id, p_environment: payments.environment });
      requireValue(library.owned, 403, 'Buy the two-game bundle with this account before playing. Purchase access never grants administrator privileges.');
      if (req.method === 'GET') return premiumGames.catalog();
      if (req.method === 'POST') return premiumGames.act(await bodyFor(req), user.id);
    }
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      await upstream('/auth/v1/logout?scope=global', { method: 'POST', token });
      return { loggedOut: true };
    }
    if (pathname === '/api/auth/password' && req.method === 'POST') {
      const body = await bodyFor(req);
      await upstream('/auth/v1/user', { method: 'PUT', token, body: { password: password(body.password) } });
      return { message: 'Password updated. Keep it in your password manager.' };
    }
    if (pathname.startsWith('/api/admin/')) {
      requireValue(user.role === 'admin', 403, 'Only the site administrator can access developer or payment controls.');
      if (pathname === '/api/admin/purchases' && req.method === 'GET') return payments.adminOrders(user);
      if (pathname === '/api/admin/purchases/refund' && req.method === 'POST') {
        const body = await bodyFor(req);
        body.id = uuid(body.id);
        requireValue(body.confirm === true, 400, 'Confirm the full refund and access removal.');
        return payments.refund(user, body);
      }
      if (pathname === '/api/admin/developer' && req.method === 'GET') return developerLab.catalog();
      if (pathname === '/api/admin/developer' && req.method === 'POST') {
        return developerLab.act(await bodyFor(req), user.id);
      }
    }
    throw new ApiError(404, 'API route not found.');
  }
  return async request => {
    const responseHeaders = { ...headers };
    const origin = request.headers.get('origin');
    if (origin && origins.includes(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
      responseHeaders.Vary = 'Origin';
      responseHeaders['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, apikey, x-client-info';
      responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS';
    }
    try {
      requireValue(!origin || origins.includes(origin), 403, 'This website is not allowed to access the community service.');
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders });
      const pathname = new URL(request.url).pathname.replace(/^\/(?:functions\/v1\/)?community(?=\/|$)/, '');
      const data = await route(request, pathname);
      return new Response(JSON.stringify(data), { headers: responseHeaders });
    } catch (error) {
      if (!error.status) console.error('Hosted community request failed', error.name);
      return new Response(JSON.stringify({ error: error.status ? error.message : 'The community service could not complete the request. Please retry or contact the site owner.' }),
        { status: error.status || 503, headers: responseHeaders });
    }
  };
}
