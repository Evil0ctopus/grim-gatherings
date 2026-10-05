import test from 'node:test';
import assert from 'node:assert/strict';
import { HOST_SAVE_KEY, isOutdatedStory, removeOutdatedSavedContent } from '../js/saved-content.js';
import { STORY_LIBRARY_KEY } from '../js/library.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { normalizeStory } from '../js/story.js';

const current = STARTER_MYSTERIES[0].story;
const old = { ...structuredClone(current), rounds: current.rounds.slice(0, 3) };
const store = entries => {
  const data = new Map(Object.entries(entries));
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  };
};

test('cleanup removes only obsolete library entries and an obsolete saved game, persistently', () => {
  const storage = store({
    [STORY_LIBRARY_KEY]: JSON.stringify([{ id: 'old', story: old }, { id: 'current', story: current }]),
    [HOST_SAVE_KEY]: JSON.stringify({ phase: 'round', story: old }),
    'gg-ai-settings': 'unchanged',
    'gg-player-TEST': 'unchanged',
  });
  assert.deepEqual(removeOutdatedSavedContent(storage), { removedStories: 1, removedGame: true });
  assert.equal(storage.getItem(HOST_SAVE_KEY), null);
  assert.deepEqual(JSON.parse(storage.getItem(STORY_LIBRARY_KEY)), [{ id: 'current', story: current }]);
  assert.equal(storage.getItem('gg-ai-settings'), 'unchanged');
  assert.equal(storage.getItem('gg-player-TEST'), 'unchanged');
  assert.deepEqual(removeOutdatedSavedContent(storage), { removedStories: 0, removedGame: false });
});

test('current games and current-format drafts including a sixth chapter are preserved', () => {
  const draft = structuredClone(current);
  draft.rounds.push({ title: 'Round 6', narration: '' });
  draft.characters.forEach(c => c.rounds.push({ clues: [], readAloud: { accuses: '', text: '' } }));
  for (const game of [{ phase: 'setup' }, { phase: 'round', story: current }, { phase: 'review', story: draft }]) {
    const raw = JSON.stringify(game);
    const storage = store({ [HOST_SAVE_KEY]: raw });
    assert.deepEqual(removeOutdatedSavedContent(storage), { removedStories: 0, removedGame: false });
    assert.equal(storage.getItem(HOST_SAVE_KEY), raw);
  }
});

test('old public-clue formats are obsolete even if they contain five rounds; old imports remain rejected', () => {
  const legacy = structuredClone(current);
  legacy.characters.forEach(c => c.rounds.forEach(r => delete r.readAloud));
  assert.equal(isOutdatedStory(legacy), true);
  assert.equal(isOutdatedStory(current), false);
  assert.equal(normalizeStory(old).story, null);
  assert.equal(normalizeStory(legacy).story, null);
});

test('unreadable storage reports an error without erasing data', () => {
  for (const entries of [
    { [STORY_LIBRARY_KEY]: '{', [HOST_SAVE_KEY]: JSON.stringify({ story: old }) },
    { [STORY_LIBRARY_KEY]: JSON.stringify([{ id: 'old', story: old }]), [HOST_SAVE_KEY]: '{' },
  ]) {
    const storage = store(entries);
    assert.throws(() => removeOutdatedSavedContent(storage), /could not be/);
    for (const [key, raw] of Object.entries(entries)) assert.equal(storage.getItem(key), raw);
  }
});

test('five-round version-1 saves and private-format saves cannot reappear after the public-only update', () => {
  const legacyVersion = { ...structuredClone(current), schemaVersion: 1 };
  const privateFormat = structuredClone(current);
  privateFormat.characters[0].rounds[0].clues = ['OLD PRIVATE INFORMATION'];
  const storage = store({
    [STORY_LIBRARY_KEY]: JSON.stringify([{ id: 'v1', story: legacyVersion }, { id: 'private', story: privateFormat }, { id: 'current', story: current }]),
    [HOST_SAVE_KEY]: JSON.stringify({ phase: 'round', story: privateFormat }),
  });
  assert.deepEqual(removeOutdatedSavedContent(storage), { removedStories: 2, removedGame: true });
  assert.deepEqual(JSON.parse(storage.getItem(STORY_LIBRARY_KEY)).map(entry => entry.id), ['current']);
  assert.equal(storage.getItem(HOST_SAVE_KEY), null);
});
