import test from 'node:test';
import assert from 'node:assert/strict';
import { currentCharacter, releaseCharacter, resumeSession, retireOtherSessions } from '../js/host-sessions.js';

const record = (token, charId) => ({ token, charId, conn: { closed: false, close() { this.closed = true; } } });
const registry = (...records) => new Map(records.map(rec => [rec.conn, rec]));
const state = () => ({
  phase: 'vote', roundIndex: 2, claims: { xander: 'phone-x', marla: 'phone-m' },
  votes: { xander: 'marla' }, roundVotes: { 0: { xander: 'jasper' }, 2: { xander: 'marla' } },
});

test('reconnecting a saved token restores its character and retires only older sessions of that token', () => {
  const s = state(), old = record('phone-x', 'xander'), other = record('phone-m', 'marla');
  const incoming = record(null, null), conns = registry(old, other, incoming);
  resumeSession(s, conns, incoming, 'phone-x');
  assert.equal(incoming.charId, 'xander');
  assert.equal(old.conn.closed, true);
  assert.equal(old.charId, null);
  assert.equal(conns.has(old.conn), false);
  assert.equal(conns.has(other.conn), true);
  assert.deepEqual(s.votes, { xander: 'marla' });
});

test('release clears every active character binding but preserves all round ballots', () => {
  const s = state(), a = record('phone-x', 'xander'), b = record('phone-x', 'xander');
  const conns = registry(a, b), ballots = JSON.stringify({ votes: s.votes, rounds: s.roundVotes });
  releaseCharacter(s, conns, 'xander');
  assert.equal(s.claims.xander, undefined);
  assert.equal(a.charId, null);
  assert.equal(b.charId, null);
  assert.equal(JSON.stringify({ votes: s.votes, rounds: s.roundVotes }), ballots);
  resumeSession(s, conns, a, 'phone-x');
  assert.equal(a.charId, null, 'A released saved identity gets the picker, not its old packet');
  s.claims.xander = 'replacement-phone';
  const replacement = record(null, null);
  conns.set(replacement.conn, replacement);
  resumeSession(s, conns, replacement, 'replacement-phone');
  assert.equal(currentCharacter(s, replacement), 'xander');
  assert.equal(currentCharacter(s, a), null);
  assert.deepEqual(s.votes, { xander: 'marla' });
});

test('stale character bindings cannot receive a packet or count as connected after ownership changes', () => {
  const s = state(), old = record('phone-x', 'xander');
  s.claims.xander = 'new-owner';
  assert.equal(currentCharacter(s, old), null);
  assert.equal(currentCharacter(s, record('new-owner', 'xander')), 'xander');
  assert.equal(currentCharacter(s, record(null, 'xander')), null);
});

test('a fresh room cannot inherit a remembered character from another room', () => {
  const s = { ...state(), claims: {} }, incoming = record('phone-x', 'xander');
  resumeSession(s, registry(incoming), incoming, 'phone-x');
  assert.equal(incoming.charId, null);
});

test('switching sessions never closes a different player or resets their ownership', () => {
  const s = state(), old = record('phone-x', 'xander'), fresh = record('phone-x', 'jasper');
  const other = record('phone-m', 'marla'), conns = registry(old, fresh, other);
  releaseCharacter(s, conns, 'xander');
  s.claims.jasper = 'phone-x'; fresh.charId = 'jasper';
  retireOtherSessions(conns, fresh);
  assert.equal(old.conn.closed, true);
  assert.equal(other.conn.closed, false);
  assert.equal(s.claims.marla, 'phone-m');
  assert.equal(currentCharacter(s, fresh), 'jasper');
});
