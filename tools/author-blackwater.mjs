import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import legacy from '../js/editions/blackwater-row.js';
import { normalizeStory } from '../js/story.js';

const source = legacy[4];
const MASTER_HASH = 'dfd89ee9aae48af6656a87c215bad350671acb9a049a6c642e7f788146bd533a';
const family = 'blackwater-scalable';
const core = ['xander', 'marla', 'jasper'];
const masterPath = new URL('./story-sources/blackwater-master.json', import.meta.url);
const outputPath = new URL('../js/editions/blackwater-scalable.js', import.meta.url);
const sourceRounds = [0, 1, 2, 2, 3, 3, 4];
const additions = [
  source.characters[3],
  { id: 'nell', name: 'Nell Reed', role: 'Night watchwoman', publicBlurb: 'Records the scene findings and supplies the razor sighting.' },
  { id: 'della', name: 'Della March', role: 'Cobbler', publicBlurb: 'Identifies the repaired boot and the neighbors in her recorded accounts.' },
  { id: 'finn', name: 'Finn Moss', role: 'Delivery porter', publicBlurb: 'Finds Elias and reports the musician waiting behind the bakery.' },
  { id: 'ada', name: 'Ada Bell', role: 'Tavern cleaner', publicBlurb: 'Finds Ronan and reports the tavern objects and appointments.' },
  { id: 'owen', name: 'Owen Bell', role: 'School caretaker', publicBlurb: 'Finds Harper and supplies the school visit accounts and records.' },
  { id: 'edith', name: 'Edith Shaw', role: 'Office clerk', publicBlurb: 'Finds Thorne and traces the final documents to the office cabinet.' },
  { id: 'investigator', name: 'Town Investigator', role: 'Investigator', publicBlurb: 'Compares the supplied findings and records. No additional discoveries are authored for this role.' },
  { id: 'pupil', name: "Della's Granddaughter", role: 'School pupil', publicBlurb: 'The granddaughter Della collects from school in her recorded identification of Lydia. This role responds to public accounts; no new eyewitness claims are assigned.' },
];
const cast = [...source.characters.slice(0, 3), ...additions];
const names = Object.fromEntries(cast.map(c => [c.id, c.name]));
const spell = text => text.replace(/\{([^}]+)\}/g, (_, id) => {
  if (!names[id]) throw new Error(`Unknown source reference: ${id}`);
  return names[id];
});
const comparisonClues = {
  3: [
    ["I heard {jasper}'s case rubbed the chalky desk over its flour streak.", 'I must distinguish transferred work marks from evidence that he removed the student-record page.'],
    ["I heard {xander}'s drawer repair explained chalk on his cuff.", 'I must not mistake a work mark for an explanation of the missing pages or his earlier blade skills.'],
    ["I read {marla}'s signed bread delivery at six.", 'I must distinguish an evening delivery from a fatal-morning visit; access alone does not explain the missing page.'],
  ],
  5: [
    ["I read {jasper}'s visit to the lamp in Della's account.", 'I must not treat spilled oil on his sleeve as proof of a precise cut or an account of his later movements.'],
    ["I heard Nell identify {xander}'s chipped ivory razor.", 'I must compare that identifiable tool with the repeated cuts, not call the sighting a confession.'],
    ["I read {marla}'s closing duty to scrub the rear threshold.", 'I must correct my earlier suspicion: flour in her repaired heel can come from work, not a witnessed killing.'],
  ],
};
const witnessFacts = [
  [
    '{nell} recorded flour prints with a crescent gap in the right heel.',
    '{della} recognized the repaired boot from its collection yesterday.',
    '{finn} found Elias and called Nell before anyone entered the yard.',
    '{ada} has not supplied a tavern account at this stage.',
    '{owen} has not supplied a classroom account at this stage.',
    '{edith} has not supplied an office account at this stage.',
    '{investigator} reported one precise cut at the bakery.',
    "Della recognized Lydia through collecting {pupil} from school.",
  ],
  [
    '{nell} recorded a wiped mug without usable fingerprints.',
    '{della} heard Marla dispute the flour bill and leave toward the bakery.',
    '{finn} did not witness the bakery death or the musician leaving.',
    '{ada} found Ronan and left the mug untouched.',
    '{owen} has not supplied a classroom account at this stage.',
    '{edith} has not supplied an office account at this stage.',
    '{investigator} reported the same precise cut at the tavern.',
    "Della's school collection of {pupil} explains her recognition of Lydia.",
  ],
  [
    '{nell} recorded a chalk smear and narrow drag line through it.',
    '{della} identified Lydia and the topic of the bakery argument.',
    '{finn} heard a promised parcel requested but saw no handover.',
    '{ada} saw the fine stones in an address-stamped sleeve.',
    '{owen} found Harper, locked the classroom and fetched Nell.',
    '{edith} has not supplied an office account at this stage.',
    '{investigator} connected three disturbed records by receipt 47.',
    "Della's collection of {pupil} identifies a teacher, not a threat.",
  ],
  [
    '{nell} saw the chipped ivory razor enter the stamped sleeve.',
    '{della} saw Jasper holding the flask before oil spilled on his sleeve.',
    '{finn} left for the delivery cart without witnessing the bakery death.',
    '{ada} saw the blue-strapped case on Ronan\'s counter at ten.',
    '{owen} left at seven without watching the separate yard entrance overnight.',
    '{edith} has not supplied an office account at this stage.',
    '{investigator} preserved the earlier work records for timing comparisons.',
    "Della's school collection of {pupil} does not identify a murderer.",
  ],
  [
    '{nell} identified the damaged razor in the earlier sighting.',
    '{della}\'s boot identification established work access, not print timing.',
    '{finn}\'s case account established an evening visit, not a witnessed murder.',
    '{ada}\'s account left later private visitors possible.',
    '{owen}\'s accounts did not establish an overnight alibi.',
    '{edith} matched the licensed likeness and address to Xander.',
    '{investigator} read the retained duplicate records and Thorne\'s letter.',
    "Della's identification through {pupil} does not implicate Lydia in the old falsification.",
  ],
];

function clue(observation, contradictingDetail, accuses) {
  const text = `${observation} ${contradictingDetail}`;
  if (text.split(/\s+/).length > 35) throw new Error(`Overlong clue: ${text}`);
  return { accuses, text, observation, contradictingDetail };
}

function finalize(story) {
  const covered = new Set();
  story.rounds.forEach((round, ri) => {
    const order = ri % 2 ? [core[0], core[2], core[1]] : [...core];
    round.readingGroups = [order, ...story.characters.slice(3).map(c => [c.id])];
    round.chain = round.readingGroups.flat();
    round.coverageRepeat = story.characters.some(c => covered.has(`${c.id}:${c.rounds[ri].readAloud.accuses}`));
    for (const c of story.characters) covered.add(`${c.id}:${c.rounds[ri].readAloud.accuses}`);
  });
  const { errors } = normalizeStory(story);
  if (errors.length) throw new Error(errors.join('\n'));
  return story;
}

function buildMaster() {
  const master = structuredClone(source);
  master.masterPreserving = true;
  master.fixedPlayerCount = 3;
  master.edition = { family, id: `${family}-3-players`, playerCount: 3, revision: 1 };
  master.intro = 'Evening settles over Blackwater Row. Three neighbors help the town investigator compare the supplied accounts: Xander Hale, the woodworker; Marla Quinn, the baker\'s assistant; and Jasper Crowe, the tavern musician. The host reads every recorded witness account before the players respond. Other named people remain in the evidence even when they are not playable. Discuss only the chapter just heard; nobody invents a history, witnesses a new discovery or improvises a private part.';
  master.coverageRepeatNote = 'The trio covers all six directed pairs in the first two rounds. Later repeats add released evidence or explicitly correct an unsupported earlier inference. Each supplemental reader targets every other selected character before repeating, never in consecutive rounds. Separate singleton readings preserve the master loop and evidence timing.';
  master.specialMechanics = [source.specialMechanics[0].replace('Round 5', 'Round 7')];
  master.rounds = sourceRounds.map((sr, ri) => {
    const original = source.rounds[sr];
    const comparison = ri === 3 || ri === 5;
    const narration = spell(original.narration)
      .replace(/(?:Xander Hale|Marla Quinn|Jasper Crowe|Lydia Vance) leads the comparison[^.]*\./g, '')
      .replace('before calling on the four neighbors', 'before calling on the selected readers');
    const responses = source.characters.map(c => `${c.name}'s recorded response: "${spell(c.rounds[sr].readAloud.text)}"`).join('\n');
    const publicWitnesses = witnessFacts[sr].map(spell).join('\n');
    return {
      title: `Round ${ri + 1} - ${comparison ? (ri === 3 ? 'Visits and Transferred Marks' : 'Work Traces and the Identified Tool') : original.title.replace(/^Round \d+ - /, '')}`,
      narration: comparison
        ? (ri === 3
          ? 'Compare only the findings already read at the bakery, tavern and school. An evening delivery is not a fatal-morning visit; flour, rosin, shellac and chalk have witnessed work-related sources. Receipt 47 links disturbed records but does not yet identify their subject. Correct an accusation that mistakes a work trace or access for a witnessed killing. No new death, name, trade or weapon identification is introduced.'
          : 'Compare the already released closing-duty sheet, private-appointment records, school visits and Nell\'s chipped-razor sighting. A work record can explain a trace without supplying an overnight alibi. The identified razor is more specific than an unexplained color or stain, but its sighting is not a confession. Correct earlier accusations based only on flour, chalk or spilled oil. No new death or old identity is introduced.')
        : `${narration}\n\nThe host reads the original neighbors' recorded responses:\n${responses}\n\nThe supplied witness accounts support these comparisons:\n${publicWitnesses}`,
      publicText: comparison ? 'Correct earlier inferences using only already released evidence.' : original.publicText,
      hostNotes: 'Read the full chapter and recorded accounts aloud. Then call the original trio in its stored order, followed by supplemental readers. Deliberate and vote after everyone reads. Do not preview the old name, occupation or Mayor connection before the final discovery chapter.',
      events: comparison ? ['Compare released work traces with the recorded visits.', 'Correct unsupported accusations without a new discovery.'] : original.events,
    };
  });
  master.characters = source.characters.slice(0, 3).map((c, ci) => ({
    ...structuredClone(c), guest: '', guestNote: '', optional: false,
    rounds: sourceRounds.map((sr, ri) => {
      const target = core[(ci + (ri % 2 ? 2 : 1)) % 3];
      if (comparisonClues[ri]) return { readAloud: clue(...comparisonClues[ri][ci], target) };
      const original = source.characters.find(reader => reader.rounds[sr].readAloud.accuses === target).rounds[sr].readAloud;
      return { readAloud: structuredClone(original) };
    }),
  }));
  master.finale.narration = master.finale.narration.replace('All five chapters', 'All seven chapters');
  master.solution.explanation = master.solution.explanation.replaceAll('Round 5', 'Round 7').replaceAll('Round 4', 'Round 5');
  master.conversion = {
    source: 'Committed four-player Blackwater Row revision 3.',
    changes: [
      { original: 'Five discovery chapters and four playable neighbors.', replacement: 'Five unchanged discovery sequences with two intervening comparison chapters and a three-player core.', reason: 'Seven-round requirement and smallest-edition master. Identity remains in the last discovery chapter; no murders or facts are added.' },
      { original: 'Per-chapter four-player reader handoffs and twenty player responses.', replacement: 'Named recorded responses in shared narration and count-specific group order.', reason: 'Preserve every witness source and original response while selecting a three-player loop.' },
      { original: 'Solution timing references to Round 4 and Round 5.', replacement: 'Corresponding seven-chapter references to Round 5 and Round 7.', reason: 'Inserted comparison rounds shift chapter numbers without advancing evidence.' },
    ],
    originalResponses: source.characters.map(c => ({ id: c.id, rounds: c.rounds })),
  };
  return finalize(master);
}

function expand(master, count) {
  const story = structuredClone(master);
  story.fixedPlayerCount = count;
  story.edition = { ...story.edition, id: `${family}-${count}-players`, playerCount: count };
  for (const [index, c] of additions.slice(0, count - 3).entries()) {
    const eligible = cast.slice(0, count).filter(target => target.id !== c.id);
    story.characters.push({
      id: c.id, name: c.name, role: c.role, relationship: c.relationship || 'An existing person in the supplied Blackwater Row accounts.',
      tieIn: c.tieIn || c.publicBlurb, publicBlurb: c.publicBlurb, optional: false, guest: '', guestNote: '', ghost: null,
      rounds: sourceRounds.map((sr, ri) => {
        const target = eligible[(ri + index) % eligible.length];
        const original = source.characters.find(reader => reader.rounds[sr].readAloud.accuses === target.id)?.rounds[sr].readAloud;
        let observation, complication;
        if (original) {
          observation = original.observation.replace(/^I (heard|read|learned)/, (_, verb) =>
            `I ${{ heard: 'learned', read: 'checked', learned: 'heard' }[verb]}`);
          complication = original.contradictingDetail;
        } else {
          const fact = witnessFacts[sr][additions.findIndex(entry => entry.id === target.id) - 1];
          if (!master.rounds.slice(0, ri + 1).some(round => round.narration.includes(spell(fact)))) throw new Error('Unreleased supplemental witness fact.');
          observation = `I heard the account: ${fact}`;
          complication = ri === 3 || ri === 5
            ? 'I must correct any inference that turns an account into a witnessed killing.'
            : 'But I must judge what was actually witnessed, not assume a killing was seen.';
        }
        if (ri >= eligible.length && (ri === 3 || ri === 5 || !original)) {
          complication = 'I must correct mistaking a report for a witnessed killing.';
        }
        return { readAloud: clue(observation, complication, target.id) };
      }),
    });
  }
  return finalize(story);
}

if (process.argv.includes('--create-master')) {
  writeFileSync(masterPath, `${JSON.stringify(buildMaster(), null, 2)}\n`, { flag: 'wx' });
  console.log('Created Blackwater three-player draft master.');
} else {
  const bytes = readFileSync(masterPath);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== MASTER_HASH) throw new Error('The finalized Blackwater master has changed; expansions cannot rewrite it.');
  const master = finalize(JSON.parse(bytes));
  const editions = { 3: master, 12: expand(master, 12) };
  for (let count = 4; count < 12; count++) editions[count] = expand(master, count);
  const output = `// Generated from the Blackwater master; node tools/author-blackwater.mjs.\nexport default ${JSON.stringify(editions, null, 2)};\n`;
  if (process.argv.includes('--check')) {
    if (readFileSync(outputPath, 'utf8') !== output) throw new Error('Blackwater editions are not reproducible.');
    console.log('Validated all ten reproducible Blackwater editions without writing files.');
  } else {
    writeFileSync(outputPath, output);
    console.log(`Validated all ten Blackwater editions; master hash ${hash}`);
  }
}
