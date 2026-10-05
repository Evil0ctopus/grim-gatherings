// Story schema helpers: parsing guests, validation/normalisation, placeholder filling, per-player views.
import { storyTheme } from './atmosphere.js?v=volume-58-v1';
import { voteSummary } from './voting.js?v=vote-panel-v1';
import { validateAccusationCircles } from './accusations.js?v=rotating-clues-v1';

export function parseGuests(text) {
  return String(text || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      const i = l.search(/[,:\-–—]/);
      if (i === -1) return { name: l, desc: '' };
      return { name: l.slice(0, i).trim(), desc: l.slice(i + 1).trim() };
    })
    .filter(g => g.name);
}

const asStr = v => (v == null ? '' : typeof v === 'string' ? v : String(v));
const asLines = v => (Array.isArray(v) ? v.map(asStr).map(s => s.trim()).filter(Boolean) : asStr(v).trim() ? [asStr(v).trim()] : []);

/**
 * Validate + normalise a story object (possibly written by hand / another AI).
 * Returns { story, errors, warnings }. `story` is null when there are blocking errors.
 */
export function normalizeStory(input, guests = []) {
  const errors = [];
  const warnings = [];
  let obj = input;
  if (typeof obj === 'string') {
    const txt = obj.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    try { obj = JSON.parse(txt); } catch (e) {
      return { story: null, errors: [`That isn't valid JSON: ${e.message}. Tip: make sure it starts with { and ends with }, and that there are no trailing commas.`], warnings };
    }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { story: null, errors: ['The story must be a JSON object ({ ... }).'], warnings };

  const s = {
    schemaVersion: 2,
    discloseKiller: obj.discloseKiller === true,
    title: asStr(obj.title).trim(),
    atmosphere: storyTheme(obj),
    setting: asStr(obj.setting).trim(),
    intro: asStr(obj.intro).trim(),
    victim: { name: asStr(obj.victim?.name ?? obj.victim).trim(), description: asStr(obj.victim?.description).trim() },
    rounds: [],
    characters: [],
    finale: { narration: asStr(obj.finale?.narration).trim(), votePrompt: asStr(obj.finale?.votePrompt).trim() },
    solution: { killerId: '', explanation: '', revealNarration: '' },
  };
  if (obj.clueRouting !== undefined) {
    if (!['circle', 'rotating'].includes(obj.clueRouting)) errors.push('"clueRouting" must be "circle" or "rotating".');
    else s.clueRouting = obj.clueRouting;
  }
  if (obj.provenance) {
    const p = obj.provenance;
    if (!['user', 'community'].includes(p.kind) || typeof p.author !== 'string' || p.author.length > 80 ||
        !Number.isInteger(p.revision) || p.revision < 1) {
      errors.push('User-created stories need a valid author credit and positive revision.');
    } else {
      s.provenance = { kind: p.kind, author: p.author, revision: p.revision };
      if (typeof p.submissionId === 'string') s.provenance.submissionId = p.submissionId;
    }
  }
  if (obj.edition) {
    const edition = obj.edition;
    if (typeof edition.family !== 'string' || typeof edition.id !== 'string' ||
        !Number.isInteger(edition.playerCount) || edition.playerCount !== obj.characters?.length ||
        !Number.isInteger(edition.revision) || edition.revision < 1) {
      errors.push('The selected edition must have an identity, revision and exact player count matching its cast.');
    } else {
      s.edition = { family: edition.family, id: edition.id, playerCount: edition.playerCount, revision: edition.revision };
      if (obj.characters.some(c => c?.optional)) errors.push('Every character in a fixed player-count edition must be required.');
    }
  }
  if (!s.title) errors.push('"title" is missing — give the mystery a name.');
  if (!s.victim.name) warnings.push('"victim.name" is missing — players won\'t know who died.');

  if (!Array.isArray(obj.rounds)) errors.push('"rounds" must be a list with 5 or 6 rounds.');
  else obj.rounds.forEach((r, i) => {
    const rr = { title: asStr(r?.title).trim() || `Round ${i + 1}`, narration: asStr(r?.narration).trim(), publicText: asStr(r?.publicText).trim(), hostNotes: asStr(r?.hostNotes).trim() };
    if (!rr.narration) errors.push(`rounds[${i}] needs spoken host narration. Put all story discoveries in narration or read-aloud clues.`);
    s.rounds.push(rr);
  });
  if (Array.isArray(obj.rounds) && (obj.rounds.length < 5 || obj.rounds.length > 6)) errors.push('Every mystery must have 5 or 6 rounds. Expand the narration and character evidence together before playing.');

  if (!Array.isArray(obj.characters) || obj.characters.length < 2) errors.push('"characters" must be a list with at least 2 characters.');
  else {
    const seen = new Set();
    obj.characters.forEach((c, i) => {
      if (!c || typeof c !== 'object') { errors.push(`characters[${i}] must be an object.`); return; }
      let id = asStr(c.id).trim().replace(/[^A-Za-z0-9_-]/g, '') || `c${i + 1}`;
      if (seen.has(id)) { warnings.push(`characters[${i}].id "${id}" is duplicated — renamed to "${id}_${i + 1}".`); id = `${id}_${i + 1}`; }
      seen.add(id);
      const name = asStr(c.name).trim();
      if (!name) errors.push(`characters[${i}].name is missing.`);
      const rounds = Array.isArray(c.rounds) ? c.rounds : [];
      if (rounds.length > s.rounds.length && s.rounds.length) warnings.push(`characters[${i}] (${name || id}) has more round entries than the story has rounds; extras are ignored.`);
      s.characters.push({
        id, name,
        optional: c.optional === true,
        guest: asStr(c.guest).trim(),
        guestNote: asStr(c.guestNote).trim(),
        role: asStr(c.role).trim(),
        publicBlurb: asStr(c.publicBlurb).trim(),
        rounds: s.rounds.map((_, ri) => ({
          readAloud: {
            accuses: asStr(rounds[ri]?.readAloud?.accuses).trim(),
            text: asStr(rounds[ri]?.readAloud?.text).trim(),
          },
        })),
      });
      if (asStr(c.backstory).trim() || asLines(c.secrets).length || asStr(c.motive).trim() || rounds.some(r => asLines(r?.clues).length)) {
        errors.push(`${name || id}: private story information is no longer supported. Rewrite it into the host narration or read-aloud evidence, then remove backstory, secrets, motive and clues.`);
      }
      if (rounds.some(r => r?.instructions)) warnings.push(`${name || id}: legacy instruction fields were removed. Put relevant events in spoken host narration or read-aloud evidence instead.`);
    });
    if (s.characters.filter(c => !c.optional).length < 2) errors.push('At least two characters must remain required so the mystery can be played with a smaller group.');
  }

  // Killer
  const sol = obj.solution || {};
  let killerId = asStr(sol.killerId).trim();
  if (!killerId && Array.isArray(obj.characters)) {
    const k = obj.characters.findIndex(c => c && c.isKiller);
    if (k >= 0) killerId = s.characters[k]?.id || '';
  }
  if (!killerId && sol.killer) {
    const k = s.characters.find(c => c.name.toLowerCase() === asStr(sol.killer).toLowerCase());
    if (k) killerId = k.id;
  }
  if (!killerId) errors.push('"solution.killerId" is missing — set it to the id of the murderer character.');
  else if (s.characters.length && !s.characters.some(c => c.id === killerId)) errors.push(`"solution.killerId" is "${killerId}" but no character has that id. Character ids: ${s.characters.map(c => c.id).join(', ')}.`);
  s.solution = { killerId, explanation: asStr(sol.explanation).trim(), revealNarration: asStr(sol.revealNarration).trim() };
  if (s.characters.find(c => c.id === killerId)?.optional) errors.push('The killer character cannot be optional.');
  if (!s.solution.explanation) warnings.push('"solution.explanation" is empty — the reveal will be short.');

  // Assign guests (in order) to characters without one.
  if (guests.length && s.characters.length) {
    const used = new Set(s.characters.map(c => c.guest.toLowerCase()).filter(Boolean));
    const free = guests.filter(g => !used.has(g.name.toLowerCase()));
    for (const c of s.characters) {
      if (!c.guest && free.length) { const g = free.shift(); c.guest = g.name; if (!c.guestNote && g.desc) c.guestNote = g.desc; }
    }
    if (free.length) warnings.push(`More guests than characters: ${free.map(g => g.name).join(', ')} have no character.`);
  }
  if (!s.finale.votePrompt) s.finale.votePrompt = `Who killed ${s.victim.name || 'the victim'}?`;
  if (s.characters.length >= 2) errors.push(...validateAccusationCircles(s));

  return { story: errors.length ? null : s, errors, warnings };
}

/** Replace {charId} with "Name (Guest)" and {victim} with victim name. Unknown placeholders are left as-is. */
export function makeFill(story) {
  const map = {};
  for (const c of story.characters) map[c.id] = c.guest ? `${c.name} (${c.guest})` : c.name;
  map.victim = story.victim?.name || 'the victim';
  return t => String(t ?? '').replace(/\{([A-Za-z0-9_-]+)\}/g, (m, k) => (k in map ? map[k] : m));
}

export function tally(S) {
  const t = {};
  for (const c of S.story.characters) t[c.id] = 0;
  for (const v of Object.values(S.votes || {})) if (v in t) t[v]++;
  return t;
}

/** Release only public material through the current chapter and optional killer notification. */
export function buildView(S, charId) {
  const st = S.story;
  const fill = makeFill(st);
  const ch = charId ? st.characters.find(c => c.id === charId) : null;
  const ri = S.roundIndex;
  const phase = S.phase;
  const inGame = ['round', 'vote', 'reveal'].includes(phase);
  const v = {
    room: S.room,
    title: fill(st.title), setting: fill(st.setting), intro: fill(st.intro),
    atmosphere: storyTheme(st),
    victim: { name: st.victim?.name || '', description: fill(st.victim?.description || '') },
    phase, roundIndex: ri, roundsTotal: st.rounds.length,
    ...(st.edition ? { edition: { ...st.edition } } : {}),
    voteSummary: voteSummary(S),
    roster: st.characters.map(c => ({ id: c.id, name: c.name, guest: c.guest, role: c.role, publicBlurb: fill(c.publicBlurb), claimed: !!S.claims[c.id] })),
    me: ch ? ch.id : null,
  };
  if (inGame && ri >= 0 && ri < st.rounds.length) {
    const r = st.rounds[ri];
    v.currentRound = { index: ri, title: fill(r.title), publicText: fill(r.publicText), narration: fill(r.narration) };
  }
  // Current scripts stay in their owner's packet until the discussion closes for voting.
  const publicCount = inGame ? Math.max(0, Math.min(st.rounds.length, phase === 'round' ? ri : ri + 1)) : 0;
  v.evidenceHistory = st.rounds.slice(0, publicCount).map((r, i) => ({
    index: i, title: fill(r.title), publicText: fill(r.publicText), narration: fill(r.narration),
    accusations: st.characters.map(c => ({
      speakerId: c.id, speakerName: fill(`{${c.id}}`),
      accuses: c.rounds[i].readAloud.accuses,
      targetName: fill(`{${c.rounds[i].readAloud.accuses}}`),
      text: fill(c.rounds[i].readAloud.text),
    })),
  }));
  if (ch) {
    const last = inGame ? ri : -1;
    v.packet = {
      name: ch.name, role: ch.role, guest: ch.guest, guestNote: ch.guestNote,
      publicBlurb: fill(ch.publicBlurb),
      ...(st.discloseKiller || phase === 'reveal' ? { isKiller: st.solution.killerId === ch.id } : {}),
      rounds: st.rounds.slice(0, last + 1).map((r, i) => ({
        index: i, title: fill(r.title),
        readAloud: {
          accuses: ch.rounds[i]?.readAloud?.accuses || '',
          targetName: fill(`{${ch.rounds[i]?.readAloud?.accuses || ''}}`),
          text: fill(ch.rounds[i]?.readAloud?.text || ''),
        },
      })),
    };
  }
  if (phase === 'vote' || phase === 'reveal') {
    v.vote = {
      open: phase === 'vote', prompt: fill(st.finale.votePrompt), roundIndex: ri,
      suspects: st.characters.map(c => ({ id: c.id, name: c.name, guest: c.guest })),
      myVote: ch ? S.votes[ch.id] || null : null,
      votesIn: Object.keys(S.votes).length,
    };
  }
  if (phase === 'reveal') {
    const k = st.characters.find(c => c.id === st.solution.killerId);
    v.reveal = {
      killerId: st.solution.killerId, killerName: k?.name || '?', killerGuest: k?.guest || '',
      explanation: fill(st.solution.explanation), revealNarration: fill(st.solution.revealNarration),
      tally: tally(S),
    };
  }
  return v;
}
