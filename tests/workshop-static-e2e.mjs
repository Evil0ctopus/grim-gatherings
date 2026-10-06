import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readyDraft } from './workshop-fixture.mjs';

const base = process.argv[2] || 'https://evil0ctopus.github.io/grim-gatherings/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
async function click(action) {
  await page.locator(`[data-action="${action}"]`).first().click();
  await page.waitForFunction(() => !document.querySelector('[data-action]:disabled'));
}
try {
  await page.goto(base);
  assert.equal(await page.getByRole('link', { name: 'My account', exact: true }).count(), 1);
  assert.equal(await page.getByRole('link', { name: /admin|approv/i }).count(), 0);
  await page.getByRole('link', { name: 'Build a mystery', exact: true }).click();
  await click('create'); await click('next'); await click('next'); await click('make-draft');
  await page.locator('summary').filter({ hasText: 'AI help or import' }).click();
  const draft = readyDraft();
  draft.story.title = 'Private workshop verification';
  await page.fill('#draft-json', JSON.stringify(draft.story)); await click('apply-json');
  for (const key of ['evidence', 'pacing', 'solution', 'content']) await page.locator(`[data-review="${key}"]`).check();
  await page.fill('#credit', 'Verification author'); await click('save-playable');
  assert.match(await page.innerText('#workshop-message'), /Saved privately/);
  await page.reload(); await click('open');
  assert.equal(await page.inputValue('#w-story-title'), draft.story.title);
  await page.getByRole('link', { name: 'Game home', exact: true }).click();
  await page.click('#btn-new');
  assert.match(await page.innerText('#app'), /Private workshop verification/);
  assert.match(await page.innerText('#app'), /User-created/);
  for (const name of ['One', 'Two', 'Three', 'Four']) {
    await page.fill('#guest-name', name); await page.click('#add-guest');
  }
  await page.locator('[data-act="use-saved"]').click();
  await page.waitForSelector('#open-lobby');
  const story = await page.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')).story);
  assert.equal(story.title, draft.story.title);
  assert.equal(story.provenance.kind, 'user');
  assert.equal(story.characters.length, 4);
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS static workshop creation, import, private save, reload, badge and playable game selection');
} finally { await browser.close(); }
