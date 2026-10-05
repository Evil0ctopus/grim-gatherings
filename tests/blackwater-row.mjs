import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { adaptStoryForPlayers, getPlayerRange, readStoryLibrary, upsertStory } from '../js/library.js';
import { buildView, normalizeStory } from '../js/story.js';

const entry = STARTER_MYSTERIES.find(mystery => mystery.id === 'blackwater-row');
const guests = Array.from({ length: 4 }, (_, index) => ({ name: `Guest ${index + 1}`, desc: '' }));
const storyFor = () => normalizeStory(adaptStoryForPlayers(entry.story, guests)).story;
const spoilers = /Benjamin|Barker|Aldric|Thorne|Mayor|imprison|wife|false testimony|barber's license/i;

test('Melissa\'s story is a required four-player edition with the original five victims and blade breadcrumbs', () => {
  assert.ok(entry);
  assert.deepEqual(getPlayerRange(entry.story), { minPlayers: 4, maxPlayers: 4 });
  const story = storyFor();
  assert.equal(story.discloseKiller, false);
  assert.deepEqual(story.characters.map(c => [c.id, c.name, c.role]), [
    ['xander', 'Xander Hale', 'Woodworker'],
    ['marla', 'Marla Quinn', 'Baker\'s assistant'],
    ['jasper', 'Jasper Crowe', 'Tavern musician'],
    ['lydia', 'Lydia Vance', 'Schoolteacher'],
  ]);
  const victims = ['Elias Brim', 'Ronan Pike', 'Harper Wren', 'Tobias Wick', 'Mayor Aldric Thorne'];
  story.rounds.forEach((round, index) => {
    assert.ok(round.narration.includes(victims[index]));
    assert.match(round.narration, /throat slashed/);
    assert.ok(round.publicText && round.hostNotes);
  });
  assert.match(story.rounds[3].narration, /oil.*perfect circle/);
  assert.match(story.characters[3].rounds[1].readAloud.text, /sharpening stones.*too fine for woodworking/);
  assert.match(story.characters[3].rounds[2].readAloud.text, /blades in another trade/);
  assert.match(story.characters[3].rounds[3].readAloud.text, /straight razor.*chipped ivory/);
});

test('all twenty clues preserve the authored circle and reference only another player', () => {
  const story = storyFor();
  const targets = ['marla', 'jasper', 'lydia', 'xander'];
  story.characters.forEach((character, index) => {
    assert.equal(character.optional, false);
    assert.equal(character.rounds.length, 5);
    character.rounds.forEach(({ readAloud }) => {
      assert.equal(readAloud.accuses, targets[index]);
      const references = [...readAloud.text.matchAll(/\{([a-z]+)\}/g)].map(match => match[1]);
      assert.deepEqual(references, [targets[index]]);
      assert.doesNotMatch(readAloud.text, /\bI\b|\bmy\b|\byour\b/);
    });
  });
});

test('identity and Mayor connection stay absent from every released view until Round 5, including restore and rewind', () => {
  for (const discloseKiller of [false, true]) {
    const story = storyFor();
    story.discloseKiller = discloseKiller;
    const state = { story, claims: {}, votes: {}, roundVotes: {}, phase: 'lobby', roundIndex: -1 };
    for (const id of [null, ...story.characters.map(c => c.id)]) {
      assert.doesNotMatch(JSON.stringify(buildView(state, id)), spoilers);
      for (let ri = 0; ri < 4; ri++) {
        for (const phase of ['round', 'vote']) {
          state.phase = phase;
          state.roundIndex = ri;
          const restored = JSON.parse(JSON.stringify(state));
          assert.doesNotMatch(JSON.stringify(buildView(restored, id)), spoilers);
          assert.equal(buildView(restored, id).reveal, undefined);
        }
      }
      state.phase = 'round';
      state.roundIndex = 4;
      const finalRound = buildView(state, id);
      assert.match(finalRound.currentRound.narration, /BENJAMIN BARKER/);
      assert.match(finalRound.currentRound.narration, /signed by Thorne/);
      assert.equal(finalRound.reveal, undefined);
      state.phase = 'vote';
      assert.equal(buildView(state, id).evidenceHistory.length, 5);
      state.roundIndex = 3;
      assert.doesNotMatch(JSON.stringify(buildView(state, id)), spoilers);
      state.phase = 'lobby';
      state.roundIndex = -1;
    }
  }
});

test('the final public court file supplies identity, motive, all accomplices and weapon evidence before the reveal', () => {
  const story = storyFor();
  const final = story.rounds[4].narration;
  for (const proof of [
    /Elias signed a false delivery entry/,
    /Ronan signed a fabricated account of a confession/,
    /Harper altered a household record/,
    /Tobias supplied a false night-route sighting/,
    /letter from Thorne.*wanted Barker's wife/,
    /under coercion, not by free choice/,
    /occupation is barber/,
    /likeness.*Xander Hale.*workshop address/,
    /chipped ivory handle.*tool inventory/,
  ]) assert.match(final, proof);
  const state = { story, claims: {}, votes: {}, phase: 'vote', roundIndex: 4 };
  assert.equal(buildView(state, 'xander').reveal, undefined);
  state.phase = 'reveal';
  const reveal = buildView(state, 'xander').reveal;
  assert.equal(reveal.killerId, 'xander');
  assert.match(reveal.explanation, /Xander Hale is Benjamin Barker/);
  assert.match(reveal.revealNarration, /I chose revenge, and I killed them/);
});

test('saving, exporting and importing retain the exact cast, clue scripts and spoiler locks', () => {
  const original = JSON.stringify(entry.story);
  const story = storyFor();
  const saved = upsertStory([], story, 'melissa', 100);
  const restored = readStoryLibrary(JSON.stringify(saved.entries))[0].story;
  const imported = normalizeStory(JSON.stringify(restored));
  assert.deepEqual(imported.errors, []);
  assert.deepEqual(imported.warnings, []);
  assert.deepEqual(imported.story.rounds, story.rounds);
  assert.deepEqual(imported.story.solution, story.solution);
  assert.ok(imported.story.characters.every(c => c.guest === '' && c.guestNote === ''));
  for (const count of [3, 5]) {
    const roster = Array.from({ length: count }, (_, i) => ({ name: `Guest ${i}`, desc: '' }));
    assert.throws(() => adaptStoryForPlayers(entry.story, roster), /works for/);
    assert.throws(() => adaptStoryForPlayers(imported.story, roster), /saved edition works for 4 players/);
  }
  assert.equal(JSON.stringify(entry.story), original);
});
