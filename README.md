# 🕯️ Grim Gatherings

A murder-mystery party web app. The host reads the current chapter's narration; every guest joins on their phone and reads one event-related clue aloud each round. **All story evidence is spoken to the group: no secret clues, private backstories or hidden motives.** Everyone reads about one other character and receives exactly one read-aloud clue about them, discusses the evidence, and votes. Assignments use complete circles or explicitly authored rotating routes.

**Live:** https://evil0ctopus.github.io/grim-gatherings/

- The existing game and private workshop need no server, account or build step: plain HTML/CSS/vanilla JS (ES modules) on GitHub Pages. Shared drafts, submissions and approval use Supabase (the preferred free hosting route) or the optional Node community service.
- Real-time sync over WebRTC using [PeerJS](https://peerjs.com/) and its free public broker; the host's browser is the hub.
- Includes five ready-to-play mystery families with fixed player-count editions, including **The Last Seance at Ravenmoor** (5 evidence rounds + reveal, 3–24 guests) and Melissa's **The Barber of Blackwater Row** (exactly 4 guests). Zero AI setup needed.
- Import/export story JSON (format below), so stories can be written by hand or by any AI assistant.
- Optional: generate a story with Google Gemini's free API tier (requires your own API key; stored only in your browser). Other OpenAI-compatible services can be configured in advanced settings.
- Save authored mysteries in **My Stories** and reuse them later in the same browser.
- **Story Workshop:** guided creation, repeatable editing, version history, reusable AI prompts, private playable saves, and an account-backed submission/approval workflow when the community service is connected.

## Story workshop and community publishing

Choose **Build my mystery / approve stories** on the home screen, or open [the workshop](workshop.html).

The home screen also has **Admin login / story approvals**, opening [the account screen](workshop.html?account=1) directly. Log in using your game administrator email/password (not your database password), then choose **Approve stories**. The link itself grants no permissions; only the trusted administrator role unlocks moderation.

1. Choose **3-24 players**, five or six rounds, a setting and an idea. Optional characters are entered one per line as `Name | job`. Instructions are simple; story content is intended for teens and adults, not young children.
2. Open the draft. Its reader assignments are preplanned: every round has unique targets, no self-targets, and every reader changes targets. Readers cover all other characters before repeating when rounds permit; a five-round story cannot cover 23 other characters for each reader.
3. Write directly, **Copy story prompt** to a preferred AI, or use a configured AI service. A copy-prompt workflow needs no API key. Import the returned complete JSON. Explicit AI calls send the idea/draft to the chosen provider; provider costs, data policies and limits apply. No other workshop action calls AI. A generation makes one initial call and at most two format-repair calls; unrepaired output is retained for manual correction, not declared ready. **Ask my AI to review the story** is a separate optional narrative-review call; it reports specific suggestions without modifying the story, checking the human-review boxes or granting approval.
4. Edit as many times as needed. Field changes save when focus leaves the field. **Earlier versions** restores a previous snapshot without deleting history. Chapter previews and the solution are collapsed. No fixed revision limit is imposed, but device storage, backend disk space and request-size limits still apply. Download a draft backup for safekeeping; private browsing, browser cleanup or changing origins can lose device-only drafts.
5. Use **Keep these facts hidden until...** for exact-phrase release checks. These check introductions, public blurbs, early narration/cards/phone summaries and the repeated voting prompt. They cannot detect paraphrased or implied spoilers. **Check my story** verifies game structure, routing, references and release rules. The creator must also review evidence sources/recognition/limits, narrative pacing, already-spoken solution proof and content. Changes reset that review. Human review is necessary; automated checks do not certify narrative quality.
6. **Save playable story** creates/updates a private game in My Stories with **User-created** and an author credit. It does not publish. A draft edit does not alter the saved playable copy or an active game. To play, go home, create a game, add the matching player count and choose the saved story.
7. Optionally log in and **Back up to my account** for cross-device drafts and account revision history. Account backups retain incomplete drafts too. Downloads from account history can be imported using the workshop backup format. Concurrent saves use revision checks rather than overwriting another device's work.
8. **Submit for approval** requires a complete reviewed story and explicit permission to publish an original fictional work with account author credit. It saves and submits an immutable version. Later edits need another submission. The author sees pending, requested changes, rejection and publication feedback in Account.
9. The site owner logs in with the administrator account, selects **Approve stories**, previews all chapters/cards and the solution, then chooses **Approve and publish**, **Request changes**, **Reject**, or **Unpublish**. Approving a newer version replaces that draft's previously published version; unrelated stories remain. The approved version appears in **Community stories**, with author credit and a **User-created** badge. It can be added to My Stories or selected directly during game setup. No static-site rebuild is needed for approval.

Built-in stories remain separate. Approval is server-enforced; an author cannot grant themselves admin access or publish by setting a badge in JSON. Story text is displayed as escaped text, not executable HTML. An imported provenance label alone is not proof of website approval: only the backend's approved catalog establishes that.

### Preferred free hosting: Supabase

The website is connected to the deployed free Supabase community service. Registration remains closed until the owner account and public email delivery are ready. Existing accounts can log in; private editing still needs no account. The steps below document provisioning a new installation, not rerunning the initial migration against the already-provisioned production database.

Supabase hosts the PostgreSQL database, email/password authentication and the `community` Edge Function while the game stays on GitHub Pages. Free-plan quotas are not unlimited: currently 500 MB database storage, 50,000 monthly active users and two free active projects. Free projects may pause after a week of inactivity. Review the current [pricing](https://supabase.com/pricing), export important data and retain downloaded story backups. No paid hosting, billing enrollment or account creation is performed by this repository's scripts.

#### Activation checklist for the site owner

1. Sign in at [Supabase](https://supabase.com/dashboard), create a **Free** project, and save the project database password in your password manager. Record its 20-character **project reference** (from the dashboard URL), not an API key. Your Supabase dashboard login is different from your game administrator login.
2. In **Authentication → URL Configuration**, set both Site URL and an allowed redirect URL to exactly `https://evil0ctopus.github.io/grim-gatherings/workshop.html`. Keep email confirmation enabled. Email login links are consumed by the workshop and removed from the address bar; expired links display an error rather than pretending to log in.
3. Configure email delivery **before inviting public authors**. Supabase's [built-in SMTP](https://supabase.com/docs/guides/auth/auth-smtp) currently only sends to project-organization/team addresses and allows **two emails per hour**, with no delivery guarantee. Public confirmations and password resets require **custom SMTP**. A provider's free tier may be suitable, but sender/domain verification and provider quotas apply. Enter SMTP credentials only in Supabase's secure Auth settings, never in Git, browser code or chat. Do not disable confirmation to bypass this limit.
4. From this repository on a computer with Node 24.13+, run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File tools\deploy-supabase.ps1 -ProjectRef YOUR_20_CHARACTER_REF
   ```

   This invokes pinned Supabase CLI 2.119.0, browser sign-in, project linking, database migration, server configuration and Edge Function deployment using the API (no local containers needed). Use secure CLI prompts for credentials. It checks the deployed database/function health and CORS **before** changing `js/community-config.js`. Registration is **closed** by default. Supabase supplies its own server keys to the function; no service key is written into the website.
5. In **Authentication → Users**, create your own email/password game account using a unique password. Verify its email (or use the dashboard's explicitly confirmed-user creation option for your own owner account). Log in on the workshop once its frontend endpoint is published. In the project's **SQL Editor**, paste `supabase/promote-admin.sql`, replace `REPLACE_WITH_YOUR_EMAIL` with that exact verified account email, and run it. This is the only administrator bootstrap; setting `role` in public signup metadata cannot grant administrator rights. Sign out/in to refresh the workshop display. Never use test accounts/passwords in production.
6. Review the changed frontend configuration, commit and push it to `main` to deploy GitHub Pages. Once connected, test owner login, an author account, cross-device draft restoration, submission, approval, public story selection and a confirmation/password-reset email before announcing public availability.
7. After working email delivery is confirmed, open registration:

   ```powershell
   npx --yes supabase@2.119.0 secrets set --project-ref YOUR_20_CHARACTER_REF GG_REGISTRATION=open
   ```

   To close signup again, set `GG_REGISTRATION=closed`. Existing users can still log in. Configure Supabase Auth abuse/rate-limit controls; API errors and throttling are shown explicitly. Auth requests are proxied through the function, so shared upstream Auth rate limits may affect busy events.

Only after activation should `COMMUNITY_PROVIDER` be `supabase`, with `COMMUNITY_API` set to `https://YOUR_20_CHARACTER_REF.supabase.co/functions/v1/community`. The deployment helper sets both only after a successful health check. No anon key or service-role key is needed in the browser.

#### Data and authentication boundaries

- Every protected API route verifies the access token with Supabase Auth. Database roles come from trusted `gg_profiles`, never browser metadata.
- All community tables have RLS enabled. Anonymous/authenticated browser roles cannot directly read/write tables or call RPCs; the server's service role calls narrow transactional RPCs. Saved revisions and submitted versions are immutable, with owner checks, optimistic save conflicts, write throttling and audited moderation.
- Public catalog responses include only approved playable stories and public author credit. Account emails, passwords, raw drafts and moderation history are not published.
- Sessions and rotating refresh tokens are stored in the current tab's session storage, not in story data. Temporary outages retain the session; invalid credentials require login. Logging out revokes Auth refresh sessions, but an already issued Supabase access JWT can remain valid until its configured expiry.
- Keep `verify_jwt = false` for this mixed public/protected function: health, catalog and login must work anonymously. Protected requests are independently verified by the handler; simply decoding client JWT claims is not sufficient.

#### Local verification without a hosted account

```powershell
npm ci
npm run check:edge
npm run test:supabase
node tests\supabase-e2e.mjs
npm run test:workshop
```

The database tests execute the actual PostgreSQL migration using PGlite, including privileges and role enforcement. Hosted-workflow browser tests use the actual Edge handler and PostgreSQL with **simulated Auth transport**, not real Supabase emails or a live project. The Deno check validates the actual Edge import/type graph. Neither these tests nor a successful static Pages deployment prove hosted signup/email delivery until the activation checklist is completed.

### Alternative: running the Node shared-story service

GitHub Pages cannot run a database or login API. The private workshop works there independently; cloud/account buttons report an explicit unavailable-service message until a backend is connected. This repository provides the backend but does not provision a hosting account.

Requires **Node 24.13+** (built-in SQLite; Node may emit an experimental SQLite warning), no additional runtime packages. For local setup in PowerShell, use a unique admin username and enter a long password without putting it in source code or command history:

```powershell
$env:GG_ADMIN_USERNAME = 'site-owner'
$secret = Read-Host 'Initial admin password (12+ characters)' -AsSecureString
$env:GG_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $secret).Password
node server\community.mjs
```

Open `http://127.0.0.1:8132/` for the game or `http://127.0.0.1:8132/workshop.html` for creation/approval. The admin is created once; subsequent starts preserve the stored password and do not promote an existing author. Stop with Ctrl+C, then remove the bootstrap password from the shell with `Remove-Item Env:GG_ADMIN_PASSWORD`. Never use the test credentials from the test suite on a real service.

Production requires a Node host with a **persistent writable disk**, one service instance, HTTPS and backups. Either serve the whole site from this service (simplest, same-origin), or keep GitHub Pages and configure:

- `PORT`, `HOST` (default `127.0.0.1`; hosting platforms may need `0.0.0.0`).
- `GG_DATABASE_PATH`: absolute database path on persistent storage; default `data/community.sqlite`. The data directory is git-ignored and not publicly served. Keep SQLite, WAL and SHM together; stop the service before copying a backup, or use a SQLite-aware online backup tool.
- `GG_ADMIN_USERNAME` / `GG_ADMIN_PASSWORD`: initial administrator bootstrap, stored as a salted scrypt hash, not plaintext. Set securely in the hosting service, not a committed file.
- `GG_ALLOWED_ORIGINS`: comma-separated exact frontend origins, for example `https://evil0ctopus.github.io`. Include the public service origin when using an HTTPS reverse proxy. Do not use `*`.
- `GG_REGISTRATION=closed` optionally disables new author accounts.
- Set `COMMUNITY_API` in [js/community-config.js](js/community-config.js) to the backend's HTTPS origin when Pages is the frontend, then redeploy the static site. Never put passwords or API keys there. Leave it empty for same-origin hosting.

Account sessions are random bearer tokens, hashed in the database, kept in the current browser tab's session storage, and expire after 24 hours. Passwords use salted scrypt hashes. Logout revokes the session. Authentication is throttled; account writes are rate-limited. Each request is at most 1 MB and each draft at most 750,000 characters. There is no email/password-reset service; authors should keep their credentials. The site operator can reset an account using `tools\reset-community-password.mjs`: stop the service, set `GG_ACCOUNT_USERNAME`, enter a new password securely into `GG_NEW_PASSWORD`, use the same `GG_DATABASE_PATH`, run the tool, then remove those password environment variables. This revokes that account's sessions. Review hosting costs, backups, abuse handling and applicable publishing/privacy requirements before inviting public submissions.

Validation:

```powershell
node --test tests\workshop.mjs tests\community.mjs
node tests\workshop-e2e.mjs
node tests\workshop-static-e2e.mjs https://evil0ctopus.github.io/grim-gatherings/
```

The browser suite uses a temporary local service and separate author/admin browsers, exercising editing, history, private saves, submissions, approval, unchanged published snapshots, cross-device drafts, community game selection and unpublishing. It does not send story data to a real AI service.

## How to play (for the host)

1. Open the site on the device that will be the narrator screen (laptop/tablet, ideally on the TV). Tap **Create a new game**.
2. Add each player by name with **Add player**; optionally add a short description. Choose a story under **Ready-to-play mysteries** (or paste a story JSON / generate with AI).
3. Review the story and assign players. Choose **Tell the murderer they are the murderer**: off by default, so everyone investigates without advance knowledge. On notifies only that character. This setting persists with the game and saved story, affects only the notification, and never changes the solution or public clues. Tap **Open the doors**.
4. Guests scan the QR code, tap their assigned name, and meet their character.
5. When everyone has joined, begin Round 1 and read the **complete narration** aloud. Every player then reads their **Read aloud to everyone** clue verbatim, including a notified murderer. Each character receives exactly one accusation. Discuss the spoken evidence, then vote. Players may question interpretations but must not invent new story facts. Scripted clues are not votes.
6. Vote after every round. After the last round's vote, watch the live tally, then hit **Reveal the killer**. The room bar keeps connection status separate from a compact voting summary. Click or tap that summary (or focus it and press Enter) to open the complete suspect history below the bar: round leaders, each suspect's cumulative vote share, change in percentage points, and per-round counts. Phones show a short **Votes · percentage** label; the expanded history shows the full names. The bar stays the same height.
7. Keep the host screen open the whole game. Refreshing it is safe (the game is saved on that device); guests reconnect automatically.

Guests who refresh, lock their phone, or lose signal just reopen the same link — they're put straight back on their character and the current round.

### Joining and recovering a connection

- Guests can join an **already-running game**, including during a round, voting or the reveal. A remembered phone returns to its character and the latest released evidence; a new phone selects an available name.
- A player is shown as **connected** only after receiving the host's game state, not merely opening a network channel. Signaling and channel opening have 12-second deadlines; missing initial state has a 10-second deadline. Stalled attempts retry with a fresh peer while retaining the saved identity. Lost action acknowledgments also trigger state recovery rather than leaving "Opening your packet" or "Sending your vote" indefinitely.
- Player screens include **Reconnect to room**. Use it if automatic recovery is taking too long; it keeps the same room and player token. Last received clues remain readable while disconnected, with a warning, and voting/character changes are disabled until reconnection.
- Hosts have **Reconnect room**. This reopens the **same room code**, preserving the round, character claims and ballots. It temporarily interrupts phone connections; guests reconnect automatically. Do not start a new game just to repair a connection.
- iPhone-style page restoration, returning to a browser tab, and offline/online changes trigger recovery. Keep the host device awake and its game page open. A sleeping or closed host cannot serve new connections until it returns.
- Use **one active game tab per phone**. If another tab reconnects using the same saved identity, it takes over; the previous tab displays a notice and stops automatic retries so they do not fight over the character. Tap **Reconnect to room** in the tab you want to use.
- If the host **releases** a character, the old phone returns to the name picker; the same phone or a replacement can select it again, even mid-round. Releasing or switching characters does **not** erase any character's submitted ballots. The next holder can change that character's current-round vote while voting is open.
- For persistent failures, confirm the **room code** and that the host shows **Live**, then try Wi-Fi or mobile data. Unsupported browsers display a specific WebRTC error rather than retrying indefinitely; use an up-to-date Safari or Chrome browser instead of an embedded app browser. A broker outage or network that blocks WebRTC cannot be repaired by resetting characters.

Every mystery must have **5 or 6 rounds**; all built-in editions have five. Their read-aloud assignments are written and stored in advance and never rebuilt during play. Blackwater Row rotates each reader through all three other characters by Round 3, then continues changing targets. Clues progress from initial circumstances and suspicion, through linked documents and timelines, to round 4 corrections and round 5 conclusions. Later evidence explains earlier behavior rather than inventing convenient alibis. Story events are spoken in evidence and narration; no acting is required.

Player screens grow with the investigation. **How the evidence against you has changed** collects released clues about the character. **The room's evidence notebook** retains the **complete spoken narration** and every read-aloud clue at voting. The current narrator text is also available on phones; each current script stays with its reader until voting. Future chapters remain locked. Corrections are evidence to assess, not automatic innocent/guilty badges. Refresh and rewind reconstruct the released history. PeerJS binary chunking supports the larger notebooks.

Vote share is the percentage of all ballots cast across the released rounds, not a statistical probability of guilt. Every submitted round ballot has equal weight; changing an accusation replaces that player's ballot for that round. Ties are displayed as ties, and the change compares cumulative share with the previous round's cumulative share. Missing votes are not counted as abstention ballots. The host can close an incomplete vote after a warning. Previous-round navigation retains that round's ballots; reopening its voting permits corrections. History and ballots survive refresh. Only aggregate counts are sent publicly, not who voted for whom. Final win/lose feedback uses the final round's votes, not the cumulative trend.

Players can use **Leave game → Home** at any stage, including the reveal. Connected players release their character before returning home; if disconnected, the host may need to release it manually. Leaving does not end the gathering for others. Hosts have **End game → Home**, with confirmation, to end the gathering for everyone. After the host ends it, players see **Return home**.

**My Stories** is stored in this browser, not a shared account. A saved catalog edition retains its exact count and all its required characters. Custom stories without edition metadata may still mark supporting roles optional, with the killer and essential evidence required. Gemini's free API tier has limits and is separate from ChatGPT; review Google's [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [data terms](https://ai.google.dev/gemini-api/terms) before using it.

## History-inspired starter mysteries

| Mystery | Players | Atmosphere |
|---|---|---|
| **The Ashes of Mercy Hollow** | 3–8 (6 editions) | Salem-style witch-trial panic, forged confessions and village secrets |
| **Footsteps Above Blackthorn Farm** | 3–9 (7 editions) | An isolated farm, an attic intruder and a suspicious land sale; loosely inspired by Hinterkaifeck |
| **The Last Will at Briar House** | 3–10 (8 editions) | Victorian New England family tension, missing legal papers and a false alibi; loosely inspired by the Borden case |

These are original fictional mysteries, not reconstructions of real murders or claims about real suspects. Deaths occur off-screen; there is no graphic violence. The witch-trial story treats persecution and false accusations as injustices, not proof of witchcraft.

Each has five narrated event rounds, public clues, evolving suspicion, voting and a reveal based on evidence already spoken. **There is one committed, standalone edition for each exact player count**, not a larger story trimmed at runtime. Each edition specifies its entire cast, narration, investigation handoffs and five complete clue assignments (single circles by default; Blackwater Row uses the explicit rotating mode described below). Everyone is required and reads a unique clue and receives an accusation each round. The central crime remains the same, while the involvement and evidence presentation are written for that edition. Three-player editions explicitly introduce the recorded accounts of absent witnesses; no absent player or secret packet supplies essential evidence. Tone is suspenseful, clear and PG-13 for mixed-age groups (13-50).

Add your players and choose **Play this mystery**. The assigned roster count selects the exact edition; review shows its identity. Phone connections, refresh and votes never reselect or alter it. Save/export retains only that edition and its exact count. For a different count, start from the original catalog; a saved four-player edition cannot be resized to five. Host edits remain possible without changing the catalog.

Ravenmoor also has fixed editions for **3–24 players (22 editions)**, preserving its previously supported larger parties rather than removing them. The lighthouse JSON example remains a standalone three-player mystery.

### Melissa's mystery: The Barber of Blackwater Row

Add **exactly four players**, then select **The Barber of Blackwater Row** under **Ready-to-play mysteries**. A separate narrator does not count as a player. The required cast is Xander Hale (woodworker), Marla Quinn (baker's assistant), Jasper Crowe (tavern musician) and Lydia Vance (schoolteacher).

The five rounds investigate the baker, barkeep, senior teacher, lamplighter and Mayor, followed by the final vote and reveal. Each death is described as a slashed throat, without graphic detail. **Revision 2** rotates targets every round: Xander reads about Marla, Jasper, Lydia, Marla, Jasper; the other readers follow the same offsets. Everyone reads about each of the other three characters by Round 3, and every character is discussed once each round. Rounds 2 and 5 use reciprocal pairs rather than a single circle to make complete four-player coverage possible. All player clues concern other players.

The adaptation includes named witnesses, recognizable possessions, timed observations and records explaining how a trace is tied to its owner. For example, the flour print is compared with an identified repaired boot and later with its documented closing chore; an amber smear has two possible work-related sources rather than proving guilt by color alone. Xander's true identity and the Mayor's connection first appear in **Round 5**, never in introductions or early packets. Host scene narration does not preview the deductions in player clues; those arrive in their assigned readings. During play, hosting instructions are collapsed and labeled **do not read aloud**, and the full solution is absent from round screens. Story review is preparation only and contains future chapters and spoilers. Leave murderer notification off for a fully unspoiled investigation; turning it on tells the killer their status, but does not reveal the hidden identity or history early. The final reveal includes an optional host-read monologue. Themes include wrongful imprisonment, coercion and revenge.

Review, reassign, save and export it using the existing controls. Saved copies retain the exact four-player edition. This hand-authored script is maintained directly in `js/editions/blackwater-row.js`; the offline authoring command for the other families does not regenerate it.

Existing saved or active games are not silently rewritten. To play revision 2, start a new game from the ready-to-play catalog; a previously saved revision 1 keeps its old script and assignments.

The browser imports committed scripts from `js/editions/`. `node tools/author-editions.mjs` is an **offline authoring step**, not game-time generation. It uses the curated public story sources and count-specific staging to write standalone edition files. Review narrative changes and run all edition audits before committing regenerated files. The app never imports the historical authoring sources or invokes circle generation for built-in selections. Custom JSON without edition metadata retains the existing optional-cast support; it is not represented as an authored catalog edition.

Old adaptive saves bearing the original built-in titles are retired when the updated site loads, so they do not reappear instead of the fixed editions. Fixed-edition saves and unrelated public custom stories remain available.

Unit checks: `node --test tests/player-connection.mjs tests/host-sessions.mjs tests/blackwater-row.mjs tests/editions.mjs tests/public-playthrough.mjs tests/saved-content.mjs tests/progression.mjs tests/accusations.mjs tests/library.mjs tests/starters.mjs tests/atmosphere.mjs tests/manor.mjs tests/backdrops.mjs tests/ambient.mjs tests/voting.mjs`.

Connection recovery regression: `node tests/reconnect.mjs [url] [chromium|webkit]`. This uses an iPhone-sized browser profile and real PeerJS connections, deliberately exercising Round 3 page restoration, reloads, duplicate tabs, release/reclaim during play and voting, late joins, host room recovery, offline/online changes, missing-state handshakes and fresh-room joins. Chromium runs on Windows; run the WebKit transport variant on a platform whose Playwright WebKit build implements WebRTC (the Windows build does not). Emulation does not replace testing on a physical iPhone.

Unsupported-browser regression: `node tests/browser-support.mjs [url] [chromium|webkit]` verifies that hosts and players get actionable errors, without automatic retry loops, when WebRTC is unavailable.

Browser integration (requires Playwright): `node tests/e2e.mjs [url] [playerCount=4] [mysteryId=sample] [discloseKiller=false]`. Mystery IDs are `sample`, `mercy-hollow`, `blackthorn-farm`, `briar-house`, `blackwater-row` (exactly four players) and `example` (the three-player lighthouse import). For example, `node tests/e2e.mjs http://127.0.0.1:8128/ 10 briar-house false` connects a separate phone for **every** listed player through all five rounds, refresh/reconnection and the reveal. Tests also exercise the live host notification toggle and complete narrated notebooks. Unit audits check both notification settings for every included character at every supported count; browser tests exercise four-player and full named casts.

Full edition browser matrix: `node tests/editions-e2e.mjs [url] [absolute-log-directory] [concurrency=3]`. It plays all 44 committed editions through all five rounds with every character connected. Use concurrency `1` on machines with limited memory; the largest Ravenmoor editions open up to 25 browser contexts per game.

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
| `schemaVersion` | number | `2` (public-only stories) |
| `clueRouting` | string | optional: `circle` (default) or `rotating`. Both require one unique clue per target per round and no self-targets. `rotating` allows reciprocal pairs, changes targets every round and covers each other character before repeating (or as many as fit the chapter count). |
| `discloseKiller` | boolean | optional, default `false`; host's murderer notification toggle |
| `edition` | object | fixed editions use `{family, id, playerCount, revision}`; exact count must match the cast and all characters are required |
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
| `rounds` | array | one entry per story round: `{"readAloud": {"accuses": "otherId", "text": "Observed event about {otherId}..."}}` — unlocked when the round starts |

Placeholders: in any text, `{someId}` becomes that character's name plus guest, e.g. `{wick}` → "Jonah Wick (Mike)"; `{victim}` becomes the victim's name.

`readAloud` is mandatory. Each target must receive exactly one clue per round, with no self-targets or repeated text. By default, targets form one complete circle. With `clueRouting: "rotating"`, reciprocal pairs are allowed to support full reader coverage; each reader changes targets every round and covers the available other characters before repeating. Evidence must describe concrete events, sightings, objects or documents, not generic suspicion. Private `clues`, `backstory`, `secrets` and `motive` content is rejected on import: author that information into the spoken chapters or scripts and remove the private fields. The app never guesses how to merge a private confession into public evidence.

Write evidence with `{targetId}` and establish its source aloud. In fixed editions, the assigned reader and clue circle stay exactly as authored. For custom optional-cast imports only, objective evidence can move between readers when the cast is reduced; avoid reader-specific eyewitness claims in those custom stories.

On loading the update, pre-version-2 saves and saves containing private story fields are removed from this browser, with a notice. Version-2 public-only stories, drafts, player preferences and AI settings are retained. Cleanup runs when each device opens the updated site; downloaded files and offline devices cannot be erased remotely. Start a fresh game from the rewritten catalog. Old imports require an authored public rewrite before validation will accept them.

Authoring tips: plan the full timeline first; give each new fact a spoken source and discovery; distinguish witness claims from established findings; revisit early suspicions without inventing alibis; make the final reveal interpret already released evidence. Never put a confession in character text: the app alone supplies the optional murderer notification. Everyone reads their script exactly, with one character per guest.

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
- The host filters unreleased evidence and the solution before sending to phones. There is no private story evidence. This remains a party game, not a security product (anyone with the room code can claim an unclaimed character).
- AI generation calls the API straight from the browser; some providers block browser (CORS) requests. Story quality depends on the model; review before starting.
- Character names in the built-in mystery are gendered; anyone can play anyone, or edit names on the Review screen.
