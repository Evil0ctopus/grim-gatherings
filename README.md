# 🕯️ Grim Gatherings

A murder-mystery party web app. The host (narrator) runs the game from one screen; every guest joins on their phone and sees **only their own character packet**, with a new read-aloud accusation and optional private clues each round. Everyone accuses one other character and receives exactly one accusation in a complete circle. Everyone votes whodunit on their phone; the host reveals the killer.

**Live:** https://evil0ctopus.github.io/grim-gatherings/

- No server, no accounts, no build step — plain HTML/CSS/vanilla JS (ES modules) on GitHub Pages.
- Real-time sync over WebRTC using [PeerJS](https://peerjs.com/) and its free public broker; the host's browser is the hub.
- Includes four ready-to-play mysteries with flexible casts, including **The Last Séance at Ravenmoor** (5 evidence rounds + reveal, 3–12+ guests). Zero AI setup needed.
- Import/export story JSON (format below), so stories can be written by hand or by any AI assistant.
- Optional: generate a story with Google Gemini's free API tier (requires your own API key; stored only in your browser). Other OpenAI-compatible services can be configured in advanced settings.
- Save authored mysteries in **My Stories** and reuse them later in the same browser.

## How to play (for the host)

1. Open the site on the device that will be the narrator screen (laptop/tablet, ideally on the TV). Tap **Create a new game**.
2. Add each player by name with **Add player**; optionally add a short description. Choose a story under **Ready-to-play mysteries** (or paste a story JSON / generate with AI).
3. Review the story — every character's text is editable. Use the **Assign player** dropdowns to control who plays each character; assignments are unique. Tap **Open the doors**.
4. A QR code, link and room code appear. Guests scan it, tap their assigned name, and read their secret packet.
5. When everyone has joined (green dots), tap **Begin Round 1** and read the narration aloud. Go around the room so every player reads their **Read aloud to everyone** evidence in full, including the killer. Each player accuses one other character and each character receives exactly one accusation. The host screen lists the circle. Then discuss for ~15 min, sharing optional private clues as desired, and tap **Vote after Round 1**. Scripted evidence is not a vote: players can vote for any other suspect and change their vote until voting closes.
6. Vote after every round. After the last round's vote, watch the live tally, then hit **Reveal the killer**. The room bar keeps connection status separate from a compact voting summary. Click or tap that summary (or focus it and press Enter) to open the complete suspect history below the bar: round leaders, each suspect's cumulative vote share, change in percentage points, and per-round counts. Phones show a short **Votes · percentage** label; the expanded history shows the full names. The bar stays the same height.
7. Keep the host screen open the whole game. Refreshing it is safe (the game is saved on that device); guests reconnect automatically.

Guests who refresh, lock their phone, or lose signal just reopen the same link — they're put straight back on their character and the current round.

Every mystery must have **5 or 6 rounds**; all built-ins have five. The built-in accusation circle changes between rounds and is rebuilt when optional roles are omitted, preserving the evidence against each remaining character. Clues progress from initial circumstances and suspicion, through linked documents and timelines, to round 4 corrections and round 5 conclusions. Later evidence explains earlier behavior rather than inventing convenient alibis. Story events are described in evidence and narration; optional roleplay can accompany discussion without being needed to release a clue.

Player screens grow with the investigation. **How the evidence against you has changed** collects the released public clues about that character; **The room's evidence notebook** keeps every completed round's summary and read-aloud evidence. A round joins both histories when the host opens its voting, after players have read their clues. Current scripts stay with their assigned readers until then. Other players' private clues, backstories and motives never enter the notebook, and future rounds remain locked. Corrections are evidence to assess, not automatic innocent/guilty badges. Refresh and rewind reconstruct the history from the current phase and round. Connections use PeerJS's binary serialization and built-in chunking so the growing notebooks and reveal are not limited by the JSON channel's roughly 16 KB message ceiling.

Vote share is the percentage of all ballots cast across the released rounds, not a statistical probability of guilt. Every submitted round ballot has equal weight; changing an accusation replaces that player's ballot for that round. Ties are displayed as ties, and the change compares cumulative share with the previous round's cumulative share. Missing votes are not counted as abstention ballots. The host can close an incomplete vote after a warning. Previous-round navigation retains that round's ballots; reopening its voting permits corrections. History and ballots survive refresh. Only aggregate counts are sent publicly, not who voted for whom. Final win/lose feedback uses the final round's votes, not the cumulative trend.

Players can use **Leave game → Home** at any stage, including the reveal. Connected players release their character before returning home; if disconnected, the host may need to release it manually. Leaving does not end the gathering for others. Hosts have **End game → Home**, with confirmation, to end the gathering for everyone. After the host ends it, players see **Return home**.

**My Stories** is stored in the browser and on the device where it was created; it is not a shared online account or cloud backup. On the story review screen, mark supporting characters optional to save a story for a range of player counts. Keep the killer and essential clues in the required cast; references to omitted characters are shown by name. Gemini's free API tier has limits and is separate from ChatGPT; review Google's [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [data terms](https://ai.google.dev/gemini-api/terms) before using it.

## History-inspired starter mysteries

| Mystery | Players | Atmosphere |
|---|---|---|
| **The Ashes of Mercy Hollow** | 4–8 | Salem-style witch-trial panic, forged confessions and village secrets |
| **Footsteps Above Blackthorn Farm** | 4–9 | An isolated farm, an attic intruder and a suspicious land sale; loosely inspired by Hinterkaifeck |
| **The Last Will at Briar House** | 4–10 | Victorian New England family tension, missing legal papers and a false alibi; loosely inspired by the Borden case |

These are original fictional mysteries, not reconstructions of real murders or claims about real suspects. Deaths occur off-screen; there is no graphic violence. The witch-trial story treats persecution and false accusations as injustices, not proof of witchcraft.

Each has an opening, five narrated clue rounds, character packets with mandatory public accusations and optional private clues, secrets, motives, voting and a complete reveal. Four required characters hold the solving evidence. Additional players receive full characters with their own backstories, secrets, motives, evidence and suspicion arcs. **Optional refers only to cast selection for smaller parties, never to participation:** every included player reads one unique public clue and receives exactly one accusation in every round, discusses the evidence and votes. The accusation circle is rebuilt to include the entire selected cast; omitting roles does not remove the core solution. Player totals exclude the narrator unless the narrator also plays a character.

Add your players and choose **Play this mystery**. The cast automatically fits the listed count; unsupported counts show an error. Review, edit and save a personal version without changing the built-in original. A saved version contains the cast selected for that game; select the original again to use its full player range.

Unit checks: `node --test tests/progression.mjs tests/accusations.mjs tests/library.mjs tests/starters.mjs tests/atmosphere.mjs tests/manor.mjs tests/backdrops.mjs tests/ambient.mjs tests/voting.mjs`.

Browser integration (requires Playwright): `node tests/e2e.mjs [url] [playerCount=4] [mysteryId=sample]`. Mystery IDs are `sample`, `mercy-hollow`, `blackthorn-farm` and `briar-house`. For example, `node tests/e2e.mjs http://127.0.0.1:8128/ 10 briar-house` checks the full Briar House cast, including a phone assigned to the final listed guest, through all five rounds, refresh/reconnection and the reveal. Unit tests check every included character at every supported count; browser tests exercise four-player and full-cast games.

## Atmosphere and event effects

- The landing page uses a full-viewport photographic haunted-house background, not a framed illustration. A slow camera approach, textured drifting fog, fine rain, cloud shadows, warm window lights and an occasional silhouette bring it to life. Controls remain above the scene; it never intercepts input. It is decorative and silent; reduced motion or disabling visual effects leaves a static photograph. The locally bundled image and fog need no external image service or video download.
- Background photograph: **Haunted House**, Darren Lewis, [PublicDomainPictures.net](https://www.publicdomainpictures.net/en/view-image.php?image=23624&picture=haunted-house), released under [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Night grading and animated overlays are applied by this app; the scene is fictional atmosphere, not a claim about the pictured property's history.
- Setup and connecting screens lead down an abandoned corridor. Story review, host gameplay and guest phones share story-matched photographic settings: a deserted corridor for the manor, a misty woodland road for the witch trial, a weathered barn with drifting snow for the farm, and a gothic doorway for the Victorian mystery. Slow camera movement, layered fog and moving light vary by setting; voting deepens the shadows without changing clues or pacing. Disabling effects keeps a static background. All images are bundled locally; only the current setting's photograph is loaded.
- Additional CC0 images from PublicDomainPictures.net: [Abandoned corridor](https://www.publicdomainpictures.net/en/view-image.php?image=129381&picture=abandoned-corridor) by Lode Van de Velde; [Fog in the forest](https://www.publicdomainpictures.net/en/view-image.php?image=17148&picture=fog-in-the-forest) by Larisa Koshkina; [Old Barn](https://www.publicdomainpictures.net/en/view-image.php?image=4934&picture=old-barn) by Peter Griffin; [Haunted house](https://www.publicdomainpictures.net/en/view-image.php?image=368325&picture=haunted-house) by JL Field. These are atmospheric settings, not historical reconstructions or claims about the pictured places.

- Every screen has an **Atmosphere** control: turn visual effects off or mute sound on that device. Sound defaults to on at **58%** for every page load. Browsers that block automatic audio start it on the first click, tap, or key press; the status explains when audio is waiting. Re-enabling sound plays a confirmation chime; **Test sound** replays a cue and resumes browser-paused audio. Adjust **Sound volume**, and check device volume and browser tab muting if nothing is audible. Chimes use speaker-friendly pitches.
- **Background ambience** uses a real recorded thunderstorm with rain and thunder on the main host/join page, and rain or howling wind during preparation, with softened loop boundaries and gentle filtering. It plays only on home, setup and story review while sound is enabled and browser audio is running. Opening the lobby stops it immediately; connecting guests, clues, voting and reveal have no continuous background audio, only action-triggered chimes. Mute, the separate ambience checkbox, or hiding the browser tab also stops it. Visual-effects settings do not change sound.
- Bundled audio credits: [Howling wind](https://commons.wikimedia.org/wiki/File:Howling_wind.ogg), Tvabutz, [CC0](https://creativecommons.org/publicdomain/zero/1.0/); [Rain (1)](https://commons.wikimedia.org/wiki/File:Rain_(1).ogg), ezwa, public domain. Audio loads only when browser audio is running on an eligible page with sound and ambience enabled; playback uses local assets, not a third-party streaming service.
- Main-page storm recording: [Rain and thunder (1)](https://commons.wikimedia.org/wiki/File:Rain_and_thunder_(1).ogg), ezwa, public domain. Thunder comes from the recording, not sudden randomized effects; no flashing lightning is added.
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
| `rounds` | array | **required**, 5 or 6 entries. Each: `title`, `narration` (host reads aloud), `publicText` (shown on every phone), `hostNotes` (host only) |
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
| `rounds` | array | one entry per story round, in order: `{"readAloud": {"accuses": "otherId", "text": "Evidence against {otherId}..."}, "clues": []}` — unlocked when that round starts |

Placeholders: in any text, `{someId}` becomes that character's name plus guest, e.g. `{wick}` → "Jonah Wick (Mike)"; `{victim}` becomes the victim's name.

`readAloud` is mandatory for every character in every round. `accuses` must be another character's id. Each target must appear exactly once per round, and the directed accusations must form one complete circle (not separate pairs or groups). Each public text must be unique and contain concrete evidence against its target. `clues` are optional private material and may be empty. The editor, imports, saved stories and AI output are validated before play.

Write read-aloud evidence objectively with `{targetId}`, rather than as a speaker-specific eyewitness claim, so it can move to another speaker when optional roles are omitted. The app preserves each remaining target's evidence and rebuilds the circle for the reduced cast. Put essential solving evidence against required characters.

Older JSON and saved games with fewer than five rounds or only `clues` / `instructions` need authored chapters and `readAloud` entries before play; the app does not guess accusations from private information or pad a story with invented events. The review editor can add chapters up to six and remove a sixth chapter. Write the new narration and every character's evidence before opening the lobby. Legacy instruction fields are discarded with a warning when a valid story is loaded. Move useful actions into narrated events or evidence. An older in-progress game opens in story review on resume, keeping its existing story for editing rather than silently replacing it. For the updated built-ins, select a fresh copy from the starter catalog.

Tips for writing a good one (for humans or AIs): exactly one killer; tell the killer clearly in their secrets that they are the killer and may lie in discussion, but must read their public clue in full; spread the solving evidence across several characters, with the decisive pieces in later rounds; give everyone else a secret + motive as red herrings; one character per guest.

Full five-round example: [`examples/example-story.json`](examples/example-story.json), **Death at the Lighthouse**. The land argument implicates the niece early; the logbook later distinguishes that dispute from the shipwreck disclosure. The doctor's silence gains context in round 4, while the key, oil and stair sighting build the final chain. Import this file to inspect the complete narration and each character's five read-aloud clues.

## Deploy notes

- Hosted on GitHub Pages from `main` / root. No build step; every path is relative so it works from `/grim-gatherings/`.
- `vendor/` holds pinned copies of PeerJS 1.5.5 and qrcode-generator 1.4.4 (no CDN dependency at game time; Google Fonts is optional styling).
- Files: `index.html`, `css/style.css`, `js/main.js` (routing), `js/host.js`, `js/player.js`, `js/story.js` (schema/validation/per-player filtering), `js/sample.js` (built-in mystery), `js/ai.js`.
- Player URL: `…/grim-gatherings/?room=CODE`. Host URL: `…/grim-gatherings/#host` (resumes the saved game on that device).
- Tests (Playwright, run against the live URL by default): `tests/e2e.mjs` = host + 3 phones, full game (join, per-player filtering, all five rounds, growing evidence notebooks, player refresh, host refresh, vote, reveal); `tests/import.mjs` = JSON import + validation errors; `tests/offline.mjs` = player drops offline mid-game. Run: `npm i playwright && npx playwright install chromium && node tests/e2e.mjs [url]`.

## Known limitations

- **Needs internet on all devices** and depends on the free PeerJS public broker (`0.peerjs.com`) to connect peers. If it's down, nobody can join (there's no fallback server). PeerJS's free TURN relay is used for tricky networks (e.g. phones on cellular), but some very strict networks may still block WebRTC.
- The **host device is the hub**: if the host screen closes or sleeps, players see "reconnecting" until it is back. Keep it awake and plugged in. Its state is saved in that browser's localStorage, so a refresh is safe — but switching to a different host device mid-game is not supported (export the story JSON if you want to reuse it).
- Each phone is remembered by a random token in its localStorage. If a guest switches phones or uses private browsing, the host taps **release** next to their name so they can claim it again.
- Per-player filtering happens on the host before sending, so phones never receive other players' secrets — but this is a party game, not a security product (anyone with the room code can claim an unclaimed character).
- AI generation calls the API straight from the browser; some providers block browser (CORS) requests. Story quality depends on the model; review before starting.
- Character names in the built-in mystery are gendered; anyone can play anyone, or edit names on the Review screen.
