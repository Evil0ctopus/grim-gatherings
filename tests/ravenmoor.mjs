import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import editions from '../js/editions/ravenmoor.js';
import { buildRavenmoorStory, RAVENMOOR_INFO } from '../js/ravenmoor-catalog.js';
import { normalizeStory, buildView } from '../js/story.js';
import { accusationChain } from '../js/accusations.js';
import { isOutdatedStory } from '../js/saved-content.js';
import legacy from '../js/editions/sample.js';

const guests = n => Array.from({ length: n }, (_, i) => ({ name: `Player ${i + 1}`, desc: '' }));
const masterFile = readFileSync(new URL('../tools/story-sources/ravenmoor-master.json', import.meta.url));
const master = JSON.parse(masterFile);

test('the approved conversion identifies its recorded correction and asks players to start a current game', () => {
  assert.match(RAVENMOOR_INFO.reviewNotice, /Owner-approved conversion/);
  assert.match(RAVENMOOR_INFO.reviewNotice, /correction is documented/);
  assert.match(RAVENMOOR_INFO.reviewNotice, /Start a new game/);
});

test('the compiler checks reproducibility without changing the master or generated editions', () => {
  const compiler = fileURLToPath(new URL('../tools/author-ravenmoor.mjs', import.meta.url));
  const outputFile = new URL('../js/editions/ravenmoor.js', import.meta.url);
  const before = readFileSync(outputFile);
  assert.match(execFileSync(process.execPath, [compiler, '--check'], { encoding: 'utf8' }), /all ten reproducible/);
  assert.deepEqual(readFileSync(outputFile), before);
  assert.deepEqual(readFileSync(new URL('../tools/story-sources/ravenmoor-master.json', import.meta.url)), masterFile);
  assert.throws(() => execFileSync(process.execPath, [compiler, '--create-master'], { stdio: 'pipe' }), /EEXIST/);
  assert.deepEqual(readFileSync(new URL('../tools/story-sources/ravenmoor-master.json', import.meta.url)), masterFile);
  assert.deepEqual(readFileSync(outputFile), before);
});

test('the established master is immutable and the generated base matches it exactly', () => {
  assert.equal(createHash('sha256').update(masterFile).digest('hex'), '4c50e6f9afb89c7f0f17c25047958781df4b1a795282b1108a167e173ba2bebe');
  assert.deepEqual(editions[3], master);
  assert.deepEqual(master.solution, legacy[5].solution);
  assert.deepEqual(master.victim, legacy[5].victim);
  assert.deepEqual(master.finale, legacy[5].finale);
  assert.match(master.characters[1].rounds[3].readAloud.contradictingDetail, /death was certified as fever/);
  assert.doesNotMatch(master.characters[1].rounds[3].readAloud.text, /called harmless/);
  assert.ok(master.conversion.changes.some(change =>
    change.original.includes('called harmless') && change.replacement.includes('certified as fever')));
  for (const [oldIndex, newIndex] of [[0, 0], [1, 1], [2, 3], [3, 4], [4, 6]]) {
    for (const c of legacy[5].characters) {
      const names = Object.fromEntries(legacy[5].characters.map(entry => [entry.id, entry.name]));
      const text = c.rounds[oldIndex].readAloud.text.replace(/\{([^}]+)\}/g, (_, id) => names[id]);
      assert.ok(master.rounds[newIndex].narration.includes(`${c.name}: "${text}"`));
    }
  }
  assert.doesNotMatch(master.rounds[0].narration, /\b(?:monkshood|wolfsbane|ring)\b|dying plants/);
  assert.doesNotMatch(master.rounds[1].narration, /serpent-and-staff|gold.*ring|S\. knows that I know/);
  assert.doesNotMatch(master.rounds[4].narration, /\bgloves\b/);
});

test('all 525 clues meet count, routing, word, voice, canon and master-preservation checks', () => {
  assert.deepEqual(Object.keys(editions).map(Number), [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  let total = 0;
  for (let count = 3; count <= 12; count++) {
    const story = editions[count];
    assert.deepEqual(normalizeStory(story).errors, []);
    assert.equal(story.characters.length, count);
    assert.equal(story.fixedPlayerCount, count);
    assert.equal(story.rounds.length, 7);
    assert.deepEqual(story.characters.slice(0, 3), master.characters);
    assert.deepEqual(story.characters.map(c => c.id), editions[12].characters.slice(0, count).map(c => c.id));
    for (const key of ['intro', 'setting', 'victim', 'solution', 'finale', 'hiddenThread', 'specialMechanics']) {
      assert.deepEqual(story[key], master[key]);
    }
    for (let ri = 0; ri < 7; ri++) {
      for (const key of ['title', 'narration', 'publicText', 'hostNotes', 'events']) {
        assert.deepEqual(story.rounds[ri][key], master.rounds[ri][key]);
      }
      assert.deepEqual(story.rounds[ri].chain, accusationChain(story, ri));
    }
    for (const c of story.characters) for (const [ri, round] of c.rounds.entries()) {
      const clue = round.readAloud;
      assert.equal(clue.text, `${clue.observation} ${clue.contradictingDetail}`);
      assert.ok(clue.text.trim().split(/\s+/).length <= 35, `${count}/${c.id}/${ri}`);
      for (const key of ['observation', 'contradictingDetail']) assert.match(clue[key], /\b(?:I|my|me)\b/);
      assert.notEqual(c.id, clue.accuses);
      assert.ok(story.characters.some(target => target.id === clue.accuses));
      if (story.characters.indexOf(c) >= 3) {
        const names = Object.fromEntries(editions[12].characters.map(entry => [entry.id, entry.name]));
        const fact = clue.observation.slice(clue.observation.indexOf(':') + 2).replace(/\{([^}]+)\}/g, (_, id) => names[id]);
        assert.ok(story.rounds.slice(0, ri + 1).some(chapter => chapter.narration.includes(fact)),
          `${count}/${c.id}/${ri}: supplemental fact must already have been spoken`);
      }
      total++;
    }
  }
  assert.equal(total, 525);
});

test('count selection, restore, assignments and pre-reveal secrecy work for all editions', () => {
  for (let count = 3; count <= 12; count++) {
    const players = guests(count);
    const result = normalizeStory(buildRavenmoorStory(players, [...players].reverse()));
    assert.deepEqual(result.errors, []);
    const story = result.story;
    assert.equal(story.characters[0].guest, players.at(-1).name);
    assert.equal(isOutdatedStory(story), false);
    assert.deepEqual(normalizeStory(JSON.parse(JSON.stringify(story))).errors, []);
    for (let ri = 0; ri < 7; ri++) for (let ci = 0; ci < count; ci++) {
      const state = { room: 'TEST', story, phase: 'round', roundIndex: ri, chainIndex: ci, claims: {}, votes: {}, roundVotes: {} };
      const reader = story.rounds[ri].chain[ci];
      for (const c of story.characters) {
        const view = buildView(state, c.id);
        assert.equal(view.packet.rounds.length, ri + Number(c.id === reader));
        assert.equal(view.reveal, undefined);
        assert.ok(!('isKiller' in view.packet));
      }
    }
  }
  for (const count of [0, 2, 13]) assert.throws(() => buildRavenmoorStory(guests(count)), /3 through 12/);
  assert.throws(() => buildRavenmoorStory(guests(5), guests(3)), /exactly one character assignment/);
});

test('approved master groups do not bypass any invalid reading or repeat constraint', () => {
  for (const mutate of [
    s => { s.rounds[0].readingGroups = [['ashgrove']]; },
    s => { s.rounds[0].readingGroups.push(['ashgrove']); },
    s => { s.characters[3].rounds[2] = structuredClone(s.characters[3].rounds[0]); },
    s => { s.characters[3].rounds[1] = structuredClone(s.characters[3].rounds[0]); },
    s => { s.characters[0].rounds[0].readAloud.accuses = 'ashgrove'; },
    s => { s.characters[0].rounds[0].readAloud.contradictingDetail = ''; },
    s => { s.rounds[2].coverageRepeat = false; },
    s => { s.rounds.pop(); },
    s => { s.edition.family = 'unapproved'; },
  ]) {
    const story = structuredClone(editions[6]);
    mutate(story);
    assert.equal(normalizeStory(story).story, null);
  }
});
