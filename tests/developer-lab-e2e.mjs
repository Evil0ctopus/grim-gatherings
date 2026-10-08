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
const check = (label, condition) => { assert.ok(condition, label); checks++; console.log(`PASS ${label}`); };
async function click(page, name) {
  const response = name.startsWith('lab-') && !['lab-reveal', 'lab-restart'].includes(name)
    ? page.waitForResponse(item => item.url().endsWith('/api/admin/developer') && item.request().method() === 'POST')
    : null;
  try { await page.locator(`[data-action="${name}"]`).click({ timeout: 5000 }); }
  catch (error) {
    console.error('Missing browser action', name, snapshot?.state?.phase, snapshot?.turn, (await page.locator('#workshop').innerText()).slice(-700));
    throw error;
  }
  if (response) {
    const result = await response;
    if (result.ok()) {
      snapshot = await result.json();
      const phase = snapshot.state.phase.replaceAll('-', ' ');
      await page.waitForFunction(expected => Array.from(document.querySelectorAll('#workshop h2'))
        .some(heading => heading.innerText.toLowerCase().includes(expected)), phase);
      if (snapshot.turn) await page.waitForSelector('[data-action="lab-reveal"]');
    }
  }
  await page.waitForFunction(() => !document.querySelector('[data-action]:disabled'));
}
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
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
  check('invalid fixed count produces explicit error', (await page.locator('#workshop-error').innerText()).includes('exactly 5'));

  for (const [gameIndex, gameId] of ['lanternfall', 'ledger'].entries()) {
    if (gameIndex > 0) {
      await startServer();
      await page.goto(`${base}/workshop.html?account=1`);
      await page.fill('#username', 'lab-owner'); await page.fill('#password', 'test-only-lab-password');
      await click(page, 'login'); await click(page, 'developer');
    }
    await page.selectOption('#lab-game', gameId);
    await page.fill('#lab-names', Array.from({ length: 5 }, (_, index) => `Guest ${index + 1}`).join('\n'));
    await click(page, 'lab-create');
    check(`${gameId}: setup precedes character read-around`, snapshot.state.phase === 'setup' &&
      (await page.locator('#workshop').innerText()).includes('Read the story setup aloud'));
    let steps = 0;
    while (snapshot.state.phase !== 'finished') {
      assert.ok(steps++ < 100, 'story loop must terminate');
      const phase = snapshot.state.phase;
      if (phase === 'setup') await click(page, 'lab-start-introduction');
      else if (phase === 'introduction') {
        await click(page, 'lab-reveal');
        await click(page, 'lab-read-card');
      } else if (phase === 'intro-discussion') await click(page, 'lab-start-rounds');
      else if (phase === 'round-intro') await click(page, 'lab-start-clues');
      else if (phase === 'round') {
        await click(page, 'lab-reveal');
        await click(page, 'lab-read-clue');
      } else if (phase === 'deliberation') {
        check(`${gameId}: round vote follows deliberation`, await page.locator('[data-action="lab-open-vote"]').count() === 1);
        await click(page, 'lab-open-vote');
      } else if (phase === 'vote' || phase === 'final-vote') {
        await click(page, 'lab-reveal');
        check(`${gameId}: vote has character targets`, await page.locator('#lab-target option').count() === 4);
        await click(page, 'lab-vote');
      } else if (phase === 'final-accusation') {
        check(`${gameId}: final accusations precede final vote`, await page.locator('[data-action="lab-open-final-vote"]').count() === 1);
        await click(page, 'lab-open-final-vote');
      } else if (phase === 'reveal') {
        check(`${gameId}: complete fixed story is revealed`, (await page.locator('#workshop').innerText()).includes('Fixed story reveal'));
        await click(page, 'lab-finish-reveal');
      } else assert.fail(`Unexpected story phase: ${phase}`);
    }
    check(`${gameId}: five-player story completes`, snapshot.state.phase === 'finished');
    check(`${gameId}: fits mobile viewport`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await click(page, 'lab-restart');
  }
  await click(page, 'account'); await click(page, 'logout');
  check('logout removes developer entry', await page.locator('[data-action="developer"]').count() === 0);
  await page.fill('#username', 'lab-author'); await page.fill('#password', 'test-only-author-password'); await page.fill('#author-name', 'Author');
  await click(page, 'register');
  check('regular author has no developer entry', await page.locator('[data-action="developer"]').count() === 0);
  check('regular author cannot fetch developer games', await page.evaluate(async () => {
    const api = await import('/js/community-api.js?v=premium-v1');
    try { await api.communityRequest('/api/admin/developer'); return false; }
    catch (error) { return error.status === 403; }
  }));
  check('no browser exceptions', errors.length === 0);
  console.log(`${checks} developer browser checks passed.`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
