import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createCommunityServer } from '../server/community.mjs';

let server, base;
async function startServer() {
  if (server) await new Promise(resolve => server.close(resolve));
  server = await createCommunityServer({ database: ':memory:', adminUsername: 'lab-owner', adminPassword: 'test-only-lab-password' });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
}
await startServer();
const browser = await chromium.launch();
const errors = [];
let checks = 0, snapshot;
const check = (label, condition) => {
  assert.ok(condition, label); checks++;
  if (!/dawn note for|secret hidden after/.test(label)) console.log(`PASS ${label}`);
};
async function click(page, name) {
  await page.locator(`[data-action="${name}"]`).click();
  await page.waitForFunction(() => !document.querySelector('[data-action]:disabled'));
}
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  page.on('response', async response => {
    if (response.url().endsWith('/api/admin/developer') && response.request().method() === 'POST' && response.ok()) snapshot = await response.json();
  });
  await page.route('**/js/community-config.js*', route => route.fulfill({
    contentType: 'text/javascript', body: "export const COMMUNITY_API='';export const COMMUNITY_PROVIDER='node';",
  }));
  await page.goto(`${base}/workshop.html?account=1`);
  await page.fill('#username', 'lab-owner'); await page.fill('#password', 'test-only-lab-password');
  await click(page, 'login');
  check('owner sees developer entry', await page.locator('[data-action="developer"]').count() === 1);
  await click(page, 'developer');
  await page.fill('#lab-names', 'Only one');
  await click(page, 'lab-create');
  check('invalid size produces explicit error', (await page.locator('#workshop-error').innerText()).includes('3-10'));
  for (const gameId of ['lanternfall', 'ledger']) for (let count = 3; count <= 10; count++) {
    if (gameId !== 'lanternfall' || count !== 3) {
      await startServer();
      await page.goto(`${base}/workshop.html?account=1`);
      await page.fill('#username', 'lab-owner'); await page.fill('#password', 'test-only-lab-password');
      await click(page, 'login'); await click(page, 'developer');
    }
    await page.selectOption('#lab-game', gameId);
    await page.fill('#lab-names', Array.from({ length: count }, (_, i) => `Guest ${i + 1}`).join('\n'));
    await click(page, 'lab-create');
    check(`${gameId}/${count}: card concealed before handoff`, await page.locator('#lab-target').count() === 0 &&
      !(await page.locator('#workshop').innerText()).includes('Secret allies:'));
    for (let i = 0; i < count; i++) {
      await click(page, 'lab-reveal');
      await click(page, 'lab-next-card');
    }
    let steps = 0;
    while (snapshot.state.phase !== 'finished') {
      assert.ok(steps++ < 100, 'game must terminate');
      if (snapshot.state.phase === 'discussion') {
        await click(page, 'lab-notes');
        for (const player of snapshot.state.players.filter(p => !p.detained)) {
          await click(page, 'lab-reveal');
          check(`${gameId}/${count}: dawn note for ${player.id}`, (await page.locator('#workshop').innerText()).includes('Private note:'));
          await click(page, 'lab-next-card');
        }
        await click(page, 'lab-council');
      } else {
        await click(page, 'lab-reveal');
        if (snapshot.state.phase === 'vote') await page.selectOption('#lab-target', '');
        await click(page, 'lab-submit');
        check(`${gameId}/${count}: secret hidden after commit`, !(await page.locator('#workshop').innerText()).includes('Secret allies:'));
      }
    }
    check(`${gameId}/${count}: complete final reveal`, (await page.locator('#workshop').innerText()).includes('Final reveal'));
    check(`${gameId}/${count}: fits mobile viewport`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await click(page, 'lab-restart');
  }
  await click(page, 'account'); await click(page, 'logout');
  check('logout removes developer entry', await page.locator('[data-action="developer"]').count() === 0);
  await page.fill('#username', 'lab-author'); await page.fill('#password', 'test-only-author-password'); await page.fill('#author-name', 'Author');
  await click(page, 'register');
  check('regular author has no developer entry', await page.locator('[data-action="developer"]').count() === 0);
  check('regular author cannot fetch prototypes', await page.evaluate(async () => {
    const api = await import('/js/community-api.js?v=reliability-v1');
    try { await api.communityRequest('/api/admin/developer'); return false; }
    catch (e) { return e.status === 403; }
  }));
  check('no browser exceptions', errors.length === 0);
  console.log(`${checks} developer browser checks passed.`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
