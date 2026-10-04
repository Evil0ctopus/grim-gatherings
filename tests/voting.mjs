import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRoundBallots, voteSummary, voteStripHtml } from '../js/voting.js';
import { buildView, normalizeStory } from '../js/story.js';
import { STARTER_MYSTERIES } from '../js/starters.js';

const state = () => ({
  story: { characters: [{ id: 'a', name: 'Alice' }, { id: 'b', name: 'Ben' }, { id: 'c', name: 'Clara' }] },
  phase: 'round', roundIndex: 0, votes: {}, roundVotes: {},
});

test('each round keeps its own ballots; changes replace rather than add votes', () => {
  const s = state();
  selectRoundBallots(s, 0);
  s.votes.a = 'b'; s.votes.b = 'a';
  s.votes.a = 'c';
  s.roundIndex = 1;
  selectRoundBallots(s, 1);
  assert.deepEqual(s.votes, {});
  s.votes.c = 'a';
  const summary = voteSummary(s);
  assert.equal(summary.total, 3);
  assert.deepEqual(summary.leaders, ['a']);
  assert.ok(Math.abs(summary.suspects[0].share - 200 / 3) < 1e-10);
  assert.ok(Math.abs(summary.suspects[0].change - 100 / 6) < 1e-10);
  selectRoundBallots(s, 0);
  assert.deepEqual(s.votes, { a: 'c', b: 'a' });
});

test('round history survives JSON persistence and does not count future rounds on rewind', () => {
  const s = state();
  selectRoundBallots(s, 0); s.votes.a = 'b';
  s.roundIndex = 1; selectRoundBallots(s, 1); s.votes.a = 'c';
  const restored = JSON.parse(JSON.stringify(s));
  selectRoundBallots(restored, 1); restored.votes.b = 'c';
  assert.equal(voteSummary(restored).total, 3);
  restored.roundIndex = 0;
  assert.equal(voteSummary(restored).total, 1);
  assert.deepEqual(voteSummary(restored).leaders, ['b']);
});

test('legacy final votes migrate to the final round, not every round', () => {
  const s = state();
  delete s.roundVotes;
  s.phase = 'vote'; s.roundIndex = 2; s.votes = { a: 'b' };
  selectRoundBallots(s, 2);
  assert.equal(voteSummary(s).total, 1);
  assert.deepEqual(Object.keys(s.roundVotes), ['2']);
});

test('empty votes, ties, invalid removed characters and escaped names are handled', () => {
  const s = state();
  selectRoundBallots(s, 0);
  assert.deepEqual(voteSummary(s).leaders, []);
  s.votes = s.roundVotes[0] = { a: 'b', b: 'a', removed: 'a', c: 'removed' };
  const summary = voteSummary(s);
  assert.equal(summary.total, 2);
  assert.deepEqual(summary.leaders, ['a', 'b']);
  summary.suspects[0].name = '<script>';
  assert.match(voteStripHtml(summary), /Tied:/);
  assert.doesNotMatch(voteStripHtml(summary), /<script>/);
});

test('public history exposes aggregates only and never future clues or solution', () => {
  const story = normalizeStory(STARTER_MYSTERIES[0].story).story;
  const [a, b] = story.characters;
  const s = { story, phase: 'vote', room: 'TEST', claims: {}, roundIndex: 0, votes: {}, roundVotes: {} };
  selectRoundBallots(s, 0); s.votes[a.id] = b.id;
  const view = buildView(s, a.id);
  assert.equal(view.vote.roundIndex, 0);
  assert.equal(view.voteSummary.total, 1);
  assert.equal(view.packet.rounds.length, 1);
  assert.equal(view.reveal, undefined);
  assert.equal(view.solution, undefined);
  assert.equal(view.voteSummary.rounds[0].ballots, undefined);
  assert.equal(view.vote.myVote, b.id);
});

test('vote history has a compact disclosure and complete wrapped details', () => {
  const s = state();
  selectRoundBallots(s, 0); s.votes.a = 'b';
  const html = voteStripHtml(voteSummary(s));
  assert.match(html, /<summary/);
  assert.match(html, /class="vote-compact">Votes · 100%/);
  assert.match(html, /class="vote-history"/);
  assert.match(html, /Top: Ben 100%/);
  assert.match(html, /R1: Ben 100%/);
  assert.match(html, /Alice 0%/);
  assert.match(voteStripHtml(voteSummary(state())), /Suspect votes open after each round/);
});
