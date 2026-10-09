import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import editions from '../js/editions/briar-playtest.js';
import legacy from '../js/editions/briar-house.js';
import { STARTER_MYSTERIES } from '../tools/story-sources/starter-sources.mjs';
import { buildBriarStory, BRIAR_INFO } from '../js/briar-catalog.js';
import { normalizeStory, buildView } from '../js/story.js';
import { accusationChain } from '../js/accusations.js';
import { isOutdatedStory } from '../js/saved-content.js';

const masterPath = new URL('../tools/story-sources/briar-master.json', import.meta.url);
const bytes = readFileSync(masterPath);
const master = JSON.parse(bytes);
const players = count => Array.from({ length: count }, (_, i) => ({ name: `Guest ${i + 1}`, desc: '' }));
const names = Object.fromEntries(editions[12].characters.map(c => [c.id, c.name]));
const spell = text => text.replace(/\{([^}]+)\}/g, (_, id) => names[id]);
const mapping = [[0, 0], [1, 1], [2, 3], [3, 4], [4, 6]];

test('Briar playtest locks the master and retains the supplied incomplete ending without invented method', () => {
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '1251f7bca1e93a42d0439d1e6f43d9bd4260075aae4d79b6e7723fb4dc45d1b5');
  assert.deepEqual(editions[3], master);
  for (const key of ['solution', 'finale', 'victim', 'hiddenThread', 'specialMechanics']) assert.deepEqual(master[key], legacy[5][key]);
  assert.equal(master.authorPlaytest, true);
  assert.equal(master.masterPreserving, true);
  assert.match(BRIAR_INFO.playtestNotice, /does not specify the physical murder method/);
  assert.match(BRIAR_INFO.playtestNotice, /Not certified/);
  assert.ok(master.conversion.changes.every(change => change.original && change.replacement && change.reason));
  const wider = STARTER_MYSTERIES.find(entry => entry.id === 'briar-house').story;
  assert.deepEqual(editions[12].characters.slice(0, 10).map(c => c.id).sort(), wider.characters.map(c => c.id).sort());
  for (const c of editions[12].characters.slice(10)) {
    assert.equal(c.role, 'Source-linked comparison reader');
    assert.match(c.tieIn, /not a newly placed study witness/);
    assert.match(c.tieIn, /no personal observations, arrival or alibi/i);
  }
  assert.match(editions[12].characters[10].name, /Bank Contact/);
  assert.match(editions[12].characters[11].name, /Brother/);
});

test('Briar keeps all five discovery sequences and 25 original responses in their original chapters', () => {
  for (const [oldIndex, newIndex] of mapping) {
    const original = legacy[5].rounds[oldIndex];
    const current = master.rounds[newIndex];
    assert.ok(current.narration.startsWith(spell(original.narration.split('\n\n').slice(0, 3).join('\n\n'))));
    assert.deepEqual(current.events, original.events);
    assert.equal(current.publicText, original.publicText);
    for (const c of legacy[5].characters) assert.ok(current.narration.includes(`${c.name}'s recorded response: "${spell(c.rounds[oldIndex].readAloud.text)}"`));
  }
  for (const ri of [2, 5]) {
    assert.match(master.rounds[ri].narration, /No new discovery/);
    assert.doesNotMatch(master.rounds[ri].narration, /Confront Pell tonight|transfers to Edmund Pell|appointment note: Pell/);
    for (const c of master.characters) assert.match(c.rounds[ri].readAloud.contradictingDetail, /I must/);
  }
  for (const ri of [0, 1, 2, 3]) {
    const content = JSON.stringify({ chapter: master.rounds[ri], clues: master.characters.map(c => c.rounds[ri]) });
    assert.doesNotMatch(content, /Confront Pell tonight|transfers from Cecily's trust to Edmund Pell's private practice/);
  }
  assert.match(master.rounds[6].narration, /Confront Pell tonight/);
});

for (let count = 3; count <= 12; count++) {
  test(`Briar ${count}: count, nested cast, master preservation, all short clues, coverage and packet secrecy`, () => {
    const raw = editions[count];
    const result = normalizeStory(raw);
    assert.deepEqual(result.errors, []);
    assert.ok(result.warnings.includes(BRIAR_INFO.playtestNotice));
    assert.equal(raw.fixedPlayerCount, count);
    assert.equal(raw.characters.length, count);
    assert.equal(raw.rounds.length, 7);
    assert.deepEqual(raw.characters.slice(0, 3), master.characters);
    assert.deepEqual(raw.characters.map(c => c.id), editions[12].characters.slice(0, count).map(c => c.id));
    for (const key of ['intro', 'setting', 'solution', 'victim', 'finale', 'hiddenThread', 'specialMechanics', 'playtestNotice']) assert.deepEqual(raw[key], master[key]);
    for (let ri = 0; ri < 7; ri++) {
      for (const key of ['title', 'narration', 'publicText', 'events', 'hostNotes']) assert.deepEqual(raw.rounds[ri][key], master.rounds[ri][key]);
      assert.deepEqual(raw.rounds[ri].chain, accusationChain(raw, ri));
    }
    for (const [ci, c] of raw.characters.entries()) {
      const covered = new Set();
      assert.ok(!c.ghost);
      for (const [ri, round] of c.rounds.entries()) {
        const clue = round.readAloud;
        assert.equal(clue.text, `${clue.observation} ${clue.contradictingDetail}`);
        assert.ok(clue.text.split(/\s+/).length <= 35);
        for (const field of ['observation', 'contradictingDetail']) assert.match(clue[field], /\b(?:I|my|me)\b/);
        const references = [...clue.text.matchAll(/\{([^}]+)\}/g)].map(match => match[1]);
        assert.ok(references.includes(clue.accuses));
        assert.ok(references.every(id => id === clue.accuses));
        assert.notEqual(clue.accuses, c.id);
        if (ri) assert.notEqual(clue.accuses, c.rounds[ri - 1].readAloud.accuses);
        if (covered.has(clue.accuses)) assert.equal(covered.size, ci < 3 ? 2 : count - 1);
        if (ci >= 3) {
          const fact = spell(clue.observation.slice(clue.observation.indexOf(':') + 2));
          assert.ok(raw.rounds.slice(0, ri + 1).some(chapter => chapter.narration.includes(fact)), `${count}/${c.id}/${ri}: fact not yet spoken`);
        }
        covered.add(clue.accuses);
      }
    }
    const guests = players(count);
    const { story, errors } = normalizeStory(buildBriarStory(guests, [...guests].reverse()));
    assert.deepEqual(errors, []);
    assert.equal(isOutdatedStory(story), false);
    assert.equal(story.characters[0].guest, guests.at(-1).name);
    assert.deepEqual(normalizeStory(JSON.parse(JSON.stringify(story))).errors, []);
    for (let ri = 0; ri < 7; ri++) for (let chainIndex = 0; chainIndex < count; chainIndex++) {
      const state = { story, room: 'TEST', phase: 'round', roundIndex: ri, chainIndex, claims: {}, votes: {}, roundVotes: {} };
      for (const c of story.characters) {
        const view = buildView(state, c.id);
        assert.equal(view.playtestNotice, BRIAR_INFO.playtestNotice);
        assert.equal(view.packet.rounds.length, ri + Number(story.rounds[ri].chain[chainIndex] === c.id));
        assert.equal(view.reveal, undefined);
        assert.ok(!('isKiller' in view.packet));
      }
    }
  });
}

test('Briar playtest does not borrow LOCKDOWN exemptions for missing fields, duplicates, references or early repeats', () => {
  for (const mutate of [
    s => { s.characters[0].rounds[0].readAloud.observation = ''; },
    s => { s.characters[0].rounds[0].readAloud.contradictingDetail = ''; },
    s => { s.characters[0].rounds[0].readAloud.text = ''; },
    s => { s.characters[0].rounds[0].readAloud.accuses = 'solicitor'; },
    s => { s.characters[0].rounds[0].readAloud.text += ' {solicitor}'; },
    s => { s.characters[3].rounds[0].readAloud.text = s.characters[0].rounds[0].readAloud.text; },
    s => { s.rounds[0].readingGroups = [['solicitor']]; },
    s => { s.rounds[0].readingGroups.push(['solicitor']); },
    s => { s.characters[3].rounds[2] = structuredClone(s.characters[3].rounds[0]); },
    s => { s.characters[3].rounds[1] = structuredClone(s.characters[3].rounds[0]); },
    s => { s.rounds[2].coverageRepeat = false; },
    s => { s.masterPreserving = false; },
    s => { s.playtestNotice = ''; },
    s => { s.edition.family = 'unapproved'; },
    s => { s.rounds.pop(); },
  ]) {
    const story = structuredClone(editions[6]);
    mutate(story);
    assert.equal(normalizeStory(story).story, null);
  }
  for (const count of [0, 2, 13]) assert.throws(() => buildBriarStory(players(count)), /3 through 12/);
  assert.throws(() => buildBriarStory(players(5), players(3)), /exactly one character assignment/);
});

test('Briar compiler is reproducible, read-only in check mode and refuses master replacement', () => {
  const compiler = fileURLToPath(new URL('../tools/author-briar.mjs', import.meta.url));
  const outputPath = new URL('../js/editions/briar-playtest.js', import.meta.url);
  const before = readFileSync(outputPath);
  assert.match(execFileSync(process.execPath, ['--max-old-space-size=128', compiler, '--check'], { encoding: 'utf8' }), /all ten reproducible/);
  assert.throws(() => execFileSync(process.execPath, ['--max-old-space-size=128', compiler, '--create-master'], { stdio: 'pipe' }), /EEXIST/);
  assert.deepEqual(readFileSync(masterPath), bytes);
  assert.deepEqual(readFileSync(outputPath), before);
  const attributes = readFileSync(new URL('../.gitattributes', import.meta.url), 'utf8');
  for (const file of ['briar-master.json', 'briar-playtest.js']) assert.ok(attributes.split(/\r?\n/).some(line => line.includes(file) && line.endsWith('text eol=lf')));
});
