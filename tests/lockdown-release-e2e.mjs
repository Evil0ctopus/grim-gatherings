import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';
import { acceptDialogs } from './dialog-helper.mjs';

const liveBase = process.argv[2];
const server = liveBase ? null : await createCommunityServer({ database: ':memory:' });
if (server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
}
const base = liveBase || `http://127.0.0.1:${server.address().port}/`;
const liveRelease = new URL(base).hostname.endsWith('grimgatherings.com');
let checks = 0;
try {
  for (const [name, engine] of [['Chromium', chromium], ['mobile WebKit', webkit]]) {
    const browser = await engine.launch();
    try {
      for (const release of liveBase ? [liveRelease] : [false, true]) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
        await acceptDialogs(context);
        if (!liveBase && release) await context.route('**/js/site-policy.js*', async route => {
          const response = await route.fetch();
          await route.fulfill({ response, body: (await response.text()).replace('BUILD_RELEASE_ONLY = false', 'BUILD_RELEASE_ONLY = true') });
        });
        await context.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
        await context.addInitScript(() => {
          window.testConnections = {};
          window.testViews = {};
          window.Peer = class {
            constructor() { this.handlers = {}; this.open = true; this.destroyed = false; this.disconnected = false; window.testHostPeer = this; }
            on(event, handler) {
              this.handlers[event] = handler;
              if (event === 'open') setTimeout(() => handler('test-host'), 0);
            }
            destroy() { this.destroyed = true; }
            connect() {
              const handlers = {};
              window.deliverView = view => handlers.data?.({ t: 'state', view });
              return {
                open: true,
                on(event, handler) {
                  handlers[event] = handler;
                  if (event === 'open') setTimeout(handler, 0);
                },
                send() {},
                close() {},
              };
            }
          };
          window.testClaim = id => {
            const handlers = {};
            const connection = {
              open: true,
              on(event, handler) { handlers[event] = handler; },
              send(message) { if (message.t === 'state') window.testViews[id] = message.view; },
              close() {},
            };
            window.testHostPeer.handlers.connection(connection);
            handlers.data({ t: 'hello', token: `test-${id}` });
            handlers.data({ t: 'claim', token: `test-${id}`, charId: id });
            window.testConnections[id] = handlers;
          };
          window.testVote = (id, suspect, ri) => window.testConnections[id].data({ t: 'vote', suspect, roundIndex: ri });
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base);
        await page.locator('#btn-new').waitFor();
        assert.equal(await page.locator('a[href="mafia.html"]').count(), release ? 0 : 1);
        assert.equal(await page.locator('a[href="shop.html"]').count(), release ? 0 : 1);
        for (let count = 3; count <= 12; count++) {
          await page.evaluate(() => localStorage.removeItem('gg-host-v1'));
          await page.goto(base);
          await page.locator('#btn-new').click();
          for (let i = 0; i < count; i++) {
            await page.locator('#guest-name').fill(`Player ${i + 1}`);
            await page.locator('#add-guest').click();
          }
          assert.equal(await page.locator('[data-act="use-starter"]').count(), release ? 0 : 4);
          assert.equal(await page.locator('#use-sample').count(), release ? 0 : 1);
          await page.locator('#use-lockdown').click();
          await page.locator('#open-lobby').waitFor();
          assert.match(await page.locator('#selected-edition').textContent(), new RegExp(`${count}-player`));
          await page.locator('#open-lobby').click();
          await page.locator('#start-game').waitFor();
          const ids = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).story.characters.map(c => c.id));
          await page.evaluate(ids => ids.forEach(id => window.testClaim(id)), ids);
          await page.locator('#conn-count').filter({ hasText: `${count}/${count} here` }).waitFor();
          await page.locator('#start-game').scrollIntoViewIfNeeded();
          await page.locator('#start-game').click();
          for (let ri = 0; ri < 7; ri++) {
            for (let ci = 0; ci < count; ci++) {
              const state = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
              assert.equal(state.roundIndex, ri);
              assert.equal(state.chainIndex, ci);
              const reader = state.story.rounds[ri].chain[ci];
              const view = await page.evaluate(id => window.testViews[id], reader);
              assert.equal(view.packet.rounds.length, ri + 1);
              assert.equal(view.packet.rounds[ri].readAloud.text, state.story.characters.find(c => c.id === reader).rounds[ri].readAloud.text);
              assert.ok(!view.reveal);
              if (count === 8 && ri === 0 && ci === 0) {
                const guest = await context.newPage();
                await guest.goto(new URL('?room=TEST', base).href);
                await guest.waitForFunction(() => typeof window.deliverView === 'function');
                await guest.evaluate(view => window.deliverView(view), view);
                await guest.locator('#my-clues .read-aloud-clue').waitFor();
                assert.match(await guest.locator('#my-clues').textContent(), /Evidence against/);
                assert.ok((await guest.locator('#pbody').innerText()).includes(view.packet.rounds[0].readAloud.text));
                assert.ok((await guest.locator('#pbody').innerText()).includes('unfinished playtest'));
                await guest.close();
              }
              await page.locator('#next-reader').click();
            }
            if (count === 12 && ri === 3) {
              await page.reload();
              await page.locator('#next-round').waitFor();
              const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
              assert.equal(saved.roundIndex, 3);
              assert.equal(saved.chainIndex, 12);
              await page.evaluate(ids => ids.forEach(id => window.testClaim(id)), ids);
            }
            await page.locator('#next-round').click();
            await page.locator('#open-vote').click();
            await page.evaluate(({ ids, ri }) => ids.forEach(id => window.testVote(id, id === 'derek' ? 'mason' : 'derek', ri)), { ids, ri });
            const votes = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).votes);
            assert.equal(Object.keys(votes).length, count);
            await page.locator(ri === 6 ? '#reveal-btn' : '#next-round').click();
          }
          await page.locator('#killer-name').waitFor();
          assert.equal(await page.locator('#killer-name').textContent(), 'Officer Derek Hayes');
          const text = await page.locator('#app').innerText();
          assert.ok(!text.includes('Author calls needed:'));
          checks++;
        }
        assert.deepEqual(errors, []);
        console.log(`PASS ${name}: ${release ? 'LOCKDOWN-only release' : 'development catalog'}; all ten full games and 12-player reload`);
        await context.close();
      }
    } finally { await browser.close(); }
  }
} finally {
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
console.log(`${checks} complete seven-round LOCKDOWN games verified.`);
