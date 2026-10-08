import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { accusationChain, coverageChains, coverageSchedule } from '../js/accusations.js';
import { normalizeStory, buildView, makeFill } from '../js/story.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { buildSampleStory } from '../js/sample.js';
import { adaptStoryForPlayers, getPlayerRange } from '../js/library.js';

const guests = n => Array.from({ length: n }, (_, i) => ({ name: `Guest ${i + 1}`, desc: '' }));
const example = JSON.parse(fs.readFileSync(new URL('../examples/example-story.json', import.meta.url), 'utf8'));
const stories = [
  ...STARTER_MYSTERIES.map(entry => entry.story),
  buildSampleStory(guests(5)),
  example,
];
const evidenceAgainst = (story, id, ri) => story.characters.find(c => c.rounds[ri].readAloud.accuses === id).rounds[ri].readAloud.text;

test('every player count gets per-round derangements with exact reader-target coverage in N-1 rounds', () => {
  for (let count = 3; count <= 23; count++) {
    const cast = Array.from({ length: count }, (_, i) => ({ id: `c${i + 1}` }));
    const ids = cast.map(c => c.id);
    const schedule = coverageSchedule(cast);
    const pairs = new Set();
    assert.equal(schedule.length, count - 1, `${count} players`);
    for (const { order, targets } of schedule) {
      assert.deepEqual([...order].sort(), [...ids].sort(), 'every player reads exactly once');
      assert.deepEqual(Object.values(targets).sort(), [...ids].sort(), 'every player is targeted exactly once per round');
      for (const [reader, target] of Object.entries(targets)) {
        assert.notEqual(reader, target);
        assert.ok(!pairs.has(`${reader}>${target}`), `${count} players repeat ${reader}>${target}`);
        pairs.add(`${reader}>${target}`);
      }
    }
    assert.equal(pairs.size, count * (count - 1));
    assert.equal(coverageChains(cast).length, count - 1);
  }
  assert.deepEqual(coverageChains([{ id: 'a' }, { id: 'b' }]), [['a', 'b']]);
});

test('all playable stories declare one fixed count and contain valid complete chains and coverage', () => {
  for (const story of stories) {
    const result = normalizeStory(story);
    assert.deepEqual(result.errors, [], story.title);
    assert.equal(story.fixedPlayerCount, story.characters.length);
    const pairs = new Set();
    for (let ri = 0; ri < story.rounds.length; ri++) {
      const chain = accusationChain(story, ri);
      assert.deepEqual(story.rounds[ri].chain, chain, `${story.title}, round ${ri + 1}`);
      assert.equal(chain.length, story.characters.length);
      assert.equal(new Set(chain).size, story.characters.length);
      for (const character of story.characters) {
        const target = character.rounds[ri].readAloud.accuses;
        const pair = `${character.id}\0${target}`;
        if (ri < story.fixedPlayerCount - 1) assert.ok(!pairs.has(pair), `${story.title} repeats a pair before coverage`);
        else if (pairs.has(pair)) assert.equal(story.rounds[ri].coverageRepeat, true);
        pairs.add(pair);
      }
      if (ri < story.fixedPlayerCount - 1) assert.equal(story.rounds[ri].coverageRepeat, false);
    }
    assert.equal(pairs.size, story.fixedPlayerCount * (story.fixedPlayerCount - 1));
  }
});

test('built-in chapters and clues remain substantial and evidence continues to evolve', () => {
  for (const story of stories) {
    assert.equal(story.rounds.length, 5);
    story.rounds.forEach((round, index) => {
      assert.match(round.title, new RegExp(`Round ${index + 1}`));
      assert.ok(round.narration.length > 150);
      assert.ok(round.publicText && round.hostNotes);
    });
    for (const character of story.characters) {
      const texts = story.rounds.map((_, ri) => evidenceAgainst(story, character.id, ri));
      assert.equal(new Set(texts).size, 5, `Repeated evidence against ${character.name}`);
      for (const text of texts) assert.ok(text.length > 80);
    }
  }
});

test('a clue is released only to its scheduled reader until the chain completes', () => {
  for (const raw of stories) {
    const story = normalizeStory(raw).story;
    const chain = story.rounds[0].chain;
    for (const character of story.characters) {
      const state = { story, claims: {}, votes: {}, phase: 'round', roundIndex: 0, chainIndex: 0 };
      let view = buildView(state, character.id);
      assert.equal(view.currentRound.currentReaderId, chain[0]);
      assert.equal(view.packet.rounds.length, chain[0] === character.id ? 1 : 0);
      state.chainIndex = chain.indexOf(character.id);
      view = buildView(state, character.id);
      assert.equal(view.packet.rounds.length, 1);
      assert.equal(view.packet.rounds[0].readAloud.accuses, character.rounds[0].readAloud.accuses);
    }
    const completed = { story, claims: {}, votes: {}, phase: 'round', roundIndex: 0, chainIndex: chain.length };
    for (const character of story.characters) assert.equal(buildView(completed, character.id).packet.rounds.length, 1);
  }
});

test('each round has a distinct deliberation and vote phase, then the final accusation precedes the reveal', () => {
  const story = normalizeStory(example).story;
  for (let roundIndex = 0; roundIndex < story.rounds.length; roundIndex++) {
    const state = { story, claims: {}, votes: {}, phase: 'deliberation', roundIndex, chainIndex: story.characters.length };
    for (const character of story.characters) {
      const view = buildView(state, character.id);
      assert.equal(view.evidenceHistory.length, roundIndex + 1);
      assert.equal(view.packet.rounds.length, roundIndex + 1);
      assert.equal(view.deliberation.prompt, story.finale.votePrompt);
      assert.equal(view.deliberation.finalNarration, roundIndex === story.rounds.length - 1 ? story.finale.narration : '');
      assert.equal(view.vote, undefined);
      state.phase = 'vote';
      assert.equal(buildView(state, character.id).vote.open, true);
      state.phase = 'deliberation';
    }
  }
  const finalState = { story, claims: {}, votes: {}, phase: 'reveal', roundIndex: story.rounds.length - 1 };
  assert.ok(buildView(finalState, null).reveal.killerName);
});

test('ghost parts are opt-in, follow the declared first ghost round and remain in the clue chain', () => {
  const storyInput = structuredClone(example);
  storyInput.characters[0].ghost = { fromRound: 3, parts: ['', '', 'A bell rings beneath the stairs.', 'The tide turns against the missing key.', 'The lamp answers with one final flash.'] };
  const { story, errors } = normalizeStory(storyInput);
  assert.deepEqual(errors, []);
  const state = { story, claims: {}, votes: {}, phase: 'round', roundIndex: 2, chainIndex: story.rounds[2].chain.indexOf(story.characters[0].id) };
  const view = buildView(state, story.characters[0].id);
  assert.equal(view.roster.find(c => c.id === story.characters[0].id).isGhost, true);
  assert.equal(view.packet.rounds[2].readAloud.isGhost, true);
  assert.equal(view.packet.rounds[2].readAloud.ghostPart, story.characters[0].ghost.parts[2]);

  storyInput.characters[0].ghost.parts[4] = '';
  assert.match(normalizeStory(storyInput).errors.join(' '), /plot-advancing ghost part/);
  const ordinary = normalizeStory(example).story;
  assert.ok(ordinary.characters.every(character => character.ghost === null));
});

test('count-specific stories cannot be adapted by omitting or adding characters', () => {
  for (const story of stories) {
    const count = story.fixedPlayerCount;
    const template = structuredClone(story);
    const { minPlayers, maxPlayers } = getPlayerRange(template);
    assert.equal(minPlayers, count);
    assert.equal(maxPlayers, count);
    const adapted = adaptStoryForPlayers(template, guests(count));
    assert.equal(adapted.fixedPlayerCount, count);
    assert.equal(adapted.characters.length, count);
    assert.deepEqual(adapted.characters.map(character => character.guest).sort(), guests(count).map(guest => guest.name).sort());
    assert.throws(() => adaptStoryForPlayers(template, guests(count + 1)), /exactly/);
  }
});

test('invalid counts, incomplete chains, early repeats and unflagged repeats are rejected', () => {
  const unexplained = structuredClone(example);
  unexplained.coverageRepeatNote = '';
  assert.match(normalizeStory(unexplained).errors.join(' '), /explain why this story requires it in "coverageRepeatNote"/);

  const brokenChain = structuredClone(example);
  brokenChain.rounds[0].chain = ['wick', 'nell', 'doc'];
  assert.match(normalizeStory(brokenChain).errors.join(' '), /precomputed chain does not match/);

  const earlyRepeat = structuredClone(example);
  earlyRepeat.characters[0].rounds[1].readAloud.accuses = earlyRepeat.characters[0].rounds[0].readAloud.accuses;
  earlyRepeat.rounds[1].chain = [];
  assert.match(normalizeStory(earlyRepeat).errors.join(' '), /repeats before the coverage matrix is complete/);

  const unflagged = structuredClone(example);
  unflagged.rounds[2].coverageRepeat = false;
  assert.match(normalizeStory(unflagged).errors.join(' '), /must be explicitly flagged/);

  const mismatch = structuredClone(example);
  mismatch.fixedPlayerCount = 5;
  assert.match(normalizeStory(mismatch).errors.join(' '), /declares 5 players but contains 3 character cards/);
});

test('evidence history is released at deliberation, preserves per-target evidence and hides future clues', () => {
  for (const raw of stories) {
    const story = normalizeStory(raw).story;
    const fill = makeFill(story);
    for (const character of story.characters) {
      const state = { story, claims: {}, votes: {}, phase: 'lobby', roundIndex: -1, chainIndex: 0 };
      assert.deepEqual(buildView(state, character.id).evidenceHistory, []);
      for (let ri = 0; ri < story.rounds.length; ri++) {
        state.phase = 'round';
        state.roundIndex = ri;
        const duringRound = buildView(state, character.id);
        assert.equal(duringRound.evidenceHistory.length, ri);
        state.phase = 'deliberation';
        const afterRound = buildView(state, character.id);
        assert.equal(afterRound.evidenceHistory.length, ri + 1);
        for (const chapter of afterRound.evidenceHistory) {
          const aboutMe = chapter.accusations.filter(clue => clue.accuses === character.id);
          assert.equal(aboutMe.length, 1);
          assert.equal(aboutMe[0].text, fill(evidenceAgainst(story, character.id, chapter.index)));
          for (const clue of chapter.accusations) {
            assert.deepEqual(Object.keys(clue).sort(), ['accuses', 'speakerId', 'speakerName', 'targetName', 'text']);
          }
        }
      }
    }
  }
});
