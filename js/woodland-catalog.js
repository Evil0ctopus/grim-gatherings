import { adaptStoryForPlayers } from './library.js?v=rotating-clues-v1';

export const WOODLAND_NOTICE = 'Author-final mystery for exactly 14 players and six rounds. Character deaths do not eliminate players: ghosts keep their seats and read their supplied memories. Discuss after each round, then read the author’s ending; no ballots are added. Contains violent deaths, blood and supernatural themes.';
export const isWoodlandStory = story => story?.edition?.family === 'woodland-hollow';

export function adaptWoodlandSource(source) {
  if (source?.title !== 'Woodland Hollow' || source.playerCount !== 14 || source.roundCount !== 6 ||
      !Array.isArray(source.characters) || source.characters.length !== 14 ||
      !Array.isArray(source.rounds) || source.rounds.length !== 6) {
    throw new Error('Woodland Hollow requires the final 14-player, six-round author file.');
  }
  const names = new Set(source.characters.map(character => character.name));
  if (names.size !== 14) throw new Error('Woodland Hollow character names must be unique.');
  const reveal = source.ending?.paragraphs;
  if (!Array.isArray(reveal) || !reveal.length || reveal.some(text => typeof text !== 'string' || !text.trim())) {
    throw new Error('Woodland Hollow is missing the author’s ending.');
  }
  const story = {
    schemaVersion: 2, fixedPlayerCount: 14, discloseKiller: false,
    edition: { family: 'woodland-hollow', id: 'woodland-hollow-14', playerCount: 14, revision: 1 },
    title: source.title, atmosphere: 'witch', setting: '', intro: source.intro,
    hiddenThread: '', specialMechanics: [], clueRouting: 'authored-groups',
    approvedExceptions: structuredClone(source.approvedExceptions),
    victim: { name: source.nonPlayerVictim, description: '' },
    finale: { narration: '', votePrompt: '' },
    solution: { killerId: 'Keziah', killerIds: ['Keziah', 'Joan', 'Rebekah'], explanation: '', revealNarration: reveal.join('\n\n') },
    rounds: source.rounds.map((round, index) => ({
      title: `Round ${index + 1}`, narration: round.narration, publicText: '', hostNotes: '',
      chain: round.readingGroups.flatMap(group => group.readers),
      readingGroups: round.readingGroups.map(group => [...group.readers]),
      coverageRepeat: false,
    })),
    characters: source.characters.map(character => {
      const ghostRound = source.rounds.findIndex(round => round.ghosts.some(ghost => ghost.reader === character.name));
      return {
        id: character.name, name: character.name, role: character.role,
        guest: '', guestNote: '', optional: false, relationship: '', tieIn: '', publicBlurb: character.card,
        ghost: ghostRound < 0 ? null : { fromRound: ghostRound + 1, parts: [] },
        rounds: source.rounds.map(round => {
          const readings = [...round.clues, ...round.ghosts].filter(clue => clue.reader === character.name);
          if (readings.length !== 1) throw new Error(`${character.name} must have one supplied reading in Round ${round.round}.`);
          const clue = readings[0];
          return { readAloud: { accuses: clue.accuses, text: clue.text, selfReading: clue.selfReading === true } };
        }),
      };
    }),
  };
  const errors = validateWoodlandStory(story);
  if (errors.length) throw new Error(errors.join(' '));
  return story;
}

// This is a runtime-shape check, not a story-rules grade or editorial pass.
export function validateWoodlandStory(story) {
  const errors = [];
  if (!isWoodlandStory(story) || story.schemaVersion !== 2 || story.fixedPlayerCount !== 14 ||
      !Array.isArray(story.characters) || story.characters.length !== 14 ||
      !Array.isArray(story.rounds) || story.rounds.length !== 6 ||
      story.characters.some(character => !character || typeof character !== 'object' ||
        typeof character.id !== 'string' || !character.id || typeof character.name !== 'string' ||
        typeof character.role !== 'string' || typeof character.publicBlurb !== 'string' ||
        !Array.isArray(character.rounds) || character.rounds.length !== 6) ||
      story.rounds.some(round => !round || !Array.isArray(round.chain))) {
    return ['Woodland Hollow must retain its fixed 14-player cast and six chapters.'];
  }
  const ids = new Set(story.characters.map(character => character.id));
  if (ids.size !== 14 || story.edition.playerCount !== 14) errors.push('Woodland Hollow has invalid character identities.');
  if (!Array.isArray(story.solution?.killerIds) || story.solution.killerIds.length !== 3 ||
      new Set(story.solution.killerIds).size !== 3 || story.solution.killerIds.some(id => !ids.has(id)) ||
      typeof story.solution.revealNarration !== 'string' || !story.solution.revealNarration.trim()) {
    errors.push('Woodland Hollow must retain its three killers and author ending.');
  }
  const checkText = text => typeof text === 'string' &&
    [...text.matchAll(/\{([A-Za-z0-9_-]+)\}/g)].every(match => ids.has(match[1]));
  if (!checkText(story.intro) || !checkText(story.solution?.revealNarration)) errors.push('Woodland Hollow has unresolved story placeholders.');
  if (story.characters.some(character => !checkText(character.publicBlurb))) errors.push('Woodland Hollow has unresolved character-card placeholders.');
  story.rounds.forEach((round, ri) => {
    const order = Array.isArray(round.readingGroups) && round.readingGroups.every(Array.isArray) ? round.readingGroups.flat() : [];
    if (order.length !== 14 || new Set(order).size !== 14 || order.some(id => !ids.has(id)) ||
        order.join('\0') !== round.chain?.join('\0') || !checkText(round.narration)) {
      errors.push(`Woodland Hollow Round ${ri + 1} has an incomplete reader schedule or narration.`);
    }
    for (const character of story.characters) {
      const clue = character.rounds?.[ri]?.readAloud;
      const ghost = character.ghost && ri + 1 >= character.ghost.fromRound;
      if (typeof clue?.text !== 'string' || !clue.text.trim() || !checkText(clue.text) || !ids.has(clue.accuses) ||
          (ghost ? clue.accuses !== character.id || clue.selfReading !== true : clue.selfReading === true)) {
        errors.push(`Woodland Hollow ${character.name}, Round ${ri + 1} has an invalid supplied reading.`);
      }
      if (character.ghost && (!Number.isInteger(character.ghost.fromRound) || character.ghost.fromRound < 2 || character.ghost.fromRound > 6)) {
        errors.push(`Woodland Hollow ${character.name} has an invalid ghost transition.`);
      }
      if (!ghost && story.characters.some(target => target.id === clue?.accuses && target.ghost && ri + 1 >= target.ghost.fromRound)) {
        errors.push(`Woodland Hollow Round ${ri + 1} targets a ghost rather than a living character.`);
      }
    }
  });
  return errors;
}

export async function buildWoodlandStory(guests, assignedGuests = guests) {
  if (guests.length !== 14) throw new Error('Woodland Hollow is written for exactly 14 players.');
  const response = await fetch(new URL('../assets/stories/woodland-hollow.story.json', import.meta.url));
  if (!response.ok) throw new Error(`Could not load Woodland Hollow (${response.status}). Reload and retry.`);
  return adaptStoryForPlayers(adaptWoodlandSource(await response.json()), guests, assignedGuests);
}
