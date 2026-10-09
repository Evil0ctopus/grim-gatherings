import test from 'node:test';
import assert from 'node:assert/strict';
import editions from '../js/editions/lago-cabin.js';
import { buildLagoStory, reviewLagoEdition } from '../js/lago-catalog.js';
import { normalizeStory, buildView } from '../js/story.js';
import { accusationChain } from '../js/accusations.js';
import { isOutdatedStory } from '../js/saved-content.js';

const guests = count => Array.from({ length: count }, (_, i) => ({ name: `Player ${i + 1}`, desc: '' }));

test('all ten supplied editions retain nested casts, seven chapters, original clues and the locked reveal', () => {
  assert.deepEqual(Object.keys(editions).map(Number), [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  let clues = 0;
  for (const [count, story] of Object.entries(editions)) {
    assert.equal(story.fixedPlayerCount, Number(count));
    assert.equal(story.rounds.length, 7);
    assert.equal(story.characters.length, Number(count));
    assert.deepEqual(story.characters.map(c => c.id), editions[12].characters.slice(0, Number(count)).map(c => c.id));
    assert.deepEqual(story.solution, editions[3].solution);
    assert.match(story.solution.explanation, /Charles Jolly Jr/);
    assert.ok(story.solution.revealNarration);
    for (const character of story.characters) {
      assert.ok(character.role && character.relationship && character.tieIn && character.publicBlurb);
      assert.equal(character.rounds.length, 7);
      for (const round of character.rounds) {
        assert.ok(round.readAloud.sourceText);
        assert.notEqual(round.readAloud.accuses, character.id);
        assert.ok(round.readAloud.text.includes(`{${round.readAloud.accuses}}`));
        clues++;
      }
    }
  }
  assert.equal(clues, 525);
});

test('all editions preserve master clues, chapters and repeat eligibility, with an original-content repair record', () => {
  for (let count = 3; count <= 12; count++) {
    const story = editions[count];
    assert.deepEqual(reviewLagoEdition(count).errors, []);
    for (let ri = 0; ri < 7; ri++) {
      assert.equal(story.rounds[ri].narration, editions[3].rounds[ri].narration);
      assert.equal(story.rounds[ri].title, editions[3].rounds[ri].title);
      for (let ci = 0; ci < 3; ci++) assert.deepEqual(story.characters[ci].rounds[ri], editions[3].characters[ci].rounds[ri]);
    }
    if (count > 3) assert.ok(story.repairs.some(repair => /master clue/.test(repair.reason)));
    for (const repair of story.repairs) assert.ok(repair.original && repair.replacement && repair.reason);
  }
  assert.equal(editions[6].repairs.filter(repair => /remaining target/.test(repair.reason)).length, 3);
});

test('valid editions select by exact count and preserve player assignments and reveal secrecy through every round', () => {
  for (let count = 3; count <= 12; count++) {
    const players = guests(count);
    const result = normalizeStory(buildLagoStory(players, [...players].reverse()));
    assert.deepEqual(result.errors, []);
    const story = result.story;
    assert.equal(isOutdatedStory(story), false);
    assert.equal(story.characters[0].guest, players.at(-1).name);
    assert.deepEqual(normalizeStory(JSON.parse(JSON.stringify(story))).errors, []);
    story.rounds.forEach((round, ri) => {
      assert.deepEqual(round.chain, accusationChain(story, ri));
      const state = { room: 'TEST', story, phase: 'round', roundIndex: ri, chainIndex: 0, claims: {}, votes: {}, roundVotes: {} };
      for (let ci = 0; ci < count; ci++) {
        state.chainIndex = ci;
        const reader = round.chain[ci];
        for (const character of story.characters) {
          const view = buildView(state, character.id);
          assert.equal(view.packet.rounds.length, ri + Number(character.id === reader));
          assert.ok(!view.reveal);
          assert.ok(!('isKiller' in view.packet));
        }
      }
      state.phase = 'reveal';
      assert.equal(buildView(state, null).reveal.killerId, story.solution.killerId);
    });
  }
});

test('unsupported counts and damaged assignments fail explicitly', () => {
  for (const count of [0, 2, 13]) assert.throws(() => buildLagoStory(guests(count)), /exactly 3 through 12/);
  assert.throws(() => buildLagoStory(guests(5), guests(3)), /exactly one character assignment/);
  assert.throws(() => reviewLagoEdition('5'), /exactly 3 through 12/);
});

test('master groups do not waive malformed groups, early repeats, consecutive targets or invalid clues', () => {
  for (const mutate of [
    story => { story.rounds[0].readingGroups = [['charles-jolly-jr']]; },
    story => { story.rounds[0].readingGroups.push(['charles-jolly-jr']); },
    story => { story.characters[3].rounds[1].readAloud = structuredClone(story.characters[3].rounds[0].readAloud); },
    story => { story.characters[3].rounds[4].readAloud = structuredClone(story.characters[3].rounds[0].readAloud); },
    story => { story.characters[0].rounds[0].readAloud.accuses = story.characters[0].id; },
    story => { story.characters[0].rounds[0].readAloud.contradictingDetail = ''; },
    story => { story.rounds[2].coverageRepeat = false; },
    story => { story.rounds.pop(); },
    story => { story.edition.family = 'sample'; },
  ]) {
    const story = structuredClone(editions[6]);
    mutate(story);
    assert.equal(normalizeStory(story).story, null);
  }
});
