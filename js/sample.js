import editions from './editions/sample.js?v=story-polish-v2';
import { shuffle } from './util.js';

export function buildSampleStory(guests) {
  const count = guests.length;
  const edition = editions[count];
  if (!edition) throw new Error(`The sample mystery is written for exactly ${Object.keys(editions).join(' players, ')} players, not ${count}.`);
  const story = structuredClone(edition);
  const assigned = shuffle(guests);
  story.characters.forEach((character, index) => {
    character.guest = assigned[index].name;
    character.guestNote = assigned[index].desc || '';
  });
  story.fixedPlayerCount = count;
  story.storyId = `ravenmoor-${count}`;
  story.title = `${story.title.replace(/ \(\d+ players\)$/, '')} (${count} players)`;
  return story;
}

export const SAMPLE_INFO = { title: 'The Last Séance at Ravenmoor', min: 5, ideal: '5', blurb: 'A gothic séance goes wrong on the anniversary of a young wife\'s death. This mystery is written for exactly five players.', contentNote: 'Poisoning, an off-screen death and a staged séance. No graphic descriptions.' };
