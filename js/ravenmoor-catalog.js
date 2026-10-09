import editions from './editions/ravenmoor.js?v=ravenmoor-master-v1';
import { normalizeStory } from './story.js?v=ravenmoor-master-v1';
import { selectEdition } from './edition-selection.js';

export const RAVENMOOR_INFO = {
  title: 'The Last Séance at Ravenmoor',
  blurb: 'A gothic séance becomes a poisoning investigation. Seven chapters preserve the physician, butler and sister in every edition.',
  contentNote: 'Poisoning, an off-screen death and a staged séance. No graphic descriptions.',
  reviewNotice: 'Owner-approved conversion. The source-grounded evidence correction is documented in the master conversion record. Start a new game to use the current edition.',
};

export function buildRavenmoorStory(guests, assignedGuests = guests) {
  const edition = editions[guests.length];
  if (!edition) throw new Error('Ravenmoor has one fixed edition for each player count from 3 through 12.');
  const { errors } = normalizeStory(edition);
  if (errors.length) throw new Error(`This Ravenmoor edition cannot start: ${errors.join(' ')}`);
  return selectEdition({ editions }, guests, assignedGuests);
}
