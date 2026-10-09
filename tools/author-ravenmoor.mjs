import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildSampleStory } from './story-sources/sample-source.mjs';
import legacy from '../js/editions/sample.js';
import { normalizeStory } from '../js/story.js';

const source = buildSampleStory(Array.from({ length: 12 }, (_, i) => ({ name: `Source ${i + 1}`, desc: '' })));
const coreIds = ['ashgrove', 'crane', 'constance'];
const names = Object.fromEntries(source.characters.map(c => [c.id, c.name]));
const spellNames = text => text.replace(/\{([^}]+)\}/g, (_, id) => names[id]);
const masterPath = new URL('./story-sources/ravenmoor-master.json', import.meta.url);
const outputPath = new URL('../js/editions/ravenmoor.js', import.meta.url);
const masterDigest = '4c50e6f9afb89c7f0f17c25047958781df4b1a795282b1108a167e173ba2bebe';
const sourceRounds = [0, 1, 1, 2, 3, 3, 4];

// Each row follows the original twelve-character source order. No new witnesses or facts.
const facts = [
  [
    '{ashgrove} called the blue lips a weak heart.',
    '{crane} returned to the doorway to pocket a candlestick.',
    '{constance} poured the brandy and drank from the same decanter.',
    '{vesper} pressed the concealed pedal before the blackout.',
    'Ambrose threatened to report {grey} to the bishop for drinking.',
    '{marsh} withheld the sealed codicil after the death.',
    '{pell} tended the manor garden.',
    '{finch} kept the photograph developing after the blackout flash.',
    '{wren} kept Eleanor\'s room unchanged despite a threatened dismissal.',
    '{ivy} removed letters from Ambrose\'s coat after his death.',
    'A revolver was found in {vane}\'s jacket.',
    'The stolen grimoire was found in {blackwood}\'s coat.',
  ],
  [
    'Eleanor\'s tonic bottle bears {ashgrove}\'s handwriting and initials.',
    'Stolen silver connects {crane} to concealed dealings outside the manor.',
    '{constance} hid gambling debts that her inheritance would settle.',
    'A wire connects {vesper} to the fraudulent spirit knocks.',
    '{grey} withheld Eleanor\'s fear of her medicine.',
    'Unexplained estate withdrawals point to {marsh}.',
    'Cut monkshood grew in the garden tended by {pell}.',
    '{finch} kept the photograph while it developed.',
    '{wren} preserved the room where Eleanor had taken her tonic.',
    '{ivy} concealed love letters taken from the body.',
    '{vane} noticed a sharp green smell during the blackout.',
    '{blackwood} hid a grimoire describing wolfsbane poisoning.',
  ],
  [
    '{ashgrove} certified fever despite Eleanor\'s numb lips and dying plants.',
    '{crane}\'s candlestick theft places him in the doorway during darkness.',
    '{constance} wished Ambrose would join Eleanor during their dinner argument.',
    'Ambrose paid {vesper} to follow his script and control the bellows.',
    '{grey} heard Eleanor say medicine, not fever, would kill her.',
    'Ambrose instructed {marsh} to open the codicil if he died.',
    '{pell} recognized the symptoms and recalled a doctor\'s bag and lethal-dose question.',
    '{finch} concealed a dismissal for invented reporting.',
    '{wren} knew Eleanor\'s discarded tonic killed the room\'s plants.',
    '{ivy} threatened regret after Ambrose ended their affair.',
    '{vane} knew wolfsbane could kill and smelled crushed plants.',
    '{blackwood} carried a book describing poison resembling heart failure.',
  ],
  [
    '{ashgrove} dismissed poisoning symptoms as a weak heart.',
    '{crane} compared the tonic bottle with the glass findings.',
    '{constance} survived brandy poured from the same decanter.',
    'Ambrose\'s script ordered {vesper} to ask who gave Eleanor the tonic.',
    '{grey} kept Eleanor\'s warning under confession\'s seal.',
    '{marsh} held the codicil naming the signer of Eleanor\'s death certificate.',
    'Bottles washed in {pell}\'s kitchen smelled of wolfsbane a year ago.',
    '{finch}\'s photograph shows a snake-shaped gold ring near the glass.',
    '{wren} preserved Eleanor\'s diary about being watched while drinking.',
    'Beside {ivy}\'s concealed letters was Ambrose\'s warning about S.A.\'s hands.',
    '{vane} carried a gun, but Ambrose died of poisoning.',
    '{blackwood} concealed the book theft but supplied poison knowledge.',
  ],
  [
    'The reaching hand wore {ashgrove}\'s serpent-and-staff ring.',
    '{crane}\'s doorway account describes the ring beside the glass.',
    '{constance} shared harmless brandy and reported Eleanor\'s numb lips.',
    '{vesper} staged Ambrose\'s trap, but he died before the tonic question.',
    '{grey}\'s withheld warning predates tonight\'s murder.',
    '{marsh}\'s preserved codicil points to Eleanor\'s death certificate.',
    '{pell} recognized the plant\'s smell on Eleanor\'s prescribed tonic bottles.',
    '{finch}\'s image agrees with the independent doorway account.',
    '{wren} preserved the diary warning that someone watched Eleanor drink.',
    '{ivy}\'s letters concealed Ambrose\'s warning to watch S.A.\'s hands.',
    '{vane} described the physician beside Ambrose when the candles returned.',
    '{blackwood} saw gloves removed before the seance and replaced afterward.',
  ],
];
const accounts = [
  'I heard the account:',
  'I listened to this account:',
  'I heard this reported:',
  'I noted this in the reading:',
  'I heard the host describe this:',
  'I followed the supplied account:',
  'From the reading, I learned this:',
  'I heard the record state this:',
  'I took this from the account:',
];
const complications = [
  [
    'But I heard choking and glass break, not just a failing heart.',
    'But I cannot place the doorway thief beside the glass.',
    'Yet I know she drank the same brandy and survived.',
    'But I heard a reaching hand after the lights failed.',
    'Yet I cannot connect that letter to the reaching hand.',
    'But I need the withheld document, not an assumption about it.',
    'Yet I cannot connect garden work to tonight\'s reaching hand.',
    'But I cannot judge an image that is still developing.',
    'But I cannot turn a preserved room into glass evidence.',
    'Yet I cannot identify the reaching hand from those removed letters.',
    'But I heard choking, not a shot.',
    'But I cannot equate a stolen book with the reaching hand.',
  ],
  [
    'But I still need to connect the bottle to tonight\'s glass.',
    'Yet I cannot equate stolen silver with a labelled medicine bottle.',
    'But I know she drank from the same decanter and survived.',
    'Yet I cannot explain the tonic label with a performance wire.',
    'But I need the medicine checked, not just the withheld warning.',
    'Yet I cannot explain the bottle initials with estate withdrawals.',
    'But I need the hand at the glass, not just garden access.',
    'Yet I cannot compare an unfinished image with the tonic label.',
    'But I need the medicine examined, not the room judged.',
    'Yet I cannot explain the labelled tonic with a concealed affair.',
    'But I cannot turn a smell into proof of who applied poison.',
    'Yet I need more than a book to explain the labelled tonic.',
  ],
  [
    'But I also read Eleanor\'s warning; I cannot accept fever alone.',
    'Yet I read Ambrose\'s warning about S.A.\'s hands, not stolen silver.',
    'But I read of harmful prescriptions, which dinner anger cannot explain.',
    'Yet I read the tonic question; Ambrose knowingly commissioned the performance.',
    'But I read the bottle initials; silence does not erase that evidence.',
    'Yet I read its instruction about Eleanor\'s death certificate.',
    'But I cannot make the answerer responsible for that question.',
    'Yet I cannot dismiss a developing image solely over a false job.',
    'But I read Eleanor\'s warning; preserving her room also preserved evidence.',
    'Yet I read Ambrose\'s note about S.A.\'s hands beside those letters.',
    'But I cannot replace the tonic initials with debt or poison knowledge.',
    'Yet I read the fever certificate; poison knowledge is not prescribing.',
  ],
  [
    'But I know the decanter was clean and one rim poisoned.',
    'Yet I need a hand at the rim, not household access.',
    'But I must distinguish pouring their brandy from touching one rim.',
    'Yet I know Ambrose died before that planned question.',
    'But I cannot explain the poisoned rim with that earlier silence.',
    'Yet I must compare its instruction with the ring image.',
    'But I need tonight\'s reaching hand, not just the poison source.',
    'Yet I must compare that image with the doorway account.',
    'But I cannot identify tonight\'s hand from an earlier diary alone.',
    'Yet I must compare that warning with the ring image.',
    'But I know the poison was on one rim, not a bullet.',
    'Yet I cannot equate a stolen book with applying poison.',
  ],
  [
    'But I judge the rim, soil and tonic together, not profession alone.',
    'Yet I need the photograph to check the doorway description.',
    'But I cannot explain both poisonings by inheritance alone.',
    'Yet I cannot explain the labelled tonic with a staged blackout.',
    'But I cannot explain the identifying ring with silence.',
    'Yet I cannot explain both deaths with estate withdrawals.',
    'But I need the ring evidence, not garden access alone.',
    'Yet I still compare the image with the poisoned rim.',
    'But I cannot identify the hand from devotion to Eleanor alone.',
    'Yet I cannot explain the earlier tonic poisoning with an affair.',
    'But I need the ring and rim, not mere proximity.',
    'Yet I cannot identify the reaching hand from gloves alone.',
  ],
];
const corrections = {
  2: [
    'I must not mistake the tonic label for proof of tonight\'s hand.',
    'I must not mistake stolen silver for the source of poison.',
    'I must correct my suspicion: shared brandy did not kill her.',
    'I must not mistake the wire for evidence of administered medicine.',
    'I must not mistake a withheld warning for administering the tonic.',
    'I must not mistake withdrawals for evidence of a poisoned glass.',
    'I must not mistake garden access for the reaching hand.',
    'I must wait for the image rather than convict its keeper.',
    'I must not mistake a preserved room for tonight\'s method.',
    'I must not mistake concealed letters for administering medicine.',
    'I must not mistake the plant smell for an identified hand.',
    'I must not mistake a poison book for a prescription.',
  ],
  5: [
    'I must judge the individual rim, not the shared drink.',
    'I must distinguish household access from a hand at one rim.',
    'I must correct my suspicion: pouring did not poison their shared decanter.',
    'I must distinguish the planned question from the poisoned rim.',
    'I must distinguish an earlier silence from touching tonight\'s glass.',
    'I must compare the certificate instruction with the rim findings.',
    'I must distinguish the poison source from its application.',
    'I must compare the pictured hand with the clean decanter.',
    'I must distinguish the diary warning from identifying tonight\'s hand.',
    'I must compare the written warning with the pictured hand.',
    'I must correct my suspicion: a revolver cannot explain that rim.',
    'I must distinguish poison knowledge from touching the individual glass.',
  ],
};
const coreClues = [
  [
    ['I heard the account of {crane} returning to pocket a candlestick.', 'But I cannot tell whether he also approached Ambrose\'s glass.'],
    ['I saw {constance} pour brandy before the candles failed.', 'She drank from the same decanter; I wonder who touched Ambrose\'s glass alone.'],
    ['I heard {ashgrove} call the blue lips a weak heart.', 'But I heard choking and breaking glass; his explanation leaves the reaching hand unexplained.'],
  ],
  [
    ['I know {constance} hid gambling debts that inheritance would settle.', 'But I also heard about a labelled tonic; resentment does not explain that medicine.'],
    ['I read {ashgrove}\'s initials on Eleanor\'s tonic bottle.', 'Soil points toward his chair, but I still need to establish how tonight\'s glass was poisoned.'],
    ['I heard that stolen silver connected {crane} to concealed dealings.', 'But I cannot turn household theft into evidence that he administered Eleanor\'s tonic.'],
  ],
  [
    ['I heard {crane}\'s theft explained his doorway movement.', 'Yet I must compare that with soil by the physician\'s chair, not mistake stolen silver for poison.'],
    ['I know {constance}\'s inheritance could settle her gambling debts.', 'But I cannot ignore that she drank the same brandy and survived the blackout.'],
    ['I read {ashgrove}\'s handwriting on the tonic label.', 'But I must separate a medicine bottle from tonight\'s broken glass; their connection still needs evidence.'],
  ],
  [
    ['I heard {constance} wished Ambrose would join Eleanor.', 'But I read Eleanor\'s account of harmful medicine; angry dinner words do not explain those prescriptions.'],
    ['I read {ashgrove}\'s fever certificate against Eleanor\'s numb lips and dying plants.', 'Ambrose planned a tonic question; I wonder why her death was certified as fever.'],
    ['I heard {crane} returned to pocket the candlestick.', 'But I read Ambrose\'s warning about S.A.\'s hands; the doorway theft does not explain that instruction.'],
  ],
  [
    ['I heard {crane} compare Eleanor\'s tonic with the glass findings.', 'His silver theft explains secrecy, but I need a hand at the poisoned rim, not general household access.'],
    ['I know {constance} survived brandy from the same decanter.', 'But I see poison on Ambrose\'s rim; pouring their shared drink is not the same as touching his glass.'],
    ['I heard {ashgrove} dismiss poisoning symptoms as a weak heart.', 'But I now know the decanter was clean; his explanation does not account for the individual poisoned rim.'],
  ],
  [
    ['I know {constance} poured the shared brandy.', 'Yet I must correct my suspicion: the clean decanter leaves access to one glass, not pouring, to investigate.'],
    ['I heard {ashgrove}\'s weak-heart explanation beside the glass findings.', 'But I also heard of a gold snake-shaped ring; the tonic label alone cannot identify tonight\'s reaching hand.'],
    ['I heard {crane}\'s silver theft explained why he returned.', 'But I must test the ring account independently; his doorway presence is neither proof of murder nor an alibi.'],
  ],
  [
    ['I heard {crane} describe the serpent-and-staff ring near the glass.', 'His candlestick explains the doorway movement, but I need the photograph to check that account.'],
    ['I know {constance} remains the heir and shared harmless brandy.', 'But I heard her account of Eleanor\'s numb lips; I cannot explain both deaths by inheritance alone.'],
    ['I heard the reaching hand wore {ashgrove}\'s serpent-and-staff ring.', 'The rim, soil and tonic agree, but I must judge that combined evidence, not his profession alone.'],
  ],
];

function clue(observation, contradictingDetail, accuses) {
  const text = `${observation} ${contradictingDetail}`;
  if (text.split(/\s+/).length > 35) throw new Error(`Clue exceeds 35 words: ${text}`);
  return { accuses, text, observation, contradictingDetail };
}

function makeMaster() {
  const master = structuredClone(legacy[5]);
  master.masterPreserving = true;
  master.fixedPlayerCount = 3;
  master.edition = { family: 'ravenmoor', id: 'ravenmoor-3-players', playerCount: 3, revision: 1 };
  master.intro = master.intro.replace(/Tonight's 5 guests/, 'Tonight\'s three guests') +
    '\n\nOther named people are part of the supplied accounts, not extra players. The host reads their evidence aloud. The physician, butler and sister remain the locked master cast.';
  master.coverageRepeatNote = 'The original trio covers its six directed pairs in two rounds. Later chapters revisit those pairs with new evidence or an explicit correction. Each supplemental reader covers every other selected character before repeating, with at least one intervening round. Supplemental readings never alter the trio or shared discoveries.';
  master.characters = master.characters.slice(0, 3).map((c, ci) => ({
    ...c, guest: '', guestNote: '',
    rounds: sourceRounds.map((_, ri) => {
      const target = coreIds[(ci + (ri % 2 ? 2 : 1)) % 3];
      return { readAloud: clue(...coreClues[ri][ci], target) };
    }),
  }));
  master.rounds = sourceRounds.map((sr, ri) => {
    const original = legacy[5].rounds[sr];
    const comparison = ri === 2 || ri === 5;
    const accounts = legacy[5].characters.map(c => `${c.name}: "${spellNames(c.rounds[sr].readAloud.text)}"`).join('\n');
    const expandedFacts = facts[sr].map(spellNames).join('\n');
    const body = original.narration.split(/\n\n\{[a-z]/)[0];
    return {
      title: `Round ${ri + 1} - ${comparison ? (ri === 2 ? 'Movements Against Grudges' : 'The Shared Drink and the Single Rim') : original.title.replace(/^Round \d+ - /, '')}`,
      narration: comparison
        ? (ri === 2
          ? 'Return to the discoveries already read: the candlestick, gambling debts, wire, labelled tonic and soil. Compare movements with motives. The same decanter served Constance and Ambrose. Correct any accusation that treats a grievance as proof of a hand at the glass. No new witness or discovery is introduced here.'
          : 'Return to the glass findings already read. The decanter was clean and Constance survived; poison was on Ambrose\'s individual rim. Compare access to that rim with the ring image and the doorway account. Correct any accusation based only on pouring, theft or a concealed weapon. No new witness or discovery is introduced here.')
        : `${body}\n\nThe host reads the supplied character accounts verbatim; players need no absent actor:\n${accounts}\n\nFurther comparisons from the original twelve-character source:\n${expandedFacts}`,
      publicText: comparison ? 'Compare previously released evidence and correct the earlier accusations.' : original.publicText,
      hostNotes: 'Read the whole chapter and supplied accounts aloud. The original trio reads first, then every supplemental reader. Only released evidence may be discussed. Vote after all readings.',
      events: comparison ? ['Compare previously released evidence.', 'Correct motive-only or shared-drink accusations.'] : [...original.events],
    };
  });
  master.conversion = {
    source: 'Original Ravenmoor twelve-character source and committed five-player voice edition.',
    changes: [
      { original: 'Five evidence chapters and a five-player circle.', replacement: 'Seven chapters with a closed three-player core.', reason: 'The two inserted chapters compare already released evidence; the five original discovery chapters remain in order.' },
      { original: 'Evidence spoken by characters outside the three-player cast.', replacement: 'Verbatim, named accounts read by the host in the same discovery chapter.', reason: 'Retain every existing witness and all essential evidence without inventing a new witness or requiring an absent actor.' },
      { original: 'Source-specific reader/target assignments.', replacement: 'The attached coreClues and count-specific supplemental routing.', reason: 'Required three-player closed loop and legal coverage; supplemental observations cite only released source facts.' },
      { original: 'Ambrose planned a tonic question; I wonder why that medicine was called harmless.', replacement: 'Ambrose planned a tonic question; I wonder why her death was certified as fever.', reason: 'Pre-approval draft repair: the fever certificate is released public evidence; the harmless-tonic claim exists only in private source acting instructions. The target, source, chapter and solution remain unchanged.' },
    ],
    originalClues: legacy[5].characters.map(c => ({ id: c.id, rounds: c.rounds })),
  };
  return finalize(master);
}

function finalize(story) {
  const covered = new Set();
  story.rounds.forEach((round, ri) => {
    const first = ri % 2 ? [coreIds[0], coreIds[2], coreIds[1]] : [...coreIds];
    round.readingGroups = [first, ...story.characters.slice(3).map(c => [c.id])];
    round.chain = round.readingGroups.flat();
    round.coverageRepeat = story.characters.some(c => covered.has(`${c.id}:${c.rounds[ri].readAloud.accuses}`));
    for (const c of story.characters) covered.add(`${c.id}:${c.rounds[ri].readAloud.accuses}`);
  });
  const { errors } = normalizeStory(story);
  if (errors.length) throw new Error(errors.join('\n'));
  return story;
}

function expand(master, count) {
  const story = structuredClone(master);
  story.fixedPlayerCount = count;
  story.edition = { ...story.edition, id: `ravenmoor-${count}-players`, playerCount: count };
  for (const c of source.characters.slice(3, count)) {
    const eligible = source.characters.slice(0, count).filter(target => target.id !== c.id);
    story.characters.push({
      id: c.id, name: c.name, role: c.role, relationship: c.role, tieIn: c.publicBlurb,
      publicBlurb: c.publicBlurb, optional: false, guest: '', guestNote: '', ghost: null,
      rounds: sourceRounds.map((sr, ri) => {
        const offset = source.characters.findIndex(entry => entry.id === c.id) - 3;
        const target = eligible[(ri + offset) % eligible.length];
        const targetIndex = source.characters.findIndex(entry => entry.id === target.id);
        const fact = facts[sr][targetIndex];
        if (!master.rounds.slice(0, ri + 1).some(round => round.narration.includes(spellNames(fact)))) {
          throw new Error(`Ravenmoor ${count} players, ${c.id}, round ${ri + 1}: supplemental evidence has not been released in the master.`);
        }
        const complication = corrections[ri]?.[targetIndex] || complications[sr][targetIndex];
        return { readAloud: clue(`${accounts[offset]} ${fact}`, complication, target.id) };
      }),
    });
  }
  return finalize(story);
}

if (process.argv.includes('--create-master')) {
  // Exclusive creation deliberately refuses to replace an established master.
  writeFileSync(masterPath, `${JSON.stringify(makeMaster(), null, 2)}\n`, { flag: 'wx' });
  console.log('Created the immutable Ravenmoor three-player master.');
} else {
  const masterFile = readFileSync(masterPath);
  if (createHash('sha256').update(masterFile).digest('hex') !== masterDigest) {
    throw new Error('The locked Ravenmoor master changed. Refusing to regenerate or overwrite any editions.');
  }
  const master = JSON.parse(masterFile);
  const { errors } = normalizeStory(master);
  if (errors.length) throw new Error(`The locked Ravenmoor master is invalid: ${errors.join(' ')}`);
  const editions = { 3: master, 12: expand(master, 12) };
  for (let count = 4; count < 12; count++) editions[count] = expand(master, count);
  const output = `// Generated from the locked Ravenmoor master; node tools/author-ravenmoor.mjs.\nexport default ${JSON.stringify(editions, null, 2)};\n`;
  if (process.argv.includes('--check')) {
    if (readFileSync(outputPath, 'utf8') !== output) {
      throw new Error('Generated Ravenmoor editions are out of date. Run node tools/author-ravenmoor.mjs before testing.');
    }
    console.log('Verified the locked master, released supplemental evidence and all ten reproducible Ravenmoor editions.');
  } else {
    writeFileSync(outputPath, output);
    console.log('Validated twelve-player endpoint, then generated Ravenmoor editions 4 through 11.');
  }
}
