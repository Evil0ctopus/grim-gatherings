import { checkDraft, isEditableStory } from '../js/workshop-core.js';
import { createDeveloperLab } from './developer-lab.js';

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function requireValue(value, status, message) { if (!value) throw new ApiError(status, message); }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuid(value) {
  requireValue(typeof value === 'string' && UUID.test(value), 400, 'Choose a valid saved story or submission.');
  return value;
}
function validateDraft(content) {
  requireValue(content && typeof content === 'object' && !Array.isArray(content) &&
    isEditableStory(content.story), 400, 'A complete editable draft structure is required; its text may still be unfinished.');
  requireValue(JSON.stringify(content).length <= 750000, 413, 'Draft is too large.');
  requireValue(Array.isArray(content.locks) && content.locks.length <= 100 &&
    content.locks.every(l => l && typeof l.term === 'string' && Number.isInteger(l.round)), 400, 'Hidden facts need a phrase and first-release round.');
  requireValue(typeof content.story.title === 'string' && content.story.title.trim().length > 0 &&
    content.story.title.length <= 200, 400, 'Add a story title of 1-200 characters.');
  return content;
}
function playable(content) {
  validateDraft(content);
  requireValue(!content.rawJson, 400, 'Apply or correct the pasted JSON before submitting.');
  const checked = checkDraft(content);
  requireValue(checked.story, 400, checked.errors.join('\n'));
  checked.story.characters.forEach(c => { c.guest = ''; c.guestNote = ''; });
  delete checked.story.edition; delete checked.story.provenance;
  return checked.story;
}

export function createSupabaseHandler({ url, anonKey, serviceKey, origins, siteUrl, registration = true, fetchImpl = fetch }) {
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
    if (pathname === '/api/community' && req.method === 'GET') return rpc('gg_catalog', { p_id: null });
    const publicId = /^\/api\/community\/([^/]+)$/.exec(pathname)?.[1];
    if (publicId && req.method === 'GET') return rpc('gg_catalog', { p_id: uuid(publicId) });
    const token = /^Bearer (.+)$/.exec(req.headers.get('authorization') || '')?.[1];
    requireValue(token && token.length <= 8192, 401, 'Please log in again.');
    // Never trust decoded JWT claims or user-supplied metadata roles.
    const user = await profile(await upstream('/auth/v1/user', { token }));
    if (pathname === '/api/auth/me' && req.method === 'GET') return { user };
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      await upstream('/auth/v1/logout?scope=global', { method: 'POST', token });
      return { loggedOut: true };
    }
    if (pathname === '/api/auth/password' && req.method === 'POST') {
      const body = await bodyFor(req);
      await upstream('/auth/v1/user', { method: 'PUT', token, body: { password: password(body.password) } });
      return { message: 'Password updated. Keep it in your password manager.' };
    }
    if (pathname === '/api/drafts') {
      if (req.method === 'GET') return rpc('gg_read_drafts', { p_user: user.id });
      if (req.method === 'POST') {
        const body = await bodyFor(req);
        return rpc('gg_save_draft', { p_user: user.id, p_id: null, p_content: validateDraft(body.content), p_expected: null });
      }
    }
    const match = /^\/api\/drafts\/([^/]+)(?:\/(versions)(?:\/(\d+))?)?$/.exec(pathname);
    if (match) {
      const [, id, versions, number] = match;
      if (req.method === 'GET') return rpc('gg_read_drafts', { p_user: user.id, p_id: uuid(id),
        p_revision: number ? Number(number) : null, p_versions: !!versions && !number });
      if (!versions && req.method === 'PUT') {
        const body = await bodyFor(req);
        requireValue(Number.isInteger(body.expectedRevision) && body.expectedRevision > 0, 400, 'Choose the expected saved revision.');
        return rpc('gg_save_draft', { p_user: user.id, p_id: uuid(id), p_content: validateDraft(body.content), p_expected: body.expectedRevision });
      }
    }
    if (pathname === '/api/submissions') {
      if (req.method === 'GET') return rpc('gg_read_submissions', { p_user: user.id });
      if (req.method === 'POST') {
        const body = await bodyFor(req);
        requireValue(body.consent === true, 400, 'Confirm ownership and permission to publish.');
        requireValue(Number.isInteger(body.revision) && body.revision > 0, 400, 'Choose a saved revision.');
        const id = uuid(body.draftId);
        const saved = await rpc('gg_read_drafts', { p_user: user.id, p_id: id, p_revision: body.revision });
        return rpc('gg_submit', { p_user: user.id, p_id: id, p_revision: body.revision, p_story: playable(saved.content), p_consent: true });
      }
    }
    if (pathname.startsWith('/api/admin/')) {
      requireValue(user.role === 'admin', 403, 'Only the site administrator can review submissions.');
      if (pathname === '/api/admin/developer' && req.method === 'GET') return developerLab.catalog();
      if (pathname === '/api/admin/developer' && req.method === 'POST') {
        return developerLab.act(await bodyFor(req), user.id);
      }
      if (pathname === '/api/admin/submissions' && req.method === 'GET') return rpc('gg_read_submissions', { p_user: user.id, p_admin: true });
      const id = /^\/api\/admin\/submissions\/([^/]+)$/.exec(pathname)?.[1];
      if (id) {
        if (req.method === 'GET') return rpc('gg_read_submissions', { p_user: user.id, p_admin: true, p_id: uuid(id) });
        if (req.method === 'POST') {
          const body = await bodyFor(req);
          requireValue(['approved', 'changes_requested', 'rejected', 'unpublished'].includes(body.decision) &&
            typeof body.note === 'string' && body.note.length <= 2000, 400, 'Choose a moderation decision and note under 2000 characters.');
          if (body.decision === 'approved') {
            requireValue(body.reviewed === true, 400, 'Preview every chapter and confirm your review.');
            const entry = await rpc('gg_read_submissions', { p_user: user.id, p_admin: true, p_id: uuid(id) });
            playable(entry.submission.content);
          }
          return rpc('gg_moderate', { p_user: user.id, p_id: uuid(id), p_decision: body.decision, p_note: body.note, p_reviewed: body.reviewed === true });
        }
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
