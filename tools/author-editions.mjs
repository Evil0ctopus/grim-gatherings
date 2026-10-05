// Offline authoring: the browser loads the committed editions, never this compiler or its sources.
import fs from 'node:fs';
import { buildSampleStory } from './story-sources/sample-source.mjs';
import { STARTER_MYSTERIES } from './story-sources/starter-sources.mjs';
import { accusationEvidence, assignAccusationCircles } from '../js/accusations.js';
import { normalizeStory } from '../js/story.js';

const guests = n => Array.from({ length: n }, (_, i) => ({ name: `Author ${i + 1}`, desc: '' }));
const plans = {
  sample: {
    investigations: [
      ['the blackout movements', 'the service of the drinks', 'the first explanation at the body'],
      ['the tonic label', 'the cut plants and soil', 'the wire and household disputes'],
      ['Eleanor\'s correspondence', 'Ambrose\'s instructions', 'the withheld warnings'],
      ['the glass and shared decanter', 'the ring account', 'the explanations for concealment'],
      ['the glove observation', 'the chain connecting both deaths', 'the difference between a motive and this method'],
    ],
    questions: ['Who moved when the light failed?', 'Which dispute connects to the medicine?', 'Why did Ambrose arrange this gathering?', 'Which accusation survives the clean decanter?', 'Whose account explains both deaths?'],
  },
  'mercy-hollow': {
    investigations: [
      ['the records-room entry', 'the missing packet', 'the warning at the body'],
      ['the false confession', 'the payment column', 'the purpose of the retraction'],
      ['the rescued draft', 'the packet sighting', 'the arrival chain'],
      ['the ordinary ribbon', 'the recovered brass fragment', 'the reasons for protective lies'],
      ['the flawed seal', 'Ward\'s notebook', 'the chain and corridor comparisons'],
    ],
    questions: ['Who had access to Ward and the packet?', 'Who benefits from a voice forged on paper?', 'Which frightened account has independent support?', 'What is evidence, and what is village fear?', 'Who connects payments, forgery and the missing packet?'],
  },
  'blackthorn-farm': {
    investigations: [
      ['the workshop movements', 'the torn map and button', 'the unforced door'],
      ['the repaired stair', 'the attic cup and sketches', 'the explanation for missing supplies'],
      ['the two boundaries', 'the contract and separate fee', 'the value of the north spring'],
      ['the age of the tracks', 'the cap before supper', 'the kitchen-window sequence'],
      ['the matching coat button', 'Otto\'s confrontation note', 'the payment and hidden route'],
    ],
    questions: ['What changed between Otto entering and the alarm?', 'Who could use the room above the beams?', 'Who was paid to change the boundary?', 'Does the stranger story survive the timeline?', 'Which financial dispute fits the workshop evidence?'],
  },
  'briar-house': {
    investigations: [
      ['the signed receipt', 'the exit with a document', 'the selectively missing papers'],
      ['the duplicate will', 'the repayment letter', 'the distinction between household and trust money'],
      ['the continuing bell', 'the ordered copies', 'the complaints left on the desk'],
      ['the appointment note', 'the no-intervening-entry account', 'the corrections to inheritance rumors'],
      ['the surviving carbon page', 'the recipient of the transfers', 'the meeting and missing originals'],
    ],
    questions: ['Which statement conflicts with the study exit?', 'Who actually loses under the will?', 'Can a sound establish an alibi?', 'What independently checks the corridor account?', 'Who needed these specific records gone?'],
  },
};

// Each delivery is part of the written scene. A smaller edition consolidates the work
// in a present role; a larger edition gives that existing record to its specialist.
const deliveries = {
  sample: [
    [['crane', 'ashgrove', 'sets the broken glass beside the doorway account'], ['constance', 'crane', 'describes when the shared brandy was poured'], ['vesper', 'constance', 'reads the account of the pedal and blackout']],
    [['pell', 'crane', 'lays out the garden findings'], ['ashgrove', 'constance', 'reads the tonic label aloud'], ['vesper', 'crane', 'places the discovered wire beside the performance account']],
    [['wren', 'constance', 'reads Eleanor\'s preserved diary and correspondence'], ['marsh', 'crane', 'opens the codicil and reads its instruction'], ['vesper', 'ashgrove', 'reads the written seance question']],
    [['finch', 'crane', 'compares the ring account with the glass findings'], ['constance', 'ashgrove', 'places her shared drink beside the decanter comparison'], ['vesper', 'crane', 'matches the performance account to Ambrose\'s instructions']],
    [['blackwood', 'crane', 'reads the glove observation for the final comparison'], ['wren', 'constance', 'returns to Eleanor\'s warning'], ['ashgrove', 'constance', 'reads the sequence linking tonic, blackout and glass']],
  ],
  'mercy-hollow': [
    [['witness', 'minister', 'reads the records-room entry account'], ['midwife', 'minister', 'describes the overheard payment dispute'], ['clerk', 'minister', 'reads the inventory of the missing packet']],
    [['witness', 'midwife', 'reads Mara\'s signed retraction'], ['miller', 'clerk', 'compares the surviving payment entries'], ['minister', 'midwife', 'reads the confession beside the jail register']],
    [['minister', 'midwife', 'places the rescued draft on the table'], ['witness', 'clerk', 'reads the recorded exit with the packet'], ['midwife', 'minister', 'repeats the arrival-chain account']],
    [['seamstress', 'midwife', 'compares the mourning cloth with the warning ribbon'], ['clerk', 'minister', 'lays out the brass-fragment comparison'], ['witness', 'minister', 'returns to the purpose of the retraction']],
    [['minister', 'midwife', 'compares the seal impressions'], ['schoolmaster', 'clerk', 'reads Ward\'s final notebook entry'], ['midwife', 'minister', 'compares the fragment with the chain and arrival account']],
  ],
  'blackthorn-farm': [
    [['housekeeper', 'heir', 'reads the kitchen-window sequence'], ['mechanic', 'heir', 'reads the discovery account beside the torn map'], ['surveyor', 'housekeeper', 'describes the missing coat button']],
    [['mechanic', 'heir', 'reads the stair-repair account'], ['housekeeper', 'surveyor', 'compares the chipped cup with the measuring-room cup'], ['surveyor', 'heir', 'lays out the attic sketches']],
    [['heir', 'housekeeper', 'places the two boundaries side by side'], ['teacher', 'surveyor', 'reads the water-access clause'], ['buyeragent', 'housekeeper', 'reads the separate survey-payment correspondence']],
    [['neighbor', 'housekeeper', 'compares the age of the tracks with tonight\'s snow'], ['musician', 'heir', 'reads the account of the cap before supper'], ['housekeeper', 'surveyor', 'returns to the watched courtyard sequence']],
    [['mechanic', 'housekeeper', 'reads the button-match findings'], ['heir', 'surveyor', 'reads Otto\'s confrontation annotation'], ['postmaster', 'housekeeper', 'returns to the correspondence identifying the amendment']],
  ],
  'briar-house': [
    [['secretary', 'daughter', 'reads Iris\'s signed receipt entry'], ['housekeeper', 'solicitor', 'describes the exit with a folded document'], ['daughter', 'housekeeper', 'places the appointment account beside the missing papers']],
    [['secretary', 'housekeeper', 'reads the duplicate will'], ['daughter', 'solicitor', 'reads Cecily\'s repayment letter'], ['housekeeper', 'daughter', 'distinguishes her household shortfall from the trust']],
    [['housekeeper', 'daughter', 'explains the continuing bell mechanism'], ['secretary', 'solicitor', 'reads Cecily\'s instructions to keep copies'], ['doctor', 'daughter', 'compares the untouched complaints with the missing papers']],
    [['daughter', 'housekeeper', 'reads the appointment note'], ['housekeeper', 'solicitor', 'returns to the no-intervening-entry account'], ['nephew', 'daughter', 'compares the inheritance rumor with the duplicate']],
    [['secretary', 'daughter', 'reads the retained carbon page'], ['foreman', 'housekeeper', 'compares the larger trust transfers with the smaller allowance'], ['solicitor', 'housekeeper', 'reads the receipt and appointment against the exit account']],
  ],
};

function resolveAbsent(value, names, present) {
  if (typeof value === 'string') return value.replace(/\{([A-Za-z0-9_-]+)\}/g, (match, id) => present.has(id) || !names[id] ? match : names[id]);
  if (Array.isArray(value)) return value.map(child => resolveAbsent(child, names, present));
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = resolveAbsent(value[key], names, present);
  }
  return value;
}

function authorEdition(source, family, count) {
  let story = structuredClone(source);
  const names = Object.fromEntries(story.characters.map(c => [c.id, c.name]));
  const evidence = accusationEvidence(story);
  story.characters = story.characters.slice(0, count);
  story.characters.forEach(c => { c.optional = false; c.guest = ''; c.guestNote = ''; });
  assignAccusationCircles(story, evidence);
  story = resolveAbsent(story, names, new Set(story.characters.map(c => c.id)));
  story.edition = { family, playerCount: count, id: `${family}-${count}-players`, revision: 1 };
  story.discloseKiller = false;
  const plan = plans[family];
  story.intro += `\n\nTonight's ${count} guests carry the investigation themselves. Their observations and the records read at the table are public; nobody needs a hidden packet or an extra actor.`;
  story.rounds.forEach((chapter, ri) => {
    const assignments = story.characters.map(c => {
      const target = story.characters.find(t => t.id === c.rounds[ri].readAloud.accuses);
      c.rounds[ri].readAloud.text = `At the evidence table, {${c.id}} brings the case against {${target.id}} into the discussion. ${c.rounds[ri].readAloud.text}`;
      return `{${c.id}} leads the comparison concerning {${target.id}}.`;
    });
    const present = new Set(story.characters.map(c => c.id));
    const scene = deliveries[family][ri].map(([specialist, fallback, action]) => {
      if (family === 'briar-house' && specialist === 'foreman' && !present.has(specialist)) {
        action = 'compares the larger trust transfers with the already disclosed household shortfall';
      }
      return `{${present.has(specialist) ? specialist : fallback}} ${action}.`;
    }).join(' ');
    chapter.narration = chapter.narration
      .replace('A photograph, if its keeper is present, provides a second view; it is not needed to replace the account.', story.characters.some(c => c.id === 'finch')
        ? 'Finch develops the photograph and places it beside the doorway account. Both describe the same ring; compare them instead of trusting a single witness.'
        : 'The doorway account is recorded beside the glass findings. Its ring description must agree with the medicine and blackout evidence; there is no photograph needed to solve this edition.')
      .replace('A repair request, when the seamstress is present, corroborates the timing rather than creating the only way to know it.', story.characters.some(c => c.id === 'seamstress')
        ? 'The seamstress reads the repair request made after the meeting began. It corroborates the arrival observation and recovered fragment.'
        : 'The arrival observation and recovered fragment supply the comparison; no absent player needs to produce a repair request.')
      .replace('The musician, if present, is not convicted by a false surname.', story.characters.some(c => c.id === 'musician')
        ? 'The musician explains the borrowed surname; it cannot make an old cap evidence of a new visitor.'
        : 'No unfamiliar visitor can be placed in the workshop merely by pointing to that old cap.')
      .replace('These records exist whether or not their usual keepers are among tonight\'s players.', 'The records are now on the table for these guests to compare.')
      .replace('The family\'s documents are brought to the table even if their usual delivery agents are not playing tonight.', 'The family\'s documents are brought to the table and read in full before the comparison.');
    // In the three-player editions the absent fourth witness contributes a recorded account,
    // not an unplayed role whose owner must improvise or supply a missing clue.
    if (count === 3) {
      const transfer = {
        sample: 'Vesper is not a guest in this edition. Ambrose hired her performance before the blackout; the host reads her account of the pedal. His written instructions will be examined when found. Ashgrove, Crane and Constance investigate without an unplayed medium needing to supply a clue.',
        'mercy-hollow': 'Mara is not a guest in this edition. Her signed corridor statement and retraction are read by the host, so all three guests can examine the same account.',
        'blackthorn-farm': 'Emil is not a guest in this edition. His written discovery and stair-repair account is read by the host; Clara, Marta and Adler compare it with the objects.',
        'briar-house': 'Iris is not a guest in this edition. Her receipt book and written discovery account are read by the host; the three guests have her retained documents, not a missing player\'s secret.',
      };
      if (ri === 0) chapter.narration += `\n\n${transfer[family]}`;
    }
    chapter.narration += `\n\n${scene}\n${plan.questions[ri]} In this ${count}-player edition, the comparison passes through the whole table:\n${assignments.join('\n')}\nEvery guest reads the findings below on their phone; nobody acts out a discovery.`;
    chapter.hostNotes = `This is the fixed ${count}-player edition. Read the entire chapter, including the investigation handoffs. Then every guest reads their assigned evidence. The cast and scripts stay locked even if a phone disconnects.`;
  });
  const result = normalizeStory(story);
  if (result.errors.length) throw new Error(`${family}/${count}: ${result.errors.join('; ')}`);
  return story;
}

const output = new URL('../js/editions/', import.meta.url);
fs.mkdirSync(output, { recursive: true });
const sample = {};
for (let n = 3; n <= 24; n++) sample[n] = authorEdition(buildSampleStory(guests(n)), 'sample', n);
const families = { sample };
for (const entry of STARTER_MYSTERIES) {
  families[entry.id] = {};
  for (let n = 3; n <= entry.story.characters.length; n++) families[entry.id][n] = authorEdition(entry.story, entry.id, n);
}
for (const [family, editions] of Object.entries(families)) {
  fs.writeFileSync(new URL(`${family}.js`, output), `// Committed, standalone count-specific editions. Rebuild only with tools/author-editions.mjs.\nexport default ${JSON.stringify(editions, null, 2)};\n`);
  console.log(`${family}: ${Object.keys(editions).length} fixed editions`);
}
