import test from 'node:test';
import assert from 'node:assert/strict';
import { isPlayableStoryFamily } from '../js/site-policy.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { readFileSync } from 'node:fs';

test('every production catalog family is playable by host and phone on both sites', () => {
  for (const family of ['lockdown', 'woodland-hollow', 'lago-cabin', 'ravenmoor', 'blackwater-scalable', 'briar-playtest']) {
    assert.equal(isPlayableStoryFamily(family, true), true);
    assert.equal(isPlayableStoryFamily(family, false), true);
  }
});

test('development starters remain playable without admitting retired stories to production', () => {
  for (const entry of STARTER_MYSTERIES) {
    assert.equal(isPlayableStoryFamily(entry.story.edition.family, false), true);
    assert.equal(isPlayableStoryFamily(entry.story.edition.family, true), false);
  }
  for (const family of [undefined, null, '', 'retired', 'premium']) {
    assert.equal(isPlayableStoryFamily(family, true), false);
    assert.equal(isPlayableStoryFamily(family, false), false);
  }
});

test('host and player consume the same versioned availability policy', () => {
  for (const file of ['host.js', 'player.js']) {
    const source = readFileSync(new URL(`../js/${file}`, import.meta.url), 'utf8');
    assert.match(source, /import .*isPlayableStoryFamily.*from '\.\/site-policy\.js\?v=all-games-v1'/);
    assert.match(source, /!isPlayableStoryFamily\(/);
  }
});
