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
  "title": string,
  "setting": string,               // where/when, 1-3 sentences
  "intro": string,                 // public intro shown to everyone before round 1 (before the murder is revealed)
  "victim": {"name": string, "description": string},   // victim is NOT played by a guest
  "rounds": [                      // 5 rounds by default; never fewer than 5 or more than 6
    {"title": string, "narration": string /* host reads aloud, atmospheric, 80-150 words */, "publicText": string /* short summary shown on every phone */, "hostNotes": string}
  ],
  "characters": [                  // exactly one per guest, in the same order as the guest list
    {"id": string /* short lowercase slug, unique */, "guest": string /* guest's name */, "guestNote": string /* the guest's description */, "optional": boolean /* supporting role that can be omitted when fewer guests attend */,
     "name": string, "role": string, "publicBlurb": string /* public role introduction, no hidden evidence or solution spoilers */,
     "rounds": [ {"readAloud": {"accuses": string /* another character id */, "text": string /* unique event evidence about that target; read aloud verbatim */} } ] /* one entry per round */ }
  ],
  "finale": {"narration": string /* host reads before voting */, "votePrompt": string},
  "solution": {"killerId": string /* id of the killer character */, "explanation": string /* how the clues prove it */, "revealNarration": string /* dramatic reveal read aloud */}
}
Rules: exactly one killer among the characters. The app controls whether the murderer is notified, using the host toggle; NEVER identify the murderer in character text. The killer and every character needed to solve the mystery must be required, not optional. Do not output backstory, secrets, motive, clues or instructions fields.
In EVERY round, each character reads exactly one unique accusation clue against exactly one OTHER character. Each character must also receive exactly one accusation: no duplicated targets, self-accusations or missing targets. The directed accusations must form ONE complete circle through the entire cast, not separate cycles. Change the circle between rounds.
Write concrete evidence against every target, including innocent characters with plausible red herrings. Read-aloud clues are the centerpiece of the story, not repeated generic accusations. Round 1 establishes circumstances, round 2 implicates plausible suspects, round 3 links documents and timelines, round 4 corrects earlier suspicions with credible explanations or exculpatory evidence, and round 5 connects the surviving evidence for the final decision. If using round 6, deepen that chain rather than padding it.
Plan the complete truth and timeline first. Every new clue and narration must follow that plan: no newly invented culprits, convenient surprise witnesses, unexplained alibis or contradictory facts. An innocent character implicated earlier should have later evidence that explains the same behavior, not a retroactively changed event. The killer's evidence must withstand those corrections. Do not label people automatically cleared; present the facts for players to judge.
Narration and read-aloud evidence are the ONLY sources of story information. There are NO secret clues or private character histories. Introduce each document, witness, object, motive and timeline fact aloud before referring back to it. New evidence can be discovered during a later chapter, but explicitly narrate its discovery and provenance before using it. Public narration and clues are shared in a growing notebook at voting.
Public accusation text must be self-contained and refer to its target using {id}. Describe evidence objectively, not as a speaker-specific eyewitness claim, so it can be reassigned if optional roles are omitted. Never refer to another suspect as guilty in the same clue.
Make clues concrete and event-related: observations at the body, last sightings, disrupted objects, an examined document, an exposed contradiction. Every player contributes a distinct part of the investigation, including supporting roles. Describe evidence objectively so it remains coherent when assigned to a different reader. No mandatory acting or player confession. Scripted accusations are not votes.
The reveal must connect previously spoken evidence, not introduce the missing proof, a surprise confession or a new motive. Ensure the four-player core and maximum cast are both solvable. Reveal embarrassing conduct and plausible motives through public events, not private packets.
In any text you may write {id} to refer to a character (rendered as "Name (Guest)") and {victim} for the victim.
Tailor characters kindly. Tone: engaging for ages 13-50, suspenseful and easy to follow, PG-13, no graphic violence. Use clear language and explain legal or medical terms.`;

export async function generateStory({ base, model, key }, theme, guests) {
  if (!key) throw new Error('Paste an API key first.');
  if (guests.length < 3) throw new Error('Add at least 3 guests first.');
  const url = base.replace(/\/+$/, '') + '/chat/completions';
  const user = `Theme / setting: ${theme || 'a creepy gothic manor on a stormy night'}\nGuests (${guests.length}):\n` + guests.map((g, i) => `${i + 1}. ${g.name}${g.desc ? ' — ' + g.desc : ''}`).join('\n');
  const body = { model, temperature: 0.9, messages: [{ role: 'system', content: 'You write murder-mystery party games. ' + SCHEMA_DOC }, { role: 'user', content: user }], response_format: { type: 'json_object' } };
  const call = async b => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(b) });
  let res = await call(body);
  if (res.status === 400) { delete body.response_format; res = await call(body); }
  if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(`API error ${res.status}: ${t.slice(0, 300)}`); }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('The API returned no content.');
  return content;
}
