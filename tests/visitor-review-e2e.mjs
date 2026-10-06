import assert from 'node:assert/strict';
import { once } from 'node:events';
import { chromium, webkit } from 'playwright';
import { createCommunityServer } from '../server/community.mjs';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}/`;
let checks = 0;
const check = (name, condition) => { assert.ok(condition, name); checks++; console.log(`PASS ${name}`); };
async function fits(page, label) {
  check(`${label}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
async function confirmClick(page, selector, accept) {
  const dialogPromise = page.waitForEvent('dialog');
  const click = page.locator(selector).first().click();
  const dialog = await dialogPromise;
  check('destructive action has a confirmation', dialog.type() === 'confirm');
  if (accept) await dialog.accept(); else await dialog.dismiss();
  await click;
}

try {
  for (const [name, engine] of [['Chromium', chromium], ['mobile WebKit', webkit]]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const errors = [], consoleErrors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      await page.addInitScript(() => {
        window.Peer = class { on() {} destroy() { this.destroyed = true; } };
        window.wakeRequests = 0;
        window.wakeReleases = 0;
        Object.defineProperty(navigator, 'wakeLock', { value: {
          async request() {
            window.wakeRequests++;
            const lock = new EventTarget();
            lock.released = false;
            lock.release = async () => { lock.released = true; window.wakeReleases++; lock.dispatchEvent(new Event('release')); };
            return lock;
          },
        } });
      });
      await page.route('**/vendor/peerjs.min.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      for (const width of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        for (const path of ['', 'how-to-play.html', 'privacy.html', 'terms.html']) {
          const response = await page.goto(base + path);
          check(`${name} ${width}: ${path || 'home'} loads`, response.ok());
          await page.locator('h1').waitFor();
          await fits(page, `${name} ${width} ${path || 'home'}`);
          check(`${name} ${width}: site information links present`, await page.locator('footer nav a').count() === 4);
        }
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(base);
      await page.click('#btn-new');
      for (const guest of ['Avery', 'Blake', 'Casey', 'Drew']) {
        await page.fill('#guest-name', guest);
        await page.click('#add-guest');
      }
      const description = await page.locator('h2').filter({ hasText: 'The Last Séance at Ravenmoor' }).locator('..').locator('p').first().innerText();
      check(`${name}: séance description normalized`, description.includes('séance'));
      const tree = await page.locator('#app').ariaSnapshot();
      check(`${name}: first story description occurs once in accessibility tree`, tree.split(description).length === 2);
      check(`${name}: Blackwater has no personal-name credit`, !(await page.locator('#app').innerText()).includes("Melissa's"));
      await fits(page, `${name}: setup`);
      await page.click('[data-act="use-starter"][data-id="blackwater-row"]');
      const original = await page.evaluate(() => localStorage.getItem('gg-host-v1'));
      await page.click('[data-act="back-setup"]');
      const beforeReplacement = await page.evaluate(() => localStorage.getItem('gg-host-v1'));
      await confirmClick(page, '#use-sample', false);
      check(`${name}: cancelling another story preserves save`, await page.evaluate(() => localStorage.getItem('gg-host-v1')) === beforeReplacement);
      await page.click('[data-act="home"]');
      const beforeNew = await page.evaluate(() => localStorage.getItem('gg-host-v1'));
      await confirmClick(page, '#btn-new', false);
      check(`${name}: cancelling new room preserves save and home`, await page.evaluate(() => localStorage.getItem('gg-host-v1')) === beforeNew && await page.locator('#btn-resume').count() === 1);
      await page.click('#btn-resume');
      await confirmClick(page, '#use-sample', true);
      check(`${name}: confirmed story replacement resets progress`, await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('gg-host-v1'));
        return state.story.title === 'The Last Séance at Ravenmoor' && state.roundIndex === -1 && !state.wasLive && Object.keys(state.votes).length === 0;
      }));
      // Restore the reviewed Blackwater fixture to exercise the exact reported finale.
      await page.evaluate(value => localStorage.setItem('gg-host-v1', value), original);
      await page.reload();
      await page.click('#open-lobby');
      await page.waitForFunction(() => document.querySelector('#host-awake-help')?.textContent.includes('is active'));
      check(`${name}: live host requests screen sleep prevention`, await page.evaluate(() => wakeRequests === 1));
      await fits(page, `${name}: lobby`);
      await page.click('#start-game');
      for (let round = 0; round < 5; round++) {
        await fits(page, `${name}: round ${round + 1}`);
        await page.click('#next-round');
        await fits(page, `${name}: vote ${round + 1}`);
        if (round < 4) await page.click('#next-round');
      }
      await confirmClick(page, '#reveal-btn', false);
      check(`${name}: cancelling no-vote reveal keeps final voting`, await page.locator('#reveal-btn').count() === 1);
      await confirmClick(page, '#reveal-btn', true);
      check(`${name}: killer reveal and solution reachable`, (await page.locator('#killer-name').innerText()) === 'Xander Hale' && (await page.locator('#app').innerText()).includes('Benjamin Barker'));
      await fits(page, `${name}: reveal`);
      await confirmClick(page, '[data-act="end"]', false);
      check(`${name}: cancelling end preserves finale and room`, await page.locator('#killer-name').count() === 1 && await page.evaluate(() => !!localStorage.getItem('gg-host-v1')));
      await confirmClick(page, '[data-act="end"]', true);
      check(`${name}: ending returns home and clears active room`, await page.locator('#btn-new').count() === 1 && new URL(page.url()).hash === '' && await page.evaluate(() => !localStorage.getItem('gg-host-v1')));
      check(`${name}: leaving host releases sleep prevention`, await page.evaluate(() => wakeReleases === wakeRequests));
      await page.click('#btn-new');
      const oldRoom = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).room);
      await page.click('[data-act="home"]');
      await confirmClick(page, '#btn-new', true);
      check(`${name}: confirmed new game replaces room`, await page.evaluate(old => JSON.parse(localStorage.getItem('gg-host-v1')).room !== old, oldRoom));
      assert.deepEqual(errors, [], `${name} page exceptions`);
      assert.deepEqual(consoleErrors, [], `${name} browser console errors`);
      check(`${name}: no browser exceptions`, true);
      check(`${name}: no browser console errors`, true);
    } finally { await browser.close(); }
  }
  console.log(`${checks} visitor review checks passed.`);
} finally { await new Promise(resolve => server.close(resolve)); }
