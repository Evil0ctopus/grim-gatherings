import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeStory, buildView, makeFill } from '../js/story.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { buildSampleStory } from '../js/sample.js';
import { adaptStoryForPlayers, getPlayerRange } from '../js/library.js';

const guests = n => Array.from({ length: n }, (_, i) => ({ name: `Guest ${i + 1}`, desc: '' }));
const example = JSON.parse(fs.readFileSync(new URL('../examples/example-story.json', import.meta.url), 'utf8'));
const stories = [...STARTER_MYSTERIES.map(entry => entry.story), buildSampleStory(guests(12)), example];
const evidenceAgainst = (story, id, ri) => story.characters.find(c => c.rounds[ri].readAloud.accuses === id).rounds[ri].readAloud.text;

test('all built-ins and the example have five substantial chapters and evolving target evidence', () => {
  for (const story of stories) {
    assert.equal(story.rounds.length, 5);
    assert.deepEqual(normalizeStory(story).errors, []);
    story.rounds.forEach((r, i) => {
      assert.match(r.title, new RegExp(`Round ${i + 1}`));
      assert.ok(r.narration.length > 150);
      assert.ok(r.publicText && r.hostNotes);
    });

    for (const c of story.characters) {
      assert.equal(c.rounds.length, 5);
      const texts = story.rounds.map((_, ri) => evidenceAgainst(story, c.id, ri));
      assert.equal(new Set(texts).size, 5, `Repeated evidence against ${c.name}`);
      for (const text of texts) assert.ok(text.length > 100);
    }
  }
});

test('every guest has a full participating character at every built-in party size', () => {
  const casts = [];
  for (const entry of STARTER_MYSTERIES) {
    const { minPlayers, maxPlayers } = getPlayerRange(entry.story);
    for (let n = minPlayers; n <= maxPlayers; n++) {
      casts.push({ story: adaptStoryForPlayers(entry.story, guests(n)), guests: guests(n) });
    }
  }
  for (let n = 3; n <= 24; n++) casts.push({ story: buildSampleStory(guests(n)), guests: guests(n) });
  for (const { story: raw, guests: players } of casts) {
    const { story, errors } = normalizeStory(raw);
    assert.deepEqual(errors, []);
    assert.equal(story.characters.length, players.length);
    assert.deepEqual(story.characters.map(c => c.guest).sort(), players.map(g => g.name).sort());
    const state = { story, claims: {}, votes: {}, phase: 'round', roundIndex: 0 };
    for (const c of story.characters) {
      assert.ok(c.role && c.publicBlurb, `${c.name} needs a full public role`);
      assert.equal(c.backstory, undefined);
      assert.equal(c.secrets, undefined);
      assert.equal(c.motive, undefined);
      assert.ok(c.rounds.every(r => r.clues === undefined));
      const targetHistory = [];
      const incomingHistory = [];
      for (let ri = 0; ri < 5; ri++) {
        state.roundIndex = ri;
        const view = buildView(state, c.id);
        assert.equal(view.packet.name, c.name);
        assert.equal(view.packet.rounds.length, ri + 1);
        const clue = view.packet.rounds[ri].readAloud;
        assert.ok(clue.text.length > 80 && clue.targetName && clue.text.includes(clue.targetName),
          `${c.name} in ${story.title} needs substantive public evidence in round ${ri + 1}`);
        assert.notEqual(clue.accuses, c.id);
        assert.ok(view.roster.some(target => target.id === clue.accuses));
        targetHistory.push(clue.accuses);
        const incoming = story.characters.filter(reader => reader.rounds[ri].readAloud.accuses === c.id);
        assert.equal(incoming.length, 1, `${c.name} must be part of the investigation in round ${ri + 1}`);
        incomingHistory.push(incoming[0].rounds[ri].readAloud.text);
      }
      if (story.edition.family === 'blackwater-row') {
        assert.equal(new Set(targetHistory).size, 1, 'Preserve Melissa\'s fixed clue circle');
      } else {
        assert.ok(new Set(targetHistory).size >= 2, `${c.name} should investigate different guests`);
      }
      assert.equal(new Set(incomingHistory).size, 5, `${c.name} needs evolving suspicion, not repeated filler`);
    }
  }
});

test('stories enforce the exact five-to-six round range on import and saved-game validation', () => {
  for (const n of [0, 1, 3, 4, 7, 8]) {
    const story = structuredClone(example);
    story.rounds = Array.from({ length: n }, (_, i) => structuredClone(example.rounds[i % 5]));
    for (const c of story.characters) c.rounds = Array.from({ length: n }, (_, i) => structuredClone(c.rounds[i % 5]));
    const result = normalizeStory(story);
    assert.equal(result.story, null);
    assert.match(result.errors.join(' '), /must have 5 or 6 rounds/);
  }
  const six = structuredClone(example);
  six.rounds.push({ ...six.rounds[4], title: 'Round 6 - Final discussion' });
  for (const c of six.characters) c.rounds.push(structuredClone(c.rounds[4]));
  assert.deepEqual(normalizeStory(six).errors, []);
});

test('round 4 explicitly revisits earlier innocent suspicion without changing the crime', () => {
  const arcs = [
    [stories[0], 'midwife', /concealed a sister/, /protection for a sister/],
    [stories[1], 'heir', /hid the original/, /preserves|truthful inheritance/],
    [stories[2], 'daughter', /hid Cecily's letter/, /still provides/],
    [stories.find(story => story.edition?.family === 'sample'), 'constance', /gambling debts/, /same decanter and survived/],
    [example, 'nell', /inherits the land/, /argument happened an hour before/],
  ];
  for (const [story, id, suspicion, correction] of arcs) {
    assert.match(evidenceAgainst(story, id, 1), suspicion);
    assert.match(evidenceAgainst(story, id, 3), correction);
    const killer = evidenceAgainst(story, story.solution.killerId, 4);
    assert.match(killer, new RegExp(`\\{${story.solution.killerId}\\}`));
    assert.ok(killer.length > 180);
  }
});

test('required public evidence still carries the final chain at every supported cast size', () => {
  for (const entry of STARTER_MYSTERIES) {
    const { minPlayers, maxPlayers } = getPlayerRange(entry.story);
    for (let n = minPlayers; n <= maxPlayers; n++) {
      const story = adaptStoryForPlayers(entry.story, guests(n));
      assert.equal(evidenceAgainst(story, story.solution.killerId, 4), evidenceAgainst(entry.story.editions[n], story.solution.killerId, 4));
      const document = entry.id === 'blackwater-row' ? /court file/ : /notebook|ledger|carbon/;
      assert.match(evidenceAgainst(story, story.solution.killerId, 4), document);
      assert.equal(story.solution.explanation, entry.story.solution.explanation);
    }
  }
});

test('evidence notebooks grow only at voting, personalize by target and never expose future or private packets', () => {
  for (const raw of stories) {
    const story = normalizeStory(raw).story;
    const fill = makeFill(story);
    for (const c of story.characters) {
      const state = { story, claims: {}, votes: {}, phase: 'lobby', roundIndex: -1 };
      assert.deepEqual(buildView(state, c.id).evidenceHistory, []);
      for (let ri = 0; ri < 5; ri++) {
        for (const phase of ['round', 'vote']) {
          state.phase = phase; state.roundIndex = ri;
          const view = buildView(state, c.id);
          const count = phase === 'round' ? ri : ri + 1;
          assert.equal(view.packet.rounds.length, ri + 1);
          assert.equal(view.evidenceHistory.length, count);
          for (const chapter of view.evidenceHistory) {
            assert.equal(chapter.accusations.length, story.characters.length);
            const aboutMe = chapter.accusations.filter(clue => clue.accuses === c.id);
            assert.equal(aboutMe.length, 1);
            assert.equal(aboutMe[0].text, fill(evidenceAgainst(story, c.id, chapter.index)));
            assert.ok(chapter.index < count);
            for (const clue of chapter.accusations) assert.deepEqual(Object.keys(clue).sort(), ['accuses', 'speakerId', 'speakerName', 'targetName', 'text']);
          }
          for (const other of story.characters.filter(other => other.id !== c.id)) {
            if (phase === 'round') {
              assert.ok(!JSON.stringify(view.evidenceHistory).includes(fill(other.rounds[ri].readAloud.text)));
            }
          }
          assert.equal(view.reveal, undefined);
        }
      }
      state.phase = 'reveal';
      assert.equal(buildView(state, c.id).evidenceHistory.length, 5);
      const restored = JSON.parse(JSON.stringify(state));
      assert.deepEqual(buildView(restored, c.id), buildView(state, c.id));
      restored.phase = 'round'; restored.roundIndex = 1;
      assert.equal(buildView(restored, c.id).evidenceHistory.length, 1);
      assert.equal(buildView(restored, c.id).packet.rounds.length, 2);
    }
  }
});

test('public notebooks contain no synthetic private sentinels, future scripts or host solution', () => {
  const story = normalizeStory(example).story;
  for (const c of story.characters) {
    c.backstory = `PRIVATE-BACKSTORY-${c.id}`;
    c.secrets = [`PRIVATE-SECRET-${c.id}`];
    c.motive = `PRIVATE-MOTIVE-${c.id}`;
    c.rounds.forEach((r, i) => {
      r.clues = [`PRIVATE-CLUE-${c.id}-${i}`];
      r.readAloud.text = `PUBLIC-${c.id}-${i}`;
    });
  }
  story.solution.explanation = 'PRIVATE-SOLUTION';
  const state = { story, claims: {}, votes: {}, phase: 'vote', roundIndex: 2 };
  const view = buildView(state, 'nell');
  const publicData = JSON.stringify(view.evidenceHistory);
  assert.ok(!publicData.includes('PRIVATE'));
  for (const c of story.characters) {
    for (let i = 0; i < 3; i++) assert.ok(publicData.includes(`PUBLIC-${c.id}-${i}`));
    for (let i = 3; i < 5; i++) assert.ok(!JSON.stringify(view).includes(`PUBLIC-${c.id}-${i}`));
    if (c.id !== 'nell') assert.ok(!JSON.stringify(view).includes(`PRIVATE-CLUE-${c.id}`));
  }
});
