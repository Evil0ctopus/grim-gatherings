import { STORY_LIBRARY_KEY, readStoryLibrary } from './library.js?v=count-editions-v1';

export const HOST_SAVE_KEY = 'gg-host-v1';
const builtInTitles = new Set([
  'The Last Séance at Ravenmoor', 'The Ashes of Mercy Hollow',
  'Footsteps Above Blackthorn Farm', 'The Last Will at Briar House',
]);

export function isOutdatedStory(story) {
  return story?.schemaVersion !== 2 || (builtInTitles.has(story?.title) && !story.edition && !['user', 'community'].includes(story.provenance?.kind)) ||
    !Array.isArray(story?.rounds) || !Array.isArray(story.characters) ||
    !Number.isInteger(story.fixedPlayerCount) || story.fixedPlayerCount !== story.characters.length ||
    story.rounds.length < story.fixedPlayerCount - 1 || story.characters.some(character =>
      character.backstory || character.motive || character.secrets?.length ||
      !Array.isArray(character.rounds) || story.rounds.some((_, i) => !character.rounds[i]?.readAloud || character.rounds[i]?.clues?.length));
}

export function removeOutdatedSavedContent(storage) {
  const entries = readStoryLibrary(storage.getItem(STORY_LIBRARY_KEY));
  const current = entries.filter(entry => !isOutdatedStory(entry.story));
  const raw = storage.getItem(HOST_SAVE_KEY);
  let game = null;
  if (raw) {
    try { game = JSON.parse(raw); }
    catch (error) { throw new Error(`Saved game could not be checked: ${error.message}`); }
  }
  const removedGame = !!game?.story && isOutdatedStory(game.story);
  if (current.length !== entries.length) storage.setItem(STORY_LIBRARY_KEY, JSON.stringify(current));
  if (removedGame) storage.removeItem(HOST_SAVE_KEY);
  return { removedStories: entries.length - current.length, removedGame };
}
