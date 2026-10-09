import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const plain = html => html.replace(/\r?\n\s*/g, ' ').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '\u2014').split('\n').map(line => line.trim()).join('\n').trim();
const key = name => name.toLowerCase().replace(/[^a-z]/g, '');

export function importLockdownDraft(source) {
  const markers = [...source.matchAll(/EDITION: (\d+) PLAYERS/g)];
  if (markers.length !== 10) throw new Error('Expected all ten LOCKDOWN editions.');
  const drafts = markers.map((marker, index) => {
    const count = Number(marker[1]);
    const section = source.slice(marker.index, markers[index + 1]?.index ?? source.length);
    const players = section.match(/<h2>Players<\/h2>([\s\S]*?)(?=<h2>Victim<\/h2>|<hr>)/)?.[1];
    if (!players) throw new Error(`${count} players: missing cast.`);
    const characters = [...players.matchAll(/<p><b>([^<]+)<\/b><br>\s*([\s\S]*?)<\/p>/g)].map(match => {
      const name = plain(match[1]);
      const shortName = name.split(' ').find(word => !['Officer', 'Inmate', 'Chaplain', 'Nurse', 'Warden', 'Deputy', 'Maintenance'].includes(word));
      return { id: key(shortName), name, card: plain(match[2]) };
    });
    if (characters.length !== count) throw new Error(`${count} players: incorrect cast size.`);
    const victim = plain(section.match(/<h[23]>Victim<\/h[23]>\s*(<p>[\s\S]*?<\/p>)/)?.[1] || '');
    const roundMarkers = [...section.matchAll(/<h2[^>]*>ROUND (\d+): ([^<]+)<\/h2>/g)];
    const rounds = roundMarkers.map((round, ri) => {
      const chunk = section.slice(round.index, roundMarkers[ri + 1]?.index ?? section.length);
      const narration = plain(chunk.match(/<h3[^>]*>New Evidence<\/h3>\s*<div[^>]*>([\s\S]*?)<\/div>/)?.[1] || '');
      const clues = [...chunk.matchAll(/<p><b>([^<']+)'s clue about ([^<]+)<\/b><br>"([\s\S]*?)"<\/p>/g)]
        .map(match => ({ reader: key(match[1]), target: key(match[2]), text: plain(match[3]) }));
      if (!narration || clues.length !== count || new Set(clues.map(c => c.reader)).size !== count) {
        throw new Error(`${count} players, round ${ri + 1}: incomplete evidence or readings.`);
      }
      for (const clue of clues) {
        if (!characters.some(c => c.id === clue.reader) || !characters.some(c => c.id === clue.target) || clue.reader === clue.target) {
          throw new Error(`${count} players, round ${ri + 1}: invalid clue assignment.`);
        }
      }
      return { title: plain(round[2]), narration, clues };
    });
    if (rounds.length !== 7) throw new Error(`${count} players: expected seven rounds.`);
    const reveal = section.match(/<h2[^>]*>THE REVEAL[^<]*<\/h2>\s*<div[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
    return { count, characters, victim, rounds, reveal: plain(reveal) };
  });
  if (drafts.map(d => d.count).join(',') !== '3,4,5,6,7,8,9,10,11,12') throw new Error('Edition counts must be 3 through 12.');
  const master = drafts[0];
  if (!master.reveal.includes('Author calls needed:')) throw new Error('Expected the supplied unfinished author-review reveal.');
  for (const draft of drafts) {
    if (draft.victim !== master.victim) throw new Error(`${draft.count} players: victim differs from master.`);
    if (draft.characters.map(c => c.id).join(',') !== drafts[9].characters.slice(0, draft.count).map(c => c.id).join(',')) {
      throw new Error(`${draft.count} players: cast is not nested.`);
    }
  }
  return {
    title: 'LOCKDOWN',
    status: 'author-review',
    sourceHash: createHash('sha256').update(source).digest('hex'),
    sourceNote: 'Supplied unfinished drafts. Not eligible for a public playable release.',
    editions: drafts,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Provide the read-only attachment path.');
  const source = readFileSync(process.argv[2], 'utf8');
  const catalog = importLockdownDraft(source);
  writeFileSync(new URL('./lockdown-drafts.json', import.meta.url), JSON.stringify(catalog, null, 2) + '\n');
  writeFileSync(new URL('../js/editions/lockdown.js', import.meta.url),
    '// Imported author drafts; playable editions restore the immutable three-player master.\nexport default ' + JSON.stringify(catalog, null, 2) + ';\n');
  console.log('Imported ten author-review drafts; seven rounds per edition and nested casts verified.');
}
