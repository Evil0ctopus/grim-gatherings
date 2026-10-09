// Evidence is attached to the target, not to a speaker's private eyewitness claim.
export function assignAccusationCircles(story, evidence) {
  const cast = story.characters;
  if (cast.length < 2) throw new Error('An accusation circle needs at least two characters.');
  const schedule = coverageSchedule(cast);
  story.rounds.forEach((_, ri) => {
    const { order, targets } = schedule[ri % schedule.length];
    order.forEach(speakerId => {
      const speaker = cast.find(character => character.id === speakerId);
      const target = cast.find(character => character.id === targets[speakerId]);
      const text = evidence[target.id]?.[ri];
      if (!text?.trim()) throw new Error(`Missing read-aloud evidence against ${target.name} in round ${ri + 1}.`);
      speaker.rounds[ri].readAloud = { accuses: target.id, text };
    });
  });
  syncAccusationSchedules(story);
}

// Reader order for one round: the character talked about reads next. When a loop closes
// before everyone has read, the next unread player in card order starts the next loop.
export function chainReadOrder(ids, targets) {
  const incoming = new Set();
  for (const id of ids) {
    const target = targets[id];
    if (!ids.includes(target) || target === id || incoming.has(target)) return [];
    incoming.add(target);
  }
  const order = [];
  const seen = new Set();
  for (const start of ids) {
    let current = start;
    while (!seen.has(current)) {
      order.push(current);
      seen.add(current);
      current = targets[current];
    }
  }
  return order;
}

export function chainLoops(ids, targets) {
  const loops = [];
  const seen = new Set();
  for (const start of chainReadOrder(ids, targets)) {
    if (seen.has(start)) continue;
    const loop = [];
    for (let current = start; !seen.has(current); current = targets[current]) {
      loop.push(current);
      seen.add(current);
    }
    loops.push(loop);
  }
  return loops;
}

// Stories use author-selected pairs without repeats, except flagged rounds after all pairs are used.
// This generator still supplies full, unique directed coverage before scheduling repeats.
export function coverageSchedule(characters) {
  const ids = characters.map(character => character.id);
  const count = ids.length;
  if (count < 2) throw new Error('A complete clue-coverage schedule needs at least two characters.');
  let permutations;
  if (count === 4) {
    // No three four-player single chains cover all pairs; the last round splits into two pairs.
    permutations = [[1, 2, 3, 0], [3, 0, 1, 2], [2, 3, 0, 1]];
  } else if (count === 6) {
    // Four full six-player chains are the maximum; the last round splits into three pairs.
    permutations = [
      [2, 4, 1, 5, 3, 0], [3, 5, 0, 4, 1, 2], [4, 3, 5, 0, 2, 1], [5, 2, 4, 1, 0, 3], [1, 0, 3, 2, 5, 4],
    ];
  } else if (count % 2 === 0 && count > 10) {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const shifts = Array.from({ length: count - 1 }, (_, i) => i + 1)
      .sort((a, b) => (gcd(a, count) === 1 ? 0 : 1) - (gcd(b, count) === 1 ? 0 : 1) || a - b);
    permutations = shifts.map(shift => ids.map((_, i) => (i + shift) % count));
  }
  const rounds = permutations
    ? permutations.map(permutation => Object.fromEntries(ids.map((id, i) => [id, ids[permutation[i]]])))
    : singleChainCycles(ids).map(cycle => Object.fromEntries(cycle.map((id, i) => [id, cycle[(i + 1) % cycle.length]])));
  return rounds.map(targets => ({ order: chainReadOrder(ids, targets), targets }));
}

export function coverageChains(characters) {
  return coverageSchedule(characters).map(round => round.order);
}

function singleChainCycles(ids) {
  const count = ids.length;
  if (count === 2) return [[ids[0], ids[1]]];
  if (count === 8 || count === 10) {
    const templates = {
      8: [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 2, 1, 3, 5, 4, 7, 6],
        [0, 3, 1, 4, 6, 2, 7, 5],
        [0, 4, 1, 5, 7, 2, 6, 3],
        [0, 5, 3, 6, 1, 7, 4, 2],
        [0, 6, 5, 2, 4, 3, 7, 1],
        [0, 7, 3, 2, 5, 1, 6, 4],
      ],
      10: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 2, 1, 3, 5, 4, 6, 9, 8, 7],
        [0, 3, 1, 4, 2, 5, 7, 9, 6, 8],
        [0, 4, 1, 5, 2, 8, 3, 9, 7, 6],
        [0, 5, 1, 7, 2, 9, 3, 8, 6, 4],
        [0, 6, 1, 8, 2, 7, 4, 9, 5, 3],
        [0, 7, 3, 6, 2, 4, 8, 5, 9, 1],
        [0, 8, 4, 3, 7, 1, 9, 2, 6, 5],
        [0, 9, 4, 7, 5, 8, 1, 6, 3, 2],
      ],
    };
    return templates[count].map(cycle => cycle.map(index => ids[index]));
  }
  const half = (count - 1) / 2;
  const modulus = count - 1;
  const rotateToFirst = cycle => {
    const index = cycle.indexOf(ids[0]);
    return [...cycle.slice(index), ...cycle.slice(0, index)];
  };
  const cycles = [];

  for (let offset = 0; offset < half; offset++) {
    const cycle = [ids[count - 1], ids[offset]];
    for (let distance = 1; distance < half; distance++) {
      cycle.push(ids[((offset - distance) % modulus + modulus) % modulus]);
      cycle.push(ids[(offset + distance) % modulus]);
    }
    cycle.push(ids[((offset - half) % modulus + modulus) % modulus]);
    const forward = rotateToFirst(cycle);
    const reverse = rotateToFirst([...cycle].reverse());
    cycles.push(forward, reverse);
  }
  return cycles;
}

export function syncAccusationSchedules(story) {
  const covered = new Set();
  story.rounds.forEach((round, roundIndex) => {
    round.chain = accusationChain(story, roundIndex);
    let repeated = false;
    for (const character of story.characters) {
      const target = character.rounds?.[roundIndex]?.readAloud?.accuses;
      if (!target || target === character.id) continue;
      const pair = `${character.id}\0${target}`;
      if (covered.has(pair)) repeated = true;
      covered.add(pair);
    }
    round.coverageRepeat = repeated;
  });
  return story;
}

export function accusationChain(story, roundIndex) {
  const cast = story.characters || [];
  if (!cast.length) return [];
  const targets = Object.fromEntries(cast.map(character => [
    character.id,
    character.rounds?.[roundIndex]?.readAloud?.accuses,
  ]));
  if (story.authorPlaytest && story.edition?.family === 'lockdown') {
    const groups = story.rounds[roundIndex]?.readingGroups;
    if (!Array.isArray(groups)) return [];
    const order = groups.flat();
    if (order.length !== cast.length || new Set(order).size !== cast.length ||
        order.some(id => !cast.some(character => character.id === id)) ||
        cast.some(character => !cast.some(target => target.id === targets[character.id]) || targets[character.id] === character.id)) return [];
    for (const group of groups) {
      if (!group.length) return [];
      if (group.length > 1 && group.some((id, i) => targets[id] !== group[(i + 1) % group.length])) return [];
    }
    return order;
  }
  return chainReadOrder(cast.map(character => character.id), targets);
}

export function accusationEvidence(story) {
  const evidence = {};
  for (const speaker of story.characters) {
    speaker.rounds?.forEach((round, ri) => {
      const clue = round.readAloud;
      if (!clue?.accuses || !clue.text?.trim()) throw new Error(`Add a read-aloud accusation for ${speaker.name}, round ${ri + 1}, before changing the cast.`);
      if (!evidence[clue.accuses]) evidence[clue.accuses] = [];
      if (evidence[clue.accuses][ri]) throw new Error(`Two characters accuse ${clue.accuses} in round ${ri + 1}. Fix the circle before changing the cast.`);
      evidence[clue.accuses][ri] = clue.text;
    });
  }
  return evidence;
}

export function validateAccusationCircles(story) {
  const errors = [];
  const ids = new Set(story.characters.map(c => c.id));
  const coverage = new Set();
  const allPairs = ids.size * (ids.size - 1);
  let coverageComplete = false;
  const repeatNote = String(story.coverageRepeatNote || '').trim();
  const playtest = story.authorPlaytest === true && story.edition?.family === 'lockdown';
  if (story.rounds.length < 4) {
    errors.push('A story needs at least 4 rounds.');
  }
  story.rounds.forEach((_, ri) => {
    const incoming = new Set(), texts = new Set(), edges = new Map();
    for (const c of story.characters) {
      const clue = c.rounds[ri]?.readAloud;
      const label = `${c.name || c.id}, round ${ri + 1}`;
      if (!clue?.text) errors.push(`${label}: add a "readAloud" clue with "accuses" and "text". Private clues alone do not replace public evidence.`);
      else if (texts.has(clue.text) && !playtest) errors.push(`${label}: read-aloud text must be unique.`);
      else texts.add(clue.text);
      if (!ids.has(clue?.accuses)) errors.push(`${label}: "readAloud.accuses" must name a character id in this cast.`);
      else if (clue.accuses === c.id) errors.push(`${label}: a character cannot accuse themselves.`);
      else {
        const references = [...String(clue.text || '').matchAll(/\{([A-Za-z0-9_-]+)\}/g)].map(match => match[1]);
        if (!playtest && (!references.includes(clue.accuses) || references.some(id => id !== clue.accuses))) {
          errors.push(`${label}: the clue must be about its assigned target and cannot be about its reader.`);
        }
        if (!playtest && incoming.has(clue.accuses)) errors.push(`${label}: ${clue.accuses} is accused twice; every character must receive exactly one accusation.`);
        incoming.add(clue.accuses);
        edges.set(c.id, clue.accuses);
      }
    }
    if (!playtest && incoming.size !== ids.size) errors.push(`Round ${ri + 1}: every character must be accused exactly once.`);
    if (edges.size === ids.size && (playtest || incoming.size === ids.size)) {
      const chain = accusationChain(story, ri);
      if (chain.length !== ids.size) errors.push(`Round ${ri + 1}: every player must read exactly one clue in the target chain.`);
      if (Array.isArray(story.rounds[ri].chain) && story.rounds[ri].chain.join('\0') !== chain.join('\0')) {
        errors.push(`Round ${ri + 1}: the precomputed chain does not match its clue targets.`);
      }
    }

    let repeated = false;
    for (const character of story.characters) {
      const target = character.rounds?.[ri]?.readAloud?.accuses;
      if (!ids.has(target) || target === character.id) continue;
      const pair = `${character.id}\0${target}`;
      if (coverage.has(pair)) repeated = true;
    }
    if (repeated && !coverageComplete && !playtest) {
      errors.push(`Round ${ri + 1}: a reader-target pair repeats before the coverage matrix is complete.`);
    }
    if (repeated && story.rounds[ri].coverageRepeat !== true) {
      errors.push(`Round ${ri + 1}: repeated reader-target pairs must be explicitly flagged with "coverageRepeat": true.`);
    }
    if (repeated && !repeatNote) {
      errors.push(`Round ${ri + 1}: a reader repeats a target, so the submitter must explain why this story requires it in "coverageRepeatNote".`);
    }
    if (!repeated && story.rounds[ri].coverageRepeat === true) {
      errors.push(`Round ${ri + 1}: "coverageRepeat" is set but this round contains no repeated reader-target pair.`);
    }
    for (const character of story.characters) {
      const target = character.rounds?.[ri]?.readAloud?.accuses;
      if (ids.has(target) && target !== character.id) coverage.add(`${character.id}\0${target}`);
    }
    if (coverage.size === allPairs) coverageComplete = true;
    if (ri > 0) {
      for (const character of story.characters) {
        const before = character.rounds?.[ri - 1]?.readAloud?.accuses;
        const current = character.rounds?.[ri]?.readAloud?.accuses;
        if (before === current) errors.push(`${character.name}: change clue targets from the previous round.`);
      }
    }
  });
  return errors;
}
