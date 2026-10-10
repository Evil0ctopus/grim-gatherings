import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const live = process.argv.slice(2).find(argument => /^https?:/.test(argument));
const base = live || `http://127.0.0.1:${server.address().port}/`;
const games = [
  ['#use-lockdown', 3], ['#use-lago', 3], ['#use-sample', 3],
  ['#use-blackwater', 3], ['#use-briar', 3], ['#use-woodland', 14],
];
try {
  for (const engine of live ? [chromium] : process.argv.includes('--webkit-only') ? [webkit] : [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      for (const production of live ? [false] : process.argv.includes('--production-only') ? [true] : [false, true]) {
        const selections = production || live?.includes('grimgatherings.com')
          ? games : [...games, ['[data-id="mercy-hollow-5"]', 5], ['[data-id="blackthorn-farm-5"]', 5]];
        for (const [selector, count] of selections) {
          const hostContext = await browser.newContext({ reducedMotion: 'reduce' });
          const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
          for (const context of [hostContext, phoneContext]) {
            await context.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
            if (production) await context.route('**/js/site-policy.js*', async route => {
              const response = await route.fetch();
              await route.fulfill({ response, body: (await response.text()).replace('BUILD_RELEASE_ONLY = false', 'BUILD_RELEASE_ONLY = true') });
            });
          }
          const host = await hostContext.newPage(), phone = await phoneContext.newPage();
          const errors = [];
          for (const page of [host, phone]) page.on('pageerror', error => errors.push(error.message));
          await host.exposeFunction('sendToPhone', message => phone.evaluate(msg => window.receivePhoneMessage(msg), message));
          await phone.exposeFunction('connectToHost', () => host.evaluate(() => window.connectTestPhone()));
          await phone.exposeFunction('sendToHost', message => host.evaluate(msg => window.receiveHostMessage(msg), message));
          await host.addInitScript(() => {
            window.Peer = class {
              constructor() { this.open = true; }
              on(event, callback) {
                if (event === 'open') setTimeout(callback, 0);
                if (event === 'connection') window.acceptTestConnection = callback;
              }
              destroy() { this.destroyed = true; }
            };
            window.connectTestPhone = () => {
              const handlers = {};
              window.acceptTestConnection({
                open: true, on(event, callback) { handlers[event] = callback; },
                send(message) { window.sendToPhone(message); }, close() {},
              });
              window.receiveHostMessage = message => handlers.data(message);
            };
            window.testGuests = new Map();
            window.addTestGuest = id => {
              const handlers = {};
              window.acceptTestConnection({ open: true, on(event, callback) { handlers[event] = callback; }, send() {}, close() {} });
              handlers.data({ t: 'hello', token: `test-${id}`, charId: null });
              handlers.data({ t: 'claim', charId: id });
              window.testGuests.set(id, handlers.data);
            };
          });
          await phone.addInitScript(() => {
            window.Peer = class {
              constructor() { this.open = true; }
              on(event, callback) { if (event === 'open') setTimeout(callback, 0); }
              connect() {
                return {
                  open: true, on(event, callback) {
                    if (event === 'data') window.receivePhoneMessage = callback;
                    if (event === 'open') setTimeout(async () => { await window.connectToHost(); callback(); }, 0);
                  },
                  send(message) { window.sendToHost(message); }, close() {},
                };
              }
              destroy() { this.destroyed = true; }
            };
          });
          await host.goto(base);
          await host.locator('#btn-new').click();
          for (let index = 0; index < count; index++) {
            await host.locator('#guest-name').fill(`Guest ${index + 1}`);
            await host.locator('#add-guest').click();
          }
          await host.locator(selector).click();
          await host.locator('#open-lobby').waitFor();
          await host.reload();
          await host.locator('#open-lobby').click();
          await host.waitForFunction(() => typeof window.acceptTestConnection === 'function');
          const state = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
          const id = selector === '#use-woodland' ? 'Ezekiel' : state.story.characters[0].id;
          await phone.goto(`${base}?room=${state.room}`);
          await phone.locator(`[data-claim="${id}"]`).click();
          await phone.locator('#packet-name').waitFor();
          const others = state.story.characters.filter(character => character.id !== id).map(character => character.id);
          await host.evaluate(ids => ids.forEach(window.addTestGuest), others);
          await host.locator('#start-game').click();
          for (let ri = 0; ri < state.story.rounds.length; ri++) {
            for (const reader of state.story.rounds[ri].chain) {
              if (reader === id) {
                await phone.locator('#my-clues .read-aloud-clue').waitFor();
                if (id === 'Ezekiel' && ri >= 1) assert.match(await phone.locator('#my-clues').innerText(), /Your ghost memory/);
              }
              await host.locator('#next-reader').click();
            }
            await host.locator('#next-round').click();
            if (selector !== '#use-woodland') {
              await host.locator('#open-vote').click();
              await phone.locator('[data-vote]').first().click();
              await phone.waitForFunction(() => document.querySelector('#my-vote')?.textContent.includes('Your vote is in'));
              await host.evaluate(({ ids, roundIndex, target }) => {
                for (const guest of ids) window.testGuests.get(guest)({ t: 'vote', roundIndex, suspect: target });
              }, { ids: others, roundIndex: ri, target: id });
              await host.waitForFunction(n => document.querySelector('#votes-in')?.textContent.includes(`${n} votes`), count);
            } else {
              await phone.waitForFunction(() => document.querySelector('#phase-card')?.textContent.includes('ghosts included'));
              assert.equal(await phone.locator('#vote-strip').isVisible(), false);
            }
            await host.locator(ri === state.story.rounds.length - 1 ? '#reveal-btn' : '#next-round').click();
          }
          await phone.locator('#reveal-killer').waitFor();
          assert.equal(await phone.locator('#reveal-killer').innerText(), await host.locator('#killer-name').innerText());
          await phone.evaluate(() => window.dispatchEvent(new Event('pagehide')));
          await host.reload();
          await host.locator('#killer-name').waitFor();
          await phone.locator('#reconnect-game').click();
          await phone.waitForFunction(() => document.querySelector('#pstatus')?.textContent === 'connected');
          await phone.locator('#reveal-killer').waitFor();
          assert.deepEqual(errors, []);
          console.log(`PASS ${engine.name()} ${live || (production ? 'production' : 'testing')} ${state.story.edition.family}: join, claim, every round, phone votes/discussion, reveal, restored host and phone`);
          await phoneContext.close();
          await hostContext.close();
        }
      }
    } finally { await browser.close(); }
  }
} finally { await new Promise(resolve => server.close(resolve)); }
