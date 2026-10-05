import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { adaptStoryForPlayers, getPlayerRange, readStoryLibrary, upsertStory } from '../js/library.js';
import { buildView, normalizeStory } from '../js/story.js';

const entry = STARTER_MYSTERIES.find(mystery => mystery.id === 'blackwater-row');
const guests = Array.from({ length: 4 }, (_, index) => ({ name: `Guest ${index + 1}`, desc: '' }));
const storyFor = () => normalizeStory(adaptStoryForPlayers(entry.story, guests)).story;
const spoilers = /Benjamin|Barker|Aldric|Thorne|Mayor|imprison|wife|false testimony|barber's license/i;
const evidence = (story, id, round) => story.characters.find(c => c.rounds[round].readAloud.accuses === id).rounds[round].readAloud.text;

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
  assert.equal(story.edition.revision, 2);
  assert.match(evidence(story, 'xander', 1), /sharpening stones.*too fine for woodworking/);
  assert.match(evidence(story, 'xander', 2), /blades in another trade/);
  assert.match(evidence(story, 'xander', 3), /straight razor.*chip/);
});

test('all twenty clues rotate targets every round and each reader covers everyone else by Round 3', () => {
  const story = storyFor();
  assert.equal(story.clueRouting, 'rotating');
  const ids = story.characters.map(c => c.id);
  story.characters.forEach((character, index) => {
    assert.equal(character.optional, false);
    assert.equal(character.rounds.length, 5);
    character.rounds.forEach(({ readAloud }, round) => {
      const target = ids[(index + round % 3 + 1) % 4];
      assert.equal(readAloud.accuses, target);
      if (round) assert.notEqual(readAloud.accuses, character.rounds[round - 1].readAloud.accuses);
      const references = [...readAloud.text.matchAll(/\{([a-z]+)\}/g)].map(match => match[1]);
      assert.deepEqual(references, [target]);
      const account = readAloud.text.replace(/"[^"]*"/g, '');
      assert.doesNotMatch(account, /\bI\b|\bmy\b|\byour\b/, 'The reader must not claim to be the witness; attributed dialogue is allowed');
    });
    assert.deepEqual(new Set(character.rounds.slice(0, 3).map(r => r.readAloud.accuses)), new Set(ids.filter(id => id !== character.id)));
  });
  story.rounds.forEach((_, round) => {
    assert.deepEqual(new Set(story.characters.map(c => c.rounds[round].readAloud.accuses)), new Set(ids));
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
  ]) assert.match(final, proof);
  const identification = evidence(story, 'xander', 4);
  assert.match(identification, /likeness.*\{xander\}.*workshop address/);
  assert.match(identification, /tool inventory.*chip.*Nell Reed/);
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
  assert.equal(imported.story.clueRouting, 'rotating');
});

test('every clue names a source, a concrete identifying detail and the limit of the observation', () => {
  const story = storyFor();
  for (const character of story.characters) {
    for (const { readAloud } of character.rounds) {
      assert.match(readAloud.text, /Nell Reed|Della March|Finn Moss|Ada Bell|Owen Bell|Edith Shaw/);
      assert.match(readAloud.text, /recognized|identify|identif|compares|checked/);
      assert.match(readAloud.text, /boot|case|folder|invoice|basket|cloth|sleeve|receipt|razor|diary|signature/);
      assert.ok(readAloud.text.length >= 300);
    }
  }
  assert.match(evidence(story, 'marla', 0), /right heel.*cobbler Della March.*collection yesterday/);
  assert.match(evidence(story, 'marla', 0), /Flour.*resembles.*does not date/);
  assert.match(evidence(story, 'jasper', 1), /amber rosin.*color alone/);
  assert.match(evidence(story, 'xander', 1), /amber shellac.*second possible source/);
  assert.match(evidence(story, 'marla', 3), /Elias initialed.*scrub.*not evidence/);
});

test('host narration never previews player-owned deductions or later chapter discoveries', () => {
  const story = storyFor();
  assert.doesNotMatch(story.intro, /death|murder|razor|receipt 47|barber|revenge/i);
  const forbiddenByRound = [
    /Ronan.*(?:found|died)|Harper.*(?:found|died)|Tobias|razor|whetstone|shellac|rosin|green lesson folder|Benjamin|Mayor|revenge/i,
    /Harper|Tobias|razor|whetstone|shellac|rosin|Benjamin|Mayor|revenge/i,
    /Tobias|straight razor|ivory|Benjamin|Mayor|revenge/i,
    /straight razor|ivory|Benjamin|Mayor|revenge/i,
  ];
  story.rounds.slice(0, 4).forEach((round, index) => {
    assert.doesNotMatch(round.narration, forbiddenByRound[index]);
    assert.doesNotMatch(round.publicText, forbiddenByRound[index]);
  });
  assert.doesNotMatch(story.rounds[4].narration, /\{xander\}.*(?:Barker|likeness)|Xander Hale|killer is|committed all five/i);
  assert.doesNotMatch(story.finale.votePrompt, /five|Mayor|Barker|revenge/i, 'The same vote prompt appears in early rounds');
  const stages = [
    [1, 'xander', /too fine for woodworking/],
    [2, 'xander', /blades in another trade/],
    [3, 'xander', /straight razor/],
    [4, 'xander', /licensed name is Benjamin Barker/],
  ];
  for (const [round, target, discovery] of stages) {
    assert.match(evidence(story, target, round), discovery);
    for (let prior = 0; prior < round; prior++) {
      for (const id of story.characters.map(c => c.id)) assert.doesNotMatch(evidence(story, id, prior), discovery);
    }
  }
});

test('rotating imports reject repeated targets, incomplete coverage and invalid routing modes', () => {
  const repeat = storyFor();
  repeat.characters.forEach(c => { c.rounds[1].readAloud = structuredClone(c.rounds[0].readAloud); });
  assert.match(normalizeStory(repeat).errors.join(' '), /change targets every round/);
  const partial = storyFor();
  partial.characters.forEach(c => { c.rounds[2].readAloud = structuredClone(c.rounds[0].readAloud); });
  assert.match(normalizeStory(partial).errors.join(' '), /before repeating/);
  const invalid = storyFor();
  invalid.clueRouting = 'anything';
  assert.match(normalizeStory(invalid).errors.join(' '), /"clueRouting"/);
});

test('custom rotating stories retain valid coverage when an optional supporting reader is omitted', () => {
  const custom = storyFor();
  delete custom.edition;
  custom.characters.find(c => c.id === 'jasper').optional = true;
  const adapted = adaptStoryForPlayers(custom, guests.slice(0, 3));
  assert.deepEqual(normalizeStory(adapted).errors, []);
  assert.equal(adapted.characters.length, 3);
  for (const character of adapted.characters) {
    assert.equal(new Set(character.rounds.map(r => r.readAloud.accuses)).size, 2);
  }
});

test('saved revision 1 circle assignments are preserved rather than upgraded to revision 2', () => {
  const legacy = storyFor();
  delete legacy.clueRouting;
  legacy.edition.revision = 1;
  const ids = legacy.characters.map(c => c.id);
  const accounts = Object.fromEntries(ids.map(id => [id, legacy.rounds.map((_, ri) => evidence(legacy, id, ri))]));
  legacy.characters.forEach((character, index) => {
    const target = ids[(index + 1) % ids.length];
    character.rounds.forEach((round, ri) => { round.readAloud = { accuses: target, text: accounts[target][ri] }; });
  });
  assert.deepEqual(normalizeStory(legacy).errors, []);
  const saved = upsertStory([], legacy, 'legacy-blackwater', 100);
  const restored = readStoryLibrary(JSON.stringify(saved.entries))[0].story;
  const resumed = normalizeStory(adaptStoryForPlayers(restored, guests));
  assert.deepEqual(resumed.errors, []);
  assert.equal(resumed.story.edition.revision, 1);
  assert.equal(resumed.story.clueRouting, undefined);
  assert.deepEqual(resumed.story.characters.map(c => c.rounds), legacy.characters.map(c => c.rounds));
  assert.equal(storyFor().edition.revision, 2);
});
