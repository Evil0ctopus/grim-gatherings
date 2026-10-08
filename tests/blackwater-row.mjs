import test from 'node:test';
import assert from 'node:assert/strict';
import blackwater from '../js/editions/blackwater-row.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { normalizeStory } from '../js/story.js';
import { validateAccusationCircles } from '../js/accusations.js';
import { createHash } from 'node:crypto';

test('Blackwater Row is restored as one fixed four-player playtesting edition', () => {
  const story = blackwater[4];
  assert.equal(story.fixedPlayerCount, 4);
  assert.equal(story.characters.length, 4);
  assert.deepEqual(normalizeStory(story).errors, []);
  assert.deepEqual(validateAccusationCircles(story), []);
  const entry = STARTER_MYSTERIES.find(item => item.story.edition?.family === 'blackwater-row');
  assert.ok(entry);
  assert.equal(entry.id, 'blackwater-row-4');
  assert.match(entry.blurb, /playtesting/i);
  assert.equal(STARTER_MYSTERIES.filter(item => item.story.edition?.family === 'blackwater-row').length, 1);

  const pairs = new Set();
  story.rounds.forEach((round, ri) => {
    const targets = story.characters.map(c => c.rounds[ri].readAloud.accuses);
    assert.equal(new Set(targets).size, 4, `Round ${ri + 1}: nobody is targeted twice`);
    story.characters.forEach(c => {
      const pair = `${c.id}>${c.rounds[ri].readAloud.accuses}`;
      if (ri < 3) { assert.ok(!pairs.has(pair)); pairs.add(pair); }
    });
    assert.equal(round.coverageRepeat, ri >= 3);
  });
  assert.equal(pairs.size, 12);
  assert.match(story.coverageRepeatNote, /five/i);
  assert.ok(story.characters.every(c => c.ghost == null), 'no player character dies, so no ghosts');
});

test('twenty Blackwater player clues are short first-person two-part statements with valid targets', () => {
  const story = blackwater[4];
  const ids = new Set(story.characters.map(c => c.id));
  let count = 0;
  for (const character of story.characters) {
    for (const [ri, round] of character.rounds.entries()) {
      const clue = round.readAloud;
      const label = `${character.id}/round ${ri + 1}`;
      assert.equal(clue.text, `${clue.observation} ${clue.contradictingDetail}`);
      assert.ok(clue.text.split(/\s+/).length <= 35, label);
      assert.ok(clue.text.includes(`{${clue.accuses}}`));
      assert.notEqual(clue.accuses, character.id);
      for (const field of ['text', 'observation', 'contradictingDetail']) {
        assert.match(clue[field], /\b(?:I|my|me)\b/, `${label}/${field}`);
        for (const match of clue[field].matchAll(/\{([^}]+)\}/g)) {
          assert.ok(ids.has(match[1]), `${label}/${field}: ${match[1]}`);
        }
      }
      count++;
    }
  }
  assert.equal(count, 20);
});

test('Blackwater voice rewrite preserves targets, chains, solution and every other gameplay field', () => {
  const unchanged = structuredClone(blackwater);
  for (const round of unchanged[4].rounds) {
    delete round.narration;
    delete round.hostNotes;
  }
  for (const character of unchanged[4].characters) {
    for (const round of character.rounds) {
      for (const field of ['text', 'observation', 'contradictingDetail']) delete round.readAloud[field];
    }
  }
  const fingerprint = createHash('sha256').update(JSON.stringify(unchanged)).digest('hex');
  assert.equal(fingerprint, '86aa84ca752017193c95106f1e23e653967e33648a49254e30e77fe7b049d046');
});

test('all twenty original witness accounts remain intact in their original chapters', () => {
  const evidence = blackwater[4].rounds.map((round, ri) => {
    const accounts = round.narration.split('\n\n').filter(part => part.startsWith('Witness background for '));
    assert.equal(accounts.length, 4, `Round ${ri + 1}: four complete supporting accounts`);
    const expectedTargets = blackwater[4].characters.map(c => c.rounds[ri].readAloud.accuses);
    accounts.forEach((account, ci) => {
      assert.ok(account.startsWith(`Witness background for {${expectedTargets[ci]}}: `));
    });
    return accounts;
  });
  const fingerprint = createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
  assert.equal(fingerprint, 'e2a6ef86724b2be984cbd96b5fda720e4ac1dd3ac92cfa838cf5db992d58e597');
});

test('narration handoffs agree with the unchanged four-player chains', () => {
  for (const round of blackwater[4].rounds) {
    const handoffs = [...round.narration.matchAll(/\{([^}]+)\} leads the comparison/g)].map(match => match[1]);
    assert.deepEqual(handoffs, round.chain);
  }
});
