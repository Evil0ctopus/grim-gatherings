import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sampleEditions from '../js/editions/sample.js';
import { buildSampleStory } from '../js/sample.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { normalizeStory, buildView, makeFill } from '../js/story.js';
import { makeStoryTemplate } from '../js/library.js';

const guests = n => Array.from({ length: n }, (_, i) => ({ name: `Player ${i + 1}`, desc: '' }));
const example = JSON.parse(fs.readFileSync(new URL('../examples/example-story.json', import.meta.url)));
const stories = [
  ...Object.keys(sampleEditions).map(Number).map(count => buildSampleStory(guests(count))),
  ...STARTER_MYSTERIES.map(entry => entry.story),
  example,
];
const forbidden = ['backstory', 'secrets', 'motive', 'clues', 'instructions'];
const state = story => ({ story, room: 'AUDIT', claims: {}, votes: {}, roundVotes: {}, phase: 'lobby', roundIndex: 0 });
const castsFor = template => [template];

function noPrivate(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!forbidden.includes(key), `Unexpected private field: ${key}`);
    noPrivate(child);
  }
}

for (const template of stories) {
  test(`${template.title}: host and every character receive only spoken evidence at each chain step and phase`, () => {
    const casts = castsFor(template);
    assert.ok(casts.length);
    for (const adapted of casts) {
      const count = adapted.characters.length;
      const { story, errors } = normalizeStory(adapted);
      assert.deepEqual(errors, []);
      assert.equal(story.schemaVersion, 2);
      noPrivate(story);
      const fill = makeFill(story);
      for (const discloseKiller of [false, true]) {
        story.discloseKiller = discloseKiller;
        const saved = JSON.parse(JSON.stringify(story));
        assert.equal(normalizeStory(saved).story.discloseKiller, discloseKiller);
        assert.equal(makeStoryTemplate(story).discloseKiller, discloseKiller);
        const S = state(story);
        for (const phase of ['lobby', 'round', 'deliberation', 'vote', 'reveal']) {
          S.phase = phase;
          for (let ri = 0; ri < story.rounds.length; ri++) {
            S.roundIndex = ri;
            const chainLength = story.rounds[ri].chain.length;
            const chainIndices = phase === 'round'
              ? Array.from({ length: chainLength + 1 }, (_, index) => index)
              : [0];
            for (const chainIndex of chainIndices) {
            S.chainIndex = chainIndex;
            const released = phase === 'lobby' ? 0 : phase === 'round' ? ri : ri + 1;
            const host = buildView(S, null);
            assert.equal(host.evidenceHistory.length, released);
            for (const character of story.characters) {
              const v = buildView(S, character.id);
              noPrivate(v);
              assert.deepEqual(v.evidenceHistory, host.evidenceHistory);
              const clueIsAvailable = phase !== 'round' ||
                chainIndex === chainLength || story.rounds[ri].chain[chainIndex] === character.id;
              assert.equal(v.packet.rounds.length,
                phase === 'lobby' ? 0 : ri + Number(clueIsAvailable));
              if (discloseKiller || phase === 'reveal') assert.equal(v.packet.isKiller, character.id === story.solution.killerId);
              else assert.ok(!('isKiller' in v.packet));
              if (phase !== 'lobby') {
                assert.equal(v.currentRound.narration, fill(story.rounds[ri].narration));
                if (clueIsAvailable) {
                  assert.equal(v.packet.rounds[ri].readAloud.text, fill(character.rounds[ri].readAloud.text));
                }
              }
              v.evidenceHistory.forEach((r, index) => {
                assert.equal(r.narration, fill(story.rounds[index].narration));
                assert.equal(r.accusations.length, count);
                r.accusations.forEach((clue, ci) => {
                  assert.equal(clue.text, fill(story.characters[ci].rounds[index].readAloud.text));
                });
              });
              assert.equal('reveal' in v, phase === 'reveal');
              if (phase !== 'reveal') {
                const json = JSON.stringify(v);
                assert.ok(!json.includes(story.solution.explanation));
                for (let future = ri + 1; future < story.rounds.length; future++) {
                  assert.ok(!json.includes(JSON.stringify(fill(story.rounds[future].narration)).slice(1, -1)));
                }
              }
              }
            }
          }
        }
      }
    }
  });
}

test('legacy private information is rejected, never silently republished as evidence', () => {
  const base = buildSampleStory(guests(5));
  for (const field of ['backstory', 'secrets', 'motive', 'clues']) {
    const input = structuredClone(base);
    if (field === 'clues') input.characters[0].rounds[0].clues = ['PRIVATE SENTINEL'];
    else input.characters[0][field] = field === 'secrets' ? ['PRIVATE SENTINEL'] : 'PRIVATE SENTINEL';
    const result = normalizeStory(input);
    assert.equal(result.story, null);
    assert.ok(result.errors.some(e => e.includes('private story information')));
  }
  const missingNarration = structuredClone(base);
  missingNarration.rounds[0].narration = '';
  assert.ok(normalizeStory(missingNarration).errors.some(e => e.includes('spoken host narration')));
});

test('required public chapters establish each solution chain before reveal at smallest and largest casts', () => {
  const proofByRound = {
    sample: [/chair scrapes|chair.*scrapes/, /bottle.*S\.A\./, /false prescriptions.*two patients/, /rim.*wolfsbane|wolfsbane.*rim/, /removed his gloves/],
    'mercy-hollow': [/Pike.*enter/, /half-burned deed/, /draft.*Pike.s handwriting/, /fragment.*broken clasp/, /missing star.*impressions/],
    'blackthorn-farm': [/coat.*side door/, /stair.*Adler.*request/, /(?:Adler.*signed.*boundary|boundary.*Adler.*signature)/i, /cap.*(?:before supper|spare-clothes basket)/, /button.*Adler.s coat/],
    'briar-house': [/Pell leave.*folded/, /removed as trustee/, /bell mechanism.*continues/, /appointment note.*study/, /transfers.*private practice/],
    'blackwater-row': [/crescent-shaped gap/, /amber smear/, /chalk smear.*drag line/, /perfect circle/, /BENJAMIN BARKER/],
    example: [/Nell saw Wick climb/, /push.*oil line/, /logbook.*coast guard/, /key.*only other copy/, /Wick.s father.*insurance/],
  };
  stories.forEach(story => {
    const casts = castsFor(story);
    const family = story.edition?.family || 'example';
    const proofs = proofByRound[family];
    for (const adapted of [casts[0], casts.at(-1)]) {
      const fill = makeFill(adapted);
      adapted.rounds.forEach((chapter, ri) => {
        const spokenContent = family === 'blackthorn-farm' && adapted.edition.playerCount === 3
          ? [chapter.narration, ...adapted.characters.map(character => fill(character.rounds[ri].readAloud.text))].join('\n')
          : chapter.narration;
        assert.match(spokenContent, proofs[ri], `${story.title}, round ${ri + 1}, ${adapted.characters.length} players`);
      });
    }
  });
});
