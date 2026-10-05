import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { createSupabaseHandler } from '../server/supabase-api.js';
import { createCommunityClient } from '../js/community-api.js';
import { readyDraft } from './workshop-fixture.mjs';
import { configureSupabase } from '../tools/configure-supabase.mjs';

test('deployment activation never connects an unhealthy endpoint or commits credentials', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'grim-supabase-config-'));
  const file = path.join(folder, 'community-config.js');
  const original = "export const COMMUNITY_API = '';\nexport const COMMUNITY_PROVIDER = 'node';\n";
  const previousFetch = globalThis.fetch;
  try {
    await writeFile(file, original);
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ error: 'migration missing' }, { status: 503 }); };
    await assert.rejects(configureSupabase('bad-or-secret', file), /project reference/);
    assert.equal(calls, 0);
    const ref = 'abcdefghijklmnopqrst';
    await assert.rejects(configureSupabase(ref, file), /health check failed/);
    assert.equal(await readFile(file, 'utf8'), original);
    globalThis.fetch = async () => Response.json({ available: true, authMode: 'username' });
    await assert.rejects(configureSupabase(ref, file), /email-auth backend/);
    assert.equal(await readFile(file, 'utf8'), original);
    globalThis.fetch = async url => {
      assert.equal(url, `https://${ref}.supabase.co/functions/v1/community/api/health`);
      return Response.json({ available: true, authMode: 'email' });
    };
    await configureSupabase(ref, file);
    const configured = await readFile(file, 'utf8');
    assert.match(configured, /COMMUNITY_PROVIDER = 'supabase'/);
    assert.match(configured, /functions\/v1\/community/);
    assert.doesNotMatch(configured, /service.?role|password|token/i);
  } finally { globalThis.fetch = previousFetch; await rm(folder, { recursive: true }); }
});

const ids = { author: '11111111-1111-4111-8111-111111111111', other: '22222222-2222-4222-8222-222222222222', admin: '33333333-3333-4333-8333-333333333333' };
async function database() {
  const db = new PGlite();
  await db.exec('create role anon; create role authenticated; create role service_role;');
  await db.exec(await readFile(new URL('../supabase/migrations/20261005120000_community.sql', import.meta.url), 'utf8'));
  return db;
}
async function call(db, name, params) {
  const keys = Object.keys(params);
  const result = await db.query(`select public.${name}(${keys.map((key, i) => `${key} => $${i + 1}`).join(',')}) as result`,
    Object.values(params).map(v => v && typeof v === 'object' ? JSON.stringify(v) : v));
  return result.rows[0].result;
}

test('real PostgreSQL schema isolates browser roles and preserves atomic drafts, submissions and approvals', async () => {
  const db = await database();
  try {
    for (const [name, id] of Object.entries(ids)) await call(db, 'gg_profile', { p_user: id, p_email: `${name}@example.test`, p_name: name });
    await db.exec('create schema auth; create table auth.users(id uuid,email text,raw_user_meta_data jsonb,email_confirmed_at timestamptz);');
    await db.query("insert into auth.users values($1,'admin@example.test','{}',null)", [ids.admin]);
    const adminSQL = (await readFile(new URL('../supabase/promote-admin.sql', import.meta.url), 'utf8'))
      .replace("owner_email text := 'REPLACE_WITH_YOUR_EMAIL'", "owner_email text := 'admin@example.test'");
    await assert.rejects(db.exec(adminSQL), /verify this game account/);
    await db.exec("update auth.users set email_confirmed_at=now();");
    await db.exec(adminSQL);
    assert.equal((await call(db, 'gg_profile', { p_user: ids.admin, p_email: 'admin@example.test', p_name: 'Owner' })).role, 'admin');
    await db.exec('set role service_role;');
    assert.equal((await call(db, 'gg_catalog', { p_id: null })).stories.length, 0);
    await db.exec('reset role;');
    for (const role of ['anon', 'authenticated']) {
      assert.equal((await db.query("select has_table_privilege($1,'public.gg_drafts','SELECT') as allowed", [role])).rows[0].allowed, false);
      assert.equal((await db.query("select has_function_privilege($1,'public.gg_save_draft(uuid,uuid,jsonb,integer)','EXECUTE') as allowed", [role])).rows[0].allowed, false);
      await db.exec(`set role ${role};`);
      await assert.rejects(db.query('select * from public.gg_submissions'), /permission denied/);
      await assert.rejects(db.query('select public.gg_catalog(null)'), /permission denied/);
      await db.exec('reset role;');
    }
    assert.equal((await db.query("select relrowsecurity from pg_class where relname='gg_drafts'")).rows[0].relrowsecurity, true);
    const content = readyDraft();
    const saved = await call(db, 'gg_save_draft', { p_user: ids.author, p_id: null, p_content: content, p_expected: null });
    await assert.rejects(call(db, 'gg_read_drafts', { p_user: ids.other, p_id: saved.id }), /not found/);
    await assert.rejects(call(db, 'gg_save_draft', { p_user: ids.author, p_id: saved.id, p_content: content, p_expected: 0 }), /another device/);
    const submitted = await call(db, 'gg_submit', { p_user: ids.author, p_id: saved.id, p_revision: 1, p_story: content.story, p_consent: true });
    assert.equal((await call(db, 'gg_catalog', { p_id: null })).stories.length, 0);
    await assert.rejects(call(db, 'gg_moderate', { p_user: ids.author, p_id: submitted.id, p_decision: 'approved', p_note: '', p_reviewed: true }), /administrator/);
    await assert.rejects(call(db, 'gg_moderate', { p_user: ids.admin, p_id: submitted.id, p_decision: 'approved', p_note: '', p_reviewed: false }), /confirm your review/);
    await call(db, 'gg_moderate', { p_user: ids.admin, p_id: submitted.id, p_decision: 'approved', p_note: '', p_reviewed: true });
    const published = await call(db, 'gg_catalog', { p_id: submitted.id });
    assert.equal(published.story.provenance.kind, 'community');
    content.story.title = 'Later revision';
    await call(db, 'gg_save_draft', { p_user: ids.author, p_id: saved.id, p_content: content, p_expected: 1 });
    assert.notEqual((await call(db, 'gg_catalog', { p_id: submitted.id })).story.title, content.story.title);
    const next = await call(db, 'gg_submit', { p_user: ids.author, p_id: saved.id, p_revision: 2, p_story: content.story, p_consent: true });
    await call(db, 'gg_moderate', { p_user: ids.admin, p_id: next.id, p_decision: 'approved', p_note: '', p_reviewed: true });
    assert.equal((await call(db, 'gg_catalog', { p_id: null })).stories.length, 1);
    await assert.rejects(call(db, 'gg_catalog', { p_id: submitted.id }), /not published/);
    await call(db, 'gg_moderate', { p_user: ids.admin, p_id: next.id, p_decision: 'unpublished', p_note: 'Needs revision', p_reviewed: false });
    assert.equal((await call(db, 'gg_catalog', { p_id: null })).stories.length, 0);
    assert.equal((await call(db, 'gg_read_drafts', { p_user: ids.author, p_id: saved.id, p_versions: true })).versions.length, 2);
    assert.equal((await call(db, 'gg_read_submissions', { p_user: ids.admin, p_admin: true, p_id: next.id })).history.length, 2);
  } finally { await db.close(); }
});

test('Supabase Edge API verifies Auth, validates exact saved content, blocks author promotion and handles email flows', async () => {
  const db = await database();
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : null;
    if (path.startsWith('/rest/')) {
      assert.equal(options.headers.apikey, 'server-only-secret');
      try {
        const value = await call(db, path.split('/').at(-1), body);
        return Response.json(value);
      } catch (e) { return Response.json({ code: e.code, message: e.message }, { status: 400 }); }
    }
    assert.equal(options.headers.apikey, 'public-anon-key');
    if (path.endsWith('/signup')) {
      assert.deepEqual(body.data, { name: 'Creator' });
      return Response.json({ user: { id: ids.author } });
    }
    if (path.endsWith('/token')) return Response.json({ access_token: 'author-token', refresh_token: 'refresh-token', expires_in: 3600 });
    if (path.endsWith('/recover') || path.endsWith('/logout')) return Response.json({});
    if (path.endsWith('/user')) {
      const token = options.headers.Authorization;
      if (token !== 'Bearer author-token' && token !== 'Bearer admin-token') return Response.json({ msg: 'Invalid session' }, { status: 401 });
      if (options.method === 'PUT') return Response.json({});
      return Response.json({ id: token.endsWith('admin-token') ? ids.admin : ids.author, email: 'creator@example.test', user_metadata: { name: 'Creator', role: 'admin' } });
    }
    throw new Error(`Unexpected upstream ${url}`);
  };
  const handler = createSupabaseHandler({ url: 'https://project.supabase.co', anonKey: 'public-anon-key',
    serviceKey: 'server-only-secret', origins: ['https://game.test'], siteUrl: 'https://game.test/workshop.html', fetchImpl });
  const request = async (path, { method = 'GET', body, token, origin = 'https://game.test', status = 200 } = {}) => {
    const res = await handler(new Request(`https://project.supabase.co/functions/v1/community${path}`, {
      method, headers: { Origin: origin, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }));
    assert.equal(res.status, status, `${path}: ${await res.clone().text()}`);
    return res.status === 204 ? null : res.json();
  };
  try {
    await request('/api/health', { origin: 'https://wrong.test', status: 403 });
    assert.equal((await request('/api/health')).authMode, 'email');
    await request('/api/auth/me', { status: 401 });
    const registration = await request('/api/auth/register', { method: 'POST', body: { username: 'creator@example.test', password: 'test-password-12345', name: 'Creator', role: 'admin' } });
    assert.equal(registration.confirmationRequired, true);
    const login = await request('/api/auth/login', { method: 'POST', body: { username: 'creator@example.test', password: 'test-password-12345' } });
    assert.equal(login.user.role, 'author', 'User metadata cannot grant admin');
    await request('/api/admin/submissions', { token: 'author-token', status: 403 });
    const content = readyDraft();
    const saved = await request('/api/drafts', { method: 'POST', token: 'author-token', body: { content } });
    content.review = {};
    await request(`/api/drafts/${saved.id}`, { method: 'PUT', token: 'author-token', body: { content, expectedRevision: 1 } });
    await request('/api/submissions', { method: 'POST', token: 'author-token', body: { draftId: saved.id, revision: 2, consent: true }, status: 400 });
    const submitted = await request('/api/submissions', { method: 'POST', token: 'author-token', body: { draftId: saved.id, revision: 1, consent: true } });
    await call(db, 'gg_profile', { p_user: ids.admin, p_email: 'owner@example.test', p_name: 'Owner' });
    await db.query("update public.gg_profiles set role='admin' where id=$1", [ids.admin]);
    await request(`/api/admin/submissions/${submitted.id}`, { method: 'POST', token: 'admin-token', body: { decision: 'approved', note: '', reviewed: true } });
    assert.equal((await request('/api/community')).stories.length, 1);
    assert.equal((await request(`/api/community/${submitted.id}`)).story.characters.every(c => !c.guest), true);
    const recovered = await request('/api/auth/recover', { method: 'POST', body: { username: 'creator@example.test' } });
    assert.match(recovered.message, /If this address/);
    await request('/api/auth/password', { method: 'POST', token: 'author-token', body: { password: 'a-new-test-password' } });
    await request('/api/auth/refresh', { method: 'POST', body: { refreshToken: 'refresh-token' } });
    const cors = await handler(new Request('https://project.supabase.co/functions/v1/community/api/health', { method: 'OPTIONS', headers: { Origin: 'https://game.test' } }));
    assert.equal(cors.headers.get('access-control-allow-origin'), 'https://game.test');
    assert.equal(requests.filter(r => r.url.includes('signup'))[0].url.includes('redirect_to='), true);
  } finally { await db.close(); }
});

const memoryStorage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};
test('browser sessions refresh once for parallel requests and strip email tokens from history', async () => {
  const storage = memoryStorage();
  let refreshes = 0;
  const client = createCommunityClient({ endpoint: 'https://project.supabase.co/functions/v1/community', provider: 'supabase', storage,
    fetchImpl: async (url, options) => {
      if (url.endsWith('/refresh')) { refreshes++; return Response.json({ token: 'new-token', refreshToken: 'new-refresh', expiresAt: Date.now() + 3600000 }); }
      assert.equal(options.headers.Authorization, 'Bearer new-token');
      return Response.json({ user: { name: 'Creator' } });
    },
  });
  client.saveSession({ token: 'expired', refreshToken: 'refresh', expiresAt: 0 });
  const identity = client.identityVersion();
  await Promise.all([client.request('/api/drafts'), client.request('/api/submissions')]);
  assert.equal(refreshes, 1);
  assert.equal(client.identityVersion(), identity, 'routine token refresh must not invalidate the pending startup identity lookup');
  let cleared;
  const redirected = client.consumeRedirect({ hash: '#access_token=confirmed&refresh_token=recovery&expires_in=3600&type=recovery', pathname: '/workshop.html', search: '' },
    { replaceState: (...args) => { cleared = args[2]; } });
  assert.equal(redirected, 'recovery'); assert.equal(cleared, '/workshop.html');
  assert.equal(client.token(), 'confirmed');
  assert.notEqual(client.identityVersion(), identity, 'a new email login must invalidate old startup identity lookups');
  assert.throws(() => client.consumeRedirect({ hash: '#error=expired&error_description=Expired', pathname: '/workshop.html', search: '' }, { replaceState() {} }), /Expired/);
  assert.throws(() => createCommunityClient({ endpoint: 'http://example.com', storage }), /HTTPS/);
});

test('failed refresh revokes only invalid sessions, not transient outages; legacy tokens still work', async () => {
  for (const status of [401, 503]) {
    const client = createCommunityClient({ endpoint: 'https://project.supabase.co/functions/v1/community', provider: 'supabase', storage: memoryStorage(),
      fetchImpl: async () => Response.json({ error: 'Refresh failed' }, { status }) });
    client.saveSession({ token: 'old', refreshToken: 'refresh', expiresAt: 0 });
    await assert.rejects(client.request('/api/drafts'), /Refresh failed/);
    assert.equal(!!client.token(), status === 503);
  }
  const storage = memoryStorage(); storage.setItem('gg-community-session-v1', 'legacy-token');
  const client = createCommunityClient({ storage, fetchImpl: async (_, options) => { assert.equal(options.headers.Authorization, 'Bearer legacy-token'); return Response.json({ ok: true }); } });
  assert.equal((await client.request('/api/health')).ok, true);
});
