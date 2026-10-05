import mercy from './editions/mercy-hollow.js?v=count-editions-v1';
import farm from './editions/blackthorn-farm.js?v=count-editions-v1';
import briar from './editions/briar-house.js?v=count-editions-v1';
import blackwater from './editions/blackwater-row.js?v=blackwater-row-v1';

function catalog(editions) {
  const maximum = Math.max(...Object.keys(editions).map(Number));
  return { ...editions[maximum], editions };
}

export const STARTER_MYSTERIES = [
  {
    id: 'mercy-hollow', title: mercy[3].title,
    blurb: 'Witch-trial panic, forged confessions and a stolen packet. Discover who turned a frightened village into a profitable lie.',
    inspiration: 'Salem-era suspicion and witch hearings; wholly fictional, with no supernatural knowledge required.',
    contentNote: 'Persecution, false accusations and an off-screen death. Witchcraft accusations are not evidence of guilt.',
    story: catalog(mercy),
  },
  {
    id: 'blackthorn-farm', title: farm[3].title,
    blurb: 'Footsteps in the attic, a stranger in the snow and a land sale worth killing for. The outsider may be a story somebody planted.',
    inspiration: 'The isolated-farm atmosphere associated with Hinterkaifeck; not an answer to the real unsolved case.',
    contentNote: 'Isolation, staged haunting and an off-screen death. No child victims or graphic violence.',
    story: catalog(farm),
  },
  {
    id: 'briar-house', title: briar[3].title,
    blurb: 'A missing will, a respectable household and a bell that cannot tell the whole truth. Follow the money before blaming the heirs.',
    inspiration: 'Victorian New England household tension associated with the Borden case; all characters and the solution are invented.',
    contentNote: 'Family conflict, financial fraud and an off-screen death. No graphic violence.',
    story: catalog(briar),
  },
  {
    id: 'blackwater-row', title: blackwater[4].title,
    blurb: 'Five deaths, missing records and a blade hidden behind a respectable trade. Investigate Blackwater Row one crime scene at a time.',
    inspiration: 'Melissa\'s five-round, Victorian revenge mystery, adapted for exactly four players.',
    contentNote: 'Five off-screen deaths with slashed throats, wrongful imprisonment, coercion and revenge. No graphic descriptions. Preserve the final-round discoveries; the same authored clue circle is used throughout.',
    story: catalog(blackwater),
  },
];
