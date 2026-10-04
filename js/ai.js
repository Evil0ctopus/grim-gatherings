// Optional AI story generation via any OpenAI-compatible /chat/completions endpoint.
// The API key is stored only in this browser's localStorage and sent only to the endpoint the host enters.
const KEY = 'gg-ai-settings';
export function loadAiSettings() {
  try { return { base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', key: '', ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', key: '' }; }
}
export function saveAiSettings(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

const SCHEMA_DOC = `Return ONLY a JSON object with this exact shape (no markdown):
{
  "schemaVersion": 1,
  "title": string,
  "setting": string,               // where/when, 1-3 sentences
  "intro": string,                 // public intro shown to everyone before round 1 (before the murder is revealed)
  "victim": {"name": string, "description": string},   // victim is NOT played by a guest
  "rounds": [                      // exactly 3 rounds
    {"title": string, "narration": string /* host reads aloud, atmospheric, 80-150 words */, "publicText": string /* short summary shown on every phone */, "hostNotes": string}
  ],
  "characters": [                  // exactly one per guest, in the same order as the guest list
    {"id": string /* short lowercase slug, unique */, "guest": string /* guest's name */, "guestNote": string /* the guest's description */,
     "name": string, "role": string, "publicBlurb": string /* what everyone knows */,
     "backstory": string /* private, 60-120 words */, "secrets": [string, ...] /* 2-3 private secrets */, "motive": string,
     "rounds": [ {"clues": [string, ...] /* 1-2 private clues */, "instructions": string /* what to do/say this round */ } ] /* one entry per round */ }
  ],
  "finale": {"narration": string /* host reads before voting */, "votePrompt": string},
  "solution": {"killerId": string /* id of the killer character */, "explanation": string /* how the clues prove it */, "revealNarration": string /* dramatic reveal read aloud */}
}
Rules: exactly one killer among the characters. The killer's packet must say clearly they are the killer and that they may lie.
The mystery must be fair and solvable from the clues spread across characters (several characters each hold one piece; key clues in rounds 2-3).
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
