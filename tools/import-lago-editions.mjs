import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { chainReadOrder } from '../js/accusations.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.resolve(process.argv[2] || path.join(root, 'tools', 'lago-all-10-editions.txt'));
const outputPath = path.resolve(process.argv[3] || path.join(root, 'js', 'editions', 'lago-cabin.js'));
const source = await fs.readFile(sourcePath, 'utf8');
const markers = [...source.matchAll(/^EDITION:\s*(\d+)\s+PLAYERS\s*$/gm)];
if (markers.length !== 10) throw new Error(`Expected 10 edition sections; found ${markers.length}.`);

const people = [
  { id: 'charles-jolly-jr', name: 'Charles Jolly Jr.', aliases: ['Charles', 'Jolly'] },
  { id: 'john-armstrong', name: 'John Armstrong', aliases: ['Armstrong'] },
  { id: 'sheriff-clark', name: 'Sheriff John T. Clark', aliases: ['Clark', 'Sheriff'] },
  { id: 'john-jolly', name: 'John Jolly', aliases: ['John', 'Jolly'] },
  { id: 'silas-brenner', name: 'Silas Brenner', aliases: ['Silas', 'Brenner'] },
  { id: 'thomas-aubuchon', name: 'Thomas Aubuchon', aliases: ['Thomas', 'Aubuchon'] },
  { id: 'pierre-valois', name: 'Pierre Valois', aliases: ['Pierre', 'Valois'] },
  { id: 'father-brennan', name: 'Father Brennan', aliases: ['Brennan'] },
  { id: 'eli-marsh', name: 'Deputy Eli Marsh', aliases: ['Eli', 'Marsh'] },
  { id: 'henry-cobb', name: 'Henry Cobb', aliases: ['Henry', 'Cobb'] },
  { id: 'ada-whitfield', name: 'Ada Whitfield', aliases: ['Ada', 'Whitfield'] },
  { id: 'samuel-pryor', name: 'Dr. Samuel Pryor', aliases: ['Samuel', 'Pryor'] },
];
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
let structuralTargetLabels = 0;
const aliasId = (alias, cast) => {
  const matches = cast.filter(person =>
    [person.name, ...person.aliases].some(value => value.toLowerCase() === clean(alias).toLowerCase()));
  if (matches.length !== 1) throw new Error(`Could not uniquely match character label "${alias}".`);
  return matches[0].id;
};

function addTargetPlaceholder(text, target) {
  const aliases = [target.name, ...target.aliases].sort((a, b) => b.length - a.length);
  for (const alias of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matcher = new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'ig');
    for (const match of text.matchAll(matcher)) {
      if (target.id === 'john-jolly' && alias === 'John' &&
          /^\s+(?:Armstrong|T\.?\s*Clark|Clark)\b/i.test(text.slice(match.index + match[0].length))) continue;
      return text.slice(0, match.index) + `{${target.id}}` + text.slice(match.index + match[0].length);
    }
  }
  structuralTargetLabels++;
  return `{${target.id}}, ${text}`;
}

function splitClue(text) {
  const sentenceBreaks = [...text.matchAll(/[.!?]\s+(?=[A-Z“"'])/g)];
  for (const match of sentenceBreaks) {
    const end = match.index + 1;
    const observation = text.slice(0, end).trim();
    if (/\b(?:Jr|Dr|Mr|Mrs|St)\.$/i.test(observation.slice(-4))) continue;
    const detail = text.slice(end).trim();
    if (observation && detail) return { observation, contradictingDetail: detail };
  }
  for (const matcher of [/;\s+/, /\s+—\s+/, /,\s+but\s+/i]) {
    const match = matcher.exec(text);
    if (match) {
      const end = match.index + match[0].length;
      const observation = text.slice(0, match.index).trim();
      const contradictingDetail = text.slice(end).trim();
      if (observation && contradictingDetail) return { observation, contradictingDetail };
    }
  }
  return { observation: text, contradictingDetail: '' };
}

function splitHtmlEdition(index) {
  const start = markers[index].index;
  const htmlStart = source.indexOf('<!DOCTYPE html>', start);
  const htmlEnd = source.indexOf('</html>', htmlStart) + '</html>'.length;
  if (htmlStart < start || htmlEnd < '</html>'.length) {
    throw new Error(`Edition ${markers[index][1]} is missing its complete HTML document.`);
  }
  return source.slice(htmlStart, htmlEnd);
}

async function readEdition(page, html, count) {
  await page.setContent(html);
  return page.evaluate((playerCount) => {
    const nodesUntilHeading = heading => {
      const nodes = [];
      for (let node = heading.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling) nodes.push(node);
      return nodes;
    };
    const nextSibling = (nodes, headingText) => {
      const heading = nodes.find(node => node.tagName === 'H3' && node.textContent.trim().toLowerCase() === headingText.toLowerCase());
      return heading ? nodes[nodes.indexOf(heading) + 1] : null;
    };
    const heading = text => [...document.querySelectorAll('h2')].find(node => node.textContent.trim().toUpperCase() === text);
    const playersHeading = heading('THE PLAYERS');
    const victimHeading = heading('THE VICTIM');
    const revealHeading = heading('THE REVEAL');
    if (!playersHeading || !victimHeading || !revealHeading) throw new Error(`Edition ${playerCount} is missing a required section.`);
    const playersList = playersHeading.nextElementSibling;
    if (playersList?.tagName !== 'UL') throw new Error(`Edition ${playerCount} is missing its cast list.`);
    const characters = [...playersList.querySelectorAll(':scope > li')].map(item => {
      const name = item.querySelector('b')?.textContent.trim();
      const detail = name ? item.textContent.slice(name.length).replace(/^\s*[—–-]\s*/, '').trim() : '';
      if (!name || !detail) throw new Error(`Edition ${playerCount} contains an incomplete character entry.`);
      return { name, detail };
    });
    const victimParagraph = victimHeading.nextElementSibling;
    const victimName = victimParagraph?.querySelector('b')?.textContent.trim();
    if (!victimName) throw new Error(`Edition ${playerCount} is missing its victim details.`);
    const victimDescription = victimParagraph.textContent.slice(victimName.length).replace(/^\s*,?\s*/, '').trim();
    const subtitle = [...document.querySelectorAll('h1')][0]?.nextElementSibling?.innerText || '';
    const rounds = [...document.querySelectorAll('h2')]
      .filter(node => /^ROUND\s+\d+\s*:/i.test(node.textContent.trim()))
      .map(roundHeading => {
        const nodes = nodesUntilHeading(roundHeading);
        const reading = nodes.find(node => node.tagName === 'P' && /Reading order:/i.test(node.textContent));
        const evidence = nextSibling(nodes, 'New Evidence');
        const knowHeading = nodes.find(node => node.tagName === 'H3' && node.textContent.trim() === 'What Players Know');
        const know = knowHeading ? nodes[nodes.indexOf(knowHeading) + 1] : null;
        const suspicionHeading = nodes.find(node => node.tagName === 'H3' && node.textContent.trim() === 'Suspicion Board');
        const suspicion = suspicionHeading ? nodes[nodes.indexOf(suspicionHeading) + 1] : null;
        const endHeading = nodes.find(node => node.tagName === 'H3' && /^End of Round \d+$/i.test(node.textContent.trim()));
        const end = endHeading ? nodes[nodes.indexOf(endHeading) + 1] : null;
        const clueHeading = nodes.find(node => node.tagName === 'H3' && node.textContent.trim() === 'Clues');
        const missing = [
          !reading && 'reading order',
          !evidence && 'new evidence',
          !end && 'end-of-round text',
          !clueHeading && 'clue section',
        ].filter(Boolean);
        if (missing.length) throw new Error(`Round heading "${roundHeading.textContent}" is missing ${missing.join(', ')}. Section: ${nodes.map(node => `${node.tagName}: ${node.textContent.trim().slice(0, 80)}`).join(' | ')}. Global H3: ${[...document.querySelectorAll('h3')].map(node => node.textContent.trim()).join(' | ')}`);
        const clueNodes = [];
        for (let i = nodes.indexOf(clueHeading) + 1; i < nodes.length && nodes[i].tagName !== 'H3'; i++) {
          if (nodes[i].tagName === 'P' && nodes[i].querySelector('b')) clueNodes.push(nodes[i]);
        }
        const title = roundHeading.textContent.trim().replace(/^ROUND\s+\d+\s*:\s*/i, '');
        const orderLine = reading.innerText.match(/Reading order:\s*([^\n]+)/i)?.[1] || '';
        const readOrder = orderLine.split('(')[0].replace(/[.;\s]+$/, '').split(/\s*→\s*/).filter(Boolean);
        if (readOrder.length === playerCount + 1 && readOrder[0] === readOrder.at(-1)) readOrder.pop();
        const repeated = /Repeat round/i.test(reading.innerText);
        return {
          title,
          evidence: evidence.innerText.trim(),
          publicFacts: know ? [...know.querySelectorAll(':scope > li')].map(item => item.innerText.trim()) : [],
          suspicions: suspicion ? [...suspicion.querySelectorAll(':scope > li')].map(item => item.innerText.trim()) : [],
          end: end.innerText.trim(),
          readingOrder: readOrder,
          repeated,
          clues: clueNodes.map(node => {
            const label = node.querySelector('b').textContent.trim();
            const text = node.textContent.slice(label.length).trim().replace(/^["“]/, '').replace(/["”]$/, '').trim();
            const parts = /^(.+?)['’]s clue about (.+)$/i.exec(label);
            if (!parts || !text) throw new Error(`Could not parse clue "${label}".`);
            return { reader: parts[1], target: parts[2], text };
          }),
        };
      });
    const reveal = revealHeading.nextElementSibling;
    return {
      characters,
      victimName,
      victimDescription,
      subtitle: subtitle.trim(),
      rounds,
      revealParagraphs: [...reveal.querySelectorAll(':scope > p')].map(node => node.innerText.trim()),
    };
  }, count);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const parsed = [];
try {
  for (let index = 0; index < markers.length; index++) {
    const count = Number(markers[index][1]);
    if (count !== index + 3) throw new Error(`Expected editions in order from 3 to 12 players; found ${count} players.`);
    const edition = await readEdition(page, splitHtmlEdition(index), count);
    if (edition.characters.length !== count || edition.rounds.length !== 7) {
      throw new Error(`${count}-player edition has ${edition.characters.length} characters and ${edition.rounds.length} rounds.`);
    }
    const cast = people.slice(0, count);
    for (let i = 0; i < count; i++) {
      if (edition.characters[i].name !== cast[i].name) {
        throw new Error(`${count}-player edition does not preserve the nested cast at character ${i + 1}.`);
      }
    }
    const reviewIssues = [];
    const clueRounds = edition.rounds.map((round, ri) => {
      const targets = new Map();
      const readings = new Map();
      for (const clue of round.clues) {
        const readerId = aliasId(clue.reader, cast);
        const targetId = aliasId(clue.target, cast);
        if (readings.has(readerId)) throw new Error(`${count}-player Round ${ri + 1} repeats reader ${clue.reader}.`);
        const target = cast.find(person => person.id === targetId);
        const text = addTargetPlaceholder(clean(clue.text), target);
        const parts = splitClue(text);
        if (!parts.contradictingDetail) reviewIssues.push(`Round ${ri + 1}: ${clue.reader}'s supplied clue has no separate second part.`);
        if (readerId === targetId) throw new Error(`${count}-player Round ${ri + 1} contains a self-targeting clue.`);
        readings.set(readerId, { accuses: targetId, text, sourceText: clean(clue.text), ...parts });
        targets.set(readerId, targetId);
      }
      if (readings.size !== count || round.readingOrder.length !== count) {
        throw new Error(`${count}-player Round ${ri + 1} does not schedule every reader exactly once.`);
      }
      const order = round.readingOrder.map(alias => aliasId(alias, cast));
      if (new Set(order).size !== count || cast.some(person => !order.includes(person.id))) {
        throw new Error(`${count}-player Round ${ri + 1} reading order does not partition its cast.`);
      }
      for (let i = 0; i < order.length - 1; i++) {
        if (targets.get(order[i]) !== order[i + 1]) {
          throw new Error(`${count}-player Round ${ri + 1} reading order conflicts with ${order[i]}'s clue target.`);
        }
      }
      if (order.length > 1 && !order.includes(targets.get(order.at(-1)))) {
        throw new Error(`${count}-player Round ${ri + 1} reading chain ends outside its group.`);
      }
      const canonicalOrder = chainReadOrder(cast.map(person => person.id), Object.fromEntries(targets));
      return { readings, order: canonicalOrder.length ? canonicalOrder : order, sourceRepeat: round.repeated, source: round };
    });
    const covered = new Set();
    const allPairs = count * (count - 1);
    const rounds = clueRounds.map(({ readings, order, sourceRepeat, source }, ri) => {
      let repeated = false;
      for (const [reader, clue] of readings) {
        const pair = `${reader}\0${clue.accuses}`;
        if (covered.has(pair)) repeated = true;
      }
      if (repeated && covered.size !== allPairs) {
        reviewIssues.push(`Round ${ri + 1}: supplied pairings repeat before the full reader-target matrix is covered.`);
      }
      if (sourceRepeat && !repeated) {
        throw new Error(`${count}-player Round ${ri + 1} is marked as a repeat but its clue pairings are new.`);
      }
      for (const [reader, clue] of readings) covered.add(`${reader}\0${clue.accuses}`);
      return {
        title: `Round ${ri + 1} - ${source.title}`,
        narration: `${source.evidence}\n\n${source.end}`,
        publicText: source.publicFacts.length ? `What players know:\n${source.publicFacts.map(fact => `- ${fact}`).join('\n')}` : '',
        hostNotes: source.suspicions.length ? `Suspicion board (host reference):\n${source.suspicions.map(item => `- ${item}`).join('\n')}` : '',
        events: [...source.evidence.split(/\n+/).map(clean).filter(Boolean), source.end].filter(Boolean),
        chain: order,
        readingGroups: [order],
        coverageRepeat: repeated,
        readings: Object.fromEntries(readings),
      };
    });
    const revealParagraphs = edition.revealParagraphs;
    if (revealParagraphs.length < 2) throw new Error(`${count}-player edition has an incomplete reveal.`);
    parsed.push({
      count, cast, edition, rounds, reviewIssues,
      solution: {
        killerId: 'charles-jolly-jr',
        explanation: revealParagraphs[0],
        revealNarration: revealParagraphs.slice(1).join('\n\n'),
      },
    });
  }
} finally {
  await browser.close();
}

const master = parsed[0];
for (const edition of parsed.slice(1)) {
  if (JSON.stringify(edition.solution) !== JSON.stringify(master.solution)) {
    throw new Error(`${edition.count}-player edition does not share the master reveal.`);
  }
  if (edition.edition.victimName !== master.edition.victimName ||
      edition.edition.victimDescription !== master.edition.victimDescription) {
    throw new Error(`${edition.count}-player edition changes the shared victim.`);
  }
  edition.rounds.forEach((round, i) => {
    if (round.title !== master.rounds[i].title || round.narration !== master.rounds[i].narration) {
      edition.reviewIssues.push(`Round ${i + 1}: supplied chapter differs from the three-player master.`);
    }
  });
  for (let i = 0; i < master.cast.length; i++) {
    const id = master.cast[i].id;
    for (let ri = 0; ri < master.rounds.length; ri++) {
      if (JSON.stringify(edition.rounds[ri].readings[id]) !== JSON.stringify(master.rounds[ri].readings[id])) {
        edition.reviewIssues.push(`Round ${ri + 1}: ${id}'s supplied clue differs from the three-player master.`);
      }
    }
  }
}

const repairs = {
  'john-jolly': { target: 'sheriff-clark', text: 'I heard Clark will take Leon’s testimony under oath. A child’s account needs careful questions; I won’t mistake the town’s certainty for proof.' },
  'silas-brenner': { target: 'thomas-aubuchon', text: 'I heard Thomas found the cabin after the fire. His discovery matters, but I won’t confuse what he found Monday with what happened Saturday.' },
  'thomas-aubuchon': { target: 'silas-brenner', text: 'I heard Silas describe the cousins leaving his bar near eight. His account gives us a time, but I still need it weighed against Leon’s testimony.' },
};
for (const entry of parsed) {
  entry.repairs = [];
  const coreIds = new Set(master.cast.map(person => person.id));
  entry.rounds = entry.rounds.map((round, ri) => {
    const readings = new Map(Object.entries(round.readings));
    for (const id of coreIds) {
      const original = readings.get(id);
      const replacement = master.rounds[ri].readings[id];
      if (JSON.stringify(original) !== JSON.stringify(replacement)) {
        entry.repairs.push({ round: ri + 1, reader: id, reason: 'Section 33: preserve the master clue and target.', original, replacement });
      }
      readings.set(id, structuredClone(replacement));
    }
    if (entry.count === 6 && ri === 4) {
      for (const [reader, repair] of Object.entries(repairs)) {
        const original = readings.get(reader);
        const target = entry.cast.find(person => person.id === repair.target);
        const text = addTargetPlaceholder(repair.text, target);
        const replacement = { accuses: repair.target, text, sourceText: original.sourceText, ...splitClue(text) };
        readings.set(reader, replacement);
        entry.repairs.push({ round: ri + 1, reader, reason: 'Section 6: use the remaining target before repeating; retain only existing chapter facts.', original, replacement });
      }
    }
    const chapter = master.rounds[ri];
    if (round.narration !== chapter.narration || round.title !== chapter.title) {
      entry.repairs.push({ round: ri + 1, reason: 'Section 33: restore the shared master chapter.', original: { title: round.title, narration: round.narration }, replacement: { title: chapter.title, narration: chapter.narration } });
    }
    const groups = [chapter.chain, ...entry.cast.slice(3).map(person => [person.id])];
    if (JSON.stringify(round.readingGroups) !== JSON.stringify(groups)) {
      entry.repairs.push({ round: ri + 1, reason: 'Sections 7 and 33: preserve the master loop and schedule every supplemental reader once.', original: round.readingGroups, replacement: groups });
    }
    return {
      ...chapter,
      readingGroups: groups,
      chain: groups.flat(),
      readings: Object.fromEntries(readings),
    };
  });
  const seen = new Set();
  for (const round of entry.rounds) {
    round.coverageRepeat = Object.entries(round.readings).some(([reader, clue]) => seen.has(`${reader}\0${clue.accuses}`));
    for (const [reader, clue] of Object.entries(round.readings)) seen.add(`${reader}\0${clue.accuses}`);
  }
}

const profile = detail => {
  const clauses = detail.split(/;\s*|\.\s+/).filter(Boolean);
  const first = clauses[0] || detail;
  const pieces = first.split(/,\s*/).filter(Boolean);
  const ageIndex = pieces.findIndex(piece => /^~?\d{1,2}$/.test(piece));
  if (ageIndex >= 0) pieces.splice(ageIndex, 1);
  const role = pieces.shift() || first;
  const relationship = pieces.join(', ') || clauses[1] || first;
  const tieIn = clauses.slice(1).join('. ').trim() || detail;
  return { role, relationship, tieIn, publicBlurb: detail };
};
const base = {
  schemaVersion: 2,
  discloseKiller: false,
  clueRouting: 'rotating',
  title: 'The Lago Cabin',
  atmosphere: 'victorian',
  setting: 'Washington County, Missouri — November 1870.',
  intro: 'A neighbor finds David Lapine’s cabin burned to the ground north of Potosi. Five people are dead, including David, his partner and two small children. The sheriff must sort a town’s testimony from rumor before the final vote.',
  hiddenThread: 'Charles Jolly Jr. killed David Lapine; John Armstrong helped conceal the crime. Leon Jolly’s testimony, the cousins’ movements and the burning cabin connect the seven chapters.',
  masterPreserving: true,
  coverageRepeatNote: 'Seven historical chapters require closing-evidence rounds. The original trio repeats only after all six directed master pairings are used. Supplemental readers use every other character as a target before repeating; repeated pairs receive new supplied evidence with at least one intervening round.',
  specialMechanics: ['Follow the seven-chapter historical timeline from the burned cabin through the investigation, manhunt and trial. Compare each witness account with the public record before making the final accusation.'],
  victim: {
    name: master.edition.victimName,
    description: master.edition.victimDescription,
  },
  rounds: master.rounds.map(({ readings, ...round }) => round),
  finale: {
    narration: master.rounds.at(-1).narration.split('\n\n').at(-1),
    votePrompt: 'Cast your final votes: who killed David Lapine?',
  },
  solution: master.solution,
};
const editions = Object.fromEntries(parsed.map(({ count, cast, edition, rounds, solution, reviewIssues, repairs }) => {
  const descriptions = new Map(edition.characters.map(character => [character.name, character.detail]));
  const characters = cast.map(person => {
    return {
      id: person.id,
      name: person.name,
      optional: false,
      ...profile(descriptions.get(person.name)),
      rounds: rounds.map(round => ({ readAloud: round.readings[person.id] })),
    };
  });
  return [count, {
    ...base,
    fixedPlayerCount: count,
    title: `The Lago Cabin (${count} players)`,
    edition: { family: 'lago-cabin', id: `lago-cabin-${count}`, playerCount: count, revision: 1 },
    authorReviewIssues: reviewIssues,
    repairs,
    rounds: rounds.map(({ readings, ...round }) => round),
    characters,
    solution,
  }];
}));

const moduleText = `// Generated from tools/lago-all-10-editions.txt by tools/import-lago-editions.mjs.\nexport default ${JSON.stringify(editions, null, 2)};\n`;
await fs.writeFile(outputPath, moduleText);
console.log(`Imported ${Object.keys(editions).length} Lago Cabin editions to ${outputPath}; added explicit target labels to ${structuralTargetLabels} clues whose supplied text did not name its assigned character.`);
