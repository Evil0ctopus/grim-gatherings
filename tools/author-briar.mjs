import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import legacy from '../js/editions/briar-house.js';
import { STARTER_MYSTERIES } from './story-sources/starter-sources.mjs';
import { normalizeStory } from '../js/story.js';

const source = legacy[5];
const wider = STARTER_MYSTERIES.find(entry => entry.id === 'briar-house').story;
const core = ['solicitor', 'housekeeper', 'secretary'];
const family = 'briar-playtest';
const masterPath = new URL('./story-sources/briar-master.json', import.meta.url);
const outputPath = new URL('../js/editions/briar-playtest.js', import.meta.url);
const sourceRounds = [0, 1, 1, 2, 3, 3, 4];
const MASTER_HASH = '1251f7bca1e93a42d0439d1e6f43d9bd4260075aae4d79b6e7723fb4dc45d1b5';
const notice = 'Owner-approved unfinished playtest. The supplied ending identifies the killer, motive and opportunity but does not specify the physical murder method. All editions preserve the three-player playtest master; supporting roles add no murder facts. Not certified as a completed rules-compliant story.';
const supplementalIds = ['daughter', 'nephew', 'companion', 'doctor', 'foreman', 'journalist', 'cousin', 'bankcontact', 'brother'];
const cast = [...core, ...supplementalIds].map(id => {
  const original = source.characters.find(character => character.id === id) || wider.characters.find(character => character.id === id);
  if (original) return {
    id, name: original.name, role: original.role, publicBlurb: original.publicBlurb,
    relationship: original.relationship || original.role, tieIn: original.tieIn || original.publicBlurb,
    optional: false, guest: '', guestNote: '', ghost: null,
  };
  return id === 'bankcontact' ? {
    id, name: "Julian's Bank Contact", role: 'Source-linked comparison reader',
    relationship: 'The unnamed bank contact in Julian Finch’s supplied account.',
    tieIn: 'A role-labelled testing seat based on an existing off-site source, not a newly placed study witness. Read only the shared records; no personal observations, arrival or alibi are invented.',
    publicBlurb: 'Compare the records already read aloud. This seat does not move the bank source into the household timeline.',
    optional: false, guest: '', guestNote: '', ghost: null,
  } : {
    id, name: "Ada's Brother", role: 'Source-linked comparison reader',
    relationship: 'The unnamed brother mentioned in Ada March’s supplied household-money account.',
    tieIn: 'A role-labelled testing seat based on an existing family connection, not a newly placed study witness. Read only shared accounts; no personal observations, arrival or alibi are invented.',
    publicBlurb: 'Compare the records already read aloud. This seat does not place Ada’s brother at the study.',
    optional: false, guest: '', guestNote: '', ghost: null,
  };
});
const names = Object.fromEntries(cast.map(character => [character.id, character.name]));
const spell = text => text.replace(/\{([^}]+)\}/g, (_, id) => {
  if (!names[id]) throw new Error(`Unknown source reference: ${id}`);
  return names[id];
});
const clue = (accuses, observation, contradictingDetail) => {
  const text = `${observation} ${contradictingDetail}`;
  if (text.split(/\s+/).length > 35) throw new Error(`Overlong Briar clue: ${text}`);
  return { accuses, text, observation, contradictingDetail };
};
const corrections = {
  2: [
    clue('secretary', "I read {secretary}'s duplicate will preserving the family's inheritance.",
      'I must correct treating her document access as proof of theft; the surviving copy also exposes who loses the trusteeship.'),
    clue('solicitor', 'I read that {solicitor} loses his trusteeship and faces repayment.',
      'I must compare that specific loss with the study account, not substitute a family argument for the missing papers.'),
    clue('housekeeper', "I heard {housekeeper}'s delayed corridor account and separate household shortfall.",
      'I must distinguish suspicion about her delay from proof she removed trust records; the two accounts are not interchangeable.'),
  ],
  5: [
    clue('housekeeper', 'I heard {housekeeper} report no intervening entry before Iris found Cecily.',
      'I must check her sequence against the receipt and appointment, not treat continued ringing as a clock or invent another entrant.'),
    clue('secretary', 'I read that Cecily ordered {secretary} to keep copies.',
      'I must correct confusing preservation with theft; the carbon was retained before the originals disappeared, not created to fit our accusation.'),
    clue('solicitor', 'I read {solicitor} denied the study meeting recorded in the appointment.',
      'I must compare the signed receipt and exit account with that denial; a sounding bell cannot place him in another room.'),
  ],
};

// Rows follow the original five discovery chapters. All facts are spoken in the master.
const facts = [
  [
    '{solicitor} signed the will receipt and denied entering the study.',
    '{housekeeper} saw Pell leave before the bell stopped.',
    '{secretary} found Cecily and recorded the earlier will handover.',
    '{daughter} argued about inheritance control before the private appointment.',
    '{nephew} complained about a will he had not read.',
    '{companion} reported Cecily wanted to repay loyalty, not punish her family.',
    '{doctor} reported Cecily was alert before entering the study.',
    '{foreman} described the proposed trust as support for injured workers.',
    '{journalist} held an invitation announcing a charitable trust.',
    '{cousin} reported Cecily planned a private meeting with Pell.',
    "No eyewitness statement by {bankcontact} is supplied for the study sequence.",
    "No eyewitness statement by {brother} is supplied for the study sequence.",
  ],
  [
    '{solicitor} was removed as trustee by the duplicate will.',
    '{housekeeper} admitted a household shortfall separate from the trust.',
    "{secretary}'s tray held the duplicate preserving the heirs.",
    '{daughter} produced Cecily’s repayment letter after concealing it.',
    '{nephew} still inherited enough to address his debts.',
    '{companion} reported Cecily called the accounts someone else’s purse.',
    '{doctor} faced a complaint among several accountability letters.',
    '{foreman} distinguished the larger withdrawals from her repair allowance.',
    '{journalist} reported a bank source’s account of a requested trustee review.',
    '{cousin} reported the family could manage its inheritance without Pell.',
    "Julian’s supplied account names {bankcontact} as his unnamed review source.",
    "Ada’s supplied account mentions household money taken to help {brother}.",
  ],
  [
    '{solicitor} denied the study entry despite the receipt and exit account.',
    '{housekeeper} demonstrated ringing continuing after the bell cord was pulled.',
    '{secretary} explained Cecily’s instructions to keep copies.',
    '{daughter} still inherited under the duplicate will.',
    '{nephew} had complained without reading the will.',
    '{companion} reported Cecily’s concern about the accounts.',
    "{doctor}'s complaint remained while the financial papers disappeared.",
    '{foreman} distinguished the repair allowance from the larger withdrawals.',
    '{journalist} had reported the requested trustee review, not a study sighting.',
    '{cousin} had reported the planned private meeting.',
    "The account attributed to {bankcontact} concerns a review, not a study sighting.",
    "The account mentioning {brother} concerns household money, not a study sighting.",
  ],
  [
    '{solicitor} was named in the appointment before the bell.',
    '{housekeeper} reported no intervening entry before Iris’s discovery.',
    '{secretary} retained the carbon before the originals disappeared.',
    '{daughter} kept the appointment note and was not disinherited.',
    '{nephew} had guessed at the will’s terms.',
    '{companion} saw Pell request originals rather than copies.',
    "{doctor}'s complaint remained on the desk.",
    '{foreman} had distinguished her allowance from the trust money.',
    '{journalist} recorded Pell’s claim that only the old will was valid.',
    '{cousin} saw the duplicate in Iris’s tray before the alarm.',
    "The source attributed to {bankcontact} did not supply the corridor sequence.",
    "The source account mentioning {brother} did not supply the corridor sequence.",
  ],
  [
    '{solicitor} received trust transfers through his private practice.',
    '{housekeeper} distinguished her shortfall from the trust transfers.',
    '{secretary} retained the carbon naming the recipient.',
    '{daughter} preserved the repayment letter and appointment.',
    '{nephew} still inherited despite his debts and false promises.',
    '{companion} had reported Pell’s request for originals only.',
    "{doctor}'s complaint was not among the selectively removed papers.",
    '{foreman} reported Pell denied available money while approving his practice’s transfers.',
    '{journalist} recorded Pell favouring the old will before the announcement.',
    '{cousin} had seen the duplicate before the alarm.',
    "The account attributed to {bankcontact} supports reviewing transactions, not witnessing the death.",
    "The account mentioning {brother} explains Ada’s shortfall, not the trust transfers.",
  ],
];
const complications = [
  'But I must check that claim against the recorded documents and timing.',
  'But I must distinguish the household dispute from the trustee’s specific loss.',
  'But I cannot use a continued sound to locate someone when it began.',
  'But I must compare that account with the already recorded study sequence.',
  'But I must explain the full money and document chain, not one grievance.',
];
function validate(story) {
  const covered = new Set();
  story.rounds.forEach((round, ri) => {
    const trio = ri % 2 ? [core[0], core[2], core[1]] : [...core];
    round.readingGroups = [trio, ...story.characters.slice(3).map(character => [character.id])];
    round.chain = round.readingGroups.flat();
    round.coverageRepeat = story.characters.some(character => covered.has(`${character.id}:${character.rounds[ri].readAloud.accuses}`));
    for (const character of story.characters) covered.add(`${character.id}:${character.rounds[ri].readAloud.accuses}`);
  });
  const { errors } = normalizeStory(story);
  if (errors.length) throw new Error(errors.join('\n'));
  return story;
}
function buildMaster() {
  const master = structuredClone(source);
  Object.assign(master, {
    fixedPlayerCount: 3, masterPreserving: true, authorPlaytest: true, playtestNotice: notice,
    edition: { family, id: `${family}-3-players`, playerCount: 3, revision: 1 },
    intro: source.intro.replace(/Tonight's 5 guests[\s\S]*$/,
      'Three readers carry the investigation: Edmund Pell, Ada March and Iris Shaw. The host reads every supplied account, including those from absent neighbors. Discuss only released evidence; nobody invents a private history or a new discovery.'),
    coverageRepeatNote: 'The trio covers its six directed pairs in the first two rounds. Later repeats add released evidence or explicitly correct earlier assumptions. Supporting readers cover all other selected targets before repeating, never consecutively. The separate singleton readings preserve the trio without changing the master.',
  });
  master.rounds = sourceRounds.map((sr, ri) => {
    const original = source.rounds[sr];
    const compare = ri === 2 || ri === 5;
    const narration = spell(original.narration.split('\n\n').slice(0, 3).join('\n\n'));
    const recorded = source.characters.map(character => `${character.name}'s recorded response: "${spell(character.rounds[sr].readAloud.text)}"`).join('\n');
    return {
      title: `Round ${ri + 1} - ${compare ? (ri === 2 ? 'Who Loses Under the Copy?' : 'The Sequence, Not the Sound') : original.title.replace(/^Round \d+ - /, '')}`,
      narration: compare
        ? (ri === 2
          ? 'Compare only the receipt, study exit, duplicate will and repayment letter already heard. A family argument does not tell you who loses the trusteeship. A surviving copy disproves a rumor without supplying an alibi. Correct an accusation that confuses household money with trust money or document access with theft. No new discovery, appointment detail or medical finding is introduced.'
          : 'Compare only the continuing bell, signed receipt, appointment and no-intervening-entry account already read. A sounding bell is not a clock and cannot put a person in the drawing room. Cecily ordered copies before the originals disappeared; they were not created afterward to fit a suspect. Correct an accusation based solely on missing papers or family resentment. No new discovery or medical finding is introduced.')
        : `${narration}\n\nThe host reads the original neighbors' recorded responses:\n${recorded}\n\nSource-grounded supporting comparisons:\n${facts[sr].map(spell).join('\n')}`,
      publicText: compare ? 'Reassess released documents and accounts; no new discovery.' : original.publicText,
      events: compare ? ['Compare already released accounts.', 'Correct an unsupported inference.'] : original.events,
      hostNotes: 'Unfinished author playtest: read every shared account before the trio, then the supporting readers. Role-labelled comparison seats do not place off-site source people in the study timeline. No physical murder method is supplied; do not invent one.',
    };
  });
  master.characters = cast.slice(0, 3).map((character, ci) => ({
    ...character,
    rounds: sourceRounds.map((sr, ri) => {
      const target = core[(ci + (ri % 2 ? 2 : 1)) % 3];
      const reading = corrections[ri]?.find(reading => reading.accuses === target) ||
        source.characters.find(reader => reader.rounds[sr].readAloud.accuses === target).rounds[sr].readAloud;
      if (reading.accuses !== target) throw new Error('Master clue target does not match its trio order.');
      return { readAloud: structuredClone(reading) };
    }),
  }));
  master.conversion = {
    source: 'Existing five-player Briar House edition and ten-person original starter source.',
    status: 'Owner-approved testing conversion, not a completed canon certification.',
    changes: [
      { original: 'Five discovery rounds, five-player handoffs and character readings.', replacement: 'Seven shared chapters with named host-read responses, an invariant three-player loop and two comparison-only chapters.', reason: 'Seven-round and smallest-edition master requirements; preserve all five discovery sequences and evidence from absent roles.' },
      { original: 'Supporting observations in the wider source’s three-chapter character accounts.', replacement: 'Explicit shared comparison statements in the corresponding five discovery sequence.', reason: 'Release existing supporting facts publicly before any supplemental reader uses them; do not add solution facts.' },
      { original: 'Ten named characters and references to Julian’s unnamed bank contact and Ada’s unnamed brother.', replacement: 'Ten original characters plus two clearly role-labelled evidence-comparison seats.', reason: 'Reach twelve testing seats without inventing identities, eyewitness acts, presence at the crime or new alibis.' },
      { original: 'The supplied reveal omits the physical murder method.', replacement: 'Reveal unchanged; explicit unfinished-playtest notice in all counts.', reason: 'User authorized a testing release like LOCKDOWN, not invention of missing canon.' },
    ],
    originalResponses: source.characters.map(character => ({ id: character.id, rounds: character.rounds })),
  };
  return validate(master);
}
function expand(master, count) {
  const story = structuredClone(master);
  story.fixedPlayerCount = count;
  story.edition = { ...master.edition, id: `${family}-${count}-players`, playerCount: count };
  const verbs = ['read', 'checked', 'reviewed', 'considered', 'examined', 'compared', 'revisited', 'studied', 'weighed'];
  for (const [index, character] of cast.slice(3, count).entries()) {
    const targets = cast.slice(0, count).filter(target => target.id !== character.id);
    story.characters.push({
      ...character,
      rounds: sourceRounds.map((sr, ri) => {
        const target = targets[(ri + index) % targets.length];
        const fact = facts[sr][cast.findIndex(entry => entry.id === target.id)];
        if (!master.rounds.slice(0, ri + 1).some(round => round.narration.includes(spell(fact)))) throw new Error(`Unreleased fact: ${fact}`);
        const repeated = ri >= targets.length;
        const detail = ri === 2 || ri === 5
          ? 'I must correct turning access, anger or a sounding bell into proof of murder.'
          : repeated
            ? 'I must correct mistaking one account for the full money, document and timing chain.'
            : complications[sr];
        return { readAloud: clue(target.id, `I ${verbs[index]} the account: ${fact}`, detail) };
      }),
    });
  }
  return validate(story);
}
if (process.argv.includes('--create-master')) {
  writeFileSync(masterPath, `${JSON.stringify(buildMaster(), null, 2)}\n`, { flag: 'wx' });
  console.log('Created Briar three-player playtest master; review before locking and expanding.');
} else {
  const bytes = readFileSync(masterPath);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== MASTER_HASH) throw new Error(`Briar master lock mismatch: ${hash}`);
  const master = validate(JSON.parse(bytes));
  const editions = { 3: master, 12: expand(master, 12) };
  for (let count = 4; count < 12; count++) editions[count] = expand(master, count);
  const output = `// Generated from the locked Briar playtest master; node tools/author-briar.mjs.\nexport default ${JSON.stringify(editions, null, 2)};\n`;
  if (process.argv.includes('--check')) {
    if (readFileSync(outputPath, 'utf8') !== output) throw new Error('Briar editions are not reproducible.');
    console.log('Validated all ten reproducible Briar playtest editions without writing files.');
  } else {
    writeFileSync(outputPath, output);
    console.log('Validated Briar twelve-player endpoint, then all intermediate playtest editions.');
  }
}
