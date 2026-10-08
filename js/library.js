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
  const count = Number.isInteger(story.fixedPlayerCount) ? story.fixedPlayerCount : (story.characters || []).length;
  return { minPlayers: count, maxPlayers: count };
}

export function adaptStoryForPlayers(template, guests, assignedGuests = guests) {
  const playerCount = Number.isInteger(template.fixedPlayerCount) ? template.fixedPlayerCount : (template.characters || []).length;
  if (guests.length !== playerCount || assignedGuests.length !== playerCount) {
    throw new Error(`This story is written for exactly ${playerCount} players. Provide exactly ${playerCount} player assignments.`);
  }
  const story = JSON.parse(JSON.stringify(template));
  if (story.characters?.some(character => character.optional)) {
    throw new Error('This story contains optional characters. Create a separate fixed-count story instead of scaling this one.');
  }
  story.characters.forEach((character, index) => {
    character.guest = assignedGuests[index]?.name || '';
    character.guestNote = assignedGuests[index]?.desc || '';
  });
  story.fixedPlayerCount = playerCount;
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
