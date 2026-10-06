import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { adaptStoryForPlayers, getPlayerRange, upsertStory } from '../js/library.js';
import { buildView, normalizeStory } from '../js/story.js';
import { buildSampleStory, SAMPLE_INFO } from '../js/sample.js';
import ravenmoorEditions from '../js/editions/sample.js';

const ranges = {
  'mercy-hollow': { minPlayers: 3, maxPlayers: 8 },
  'blackthorn-farm': { minPlayers: 3, maxPlayers: 9 },
  'briar-house': { minPlayers: 3, maxPlayers: 10 },
  'blackwater-row': { minPlayers: 4, maxPlayers: 4 },
};
const coreEvidence = {
  'mercy-hollow': [
    ['midwife', 'intact brass chain'],
    ['minister', 'missing star'],
    ['witness', 'leave holding a packet'],
  ],
  'blackthorn-farm': [
    ['heir', 'confront {surveyor}'],
    ['housekeeper', 'survey coat'],
    ['mechanic', 'recovered button'],
  ],
  'briar-house': [
    ['daughter', 'appointment note'],
    ['housekeeper', 'no other person enter'],
    ['secretary', 'carbon copy records transfers'],
  ],
  'blackwater-row': [
    ['xander', 'Benjamin Barker'],
    ['lydia', 'document'],
    ['marla', 'Mayor'],
    ['jasper', 'rumors'],
  ],
};
const guestsFor = count => Array.from({ length: count }, (_, i) => ({ name: `Player ${i + 1}`, desc: `Description ${i + 1}` }));

test('Ravenmoor exposes content and safe hosting notes without a fourth-wall photo reference', () => {
  assert.match(SAMPLE_INFO.contentNote, /Poisoning, an off-screen death and a staged séance/);
  const story = buildSampleStory(guestsFor(3));
  assert.match(story.setting, /Content notes: poisoning, an off-screen death and a staged séance/);
  assert.match(story.rounds[0].hostNotes, /battery-powered candle; do not blow out an open flame/);
  const editions = Object.values(ravenmoorEditions);
  assert.ok(editions.some(edition => edition.characters.some(character => character.id === 'pell')));
  for (const edition of editions) {
    const herbalist = edition.characters.find(character => character.id === 'pell');
    if (herbalist) assert.equal(herbalist.name, 'Mother Agnes Morley');
    assert.ok(!edition.rounds.some(round => /photograph needed to solve this edition/i.test(round.narration)));
  }
  assert.ok(editions.some(edition => edition.characters.some(character => character.id === 'finch')
    && edition.rounds.some(round => round.narration.includes('Finch develops the photograph'))));
});

test('the starter catalog contains four distinct, complete fictional mysteries', () => {
  assert.equal(STARTER_MYSTERIES.length, 4);
  assert.equal(new Set(STARTER_MYSTERIES.map(entry => entry.id)).size, 4);
  assert.equal(new Set(STARTER_MYSTERIES.map(entry => entry.title)).size, 4);
  for (const entry of STARTER_MYSTERIES) {
    assert.equal(entry.title, entry.story.title);
    assert.ok(entry.blurb && entry.inspiration && entry.contentNote);
    assert.deepEqual(getPlayerRange(entry.story), ranges[entry.id]);
    const normalized = normalizeStory(entry.story);
    assert.deepEqual(normalized.errors, []);
    assert.deepEqual(normalized.warnings, []);
    assert.equal(new Set(entry.story.characters.map(c => c.id)).size, entry.story.characters.length);
    assert.equal(entry.story.rounds.length, 5);
    assert.ok(entry.story.intro && entry.story.finale.narration && entry.story.finale.votePrompt);
    assert.ok(entry.story.solution.explanation && entry.story.solution.revealNarration);
    for (const round of entry.story.rounds) {
      assert.ok(round.narration && round.publicText && round.hostNotes);
    }
    for (const character of entry.story.characters) {
      assert.ok(character.name && character.role && character.publicBlurb);
      assert.equal(character.secrets, undefined);
      assert.equal(character.rounds.length, 5);
      for (const round of character.rounds) {
        assert.ok(round.clues === undefined && round.readAloud.accuses && round.readAloud.text);
        assert.equal(round.instructions, undefined);
      }
    }
    const killer = entry.story.characters.find(c => c.id === entry.story.solution.killerId);
    assert.ok(killer && !killer.optional);
    assert.equal(killer.backstory, undefined);
  }
});

test('Mercy Hollow varies clue introductions and keeps every accusation directed at another guest', () => {
  const story = STARTER_MYSTERIES.find(entry => entry.id === 'mercy-hollow').story;
  for (const [count, edition] of Object.entries(story.editions)) {
    const characterIds = new Set(edition.characters.map(character => character.id));
    edition.rounds.forEach((round, roundIndex) => {
      const clues = edition.characters.map(character => character.rounds[roundIndex].readAloud);
      edition.characters.forEach((character, index) => {
        const clue = clues[index];
        assert.ok(characterIds.has(clue.accuses));
        assert.notEqual(clue.accuses, character.id);
      });
      const introductions = clues.map(clue => clue.text.match(/^[\s\S]*?(?:: |\. )/)?.[0]);
      assert.ok(new Set(introductions).size > 1, `Openers repeat in ${count}-player round ${roundIndex + 1}`);
    });
  }
});

test('Blackthorn timeline and four-player read-aloud assignments stay consistent', () => {
  const editions = STARTER_MYSTERIES.find(entry => entry.id === 'blackthorn-farm').story.editions;
  for (const [count, edition] of Object.entries(editions)) {
    assert.match(edition.rounds[0].narration, /Otto carried the map in intact; it was torn before his body was found/);
  }
  assert.match(editions[3].rounds[0].narration, /The host reads Emil's written discovery and stair-repair account aloud/);
  const roundFourReaders = editions[4].rounds[3].narration
    .split('Does the stranger story')[0]
    .match(/\{(housekeeper|heir|mechanic|surveyor)\} (?:compares|reads|returns)[^.]*\./g);
  assert.deepEqual(roundFourReaders.map(reader => reader.match(/\{([^}]+)\}/)[1]), ['housekeeper', 'heir', 'mechanic']);
});

test('Briar House gives the fourth-round duplicate comparison to the secretary in its four-player edition', () => {
  const edition = STARTER_MYSTERIES.find(entry => entry.id === 'briar-house').story.editions[4];
  const readers = edition.rounds[3].narration
    .split('What independently checks')[0]
    .match(/\{(daughter|secretary|solicitor|housekeeper)\} (?:reads|returns|compares)[^.]*\./g);
  assert.deepEqual(readers.map(reader => reader.match(/\{([^}]+)\}/)[1]), ['daughter', 'housekeeper', 'secretary']);
});

test('Blackwater Row reveals Benjamin Barker only in the fifth-round scene', () => {
  const edition = STARTER_MYSTERIES.find(entry => entry.id === 'blackwater-row').story;
  assert.match(edition.rounds[4].narration, /BENJAMIN BARKER/);
  assert.doesNotMatch(edition.rounds.slice(0, 4).map(round => round.narration).join('\n'), /Benjamin Barker/i);
  for (const character of edition.characters) {
    for (const round of character.rounds) assert.notEqual(round.readAloud.accuses, character.id);
  }
});

for (const entry of STARTER_MYSTERIES) {
  const { minPlayers, maxPlayers } = ranges[entry.id];
  for (let count = minPlayers; count <= maxPlayers; count++) {
    test(`${entry.title} adapts and keeps solving evidence for ${count} players`, () => {
      const before = JSON.stringify(entry.story);
      const guests = guestsFor(count);
      const adapted = adaptStoryForPlayers(entry.story, guests, [...guests].reverse());
      const result = normalizeStory(adapted);
      assert.deepEqual(result.errors, []);
      assert.deepEqual(result.warnings, []);
      assert.equal(result.story.characters.length, count);
      assert.deepEqual(result.story.characters.map(c => c.guest), guests.map(g => g.name).reverse());
      assert.deepEqual(result.story.characters.map(c => c.guestNote), guests.map(g => g.desc).reverse());
      assert.equal(result.story.characters.filter(c => !c.optional).length, count);
      assert.equal(result.story.edition.playerCount, count);
      assert.equal(result.story.editions, undefined);
      assert.ok(result.story.characters.some(c => c.id === result.story.solution.killerId && !c.optional));
      for (const [id] of coreEvidence[entry.id]) {
        const character = result.story.characters.find(c => c.id === id);
        if (character) {
          assert.equal(character.optional, false);
          assert.ok(character.rounds[4].readAloud.text);
        } else {
          assert.equal(count, 3);
          assert.match(result.story.rounds[0].narration, /not a guest in this edition/);
        }
      }
      const validIds = new Set([...result.story.characters.map(c => c.id), 'victim']);
      for (const match of JSON.stringify(result.story).matchAll(/\{([A-Za-z0-9_-]+)\}/g)) {
        assert.ok(validIds.has(match[1]), `Unresolved character reference: ${match[1]}`);
      }
      assert.equal(JSON.stringify(entry.story), before, 'Selecting a party size must not change the built-in template');
    });
  }

  test(`${entry.title} rejects unsupported counts without changing its template`, () => {
    const before = JSON.stringify(entry.story);
    assert.throws(() => adaptStoryForPlayers(entry.story, guestsFor(minPlayers - 1)), /works for/);
    assert.throws(() => adaptStoryForPlayers(entry.story, guestsFor(maxPlayers + 1)), /works for/);
    assert.equal(JSON.stringify(entry.story), before);
  });

  test(`${entry.title} sends only public character information and released evidence`, () => {
    const story = normalizeStory(adaptStoryForPlayers(entry.story, guestsFor(maxPlayers))).story;
    const state = { room: 'TEST', story, claims: {}, votes: {}, phase: 'lobby', roundIndex: -1 };
    assert.equal(buildView(state, null).packet, undefined);
    for (const character of story.characters) {
      for (const roundIndex of [-1, 0, 1, 2, 3, 4]) {
        state.phase = roundIndex === -1 ? 'lobby' : 'round';
        state.roundIndex = roundIndex;
        const view = buildView(state, character.id);
        assert.equal(view.me, character.id);
        assert.equal(view.packet.backstory, undefined);
        assert.equal(view.packet.secrets, undefined);
        assert.equal(view.packet.rounds.length, roundIndex + 1);
        assert.equal(view.packet.isKiller, undefined);
        assert.equal(view.reveal, undefined);
        const raw = JSON.stringify(view);
        assert.ok(!raw.includes(story.solution.explanation));
        if (roundIndex < 4) {
          for (const future of character.rounds.slice(roundIndex + 1)) {
            assert.ok(!raw.includes(future.readAloud.text), 'Future clue released early');
          }
        }
      }
    }
    state.phase = 'reveal';
    assert.equal(buildView(state, story.characters[0].id).reveal.explanation, story.solution.explanation);
  });

  test(`${entry.title} can be edited and saved without overwriting the starter`, () => {
    const before = JSON.stringify(entry.story);
    const adapted = adaptStoryForPlayers(entry.story, guestsFor(maxPlayers));
    adapted.title += ': Our Version';
    adapted.intro = 'Our custom opening.';
    const saved = upsertStory([], adapted, `test-${entry.id}`, 100);
    assert.equal(saved.record.title, adapted.title);
    assert.equal(saved.record.story.intro, 'Our custom opening.');
    assert.ok(saved.record.story.characters.every(c => c.guest === '' && c.guestNote === ''));
    assert.deepEqual(getPlayerRange(saved.record.story), { minPlayers: maxPlayers, maxPlayers });
    assert.throws(() => adaptStoryForPlayers(saved.record.story, guestsFor(maxPlayers - 1)), /saved edition works for/);
    assert.equal(JSON.stringify(entry.story), before);
  });
}
