import { accusationEvidence, assignAccusationCircles, validateAccusationCircles } from './accusations.js?v=accusation-circle-v1';
import { selectEdition } from './edition-selection.js?v=count-editions-v1';

export const STORY_LIBRARY_KEY = 'gg-story-library-v1';

export function readStoryLibrary(raw) {
  if (!raw) return [];

  let entries;
  try {
    entries = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Saved stories could not be read: ${error.message}`);
  }
  if (!Array.isArray(entries)) throw new Error('Saved stories are not in the expected format.');
  if (entries.some(entry => !entry || typeof entry.id !== 'string' || !entry.story || typeof entry.story !== 'object')) {
    throw new Error('A saved story entry is incomplete. Remove the damaged library entry before continuing.');
  }
  return entries;
}

export function makeStoryTemplate(story) {
  const template = JSON.parse(JSON.stringify(story));
  for (const character of template.characters || []) {
    character.guest = '';
    character.guestNote = '';
  }
  return template;
}

export function getPlayerRange(story) {
  if (story.editions) {
    const counts = Object.keys(story.editions).map(Number);
    return { minPlayers: Math.min(...counts), maxPlayers: Math.max(...counts) };
  }
  const optionalCount = (story.characters || []).filter(character => character.optional).length;
  const maxPlayers = (story.characters || []).length;
  return { minPlayers: maxPlayers - optionalCount, maxPlayers };
}

export function adaptStoryForPlayers(template, guests, assignedGuests = guests) {
  if (template.editions) return selectEdition(template, guests, assignedGuests);
  if (template.edition && guests.length !== template.edition.playerCount) {
    throw new Error(`This saved edition works for ${template.edition.playerCount} players. You listed ${guests.length}. Select the original mystery for a different edition.`);
  }
  const story = JSON.parse(JSON.stringify(template));
  const characters = story.characters || [];
  const required = characters.filter(character => !character.optional);
  const optional = characters.filter(character => character.optional);
  if (guests.length < required.length || guests.length > characters.length) {
    throw new Error(`This mystery works for ${required.length === characters.length ? `${characters.length}` : `${required.length}–${characters.length}`} players. You listed ${guests.length}.`);
  }

  const selected = [...required, ...optional.slice(0, guests.length - required.length)];
  if (selected.length !== characters.length && characters.some(c => c.rounds?.some(r => r.readAloud))) {
    const errors = validateAccusationCircles(story);
    if (errors.length) throw new Error(errors.join(' '));
    const evidence = accusationEvidence(story);
    story.characters = selected;
    assignAccusationCircles(story, evidence);
  }
  const selectedIds = new Set(selected.map(character => character.id));
  const omittedNames = Object.fromEntries(characters.filter(character => !selectedIds.has(character.id)).map(character => [character.id, character.name]));
  story.characters = selected;

  const replaceOmittedReferences = value => {
    if (typeof value === 'string') {
      return value.replace(/\{([A-Za-z0-9_-]+)\}/g, (match, id) => Object.hasOwn(omittedNames, id) ? omittedNames[id] : match);
    }
    if (Array.isArray(value)) return value.map(replaceOmittedReferences);
    if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) value[key] = replaceOmittedReferences(value[key]);
    }
    return value;
  };
  replaceOmittedReferences(story);
  story.characters.forEach((character, index) => {
    character.guest = assignedGuests[index]?.name || '';
    character.guestNote = assignedGuests[index]?.desc || '';
  });
  return story;
}

export function upsertStory(entries, story, id = null, now = Date.now()) {
  const existing = id ? entries.find(entry => entry.id === id) : null;
  const playerRange = getPlayerRange(story);
  const record = {
    id: existing?.id || id || crypto.randomUUID(),
    title: story.title || 'Untitled mystery',
    ...playerRange,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    story: makeStoryTemplate(story),
  };
  return {
    entries: existing
      ? entries.map(entry => entry.id === existing.id ? record : entry)
      : [...entries, record],
    record,
  };
}
