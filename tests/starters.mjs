import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { getPlayerRange } from '../js/library.js';
import { normalizeStory } from '../js/story.js';
import { validateAccusationCircles } from '../js/accusations.js';
import { buildSampleStory, SAMPLE_INFO } from '../js/sample.js';

const expectedCounts = { 'mercy-hollow': 5, 'blackthorn-farm': 5, 'briar-house': 5, 'blackwater-row': 4 };
const expectedFamilies = Object.keys(expectedCounts);
const guestList = count => Array.from({ length: count }, (_, index) => ({ name: `Guest ${index + 1}`, desc: '' }));

test('the sample mystery is available only at its committed fixed counts', () => {
  assert.match(SAMPLE_INFO.contentNote, /Poisoning, an off-screen death and a staged séance/);
  for (const count of [5]) {
    const story = buildSampleStory(guestList(count));
    assert.equal(story.fixedPlayerCount, count);
    assert.equal(story.characters.length, count);
    assert.deepEqual(normalizeStory(story).errors, []);
  }
  assert.throws(() => buildSampleStory(guestList(4)), /written for exactly 5 players/);
});

test('every active edition uses the fixed universal flow and supplies required story metadata', () => {
  assert.equal(STARTER_MYSTERIES.length, expectedFamilies.length);
  const foundFamilies = new Set();
  for (const entry of STARTER_MYSTERIES) {
    const story = entry.story;
    const family = story.edition.family;
    foundFamilies.add(family);
    assert.equal(story.title, `${entry.title} (${story.fixedPlayerCount} players)`);
    assert.ok(entry.blurb && entry.inspiration && entry.contentNote);
    assert.equal(story.fixedPlayerCount, story.characters.length);
    assert.equal(story.fixedPlayerCount, expectedCounts[family]);
    assert.ok(story.rounds.length < story.fixedPlayerCount || story.coverageRepeatNote, 'repeat rounds need a submitter note');
    assert.deepEqual(getPlayerRange(story), {
      minPlayers: story.fixedPlayerCount,
      maxPlayers: story.fixedPlayerCount,
    });
    assert.equal(story.edition.playerCount, story.fixedPlayerCount);
    assert.equal(story.editions, undefined);
    assert.ok(story.intro && story.hiddenThread && story.specialMechanics.length);
    assert.ok(story.finale.narration && story.finale.votePrompt);
    assert.ok(story.solution.explanation && story.solution.revealNarration);
    assert.deepEqual(normalizeStory(story).errors, []);
    assert.deepEqual(normalizeStory(story).warnings, []);
    assert.deepEqual(validateAccusationCircles(story), []);

    for (const [roundIndex, round] of story.rounds.entries()) {
      assert.ok(round.narration && round.publicText && round.hostNotes);
      assert.ok(round.events.length, `Round ${roundIndex + 1} needs ordered event-map beats`);
      assert.equal(round.chain.length, story.fixedPlayerCount);
      assert.equal(round.coverageRepeat, roundIndex >= story.fixedPlayerCount - 1);
    }
    for (const character of story.characters) {
      assert.ok(character.name && character.role && character.relationship && character.tieIn && character.publicBlurb);
      assert.equal(character.optional, false);
      assert.equal(character.rounds.length, story.rounds.length);
      assert.equal(character.ghost, null, 'ghosts are not added unless this story calls for them');
      for (const [roundIndex, round] of character.rounds.entries()) {
        const clue = round.readAloud;
        assert.notEqual(clue.accuses, character.id);
        assert.ok(clue.observation && clue.contradictingDetail);
        assert.ok(clue.text.includes(`{${clue.accuses}}`));
        const references = [...clue.text.matchAll(/\{([A-Za-z0-9_-]+)\}/g)].map(match => match[1]);
        assert.ok(references.every(id => id === clue.accuses), `${character.name}, Round ${roundIndex + 1} must focus on its assigned target`);
      }
    }
  }
  assert.deepEqual([...foundFamilies].sort(), expectedFamilies.sort());
});

test('each story family is offered at exactly one fixed player count', () => {
  const families = STARTER_MYSTERIES.map(entry => entry.story.edition.family);
  assert.equal(new Set(families).size, families.length);
});
