// One-phone narrator mode: the narrator holds the only device and enters what the players point to.
// Pure state transitions (no DOM) so the rules can be unit-tested. Reuses the deal, win and vote rules from engine.js.
import { deal, winner, tally, normalizeSettings, cryptoRandom, MIN_PLAYERS, MAX_PLAYERS } from './engine.js?v=rules-repair-v1';

export function cleanNames(names) {
  const seen = new Set();
  const out = [];
  for (const raw of names) {
    const name = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 24);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push(name);
  }
  return out;
}

export function publicHistory(game) {
  return game.history.filter(event => event.type === 'night' || event.type === 'vote').map(event => {
    const id = event.type === 'night' ? event.killed : event.eliminated;
    const player = game.players.find(player => player.id === id);
    return {
      type: event.type,
      number: event.type === 'night' ? event.night : event.day,
      eliminated: id || null,
      role: player && (game.settings.revealRoleOnDeath || game.phase === 'over') ? player.role : null,
      tie: event.type === 'vote' && !!event.tie,
    };
  });
}

export function newNarratorGame(names, settings = {}, { rng = cryptoRandom, gameNumber = 1 } = {}) {
  const list = cleanNames(names);
  if (list.length < MIN_PLAYERS || list.length > MAX_PLAYERS) throw new Error(`Mafia needs ${MIN_PLAYERS}-${MAX_PLAYERS} players (got ${list.length}).`);
  const ids = list.map((_, i) => `p${i + 1}`);
  const roles = deal(ids, rng);
  const s = {
    mode: 'narrator',
    gameNumber,
    settings: { ...normalizeSettings(settings), sound: settings.sound !== false, voice: !!settings.voice },
    players: list.map((name, i) => ({ id: ids[i], name, role: roles[ids[i]], alive: true })),
    phase: 'pass',
    passIndex: 0,
    passShown: false,
    night: 0,
    day: 0,
    steps: [],
    step: 0,
    picks: null,
    announcement: null,
    voteCounts: {},
    verdict: null,
    history: [],
    winner: null,
  };
  return s;
}

export const byId = (s, id) => s.players.find(p => p.id === id);
export const livingPlayers = s => s.players.filter(p => p.alive);
const ofRole = (s, role) => s.players.filter(p => p.role === role);

// Pass-around reveal: each player looks at their own role, then hands the phone on.
export function showPassRole(s) { if (s.phase === 'pass') s.passShown = true; }
export function nextPass(s) {
  if (s.phase !== 'pass') return;
  s.passShown = false;
  s.passIndex++;
  if (s.passIndex >= s.players.length) s.phase = 'ready';
}
export function skipPass(s) { if (s.phase === 'pass') { s.passShown = false; s.phase = 'ready'; } }

// Night order is fixed by the dealt deck, not by who is still alive, so a dead Doctor's turn is still read aloud
// (the table never learns a role is gone from a skipped line).
export function beginNight(s) {
  if (!['ready', 'verdict'].includes(s.phase)) return false;
  s.night++;
  s.phase = 'night';
  s.steps = [
    { kind: 'sleep' },
    { kind: 'mafia' },
    ...ofRole(s, 'doctor').map(p => ({ kind: 'doctor', actor: p.id })),
    ...ofRole(s, 'detective').map(p => ({ kind: 'detective', actor: p.id })),
    { kind: 'wake' },
  ];
  s.step = 0;
  s.picks = { kill: null, killConfirmed: false, protects: {}, investigations: {}, saved: null };
  s.announcement = null;
  s.verdict = null;
  return true;
}

export const currentStep = s => (s.phase === 'night' ? s.steps[s.step] : null);
export const actorAlive = (s, step) => !step?.actor || !!byId(s, step.actor)?.alive;

export function stepTargets(s, step = currentStep(s)) {
  if (!step || !actorAlive(s, step)) return [];
  const alive = livingPlayers(s);
  if (step.kind === 'mafia') return alive.filter(p => p.role !== 'mafia');
  if (step.kind === 'doctor') return alive;
  if (step.kind === 'detective') return alive.filter(p => p.id !== step.actor);
  return [];
}

// Records what the players pointed to for the current step. Returns an error string or null.
export function pick(s, targetId) {
  const step = currentStep(s);
  if (!step) return 'Not a night step.';
  if (step.kind === 'mafia' && s.picks.killConfirmed) return 'The kill is already locked in.';
  if (!stepTargets(s, step).some(p => p.id === targetId)) return 'That player cannot be picked here.';
  if (step.kind === 'mafia') s.picks.kill = targetId;
  else if (step.kind === 'doctor') s.picks.protects[step.actor] = targetId;
  else if (step.kind === 'detective') s.picks.investigations[step.actor] = targetId;
  return null;
}

export function confirmKill(s) {
  const step = currentStep(s);
  if (step?.kind !== 'mafia' || !s.picks.kill) return false;
  s.picks.killConfirmed = true;
  return true;
}

export function detectiveResult(s, step = currentStep(s)) {
  const t = step?.kind === 'detective' && byId(s, s.picks.investigations[step.actor]);
  return t ? { target: t, guilty: t.role === 'mafia' } : null;
}

export function canAdvance(s) {
  const step = currentStep(s);
  if (!step) return false;
  if (!actorAlive(s, step)) return true;
  if (step.kind === 'mafia') return s.picks.killConfirmed;
  if (step.kind === 'doctor') return !!s.picks.protects[step.actor];
  if (step.kind === 'detective') return !!s.picks.investigations[step.actor];
  return true;
}

const lastOfKind = (s, kind) => s.steps.map(x => x.kind).lastIndexOf(kind);

// Advances to the next night step. Returns an event name for the UI to play ('saved' / 'killed') when the
// last Doctor step closes, or 'dawn' when the night ends.
export function advanceNight(s) {
  if (!canAdvance(s)) return null;
  const step = currentStep(s);
  let event = null;
  if (step.kind === 'doctor' && s.step === lastOfKind(s, 'doctor')) {
    s.picks.saved = Object.values(s.picks.protects).includes(s.picks.kill);
    event = s.picks.saved ? 'saved' : 'killed';
  }
  if (step.kind === 'detective') {
    const r = detectiveResult(s, step);
    if (r) s.history.push({ type: 'investigate', night: s.night, actor: step.actor, target: r.target.id, guilty: r.guilty });
  }
  if (step.kind === 'wake') { resolveDawn(s); return 'dawn'; }
  s.step++;
  return event;
}

function resolveDawn(s) {
  const victim = s.picks.saved ? null : byId(s, s.picks.kill);
  if (victim) victim.alive = false;
  s.day++;
  s.announcement = {
    night: s.night,
    target: s.picks.kill,
    killed: victim?.id ?? null,
    role: victim && s.settings.revealRoleOnDeath ? victim.role : null,
    savedBy: s.picks.saved ? Object.keys(s.picks.protects).filter(d => s.picks.protects[d] === s.picks.kill) : [],
  };
  s.history.push({ type: 'night', night: s.night, ...s.announcement });
  s.phase = 'dawn';
  finishIfWon(s);
}

export function startDay(s) {
  if (s.phase !== 'dawn') return false;
  s.phase = 'day';
  return true;
}

export function startVote(s) {
  if (s.phase !== 'day') return false;
  s.phase = 'vote';
  s.voteCounts = Object.fromEntries(livingPlayers(s).map(p => [p.id, 0]));
  return true;
}

export const votesCast = s => Object.values(s.voteCounts).reduce((a, b) => a + b, 0);

// The narrator counts raised hands. Each living player has one vote, so the total cannot exceed the living count.
export function adjustVote(s, id, delta) {
  if (s.phase !== 'vote' || !(id in s.voteCounts)) return false;
  const next = s.voteCounts[id] + delta;
  if (next < 0) return false;
  if (delta > 0 && votesCast(s) >= livingPlayers(s).length) return false;
  s.voteCounts[id] = next;
  return true;
}

export function closeVote(s) {
  if (s.phase !== 'vote' || votesCast(s) === 0) return false;
  const ballots = {};
  let n = 0;
  for (const [id, c] of Object.entries(s.voteCounts)) for (let i = 0; i < c; i++) ballots[`b${n++}`] = id;
  const r = tally(ballots);
  const out = r.eliminated ? byId(s, r.eliminated) : null;
  if (out) out.alive = false;
  s.verdict = {
    day: s.day, counts: { ...s.voteCounts }, eliminated: out?.id ?? null,
    tie: !out && r.top > 0, role: out && s.settings.revealRoleOnDeath ? out.role : null,
  };
  s.history.push({ type: 'vote', ...s.verdict });
  s.phase = 'verdict';
  finishIfWon(s);
  return true;
}

function finishIfWon(s) {
  const w = winner(s);
  if (!w) return;
  s.winner = w;
  s.phase = 'over';
}

export { MIN_PLAYERS, MAX_PLAYERS };
