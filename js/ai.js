// Optional AI story generation via any OpenAI-compatible /chat/completions endpoint.
// The API key is stored only in this browser's localStorage and sent only to the endpoint the host enters.
import { coverageSchedule } from './accusations.js?v=universal-game-flow-v2';

const KEY = 'gg-ai-settings';
export const DEFAULT_AI_SETTINGS = {
  base: 'https://generativelanguage.googleapis.com/v1beta/openai',
  model: 'gemini-3.8-flash',
  key: '',
};

export function loadAiSettings() {
  try { return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULT_AI_SETTINGS }; }
}
export function saveAiSettings(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

const SCHEMA_DOC = `Return ONLY a JSON object with this exact shape (no markdown):
{
  "schemaVersion": 2,
  "fixedPlayerCount": number,
  "discloseKiller": false,
  "clueRouting": "rotating",
  "title": string,
  "setting": string,
  "intro": string,
  "hiddenThread": string,
  "coverageRepeatNote": string,
  "specialMechanics": [string],
  "victim": {"name": string, "description": string},
  "rounds": [
    {"title": string, "narration": string, "publicText": string, "hostNotes": string,
     "events": [string] /* this round's event-map beats in order */,
     "chain": [character IDs in read order], "coverageRepeat": boolean}
  ],
  "characters": [
    {"id": string, "guest": string, "guestNote": string, "optional": false,
     "name": string, "role": string, "relationship": string, "tieIn": string, "publicBlurb": string,
     "rounds": [ {"readAloud": {"accuses": string, "observation": string,
       "contradictingDetail": string, "text": string}} ] }
  ],
  "finale": {"narration": string /* host reads before voting */, "votePrompt": string},
  "solution": {"killerId": string /* id of the killer character */, "explanation": string /* how the clues prove it */, "revealNarration": string /* dramatic reveal read aloud */}
}
Rules: exactly one killer among the characters. The app controls whether the murderer is notified; NEVER identify the murderer in character text. Every character is required for the fixed count. Do not output private backstory or secret clue fields.
Use the exact precomputed chain and reader-to-target assignments in the user prompt. Every round, each character reads one clue about another character and each character is talked about exactly once; the character talked about reads next, and if a loop closes early the next unread character starts a new loop. In the first N-1 rounds every reader must target every other character exactly once. Later rounds may repeat pairs only when the story requires the extra rounds: set coverageRepeat true on those rounds and explain the need in the top-level "coverageRepeatNote" string (otherwise "").
Every clue has two explicit parts: an observation about its assigned target and a physical detail that contradicts the target's stated explanation. Make them source-based, concrete, event-related evidence, not bare accusations. Keep clues coherent regardless of which player reads them.
Write one ordered event map per round. Include exactly one hidden story thread and at least one mechanic derived from this story's events. Do not add ghosts by default. If a player character dies and the event map calls for a ghost, add a ghost part for every later round; it must be short, cryptic and plot-advancing.
Round beats must fit the chosen number of rounds; do not assume a fixed five- or six-round story. Explain every clue's source and limits. Solution connects evidence already spoken and answers the final vote question without new facts.
Plan the complete truth and timeline first. Every new clue and narration must follow that plan: no newly invented culprits, convenient surprise witnesses, unexplained alibis or contradictory facts. An innocent character implicated earlier should have later evidence that explains the same behavior, not a retroactively changed event. The killer's evidence must withstand those corrections. Do not label people automatically cleared; present the facts for players to judge.
Narration and read-aloud evidence are the ONLY sources of story information. There are NO secret clues or private character histories. Introduce each document, witness, object, motive and timeline fact aloud before referring back to it. New evidence can be discovered during a later chapter, but explicitly narrate its discovery and provenance before using it. Public narration and clues are shared in a growing notebook at voting.
Public accusation text must be self-contained and refer to its target using {id}. Describe evidence objectively, not as a speaker-specific eyewitness claim, so it can be reassigned if optional roles are omitted. Never refer to another suspect as guilty in the same clue.
Make clues concrete and event-related: observations at the body, last sightings, disrupted objects, an examined document, an exposed contradiction. Name the witness or record, identify whose object/trace it is and how ownership was recognized, explain the observation and its limits. Every player contributes a distinct part of the investigation, including supporting roles. Describe evidence objectively so it remains coherent when assigned to a different reader. No mandatory acting or player confession. Scripted accusations are not votes. Stage each discovery in its own chapter; do not preview player cards in host narration or later discoveries early. The repeated finale.votePrompt must be neutral because it appears every round.
The reveal must connect previously spoken evidence, not introduce the missing proof, a surprise confession or a new motive. Ensure the requested exact cast is solvable. Reveal embarrassing conduct and plausible motives through public events, not private packets.
In any text you may write {id} to refer to a character (rendered as "Name (Guest)") and {victim} for the victim.
Tailor characters kindly. Tone: engaging for ages 13-50, suspenseful and easy to follow, PG-13, no graphic violence. Use clear language and explain legal or medical terms.`;

export async function generateStory(settings, theme, guests) {
  if (guests.length < 3) throw new Error('Add at least 3 guests first.');
  const ids = guests.map((_, index) => `c${index + 1}`);
  const schedule = coverageSchedule(ids.map(id => ({ id })));
  const rounds = Math.max(5, guests.length - 1);
  const assignmentPlan = Array.from({ length: rounds }, (_, roundIndex) => {
    const { order, targets } = schedule[roundIndex % schedule.length];
    return `Round ${roundIndex + 1} (coverageRepeat: ${roundIndex >= schedule.length}): chain ${order.join(' -> ')}; ` +
      order.map(reader => `${reader} reads about ${targets[reader]}`).join('; ');
  }).join('\n');
  const user = `Fixed player count: ${guests.length}. Clue rounds: ${rounds}.\nTheme / setting: ${theme || 'a creepy gothic manor on a stormy night'}\nGuests:\n` +
    guests.map((g, i) => `${i + 1}. ${g.name}${g.desc ? ' — ' + g.desc : ''}`).join('\n') +
    `\n\nMANDATORY PRECOMPUTED ASSIGNMENTS (copy these chain arrays and targets exactly):\n${assignmentPlan}`;
  return generateText(settings, 'You write murder-mystery party games. ' + SCHEMA_DOC, user);
}

export async function generateText({ base, model, key }, system, user) {
  if (!key) throw new Error('Paste an API key first.');
  const endpoint = new URL(base);
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) throw new Error('Use an HTTPS AI service address (or a local development endpoint).');
  const url = base.replace(/\/+$/, '') + '/chat/completions';
  const body = { model, temperature: 0.9, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: { type: 'json_object' } };
  const call = async b => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(b), signal: AbortSignal.timeout(120000) });
  let res = await call(body);
  if (res.status === 400) { delete body.response_format; res = await call(body); }
  if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(`API error ${res.status}: ${t.slice(0, 300)}`); }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('The API returned no content.');
  return content;
}
