export function selectLockdownDraft(catalog, count) {
  if (!Number.isInteger(count) || count < 3 || count > 12) {
    throw new Error('LOCKDOWN has authored editions for exactly 3 through 12 players.');
  }
  const source = catalog.editions.find(edition => edition.count === count);
  const master = catalog.editions.find(edition => edition.count === 3);
  if (!source || !master) throw new Error('The selected LOCKDOWN draft or its master is missing.');
  const core = new Set(master.characters.map(character => character.id));
  const edition = structuredClone(source);
  edition.status = 'author-review';
  edition.characters = [
    ...structuredClone(master.characters),
    ...edition.characters.filter(character => !core.has(character.id)),
  ];
  edition.victim = master.victim;
  edition.reveal = master.reveal;
  edition.rounds = master.rounds.map((round, ri) => {
    const readings = structuredClone(round.clues);
    const targets = new Map(readings.map(clue => [clue.reader, clue.target]));
    const order = [];
    let next = master.characters[0].id;
    while (!order.includes(next)) {
      if (!targets.has(next)) throw new Error('Incomplete master reading loop.');
      order.push(next);
      next = targets.get(next);
    }
    if (order.length !== core.size) throw new Error('The master readings do not include every base character.');
    const supplemental = structuredClone(source.rounds[ri].clues.filter(clue => !core.has(clue.reader)));
    return {
      title: round.title,
      narration: round.narration,
      sourceChapterChanged: source.rounds[ri].narration !== round.narration,
      clues: [...readings, ...supplemental],
      readingGroups: [order, ...supplemental.map(clue => [clue.reader])],
      sourceCoreChanges: source.rounds[ri].clues.filter(clue => core.has(clue.reader) &&
        JSON.stringify(clue) !== JSON.stringify(readings.find(base => base.reader === clue.reader))).length,
    };
  });
  return edition;
}

export function reviewLockdownDraft(edition) {
  const issues = [
    'The shared reveal remains an author TODO: murder method, Mason activities, notebook fate and ledger details.',
    'Source clues still need an author-approved first-person, two-part voice pass before freezing the master.',
    'Supplemental observations require author review; this preview does not approve invented draft evidence.',
  ];
  const seen = new Set();
  let previous = new Set();
  edition.rounds.forEach((round, ri) => {
    const pairs = new Set(round.clues.map(clue => `${clue.reader}>${clue.target}`));
    const supplemental = round.clues.filter(clue => !['derek', 'mason', 'travis'].includes(clue.reader));
    for (const clue of supplemental) {
      const pair = `${clue.reader}>${clue.target}`;
      if (seen.has(pair)) issues.push(`Round ${ri + 1}: supplemental pairing ${pair} repeats; repeat eligibility and meaningful new evidence need review.`);
    }
    for (const pair of pairs) {
      if (previous.has(pair)) issues.push(`Round ${ri + 1}: consecutive pairing ${pair} needs repair.`);
      seen.add(pair);
    }
    previous = pairs;
  });
  return issues;
}

export function buildLockdownStory(catalog, count) {
  const draft = selectLockdownDraft(catalog, count);
  const marker = 'Working shape (for the author to confirm or replace):';
  const ending = draft.reveal.split(marker)[1]?.trim();
  if (!ending) throw new Error('The supplied shared LOCKDOWN ending is missing.');
  const victimLines = draft.victim.split('\n');
  const covered = new Set();
  const rounds = draft.rounds.map((round, ri) => {
    let repeated = false;
    for (const clue of round.clues) {
      const pair = `${clue.reader}>${clue.target}`;
      if (covered.has(pair)) repeated = true;
      covered.add(pair);
    }
    return {
      title: `Round ${ri + 1}: ${round.title}`,
      narration: round.narration,
      events: round.narration.split('\n'),
      publicText: '',
      chain: round.readingGroups.flat(),
      readingGroups: round.readingGroups,
      coverageRepeat: repeated,
    };
  });
  return {
    schemaVersion: 2,
    title: 'LOCKDOWN',
    fixedPlayerCount: count,
    clueRouting: 'rotating',
    edition: { family: 'lockdown', id: `lockdown-${count}`, playerCount: count, revision: 1 },
    authorPlaytest: true,
    playtestNotice: 'Owner-approved unfinished playtest. The shared ending names the killer but does not establish a cause of death. Clue voice and supplemental repeat eligibility remain under author review.',
    setting: 'A prison during an evening lockdown.',
    intro: `${draft.victim}\n${draft.rounds[0].narration}`,
    hiddenThread: 'The hidden laundry ledger and the information Victor discovered.',
    coverageRepeatNote: 'The original three-player loops repeat after both directions are used. Supplemental pair repeats are retained from the supplied drafts by explicit owner approval for this unfinished playtest, not certified as rule-compliant.',
    specialMechanics: ['Read the original trio in its unchanged loop, then each supplemental reader. Everyone discusses and votes together.'],
    victim: { name: victimLines[0], description: victimLines.slice(1).join('\n') },
    rounds,
    characters: draft.characters.map(character => ({
      id: character.id,
      name: character.name,
      role: character.name.split(' ')[0],
      relationship: 'A member of the prison community.',
      tieIn: character.card,
      publicBlurb: '',
      rounds: draft.rounds.map(round => {
        const clue = round.clues.find(clue => clue.reader === character.id);
        if (!clue) throw new Error(`Missing LOCKDOWN reading for ${character.name}.`);
        return { readAloud: { accuses: clue.target, text: clue.text, observation: '', contradictingDetail: '' } };
      }),
    })),
    finale: { narration: 'All seven chapters have been read. Discuss the evidence together before the final accusations and vote.', votePrompt: 'Who killed Victor Ross?' },
    solution: { killerId: 'derek', explanation: ending, revealNarration: ending },
  };
}
