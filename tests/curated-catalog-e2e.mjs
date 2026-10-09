import assert from 'node:assert/strict';
import { acceptDialogs } from './dialog-helper.mjs';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';
import { buildView } from '../js/story.js';
import blackwater from '../js/editions/blackwater-row.js';

const server = await createCommunityServer({ database: ':memory:', adminUsername: 'catalog-owner', adminPassword: 'test-only-password-123!' });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}/`;
let checks = 0;
const check = (label, value) => { assert.ok(value, label); checks++; console.log(`PASS ${label}`); };
const retiredControls = '[data-act="tab"], [data-act="save-story"], [data-act="load-json"], [data-act="gen-ai"], [data-act="use-saved"], [data-act="load-community"], [data-path], #json-file, #raw-json';

async function castTestBallots(host) {
  await host.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('gg-host-v1'));
    const ballots = Object.fromEntries(state.story.characters.map(character => [
      character.id,
      state.story.characters.find(target => target.id !== character.id).id,
    ]));
    state.roundVotes[state.roundIndex] = ballots;
    state.votes = ballots;
    localStorage.setItem('gg-host-v1', JSON.stringify(state));
  });
  await host.reload();
  await host.locator('#tally').waitFor();
}

try {
  for (const [name, engine] of [['Chromium', chromium], ['mobile WebKit', webkit]]) {
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const errors = [], requests = [];
      await acceptDialogs(context);
      context.on('page', page => {
        page.on('pageerror', error => errors.push(error.message));
      });
      context.on('request', request => requests.push(request.url()));
      await context.route('**/js/community-config.js*', route => route.fulfill({
        contentType: 'text/javascript', body: "export const COMMUNITY_API='';export const COMMUNITY_PROVIDER='node';",
      }));
      await context.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      await context.addInitScript(() => {
        window.Peer = class {
          constructor() { this.handlers = {}; setTimeout(() => this.handlers.open?.(), 10); }
          on(event, callback) { this.handlers[event] = callback; }
          destroy() { this.destroyed = true; }
          connect() {
            const handlers = {};
            const connection = {
              open: true, on(event, callback) { handlers[event] = callback; },
              send(message) {
                if (message.t === 'hello' && window.testView) setTimeout(() => handlers.data?.({ t: 'state', view: window.testView }), 10);
              },
              close() { this.open = false; },
            };
            window.deliverView = view => { window.testView = view; handlers.data?.({ t: 'state', view }); };
            setTimeout(() => handlers.open?.(), 10);
            return connection;
          }
        };
      });
      const host = await context.newPage();
      await host.goto(base);
      await host.locator('#btn-new').waitFor();
      check(`${name}: homepage has no story builder`, await host.getByRole('link', { name: /Build a mystery/i }).count() === 0);
      await host.locator('nav.site-nav a[href="workshop.html?account=1"]').waitFor();
      check(`${name}: accounts, shop and Mafia links remain`, await host.locator('a[href="workshop.html?account=1"], a[href="shop.html"], a[href="mafia.html"]').count() >= 3);
      await host.click('#btn-new');
      for (const player of ['Avery', 'Blake', 'Casey', 'Drew']) {
        await host.fill('#guest-name', player); await host.click('#add-guest');
      }
      check(`${name}: no setup authoring controls`, await host.locator(retiredControls).count() === 0);
      check(`${name}: five current mysteries include four-player Blackwater`, await host.locator('#use-sample, [data-act="use-starter"]').count() === 5 &&
        (await host.locator('#app').innerText()).includes('Blackwater Row') &&
        await host.locator('[data-id="blackwater-row-4"]').isEnabled());
      await host.click('[data-id="blackwater-row-4"]');
      await host.locator('#open-lobby').waitFor();
      check(`${name}: Blackwater review has its fixed four-player cast`, await host.locator('[data-assign-character]').count() === 4 &&
        (await host.locator('#selected-edition').innerText()).includes('4-player fixed story') &&
        await host.locator(retiredControls).count() === 0);
      await host.click('[data-act="back-setup"]');
      await host.fill('#guest-name', 'Elliot'); await host.click('#add-guest');
      await host.click('[data-id="blackwater-row-4"]');
      check(`${name}: Blackwater rejects five players with an explicit count error`, await host.locator('#guest-name').count() === 1 &&
        (await host.locator('#app').innerText()).includes('written for exactly 4 players'));

      for (const selector of ['#use-sample', '[data-id="mercy-hollow-5"]', '[data-id="blackthorn-farm-5"]', '[data-id="briar-house-5"]']) {
        if (selector !== '#use-sample') await host.click('[data-act="back-setup"]');
        await host.click(selector);
        await host.locator('#open-lobby').waitFor();
        check(`${name} ${selector}: review is read-only`, await host.locator(retiredControls).count() === 0 &&
          await host.locator('[data-assign-character]').count() === 5);
      }
      await host.locator('[data-assign-character="0"]').selectOption('Elliot');
      await host.locator('#story-atmosphere').selectOption('farm');
      await host.locator('[data-disclose-killer]').check();
      check(`${name}: assignment and game settings still save`, await host.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('gg-host-v1'));
        return state.story.characters[0].guest === 'Elliot' && state.story.atmosphere === 'farm' && state.story.discloseKiller;
      }));
      await host.locator('[data-assign-character="4"]').selectOption('Avery');
      await host.click('#open-lobby');
      await host.click('#start-game');
      let state = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
      const guest = await context.newPage();
      await guest.addInitScript(view => { window.testView = view; }, buildView(state, state.story.characters[0].id));
      await guest.goto(`${base}?room=${state.room}`);
      await guest.locator('#current-reader').waitFor();
      for (let ri = 0; ri < state.story.rounds.length; ri++) {
        if (ri === 1) check(`${name}: one earlier round uses singular grammar`, (await host.locator('#host-evidence-history > summary').innerText()).includes('(1 round)'));
        for (const id of state.story.rounds[ri].chain) {
          state = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
          const reader = state.story.characters.find(character => character.id === id);
          const view = buildView(state, state.story.characters[0].id);
          await guest.evaluate(view => window.deliverView(view), view);
          check(`${name} round ${ri + 1}: host names the correct reader`, (await host.locator('#current-reader').innerText()).includes(reader.name) &&
            (await host.locator('#current-reader').innerText()).includes(reader.guest));
          const guestText = await guest.locator('#current-reader').innerText();
          check(`${name} round ${ri + 1}: guest reading status is correct`, id === view.me ? guestText.includes('You are next') : guestText.includes(reader.name));
          check(`${name} round ${ri + 1}: chain diagram absent on both screens`, await host.locator('#clue-chain').count() === 0 &&
            await guest.locator('#phase-card ol').count() === 0);
          await host.click('#next-reader');
        }
        state = await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
        await guest.evaluate(view => window.deliverView(view), buildView(state, state.story.characters[0].id));
        check(`${name}: round completion is visible`, (await host.locator('#current-reader').innerText()).includes('Every player has read') &&
          (await guest.locator('#current-reader').innerText()).includes('Everyone has read'));
        await host.click('#next-round');
        await host.click('#open-vote');
        await castTestBallots(host);
        if (ri < state.story.rounds.length - 1) await host.click('#next-round');
      }
      await host.click('#reveal-btn');
      await host.locator('#killer-name').waitFor();
      check(`${name}: final reveal remains reachable`, await host.locator('#killer-name').count() === 1);
      await guest.close();

      await host.evaluate(story => {
        const state = JSON.parse(localStorage.getItem('gg-host-v1'));
        state.story = story; state.phase = 'round'; state.roundIndex = 0;
        localStorage.setItem('gg-host-v1', JSON.stringify(state));
      }, blackwater[4]);
      await host.reload();
      await host.locator('#current-reader').waitFor();
      check(`${name}: current Blackwater saved games can resume`, await host.locator('#current-reader').count() === 1 &&
        await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).story.edition.family === 'blackwater-row'));
      await host.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('gg-host-v1'));
        state.story.edition.family = 'withdrawn-test-story';
        localStorage.setItem('gg-host-v1', JSON.stringify(state));
      });
      await host.reload();
      await host.locator('#guest-name').waitFor();
      check(`${name}: non-catalog saved story is removed`, await host.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).story === null));
      check(`${name}: non-catalog story rejection preserves the guest list`, await host.locator('.guest-item').count() === 5);
      check(`${name}: non-catalog story rejection explains why`, (await host.locator('#toast').innerText()).includes('no longer available'));
      await host.click('#use-sample');
      await host.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('gg-host-v1'));
        state.story.provenance = { kind: 'user', author: 'Legacy writer', revision: 1 };
        localStorage.setItem('gg-host-v1', JSON.stringify(state));
      });
      await host.reload();
      await host.locator('#guest-name').waitFor();
      check(`${name}: old user-created editions cannot resume`, await host.locator('#guest-name').count() === 1 &&
        await host.locator('.guest-item').count() === 5);
      const account = await context.newPage();
      await account.goto(base + 'workshop.html');
      check(`${name}: old workshop URL opens account only`, await account.getByRole('heading', { name: 'Your account', exact: true }).count() === 1 &&
        await account.locator('[data-action="create"], #draft-json, #import-file, [data-action="generate"]').count() === 0);
      await account.fill('#username', 'catalog-owner'); await account.fill('#password', 'test-only-password-123!');
      await account.click('[data-action="login"]');
      await account.locator('[data-action="developer"]').waitFor();
      check(`${name}: owner developer access remains`, await account.locator('[data-action="developer"]').count() === 1);
      await account.click('[data-action="logout"]');
      await account.locator('#username').waitFor();
      await account.fill('#username', `catalog-player-${name === 'Chromium' ? 'c' : 'w'}`);
      await account.fill('#password', 'test-only-password-123!');
      await account.fill('#author-name', 'Test Player');
      await account.click('[data-action="register"]');
      await account.locator('[data-action="logout"]').waitFor();
      check(`${name}: player account and purchase link remain without authoring/admin tools`,
        await account.getByRole('link', { name: 'My purchased games & receipts' }).count() === 1 &&
        await account.locator('[data-action="developer"], [data-action="admin"], [data-action="home"]').count() === 0);
      check(`${name}: no retired modules or authoring APIs requested`, !requests.some(url => /\/js\/(?:ai|workshop|workshop-storage|workshop-core)\.js|\/api\/(?:drafts|submissions|community)(?:\/|$)/.test(url)));
      assert.deepEqual(errors, [], `${name}: page errors`);
      check(`${name}: no page exceptions`, true);
    } finally { await browser.close(); }
  }
  console.log(`${checks} curated catalog browser checks passed.`);
} finally { await new Promise(resolve => server.close(resolve)); }
