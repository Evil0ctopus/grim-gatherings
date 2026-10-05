import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeStory, buildView } from '../js/story.js';
import { assignAccusationCircles, validateAccusationCircles } from '../js/accusations.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { buildSampleStory } from '../js/sample.js';
import { adaptStoryForPlayers, getPlayerRange, makeStoryTemplate } from '../js/library.js';
import { generateStory } from '../js/ai.js';

const guests = n => Array.from({ length: n }, (_, i) => ({ name: `Player ${i + 1}`, desc: '' }));
const example = JSON.parse(fs.readFileSync(new URL('../examples/example-story.json', import.meta.url), 'utf8'));

function checkCircle(story) {
  assert.deepEqual(validateAccusationCircles(story), []);
  for (let ri = 0; ri < story.rounds.length; ri++) {
    if (story.clueRouting === 'rotating') {
      const targets = story.characters.map(c => {
        const clue = c.rounds[ri].readAloud;
        assert.notEqual(clue.accuses, c.id);
        assert.ok(clue.text.includes(`{${clue.accuses}}`));
        return clue.accuses;
      });
      assert.equal(new Set(targets).size, story.characters.length);
      continue;
    }
    const texts = new Set();
    const incoming = new Set();
    const visited = new Set();
    let current = story.characters[0];
    for (let i = 0; i < story.characters.length; i++) {
      assert.ok(!visited.has(current.id), 'One circle must visit every player');
      visited.add(current.id);
      const clue = current.rounds[ri].readAloud;
      assert.notEqual(clue.accuses, current.id);
      assert.ok(clue.text.includes(`{${clue.accuses}}`), 'Evidence must explicitly identify its target');
      assert.ok(!incoming.has(clue.accuses));
      assert.ok(!texts.has(clue.text));
      incoming.add(clue.accuses); texts.add(clue.text);
      current = story.characters.find(c => c.id === clue.accuses);
      assert.ok(current);
    }
    assert.equal(current.id, story.characters[0].id);
    assert.equal(incoming.size, story.characters.length);
  }
}

test('every built-in cast size has one unique public accusation per player per round', () => {
  for (const entry of STARTER_MYSTERIES) {
    const { minPlayers, maxPlayers } = getPlayerRange(entry.story);
    for (let n = minPlayers; n <= maxPlayers; n++) {
      const result = normalizeStory(adaptStoryForPlayers(entry.story, guests(n)));
      assert.deepEqual(result.errors, []);
      checkCircle(result.story);
    }
  }
  for (let n = 3; n <= 24; n++) checkCircle(normalizeStory(buildSampleStory(guests(n))).story);
  checkCircle(normalizeStory(example).story);
});

test('circles change each round, retaining exactly one cycle even for composite cast sizes', () => {
  for (const n of [2, 3, 4, 6, 8, 9, 12]) {
    const story = {
      rounds: Array.from({ length: 4 }, () => ({})),
      characters: guests(n).map((g, i) => ({ id: `c${i}`, name: g.name, rounds: Array.from({ length: 4 }, () => ({})) })),
    };
    assignAccusationCircles(story, Object.fromEntries(story.characters.map(c => [c.id, story.rounds.map((_, ri) => `{${c.id}} evidence ${ri}`)])));
    checkCircle(story);
    if (n > 2) {
      for (const c of story.characters) {
        for (let ri = 1; ri < story.rounds.length; ri++) assert.notEqual(c.rounds[ri].readAloud.accuses, c.rounds[ri - 1].readAloud.accuses);
      }
    }
  }
});

test('validation rejects missing, self, unknown, duplicate and disjoint accusations', () => {
  const base = normalizeStory(adaptStoryForPlayers(STARTER_MYSTERIES[0].story, guests(4))).story;
  for (const [mutate, pattern] of [
    [s => delete s.characters[0].rounds[0].readAloud, /add a "readAloud"/],
    [s => s.characters[0].rounds[0].readAloud.text = ' ', /add a "readAloud"/],
    [s => s.characters[0].rounds[0].readAloud.accuses = s.characters[0].id, /cannot accuse themselves/],
    [s => s.characters[0].rounds[0].readAloud.accuses = 'absent', /must name a character id/],
    [s => s.characters[0].rounds[0].readAloud.accuses = s.characters[1].rounds[0].readAloud.accuses, /accused twice/],
    [s => s.characters[0].rounds[0].readAloud.text = s.characters[1].rounds[0].readAloud.text, /text must be unique/],
    [s => s.characters.forEach((c, i) => c.rounds[0].readAloud.accuses = s.characters[i ^ 1].id), /one complete circle/],
  ]) {
    const story = structuredClone(base);
    mutate(story);
    const result = normalizeStory(story);
    assert.equal(result.story, null);
    assert.match(result.errors.join(' '), pattern);
  }
});

test('exact edition selection preserves the authored target evidence without rebuilding the circle', () => {
  for (const entry of STARTER_MYSTERIES) {
    const story = adaptStoryForPlayers(entry.story, guests(4));
    const killer = story.solution.killerId;
    const original = entry.story.editions[4].characters.find(c => c.rounds[4].readAloud.accuses === killer).rounds[4].readAloud.text;
    const adapted = story.characters.find(c => c.rounds[4].readAloud.accuses === killer).rounds[4].readAloud.text;
    assert.equal(adapted, original);
    assert.ok(adapted.includes(`{${killer}}`));
    checkCircle(normalizeStory(makeStoryTemplate(story)).story);
  }
});

test('packets unlock only public clues without private evidence fields', () => {
  const story = normalizeStory(example).story;
  const state = { story, phase: 'lobby', roundIndex: -1, claims: {}, votes: {} };
  assert.equal(buildView(state, null).packet, undefined);
  assert.deepEqual(buildView(state, 'nell').packet.rounds, []);
  state.phase = 'round'; state.roundIndex = 0;
  const packet = buildView(state, 'nell').packet;
  assert.equal(packet.rounds.length, 1);
  assert.equal(packet.rounds[0].readAloud.accuses, 'wick');
  assert.equal(packet.rounds[0].readAloud.targetName, 'Jonah Wick (Mike)');
  assert.ok(!packet.rounds[0].readAloud.text.includes('{wick}'));
  assert.equal(packet.rounds[0].clues, undefined);
  assert.equal(packet.rounds[0].instructions, undefined);
  assert.ok(!JSON.stringify(packet).includes(story.characters[0].rounds[1].readAloud.text));
  state.phase = 'vote';
  assert.equal(buildView(state, 'nell').packet.rounds.length, 1);
  state.phase = 'reveal'; state.roundIndex = 4;
  assert.equal(buildView(state, 'nell').packet.rounds.length, 5);
});

test('old instructions never become public evidence or survive normalization', () => {
  const story = structuredClone(example);
  story.characters[0].rounds[0].instructions = 'Act shocked.';
  const result = normalizeStory(story);
  assert.ok(result.story);
  assert.equal(result.story.characters[0].rounds[0].instructions, undefined);
  assert.match(result.warnings.join(' '), /removed/);
  delete story.characters[0].rounds[0].readAloud;
  assert.equal(normalizeStory(story).story, null);
});

test('AI generation requests public-only event evidence and accusation circles', async t => {
  let request;
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    request = JSON.parse(options.body);
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(example) } }] }) };
  });
  const content = await generateStory({ base: 'https://example.invalid', model: 'test', key: 'test-only' }, 'Lighthouse', guests(3));
  const prompt = request.messages[0].content;
  assert.match(prompt, /"readAloud": \{"accuses"/);
  assert.match(prompt, /Each character must also receive exactly one accusation/);
  assert.match(prompt, /ONE complete circle/);
  assert.match(prompt, /NO secret clues/);
  assert.match(prompt, /event-related/);
  assert.match(prompt, /ages 13-50/);
  assert.match(prompt, /never fewer than 5 or more than 6/);
  assert.match(prompt, /round 4 corrects earlier suspicions/);
  assert.match(prompt, /no newly invented culprits/);
  assert.doesNotMatch(prompt, /"instructions":/);
  assert.ok(normalizeStory(content).story);
});

test('the documentation links to a valid five-round importable example', () => {
  const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /\[.*examples\/example-story.json.*\]\(examples\/example-story.json\)/);
  assert.equal(example.rounds.length, 5);
  assert.deepEqual(normalizeStory(example).errors, []);
});
