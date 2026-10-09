import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import editions from '../js/editions/blackwater-scalable.js';
import legacy from '../js/editions/blackwater-row.js';
import { buildBlackwaterStory } from '../js/blackwater-catalog.js';
import { normalizeStory, buildView } from '../js/story.js';
import { accusationChain } from '../js/accusations.js';
import { isOutdatedStory } from '../js/saved-content.js';

const path = new URL('../tools/story-sources/blackwater-master.json', import.meta.url);
const bytes = readFileSync(path);
const master = JSON.parse(bytes);
const players = count => Array.from({ length: count }, (_, index) => ({ name: `Player ${index + 1}`, desc: '' }));
const names = Object.fromEntries(editions[12].characters.map(c => [c.id, c.name]));
const spell = text => text.replace(/\{([^}]+)\}/g, (_, id) => names[id]);
const mapping = [0, 1, 2, 2, 3, 3, 4];

test('Blackwater master is immutable, generated verbatim and portable across Windows checkouts', () => {
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'dfd89ee9aae48af6656a87c215bad350671acb9a049a6c642e7f788146bd533a');
  assert.deepEqual(editions[3], master);
  const attributes = readFileSync(new URL('../.gitattributes', import.meta.url), 'utf8');
  for (const file of ['blackwater-master.json', 'ravenmoor-master.json', 'blackwater-scalable.js', 'ravenmoor.js']) {
    assert.ok(attributes.split(/\r?\n/).some(line => line.includes(file) && line.endsWith('text eol=lf')));
  }
  assert.deepEqual(master.victim, legacy[4].victim);
  assert.equal(master.solution.killerId, legacy[4].solution.killerId);
  assert.equal(master.solution.revealNarration, legacy[4].solution.revealNarration);
  assert.equal(master.solution.explanation, legacy[4].solution.explanation.replaceAll('Round 5', 'Round 7').replaceAll('Round 4', 'Round 5'));
  assert.ok(master.conversion.changes.every(change => change.original && change.replacement && change.reason));
});

test('five discoveries retain every original account, response and event without early identity or razor evidence', () => {
  for (const [oldIndex, newIndex] of [[0, 0], [1, 1], [2, 2], [3, 4], [4, 6]]) {
    const old = legacy[4].rounds[oldIndex];
    const current = master.rounds[newIndex];
    for (const account of old.narration.split('\n\n').filter(part => part.startsWith('Witness background for '))) {
      assert.ok(current.narration.includes(spell(account)), `original account ${oldIndex}`);
    }
    for (const c of legacy[4].characters) {
      assert.ok(current.narration.includes(`${c.name}'s recorded response: "${spell(c.rounds[oldIndex].readAloud.text)}"`));
    }
    assert.deepEqual(current.events, old.events);
  }
  for (let ri = 0; ri < 6; ri++) {
    const content = JSON.stringify({ round: master.rounds[ri], clues: master.characters.map(c => c.rounds[ri]) });
    assert.doesNotMatch(content, /Benjamin Barker|\bbarber\b|wanted Barker's wife|licensed likeness/i);
    if (ri < 4) assert.doesNotMatch(content, /ivory|triangular chip|straight razor/i);
  }
  assert.match(master.rounds[6].narration, /BENJAMIN BARKER/);
  assert.match(master.rounds[4].narration, /ivory/);
  for (const ri of [3, 5]) {
    assert.equal(master.rounds[ri].events.length, 2);
    assert.match(master.rounds[ri].narration, /No new death/);
    for (const c of master.characters) assert.match(c.rounds[ri].readAloud.contradictingDetail, /I must/);
  }
});

for (let count = 3; count <= 12; count++) {
  test(`Blackwater ${count}: fixed count, all clues, nested cast, preserved master, repeats and secrecy`, () => {
    const raw = editions[count];
    assert.deepEqual(normalizeStory(raw).errors, []);
    assert.equal(raw.fixedPlayerCount, count);
    assert.equal(raw.characters.length, count);
    assert.equal(raw.rounds.length, 7);
    assert.deepEqual(raw.characters.slice(0, 3), master.characters);
    assert.deepEqual(raw.characters.map(c => c.id), editions[12].characters.slice(0, count).map(c => c.id));
    for (const key of ['intro', 'setting', 'victim', 'solution', 'finale', 'hiddenThread', 'specialMechanics']) assert.deepEqual(raw[key], master[key]);
    for (let ri = 0; ri < 7; ri++) {
      assert.deepEqual(raw.rounds[ri].chain, accusationChain(raw, ri));
      for (const key of ['title', 'narration', 'publicText', 'hostNotes', 'events']) assert.deepEqual(raw.rounds[ri][key], master.rounds[ri][key]);
    }
    for (const [ci, c] of raw.characters.entries()) {
      assert.ok(!c.ghost);
      const seen = new Set();
      for (const [ri, round] of c.rounds.entries()) {
        const clue = round.readAloud;
        assert.equal(clue.text, `${clue.observation} ${clue.contradictingDetail}`);
        assert.ok(clue.text.trim().split(/\s+/).length <= 35, `${count}/${c.id}/${ri}`);
        assert.notEqual(clue.accuses, c.id);
        assert.ok(raw.characters.some(target => target.id === clue.accuses));
        for (const field of ['observation', 'contradictingDetail']) assert.match(clue[field], /\b(?:I|my|me)\b/);
        assert.deepEqual([...clue.text.matchAll(/\{([^}]+)\}/g)].map(match => match[1]), [clue.accuses]);
        if (ri) assert.notEqual(clue.accuses, c.rounds[ri - 1].readAloud.accuses);
        if (ci >= 3) {
          if (seen.has(clue.accuses)) assert.equal(seen.size, count - 1);
          const original = legacy[4].characters.find(reader => reader.rounds[mapping[ri]].readAloud.accuses === clue.accuses)?.rounds[mapping[ri]].readAloud;
          if (original) {
            assert.ok(raw.rounds.slice(0, ri + 1).some(chapter => chapter.narration.includes(spell(original.text))));
            assert.notEqual(clue.observation, original.observation);
            assert.equal(clue.observation.split(' ').slice(2).join(' '), original.observation.split(' ').slice(2).join(' '));
          } else {
            const fact = spell(clue.observation.slice(clue.observation.indexOf(':') + 2));
            assert.ok(raw.rounds.slice(0, ri + 1).some(chapter => chapter.narration.includes(fact)), `${c.id}/${ri}: unreleased fact`);
          }
        }
        seen.add(clue.accuses);
      }
    }
    const guests = players(count);
    const { story, errors } = normalizeStory(buildBlackwaterStory(guests, [...guests].reverse()));
    assert.deepEqual(errors, []);
    assert.equal(story.characters[0].guest, guests.at(-1).name);
    assert.equal(isOutdatedStory(story), false);
    assert.deepEqual(normalizeStory(JSON.parse(JSON.stringify(story))).errors, []);
    for (let ri = 0; ri < 7; ri++) for (let chainIndex = 0; chainIndex < count; chainIndex++) {
      const state = { story, room: 'TEST', phase: 'round', roundIndex: ri, chainIndex, claims: {}, votes: {}, roundVotes: {} };
      const reader = story.rounds[ri].chain[chainIndex];
      for (const c of story.characters) {
        const view = buildView(state, c.id);
        assert.equal(view.packet.rounds.length, ri + Number(c.id === reader));
        assert.equal(view.reveal, undefined);
        assert.ok(!('isKiller' in view.packet));
      }
    }
  });
}

test('Blackwater selection rejects unsupported counts, mismatched assignments and invalid master-group data', () => {
  for (const count of [0, 2, 13]) assert.throws(() => buildBlackwaterStory(players(count)), /3 through 12/);
  assert.throws(() => buildBlackwaterStory(players(5), players(3)), /exactly one character assignment/);
  for (const mutate of [
    s => { s.rounds[0].readingGroups = [['xander']]; },
    s => { s.rounds[0].readingGroups.push(['xander']); },
    s => { s.characters[3].rounds[1] = structuredClone(s.characters[3].rounds[0]); },
    s => { s.characters[0].rounds[0].readAloud.accuses = 'xander'; },
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

test('Blackwater compiler is reproducible and cannot overwrite its finalized master', () => {
  const compiler = fileURLToPath(new URL('../tools/author-blackwater.mjs', import.meta.url));
  const output = new URL('../js/editions/blackwater-scalable.js', import.meta.url);
  const before = readFileSync(output);
  assert.match(execFileSync(process.execPath, ['--max-old-space-size=128', compiler, '--check'], { encoding: 'utf8' }), /all ten reproducible/);
  assert.throws(() => execFileSync(process.execPath, ['--max-old-space-size=128', compiler, '--create-master'], { stdio: 'pipe' }), /EEXIST/);
  assert.deepEqual(readFileSync(output), before);
  assert.deepEqual(readFileSync(path), bytes);
});
