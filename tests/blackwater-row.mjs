import test from 'node:test';
import assert from 'node:assert/strict';
import blackwater from '../js/editions/blackwater-row.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { normalizeStory } from '../js/story.js';
import { validateAccusationCircles } from '../js/accusations.js';

test('Blackwater Row is playable at its fixed four-player count with exact coverage', () => {
  const story = blackwater[4];
  assert.equal(story.fixedPlayerCount, 4);
  assert.equal(story.characters.length, 4);
  assert.deepEqual(normalizeStory(story).errors, []);
  assert.deepEqual(validateAccusationCircles(story), []);
  const entry = STARTER_MYSTERIES.find(item => item.story.edition?.family === 'blackwater-row');
  assert.ok(entry);
  assert.equal(entry.story.fixedPlayerCount, 4);

  const pairs = new Set();
  story.rounds.forEach((round, ri) => {
    const targets = story.characters.map(c => c.rounds[ri].readAloud.accuses);
    assert.equal(new Set(targets).size, 4, `Round ${ri + 1}: nobody is targeted twice`);
    story.characters.forEach(c => {
      const pair = `${c.id}>${c.rounds[ri].readAloud.accuses}`;
      if (ri < 3) { assert.ok(!pairs.has(pair)); pairs.add(pair); }
    });
    assert.equal(round.coverageRepeat, ri >= 3);
  });
  assert.equal(pairs.size, 12);
  assert.match(story.coverageRepeatNote, /five/i);
  assert.ok(story.characters.every(c => c.ghost == null), 'no player character dies, so no ghosts');
});
