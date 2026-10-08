import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeStory, buildView } from '../js/story.js';
import { assignAccusationCircles, validateAccusationCircles } from '../js/accusations.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { buildSampleStory } from '../js/sample.js';
import { adaptStoryForPlayers, makeStoryTemplate } from '../js/library.js';
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
    for (const reader of story.characters) {
      const clue = reader.rounds[ri].readAloud;
      assert.notEqual(clue.accuses, reader.id);
      assert.ok(clue.text.includes(`{${clue.accuses}}`), 'Evidence must explicitly identify its target');
      assert.ok(story.characters.some(c => c.id === clue.accuses));
      assert.ok(!incoming.has(clue.accuses), 'Each player is talked about once per round');
      assert.ok(!texts.has(clue.text));
      incoming.add(clue.accuses); texts.add(clue.text);
    }
    assert.equal(story.rounds[ri].chain.length, story.characters.length, 'Read order includes every player');
  }
}

test('every fixed-count built-in story has a valid chain and complete directed coverage', () => {
  for (const entry of STARTER_MYSTERIES) {
    const result = normalizeStory(entry.story);
    assert.deepEqual(result.errors, []);
    checkCircle(result.story);
  }
  checkCircle(normalizeStory(buildSampleStory(guests(5))).story);
  checkCircle(normalizeStory(example).story);
});

test('precomputed chains complete coverage before any scheduled repeats', () => {
  for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 12]) {
    const roundCount = Math.max(5, n - 1);
    const story = {
      coverageRepeatNote: roundCount > n - 1 ? 'The test story has five chapters and needs repeated pairs after full coverage.' : '',
      rounds: Array.from({ length: roundCount }, () => ({})),
      characters: guests(n).map((g, i) => ({ id: `c${i}`, name: g.name, rounds: Array.from({ length: roundCount }, () => ({})) })),
    };
    assignAccusationCircles(story, Object.fromEntries(story.characters.map(c => [c.id, story.rounds.map((_, ri) => `{${c.id}} evidence ${ri}`)])));
    checkCircle(story);
    const coverage = new Set();
    story.rounds.forEach((round, ri) => {
      assert.equal(round.coverageRepeat, ri >= n - 1);
      if (ri < n - 1) {
        for (const character of story.characters) {
          const pair = `${character.id}>${character.rounds[ri].readAloud.accuses}`;
          assert.ok(!coverage.has(pair));
          coverage.add(pair);
        }
      }
    }
    );
    assert.equal(coverage.size, n * (n - 1));
  }
});

test('validation rejects missing, self, unknown, duplicate and disjoint accusations', () => {
  const base = normalizeStory(STARTER_MYSTERIES[0].story).story;
  for (const [mutate, pattern] of [
    [s => delete s.characters[0].rounds[0].readAloud, /add a "readAloud"/],
    [s => s.characters[0].rounds[0].readAloud.text = ' ', /add a "readAloud"/],
    [s => s.characters[0].rounds[0].readAloud.accuses = s.characters[0].id, /cannot accuse themselves/],
    [s => s.characters[0].rounds[0].readAloud.accuses = 'absent', /must name a character id/],
    [s => s.characters[0].rounds[0].readAloud.accuses = s.characters[1].rounds[0].readAloud.accuses, /accused twice/],
    [s => s.characters[0].rounds[0].readAloud.text = s.characters[1].rounds[0].readAloud.text, /text must be unique/],
    [s => s.characters.forEach(c => c.rounds[0].readAloud.accuses = s.characters[0].id), /accused twice|cannot accuse themselves/],
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
    const story = adaptStoryForPlayers(entry.story, guests(entry.story.fixedPlayerCount));
    const killer = story.solution.killerId;
    const roundIndex = story.rounds.length - 1;
    const original = entry.story.characters.find(c => c.rounds[roundIndex].readAloud.accuses === killer).rounds[roundIndex].readAloud.text;
    const adapted = story.characters.find(c => c.rounds[roundIndex].readAloud.accuses === killer).rounds[roundIndex].readAloud.text;
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

test('AI generation requests public-only event evidence and rotating target coverage', async t => {
  let request;
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    request = JSON.parse(options.body);
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(example) } }] }) };
  });
  const content = await generateStory({ base: 'https://example.invalid', model: 'test', key: 'test-only' }, 'Lighthouse', guests(3));
  const prompt = request.messages[0].content;
  assert.match(prompt, /"readAloud": \{"accuses"/);
  assert.match(prompt, /coverageRepeatNote/);
  assert.match(prompt, /first N-1 rounds every reader must target every other character exactly once/);
  assert.match(prompt, /"clueRouting": "rotating"/);
  assert.match(prompt, /the character talked about reads next, and if a loop closes early the next unread character starts a new loop/);
  assert.match(prompt, /ownership was recognized/);
  assert.match(prompt, /repeated finale.votePrompt must be neutral/);
  assert.match(prompt, /NO secret clues/);
  assert.match(prompt, /event-related/);
  assert.match(prompt, /ages 13-50/);
  assert.match(prompt, /do not assume a fixed five- or six-round story/);
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
