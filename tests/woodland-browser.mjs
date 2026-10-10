import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';
import { buildView } from '../js/story.js';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const live = process.argv[2];
const base = live || `http://127.0.0.1:${server.address().port}/`;
try {
  for (const engine of live ? [chromium] : [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      for (const production of live ? [false] : [false, true]) {
        const context = await browser.newContext();
        if (production) await context.route('**/js/site-policy.js*', async route => {
          const response = await route.fetch();
          await route.fulfill({ response, body: (await response.text()).replace('BUILD_RELEASE_ONLY = false', 'BUILD_RELEASE_ONLY = true') });
        });
        await context.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
        await context.addInitScript(() => {
          window.Peer = class {
            constructor() { this.open = true; this.handlers = {}; }
            on(event, callback) { this.handlers[event] = callback; if (event === 'open') setTimeout(() => callback('test-peer'), 0); }
            connect() {
              return {
                open: true, send() {}, close() {},
                on(event, callback) {
                  if (event === 'open') setTimeout(callback, 0);
                  if (event === 'data') window.deliverTestState = callback;
                },
              };
            }
            destroy() { this.destroyed = true; }
          };
        });
        const host = await context.newPage();
        const errors = [];
        host.on('pageerror', error => errors.push(error.message));
        await host.goto(base);
        await host.locator('#btn-new').click();
        assert.equal(await host.locator('#use-woodland').isDisabled(), true);
        for (let index = 0; index < 14; index++) {
          await host.locator('#guest-name').fill(`Guest ${index + 1}`);
          await host.locator('#add-guest').click();
        }
        assert.equal(await host.locator('#use-woodland').isDisabled(), false);
        await host.locator('#guest-name').fill('Guest 15');
        await host.locator('#add-guest').click();
        assert.equal(await host.locator('#use-woodland').isDisabled(), true);
        await host.locator('[data-act="remove-guest"]').last().click();
        await host.locator('#use-woodland').click();
        await host.locator('#open-lobby').waitFor();
        assert.equal(await host.locator('[data-assign-character]').count(), 14);
        await host.reload();
        await host.locator('#open-lobby').click();
        await host.locator('#start-game').click();
        const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
        if (production) await phoneContext.route('**/js/site-policy.js*', async route => {
          const response = await route.fetch();
          await route.fulfill({ response, body: (await response.text()).replace('BUILD_RELEASE_ONLY = false', 'BUILD_RELEASE_ONLY = true') });
        });
        await phoneContext.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
        await phoneContext.addInitScript(() => {
          window.Peer = class {
            constructor() { this.open = true; }
            on(event, callback) { if (event === 'open') setTimeout(callback, 0); }
            connect() { return { open: true, send() {}, close() {}, on(event, callback) {
              if (event === 'open') setTimeout(callback, 0);
              if (event === 'data') window.deliverTestState = callback;
            } }; }
            destroy() { this.destroyed = true; }
          };
        });
        const phone = await phoneContext.newPage();
        phone.on('pageerror', error => errors.push(error.message));
        await phone.goto(base + '?room=WOODS');
        await phone.waitForFunction(() => typeof window.deliverTestState === 'function');
        for (let ri = 0; ri < 6; ri++) {
          for (let ci = 0; ci < 14; ci++) {
            const state = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
            const id = state.story.rounds[ri].chain[ci];
            await phone.evaluate(view => window.deliverTestState({ t: 'state', view }), buildView(state, id));
            await phone.locator('#my-clues .read-aloud-clue').waitFor();
            assert.match(await phone.locator('#current-reader').innerText(), /You are next/);
            const ghost = state.story.characters.find(c => c.id === id).ghost;
            if (ghost && ri + 1 >= ghost.fromRound) assert.match(await phone.locator('#my-clues').innerText(), /Your ghost memory/);
            assert.equal(await phone.locator('#vote-strip').isVisible(), false);
            await host.locator('#next-reader').click();
          }
          await host.locator('#next-round').click();
          assert.equal(await host.locator('#open-vote').count(), 0);
          if (ri === 2) {
            await host.reload();
            await host.locator('#next-round').waitFor();
            const saved = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
            assert.equal(saved.phase, 'deliberation');
            assert.equal(saved.story.characters.filter(c => c.ghost && c.ghost.fromRound <= 3).length, 2);
          }
          await host.locator(ri === 5 ? '#reveal-btn' : '#next-round').click();
        }
        assert.equal(await host.locator('#killer-name').innerText(), 'Keziah, Joan, Rebekah');
        const finalState = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
        await phone.evaluate(view => window.deliverTestState({ t: 'state', view }), buildView(finalState, 'Josiah'));
        assert.equal(await phone.locator('#reveal-killer').innerText(), 'Keziah, Joan, Rebekah');
        await host.reload();
        await host.locator('#killer-name').waitFor();
        assert.deepEqual(errors, []);
        console.log(`PASS ${engine.name()} ${live || (production ? 'production' : 'testing')}: 14 seats, 84 phone readings, five ghost transitions, saved-room reload and three-killer ending`);
        await phoneContext.close();
        await context.close();
      }
    } finally { await browser.close(); }
  }
} finally { await new Promise(resolve => server.close(resolve)); }
