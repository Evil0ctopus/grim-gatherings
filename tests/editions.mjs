import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sample from '../js/editions/sample.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { selectEdition } from '../js/edition-selection.js';
import { adaptStoryForPlayers, makeStoryTemplate, getPlayerRange } from '../js/library.js';
import { normalizeStory, buildView } from '../js/story.js';

const families = [{ id: 'sample', editions: sample }, ...STARTER_MYSTERIES.map(entry => ({ id: entry.id, editions: entry.story.editions }))];
const players = n => Array.from({ length: n }, (_, i) => ({ name: `Player ${i}`, desc: `Description ${i}` }));
const script = story => ({
  edition: story.edition, intro: story.intro, rounds: story.rounds, finale: story.finale, solution: story.solution,
  characters: story.characters.map(({ guest, guestNote, ...character }) => character),
});

for (const family of families) {
  test(`${family.id}: every count selects its committed script without changing events or clue assignments`, () => {
    const before = JSON.stringify(family.editions);
    const counts = Object.keys(family.editions).map(Number);
    assert.equal(counts.length, Math.max(...counts) - Math.min(...counts) + 1);
    const narrations = new Set();
    for (const count of counts) {
      const canonical = family.editions[count];
      assert.equal(canonical.characters.length, count);
      assert.equal(canonical.edition.family, family.id);
      assert.equal(canonical.edition.playerCount, count);
      assert.equal(canonical.editions, undefined);
      assert.deepEqual(normalizeStory(canonical).errors, []);
      const selected = selectEdition(family, players(count), players(count).reverse());
      assert.deepEqual(script(selected), script(canonical));
      assert.deepEqual(selected.characters.map(c => c.guest), players(count).reverse().map(g => g.name));
      assert.ok(selected.characters.every(c => c.optional === false));
      narrations.add(JSON.stringify(selected.rounds.map(r => r.narration)));
      for (const character of selected.characters) {
        selected.rounds.forEach((round, ri) => {
          assert.ok(round.narration.includes(`{${character.id}} leads the comparison`), `${character.name} needs an investigation handoff`);
          const clue = character.rounds[ri].readAloud;
          const reference = family.id === 'blackwater-row' ? clue.accuses : character.id;
          assert.ok(clue.text.includes(`{${reference}}`));
        });
      }
      const saved = makeStoryTemplate(normalizeStory(selected).story);
      assert.deepEqual(script(saved), script(canonical));
      assert.deepEqual(getPlayerRange(saved), { minPlayers: count, maxPlayers: count });
      assert.throws(() => adaptStoryForPlayers(saved, players(count + 1)), /saved edition works for/);
      const S = { story: saved, phase: 'round', roundIndex: 2, claims: {}, votes: {} };
      const beforeDisconnect = buildView(S, saved.characters[0].id);
      S.claims[saved.characters[1].id] = 'disconnected-token';
      assert.deepEqual(buildView(S, saved.characters[0].id).packet, beforeDisconnect.packet);
      selected.characters[0].rounds[0].readAloud.text = 'Host edit';
      assert.notEqual(canonical.characters[0].rounds[0].readAloud.text, 'Host edit');
    }
    assert.equal(narrations.size, counts.length, 'Every count needs its own written narration');
    assert.equal(JSON.stringify(family.editions), before);
    assert.throws(() => selectEdition(family, players(Math.min(...counts) - 1)), /works for/);
    assert.throws(() => selectEdition(family, players(Math.max(...counts) + 1)), /works for/);
  });
}

test('live entry modules never import the offline authoring or rebuild built-in circles', () => {
  for (const file of ['sample.js', 'starters.js', 'edition-selection.js']) {
    const source = fs.readFileSync(new URL(`../js/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /preparePublicEvidence|assignAccusationCircles|story-sources|author-editions/);
  }
});

test('edition metadata rejects a cast mismatch instead of silently selecting another version', () => {
  const bad = structuredClone(sample[4]);
  bad.edition.playerCount = 3;
  assert.equal(normalizeStory(bad).story, null);
  const optional = structuredClone(sample[4]);
  optional.characters[1].optional = true;
  assert.equal(normalizeStory(optional).story, null);
});
