import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import sample from '../js/editions/sample.js';
import mercy from '../js/editions/mercy-hollow.js';
import farm from '../js/editions/blackthorn-farm.js';
import briar from '../js/editions/briar-house.js';

// Fingerprints and word counts from c77bc68, before the voice-only rewrite.
const families = [
  {
    id: 'sample', editions: sample,
    structure: '2f3e38da19e63144ad5be5f74c304aae04b49a42f357f488c3cac15436c164d2',
    references: 'f9aea563832c7d3aa18ca1dc6eca12dc608098df2dff80d593f29f8d0c06cd74',
    lengths: [[38, 25, 27, 36, 39], [38, 28, 40, 35, 42], [40, 30, 30, 48, 39], [38, 29, 34, 33, 40], [45, 28, 31, 40, 77]],
  },
  {
    id: 'mercy-hollow', editions: mercy,
    structure: 'e5ded12ffc57612c6c061009c213bb0169b45e2dab19148719aa220452f33c0a',
    references: 'e06bc8cf0dbd7bb061829381349ef22e0ccfd06545060f8d1befd7545a444f23',
    lengths: [[37, 26, 35, 36, 37], [38, 28, 28, 36, 40], [39, 26, 27, 46, 40], [39, 30, 32, 30, 38], [39, 27, 31, 31, 72]],
  },
  {
    id: 'blackthorn-farm', editions: farm,
    structure: '4f3617d8f4e985ca83a8462ec4d3cd3d3ac542e68b6f9ef84d06491611e0b7ae',
    references: '10326a2c7cae6dd9b4da6ebb99b67ef0541345a3cad40b726f754989206f2a6d',
    lengths: [[37, 26, 39, 36, 39], [41, 22, 35, 31, 37], [39, 28, 36, 47, 37], [36, 29, 36, 36, 43], [41, 21, 39, 39, 74]],
  },
  {
    id: 'briar-house', editions: briar,
    structure: '0e2c3ff2a340c56ff1c82a6e6770d6d58fed6d358102ec91689f76920bff05a4',
    references: 'e55a57a74703ee50f0a83ce373421182bcada50ed097d535ebc6bd37bc5d1136',
    lengths: [[36, 24, 35, 30, 39], [38, 25, 37, 30, 43], [38, 24, 31, 43, 35], [39, 26, 29, 36, 40], [39, 21, 29, 31, 61]],
  },
];
const fields = ['text', 'observation', 'contradictingDetail'];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const references = text => [...new Set(text.match(/\{[^}]+\}/g) || [])].sort();
const wordCount = text => text.trim().split(/\s+/).length;

test('the narrative import path refreshes cached clue content without touching Mafia', () => {
  const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const version = 'clue-voice-v1';
  for (const [file, dependency, dependencyVersion = version] of [
    ['index.html', 'js/main.js', 'briar-playtest-v1'],
    ['js/main.js', './host.js', 'briar-playtest-v1'],
    ['js/host.js', './briar-catalog.js', 'briar-playtest-v1'],
    ['js/host.js', './blackwater-catalog.js', 'blackwater-master-v1'],
    ['js/host.js', './ravenmoor-catalog.js', 'ravenmoor-master-v1'],
    ['js/host.js', './starters.js', 'blackwater-voice-v1'],
    ['js/sample.js', './editions/sample.js'],
    ['js/starters.js', './editions/mercy-hollow.js'],
    ['js/starters.js', './editions/blackthorn-farm.js'],
    ['js/starters.js', './editions/briar-house.js'],
    ['js/starters.js', './editions/blackwater-row.js', 'blackwater-voice-v1'],
  ]) {
    assert.ok(read(file).includes(`${dependency}?v=${dependencyVersion}`), `${file} refreshes ${dependency}`);
  }
  assert.ok(!read('mafia.html').includes(version));
});

for (const family of families) {
  test(`${family.id}: 25 short, first-person, two-part clues retain valid references`, () => {
    assert.deepEqual(Object.keys(family.editions), ['5']);
    const story = family.editions[5];
    const ids = new Set(story.characters.map(character => character.id));
    assert.equal(story.characters.length, 5);
    const refs = [];
    let count = 0;
    story.characters.forEach((character, ci) => {
      assert.equal(character.rounds.length, 5);
      character.rounds.forEach((round, ri) => {
        const clue = round.readAloud;
        const label = `${family.id}/${character.id}/round ${ri + 1}`;
        assert.equal(clue.text, `${clue.observation} ${clue.contradictingDetail}`, label);
        assert.ok(ids.has(clue.accuses) && clue.accuses !== character.id, label);
        assert.ok(wordCount(clue.text) <= 35, `${label}: maximum 35 words`);
        assert.ok(wordCount(clue.text) < family.lengths[ci][ri], `${label}: shorter than the original`);
        refs.push(fields.map(key => references(clue[key])));
        for (const key of fields) {
          assert.match(clue[key], /\b(?:I|my|me)\b/, `${label}/${key}: speaker's voice`);
          assert.doesNotMatch(clue[key], /^About\s|test both rather|document access makes|same person supplies/i, label);
          for (const placeholder of references(clue[key])) {
            assert.ok(ids.has(placeholder.slice(1, -1)), `${label}/${key}: ${placeholder}`);
          }
        }
        count++;
      });
    });
    assert.equal(count, 25);
    assert.equal(hash(refs), family.references, 'Every original placeholder name remains in its original field');
  });

  test(`${family.id}: targets, chains, narrations, solution and all non-voice fields are unchanged`, () => {
    const unchanged = structuredClone(family.editions);
    for (const character of unchanged[5].characters) {
      for (const round of character.rounds) {
        for (const field of fields) delete round.readAloud[field];
      }
    }
    assert.equal(hash(unchanged), family.structure);
  });
}
