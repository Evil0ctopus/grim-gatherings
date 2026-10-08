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

test('fixed editions keep one player count and reject every other attendance size', () => {
  const template = buildSampleStory(Array.from({ length: 5 }, (_, index) => ({ name: `Original ${index}` })));
  assert.deepEqual(getPlayerRange(template), { minPlayers: 5, maxPlayers: 5 });
  const selected = adaptStoryForPlayers(template, Array.from({ length: 5 }, (_, index) => ({ name: `Guest ${index}` })));
  assert.deepEqual(selected.characters.map(character => character.guest), ['Guest 0', 'Guest 1', 'Guest 2', 'Guest 3', 'Guest 4']);
  assert.ok(normalizeStory(selected).story);
  for (const count of [2, 3, 4, 6]) {
    assert.throws(() => adaptStoryForPlayers(template, Array.from({ length: count }, (_, i) => ({ name: `Player ${i}` }))),
      /written for exactly 5 players/);
  }
});

test('an edition cannot omit a character and rewrite story references to fit attendance', () => {
  const template = buildSampleStory(Array.from({ length: 5 }, (_, index) => ({ name: `Original ${index}` })));
  assert.throws(() => adaptStoryForPlayers(template, Array.from({ length: 4 }, (_, index) => ({ name: `Player ${index}` }))), /written for exactly 5 players/);
});

test('fixed editions reject optional characters', () => {
  const base = buildSampleStory(Array.from({ length: 5 }, (_, index) => ({ name: `Original ${index}` })));
  const optional = structuredClone(base);
  optional.characters[0].optional = true;
  assert.equal(normalizeStory(optional).story, null);
});

test('the built-in story remains valid at each separately authored player count', () => {
  for (const count of [5]) {
    const guests = Array.from({ length: count }, (_, index) => ({ name: `Guest ${index + 1}`, desc: '' }));
    const result = normalizeStory(buildSampleStory(guests));
    assert.ok(result.story, `${count} guests: ${result.errors.join('; ')}`);
  }
});
