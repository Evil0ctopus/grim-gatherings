// Story schema helpers: parsing guests, validation/normalisation, placeholder filling, per-player views.
import { storyTheme } from './atmosphere.js?v=volume-58-v1';

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
    schemaVersion: 1,
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
  if (!s.title) errors.push('"title" is missing — give the mystery a name.');
  if (!s.victim.name) warnings.push('"victim.name" is missing — players won\'t know who died.');

  if (!Array.isArray(obj.rounds) || obj.rounds.length === 0) errors.push('"rounds" must be a list with at least one round, e.g. [{"title":"Round 1","narration":"...","publicText":"..."}].');
  else obj.rounds.forEach((r, i) => {
    const rr = { title: asStr(r?.title).trim() || `Round ${i + 1}`, narration: asStr(r?.narration).trim(), publicText: asStr(r?.publicText).trim(), hostNotes: asStr(r?.hostNotes).trim() };
    if (!rr.narration && !rr.publicText) warnings.push(`rounds[${i}] has no "narration" or "publicText".`);
    s.rounds.push(rr);
  });

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
        backstory: asStr(c.backstory).trim(),
        secrets: asLines(c.secrets),
        motive: asStr(c.motive).trim(),
        rounds: s.rounds.map((_, ri) => ({ clues: asLines(rounds[ri]?.clues), instructions: asStr(rounds[ri]?.instructions).trim() })),
      });
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

/** Build the data ONE player is allowed to see. Never includes other characters' secrets. */
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
    roster: st.characters.map(c => ({ id: c.id, name: c.name, guest: c.guest, role: c.role, publicBlurb: fill(c.publicBlurb), claimed: !!S.claims[c.id] })),
    me: ch ? ch.id : null,
  };
  if (inGame && ri >= 0 && ri < st.rounds.length) {
    const r = st.rounds[ri];
    v.currentRound = { index: ri, title: fill(r.title), publicText: fill(r.publicText) };
  }
  if (ch) {
    const last = inGame ? ri : -1;
    v.packet = {
      name: ch.name, role: ch.role, guest: ch.guest, guestNote: ch.guestNote,
      publicBlurb: fill(ch.publicBlurb), backstory: fill(ch.backstory), secrets: ch.secrets.map(fill), motive: fill(ch.motive),
      isKiller: st.solution.killerId === ch.id,
      rounds: st.rounds.slice(0, last + 1).map((r, i) => ({ index: i, title: fill(r.title), clues: (ch.rounds[i]?.clues || []).map(fill), instructions: fill(ch.rounds[i]?.instructions || '') })),
    };
  }
  if (phase === 'vote' || phase === 'reveal') {
    v.vote = {
      open: phase === 'vote', prompt: fill(st.finale.votePrompt),
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
