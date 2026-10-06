import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createCommunityServer } from '../server/community.mjs';
import { createSupabaseHandler } from '../server/supabase-api.js';
import { readyDraft } from './workshop-fixture.mjs';

const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role;');
await db.exec(await readFile(new URL('../supabase/migrations/20261005120000_community.sql', import.meta.url), 'utf8'));
const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
const project = 'https://project.supabase.co/functions/v1/community';
const authorId = '11111111-1111-4111-8111-111111111111', adminId = '33333333-3333-4333-8333-333333333333';
let confirmed = false, reset = false, refreshes = 0, checks = 0;
const check = (name, value) => { assert.ok(value, name); checks++; console.log(`PASS ${name}`); };
const handler = createSupabaseHandler({ url: 'https://project.supabase.co', anonKey: 'public-test-key', serviceKey: 'server-only-test-key',
  origins: [base], siteUrl: `${base}/workshop.html`, fetchImpl: async (url, options) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : null;
    if (path.startsWith('/rest/')) {
      const params = Object.keys(body);
      try {
        const result = await db.query(`select public.${path.split('/').at(-1)}(${params.map((key, i) => `${key}=>$${i + 1}`).join(',')}) as result`,
          Object.values(body).map(v => v && typeof v === 'object' ? JSON.stringify(v) : v));
        return Response.json(result.rows[0].result);
      } catch (e) { return Response.json({ code: e.code, message: e.message }, { status: 400 }); }
    }
    if (path.endsWith('/signup')) return Response.json({ user: { id: authorId } });
    if (path.endsWith('/token')) {
      const isRefresh = new URL(url).search.includes('refresh_token');
      if (isRefresh && body.refresh_token === 'unavailable-refresh') return Response.json({ msg: 'Authentication temporarily unavailable' }, { status: 503 });
      const admin = body.email === 'owner@example.test';
      if (!confirmed && !admin) return Response.json({ msg: 'Email not confirmed' }, { status: 400 });
      if (isRefresh) refreshes++;
      return Response.json({ access_token: admin ? 'admin-token' : 'author-token', refresh_token: admin ? 'admin-refresh' : 'author-refresh', expires_in: 3600 });
    }
    if (path.endsWith('/recover') || path.endsWith('/logout')) return Response.json({});
    if (path.endsWith('/user')) {
      if (options.method === 'PUT') { reset = true; return Response.json({}); }
      const admin = options.headers.Authorization === 'Bearer admin-token';
      return Response.json({ id: admin ? adminId : authorId, email: admin ? 'owner@example.test' : 'writer@example.test',
        user_metadata: { name: admin ? 'Owner' : 'Hosted creator', role: 'admin' } });
    }
    throw new Error(`Unexpected upstream ${url}`);
  },
});
const browser = await chromium.launch();
const errors = [];
async function makePage(savedSession) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  if (savedSession) await page.addInitScript(value => sessionStorage.setItem('gg-community-session-v1', value), savedSession);
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route('**/js/community-config.js*', route => route.fulfill({ contentType: 'text/javascript',
    body: `export const COMMUNITY_API=${JSON.stringify(project)}; export const COMMUNITY_PROVIDER='supabase';` }));
  await page.route(`${project}/**`, async route => {
    const req = route.request();
    const headers = await req.allHeaders();
    const response = await handler(new Request(req.url(), { method: req.method(), headers,
      ...(req.postData() ? { body: req.postData() } : {}) }));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() });
  });
  return page;
}
async function click(page, name) {
  await page.locator(`[data-action="${name}"]`).first().click();
  await page.waitForFunction(() => !document.querySelector('[data-action]:disabled'));
}
try {
  const author = await makePage();
  const brokenLogin = await makePage('{broken');
  await brokenLogin.goto(base + '/workshop.html');
  await brokenLogin.waitForFunction(() => document.querySelector('#workshop-error').textContent.includes('damaged and has been cleared'));
  for (const action of ['create', 'next', 'next', 'make-draft']) await click(brokenLogin, action);
  check('a damaged login is reported and cannot disable private story creation', await brokenLogin.locator('#w-story-title').count() === 1);
  const outage = await makePage(JSON.stringify({ token: 'expired-token', refreshToken: 'unavailable-refresh', expiresAt: 0 }));
  await outage.goto(base + '/workshop.html');
  await outage.waitForFunction(() => document.querySelector('#workshop-error').textContent.includes('Authentication temporarily unavailable'));
  await click(outage, 'community');
  check('public catalog browsing survives an expired login and an Auth outage', await outage.locator('#workshop-error').innerText() === '' && await outage.evaluate(() => !!sessionStorage.getItem('gg-community-session-v1')));
  await brokenLogin.close(); await outage.close();
  await author.goto(base + '/workshop.html'); await click(author, 'account');
  check('Supabase configuration presents email accounts, not legacy usernames', await author.locator('label[for="username"]').innerText() === 'Email address');
  await author.fill('#username', 'writer@example.test'); await author.fill('#password', 'test-only-password-123!');
  await author.fill('#author-name', 'Hosted creator'); await click(author, 'register');
  check('registration without a session explicitly waits for email confirmation', (await author.innerText('#workshop-message')).includes('Check your email') && await author.evaluate(() => sessionStorage.getItem('gg-community-session-v1')) === null);
  await author.fill('#username', 'writer@example.test'); await author.fill('#password', 'test-only-password-123!');
  await click(author, 'login');
  check('unconfirmed login does not pretend to succeed', (await author.innerText('#workshop-error')).includes('not confirmed'));
  confirmed = true;
  await author.fill('#username', 'writer@example.test'); await author.fill('#password', 'test-only-password-123!');
  await click(author, 'login');
  check('metadata cannot promote a creator to administrator', !(await author.innerText('#workshop')).includes('Approve stories'));
  await click(author, 'home'); await click(author, 'create'); await click(author, 'next'); await click(author, 'next'); await click(author, 'make-draft');
  await author.locator('summary').filter({ hasText: 'AI help or import' }).click();
  await author.fill('#draft-json', JSON.stringify(readyDraft().story)); await click(author, 'apply-json');
  for (const key of ['evidence', 'pacing', 'solution', 'content']) await author.locator(`[data-review="${key}"]`).check();
  await author.check('#publish-consent'); await click(author, 'submit');
  check('hosted submission uses validated saved snapshots and remains pending', (await author.innerText('#workshop-message')).includes('not public'));
  await author.evaluate(() => {
    const key = 'gg-community-session-v1', session = JSON.parse(sessionStorage.getItem(key));
    session.expiresAt = 0; sessionStorage.setItem(key, JSON.stringify(session));
  });
  await click(author, 'account');
  check('expired session refreshes without losing account drafts', refreshes === 1 && await author.locator('[data-action="cloud-open"]').count() === 1);
  await db.query("insert into public.gg_profiles(id,email,name,role) values($1,'owner@example.test','Owner','admin')", [adminId]);
  const admin = await makePage(); await admin.goto(base);
  await admin.getByRole('link', { name: 'My account', exact: true }).click();
  await admin.waitForSelector('#username');
  check('neutral account link opens the website login directly', admin.url().endsWith('workshop.html?account=1'));
  await admin.fill('#username', 'owner@example.test'); await admin.fill('#password', 'test-only-password-123!');
  await click(admin, 'login'); await click(admin, 'admin'); await click(admin, 'admin-preview');
  await admin.check('#admin-reviewed'); await click(admin, 'approve');
  await click(author, 'community');
  check('admin approval publishes to the hosted catalog', await author.locator('[data-action="community-save"]').count() === 1);
  await click(author, 'community-save');
  await author.goto(base); await author.click('#btn-new');
  for (const name of ['One', 'Two', 'Three', 'Four']) { await author.fill('#guest-name', name); await author.click('#add-guest'); }
  await author.click('[data-act="load-community"]'); await author.waitForSelector('[data-act="use-community"]'); await author.click('[data-act="use-community"]');
  await author.waitForSelector('#open-lobby');
  check('Supabase-approved story enters the normal playable game', await author.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).story.provenance.kind === 'community'));
  const recovery = await makePage();
  await recovery.goto(base + '/workshop.html#access_token=author-token&refresh_token=author-refresh&expires_in=3600&type=recovery');
  await recovery.waitForSelector('#new-password');
  check('email recovery removes tokens from the address and opens password reset', !recovery.url().includes('access_token=') && await recovery.locator('#new-password').isVisible());
  await recovery.fill('#new-password', 'new-test-password-123!'); await click(recovery, 'change-password');
  check('new password is handled by Auth, never saved in the story database', reset && (await recovery.innerText('#workshop-message')).includes('Password updated'));
  await click(recovery, 'logout'); await recovery.fill('#username', 'writer@example.test'); await click(recovery, 'recover');
  check('password recovery explains delivery without exposing account existence', (await recovery.innerText('#workshop-message')).includes('If this address'));
  check('hosted workflow produces no JavaScript exceptions', errors.length === 0);
  console.log(`${checks}/${checks} Supabase browser checks passed (local PostgreSQL and simulated Auth transport; no real project or email).`);
} finally {
  await browser.close(); server.close(); await once(server, 'close'); await db.close();
}
