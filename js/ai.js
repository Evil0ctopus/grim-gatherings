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
  "schemaVersion": 1,
  "title": string,
  "setting": string,               // where/when, 1-3 sentences
  "intro": string,                 // public intro shown to everyone before round 1 (before the murder is revealed)
  "victim": {"name": string, "description": string},   // victim is NOT played by a guest
  "rounds": [                      // 5 rounds by default; never fewer than 5 or more than 6
    {"title": string, "narration": string /* host reads aloud, atmospheric, 80-150 words */, "publicText": string /* short summary shown on every phone */, "hostNotes": string}
  ],
  "characters": [                  // exactly one per guest, in the same order as the guest list
    {"id": string /* short lowercase slug, unique */, "guest": string /* guest's name */, "guestNote": string /* the guest's description */, "optional": boolean /* supporting role that can be omitted when fewer guests attend */,
     "name": string, "role": string, "publicBlurb": string /* what everyone knows */,
     "backstory": string /* private, 60-120 words */, "secrets": [string, ...] /* 2-3 private secrets */, "motive": string,
     "rounds": [ {"readAloud": {"accuses": string /* another character id */, "text": string /* unique public evidence accusing that target; read aloud verbatim */}, "clues": [string, ...] /* optional private clues, may be empty */ } ] /* one entry per round */ }
  ],
  "finale": {"narration": string /* host reads before voting */, "votePrompt": string},
  "solution": {"killerId": string /* id of the killer character */, "explanation": string /* how the clues prove it */, "revealNarration": string /* dramatic reveal read aloud */}
}
Rules: exactly one killer among the characters. The killer's packet must say clearly they are the killer and may lie in discussion, but MUST read their public clue verbatim. The killer and every character needed to solve the mystery must be required, not optional.
In EVERY round, each character reads exactly one unique accusation clue against exactly one OTHER character. Each character must also receive exactly one accusation: no duplicated targets, self-accusations or missing targets. The directed accusations must form ONE complete circle through the entire cast, not separate cycles. Change the circle between rounds.
Write concrete evidence against every target, including innocent characters with plausible red herrings. Read-aloud clues are the centerpiece of the story, not repeated generic accusations. Round 1 establishes circumstances, round 2 implicates plausible suspects, round 3 links documents and timelines, round 4 corrects earlier suspicions with credible explanations or exculpatory evidence, and round 5 connects the surviving evidence for the final decision. If using round 6, deepen that chain rather than padding it.
Plan the complete truth and timeline first. Every new clue and narration must follow that plan: no newly invented culprits, convenient surprise witnesses, unexplained alibis or contradictory facts. An innocent character implicated earlier should have later evidence that explains the same behavior, not a retroactively changed event. The killer's evidence must withstand those corrections. Do not label people automatically cleared; present the facts for players to judge.
Narration and read-aloud evidence should complement each other. Save decisive connections for the later rounds. Each character's optional private clues develop their individual understanding without disclosing future discoveries early. Public evidence is shared in a growing notebook after each round moves to voting; secrets remain private. Keep the solution fair.
Public accusation text must be self-contained and refer to its target using {id}. Describe evidence objectively, not as a speaker-specific eyewitness claim, so it can be reassigned if optional roles are omitted. Never refer to another suspect as guilty in the same clue.
Convert plot-critical actions into past events described by evidence or narration rather than mandatory performance tasks. Optional roleplay suggestions may accompany private clues, but never replace the mandatory public clue. Do not output an "instructions" field or reminders about not acting. Scripted accusations are not votes; players may vote for any other suspect.
The mystery must be fair and solvable from public narration and read-aloud clues spread across characters (several characters each hold one piece; decisive connections in rounds 4-5). Optional private clues must not be required to solve it.
Give every other character a secret and a plausible motive (red herrings). In any text you may write {id} to refer to a character (rendered as "Name (Guest)") and {victim} for the victim.
Tailor characters to each guest's description in a fun, kind way. Tone: creepy, gothic, PG-13, fun for a party.`;

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
