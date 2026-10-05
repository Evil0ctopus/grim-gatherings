import { COMMUNITY_API } from './community-config.js';

const KEY = 'gg-community-session-v1';
export function sessionToken() { return sessionStorage.getItem(KEY) || ''; }
export function storeSession(token) {
  if (token) sessionStorage.setItem(KEY, token);
  else sessionStorage.removeItem(KEY);
}

export async function communityRequest(path, { method = 'GET', body, token = sessionToken() } = {}) {
  let origin = '';
  if (COMMUNITY_API) {
    const endpoint = new URL(COMMUNITY_API);
    if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) {
      throw new Error('The community service must use HTTPS (except local development).');
    }
    if (endpoint.username || endpoint.password || endpoint.pathname !== '/' || endpoint.search || endpoint.hash) throw new Error('Configure a community service origin without credentials, a path or query.');
    origin = endpoint.origin;
  }
  const response = await fetch(`${origin}${path}`, {
    method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Shared stories are not connected yet. Private editing, downloads and saves still work. The site owner needs to deploy the community service.');
  }
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && token && sessionToken() === token) storeSession('');
    throw new Error(data.error || `Community service returned ${response.status}.`);
  }
  return data;
}
