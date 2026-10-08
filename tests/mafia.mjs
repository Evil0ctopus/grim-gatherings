import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_PLAYERS, MAX_PLAYERS, roleCounts, roleDeck, deal, startGame, acknowledgeRole, submitNightAction,
  nightComplete, mafiaConsensus, castVote, tally, forceAdvance, tick, winner, viewFor, validNightTargets,
} from '../js/mafia/engine.js';

const lobby = n => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Player ${i}` }));
const seeded = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const byRole = (s, role) => s.players.filter(p => p.role === role && p.alive);
const ROLE_WORDS = /"role":"(mafia|doctor|detective|town)"/g;

function begin(n, settings = {}, rng) {
  const s = startGame(lobby(n), settings, { rng, now: 0 });
  for (const p of s.players) acknowledgeRole(s, p.id);
  assert.equal(s.phase, 'night');
  return s;
}

// Every living player acts; mafia agree on `kill`, doctor protects `save`.
function playNight(s, { kill, save, investigate } = {}) {
  const town = s.players.filter(p => p.alive && p.role !== 'mafia');
  kill ??= town.find(p => p.role === 'town')?.id ?? town[0].id;
  for (const p of s.players.filter(x => x.alive)) {
    const targets = validNightTargets(s, p.id);
    const pick = p.role === 'mafia' ? kill : p.role === 'doctor' ? (save ?? byRole(s, 'mafia')[0]?.id ?? p.id) : p.role === 'detective' ? (investigate ?? targets[0]) : targets[0];
    if (s.phase === 'night') assert.deepEqual(submitNightAction(s, p.id, pick, 0), { ok: true });
  }
}

test('role counts follow the ratio table for every lobby size 5-18', () => {
  const expectedMafia = { 5: 1, 6: 1, 7: 2, 8: 2, 9: 2, 10: 2, 11: 3, 12: 3, 13: 3, 14: 3, 15: 4, 16: 4, 17: 4, 18: 4 };
  for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
    const c = roleCounts(n);
    assert.equal(c.mafia, expectedMafia[n], `mafia at ${n}`);
    const helpers = n >= 13 ? 2 : 1;
    assert.equal(c.doctor, helpers, `doctors at ${n}`); assert.equal(c.detective, helpers, `detectives at ${n}`);
    assert.equal(c.mafia + c.doctor + c.detective + c.town, n);
    assert.ok(c.town >= 1);
    assert.ok(c.mafia < n - c.mafia, 'mafia never start at parity');
    assert.equal(roleDeck(n).length, n);
    const dealt = Object.values(deal(lobby(n).map(p => p.id)));
    for (const role of ['mafia', 'doctor', 'detective', 'town']) assert.equal(dealt.filter(r => r === role).length, c[role]);
  }
  assert.throws(() => roleCounts(4)); assert.throws(() => roleCounts(19));
  assert.throws(() => startGame(lobby(4)));
});

test('killers vary across many deals (every seat is mafia at a fair rate)', () => {
  const n = 9, deals = 3000, ids = lobby(n).map(p => p.id);
  const hits = Object.fromEntries(ids.map(id => [id, 0]));
  const sets = new Set();
  for (let i = 0; i < deals; i++) {
    const roles = deal(ids);
    const mafia = ids.filter(id => roles[id] === 'mafia');
    mafia.forEach(id => hits[id]++);
    sets.add(mafia.join(','));
  }
  const expected = deals * roleCounts(n).mafia / n;
  for (const id of ids) assert.ok(Math.abs(hits[id] - expected) < expected * 0.2, `${id} was mafia ${hits[id]} times, expected ~${expected}`);
  assert.ok(sets.size >= 30, `only ${sets.size} distinct killer pairs of 36`);
  const chi = ids.reduce((sum, id) => sum + (hits[id] - expected) ** 2 / expected, 0);
  assert.ok(chi < 26.1, `chi-square ${chi.toFixed(1)} exceeds p=0.001 for 8 df`);
});

test('play again re-deals: consecutive games from the same lobby change the killers', () => {
  const players = lobby(10);
  const killerSets = new Set();
  for (let g = 1; g <= 40; g++) {
    const s = startGame(players, {}, { gameNumber: g });
    assert.equal(s.gameNumber, g);
    assert.ok(s.players.every(p => p.alive) && s.history.length === 0 && s.detectiveLog.length === 0);
    killerSets.add(byRole(s, 'mafia').map(p => p.id).sort().join(','));
  }
  assert.ok(killerSets.size >= 20, `40 games produced only ${killerSets.size} killer sets`);
});

test('mafia must agree; a doctor save cancels the kill', () => {
  const s = begin(9, {}, seeded(7));
  const [m1, m2] = byRole(s, 'mafia');
  const doctor = byRole(s, 'doctor')[0];
  const victims = s.players.filter(p => p.role === 'town');
  assert.equal(submitNightAction(s, m1.id, victims[0].id).ok, true);
  assert.equal(submitNightAction(s, m2.id, victims[1].id).ok, true);
  assert.equal(mafiaConsensus(s), null);
  assert.equal(submitNightAction(s, m1.id, m2.id).ok, false, 'mafia cannot target mafia');
  for (const p of s.players.filter(p => p.role !== 'mafia')) submitNightAction(s, p.id, p.role === 'doctor' ? victims[1].id : validNightTargets(s, p.id)[0]);
  assert.equal(nightComplete(s), false, 'disagreeing mafia hold the night open');
  assert.equal(s.phase, 'night');
  submitNightAction(s, m1.id, victims[1].id, 0);
  assert.equal(s.phase, 'dawn');
  assert.equal(victims[1].alive, true);
  assert.deepEqual(s.announcement, { night: 1, killed: null, role: null });
  assert.deepEqual(s.history.at(-1), { type: 'night', night: 1, target: victims[1].id, saved: true, killed: null });
  assert.equal(submitNightAction(s, doctor.id, doctor.id).ok, false, 'no night actions by day');
});

test('13+ players: two doctors (either one saves) and two detectives with private results', () => {
  const s = begin(13, {}, seeded(5));
  const doctors = byRole(s, 'doctor'), detectives = byRole(s, 'detective'), mafia = byRole(s, 'mafia');
  assert.equal(doctors.length, 2); assert.equal(detectives.length, 2);
  const victim = s.players.find(p => p.role === 'town');
  for (const p of s.players) {
    const pick = p.role === 'mafia' ? victim.id
      : p.id === doctors[0].id ? doctors[0].id
      : p.id === doctors[1].id ? victim.id
      : p.id === detectives[0].id ? mafia[0].id
      : p.id === detectives[1].id ? victim.id
      : validNightTargets(s, p.id)[0];
    submitNightAction(s, p.id, pick, 0);
  }
  assert.equal(s.phase, 'dawn');
  assert.equal(victim.alive, true, 'the second doctor saved the victim');
  assert.deepEqual(viewFor(s, detectives[0].id).investigations, [{ night: 1, target: mafia[0].id, guilty: true }]);
  assert.deepEqual(viewFor(s, detectives[1].id).investigations, [{ night: 1, target: victim.id, guilty: false }]);
});

test('unsaved victim dies; the detective gets an accurate private result', () => {
  const s = begin(7, {}, seeded(11));
  const detective = byRole(s, 'detective')[0];
  const mafia = byRole(s, 'mafia')[0];
  const victim = s.players.find(p => p.role === 'town');
  playNight(s, { kill: victim.id, save: byRole(s, 'doctor')[0].id, investigate: mafia.id });
  assert.equal(victim.alive, false);
  assert.equal(s.announcement.killed, victim.id);
  assert.equal(s.announcement.role, 'town');
  assert.deepEqual(viewFor(s, detective.id).investigations, [{ night: 1, target: mafia.id, guilty: true }]);
  for (const p of s.players.filter(p => p.id !== detective.id)) assert.equal(viewFor(s, p.id).investigations, undefined);
  assert.ok(!JSON.stringify(viewFor(s, null)).includes('guilty'));
  assert.equal(submitNightAction(s, detective.id, mafia.id).ok, false);
});

test('plurality vote: ties and empty votes eliminate nobody; dead players cannot vote or act', () => {
  assert.equal(tally({ a: 'x', b: 'x', c: 'y' }).eliminated, 'x');
  assert.equal(tally({ a: 'x', b: 'y' }).eliminated, null);
  assert.equal(tally({}).eliminated, null);

  const s = begin(7, {}, seeded(3));
  const victim = s.players.find(p => p.role === 'town');
  playNight(s, { kill: victim.id, save: byRole(s, 'mafia')[0].id });
  forceAdvance(s, 0); forceAdvance(s, 0);
  assert.equal(s.phase, 'vote');
  assert.equal(castVote(s, victim.id, s.players[0].id).ok, false, 'dead cannot vote');
  const alive = s.players.filter(p => p.alive);
  assert.equal(castVote(s, alive[0].id, alive[0].id).ok, false, 'no self votes');
  assert.equal(castVote(s, alive[0].id, victim.id).ok, false, 'no votes for the dead');
  castVote(s, alive[0].id, alive[1].id); castVote(s, alive[1].id, alive[0].id);
  forceAdvance(s, 0);
  assert.equal(s.phase, 'verdict');
  assert.equal(s.verdict.eliminated, null); assert.equal(s.verdict.tie, true);
  assert.equal(s.players.filter(p => p.alive).length, alive.length);

  forceAdvance(s, 0);
  assert.equal(s.phase, 'night');
  assert.equal(submitNightAction(s, victim.id, alive[0].id).ok, false, 'dead cannot act at night');
  const deadView = viewFor(s, victim.id);
  assert.equal(deadView.task, undefined); assert.equal(deadView.targets, undefined); assert.equal(deadView.mafiaPicks, undefined);
});

test('town wins when the last mafia is voted out; the game-over view reveals every role', () => {
  const s = begin(5, { revealRoleOnDeath: false }, seeded(21));
  const mafia = byRole(s, 'mafia')[0];
  const doctor = byRole(s, 'doctor')[0];
  playNight(s, { kill: doctor.id, save: doctor.id });
  assert.equal(s.phase, 'dawn');
  forceAdvance(s, 0); forceAdvance(s, 0);
  for (const p of s.players.filter(p => p.alive && p.id !== mafia.id)) castVote(s, p.id, mafia.id, 0);
  castVote(s, mafia.id, doctor.id, 0);
  assert.equal(s.phase, 'over');
  assert.equal(s.winner, 'town');
  assert.equal(s.verdict.role, null, 'role hidden on death when the setting is off');
  const table = viewFor(s, null);
  assert.ok(table.roster.every(r => r.role), 'all roles revealed at game over');
  assert.equal(table.roster.find(r => r.id === mafia.id).role, 'mafia');
});

test('mafia win at parity', () => {
  const s = begin(5, {}, seeded(5));
  // Night 1: kill a townsperson (5 -> 4 alive, 1 mafia vs 3).
  playNight(s, { kill: s.players.find(p => p.role === 'town').id, save: byRole(s, 'mafia')[0].id });
  assert.equal(s.phase, 'dawn');
  forceAdvance(s, 0); forceAdvance(s, 0);
  // Town eliminates the doctor by mistake (4 -> 3, 1 mafia vs 2).
  const doctor = byRole(s, 'doctor')[0];
  for (const p of s.players.filter(p => p.alive && p.id !== doctor.id)) castVote(s, p.id, doctor.id, 0);
  castVote(s, doctor.id, byRole(s, 'mafia')[0].id, 0);
  assert.equal(s.phase, 'verdict');
  assert.equal(s.verdict.eliminated, doctor.id);
  forceAdvance(s, 0);
  // Night 2: mafia kill again (3 -> 2, 1 mafia vs 1) -> mafia win.
  playNight(s, { kill: byRole(s, 'detective')[0].id });
  assert.equal(s.phase, 'over');
  assert.equal(s.winner, 'mafia');
  assert.equal(winner(s), 'mafia');
});

test('no role ever leaks: views hold only your own role and, for mafia, teammates', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const s = begin(11, { revealRoleOnDeath: false }, seeded(seed));
    const mafiaIds = byRole(s, 'mafia').map(p => p.id);
    let rounds = 0;
    while (s.phase !== 'over' && rounds++ < 80) {
      for (const p of s.players) {
        const v = viewFor(s, p.id);
        const json = JSON.stringify(v);
        assert.equal(v.me.role, p.role);
        const roleMentions = [...json.matchAll(ROLE_WORDS)].length;
        if (s.phase !== 'over') assert.equal(roleMentions, 1, `${p.role} view in ${s.phase} mentions ${roleMentions} roles`);
        assert.ok(v.roster.every(r => !('role' in r)) || s.phase === 'over');
        if (p.role === 'mafia') assert.deepEqual(v.team.map(t => t.id).sort(), mafiaIds.slice().sort());
        else { assert.equal(v.team, undefined); assert.equal(v.mafiaPicks, undefined); assert.equal(v.consensus, undefined); }
        if (p.role !== 'detective') assert.equal(v.investigations, undefined);
        assert.ok(!json.includes('"nightActions"') && !json.includes('"detectiveLog"') && !json.includes('"protect":{'));
      }
      const table = JSON.stringify(viewFor(s, null));
      if (s.phase !== 'over') assert.equal([...table.matchAll(ROLE_WORDS)].length, 0, `table view leaks a role in ${s.phase}`);
      if (s.phase === 'night') playNight(s);
      else forceAdvance(s, 0);
    }
    assert.equal(s.phase, 'over');
  }
});

test('timers advance dawn, day, vote and verdict but never night or reveal', () => {
  const s = startGame(lobby(6), { discussionSeconds: 240, pauseSeconds: 5 }, { rng: seeded(2), now: 0 });
  assert.equal(tick(s, 1e12), false); assert.equal(s.phase, 'reveal');
  forceAdvance(s, 0);
  assert.equal(tick(s, 1e12), false); assert.equal(s.phase, 'night');
  playNight(s, { save: s.players.find(p => p.role === 'town').id });
  assert.equal(s.phase, 'dawn'); assert.equal(s.endsAt, 5000);
  assert.equal(tick(s, 4999), false);
  assert.equal(tick(s, 5000), true); assert.equal(s.phase, 'day'); assert.equal(s.endsAt, 5000 + 240000);
  tick(s, s.endsAt); assert.equal(s.phase, 'vote');
  tick(s, s.endsAt); assert.equal(s.phase, 'verdict'); assert.equal(s.verdict.eliminated, null);
  tick(s, s.endsAt); assert.equal(s.phase, 'night'); assert.equal(s.night, 2);
});
