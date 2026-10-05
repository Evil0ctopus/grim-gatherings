import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createCommunityServer } from '../server/community.mjs';

const server = await createCommunityServer({ database: ':memory:' });
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const context = await browser.newContext();
await context.route('**/js/community-config.js*', route => route.fulfill({
  contentType: 'text/javascript', body: "export const COMMUNITY_API = ''; export const COMMUNITY_PROVIDER = 'node';",
}));
let checks = 0;
const errors = [];
const check = (name, value) => { assert.ok(value, name); checks++; console.log(`PASS ${name}`); };
async function click(page, action) {
  await page.locator(`[data-action="${action}"]`).first().click();
  await page.waitForFunction(() => !document.querySelector('[data-action]:disabled'));
}
async function edit(page, title) {
  await page.fill('#w-story-title', title);
  await page.locator('#w-story-setting').focus();
}
try {
  const first = await context.newPage(), second = await context.newPage();
  for (const page of [first, second]) {
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
  }
  await first.goto(base + 'workshop.html');
  for (const action of ['create', 'next', 'next', 'make-draft']) await click(first, action);
  await second.goto(base + 'workshop.html'); await click(second, 'open');
  await edit(first, 'Newest version from first tab');
  await first.waitForFunction(() => document.querySelector('#workshop-message').textContent === 'Draft saved on this device.');
  await edit(second, 'Conflicting second tab edit');
  await second.waitForFunction(() => document.querySelector('#workshop-error').textContent.includes('another tab') || document.querySelector('#workshop-message').textContent === 'Draft saved on this device.');
  const stored = await first.evaluate(async () => (await import('./js/workshop-storage.js')).listDrafts());
  check('the newer device draft survives a competing tab edit', stored[0].story.title === 'Newest version from first tab');
  check('a stale workshop tab reports conflict rather than silently overwriting newer work', (await second.innerText('#workshop-error')).includes('another tab'));
  await edit(second, 'Another conflicting edit');
  await second.waitForFunction(() => document.querySelector('#workshop-error').textContent.includes('another tab'));
  await click(second, 'home'); await click(second, 'open');
  check('reopening loads the latest saved draft after repeated conflicts', await second.inputValue('#w-story-title') === 'Newest version from first tab');
  await click(second, 'versions');
  const history = await second.evaluate(async id => (await import('./js/workshop-storage.js')).draftVersions(id), stored[0].id);
  check('conflicting text is retained in version history for recovery', history.some(v => v.draft.story.title === 'Conflicting second tab edit') && history.some(v => v.draft.story.title === 'Another conflicting edit'));
  await edit(second, 'Recovered latest draft edit');
  await second.waitForFunction(() => document.querySelector('#workshop-message').textContent === 'Draft saved on this device.');
  await click(second, 'versions');
  await second.locator('[data-action="restore"]').nth(1).click();
  await second.waitForFunction(() => !document.querySelector('[data-action]:disabled'));
  check('restoring history uses the current storage revision, not an obsolete revision', !(await second.innerText('#workshop-error')).includes('another tab'));
  await second.evaluate(async () => {
    const request = indexedDB.open('gg-story-workshop-v1');
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite'), store = tx.objectStore('drafts');
        store.getAll().onsuccess = event => event.target.result.forEach(draft => { delete draft.storageRevision; store.put(draft); });
        tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
      });
    } finally { db.close(); }
  });
  await second.reload(); await click(second, 'open');
  await edit(second, 'Updated pre-audit saved draft');
  await second.waitForFunction(() => document.querySelector('#workshop-message').textContent === 'Draft saved on this device.');
  check('older saved drafts without storage revisions remain editable', (await second.innerText('#workshop-error')) === '');
  for (const title of ['Queued one', 'Queued two', 'Queued three']) await edit(second, title);
  await second.waitForFunction(async () => (await (await import('./js/workshop-storage.js')).listDrafts())[0].story.title === 'Queued three');
  check('rapid queued saves in the same tab do not create false conflicts', (await second.innerText('#workshop-error')) === '');
  check('storage conflict recovery produces no JavaScript exceptions', errors.length === 0);
  console.log(`${checks}/${checks} multi-tab storage browser checks passed.`);
} finally {
  await browser.close(); server.close(); await once(server, 'close');
}
