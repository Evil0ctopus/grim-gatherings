import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import editions from '../js/editions/briar-playtest.js';

const sites = ['https://evil0ctopus.github.io/grim-gatherings/', 'https://grimgatherings.com/'];
const normalize = text => text.replaceAll('\r\n', '\n');
const assets = ['index.html', 'js/main.js', 'js/host.js', 'js/story.js', 'js/accusations.js', 'js/briar-catalog.js', 'js/editions/briar-playtest.js'];
for (const base of sites) {
  const deadline = Date.now() + 5 * 60_000;
  for (;;) {
    try {
      for (const asset of assets) {
        const response = await fetch(`${base}${asset}?verify=${Date.now()}`, { signal: AbortSignal.timeout(20_000) });
        assert.equal(response.status, 200, `${base}${asset}`);
        const expected = await readFile(new URL(`../${asset}`, import.meta.url), 'utf8');
        assert.equal(normalize(await response.text()), normalize(expected), `${asset}: exact deployed bytes`);
      }
      const policy = await fetch(`${base}js/site-policy.js?verify=${Date.now()}`, { signal: AbortSignal.timeout(20_000) });
      assert.equal(policy.status, 200);
      assert.match(await policy.text(), base.includes('grimgatherings.com') ? /BUILD_RELEASE_ONLY = true/ : /BUILD_RELEASE_ONLY = false/);
      console.log(`PASS exact deployed Briar assets and policy: ${base}`);
      break;
    } catch (error) {
      if (Date.now() >= deadline) throw error;
      console.log(`Waiting for ${base}: ${String(error.message).slice(0, 120)}`);
      await new Promise(resolve => setTimeout(resolve, 15_000));
    }
  }
}

if (!process.argv.includes('--assets-only')) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    for (const base of sites) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (let count = 3; count <= 12; count++) {
        await page.goto(`${base}?verify=${Date.now()}`);
        await page.evaluate(() => localStorage.removeItem('gg-host-v1'));
        await page.reload();
        await page.locator('#btn-new').click();
        assert.equal(await page.locator('#briar-card').count(), 1);
        assert.equal(await page.locator('#use-lockdown').count(), 1);
        await page.locator('#briar-card details').click();
        assert.match(await page.locator('#briar-card').innerText(), /does not specify the physical murder method/);
        for (let i = 0; i < count; i++) {
          await page.locator('#guest-name').fill(`Live player ${i + 1}`);
          await page.locator('#add-guest').click();
        }
        await page.locator('#use-briar').click();
        await page.locator('#open-lobby').waitFor();
        assert.equal(await page.locator('[data-assign-character]').count(), count);
        assert.match(await page.locator('#app').innerText(), /does not specify the physical murder method/);
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
        assert.equal(state.story.edition.family, 'briar-playtest');
        assert.equal(state.story.fixedPlayerCount, count);
        assert.equal(state.story.authorPlaytest, true);
        assert.equal(state.story.rounds.length, 7);
        assert.deepEqual(state.story.solution, editions[3].solution);
        for (const [index, c] of editions[3].characters.entries()) {
          assert.equal(state.story.characters[index].id, c.id);
          assert.deepEqual(state.story.characters[index].rounds, c.rounds);
        }
        for (let ri = 0; ri < 7; ri++) assert.equal(state.story.rounds[ri].narration, editions[3].rounds[ri].narration);
        await page.reload();
        await page.locator('#open-lobby').waitFor();
        assert.equal(await page.locator('[data-assign-character]').count(), count);
        console.log(`PASS live ${base} ${count}: selection, disclosure, assignments, master and saved-game reload`);
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
