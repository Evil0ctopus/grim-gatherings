import test from 'node:test';
import assert from 'node:assert/strict';
import { blankStory, routingPlan, createPrompt, checkDraft, editedDraft, isEditableStory, REVIEW_ITEMS } from '../js/workshop-core.js';
import { normalizeStory } from '../js/story.js';
import { upsertStory, readStoryLibrary, adaptStoryForPlayers } from '../js/library.js';
import { readyDraft } from './workshop-fixture.mjs';
import { isOutdatedStory } from '../js/saved-content.js';

test('every player count from 3 to 23 derives complete unique coverage', () => {
  for (const count of Array.from({ length: 21 }, (_, i) => i + 3)) {
    const story = blankStory({ count });
    assert.ok(isEditableStory(story));
    assert.ok(story.rounds.length >= count - 1);
    const coverage = new Set();
    story.rounds.forEach((round, ri) => {
      assert.equal(new Set(round.chain).size, count);
      assert.equal(round.chain.length, count);
      assert.equal(round.coverageRepeat, ri >= count - 1);
      const targets = story.characters.map(c => c.rounds[ri].readAloud.accuses);
      assert.equal(new Set(targets).size, count, 'nobody is targeted twice in one round');
      for (const character of story.characters) {
        const reader = character.id;
        const target = character.rounds[ri].readAloud.accuses;
        assert.notEqual(reader, target);
        if (ri < count - 1) {
          assert.ok(!coverage.has(`${reader}>${target}`));
          coverage.add(`${reader}>${target}`);
        }
      }
    });
    assert.equal(coverage.size, count * (count - 1));
    assert.match(routingPlan(story), /Round 1 -> c2/);
  }
  assert.throws(() => blankStory({ count: 2 }), /fixed player count/);
  assert.throws(() => blankStory({ count: 5, rounds: 3 }), /at least 4 rounds/);
  assert.equal(blankStory({ count: 3, rounds: 2 }).rounds.length, 2);
  assert.throws(() => blankStory({ characters: 'Only one' }), /exactly 5/);
});

test('prompt includes exact assignments, immutable schema, concrete evidence and staged spoiler rules', () => {
  const draft = readyDraft();
  const prompt = createPrompt(draft, 'Make the evidence clearer');
  for (const pattern of [/MANDATORY READER ASSIGNMENTS/, /Round 3 -> c2/, /Benjamin Barker: Round 5/, /witness or record/, /ownership was recognized/, /limits of the inference/, /EVERY round/, /private backstory/, /before using them as proof/, /REQUESTED EDIT/, /unaffected facts/]) assert.match(prompt, pattern);
});

test('playable saves require both format checks and a creator narrative review', () => {
  const draft = readyDraft();
  assert.deepEqual(checkDraft(draft).errors, []);
  draft.review = {};
  assert.equal(checkDraft(draft).errors.length, 4);
  assert.equal(checkDraft(draft, false).errors.length, 0);
  assert.equal(checkDraft({ ...draft, story: blankStory() }).story, null);
});

test('hidden phrases are checked in introductions, every early spoken surface and repeated vote prompt', () => {
  for (const field of ['intro', 'publicBlurb', 'votePrompt', 'narration', 'publicText', 'card']) {
    const draft = readyDraft();
    const phrase = 'Benjamin Barker';
    if (field === 'intro') draft.story.intro += phrase;
    if (field === 'publicBlurb') draft.story.characters[0].publicBlurb += phrase;
    if (field === 'votePrompt') draft.story.finale.votePrompt += phrase;
    if (field === 'narration' || field === 'publicText') draft.story.rounds[2][field] += phrase;
    if (field === 'card') draft.story.characters[0].rounds[2].readAloud.text += phrase;
    assert.match(checkDraft(draft).errors.join(' '), /too early|before Round 1/);
  }
});

test('unknown references, wrong card targets and incomplete chapters block saves', () => {
  const draft = readyDraft();
  const validClue = draft.story.characters[0].rounds[0].readAloud.text;
  draft.story.characters[0].rounds[0].readAloud.text += ' {unknown}';
  draft.story.rounds[1].publicText = '';
  assert.match(checkDraft(draft).errors.join(' '), /unknown character reference|clue must be about its assigned target/);
  assert.match(checkDraft(draft).errors.join(' '), /clue must be about its assigned target|only the assigned target/);
  draft.story.characters[0].rounds[0].readAloud.text = validClue;
  assert.match(checkDraft(draft).errors.join(' '), /phone summary/);
});

test('edits reset creator approval while preserving draft identity and source story', () => {
  const draft = readyDraft(), copy = structuredClone(draft.story);
  copy.title = 'New title';
  const revised = editedDraft(draft, copy);
  assert.equal(revised.id, draft.id);
  assert.equal(draft.story.title, 'A test mystery');
  assert.deepEqual(revised.review, {});
});

test('user-created provenance survives saves, import, normalization and guest assignment', () => {
  const story = readyDraft().story;
  story.provenance = { kind: 'community', author: 'A creator', revision: 3, submissionId: 'submission' };
  const saved = upsertStory([], story, 'community-story');
  const restored = readStoryLibrary(JSON.stringify(saved.entries))[0].story;
  const normalized = normalizeStory(adaptStoryForPlayers(restored, Array.from({ length: 3 }, (_, i) => ({ name: `Guest ${i}`, desc: '' }))));
  assert.deepEqual(normalized.story.provenance, story.provenance);
  assert.ok(normalizeStory({ ...story, provenance: { ...story.provenance, revision: -1 } }).errors.length);
  story.title = 'The Last Will at Briar House';
  assert.equal(isOutdatedStory(story), false, 'New authored stories are not deleted just because a title matches a retired adaptive story');
});
