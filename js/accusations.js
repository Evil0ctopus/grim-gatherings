// Evidence is written about the target, not as a particular speaker's eyewitness claim.
// This lets a smaller cast keep the same evidence when optional roles are omitted.
export function assignAccusationCircles(story, evidence) {
  const cast = story.characters;
  if (cast.length < 2) throw new Error('An accusation circle needs at least two characters.');
  const steps = [];
  for (let step = 1; step < cast.length; step++) {
    let a = step, b = cast.length;
    while (b) { const remainder = a % b; a = b; b = remainder; }
    // Circles need coprime steps; rotating readers also use reciprocal pairs for coverage.
    if (story.clueRouting === 'rotating' || a === 1) steps.push(step);
  }
  story.rounds.forEach((_, ri) => {
    const step = steps[ri % steps.length];
    cast.forEach((speaker, i) => {
      const target = cast[(i + step) % cast.length];
      const text = evidence[target.id]?.[ri];
      if (!text?.trim()) throw new Error(`Missing read-aloud evidence against ${target.name} in round ${ri + 1}.`);
      speaker.rounds[ri].readAloud = { accuses: target.id, text };
    });
  });
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
  story.rounds.forEach((_, ri) => {
    const incoming = new Set(), texts = new Set(), edges = new Map();
    for (const c of story.characters) {
      const clue = c.rounds[ri]?.readAloud;
      const label = `${c.name || c.id}, round ${ri + 1}`;
      if (!clue?.text) errors.push(`${label}: add a "readAloud" clue with "accuses" and "text". Private clues alone do not replace public evidence.`);
      else if (texts.has(clue.text)) errors.push(`${label}: read-aloud text must be unique.`);
      else texts.add(clue.text);
      if (!ids.has(clue?.accuses)) errors.push(`${label}: "readAloud.accuses" must name a character id in this cast.`);
      else if (clue.accuses === c.id) errors.push(`${label}: a character cannot accuse themselves.`);
      else {
        if (incoming.has(clue.accuses)) errors.push(`${label}: ${clue.accuses} is accused twice; every character must receive exactly one accusation.`);
        incoming.add(clue.accuses);
        edges.set(c.id, clue.accuses);
      }
    }
    if (incoming.size !== ids.size) errors.push(`Round ${ri + 1}: every character must be accused exactly once.`);
    if (story.clueRouting !== 'rotating' && edges.size === ids.size && incoming.size === ids.size) {
      const visited = new Set();
      let next = story.characters[0].id;
      while (!visited.has(next)) { visited.add(next); next = edges.get(next); }
      if (visited.size !== ids.size) errors.push(`Round ${ri + 1}: accusations must form one complete circle, not separate groups.`);
    }
  });
  if (story.clueRouting === 'rotating') {
    for (const character of story.characters) {
      const targets = character.rounds.map(round => round.readAloud?.accuses);
      if (targets.some((id, index) => index > 0 && id === targets[index - 1])) {
        errors.push(`${character.name}: rotating readers must change targets every round.`);
      }
      const required = Math.min(story.rounds.length, ids.size - 1);
      if (new Set(targets.slice(0, required)).size !== required) {
        errors.push(`${character.name}: rotating readers must cover different other characters before repeating.`);
      }
    }
  }
  return errors;
}
