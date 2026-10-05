import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createCommunityServer } from '../server/community.mjs';
import { readyDraft } from './workshop-fixture.mjs';

const server = await createCommunityServer({ database: ':memory:', adminUsername: 'site-owner', adminPassword: 'test-only-password-123!' });
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
let checks = 0;
const check = (name, value) => { assert.ok(value, name); checks++; console.log(`PASS ${name}`); };
const errors = [];
async function page(context) {
  const p = await context.newPage();
  p.on('pageerror', error => errors.push(error.message));
  p.on('dialog', dialog => dialog.accept());
  return p;
}
async function click(p, action) {
  await p.locator(`[data-action="${action}"]`).first().click();
  await p.waitForFunction(() => !document.querySelector('[data-action]:disabled'), null, { timeout: 15000 });
}
async function review(p) {
  for (const key of ['evidence', 'pacing', 'solution', 'content']) await p.locator(`[data-review="${key}"]`).check();
}
async function create(p) {
  await click(p, 'create'); await click(p, 'next');
  await p.fill('#idea', 'A mysterious town with four neighbors.');
  await click(p, 'next'); await click(p, 'make-draft');
}
try {
  const creator = await page(await browser.newContext({ viewport: { width: 390, height: 844 } }));
  await creator.goto(base + 'workshop.html');
  await create(creator);
  check('a creator can start without an account or AI key', await creator.locator('[data-field="story.title"]').count() === 1);
  await creator.locator('summary').filter({ hasText: 'AI help or import' }).click();
  const content = readyDraft();
  await creator.fill('#draft-json', JSON.stringify(content.story));
  await click(creator, 'apply-json');
  check('a complete imported story uses the editable workshop', (await creator.inputValue('#w-story-title')) === content.story.title);
  check('later chapter and solution previews are collapsed by default', await creator.locator('[data-chapter][open]').count() === 0 && await creator.locator('details[open]').count() === 0);
  await creator.fill('#w-story-title', 'My revised mystery');
  await creator.locator('#w-story-setting').focus();
  await creator.reload();
  await creator.locator('[data-action="open"]').click();
  check('unfinished edits survive a refresh without being made playable', await creator.inputValue('#w-story-title') === 'My revised mystery');
  await click(creator, 'versions');
  check('unlimited revision history retains previous drafts', await creator.locator('[data-action="restore"]').count() >= 3);
  await creator.locator('[data-action="restore"]').nth(1).click();
  await creator.waitForFunction(() => !document.querySelector('[data-action]:disabled'));
  check('restoring an earlier version returns the old text without deleting history', await creator.inputValue('#w-story-title') === content.story.title);
  await creator.fill('#w-story-title', 'My revised mystery'); await creator.locator('#w-story-setting').focus();
  await creator.locator('summary').filter({ hasText: 'AI help or import' }).click();
  await creator.fill('#draft-json', '{"invalid":');
  await click(creator, 'apply-json');
  check('invalid JSON is retained with an actionable error and does not erase the story', (await creator.locator('#workshop-error').innerText()).includes('JSON could not be read') && await creator.inputValue('#w-story-title') === 'My revised mystery');
  await creator.locator('summary').filter({ hasText: 'AI help or import' }).click();
  await creator.fill('#draft-json', JSON.stringify({ ...content.story, title: 'My revised mystery' }));
  await click(creator, 'apply-json');
  await creator.locator('summary').filter({ hasText: 'AI help or import' }).click();
  await creator.locator('summary').filter({ hasText: 'AI service settings' }).click();
  await creator.fill('#ai-base', 'https://workshop-ai.invalid'); await creator.fill('#ai-model', 'test-model'); await creator.fill('#ai-key', 'test-only-not-a-real-key');
  await click(creator, 'save-ai');
  await creator.route('https://workshop-ai.invalid/chat/completions', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { content: JSON.stringify({ issues: [{ section: 'Round 1', issue: 'Explain recognition more clearly', suggestion: 'Name the identifying repair' }] }) } }] }),
  }));
  await creator.locator('summary').filter({ hasText: 'AI help or import' }).click();
  await click(creator, 'ai-review');
  check('separate AI narrative review displays suggestions without approving the story', (await creator.locator('#workshop').innerText()).includes('Explain recognition more clearly') && await creator.locator('[data-review]:checked').count() === 0);
  let attempts = 0;
  await creator.unroute('https://workshop-ai.invalid/chat/completions');
  await creator.route('https://workshop-ai.invalid/chat/completions', route => {
    attempts++;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { content: attempts === 1 ? '{"bad":true}' : JSON.stringify({ ...content.story, title: 'My revised mystery' }) } }] }) });
  });
  await creator.locator('summary').filter({ hasText: 'AI help or import' }).click();
  await click(creator, 'generate');
  check('generation repairs invalid output before presenting an editable draft', attempts === 2 && (await creator.locator('#workshop-message').innerText()).includes('human review'));
  await review(creator);
  await creator.fill('#credit', 'Workshop Author'); await creator.locator('[data-action="check"]').focus();
  await click(creator, 'save-playable');
  check('save produces a private playable copy with user-created provenance', await creator.evaluate(() => JSON.parse(localStorage.getItem('gg-story-library-v1'))[0].story.provenance.kind === 'user'));
  await creator.fill('#w-story-title', 'Changed draft only');
  await creator.locator('#w-story-setting').focus();
  check('editing resets the narrative checklist', await creator.locator('[data-review]:checked').count() === 0);
  check('editing a draft cannot silently change the playable copy', await creator.evaluate(() => JSON.parse(localStorage.getItem('gg-story-library-v1'))[0].story.title === 'My revised mystery'));
  await review(creator);
  await click(creator, 'account');
  await creator.fill('#username', 'workshop-author');
  await creator.fill('#password', 'test-only-password-123!');
  await creator.fill('#author-name', 'Workshop Author');
  await click(creator, 'register');
  await click(creator, 'home'); await click(creator, 'open');
  await creator.check('#publish-consent');
  await click(creator, 'submit');
  check('submission is explicitly pending, not published immediately', (await creator.locator('#workshop-message').innerText()).includes('not public'));
  await click(creator, 'community');
  check('pending stories are absent from the public library', await creator.locator('[data-action="community-save"]').count() === 0);
  const admin = await page(await browser.newContext());
  await admin.goto(base + 'workshop.html');
  await click(admin, 'account');
  await admin.fill('#username', 'site-owner'); await admin.fill('#password', 'test-only-password-123!');
  await click(admin, 'login'); await click(admin, 'admin'); await click(admin, 'admin-preview');
  check('admin previews the submitted version with separate spoiler sections', (await admin.locator('#workshop').innerText()).includes('immutable submitted version'));
  await admin.check('#admin-reviewed'); await click(admin, 'approve');
  check('approval publishes without rebuilding or pushing the static website', (await admin.locator('#workshop-message').innerText()).includes('published'));
  await click(creator, 'community');
  check('approved version appears with author credit and User-created badge', (await creator.locator('#workshop').innerText()).includes('Workshop Author') && await creator.locator('[data-action="community-save"]').count() === 1);
  await click(creator, 'community-save');
  await creator.goto(base);
  await creator.click('#btn-new');
  for (const name of ['One', 'Two', 'Three', 'Four']) { await creator.fill('#guest-name', name); await creator.click('#add-guest'); }
  await creator.click('[data-act="load-community"]');
  await creator.waitForSelector('[data-act="use-community"]');
  await creator.click('[data-act="use-community"]');
  await creator.waitForSelector('#open-lobby');
  const state = await creator.evaluate(() => JSON.parse(localStorage.getItem('gg-host-v1')));
  check('published community story enters the normal game with exact cast and approval version', state.story.provenance.kind === 'community' && state.story.characters.length === 4 && state.story.title === 'Changed draft only');
  await creator.click('#open-lobby');
  await creator.waitForFunction(() => document.querySelector('#net')?.textContent === 'Live', null, { timeout: 45000 });
  const room = (await creator.innerText('#room-code')).trim();
  const players = [];
  for (const c of state.story.characters) {
    const player = await page(await browser.newContext());
    await player.goto(`${base}?room=${room}`);
    await player.locator(`[data-claim="${c.id}"]`).click({ timeout: 45000 });
    await player.waitForFunction(id => window.__gg?.view.me === id, c.id, { timeout: 45000 });
    players.push(player);
  }
  await creator.click('#start-game');
  for (let ri = 0; ri < 5; ri++) {
    for (const [i, player] of players.entries()) {
      await player.waitForFunction(round => window.__gg?.view.phase === 'round' && window.__gg.view.roundIndex === round, ri, { timeout: 45000 });
      const target = await player.evaluate(() => window.__gg.view.packet.rounds.at(-1).readAloud.accuses);
      assert.equal(target, state.story.characters[i].rounds[ri].readAloud.accuses);
    }
    await creator.click('#next-round');
    for (const [i, player] of players.entries()) {
      const target = state.story.characters[i].id === state.story.solution.killerId ? 'marla' : state.story.solution.killerId;
      await player.click(`[data-vote="${target}"]`);
      await player.waitForFunction(id => window.__gg?.view.vote?.myVote === id, target);
    }
    check(`approved user-created story delivers all four cards and ballots in Round ${ri + 1}`, true);
    if (ri < 4) await creator.click('#next-round');
  }
  await creator.click('#reveal-btn');
  for (const player of players) await player.waitForSelector('#reveal-killer');
  check('approved user-created story plays through the final reveal on every phone', await players[0].innerText('#reveal-killer') === 'Xander Hale');
  await creator.locator('[data-act="end"]').first().click();
  for (const player of players) await player.context().close();
  await creator.goto(base + 'workshop.html'); await click(creator, 'home'); await click(creator, 'open');
  await creator.fill('#w-story-title', 'Not approved changes');
  await creator.locator('#w-story-setting').focus();
  await click(creator, 'backup-account');
  const published = await (await fetch(base + 'api/community')).json();
  check('new account edits leave the approved community story unchanged', published.stories[0].title === 'Changed draft only');
  const another = await page(await browser.newContext());
  await another.goto(base + 'workshop.html'); await click(another, 'account');
  await another.fill('#username', 'workshop-author'); await another.fill('#password', 'test-only-password-123!');
  await click(another, 'login'); await click(another, 'cloud-open');
  check('account backup retrieves the latest editable draft on a different device', await another.inputValue('#w-story-title') === 'Not approved changes');
  await click(admin, 'admin-preview'); await admin.fill('#admin-note', 'Needs another playtest'); await click(admin, 'unpublish');
  await click(creator, 'community');
  check('unpublishing removes the story from new public selections', await creator.locator('[data-action="community-save"]').count() === 0);
  check('all workshop screens fit a narrow phone viewport', await creator.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const disconnected = await page(await browser.newContext());
  await disconnected.route('**/api/**', route => route.fulfill({ status: 404, contentType: 'text/html', body: '<p>Static hosting has no backend</p>' }));
  await disconnected.goto(base + 'workshop.html');
  await click(disconnected, 'account'); await disconnected.fill('#username', 'local-author'); await disconnected.fill('#password', 'test-only-password-123!');
  await click(disconnected, 'login');
  check('static hosting gives an explicit backend-needed message instead of pretending to log in', (await disconnected.locator('#workshop-error').innerText()).includes('not connected yet'));
  await click(disconnected, 'home'); await create(disconnected);
  check('private draft editing still works when shared publishing is unavailable', await disconnected.locator('[data-field="story.title"]').count() === 1);
  check('no JavaScript exceptions in the workflow', errors.length === 0);
  console.log(`${checks}/${checks} workshop browser checks passed.`);
} finally {
  await browser.close(); server.close(); await once(server, 'close');
}
