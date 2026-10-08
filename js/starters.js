import mercy from './editions/mercy-hollow.js?v=clue-voice-v1';
import farm from './editions/blackthorn-farm.js?v=clue-voice-v1';
import briar from './editions/briar-house.js?v=clue-voice-v1';

function fixedStories(id, editions, details, fixedCount = 5) {
  return Object.entries(editions).filter(([count]) => Number(count) === fixedCount).map(([count, story]) => {
    const playerCount = Number(count);
    const fixedStory = structuredClone(story);
    fixedStory.title = `${story.title} (${playerCount} players)`;
    fixedStory.fixedPlayerCount = playerCount;
    fixedStory.storyId = `${id}-${playerCount}`;
    return { id: fixedStory.storyId, story: fixedStory, ...details };
  });
}

export const STARTER_MYSTERIES = [
  ...fixedStories('mercy-hollow', mercy, {
    title: 'The Ashes of Mercy Hollow',
    blurb: 'Witch-trial panic, forged confessions and a stolen packet. Discover who turned a frightened village into a profitable lie.',
    inspiration: 'Salem-era suspicion and witch hearings; wholly fictional, with no supernatural knowledge required.',
    contentNote: 'Persecution, false accusations and an off-screen death. Witchcraft accusations are not evidence of guilt.',
  }),
  ...fixedStories('blackthorn-farm', farm, {
    title: 'Footsteps Above Blackthorn Farm',
    blurb: 'Footsteps in the attic, a stranger in the snow and a land sale worth killing for. The outsider may be a story somebody planted.',
    inspiration: 'The isolated-farm atmosphere associated with Hinterkaifeck; not an answer to the real unsolved case.',
    contentNote: 'Isolation, staged haunting and an off-screen death. No child victims or graphic violence.',
  }),
  ...fixedStories('briar-house', briar, {
    title: 'The Last Will at Briar House',
    blurb: 'A missing will, a respectable household and a bell that cannot tell the whole truth. Follow the money before blaming the heirs.',
    inspiration: 'Victorian New England household tension associated with the Borden case; all characters and the solution are invented.',
    contentNote: 'Family conflict, financial fraud and an off-screen death. No graphic violence.',
  }),
];
