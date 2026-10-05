// Optional AI story generation via any OpenAI-compatible /chat/completions endpoint.
// The API key is stored only in this browser's localStorage and sent only to the endpoint the host enters.
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
  "discloseKiller": false,          // host can toggle identity notification; no killer spoilers in character text
  "clueRouting": "rotating",
  "title": string,
  "setting": string,               // where/when, 1-3 sentences
  "intro": string,                 // public intro shown to everyone before round 1 (before the murder is revealed)
  "victim": {"name": string, "description": string},   // victim is NOT played by a guest
  "rounds": [                      // 5 rounds by default; never fewer than 5 or more than 6
    {"title": string, "narration": string /* host reads aloud, atmospheric, 80-150 words */, "publicText": string /* short summary shown on every phone */, "hostNotes": string}
  ],
  "characters": [                  // exactly one per guest, in the same order as the guest list
    {"id": string /* short lowercase slug, unique */, "guest": string /* guest's name */, "guestNote": string /* the guest's description */, "optional": false /* exact requested cast; every role is required */,
     "name": string, "role": string, "publicBlurb": string /* public role introduction, no hidden evidence or solution spoilers */,
     "rounds": [ {"readAloud": {"accuses": string /* another character id */, "text": string /* unique event evidence about that target; read aloud verbatim */} } ] /* one entry per round */ }
  ],
  "finale": {"narration": string /* host reads before voting */, "votePrompt": string},
  "solution": {"killerId": string /* id of the killer character */, "explanation": string /* how the clues prove it */, "revealNarration": string /* dramatic reveal read aloud */}
}
Rules: exactly one killer among the characters. The app controls whether the murderer is notified, using the host toggle; NEVER identify the murderer in character text. Every character in the requested exact cast must be required, not optional. Do not output backstory, secrets, motive, clues or instructions fields.
In EVERY round, each character reads exactly one unique accusation clue against exactly one OTHER character. Each character must also receive exactly one accusation: no duplicated targets, self-accusations or missing targets. Use rotating targets, allowing reciprocal pairs rather than requiring one connected circle. In cast order, use offsets 1,2,...,N-1, then repeat, so readers change targets every round and cover different other players before repeating. For casts larger than the round count, maximize distinct targets; full all-player coverage is not possible.
Write concrete evidence against every target, including innocent characters with plausible red herrings. Read-aloud clues are the centerpiece of the story, not repeated generic accusations. Round 1 establishes circumstances, round 2 implicates plausible suspects, round 3 links documents and timelines, round 4 corrects earlier suspicions with credible explanations or exculpatory evidence, and round 5 connects the surviving evidence for the final decision. If using round 6, deepen that chain rather than padding it.
Plan the complete truth and timeline first. Every new clue and narration must follow that plan: no newly invented culprits, convenient surprise witnesses, unexplained alibis or contradictory facts. An innocent character implicated earlier should have later evidence that explains the same behavior, not a retroactively changed event. The killer's evidence must withstand those corrections. Do not label people automatically cleared; present the facts for players to judge.
Narration and read-aloud evidence are the ONLY sources of story information. There are NO secret clues or private character histories. Introduce each document, witness, object, motive and timeline fact aloud before referring back to it. New evidence can be discovered during a later chapter, but explicitly narrate its discovery and provenance before using it. Public narration and clues are shared in a growing notebook at voting.
Public accusation text must be self-contained and refer to its target using {id}. Describe evidence objectively, not as a speaker-specific eyewitness claim, so it can be reassigned if optional roles are omitted. Never refer to another suspect as guilty in the same clue.
Make clues concrete and event-related: observations at the body, last sightings, disrupted objects, an examined document, an exposed contradiction. Name the witness or record, identify whose object/trace it is and how ownership was recognized, explain the observation and its limits. Every player contributes a distinct part of the investigation, including supporting roles. Describe evidence objectively so it remains coherent when assigned to a different reader. No mandatory acting or player confession. Scripted accusations are not votes. Stage each discovery in its own chapter; do not preview player cards in host narration or later discoveries early. The repeated finale.votePrompt must be neutral because it appears every round.
The reveal must connect previously spoken evidence, not introduce the missing proof, a surprise confession or a new motive. Ensure the requested exact cast is solvable. Reveal embarrassing conduct and plausible motives through public events, not private packets.
In any text you may write {id} to refer to a character (rendered as "Name (Guest)") and {victim} for the victim.
Tailor characters kindly. Tone: engaging for ages 13-50, suspenseful and easy to follow, PG-13, no graphic violence. Use clear language and explain legal or medical terms.`;

export async function generateStory(settings, theme, guests) {
  if (guests.length < 3) throw new Error('Add at least 3 guests first.');
  const user = `Theme / setting: ${theme || 'a creepy gothic manor on a stormy night'}\nGuests (${guests.length}):\n` + guests.map((g, i) => `${i + 1}. ${g.name}${g.desc ? ' — ' + g.desc : ''}`).join('\n');
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
