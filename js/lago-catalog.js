import editions from './editions/lago-cabin.js?v=lago-repaired-v1';
import { normalizeStory } from './story.js?v=lago-repaired-v1';
import { selectEdition } from './edition-selection.js';

export const LAGO_NOTICE = 'Historically inspired mystery with off-screen adult and child deaths, arson and an execution. The original trio, seven chapters and ending are preserved in every edition. Supporting characters include fictionalized observations; this game is not a historical source.';

export function reviewLagoEdition(count) {
  const story = editions[count];
  if (!story || !Number.isInteger(count)) {
    throw new Error('The Lago Cabin has supplied editions for exactly 3 through 12 players.');
  }
  const { errors } = normalizeStory(story);
  return { errors, issues: [], repairs: structuredClone(story.repairs) };
}

export function buildLagoStory(guests, assignedGuests = guests) {
  const review = reviewLagoEdition(guests.length);
  if (review.errors.length) {
    throw new Error(`The ${guests.length}-player Lago Cabin edition needs author repair before it can start: ${review.errors.join(' ')}`);
  }
  return selectEdition({ editions }, guests, assignedGuests);
}
