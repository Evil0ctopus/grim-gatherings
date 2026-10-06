import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createCommunityServer } from '../server/community.mjs';
import { readyDraft } from './workshop-fixture.mjs';

const liveBase = process.argv[2];
const server = liveBase ? null : await createCommunityServer({ database: ':memory:' });
if (server) { server.listen(0, '127.0.0.1'); await once(server, 'listening'); }
const base = liveBase || `http://127.0.0.1:${server.address().port}/`;
let checks = 0;
const check = (name, value) => { assert.ok(value, name); checks++; console.log(`PASS ${name}`); };
try {
  for (const [name, engine] of [['Chromium', chromium], ['iPhone WebKit', webkit]]) {
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push({ message: e.message, stack: e.stack }));
      await page.addInitScript(() => {
        window.testPeers = [];
        window.Peer = class {
          constructor() { this.destroyed = false; window.testPeers.push(this); }
          on() {}
          destroy() { this.destroyed = true; }
        };
      });
      await page.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      // Isolate host history from analytics unload requests and beacon integrity checks.
      await page.route('**/*', async route => {
        if (route.request().resourceType() !== 'document') return route.fallback();
        const response = await route.fetch();
        const body = (await response.text()).replace(/<script\b[^>]*src="https:\/\/static\.cloudflareinsights\.com\/[^"]*"[^>]*>[\s\S]*?<\/script>/g, '');
        await route.fulfill({ response, body });
      });
      const workshop = async () => {
        const health = liveBase ? page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/api/health')) : null;
        await page.goto(new URL('workshop.html', base).href);
        if (health) await (await health).finished();
      };
      const landing = () => page.locator('#btn-new').waitFor();
      const setup = () => page.locator('#guest-name').waitFor();
      await workshop();
      await page.goto(base);
      await landing();
      const startLength = await page.evaluate(() => history.length);
      await page.locator('#btn-new').click(); await setup();
      check(`${name}: Create adds one history entry`, await page.evaluate(() => history.length) === startLength + 1);
      await page.fill('#guest-name', 'Safari Guest'); await page.locator('#add-guest').click();
      const room = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).room);
      await page.goBack(); await landing();
      check(`${name}: Back stays on game home`, new URL(page.url()).pathname === new URL(base).pathname && !new URL(page.url()).hash);
      check(`${name}: Back preserves the setup`, await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).guests[0].name) === 'Safari Guest');
      await page.reload(); await landing();
      check(`${name}: Reload after Back is usable`, await page.locator('#btn-resume').count() === 1);
      await page.locator('#btn-resume').click(); await setup();
      check(`${name}: Resume restores room and guest`, await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).room) === room &&
        (await page.locator('#app').innerText()).includes('Safari Guest'));
      await page.goBack(); await landing(); await page.goForward(); await setup();
      check(`${name}: Forward restores setup`, page.url().endsWith('#host'));
      await workshop(); await page.goBack(); await setup();
      await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      check(`${name}: page restoration leaves setup interactive`, await page.locator('#add-guest').isEnabled());
      await page.goBack(); await landing();
      await page.locator('#btn-new').click(); await setup();
      check(`${name}: create works again after return`, await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).room) !== room);
      const story = readyDraft().story;
      await page.evaluate(story => {
        const state = JSON.parse(localStorage.getItem('gg-host-v1'));
        state.phase = 'lobby'; state.story = story;
        localStorage.setItem('gg-host-v1', JSON.stringify(state));
      }, story);
      await page.reload(); await page.locator('#host-connection-help').waitFor();
      check(`${name}: live room opens peer`, await page.evaluate(() => testPeers.some(p => !p.destroyed)));
      await page.goBack(); await landing();
      check(`${name}: Back closes live peer without deleting room`, await page.evaluate(() =>
        testPeers.every(p => p.destroyed) && JSON.parse(localStorage.getItem('gg-host-v1')).phase === 'lobby'));
      await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      check(`${name}: home restoration does not reopen hidden host`, await page.evaluate(() => testPeers.every(p => p.destroyed)));
      await page.goForward(); await page.locator('#host-connection-help').waitFor();
      check(`${name}: Forward reconnects saved live room`, await page.evaluate(() => testPeers.some(p => !p.destroyed)));
      assert.equal(errors.length, 0, `${name}: browser exceptions ${JSON.stringify(errors)}`);
      check(`${name}: no browser exceptions`, true);
    } finally { await browser.close(); }
  }
  console.log(`${checks} host navigation checks passed.`);
} finally { if (server) await new Promise(resolve => server.close(resolve)); }
