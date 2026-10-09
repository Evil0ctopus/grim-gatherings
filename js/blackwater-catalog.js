import editions from './editions/blackwater-scalable.js?v=blackwater-master-v1';
import { normalizeStory } from './story.js?v=blackwater-master-v1';
import { selectEdition } from './edition-selection.js';

export const BLACKWATER_INFO = {
  title: 'The Barber of Blackwater Row',
  blurb: 'Five murders and receipt 47 connect disturbed records. Seven chapters keep the original trio and delayed identity reveal unchanged across all counts.',
  contentNote: 'Five off-screen throat-cutting deaths, wrongful imprisonment, coercion and revenge. A school pupil appears only as a reader of public accounts.',
};

export function buildBlackwaterStory(guests, assignedGuests = guests) {
  const edition = editions[guests.length];
  if (!edition) throw new Error('Blackwater Row has one fixed edition for each player count from 3 through 12.');
  const { errors } = normalizeStory(edition);
  if (errors.length) throw new Error(`This Blackwater edition cannot start: ${errors.join(' ')}`);
  return selectEdition({ editions }, guests, assignedGuests);
}
