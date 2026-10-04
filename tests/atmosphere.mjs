import test from 'node:test';
import assert from 'node:assert/strict';
import { createTransitionTracker, storyTheme, THEMES, CUES } from '../js/atmosphere.js';
import { normalizeStory, buildView } from '../js/story.js';
import { STARTER_MYSTERIES } from '../js/starters.js';
import { makeStoryTemplate } from '../js/library.js';

const state = { room: 'ROOM', phase: 'lobby', roundIndex: -1, me: null };

test('initial state and unchanged reconnect snapshots never trigger phase effects', () => {
  const track = createTransitionTracker();
  assert.deepEqual(track(state), []);
  assert.deepEqual(track({ ...state }), []);
  assert.deepEqual(track({ ...state }), []);
  for (const phase of ['round', 'vote', 'reveal']) {
    const fresh = createTransitionTracker();
    assert.deepEqual(fresh({ ...state, me: 'clerk', phase, roundIndex: 2 }), []);
  }
});

test('the connecting backdrop does not replay a chapter on the first guest snapshot', () => {
  for (const phase of ['lobby', 'round', 'vote', 'reveal']) {
    const track = createTransitionTracker();
    assert.deepEqual(track({ room: '', phase: 'connecting', roundIndex: -1 }), []);
    assert.deepEqual(track({ ...state, me: 'clerk', phase, roundIndex: 2 }), []);
  }
});

test('claiming a character opens only its envelope, not a second lobby transition', () => {
  const track = createTransitionTracker();
  track(state);
  assert.deepEqual(track({ ...state, me: 'clerk' }), ['character']);
  assert.deepEqual(track({ ...state, me: 'clerk' }), []);
});

test('each chapter, vote and reveal triggers once; going backward does not replay scenes', () => {
  const track = createTransitionTracker();
  const mine = { ...state, me: 'clerk' };
  track(mine);
  for (const index of [0, 1, 2]) {
    assert.deepEqual(track({ ...mine, phase: 'round', roundIndex: index }), ['round']);
    assert.deepEqual(track({ ...mine, phase: 'round', roundIndex: index }), []);
  }
  assert.deepEqual(track({ ...mine, phase: 'vote', roundIndex: 2 }), ['vote']);
  assert.deepEqual(track({ ...mine, phase: 'vote', roundIndex: 2, myVote: 'witness' }), ['sealed']);
  assert.deepEqual(track({ ...mine, phase: 'vote', roundIndex: 2, myVote: 'witness' }), []);
  assert.deepEqual(track({ ...mine, phase: 'vote', roundIndex: 2, myVote: 'minister' }), ['sealed']);
  assert.deepEqual(track({ ...mine, phase: 'reveal', roundIndex: 2, myVote: 'minister' }), ['reveal']);
  assert.deepEqual(track({ ...mine, phase: 'vote', roundIndex: 2, myVote: 'minister' }), []);
  assert.deepEqual(track({ ...mine, phase: 'reveal', roundIndex: 2, myVote: 'minister' }), []);
});

test('host transitions have no dependence on private player packets', () => {
  const track = createTransitionTracker();
  track({ room: 'ROOM', phase: 'review', roundIndex: -1 });
  assert.deepEqual(track({ room: 'ROOM', phase: 'lobby', roundIndex: -1 }), ['lobby']);
  assert.deepEqual(track({ room: 'ROOM', phase: 'round', roundIndex: 0 }), ['round']);
});

test('voting after each round announces once for each distinct ballot round', () => {
  const track = createTransitionTracker();
  track({ ...state, phase: 'round', roundIndex: 0 });
  for (let roundIndex = 0; roundIndex < 3; roundIndex++) {
    track({ ...state, phase: 'round', roundIndex });
    assert.deepEqual(track({ ...state, phase: 'vote', roundIndex }), ['vote']);
    assert.deepEqual(track({ ...state, phase: 'vote', roundIndex }), []);
  }
});

test('a different room starts quietly and has its own round events', () => {
  const track = createTransitionTracker();
  track(state);
  track({ ...state, phase: 'round', roundIndex: 0 });
  assert.deepEqual(track({ ...state, room: 'NEW', phase: 'round', roundIndex: 0 }), []);
  assert.deepEqual(track({ ...state, room: 'NEW', phase: 'round', roundIndex: 1 }), ['round']);
});

test('changing characters announces a packet without replaying a round', () => {
  const track = createTransitionTracker();
  track({ ...state, me: 'clerk', phase: 'round', roundIndex: 1 });
  assert.deepEqual(track({ ...state, me: 'minister', phase: 'round', roundIndex: 1 }), ['character']);
});

test('themes are allowlisted, infer legacy titles and preserve edited choices', () => {
  assert.equal(storyTheme({ title: 'The Ashes of Mercy Hollow' }), 'witch');
  assert.equal(storyTheme({ title: 'Footsteps Above Blackthorn Farm' }), 'farm');
  assert.equal(storyTheme({ title: 'The Last Will at Briar House' }), 'victorian');
  assert.equal(storyTheme({ title: 'The Last Seance at Ravenmoor' }), 'manor');
  assert.equal(storyTheme({ title: 'Custom title', atmosphere: 'farm' }), 'farm');
  assert.equal(storyTheme({ atmosphere: '<script>' }), 'manor');
  assert.equal(THEMES.length, 4);
  assert.deepEqual(Object.keys(CUES), ['dim', 'sting', 'discuss']);
});

test('normalization, saves and player views retain only the public atmosphere choice', () => {
  const normalized = normalizeStory(STARTER_MYSTERIES[0].story).story;
  assert.equal(normalized.atmosphere, 'witch');
  normalized.title = 'Our custom witch story';
  const template = makeStoryTemplate(normalized);
  assert.equal(normalizeStory(template).story.atmosphere, 'witch');
  const view = buildView({ story: normalized, claims: {}, votes: {}, room: 'TEST', phase: 'lobby', roundIndex: -1 }, null);
  assert.equal(view.atmosphere, 'witch');
  assert.equal(view.packet, undefined);
  assert.equal(view.solution, undefined);
  assert.equal(view.reveal, undefined);
});
