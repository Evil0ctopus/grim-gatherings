# 🕯️ Grim Gatherings

A murder-mystery party web app. The host (narrator) runs the game from one screen; every guest joins on their phone and sees **only their own secret character packet**, with new clues pushed to them each round. Finale: everyone votes whodunit on their phone, the host reveals the killer.

**Live:** https://evil0ctopus.github.io/grim-gatherings/

- No server, no accounts, no build step — plain HTML/CSS/vanilla JS (ES modules) on GitHub Pages.
- Real-time sync over WebRTC using [PeerJS](https://peerjs.com/) and its free public broker; the host's browser is the hub.
- Includes four ready-to-play mysteries with flexible casts, including **The Last Séance at Ravenmoor** (3 rounds + finale, 3–12+ guests). Zero AI setup needed.
- Import/export story JSON (format below), so stories can be written by hand or by any AI assistant.
- Optional: generate a story with Google Gemini's free API tier (requires your own API key; stored only in your browser). Other OpenAI-compatible services can be configured in advanced settings.
- Save authored mysteries in **My Stories** and reuse them later in the same browser.

## How to play (for the host)

1. Open the site on the device that will be the narrator screen (laptop/tablet, ideally on the TV). Tap **Create a new game**.
2. Add each player by name with **Add player**; optionally add a short description. Choose a story under **Ready-to-play mysteries** (or paste a story JSON / generate with AI).
3. Review the story — every character's text is editable. Use the **Assign player** dropdowns to control who plays each character; assignments are unique. Tap **Open the doors**.
4. A QR code, link and room code appear. Guests scan it, tap their assigned name, and read their secret packet.
5. When everyone has joined (green dots), tap **Begin Round 1** and read the narration aloud. Each phone gets that round's private clues. Let people mingle ~15 min, then **Next round**.
6. After the last round, tap **Begin the finale**: phones show a vote. Watch the live tally, then hit **Reveal the killer**.
7. Keep the host screen open the whole game. Refreshing it is safe (the game is saved on that device); guests reconnect automatically.

Guests who refresh, lock their phone, or lose signal just reopen the same link — they're put straight back on their character and the current round.

**My Stories** is stored in the browser and on the device where it was created; it is not a shared online account or cloud backup. On the story review screen, mark supporting characters optional to save a story for a range of player counts. Keep the killer and essential clues in the required cast; references to omitted characters are shown by name. Gemini's free API tier has limits and is separate from ChatGPT; review Google's [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [data terms](https://ai.google.dev/gemini-api/terms) before using it.

## History-inspired starter mysteries

| Mystery | Players | Atmosphere |
|---|---|---|
| **The Ashes of Mercy Hollow** | 4–8 | Salem-style witch-trial panic, forged confessions and village secrets |
| **Footsteps Above Blackthorn Farm** | 4–9 | An isolated farm, an attic intruder and a suspicious land sale; loosely inspired by Hinterkaifeck |
| **The Last Will at Briar House** | 4–10 | Victorian New England family tension, missing legal papers and a false alibi; loosely inspired by the Borden case |

These are original fictional mysteries, not reconstructions of real murders or claims about real suspects. Deaths occur off-screen; there is no graphic violence. The witch-trial story treats persecution and false accusations as injustices, not proof of witchcraft.

Each has an opening, three narrated clue rounds, private character packets, secrets, motives, voting and a complete reveal. Four required characters hold the solving evidence. Additional players receive optional supporting roles with their own secrets, clues and red herrings; omitting those roles does not remove the core evidence. Player totals exclude the narrator unless the narrator also plays a character.

Add your players and choose **Play this mystery**. The cast automatically fits the listed count; unsupported counts show an error. Review, edit and save a personal version without changing the built-in original. A saved version contains the cast selected for that game; select the original again to use its full player range.

Unit checks: `node --test tests/library.mjs tests/starters.mjs tests/atmosphere.mjs`.

## Atmosphere and event effects

- The landing page features an original illustrated haunted manor: a slow camera approach, drifting ground fog, moving clouds and branches, glowing windows, a passing window silhouette, a creaking door and an occasional bat. It is decorative and silent; reduced motion or disabling visual effects leaves a static scene. No videos or external image services are loaded.

- Every screen has an **Atmosphere** control: turn visual effects off or explicitly enable optional sound on that device. Sound defaults to off for every page load; no audio files or extra services are needed.
- In story review, choose **Story atmosphere**: haunted manor, witch-trial candlelight, snowbound farmhouse or Victorian lamplight. The choice survives renaming, saving and exporting the story.
- New character assignments animate the private invitation; newly released rounds animate clue cards; voting gets an accusation announcement and stamped confirmation; the reveal gets a dramatic name entrance. Content remains readable and playable throughout; effects never unlock additional clues.
- The host's **Host atmosphere controls** can dim the decorative lighting for eight seconds, play a short suspense chime or send a discussion prompt to connected phones. These cues do not advance the game. A phone plays sounds only if its player has enabled sound.
- Refreshes and unchanged reconnect snapshots do not replay chapter effects. Already visited rounds do not replay their entrances when the host goes backward.
- Operating-system **reduced motion** disables decorative motion and transition animations. There are no flashing lightning effects, forced timers or jump scares. Visual effects can also be disabled independently of sound.

## Story JSON format

A story is one JSON object. Paste it in **Setup → Paste story JSON** (or upload a `.json` file). Export the current story from **Review → Export / edit raw JSON**.

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | number | `1` |
| `title` | string | **required** |
| `setting` | string | where/when |
| `atmosphere` | string | optional: `manor`, `witch`, `farm` or `victorian`; inferred for built-in titles when absent |
| `intro` | string | shown to everyone in the lobby, before round 1 (before the murder) |
| `victim` | object | `{"name", "description"}` — the victim is not played by a guest |
| `rounds` | array | **required**, ≥1. Each: `title`, `narration` (host reads aloud), `publicText` (shown on every phone), `hostNotes` (host only) |
| `characters` | array | **required**, ≥2, ideally one per guest. See below |
| `finale` | object | `narration` (host reads before voting), `votePrompt` (shown on phones) |
| `solution` | object | `killerId` (**required**, must match a character `id`), `explanation`, `revealNarration` |

Each character:

| Field | Type | Notes |
|---|---|---|
| `id` | string | short unique slug, e.g. `"nell"` (auto-generated if missing) |
| `guest` | string | the guest's real name. If empty, guests from the setup list are assigned in order |
| `guestNote` | string | the guest's description; shown to them as "lean into it" |
| `optional` | boolean | mark supporting characters that can be omitted when fewer guests attend; at least two characters and the killer must remain required |
| `name`, `role` | string | character name (**required**) and role/title |
| `publicBlurb` | string | what everyone knows — visible to all players |
| `backstory`, `motive` | string | private |
| `secrets` | string[] | private (a single string is also accepted) |
| `rounds` | array | one entry per story round, in order: `{"clues": string[], "instructions": string}` — private, unlocked when that round starts |

Placeholders: in any text, `{someId}` becomes that character's name plus guest, e.g. `{wick}` → "Jonah Wick (Mike)"; `{victim}` becomes the victim's name.

Tips for writing a good one (for humans or AIs): exactly one killer; tell the killer clearly in their secrets that they are the killer and may lie; spread the solving clues across several characters, with the decisive ones in later rounds; give everyone else a secret + motive as red herrings; one character per guest.

Full example (also in [`examples/example-story.json`](examples/example-story.json)):

```json
{
  "schemaVersion": 1,
  "title": "Death at the Lighthouse",
  "setting": "Gallows Point Lighthouse, a storm-battered rock off the coast of Maine, 1931. The supply boat won't return until morning.",
  "intro": "Keeper Elias Morrow invited a handful of guests to watch the lamp being lit for the last time before the lighthouse is decommissioned. The waves are high. The lamp is turning. Something is wrong.",
  "victim": { "name": "Elias Morrow", "description": "The old lighthouse keeper. Gruff, superstitious, and sitting on a secret about a shipwreck forty years ago." },
  "rounds": [
    {
      "title": "Round 1 — The Lamp Goes Dark",
      "narration": "At nine o'clock the great lamp sputters and dies. In the blackness you hear a scream from the gallery above — and a heavy thud on the iron stairs. When the lamp flickers back to life, Elias Morrow lies at the bottom of the spiral staircase, neck broken, a brass key clutched in his fist.",
      "publicText": "The keeper is dead at the foot of the stairs, a brass key in his hand. No boat until dawn. Talk to each other.",
      "hostNotes": "Give everyone 15 minutes."
    },
    {
      "title": "Round 2 — The Logbook",
      "narration": "Someone finds the keeper's logbook. The final entry, written tonight, reads: 'One of them knows what happened to the Mary Celeste II. I will tell the coast guard at dawn.'",
      "publicText": "The logbook names no one — but the keeper meant to talk at dawn. Share your secrets.",
      "hostNotes": "Then open voting."
    }
  ],
  "characters": [
    {
      "id": "nell",
      "guest": "Sarah",
      "guestNote": "loud, loves wine, always late",
      "name": "Nell Harrow",
      "role": "The Keeper's Niece",
      "publicBlurb": "Elias's niece and only family. Arrived late on the last boat, smelling of wine.",
      "backstory": "You came to beg your uncle to sell the lighthouse land. He refused.",
      "secrets": ["You are deeply in debt.", "You argued with Elias on the gallery an hour before he died."],
      "motive": "You inherit the land.",
      "rounds": [
        { "clues": ["You saw {wick} climbing the stairs just before the lamp died."], "instructions": "Act shocked. Mention the argument only if asked." },
        { "clues": ["The brass key opens the oil store — and {wick} has the only other copy."], "instructions": "Point the group toward the oil store." }
      ]
    },
    {
      "id": "wick",
      "guest": "Mike",
      "guestNote": "quiet, secretly competitive",
      "name": "Jonah Wick",
      "role": "The Assistant Keeper",
      "publicBlurb": "Elias's taciturn assistant for ten years.",
      "backstory": "Forty years ago your father wrecked the Mary Celeste II for the insurance money. Elias saw it happen.",
      "secrets": ["YOU ARE THE KILLER. You may lie.", "You cut the lamp's oil line and pushed Elias down the stairs in the dark."],
      "motive": "Elias was going to expose your family's crime at dawn.",
      "rounds": [
        { "clues": ["There is lamp oil on your sleeve."], "instructions": "Say you were in the oil store the whole time — alone." },
        { "clues": ["Nell argued with Elias tonight. Use it."], "instructions": "Steer suspicion toward {nell}." }
      ]
    },
    {
      "id": "doc",
      "guest": "Priya",
      "guestNote": "theatrical, loves true crime",
      "name": "Dr. Ruth Calder",
      "role": "The Visiting Doctor",
      "publicBlurb": "A doctor visiting from the mainland to check on the keeper's failing health.",
      "backstory": "You have been treating Elias for months. He confided in you.",
      "secrets": ["Elias told you he was afraid of someone on the island."],
      "motive": "None known — or is there?",
      "rounds": [
        { "clues": ["The bruises on Elias's back are hand-shaped. He was pushed."], "instructions": "Announce that this was murder, not an accident." },
        { "clues": ["Elias once told you: 'Wick's father sank that ship, and the boy knows I saw.'"], "instructions": "Reveal what Elias told you." }
      ]
    }
  ],
  "finale": {
    "narration": "The lamp turns. The sea roars. Who pushed Elias Morrow down the stairs?",
    "votePrompt": "Who killed Elias Morrow?"
  },
  "solution": {
    "killerId": "wick",
    "explanation": "Jonah Wick cut the oil line to darken the lamp, climbed the stairs (seen by Nell), and pushed Elias, who was about to expose the wreck of the Mary Celeste II. The oil on his sleeve and the doctor's testimony seal it.",
    "revealNarration": "Jonah Wick stares at the oil on his sleeve. 'He should have taken it to his grave,' he whispers. 'Now he has.'"
  }
}
```

## Deploy notes

- Hosted on GitHub Pages from `main` / root. No build step; every path is relative so it works from `/grim-gatherings/`.
- `vendor/` holds pinned copies of PeerJS 1.5.5 and qrcode-generator 1.4.4 (no CDN dependency at game time; Google Fonts is optional styling).
- Files: `index.html`, `css/style.css`, `js/main.js` (routing), `js/host.js`, `js/player.js`, `js/story.js` (schema/validation/per-player filtering), `js/sample.js` (built-in mystery), `js/ai.js`.
- Player URL: `…/grim-gatherings/?room=CODE`. Host URL: `…/grim-gatherings/#host` (resumes the saved game on that device).
- Tests (Playwright, run against the live URL by default): `tests/e2e.mjs` = host + 3 phones, full game (join, per-player filtering, 3 rounds, player refresh, host refresh, vote, reveal); `tests/import.mjs` = JSON import + validation errors; `tests/offline.mjs` = player drops offline mid-game. Run: `npm i playwright && npx playwright install chromium && node tests/e2e.mjs [url]`.

## Known limitations

- **Needs internet on all devices** and depends on the free PeerJS public broker (`0.peerjs.com`) to connect peers. If it's down, nobody can join (there's no fallback server). PeerJS's free TURN relay is used for tricky networks (e.g. phones on cellular), but some very strict networks may still block WebRTC.
- The **host device is the hub**: if the host screen closes or sleeps, players see "reconnecting" until it is back. Keep it awake and plugged in. Its state is saved in that browser's localStorage, so a refresh is safe — but switching to a different host device mid-game is not supported (export the story JSON if you want to reuse it).
- Each phone is remembered by a random token in its localStorage. If a guest switches phones or uses private browsing, the host taps **release** next to their name so they can claim it again.
- Per-player filtering happens on the host before sending, so phones never receive other players' secrets — but this is a party game, not a security product (anyone with the room code can claim an unclaimed character).
- AI generation calls the API straight from the browser; some providers block browser (CORS) requests. Story quality depends on the model; review before starting.
- Character names in the built-in mystery are gendered; anyone can play anyone, or edit names on the Review screen.
