import { COMMUNITY_API, COMMUNITY_PROVIDER } from './community-config.js';

const KEY = 'gg-community-session-v1';
export const emailAccounts = COMMUNITY_PROVIDER === 'supabase';

export function createCommunityClient({ endpoint = '', provider = 'node', storage, fetchImpl = fetch }) {
  const emailMode = provider === 'supabase';
  let origin = '';
  if (endpoint) {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
      throw new Error('The community service must use HTTPS (except local development).');
    }
    const permittedPath = emailMode ? '/functions/v1/community' : '';
    if (url.username || url.password || url.search || url.hash || url.pathname.replace(/\/$/, '') !== permittedPath) {
      throw new Error('Configure a community service origin, or the Supabase community Edge Function URL, without credentials or a query.');
    }
    origin = url.origin + permittedPath;
  }
  function stored() {
    const value = storage.getItem(KEY);
    if (!value) return null;
    if (!value.startsWith('{')) return { token: value };
    try { return JSON.parse(value); }
    catch { throw new Error('Your login session could not be read. Clear the workshop login session and sign in again.'); }
  }
  const token = () => stored()?.token || '';
  let identityVersion = 0;
  function writeSession(value) {
    if (!value) { storage.removeItem(KEY); return; }
    const record = typeof value === 'string' ? { token: value } : {
      token: value.token, refreshToken: value.refreshToken, expiresAt: value.expiresAt,
    };
    if (!record.token || typeof record.token !== 'string') throw new Error('The login service returned no session. Check your confirmation email before signing in.');
    storage.setItem(KEY, JSON.stringify(record));
  }
  function saveSession(value) { identityVersion++; writeSession(value); }
  async function send(path, { method = 'GET', body, token: accessToken = '' } = {}) {
    const response = await fetchImpl(`${origin}${path}`, {
      method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
    });
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('Shared stories are not connected yet. Private editing, downloads and saves still work. The site owner needs to deploy the community service.');
    }
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || `Community service returned ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    return data;
  }
  let refreshing = null;
  async function refresh() {
    if (!refreshing) {
      const current = stored();
      if (!emailMode || !current?.refreshToken) throw new Error('Please log in again.');
      refreshing = (async () => {
        try {
          const result = await send('/api/auth/refresh', { method: 'POST', body: { refreshToken: current.refreshToken } });
          if (token() !== current.token) return token();
          writeSession(result);
          return result.token;
        } catch (error) {
          if ([400, 401, 403].includes(error.status) && token() === current.token) saveSession('');
          throw error;
        } finally { refreshing = null; }
      })();
    }
    return refreshing;
  }
  async function request(path, options = {}) {
    const isAuthStart = /^\/api\/auth\/(login|register|recover|refresh)$/.test(path);
    let accessToken = options.token ?? (isAuthStart ? '' : token());
    const current = stored();
    if (emailMode && accessToken && accessToken === current?.token && current.refreshToken && current.expiresAt <= Date.now() + 30000) {
      accessToken = await refresh();
    }
    try { return await send(path, { ...options, token: accessToken }); }
    catch (error) {
      if (error.status === 401 && accessToken && token() === accessToken) {
        if (emailMode && stored()?.refreshToken && !isAuthStart) {
          const renewed = await refresh();
          try { return await send(path, { ...options, token: renewed }); }
          catch (retryError) {
            if (retryError.status === 401 && token() === renewed) saveSession('');
            throw retryError;
          }
        }
        saveSession('');
      }
      throw error;
    }
  }
  function consumeRedirect(location, history) {
    if (!emailMode) return null;
    const params = new URLSearchParams(location.hash.slice(1));
    if (!params.has('access_token') && !params.has('error') && !params.has('error_description')) return null;
    history.replaceState(null, '', location.pathname + location.search);
    if (params.has('error') || params.has('error_description')) {
      throw new Error(params.get('error_description') || 'The email link expired. Request a new confirmation or password-reset email.');
    }
    const accessToken = params.get('access_token'), refreshToken = params.get('refresh_token');
    const expires = Number(params.get('expires_in'));
    if (!accessToken || !refreshToken || !Number.isFinite(expires) || expires <= 0) throw new Error('The email login link was incomplete. Please log in or request another link.');
    saveSession({ token: accessToken, refreshToken, expiresAt: Date.now() + expires * 1000 });
    return params.get('type') === 'recovery' ? 'recovery' : 'confirmed';
  }
  return { request, token, saveSession, consumeRedirect, identityVersion: () => identityVersion };
}

let client;
function currentClient() {
  client ||= createCommunityClient({ endpoint: COMMUNITY_API, provider: COMMUNITY_PROVIDER, storage: sessionStorage });
  return client;
}
export const sessionToken = () => currentClient().token();
export const sessionVersion = () => currentClient().identityVersion();
export const storeSession = value => currentClient().saveSession(value);
export const communityRequest = (path, options) => currentClient().request(path, options);
export const acceptEmailRedirect = () => currentClient().consumeRedirect(location, history);
