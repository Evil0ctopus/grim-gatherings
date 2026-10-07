import editions from './editions/sample.js?v=story-polish-v1';
import { selectEdition } from './edition-selection.js?v=count-editions-v1';
import { shuffle } from './util.js';

export function buildSampleStory(guests) {
  return selectEdition({ editions }, guests, shuffle(guests));
}

export const SAMPLE_INFO = { title: editions[3].title, min: 3, ideal: '3–24', blurb: 'A gothic séance goes wrong on the anniversary of a young wife\'s death. Choose from 22 fixed, five-round editions for 3–24 players. Every included guest has a written part and clues.', contentNote: 'Poisoning, an off-screen death and a staged séance. No graphic descriptions.' };
