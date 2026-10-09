import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../js/editions/lockdown.js';
import { buildLockdownStory } from '../js/lockdown-catalog.js';
import { normalizeStory, buildView } from '../js/story.js';
import { accusationChain } from '../js/accusations.js';
import { isOutdatedStory } from '../js/saved-content.js';
import { isReleaseSite } from '../js/site-policy.js';

test('only the .com domain selects the LOCKDOWN-only release catalog', () => {
  for (const host of ['grimgatherings.com', 'www.grimgatherings.com', 'GRIMGATHERINGS.COM']) assert.equal(isReleaseSite(host), true);
  for (const host of ['evil0ctopus.github.io', 'localhost', '127.0.0.1', 'grimgatherings.com.example.org']) assert.equal(isReleaseSite(host), false);
});

test('all ten playable editions preserve every master clue and share the supplied ending without author TODO notes', () => {
  const master = normalizeStory(buildLockdownStory(catalog, 3)).story;
  for (let count = 3; count <= 12; count++) {
    const result = normalizeStory(buildLockdownStory(catalog, count));
    assert.deepEqual(result.errors, []);
    assert.ok(result.warnings.some(warning => warning.includes('unfinished playtest')));
    const story = result.story;
    assert.equal(isOutdatedStory(story), false);
    assert.equal(story.characters.length, count);
    assert.equal(story.rounds.length, 7);
    assert.deepEqual(story.solution, master.solution);
    assert.match(story.solution.explanation, /Officer Derek Hayes/);
    assert.doesNotMatch(story.solution.explanation, /Author calls needed|Working shape|Required by the rule set/);
    story.rounds.forEach((round, ri) => {
      assert.equal(round.narration, master.rounds[ri].narration);
      assert.deepEqual(round.chain, accusationChain(story, ri));
      assert.equal(new Set(round.chain).size, count);
      for (const base of master.characters) assert.deepEqual(story.characters.find(c => c.id === base.id).rounds[ri], base.rounds[ri]);
      const state = { room: 'TEST', story, phase: 'round', roundIndex: ri, chainIndex: 0, claims: {}, votes: {}, roundVotes: {} };
      for (let i = 0; i < count; i++) {
        state.chainIndex = i;
        for (const character of story.characters) {
          const view = buildView(state, character.id);
          assert.equal(view.packet.rounds.length, ri + Number(round.chain[i] === character.id));
          assert.ok(!view.reveal);
          assert.ok(!('isKiller' in view.packet));
        }
      }
      state.phase = 'reveal';
      const view = buildView(state, null);
      assert.ok(view.reveal);
    });
    const saved = JSON.parse(JSON.stringify(story));
    assert.deepEqual(normalizeStory(saved).errors, []);
    assert.deepEqual(normalizeStory(saved).story.rounds.map(r => r.readingGroups), story.rounds.map(r => r.readingGroups));
  }
});

test('playtest exceptions do not waive missing clues, bad targets, groups, flags or consecutive repeats', () => {
  for (const mutate of [
    story => { story.characters[0].rounds[0].readAloud.text = ''; },
    story => { story.characters[0].rounds[0].readAloud.accuses = 'missing'; },
    story => { story.characters[0].rounds[0].readAloud.accuses = 'derek'; },
    story => { story.rounds[0].readingGroups = [['derek']]; },
    story => { story.rounds[0].readingGroups = [['derek', 'mason', 'travis']]; },
    story => { story.rounds[2].coverageRepeat = false; },
    story => { story.characters[0].rounds[1].readAloud.accuses = story.characters[0].rounds[0].readAloud.accuses; },
    story => { story.edition.family = 'sample'; },
    story => { story.playtestNotice = ''; },
  ]) {
    const story = buildLockdownStory(catalog, 8);
    mutate(story);
    assert.equal(normalizeStory(story).story, null);
  }
});
