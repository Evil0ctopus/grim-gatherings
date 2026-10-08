// Unit tests for one-phone narrator mode (js/mafia/narrator-game.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as N from '../js/mafia/narrator-game.js';

const NAMES = ['Ann', 'Ben', 'Cal', 'Dee', 'Eve', 'Fay', 'Gus'];
const seeded = seed => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const game = (names = NAMES, settings = {}, seed = 7) => N.newNarratorGame(names, settings, { rng: seeded(seed) });
const role = (s, r) => s.players.filter(p => p.role === r);
const town = s => s.players.filter(p => p.alive && p.role !== 'mafia');

function toNight(s) {
  N.skipPass(s);
  assert.equal(N.beginNight(s), true);
}

// Plays one night: mafia kill `victim`, every doctor protects `protect`, detectives investigate `probe`.
function playNight(s, victim, protect, probe) {
  const events = [];
  while (s.phase === 'night') {
    const step = N.currentStep(s);
    if (N.actorAlive(s, step)) {
      if (step.kind === 'mafia') { assert.equal(N.pick(s, victim), null); assert.equal(N.confirmKill(s), true); }
      if (step.kind === 'doctor') assert.equal(N.pick(s, protect), null);
      if (step.kind === 'detective') assert.equal(N.pick(s, N.stepTargets(s).find(p => p.id === probe)?.id ?? N.stepTargets(s)[0].id), null);
    }
    const e = N.advanceNight(s);
    if (e) events.push(e);
  }
  return events;
}

test('cleanNames trims, collapses spaces, dedupes case-insensitively and caps length', () => {
  assert.deepEqual(N.cleanNames(['  Ann ', 'ann', '', 'Big   Ben', null, 'x'.repeat(40)]), ['Ann', 'Big Ben', 'x'.repeat(24)]);
});

test('player count limits are enforced', () => {
  assert.throws(() => game(['A', 'B', 'C', 'D']));
  assert.throws(() => game(Array.from({ length: N.MAX_PLAYERS + 1 }, (_, i) => `P${i}`)));
  assert.equal(game(Array.from({ length: N.MAX_PLAYERS }, (_, i) => `P${i}`)).players.length, N.MAX_PLAYERS);
});

test('pass-around shows each player once, then the game is ready', () => {
  const s = game();
  for (let i = 0; i < NAMES.length; i++) {
    assert.equal(s.phase, 'pass');
    assert.equal(s.passIndex, i);
    N.showPassRole(s);
    assert.equal(s.passShown, true);
    N.nextPass(s);
    assert.equal(s.passShown, false);
  }
  assert.equal(s.phase, 'ready');
});

test('doctor save cancels the kill (saved event, nobody dies)', () => {
  const s = game();
  toNight(s);
  const victim = town(s)[0].id;
  const events = playNight(s, victim, victim);
  assert.deepEqual(events, ['saved', 'dawn']);
  assert.equal(N.byId(s, victim).alive, true);
  assert.equal(s.announcement.killed, null);
  assert.equal(s.announcement.target, victim);
  assert.deepEqual(s.announcement.savedBy, role(s, 'doctor').map(p => p.id));
});

test('a missed save kills the victim (killed event) and reveals the role', () => {
  const s = game();
  toNight(s);
  const [victim, other] = town(s).map(p => p.id);
  const events = playNight(s, victim, other);
  assert.deepEqual(events, ['killed', 'dawn']);
  assert.equal(N.byId(s, victim).alive, false);
  assert.equal(s.announcement.killed, victim);
  assert.equal(s.announcement.role, N.byId(s, victim).role);
  assert.equal(s.phase, 'dawn');
});

test('role is hidden at dawn when reveal-on-death is off', () => {
  const s = game(NAMES, { revealRoleOnDeath: false });
  toNight(s);
  const [victim, other] = town(s).map(p => p.id);
  playNight(s, victim, other);
  assert.equal(s.announcement.role, null);
});

test('mafia cannot target mafia, kill must be confirmed, and is locked after confirming', () => {
  const s = game();
  toNight(s);
  N.advanceNight(s); // sleep -> mafia
  assert.equal(N.currentStep(s).kind, 'mafia');
  assert.ok(N.pick(s, role(s, 'mafia')[0].id));
  assert.equal(N.canAdvance(s), false);
  const [a, b] = town(s);
  assert.equal(N.pick(s, a.id), null);
  assert.equal(N.canAdvance(s), false);
  assert.equal(N.confirmKill(s), true);
  assert.ok(N.pick(s, b.id));
  assert.equal(s.picks.kill, a.id);
});

test('detective result is accurate and logged', () => {
  const s = game();
  toNight(s);
  const det = role(s, 'detective')[0];
  const mafia = role(s, 'mafia')[0];
  while (N.currentStep(s).kind !== 'detective') {
    const step = N.currentStep(s);
    if (step.kind === 'mafia') { N.pick(s, town(s).find(p => p.id !== det.id).id); N.confirmKill(s); }
    if (step.kind === 'doctor') N.pick(s, det.id);
    N.advanceNight(s);
  }
  assert.ok(!N.stepTargets(s).some(p => p.id === det.id), 'detective cannot investigate self');
  N.pick(s, mafia.id);
  assert.deepEqual(N.detectiveResult(s), { target: mafia, guilty: true });
  N.pick(s, town(s).find(p => p.id !== det.id).id);
  assert.equal(N.detectiveResult(s).guilty, false);
  N.advanceNight(s);
  const log = s.history.find(h => h.type === 'investigate');
  assert.equal(log.actor, det.id);
  assert.equal(log.guilty, false);
});

test("a dead doctor's step is still read but needs no pick and saves nobody", () => {
  const s = game();
  toNight(s);
  const doc = role(s, 'doctor')[0];
  const victim = town(s).find(p => p.id !== doc.id);
  playNight(s, doc.id, victim.id);
  assert.equal(doc.alive, false);
  N.startDay(s); N.startVote(s); N.closeVote(s); // no votes -> no elimination
  assert.equal(s.verdict.eliminated, null);
  assert.equal(s.verdict.tie, false);
  assert.equal(N.beginNight(s), true);
  const docStep = s.steps.find(x => x.kind === 'doctor');
  assert.ok(docStep, 'doctor step still present');
  assert.equal(N.actorAlive(s, docStep), false);
  assert.deepEqual(N.stepTargets(s, docStep), []);
  const events = playNight(s, victim.id, victim.id);
  assert.deepEqual(events, ['killed', 'dawn']);
  assert.equal(victim.alive, false);
});

test('votes are capped at the living count; plurality eliminates, ties do not', () => {
  const s = game();
  toNight(s);
  const [victim, other] = town(s).map(p => p.id);
  playNight(s, victim, other);
  assert.equal(N.startVote(s), false, 'must discuss first');
  N.startDay(s);
  N.startVote(s);
  const ids = Object.keys(s.voteCounts);
  assert.ok(!ids.includes(victim), 'dead players are not on the ballot');
  assert.equal(N.adjustVote(s, ids[0], -1), false);
  for (let i = 0; i < ids.length; i++) assert.equal(N.adjustVote(s, ids[0], 1), true);
  assert.equal(N.adjustVote(s, ids[1], 1), false, 'cannot exceed one vote per living player');
  N.adjustVote(s, ids[0], -1);
  N.adjustVote(s, ids[1], 1);
  N.closeVote(s);
  assert.equal(s.verdict.eliminated, ids[0]);
  assert.equal(N.byId(s, ids[0]).alive, false);

  const t = game();
  toNight(t);
  const [v2, o2] = town(t).map(p => p.id);
  playNight(t, v2, o2);
  N.startDay(t); N.startVote(t);
  const [x, y] = Object.keys(t.voteCounts);
  N.adjustVote(t, x, 1); N.adjustVote(t, x, 1); N.adjustVote(t, y, 1); N.adjustVote(t, y, 1);
  N.closeVote(t);
  assert.equal(t.verdict.eliminated, null);
  assert.equal(t.verdict.tie, true);
  assert.equal(t.phase, 'verdict');
});

function voteOut(s, id) {
  N.startDay(s); N.startVote(s);
  N.adjustVote(s, id, 1);
  N.closeVote(s);
}

test('town wins when every mafia member is voted out', () => {
  const s = game();
  toNight(s);
  for (const m of role(s, 'mafia')) {
    if (s.phase !== 'night') N.beginNight(s);
    const [victim, protect] = [town(s)[0].id, town(s)[0].id];
    playNight(s, victim, protect);
    voteOut(s, m.id);
  }
  assert.equal(s.phase, 'over');
  assert.equal(s.winner, 'town');
});

test('mafia wins at parity', () => {
  const s = game(['A', 'B', 'C', 'D', 'E']);
  toNight(s);
  let guard = 0;
  while (s.phase !== 'over' && guard++ < 10) {
    if (s.phase !== 'night') N.beginNight(s);
    const [victim, other] = town(s).map(p => p.id);
    playNight(s, victim, other ?? victim);
    if (s.phase === 'over') break;
    voteOut(s, town(s)[0].id);
  }
  assert.equal(s.winner, 'mafia');
  const mafia = s.players.filter(p => p.alive && p.role === 'mafia').length;
  assert.ok(mafia >= town(s).length);
});

test('a new deal with the same names reshuffles the killers', () => {
  const sets = new Set();
  for (let i = 0; i < 40; i++) sets.add(N.newNarratorGame(NAMES).players.filter(p => p.role === 'mafia').map(p => p.name).sort().join());
  assert.ok(sets.size > 5, `only ${sets.size} distinct mafia sets`);
});
