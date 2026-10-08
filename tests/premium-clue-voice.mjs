import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { PREMIUM_STORIES } from '../js/premium-stories.js';

const baseline = {
  lanternfall: {
    fingerprint: '1e8f7342788c522e4ed1cd7ed79147f0ccc7eed52257a666899a377da56c8df6',
    lengths: [[39,33,33,36],[32,32,34,34],[38,33,31,34],[34,36,32,35],[37,35,35,36]],
  },
  ledger: {
    fingerprint: '28d4f47bc52b006cae1744f6e6dc2253e045167255e7c77892f9556e397510ca',
    lengths: [[31,33,30,34],[30,34,31,28],[33,34,34,31],[30,27,32,32],[36,25,34,29]],
  },
};

for (const { id, story } of PREMIUM_STORIES) {
  test(`${id}: voice repair preserves all non-voice gameplay from bdac9ca`, () => {
    const stripped = structuredClone(story);
    for (const character of stripped.characters) for (const round of character.rounds) {
      delete round.readAloud.text;
      delete round.readAloud.observation;
      delete round.readAloud.contradictingDetail;
    }
    assert.equal(createHash('sha256').update(JSON.stringify(stripped)).digest('hex'), baseline[id].fingerprint);
  });

  test(`${id}: all twenty clues are shorter first-person two-part readings`, () => {
    const ids = story.characters.map(character => character.id);
    story.characters.forEach((character, ci) => character.rounds.forEach((round, ri) => {
      const clue = round.readAloud;
      const label = `${character.id}, round ${ri + 1}`;
      assert.equal(clue.text, `${clue.observation} ${clue.contradictingDetail}`, label);
      const words = clue.text.trim().split(/\s+/).length;
      assert.ok(words <= 35 && words < baseline[id].lengths[ci][ri], label);
      for (const field of ['observation', 'contradictingDetail']) {
        assert.match(clue[field], /\bI\b/, `${label}: ${field}`);
      }
      for (const field of ['text', 'observation', 'contradictingDetail']) {
        for (const [, reference] of clue[field].matchAll(/\{([^}]+)\}/g)) {
          assert.ok(ids.includes(reference) && reference === clue.accuses, label);
        }
      }
      assert.ok(clue.text.includes(`{${clue.accuses}}`), label);
    }));
  });
}
