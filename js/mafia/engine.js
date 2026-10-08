// Mafia mode rules engine. Pure state transitions; the host device is the only holder of the full state.
// Player count is whoever is in the lobby (5-18); role counts scale from the standard ratio table.
export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 18;
export const ROLES = ['mafia', 'doctor', 'detective', 'town'];
export const ROLE_INFO = {
  mafia: { name: 'Mafia', team: 'mafia', blurb: 'Each night, agree with your fellow mafia on one victim. By day, blend in with the town, deflect suspicion and vote.' },
  doctor: { name: 'Doctor', team: 'town', blurb: 'Each night, protect one player (yourself included). If the mafia chose that player, nobody dies.' },
  detective: { name: 'Detective', team: 'town', blurb: 'Each night, investigate one player and learn privately whether they are guilty (mafia) or innocent.' },
  town: { name: 'Townsperson', team: 'town', blurb: 'You have no night power. By day, listen closely, find the mafia and vote them out.' },
};
export const DISCUSSION_CHOICES = [180, 240, 300];
export const DEFAULT_SETTINGS = Object.freeze({ discussionSeconds: 180, voteSeconds: 90, revealRoleOnDeath: true, pauseSeconds: 10 });

export function cryptoRandom() {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
}

// Roughly one mafia per 3-4 players: 5-6 -> 1, 7-10 -> 2, 11-14 -> 3, 15-18 -> 4.
// At 13+ players the town gets a second doctor and a second detective.
export function roleCounts(n) {
  if (!Number.isInteger(n) || n < MIN_PLAYERS || n > MAX_PLAYERS) throw new Error(`Mafia needs ${MIN_PLAYERS}-${MAX_PLAYERS} players (got ${n}).`);
  const mafia = Math.max(1, Math.floor((n + 1) / 4));
  const helpers = n >= 13 ? 2 : 1;
  return { mafia, doctor: helpers, detective: helpers, town: n - mafia - 2 * helpers };
}

export function roleDeck(n) {
  const c = roleCounts(n);
  return ROLES.flatMap(role => Array(c[role]).fill(role));
}

export function shuffled(items, rng = cryptoRandom) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function deal(playerIds, rng = cryptoRandom) {
  const deck = shuffled(roleDeck(playerIds.length), rng);
  return Object.fromEntries(playerIds.map((id, i) => [id, deck[i]]));
}

export function normalizeSettings(s = {}) {
  const out = { ...DEFAULT_SETTINGS };
  if (DISCUSSION_CHOICES.includes(Number(s.discussionSeconds))) out.discussionSeconds = Number(s.discussionSeconds);
  if (Number.isFinite(Number(s.voteSeconds)) && Number(s.voteSeconds) >= 30) out.voteSeconds = Math.min(600, Number(s.voteSeconds));
  if (typeof s.revealRoleOnDeath === 'boolean') out.revealRoleOnDeath = s.revealRoleOnDeath;
  if (Number.isFinite(Number(s.pauseSeconds)) && Number(s.pauseSeconds) >= 0) out.pauseSeconds = Math.min(60, Number(s.pauseSeconds));
  return out;
}

export function startGame(lobby, settings = {}, { rng = cryptoRandom, now = Date.now(), gameNumber = 1 } = {}) {
  const players = lobby.map(p => ({ id: String(p.id), name: String(p.name) }));
  if (new Set(players.map(p => p.id)).size !== players.length) throw new Error('Duplicate player ids.');
  const roles = deal(players.map(p => p.id), rng);
  return {
    gameNumber,
    settings: normalizeSettings(settings),
    players: players.map(p => ({ ...p, role: roles[p.id], alive: true })),
    phase: 'reveal',
    ready: [],
    night: 0,
    day: 0,
    nightActions: emptyNight(),
    detectiveLog: [],
    votes: {},
    endsAt: null,
    announcement: null,
    verdict: null,
    history: [],
    winner: null,
    startedAt: now,
  };
}

function emptyNight() { return { mafia: {}, protect: {}, investigate: {}, suspect: {} }; }

const player = (s, id) => s.players.find(p => p.id === id);
const living = s => s.players.filter(p => p.alive);
const livingMafia = s => living(s).filter(p => p.role === 'mafia');

export function winner(s) {
  const mafia = livingMafia(s).length;
  const town = living(s).length - mafia;
  if (mafia === 0) return 'town';
  if (mafia >= town) return 'mafia';
  return null;
}

export function acknowledgeRole(s, id) {
  if (s.phase !== 'reveal' || !player(s, id) || s.ready.includes(id)) return false;
  s.ready.push(id);
  if (s.ready.length === s.players.length) beginNight(s);
  return true;
}

export function beginNight(s) {
  s.phase = 'night';
  s.night += 1;
  s.nightActions = emptyNight();
  s.endsAt = null;
  s.votes = {};
  s.verdict = null;
}

// Which night action a living player owes. Townspeople make a decoy "suspect" pick so every phone looks equally busy.
export function nightTask(s, id) {
  const p = player(s, id);
  if (!p || !p.alive || s.phase !== 'night') return null;
  return { mafia: 'kill', doctor: 'protect', detective: 'investigate', town: 'suspect' }[p.role];
}

export function validNightTargets(s, id) {
  const task = nightTask(s, id);
  if (!task) return [];
  return living(s).filter(t => {
    if (task === 'kill') return t.role !== 'mafia';
    if (task === 'protect') return true;
    return t.id !== id;
  }).map(t => t.id);
}

export function mafiaConsensus(s) {
  const mafia = livingMafia(s);
  if (!mafia.length) return null;
  const picks = mafia.map(m => s.nightActions.mafia[m.id]);
  return picks.every(t => t && t === picks[0]) ? picks[0] : null;
}

function hasActed(s, p) {
  const a = s.nightActions;
  if (p.role === 'mafia') return !!mafiaConsensus(s);
  if (p.role === 'doctor') return p.id in a.protect;
  if (p.role === 'detective') return p.id in a.investigate;
  return p.id in a.suspect;
}

export function nightComplete(s) {
  return s.phase === 'night' && living(s).every(p => hasActed(s, p));
}

export function submitNightAction(s, id, targetId, now = Date.now()) {
  const task = nightTask(s, id);
  if (!task) return { ok: false, error: 'You have no night action right now.' };
  if (!validNightTargets(s, id).includes(targetId)) return { ok: false, error: 'That player cannot be chosen.' };
  const a = s.nightActions;
  if (task === 'kill') a.mafia[id] = targetId;
  else if (task === 'protect') { if (id in a.protect) return { ok: false, error: 'You already chose tonight.' }; a.protect[id] = targetId; }
  else if (task === 'investigate') {
    if (id in a.investigate) return { ok: false, error: 'You already investigated tonight.' };
    a.investigate[id] = targetId;
    s.detectiveLog.push({ detective: id, night: s.night, target: targetId, guilty: player(s, targetId).role === 'mafia' });
  } else { if (id in a.suspect) return { ok: false, error: 'You already chose tonight.' }; a.suspect[id] = targetId; }
  if (nightComplete(s)) resolveNight(s, now);
  return { ok: true };
}

// Resolution order: mafia kill -> doctor save cancels it. Detective results were recorded privately when submitted.
export function resolveNight(s, now = Date.now()) {
  if (s.phase !== 'night') return;
  const target = mafiaConsensus(s);
  const saved = !!target && Object.values(s.nightActions.protect).includes(target);
  let killed = null;
  if (target && !saved) {
    player(s, target).alive = false;
    killed = target;
  }
  s.announcement = { night: s.night, killed, role: killed && s.settings.revealRoleOnDeath ? player(s, killed).role : null };
  s.history.push({ type: 'night', night: s.night, target, saved, killed });
  s.day += 1;
  s.phase = 'dawn';
  s.endsAt = now + s.settings.pauseSeconds * 1000;
  finishIfWon(s);
}

export function startDiscussion(s, now = Date.now()) {
  if (s.phase !== 'dawn') return false;
  s.phase = 'day';
  s.endsAt = now + s.settings.discussionSeconds * 1000;
  return true;
}

export function startVote(s, now = Date.now()) {
  if (s.phase !== 'day') return false;
  s.phase = 'vote';
  s.votes = {};
  s.endsAt = now + s.settings.voteSeconds * 1000;
  return true;
}

export function castVote(s, id, targetId, now = Date.now()) {
  const p = player(s, id), t = player(s, targetId);
  if (s.phase !== 'vote') return { ok: false, error: 'Voting is not open.' };
  if (!p?.alive) return { ok: false, error: 'Eliminated players cannot vote.' };
  if (!t?.alive || t.id === id) return { ok: false, error: 'Vote for another living player.' };
  s.votes[id] = targetId;
  if (living(s).every(l => l.id in s.votes)) closeVote(s, now);
  return { ok: true };
}

// Plurality: the single top vote-getter is eliminated. A tie for the most votes (or no votes) eliminates no one.
export function tally(votes) {
  const counts = {};
  for (const t of Object.values(votes)) counts[t] = (counts[t] || 0) + 1;
  const top = Math.max(0, ...Object.values(counts));
  const leaders = Object.keys(counts).filter(k => counts[k] === top);
  return { counts, top, leaders, eliminated: top > 0 && leaders.length === 1 ? leaders[0] : null };
}

export function closeVote(s, now = Date.now()) {
  if (s.phase !== 'vote') return false;
  const result = tally(s.votes);
  if (result.eliminated) player(s, result.eliminated).alive = false;
  s.verdict = {
    day: s.day, votes: { ...s.votes }, counts: result.counts, tie: !result.eliminated && result.top > 0,
    eliminated: result.eliminated,
    role: result.eliminated && s.settings.revealRoleOnDeath ? player(s, result.eliminated).role : null,
  };
  s.history.push({ type: 'vote', day: s.day, eliminated: result.eliminated, counts: result.counts });
  s.phase = 'verdict';
  s.endsAt = now + s.settings.pauseSeconds * 1000;
  finishIfWon(s);
  return true;
}

function finishIfWon(s) {
  const w = winner(s);
  if (!w) return;
  s.winner = w;
  s.phase = 'over';
  s.endsAt = null;
}

// Host forces progress when a player has wandered off. At night, an unresolved mafia disagreement means no kill.
export function forceAdvance(s, now = Date.now()) {
  if (s.phase === 'reveal') { s.ready = s.players.map(p => p.id); beginNight(s); }
  else if (s.phase === 'night') resolveNight(s, now);
  else if (s.phase === 'dawn') startDiscussion(s, now);
  else if (s.phase === 'day') startVote(s, now);
  else if (s.phase === 'vote') closeVote(s, now);
  else if (s.phase === 'verdict') beginNight(s);
  else return false;
  return true;
}

// Timed transitions driven by the host clock.
export function tick(s, now = Date.now()) {
  if (s.endsAt == null || now < s.endsAt) return false;
  if (['dawn', 'day', 'vote', 'verdict'].includes(s.phase)) return forceAdvance(s, now);
  return false;
}

function publicRole(s, p) {
  if (s.phase === 'over') return p.role;
  return !p.alive && s.settings.revealRoleOnDeath ? p.role : null;
}

// The ONLY data that leaves the host. id === null builds the table-screen view, which holds no secret roles.
export function viewFor(s, id = null) {
  const me = id ? player(s, id) : null;
  const v = {
    gameNumber: s.gameNumber,
    phase: s.phase, night: s.night, day: s.day, endsAt: s.endsAt,
    settings: { ...s.settings },
    counts: roleCounts(s.players.length),
    roster: s.players.map(p => {
      const r = { id: p.id, name: p.name, alive: p.alive };
      const role = publicRole(s, p);
      if (role) r.role = role;
      return r;
    }),
    readyCount: s.ready.length,
    announcement: s.announcement && s.phase !== 'night' ? { ...s.announcement } : null,
    verdict: s.verdict ? { ...s.verdict, votes: { ...s.verdict.votes }, counts: { ...s.verdict.counts } } : null,
    votes: s.phase === 'vote' ? { ...s.votes } : null,
    nightProgress: s.phase === 'night' ? { done: living(s).filter(p => hasActed(s, p)).length, of: living(s).length } : null,
    winner: s.winner,
  };
  if (!me) return v;
  v.me = { id: me.id, name: me.name, role: me.role, alive: me.alive, ready: s.ready.includes(me.id) };
  if (me.role === 'mafia') v.team = s.players.filter(p => p.role === 'mafia').map(p => ({ id: p.id, name: p.name, alive: p.alive }));
  if (me.role === 'detective') v.investigations = s.detectiveLog.filter(r => r.detective === me.id).map(({ night, target, guilty }) => ({ night, target, guilty }));
  if (s.phase === 'night' && me.alive) {
    const a = s.nightActions;
    v.task = nightTask(s, me.id);
    v.targets = validNightTargets(s, me.id);
    if (me.role === 'mafia') { v.mafiaPicks = { ...a.mafia }; v.consensus = mafiaConsensus(s); }
    v.myPick = me.role === 'mafia' ? a.mafia[me.id] ?? null : me.role === 'doctor' ? a.protect[me.id] ?? null : me.role === 'detective' ? a.investigate[me.id] ?? null : a.suspect[me.id] ?? null;
  }
  if (s.phase === 'vote') v.myVote = s.votes[me.id] ?? null;
  return v;
}
