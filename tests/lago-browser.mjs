import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';
import { acceptDialogs } from './dialog-helper.mjs';

const server = await createCommunityServer({ database: ':memory:' });
const ravenmoor = process.argv.includes('--ravenmoor');
const family = ravenmoor ? 'Ravenmoor' : 'Lago';
const button = ravenmoor ? '#use-sample' : '#use-lago';
const card = ravenmoor ? '#ravenmoor-card' : '#lago-card';
server.listen(0, '127.0.0.1');
await once(server, 'listening');
let browser;
try {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await acceptDialogs(context);
  await context.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.addInitScript(() => {
    window.Peer = class {
      constructor() { this.open = true; this.handlers = {}; }
      on(event, handler) {
        this.handlers[event] = handler;
        if (event === 'open') setTimeout(() => handler('test-host'), 0);
      }
      destroy() { this.destroyed = true; }
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = `http://127.0.0.1:${server.address().port}/`;
  for (let count = 3; count <= 12; count++) {
    await page.goto(base);
    await page.evaluate(() => localStorage.removeItem('gg-host-v1'));
    await page.reload();
    await page.locator('#btn-new').click();
    for (let i = 0; i < count; i++) {
      await page.locator('#guest-name').fill(`Player ${i + 1}`);
      await page.locator('#add-guest').click();
    }
    assert.equal(await page.locator(button).isDisabled(), false);
    await page.locator(button).click();
    await page.locator('#open-lobby').waitFor();
    assert.equal(await page.locator('[data-assign-character]').count(), count);
    assert.match(await page.locator('#app').innerText(), /original trio.*preserved/);
    await page.reload();
    await page.locator('#open-lobby').waitFor();
    await page.locator('#open-lobby').click();
    await page.locator('#start-game').click();
    for (let ri = 0; ri < 7; ri++) {
      for (let ci = 0; ci < count; ci++) await page.locator('#next-reader').click();
      await page.locator('#next-round').click();
      await page.locator('#open-vote').click();
      await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('gg-host-v1'));
        const ballots = Object.fromEntries(state.story.characters.map(character => [
          character.id, state.story.characters.find(target => target.id !== character.id).id,
        ]));
        state.roundVotes[state.roundIndex] = ballots;
        state.votes = ballots;
        localStorage.setItem('gg-host-v1', JSON.stringify(state));
      });
      await page.reload();
      await page.locator('#tally').waitFor();
      await page.locator(ri === 6 ? '#reveal-btn' : '#next-round').click();
    }
    await page.locator('#killer-name').waitFor();
    assert.equal(await page.locator('#killer-name').textContent(), ravenmoor ? 'Dr. Silas Ashgrove' : 'Charles Jolly Jr.');
    console.log(`PASS ${family} ${count} players: selection, saved-game reload, seven rounds, votes and reveal`);
  }
  await context.close();
  const release = await browser.newContext();
  await release.route('**/js/site-policy.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('BUILD_RELEASE_ONLY = false', 'BUILD_RELEASE_ONLY = true') });
  });
  const releasePage = await release.newPage();
  releasePage.on('pageerror', error => errors.push(error.message));
  await releasePage.goto(base);
  await releasePage.locator('#btn-new').click();
  assert.equal(await releasePage.locator(card).count(), 1);
  assert.equal(await releasePage.locator('#use-lockdown').count(), 1);
  assert.deepEqual(errors, []);
  for (let i = 0; i < 4; i++) {
    await releasePage.locator('#guest-name').fill(`Guest ${i + 1}`);
    await releasePage.locator('#add-guest').click();
  }
  await releasePage.locator(button).click();
  await releasePage.locator('#open-lobby').waitFor();
  await releasePage.reload();
  await releasePage.locator('#open-lobby').waitFor();
  console.log(`PASS production policy: ${family} is selectable and restores alongside LOCKDOWN`);
  await release.close();
} finally {
  if (browser) await browser.close();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
