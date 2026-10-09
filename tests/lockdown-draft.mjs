import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectLockdownDraft, reviewLockdownDraft } from '../tools/lockdown-draft-catalog.mjs';
import { SITE_FILES, SITE_DIRECTORIES } from '../tools/build-site.mjs';

const catalog = JSON.parse(readFileSync(new URL('../tools/lockdown-drafts.json', import.meta.url)));
const master = catalog.editions[0];

test('LOCKDOWN import retains all 525 supplied readings without mutating source data', () => {
  assert.equal(catalog.editions.reduce((sum, edition) => sum + edition.rounds.reduce((sum, round) => sum + round.clues.length, 0), 0), 525);
  const before = JSON.stringify(catalog);
  const selected = selectLockdownDraft(catalog, 12);
  selected.rounds[0].clues[0].text = 'Changed review copy';
  assert.equal(JSON.stringify(catalog), before);
});

test('all ten LOCKDOWN draft counts preserve master chapters, core cards, clues and shared ending', () => {
  assert.deepEqual(catalog.editions.map(edition => edition.count), [3,4,5,6,7,8,9,10,11,12]);
  for (let count = 3; count <= 12; count++) {
    const draft = selectLockdownDraft(catalog, count);
    assert.equal(draft.status, 'author-review');
    assert.equal(draft.characters.length, count);
    assert.deepEqual(draft.characters.slice(0, 3), master.characters);
    assert.equal(draft.reveal, master.reveal);
    assert.equal(draft.victim, master.victim);
    assert.equal(draft.rounds.length, 7);
    draft.rounds.forEach((round, ri) => {
      assert.equal(round.narration, master.rounds[ri].narration);
      assert.deepEqual(round.clues.slice(0, 3), master.rounds[ri].clues);
      assert.equal(round.clues.length, count);
      const order = round.readingGroups.flat();
      assert.equal(order.length, count);
      assert.equal(new Set(order).size, count);
      for (const clue of round.clues) {
        assert.notEqual(clue.reader, clue.target);
        assert.ok(draft.characters.some(character => character.id === clue.target));
      }
    });
    assert.ok(reviewLockdownDraft(draft).some(issue => issue.includes('author TODO')));
  }
});

test('LOCKDOWN count selection rejects unsupported or missing editions without resizing', () => {
  assert.equal(selectLockdownDraft(catalog, 8).characters.length, 8);
  for (const count of [0, 2, 13, 3.5, NaN, '8']) assert.throws(() => selectLockdownDraft(catalog, count), /exactly 3 through 12/);
  assert.throws(() => selectLockdownDraft({ editions: [master] }, 8), /missing/);
});

test('editorial LOCKDOWN tools remain outside deployment; playable catalog is wired separately', () => {
  assert.ok(!SITE_DIRECTORIES.includes('tools'));
  assert.ok(!SITE_FILES.some(file => file.includes('lockdown')));
  const host = readFileSync(new URL('../js/host.js', import.meta.url), 'utf8');
  assert.ok(host.includes("from './editions/lockdown.js?v=lockdown-release-v1'"));
});
