import { PREMIUM_STORIES } from '../js/premium-stories.js';

export class DeveloperGameError extends Error {
  constructor(message) { super(message); this.status = 400; }
}
const requireGame = (condition, message) => { if (!condition) throw new DeveloperGameError(message); };
const definition = id => {
  const game = PREMIUM_STORIES.find(entry => entry.id === id);
  requireGame(game, 'Choose a bundle story.');
  return game;
};

export function developerGameView(gameId, reveal = false) {
  const game = structuredClone(definition(gameId));
  if (!reveal) delete game.story.solution;
  return game;
}

export function developerCurrentContent(state) {
  const game = definition(state.gameId);
  if (state.phase === 'introduction') {
    const player = state.players[state.introIndex];
    const character = player && game.story.characters.find(item => item.id === player.characterId);
    return character ? { type: 'character-card', character } : null;
  }
  if (state.phase === 'round') {
    const id = currentChain(state)[state.chainIndex];
    const player = state.players.find(item => item.characterId === id);
    const character = game.story.characters.find(item => item.id === id);
    return player && character ? {
      type: 'clue', playerId: player.id, playerName: player.name,
      clue: character.rounds[state.roundIndex].readAloud,
    } : null;
  }
  if (state.phase === 'round-intro') {
    const round = game.story.rounds[state.roundIndex];
    return { type: 'round-introduction', title: round.title, narration: round.narration, publicText: round.publicText };
  }
  if (state.phase === 'reveal') return {
    type: 'reveal', finale: game.story.finale, solution: game.story.solution,
    fullStory: [game.story.intro, ...game.story.rounds.map(round => round.narration), game.story.solution.revealNarration].join('\n\n'),
  };
  return null;
}

export function developerCatalog() {
  return PREMIUM_STORIES.map(game => ({
    id: game.id, title: game.title, kind: game.kind, premise: game.premise,
    playerCount: game.story.fixedPlayerCount,
    flow: 'Read-aloud setup and character cards; target-chained clue rounds; deliberation and a vote after every round; final accusation, final vote, fixed reveal.',
    specialMechanics: [...game.story.specialMechanics],
    setting: game.story.setting, intro: game.story.intro,
    victim: { ...game.story.victim }, finale: { ...game.story.finale },
  }));
}

export function createDeveloperGame(gameId, names) {
  const game = definition(gameId);
  const count = game.story.fixedPlayerCount;
  requireGame(Array.isArray(names) && names.length === count &&
    names.every(name => typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 40),
  `This story is written for exactly ${count} players; enter ${count} unique names.`);
  names = names.map(name => name.trim());
  requireGame(new Set(names.map(name => name.toLowerCase())).size === names.length, 'Use a different name for each player.');
  return {
    version: 2, gameId, phase: 'setup', round: 0, roundIndex: -1, chainIndex: 0, introIndex: 0,
    players: game.story.characters.map((character, index) => ({
      id: character.id, characterId: character.id, characterName: character.name, name: names[index],
    })),
    ballots: {}, roundVoteTallies: [], winnerId: null,
  };
}

function currentChain(state) {
  return definition(state.gameId).story.rounds[state.roundIndex]?.chain || [];
}

export function nextDeveloperPlayer(state) {
  if (state.phase === 'introduction') return state.players[state.introIndex] || null;
  if (state.phase === 'round') {
    const id = currentChain(state)[state.chainIndex];
    return state.players.find(player => player.characterId === id) || null;
  }
  if (state.phase === 'vote' || state.phase === 'final-vote') {
    const key = state.phase === 'final-vote' ? 'final' : state.roundIndex;
    const ballots = state.ballots[key] || {};
    return state.players.find(player => !Object.hasOwn(ballots, player.id)) || null;
  }
  return null;
}

export function developerTargets(state, player) {
  if (!['vote', 'final-vote'].includes(state.phase)) return [];
  return state.players.filter(other => other.id !== player.id).map(other => ({
    id: other.characterId, name: other.characterName,
  }));
}

function tally(ballots) {
  return Object.values(ballots).reduce((result, target) => {
    result[target] = (result[target] || 0) + 1;
    return result;
  }, {});
}

export function stepDeveloperGame(original, command) {
  const state = structuredClone(original);
  const game = definition(state.gameId);
  requireGame(command && typeof command === 'object', 'Choose a game action.');

  if (command.type === 'start-rounds') {
    requireGame(state.phase === 'intro-discussion', 'Start clue rounds after the introduction and pre-round discussion.');
    state.phase = 'round-intro';
    state.roundIndex = 0;
    state.round = 1;
    state.chainIndex = 0;
    return state;
  }
  if (command.type === 'start-introduction') {
    requireGame(state.phase === 'setup', 'Read the story setup before the character cards.');
    state.phase = 'introduction';
    return state;
  }
  if (command.type === 'start-clues') {
    requireGame(state.phase === 'round-intro', 'Read the round narration before its clue chain.');
    state.phase = 'round';
    return state;
  }
  if (command.type === 'open-vote') {
    requireGame(state.phase === 'deliberation', 'Open voting only after the round’s deliberation.');
    state.phase = 'vote';
    return state;
  }
  if (command.type === 'open-final-vote') {
    requireGame(state.phase === 'final-accusation', 'Open the final vote only after final accusations.');
    state.phase = 'final-vote';
    return state;
  }
  if (command.type === 'finish-reveal') {
    requireGame(state.phase === 'reveal', 'The fixed story reveal must come after the final vote.');
    state.phase = 'finished';
    return state;
  }

  const player = nextDeveloperPlayer(state);
  requireGame(player && command.playerId === player.id, 'That player is not next in the read-around, clue chain or vote.');

  if (command.type === 'read-card' && state.phase === 'introduction') {
    state.introIndex++;
    if (state.introIndex === state.players.length) state.phase = 'intro-discussion';
    return state;
  }
  if (command.type === 'read-clue' && state.phase === 'round') {
    state.chainIndex++;
    if (state.chainIndex === currentChain(state).length) state.phase = 'deliberation';
    return state;
  }
  if (command.type === 'vote' && ['vote', 'final-vote'].includes(state.phase)) {
    const target = command.target;
    requireGame(developerTargets(state, player).some(option => option.id === target), 'Vote for another character.');
    const key = state.phase === 'final-vote' ? 'final' : state.roundIndex;
    const ballots = state.ballots[key] ||= {};
    ballots[player.id] = target;
    if (!nextDeveloperPlayer(state)) {
      if (state.phase === 'final-vote') {
        state.finalVoteTally = tally(ballots);
        state.winnerId = game.story.solution.killerId;
        state.phase = 'reveal';
      } else if (state.roundIndex === game.story.rounds.length - 1) {
        state.roundVoteTallies[state.roundIndex] = tally(ballots);
        state.phase = 'final-accusation';
      } else {
        state.roundVoteTallies[state.roundIndex] = tally(ballots);
        state.roundIndex++;
        state.round = state.roundIndex + 1;
        state.chainIndex = 0;
        state.phase = 'round-intro';
      }
    }
    return state;
  }
  throw new DeveloperGameError('That action does not match the current story phase.');
}
