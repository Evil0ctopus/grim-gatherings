export class DeveloperGameError extends Error {
  constructor(message) { super(message); this.status = 400; }
}
const requireGame = (condition, message) => { if (!condition) throw new DeveloperGameError(message); };

const games = [
  {
    id: 'lanternfall', title: 'The Lanternfall Covenant', kind: 'Occult deduction',
    premise: 'A fog-bound village renews three boundary lanterns. The Hollow have borrowed human faces and want the lights extinguished before the covenant is renewed.',
    locations: ['The Bridge', 'The Orchard', 'The Belfry'],
    loyal: 'Keepers', enemy: 'The Hollow',
    roles: {
      enemy: ['Hollow', 'Secretly extinguish one intact boundary lantern. Fellow Hollow are listed on your card. Coordinate quietly; hitting the same lantern only breaks it once.'],
      protector: ['Lamplighter', 'Ward one boundary lantern each night. A ward stops every Hollow touch there. You cannot ward the same place on consecutive nights.'],
      investigator: ['Bell Listener', 'Listen at a boundary lantern. At dawn you privately learn whether a Hollow touched it, even if a ward stopped them. This identifies a place, not a person.'],
      citizen: ['Night Watch', 'Watch a boundary lantern. At dawn you privately learn how many other players visited it, not their identities or allegiance.'],
    },
    rules: [
      '3-10 players, plus an optional non-playing moderator. There is one Hollow at 3-6 players and two at 7-10. There is always one Lamplighter and one Bell Listener; other loyal players are Night Watch.',
      'Four nights maximum. All secret actions resolve together. A broken lantern stays broken. Wards prevent damage, but cannot repair it. The public dawn report names the broken lanterns, never the visitors.',
      'After dawn, discuss freely, then each non-detained player casts one secret ballot for a suspect or abstains. A suspect is detained only with strictly more than half of all eligible votes. Ties and abstentions never create a detention.',
      'A detained player reveals their allegiance and remains as a non-voting witness. They cannot act at night or share hidden information they learned before detention. They can join discussion using public evidence only.',
      'After each council: Keepers win if all Hollow are detained. Otherwise the Hollow win if all three lanterns are broken. Otherwise Keepers win after the fourth council. There is no automatic parity victory; three-player games use these same objective rules.',
      'Give everyone a chance to speak. Private observations are fallible deductions: visitors may be loyal, a ward may hide damage, and absence of a Hollow touch does not clear a suspect.',
    ],
  },
  {
    id: 'ledger', title: 'The Black Ledger Society', kind: 'Underworld deduction',
    premise: 'At a midnight auction, a secret syndicate swaps genuine debt receipts for counterfeit ones. The honest bidders must identify the Forgers before the auction reserve collapses.',
    locations: [],
    loyal: 'Honest Bidders', enemy: 'The Forgers',
    roles: {
      enemy: ['Forger', 'Plant one counterfeit debt against another active bidder. An unshielded debt steals one influence and adds one loss to the reserve. Two Forgers hitting the same bidder cause only one loss.'],
      protector: ['Escrow Agent', 'Shield an active bidder, including yourself, from every counterfeit debt tonight. You cannot shield the same bidder on consecutive nights.'],
      investigator: ['Receipt Examiner', 'Inspect an active bidder, including yourself. At dawn you learn whether counterfeit debt was attempted against them, not who planted it.'],
      citizen: ['Credit Broker', 'Restore one influence to an active bidder, including yourself, up to three. Restoration happens after debt; it does not undo reserve losses.'],
    },
    rules: [
      '3-10 players, plus an optional non-playing moderator. There is one Forger at 3-6 players and two at 7-10. There is one Escrow Agent, one Receipt Examiner, and other honest players are Credit Brokers.',
      'Every bidder starts with three influence. Secret night actions resolve together: shields first, unique counterfeit targets second, credit restoration last. A debt adds a reserve loss even if its target already has zero influence. No player is eliminated by debt.',
      'The reserve can withstand two losses per starting Forger; the Forgers seek three losses per starting Forger. Four nights maximum. Dawn announces the loss total and everyone’s influence, not attackers or protected targets.',
      'Discuss the receipts, then every non-detained bidder casts a secret ballot for a suspect or abstains. Its weight is that bidder’s current influence, with a minimum of one. A suspect needs strictly more than half of all eligible ballot weight to be detained.',
      'Detention reveals allegiance and removes night actions and ballots, but leaves the player as a public-evidence-only discussion witness. Ties and abstentions do not detain anyone.',
      'After each auction council: Honest Bidders win if all Forgers are detained. Otherwise Forgers win at three reserve losses per starting Forger. Otherwise Honest Bidders win after the fourth council. Influence changes voting power, not allegiance.',
      'The examiner detects a victim, not a culprit. Low influence can make an innocent bidder look suspicious; credit can conceal damage. Use claims, timing, and weighted ballots together.',
    ],
  },
];

export function developerCatalog() { return structuredClone(games); }
function definition(id) {
  const game = games.find(g => g.id === id);
  requireGame(game, 'Choose a developer prototype.');
  return game;
}
export function createDeveloperGame(gameId, names, random = Math.random) {
  definition(gameId);
  requireGame(Array.isArray(names) && names.length >= 3 && names.length <= 10 &&
    names.every(n => typeof n === 'string' && n.trim().length > 0 && n.trim().length <= 40),
  'Enter 3-10 player names, each 1-40 characters.');
  names = names.map(n => n.trim());
  requireGame(new Set(names.map(n => n.toLowerCase())).size === names.length, 'Use a different name for each player.');
  const enemyCount = names.length >= 7 ? 2 : 1;
  const roles = [...Array(enemyCount).fill('enemy'), 'protector', 'investigator',
    ...Array(names.length - enemyCount - 2).fill('citizen')];
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return {
    version: 1, gameId, round: 1, phase: 'night', enemyCount,
    players: names.map((name, i) => ({ id: `p${i + 1}`, name, role: roles[i], detained: false, influence: 3, previousTarget: null, report: '' })),
    actions: {}, ballots: {}, broken: [], losses: 0, winner: null,
    log: ['The secret roles have been dealt. Read each card privately before starting night one.'],
  };
}
export function activePlayers(state) { return state.players.filter(p => !p.detained); }
export function nextDeveloperPlayer(state) {
  const choices = state.phase === 'night' ? state.actions : state.ballots;
  return state.phase === 'finished' || state.phase === 'discussion' ? null
    : activePlayers(state).find(p => !Object.hasOwn(choices, p.id)) || null;
}
export function developerTargets(state, player) {
  const game = definition(state.gameId);
  if (state.phase === 'vote') return activePlayers(state).filter(p => p.id !== player.id).map(p => ({ id: p.id, name: p.name }));
  let targets = state.gameId === 'lanternfall' ? game.locations.map((name, i) => ({ id: `l${i}`, name }))
    : activePlayers(state).filter(p => player.role !== 'enemy' || p.id !== player.id).map(p => ({ id: p.id, name: p.name }));
  if (player.role === 'protector') targets = targets.filter(t => t.id !== player.previousTarget);
  if (state.gameId === 'lanternfall' && player.role === 'enemy') targets = targets.filter(t => !state.broken.includes(t.id));
  return targets;
}
function night(state) {
  const active = activePlayers(state);
  const guards = new Set(active.filter(p => p.role === 'protector').map(p => state.actions[p.id]));
  const attacks = new Set(active.filter(p => p.role === 'enemy').map(p => state.actions[p.id]).filter(Boolean));
  for (const target of attacks) {
    if (guards.has(target)) continue;
    if (state.gameId === 'lanternfall') {
      if (!state.broken.includes(target)) state.broken.push(target);
    } else {
      state.players.find(p => p.id === target).influence = Math.max(0, state.players.find(p => p.id === target).influence - 1);
      state.losses++;
    }
  }
  for (const player of active) {
    const target = state.actions[player.id];
    const targetName = state.gameId === 'lanternfall' ? definition(state.gameId).locations[Number(target?.slice(1))]
      : state.players.find(p => p.id === target)?.name;
    if (player.role === 'protector') player.previousTarget = target;
    if (state.gameId === 'ledger' && player.role === 'citizen') {
      const recipient = state.players.find(p => p.id === target);
      recipient.influence = Math.min(3, recipient.influence + 1);
    }
    const touched = attacks.has(target);
    if (player.role === 'investigator') player.report = state.gameId === 'lanternfall'
      ? `Night ${state.round}: ${touched ? 'A Hollow touched' : 'No Hollow touched'} ${targetName}. A ward may have prevented damage.`
      : `Night ${state.round}: ${touched ? 'Counterfeit debt was attempted' : 'No counterfeit debt was attempted'} against ${targetName}. This does not identify the Forger.`;
    else if (player.role === 'citizen' && state.gameId === 'lanternfall') {
      const visits = active.filter(p => p.id !== player.id && state.actions[p.id] === target).length;
      player.report = `Night ${state.round}: ${visits} other visitor(s) came to ${targetName}. Their allegiances are unknown.`;
    } else player.report = `Night ${state.round}: ${targetName ? `your action at ${targetName} was resolved` : 'no intact target remained for your attack'}. Consult the public dawn report.`;
  }
  const game = definition(state.gameId);
  state.log.push(state.gameId === 'lanternfall'
    ? `Dawn ${state.round}: ${state.broken.length}/3 boundary lanterns broken. ${state.broken.length ? state.broken.map(id => game.locations[Number(id.slice(1))]).join(', ') : 'All lanterns remain intact.'}`
    : `Dawn ${state.round}: ${state.losses}/${state.enemyCount * 3} reserve losses. ${state.players.map(p => `${p.name}: ${p.influence} influence`).join('; ')}.`);
  state.phase = 'discussion';
}
function council(state) {
  const active = activePlayers(state);
  const weight = p => state.gameId === 'ledger' ? Math.max(1, p.influence) : 1;
  const total = active.reduce((sum, p) => sum + weight(p), 0);
  const tallies = Object.fromEntries(active.map(p => [p.id, 0]));
  for (const player of active) if (state.ballots[player.id]) tallies[state.ballots[player.id]] += weight(player);
  const accused = active.find(p => tallies[p.id] > total / 2);
  const game = definition(state.gameId);
  state.log.push(`Council ${state.round}: ${active.map(p => `${p.name}: ${tallies[p.id]}`).join('; ')}. Total eligible ${state.gameId === 'ledger' ? 'weight' : 'votes'}: ${total}.`);
  if (accused) {
    accused.detained = true;
    state.log.push(`${accused.name} is detained and revealed as ${accused.role === 'enemy' ? game.enemy : game.loyal}. They remain a public-evidence discussion witness.`);
  } else state.log.push('No strict majority. Nobody is detained.');
  if (!activePlayers(state).some(p => p.role === 'enemy')) state.winner = 'loyal';
  else if (state.gameId === 'lanternfall' ? state.broken.length === 3 : state.losses >= state.enemyCount * 3) state.winner = 'enemy';
  else if (state.round === 4) state.winner = 'loyal';
  if (state.winner) {
    state.phase = 'finished';
    state.log.push(`${state.winner === 'loyal' ? game.loyal : game.enemy} win. Reveal all roles and discuss the evidence.`);
  } else {
    state.round++;
    state.phase = 'night';
    state.actions = {};
    state.ballots = {};
  }
}
export function stepDeveloperGame(original, command) {
  const state = structuredClone(original);
  definition(state.gameId);
  requireGame(command && typeof command === 'object', 'Choose a game action.');
  if (command.type === 'council') {
    requireGame(state.phase === 'discussion', 'Start ballots only after dawn discussion.');
    state.phase = 'vote';
    return state;
  }
  const player = nextDeveloperPlayer(state);
  requireGame(player && command.playerId === player.id, 'Pass the device to the next eligible player.');
  requireGame(command.type === state.phase, 'That action does not match the current phase.');
  const targets = developerTargets(state, player);
  const abstain = state.phase === 'vote' && command.target === null;
  const noAttack = state.phase === 'night' && player.role === 'enemy' && targets.length === 0 && command.target === null;
  requireGame(abstain || noAttack || targets.some(t => t.id === command.target), 'Choose an available target.');
  (state.phase === 'night' ? state.actions : state.ballots)[player.id] = command.target;
  if (!nextDeveloperPlayer(state)) {
    if (state.phase === 'night') night(state);
    else council(state);
  }
  return state;
}
