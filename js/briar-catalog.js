import editions from './editions/briar-playtest.js?v=briar-playtest-v1';
import { normalizeStory } from './story.js?v=briar-playtest-v1';
import { selectEdition } from './edition-selection.js';

export const BRIAR_INFO = {
  title: 'The Last Will at Briar House',
  blurb: 'A missing will and a bell that cannot establish an alibi. Follow the documents and money through seven shared chapters.',
  contentNote: 'Family conflict, financial fraud and an off-screen death. No graphic violence. The two role-labelled comparison seats do not invent new eyewitnesses.',
  playtestNotice: editions[3].playtestNotice,
};

export function buildBriarStory(guests, assignedGuests = guests) {
  const edition = editions[guests.length];
  if (!edition) throw new Error('Briar House has one fixed testing edition for each player count from 3 through 12.');
  const { errors } = normalizeStory(edition);
  if (errors.length) throw new Error(`This Briar playtest cannot start: ${errors.join(' ')}`);
  return selectEdition({ editions }, guests, assignedGuests);
}
