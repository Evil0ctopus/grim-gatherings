import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adaptWoodlandSource, validateWoodlandStory, buildWoodlandStory } from '../js/woodland-catalog.js';
import { normalizeStory, buildView, makeFill } from '../js/story.js';
import { adaptStoryForPlayers } from '../js/library.js';
import { isOutdatedStory } from '../js/saved-content.js';

const source = JSON.parse(readFileSync(new URL('../assets/stories/woodland-hollow.story.json', import.meta.url), 'utf8'));
const template = adaptWoodlandSource(source);
const guests = Array.from({ length: 14 }, (_, index) => ({ name: `Guest ${index + 1}`, desc: '' }));

test('author-final text and reading order survive runtime mapping unchanged', () => {
  assert.equal(template.intro, source.intro);
  assert.deepEqual(template.approvedExceptions, source.approvedExceptions);
  assert.equal(template.solution.revealNarration, source.ending.paragraphs.join('\n\n'));
  template.characters.forEach((character, index) => assert.equal(character.publicBlurb, source.characters[index].card));
  source.rounds.forEach((round, ri) => {
    assert.equal(template.rounds[ri].narration, round.narration);
    assert.deepEqual(template.rounds[ri].chain, round.readingGroups.flatMap(group => group.readers));
    for (const clue of [...round.clues, ...round.ghosts]) {
      const mapped = template.characters.find(character => character.id === clue.reader).rounds[ri].readAloud;
      assert.equal(mapped.text, clue.text);
      assert.equal(mapped.accuses, clue.accuses);
      assert.equal(mapped.selfReading, clue.selfReading === true);
    }
  });
});

test('fixed 14 seats, six chapters and saved-room normalization remain intact', () => {
  assert.throws(() => adaptStoryForPlayers(template, guests.slice(1)), /exactly 14/);
  const story = adaptStoryForPlayers(template, guests);
  assert.equal(new Set(story.characters.map(character => character.guest)).size, 14);
  assert.equal(isOutdatedStory(story), false);
  assert.deepEqual(normalizeStory(JSON.stringify(story)).story, story);
  assert.deepEqual(validateWoodlandStory(story), []);
  const broken = structuredClone(story);
  broken.rounds[0].chain.pop();
  assert.ok(normalizeStory(broken).errors.length);
  for (const corrupt of [
    { ...story, characters: { length: 14 } },
    { ...story, rounds: [null, ...story.rounds.slice(1)] },
    { ...story, solution: { ...story.solution, revealNarration: 123 } },
  ]) assert.ok(normalizeStory(corrupt).errors.length);
});

test('each phone gets its authored reading on its turn; ghosts keep playing without spoilers', () => {
  const story = adaptStoryForPlayers(template, guests);
  const fill = makeFill(story);
  for (let ri = 0; ri < 6; ri++) {
    const state = { story, room: 'WOODS', claims: {}, votes: {}, roundVotes: {}, phase: 'round', roundIndex: ri, chainIndex: 0 };
    const round = source.rounds[ri];
    story.rounds[ri].chain.forEach((id, ci) => {
      state.chainIndex = ci;
      for (const character of story.characters) {
        const view = buildView(state, character.id);
        const expectedGhost = round.ghosts.some(ghost => ghost.reader === character.id);
        assert.equal(view.roster.find(c => c.id === character.id).isGhost, expectedGhost);
        assert.equal(view.roster.length, 14);
        assert.equal(view.discussionOnly, true);
        assert.equal('reveal' in view, false);
        assert.equal('isKiller' in view.packet, false);
        assert.equal(view.packet.rounds.length, ri + Number(character.id === id));
        if (character.id === id) {
          const reading = [...round.clues, ...round.ghosts].find(clue => clue.reader === id);
          assert.equal(view.packet.rounds[ri].readAloud.text, fill(reading.text));
          assert.equal(view.packet.rounds[ri].readAloud.selfReading, expectedGhost);
          assert.doesNotMatch(view.packet.rounds[ri].readAloud.text, /\{[A-Za-z0-9_-]+\}/);
        }
      }
    });

  }
  for (const character of story.characters) {
    const view = buildView({ story, room: 'WOODS', claims: {}, votes: {}, roundVotes: {}, phase: 'reveal', roundIndex: 5 }, character.id);
    assert.deepEqual(view.reveal.killers.map(killer => killer.id), ['Keziah', 'Joan', 'Rebekah']);
    assert.equal(view.packet.isKiller, ['Keziah', 'Joan', 'Rebekah'].includes(character.id));
    assert.equal(view.reveal.revealNarration, fill(source.ending.paragraphs.join('\n\n')));
  }
});

test('catalog loader uses the bundled asset and reports loading or count errors explicitly', async t => {
  let requested;
  t.mock.method(globalThis, 'fetch', async url => {
    requested = url;
    return new Response(JSON.stringify(source), { headers: { 'Content-Type': 'application/json' } });
  });
  const story = await buildWoodlandStory(guests);
  assert.match(requested.href, /assets\/stories\/woodland-hollow.story.json$/);
  assert.equal(story.characters.length, 14);
  await assert.rejects(buildWoodlandStory(guests.slice(1)), /exactly 14/);
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  await assert.rejects(buildWoodlandStory(guests), /Could not load Woodland Hollow \(404\)/);
});
