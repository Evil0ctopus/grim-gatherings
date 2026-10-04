import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptStoryForPlayers, getPlayerRange, makeStoryTemplate, readStoryLibrary, upsertStory } from '../js/library.js';
import { normalizeStory } from '../js/story.js';
import { buildSampleStory } from '../js/sample.js';

const story = {
  title: 'The Old House',
  characters: [{ id: 'keeper', name: 'The Keeper', guest: 'Sarah', guestNote: 'loves mysteries' }],
};

test('saved story templates do not retain the previous players’ names or notes', () => {
  const template = makeStoryTemplate(story);
  assert.equal(template.characters[0].guest, '');
  assert.equal(template.characters[0].guestNote, '');
  assert.equal(story.characters[0].guest, 'Sarah');
});

test('saving creates a library record and updating preserves its identity and creation time', () => {
  const created = upsertStory([], story, null, 100);
  assert.equal(created.entries.length, 1);
  assert.equal(created.record.createdAt, 100);

  const revised = { ...story, title: 'The Old House: Revisited' };
  const updated = upsertStory(created.entries, revised, created.record.id, 200);
  assert.equal(updated.entries.length, 1);
  assert.equal(updated.record.id, created.record.id);
  assert.equal(updated.record.createdAt, 100);
  assert.equal(updated.record.updatedAt, 200);
  assert.equal(updated.record.title, revised.title);
});

test('reading an empty or valid library succeeds and damaged data reports a useful error', () => {
  assert.deepEqual(readStoryLibrary(null), []);
  assert.equal(readStoryLibrary(JSON.stringify([{ id: 'one', story }])).length, 1);
  assert.throws(() => readStoryLibrary('{'), /Saved stories could not be read/);
  assert.throws(() => readStoryLibrary('{}'), /expected format/);
});

test('optional characters expand the player range and are omitted when attendance is lower', () => {
  const template = {
    title: 'The Old House',
    characters: [
      { id: 'keeper', name: 'The Keeper' },
      { id: 'doctor', name: 'The Doctor' },
      { id: 'visitor', name: 'The Visitor', optional: true },
      { id: 'neighbor', name: 'The Neighbor', optional: true },
    ],
    rounds: [{ title: 'The clue', narration: 'Ask {visitor} what they saw.' }],
    solution: { killerId: 'keeper' },
  };
  assert.deepEqual(getPlayerRange(template), { minPlayers: 2, maxPlayers: 4 });
  const threePlayerStory = adaptStoryForPlayers(template, [{ name: 'Sarah' }, { name: 'Mike' }, { name: 'Priya' }]);
  assert.deepEqual(threePlayerStory.characters.map(character => character.id), ['keeper', 'doctor', 'visitor']);
  assert.equal(threePlayerStory.characters[0].guest, 'Sarah');
  assert.ok(normalizeStory(threePlayerStory).story);
  assert.throws(() => adaptStoryForPlayers(template, [{ name: 'Sarah' }]), /works for 2–4 players/);
});

test('references to omitted roles become their names', () => {
  const template = {
    title: 'The Old House',
    characters: [
      { id: 'keeper', name: 'The Keeper' },
      { id: 'doctor', name: 'The Doctor' },
      { id: 'visitor', name: 'The Visitor', optional: true },
    ],
    rounds: [{ title: 'The clue', narration: 'The clue came from {visitor}.' }],
  };
  const onePlayerStory = adaptStoryForPlayers(template, [{ name: 'Sarah' }, { name: 'Mike' }]);
  assert.equal(onePlayerStory.rounds[0].narration, 'The clue came from The Visitor.');
});

test('optional characters cannot include the killer or leave fewer than two required roles', () => {
  const base = {
    title: 'The Old House',
    rounds: [{ title: 'The clue', narration: 'A clue.' }],
    characters: [
      { id: 'keeper', name: 'The Keeper' },
      { id: 'doctor', name: 'The Doctor' },
    ],
    solution: { killerId: 'keeper' },
  };
  const optionalKiller = structuredClone(base);
  optionalKiller.characters[0].optional = true;
  assert.match(normalizeStory(optionalKiller).errors.join(' '), /killer character cannot be optional/);

  const oneRequired = structuredClone(base);
  oneRequired.characters[1].optional = true;
  assert.match(normalizeStory(oneRequired).errors.join(' '), /At least two characters must remain required/);
});

test('the built-in story remains valid at small and large supported party sizes', () => {
  for (const count of [3, 4, 12]) {
    const guests = Array.from({ length: count }, (_, index) => ({ name: `Guest ${index + 1}`, desc: '' }));
    const result = normalizeStory(buildSampleStory(guests));
    assert.ok(result.story, `${count} guests: ${result.errors.join('; ')}`);
  }
});
