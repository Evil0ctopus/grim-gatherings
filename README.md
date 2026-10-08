# 🕯️ Grim Gatherings

A murder-mystery party web app. Every story, including premium stories, follows the same fixed-count flow: read-aloud setup and character cards, precomputed target-chained clue rounds, discussion and a vote after every round, final accusations and vote, then a fixed full-story reveal. Clues are public evidence about another character; story-specific mechanics come from that story's events. One host buys premium access and guests join free.

**Production:** https://grimgatherings.com/ (new DNS may take time to propagate)

**Testing:** https://evil0ctopus.github.io/grim-gatherings/

See [the roadmap](ROADMAP.md) for Stage 1 launch verification and Stage 2
monetization. Domain registration alone does not mean the custom-domain website
or public signup is ready.

Local account links and setup notes may be kept in `.local-private/`. That folder
is ignored by Git and excluded from the static-only website build. It is
not encrypted, does not belong in public archives, and needs a separate private
backup. Keep passwords and secret keys in a password manager, not in these notes.

### Static deployments and traffic monitoring

`npm run build:site` creates a disposable `dist/` folder containing only the game
HTML and `assets/`, `css/`, `js/`, and `vendor/`. It requires Node 24 and no package
installation. GitHub Pages uploads that output, not the repository root. Never
upload the entire local checkout to Cloudflare: it contains ignored local files.
`npm run test:site` checks the packaging exclusions and workflow.

For Cloudflare Pages, use `npm run build:site` as the build command, `dist` as
the output directory, Node 24, and an approved `production` branch. Do not enable
automatic production deploys from `main` if GitHub Pages is the testing site.
The `grim-gatherings` Pages project is configured this way, with automatic
preview-branch builds disabled. The custom domain is active with SSL enabled;
ordinary browser, DNS, and HTTPS access were verified on October 5, 2026.

To release, first test the committed `main` version on GitHub Pages. Only after
approval, fast-forward `production` to that exact tested commit and push that
branch. Never force-push over another release or merge untested changes merely
to trigger deployment. Check Cloudflare's successful deployment and the live
assets after every promotion. Updating `main` alone does not update production.
The two sites still share the existing Supabase backend: use local simulated
Auth/database tests for destructive backend experiments until a separate test
project is provisioned.

Production traffic monitoring uses the owner's private Cloudflare Web Analytics
dashboard. A hostname entry has been created for grimgatherings.com with automatic
setup. Browser smoke checks verified home/workshop beacons receive HTTP 204,
and the private dashboard displayed 4 visits and 5 page views during setup
verification (including our test visits).
Keep testing traffic separate and check production hostname
filters. If automatic injection is unavailable for the final hosting arrangement,
configure one beacon through Pages or a manual snippet, not multiple overlapping
installations. No analytics credential belongs in this repository.

Visits and page views are approximate traffic metrics, not unique-person counts
or completed games. Ad blockers and bots affect results. Do not add story text,
account details, room codes, or Auth tokens to analytics events. Review the
[Cloudflare analytics documentation](https://developers.cloudflare.com/web-analytics/)
and verify actual collection before claiming the counter is live.

- The existing game and private workshop need no server, account or build step: plain HTML/CSS/vanilla JS (ES modules) on GitHub Pages. Shared drafts, submissions and approval use Supabase (the preferred free hosting route) or the optional Node community service.
- Real-time sync over WebRTC using [PeerJS](https://peerjs.com/) and its free public broker; the host's browser is the hub.
- Includes four ready-to-play mystery families, each with one fixed five-player story. Zero AI setup needed.
- Import/export story JSON (format below), so stories can be written by hand or by any AI assistant.
- Optional: generate a story with Google Gemini's free API tier (requires your own API key; stored only in your browser). Other OpenAI-compatible services can be configured in advanced settings.
- Save authored mysteries in **My Stories** and reuse them later in the same browser.
- **Story Workshop:** guided creation, repeatable editing, version history, reusable AI prompts, private playable saves, and an account-backed submission/approval workflow when the community service is connected.

### Visitor guidance and host availability

The home screen and [how-to-play guide](how-to-play.html) explain preparation,
joining, round voting and the final reveal. Home/workshop footers link to the
guide, public GitHub support tracker, [privacy notice](privacy.html) and
[terms](terms.html). The support tracker is public: never post credentials,
account details or live room links there. No unverified support mailbox is used.

Creating a new room or loading a replacement mystery confirms before discarding
the current saved session; cancelling retains it. End game also confirms before
clearing live progress, while saved mystery copies remain. Reveal confirms only
when there are no final-round votes. Both reveal and End/Home were verified in a
real four-guest production match, not inferred from button labels.

The host browser is still the room hub. It requests a Screen Wake Lock while
hosting and reacquires it when returning to the visible game; the UI reports
unsupported/denied/released locks honestly. This is not a background server and
cannot prevent laptop lid closure, device locking, power loss or browser
suspension. Guests retain their character and last clues and retry when the host
returns. Always-on rooms would require a different hosting architecture.

`npm run test:visitor` checks wake-lock lifecycle/races, mobile widths from
320 to 1280 pixels in Chromium/WebKit, information pages, accessible description
uniqueness, save confirmation cancellation/acceptance, no-vote reveal and
End/Home. These browser fixtures stub transport and wake-lock APIs; use
`node tests/reconnect.mjs <url> chromium` and the full gameplay suite for real
PeerJS recovery. Physical-device tests remain separate.

## Story workshop and community publishing

Choose **Build a mystery** on the home screen, or open [the workshop](workshop.html).

The home screen has **My account**, opening [the account screen](workshop.html?account=1) directly. Accounts are optional for free mysteries; guests can join and play without registering. Account storage supports creator draft backups, revision history, submissions and verified premium purchases. Premium phone rooms have temporary server-side match state, not a permanent match archive. For moderation, log in using your game administrator email/password (not your database password), then choose **Approve stories**. Only the trusted administrator role unlocks moderation; public signup and purchases do not grant it. Hiding administrator wording on the landing page is presentation, not access control.

### Owner developer playroom

After signing into the workshop with the trusted administrator account, choose
**Developer playroom**. The two premium stories are available there for owner
testing and in the shop through account-bound purchase access:

- **The Lanternfall Covenant**: occult evidence involving three boundary
  lanterns, rotating wards and visitor observations.
- **The Black Ledger Society**: underworld evidence involving counterfeit
  debts, escrow shields and credit restoration.

Each is written for exactly **five players** and follows the universal story
flow. The lantern and counterfeit-ledger evidence remain story-specific
mechanics layered on that flow; randomized secret factions, night actions,
detention and separate faction win conditions were removed because they formed
a separate gameplay loop.

The owner playroom is **pass-and-play on one trusted owner device**, or solo
testing by controlling all seats. The shop additionally supports phone rooms.
The owner account/device is trusted and can inspect all test data. Refreshing,
closing the page, or logging out discards the in-memory playroom test. Do not
enter real financial or personal information.

The backend checks the database admin role for every catalog and action request.
Rules, roles and game resolution stay in server modules, excluded from the static
website build. Snapshots are signed and bound to the administrator account;
tampering is rejected. They may be replayed by their owner for sandbox testing,
so this is not a durable competitive/anti-cheat or entitlement system. Server
source is still visible in this project's GitHub repository; authenticated play
access does not make repository source confidential.

Run `npm run test:developer` and `npm run test:developer-browser` for engine
and complete five-player browser coverage. Human balance/fun playtesting
remains important; automation does not certify it.

### One-time premium bundle

[Premium games](shop.html) offers **Shadow Societies: Two-Game Bundle**:
The Lanternfall Covenant and The Black Ledger Society, **$9.99 USD once for both**.
One host buys; guests play free. Both stories are written for exactly five
players and use the same setup, read-around, target-chain, discussion/vote,
final-accusation, final-vote and reveal phases as the free stories. Choose
**Host a room** in the shop and share the eight-character code or guest link. Guests use
[premium room joining](premium-room.html) without accounts or purchases. The
host verifies lobby names and advances public phases; each phone presents its
assigned read-aloud card or clue and the current player's vote controls. The
server validates the scheduled reader and voter and protects the fixed reveal
until its phase.
Purchases belong to the signed-in game account across devices, not the PayPal
email. Rooms last 24 hours with up to three active rooms per host. Reconnect
using the same browser's private seat token. Refunds/disputes stop hosted-room
access. Optional pass-and-play retains browser-only signed match saves.
The owner's developer playroom remains independently admin-only.

PayPal-hosted checkout supports PayPal and eligible credit/debit-card guest
checkout. No card fields or merchant secrets are served in the website.
The backend verifies order amount, currency, merchant, purchase reference and
completed capture; return links or PayPal.Me transfers never grant access.
Verified webhooks recover approved orders when the buyer never returns and
handle refunds, reversals and disputes. Buyers cannot change account roles,
payment totals or entitlements. Owner-only payment management lists the latest
50 receipts and can issue confirmed full refunds. Private support is required
before selling; public GitHub issues must not contain receipts or account data.

**Real charging stays disabled until merchant setup and a real PayPal sandbox
test are completed.** Local API/browser tests use a simulated PayPal provider
and real PostgreSQL; they are not evidence of merchant/card eligibility or real
payments. Live checkout is restricted to the production origin; testing can
read purchases but cannot start real checkout. Sandbox purchases are owner-only
and isolated from live purchases.

See [payment operations](PAYMENTS.md) for environment secrets, migration,
webhook setup, activation gates, recovery/refunds, price research and remaining
merchant checks. Run `npm run test:payments`, `npm run test:payments-browser`
and `npm run check:edge`. The optional SQLite community server does not sell
premium access; payments use the hosted Supabase service.

1. Choose a supported fixed player count, a setting and an idea. The workshop derives at least N−1 rounds; add more only when the event arc needs them. Enter exactly one character per player. The player count equals the story's playable characters. In every round each player reads one clue about another player and nobody is talked about twice; the character talked about reads next, and if a loop closes early the next unread player starts a new loop, so every count from 3 upward (odd or even) works. Across the first N−1 rounds every reader clues every other player exactly once. A reader may repeat a target only in extra rounds after full coverage, and only when the story requires it: the submitter must explain why in `coverageRepeatNote`. Story content is intended for teens and adults, not young children.
2. Open the draft. Its complete target chain is preplanned for every round. During the first N−1 rounds, every reader covers every other character exactly once; any later repeated pairs are explicitly marked.
3. Write directly, **Copy story prompt** to a preferred AI, or use a configured AI service. A copy-prompt workflow needs no API key. Import the returned complete JSON. Explicit AI calls send the idea/draft to the chosen provider; provider costs, data policies and limits apply. No other workshop action calls AI. A generation makes one initial call and at most two format-repair calls; unrepaired output is retained for manual correction, not declared ready. **Ask my AI to review the story** is a separate optional narrative-review call; it reports specific suggestions without modifying the story, checking the human-review boxes or granting approval.
4. Edit as many times as needed. Field changes save when focus leaves the field. **Earlier versions** restores a previous snapshot without deleting history. If two workshop tabs edit the same device draft, a stale save reports a conflict instead of overwriting the newer draft; its text is retained in Earlier versions. Reopen the latest draft before continuing, or download a backup. Chapter previews and the solution are collapsed. No fixed revision limit is imposed, but device storage, backend disk space and request-size limits still apply. Download a draft backup for safekeeping; private browsing, browser cleanup or changing origins can lose device-only drafts.
5. Use **Keep these facts hidden until...** for exact-phrase release checks. These check introductions, public blurbs, early narration/cards/phone summaries and the repeated voting prompt. They cannot detect paraphrased or implied spoilers. **Check my story** verifies fixed count, event map, character ties, target chains, coverage, clue components and release rules. The creator must also review evidence sources/recognition/limits, narrative pacing, already-spoken solution proof and content. Changes reset that review. Human review is necessary; automated checks do not certify narrative quality.
6. **Save playable story** creates/updates a private game in My Stories with **User-created** and an author credit. It does not publish. A draft edit does not alter the saved playable copy or an active game. To play, go home, create a game, add the matching player count and choose the saved story.
7. Optionally log in and **Back up to my account** for cross-device drafts and account revision history. Account backups retain incomplete drafts too. Downloads from account history can be imported using the workshop backup format. Concurrent saves use revision checks rather than overwriting another device's work.
8. **Submit for approval** requires a complete reviewed story and explicit permission to publish an original fictional work with account author credit. It saves and submits an immutable version. Later edits need another submission. The author sees pending, requested changes, rejection and publication feedback in Account.
9. The site owner logs in with the administrator account, selects **Approve stories**, previews all chapters/cards and the solution, then chooses **Approve and publish**, **Request changes**, **Reject**, or **Unpublish**. Approving a newer version replaces that draft's previously published version; unrelated stories remain. The approved version appears in **Community stories**, with author credit and a **User-created** badge. It can be added to My Stories or selected directly during game setup. No static-site rebuild is needed for approval.

Built-in stories remain separate. Approval is server-enforced; an author cannot grant themselves admin access or publish by setting a badge in JSON. Story text is displayed as escaped text, not executable HTML. An imported provenance label alone is not proof of website approval: only the backend's approved catalog establishes that.

### Preferred free hosting: Supabase

The website is connected to the deployed free Supabase community service. Public registration is open after live confirmation, password recovery, author permissions, and the submission/approval lifecycle were checked. New accounts require email confirmation and receive no administrator privileges. Private editing and guest gameplay still need no account. Production and testing currently share this backend and its email quotas. The steps below document provisioning a new installation, not rerunning the initial migration against the already-provisioned production database.

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
- Public catalog/health requests never depend on a saved login or session refresh. Concurrent expired-token responses reuse an already refreshed token; changing accounts cancels outstanding actions rather than running them as the new account. A malformed saved login is explicitly reported and cleared without touching drafts. These guards cover the unreliable-network/session-rotation cases described in [Supabase session guidance](https://supabase.com/docs/guides/auth/sessions).
- Keep `verify_jwt = false` for this mixed public/protected function: health, catalog and login must work anonymously. Protected requests are independently verified by the handler; simply decoding client JWT claims is not sufficient.

#### Local verification without a hosted account

```powershell
npm ci
npm run check:edge
npm run test:supabase
node tests\supabase-e2e.mjs
node tests\workshop-storage-e2e.mjs
npm run test:workshop
```

The database tests execute the actual PostgreSQL migration using PGlite, including privileges and role enforcement. Hosted-workflow browser tests use the actual Edge handler and PostgreSQL with **simulated Auth transport**, not real Supabase emails or a live project. The Deno check validates the actual Edge import/type graph. Neither these tests nor a successful static Pages deployment prove hosted signup/email delivery until the activation checklist is completed.

Before enabling public email signup, disable the SMTP provider's click/link tracking: it can rewrite and break Auth links. Some email-security scanners also consume one-time confirmation links before the recipient clicks them; Supabase documents this [email prefetching limitation](https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching). Real confirmation and reset emails must be tested with the chosen provider; persistent scanner failures may require a user-confirmation landing page or OTP workflow, not disabling email verification. Public signup stays closed while SMTP remains unconfigured.

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
- Creating or resuming a game adds a browser-history entry. Safari Back returns
  to the home screen without deleting the saved room; Forward or Resume restores
  it. Returning home closes the host connection until the room is resumed.
  Back/Forward, reload-after-Back, and page restoration are covered in Chromium
  and mobile WebKit by `npm run test:navigation`.
- The production address is `https://grimgatherings.com`. Cloudflare has a
  proxied `www` DNS alias and an active canonical 301 redirect for both HTTP
  and HTTPS `www.grimgatherings.com`, preserving paths and query strings.
  This is a Cloudflare zone rule, not a static-site or Supabase setting.
  A device with an earlier negative DNS cache may need time to refresh.
- Use **one active game tab per phone**. If another tab reconnects using the same saved identity, it takes over; the previous tab displays a notice and stops automatic retries so they do not fight over the character. Tap **Reconnect to room** in the tab you want to use.
- If the host **releases** a character, the old phone returns to the name picker; the same phone or a replacement can select it again, even mid-round. Releasing or switching characters does **not** erase any character's submitted ballots. The next holder can change that character's current-round vote while voting is open.
- For persistent failures, confirm the **room code** and that the host shows **Live**, then try Wi-Fi or mobile data. Unsupported browsers display a specific WebRTC error rather than retrying indefinitely; use an up-to-date Safari or Chrome browser instead of an embedded app browser. A broker outage or network that blocks WebRTC cannot be repaired by resetting characters.

## Universal story flow

Every story, free or premium, uses the same phases: introduction and read-around; clue rounds; deliberation and a vote after every round; final accusations and a final vote; then the complete fixed reveal. The host reads the setup and each player's character card aloud. In every clue round, a reader reads one clue about another character, then that target reads next; the chain continues until everyone has read once. Player-specific clues remain locked until their scheduled turn.

Rounds are derived from the fixed cast: at least **N−1** rounds are required for each player to read about every other player exactly once. Complete target chains and the full reader-to-target coverage matrix are precomputed into the story. Extra event beats may add rounds only after coverage is complete; any repeated pairs are explicitly marked. Nothing about the chain is generated during play.

Ghosts are story-specific, not automatic: a character returns as a ghost only when that story's events call for it. A returning player keeps their chain turn; their short ghost line must advance the story. Other special mechanics likewise come from that story's event map. Clues are target-focused and include an observation plus a physical detail that contradicts the target's explanation. No acting or improvised story facts are needed.

Player screens grow with the investigation. **How the evidence against you has changed** collects released clues about the character. **The room's evidence notebook** retains the **complete spoken narration** and every read-aloud clue at voting. The current narrator text is also available on phones; each current script stays with its reader until voting. Future chapters remain locked. Corrections are evidence to assess, not automatic innocent/guilty badges. Refresh and rewind reconstruct the released history. PeerJS binary chunking supports the larger notebooks.

Vote share is the percentage of all ballots cast across the released rounds, not a statistical probability of guilt. Every submitted round ballot has equal weight; changing an accusation replaces that player's ballot for that round. Ties are displayed as ties, and the change compares cumulative share with the previous round's cumulative share. Missing votes are not counted as abstention ballots. The host can close an incomplete vote after a warning. Previous-round navigation retains that round's ballots; reopening its voting permits corrections. History and ballots survive refresh. Only aggregate counts are sent publicly, not who voted for whom. Final win/lose feedback uses the final round's votes, not the cumulative trend.

Players can use **Leave game → Home** at any stage, including the reveal. Connected players release their character before returning home; if disconnected, the host may need to release it manually. Leaving does not end the gathering for others. Hosts have **End game → Home**, with confirmation, to end the gathering for everyone. After the host ends it, players see **Return home**.

**My Stories** is stored in this browser, not a shared account. Every narrative story has one fixed player count and all of its characters are required. Gemini's free API tier has limits and is separate from ChatGPT; review Google's [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [data terms](https://ai.google.dev/gemini-api/terms) before using it.

## History-inspired starter mysteries

| Mystery | Players | Atmosphere |
|---|---|---|
| **The Last Séance at Ravenmoor** | Exactly 5 (one story) | A staged séance, poisoning and a doctor's hidden connection |
| **The Ashes of Mercy Hollow** | Exactly 5 (one story) | Salem-style witch-trial panic, forged confessions and village secrets |
| **Footsteps Above Blackthorn Farm** | Exactly 5 (one story) | An isolated farm, an attic intruder and a suspicious land sale; loosely inspired by Hinterkaifeck |
| **The Last Will at Briar House** | Exactly 5 (one story) | Victorian New England family tension, missing legal papers and a false alibi; loosely inspired by the Borden case |

These are original fictional mysteries, not reconstructions of real murders or claims about real suspects. Deaths occur off-screen; there is no graphic violence. The witch-trial story treats persecution and false accusations as injustices, not proof of witchcraft.

Each edition has a fixed cast and its own authored event map, clues, target chain, complete coverage schedule, deliberation/vote phases and fixed reveal. There are no scaled-down casts or alternate counts for one script. Every player is required, reads one clue each round and reads about every other character exactly once before any pair repeats. No absent player or secret packet supplies essential evidence. Tone is suspenseful, clear and PG-13 for mixed-age groups.

Add exactly the listed number of players and choose **Play this mystery**. The roster count selects the matching standalone edition; review shows its identity. Phone connections, refresh and votes never reselect or alter it. Save/export retains only that edition and its exact count.

The lighthouse JSON example is a standalone three-player mystery. The four-player **The Barber of Blackwater Row** is a playable starter: rounds 1–3 cover all 12 reader-target pairs exactly once (round 2 reads as two linked pairs), and its five-death event arc needs two further rounds, which repeat pairs as explained in its `coverageRepeatNote`.

The browser imports committed scripts from `js/editions/`. `node tools/author-editions.mjs` is an **offline authoring step**, not game-time generation. It uses curated public story sources and fixed-count staging to write standalone edition files. Review narrative changes and run all edition audits before committing regenerated files. The app never imports the historical authoring sources or generates chains during play.

Old adaptive saves bearing the original built-in titles are retired when the updated site loads, so they do not reappear instead of the fixed editions. Fixed-edition saves and unrelated public custom stories remain available.

Unit checks: `node --test tests/player-connection.mjs tests/host-sessions.mjs tests/blackwater-row.mjs tests/editions.mjs tests/public-playthrough.mjs tests/saved-content.mjs tests/progression.mjs tests/accusations.mjs tests/library.mjs tests/starters.mjs tests/atmosphere.mjs tests/manor.mjs tests/backdrops.mjs tests/ambient.mjs tests/voting.mjs`.

Connection recovery regression: `node tests/reconnect.mjs [url] [chromium|webkit]`. This uses an iPhone-sized browser profile and real PeerJS connections, deliberately exercising Round 3 page restoration, reloads, duplicate tabs, release/reclaim during play and voting, late joins, host room recovery, offline/online changes, missing-state handshakes and fresh-room joins. Chromium runs on Windows; run the WebKit transport variant on a platform whose Playwright WebKit build implements WebRTC (the Windows build does not). Emulation does not replace testing on a physical iPhone.

Unsupported-browser regression: `node tests/browser-support.mjs [url] [chromium|webkit]` verifies that hosts and players get actionable errors, without automatic retry loops, when WebRTC is unavailable.

Browser integration (requires Playwright): `node tests/e2e.mjs [url] [playerCount=3] [mysteryId=sample] [discloseKiller=false]`. Playable mystery IDs are `sample`, `mercy-hollow`, `blackthorn-farm` and `briar-house`, each fixed at five players; `example` is the three-player lighthouse import. Choose only a committed count, such as `node tests/e2e.mjs http://127.0.0.1:8128/ 5 briar-house false`. The test connects a separate phone for every player through target-chained clue release, deliberation, voting, refresh/reconnection and the reveal. It also exercises the live host notification toggle and complete narrated notebooks.

Full edition browser matrix: `node tests/editions-e2e.mjs [url] [absolute-log-directory] [concurrency=3]`. It plays all eight committed fixed-count editions through all five rounds with every character connected. Use concurrency `1` on machines with limited memory; a five-player edition opens six browser contexts per game.

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
| `fixedPlayerCount` | number | **required**; must exactly match the required character cards |
| `hiddenThread` | string | **required**; the story's one event-specific hidden thread |
| `specialMechanics` | string array | **required**; at least one mechanic derived from this story's event map |
| `clueRouting` | string | required: `"rotating"`; target chains are precomputed and validated |
| `discloseKiller` | boolean | optional, default `false`; host's murderer notification toggle |
| `edition` | object | fixed editions use `{family, id, playerCount, revision}`; exact count must match the cast and all characters are required |
| `title` | string | **required** |
| `setting` | string | where/when |
| `atmosphere` | string | optional presentation choice |
| `intro` | string | setup read aloud before the character-card read-around |
| `victim` | object | `{"name", "description"}` — the victim is not played by a guest |
| `rounds` | array | **required**, at least `fixedPlayerCount - 1` entries. Each has `title`, `narration`, `publicText`, `hostNotes`, ordered `events`, a full `chain` of character IDs and boolean `coverageRepeat` |
| `characters` | array | **required**; exactly `fixedPlayerCount` required characters |
| `finale` | object | final accusation narration and neutral `votePrompt` |
| `solution` | object | `killerId` (**required**, must match a character `id`), `explanation`, `revealNarration` |

Each character:

| Field | Type | Notes |
|---|---|---|
| `id` | string | short unique slug, e.g. `"nell"` (auto-generated if missing) |
| `guest` | string | the guest's real name. If empty, guests from the setup list are assigned in order |
| `guestNote` | string | the guest's description; shown to them as "lean into it" |
| `optional` | boolean | must be `false`; every character is required for the fixed cast |
| `name`, `role`, `relationship`, `tieIn` | string | character identity, relationship to the event/person and connection to the story |
| `publicBlurb` | string | what everyone knows — visible to all players |
| `rounds` | array | one entry per story round: `{"readAloud": {"accuses": "otherId", "observation": "...", "contradictingDetail": "...", "text": "..."}}` |
| `ghost` | object | optional, only when this story's events call for the character to return after death; `fromRound` plus one position-aligned `parts` slot per round (empty before return) |

Placeholders in clue text must refer only to that clue's assigned target; `{victim}` or other references should be written as literal names there. In other story text, `{someId}` becomes that character's name plus guest, e.g. `{wick}` → "Jonah Wick (Mike)"; `{victim}` becomes the victim's name.

Each clue round is one complete target chain: a reader's target is the next reader, and the final reader's target returns to the chain's start. The first `N−1` rounds must cover every directed reader-target pair exactly once. Further rounds may repeat only after that complete matrix is covered and must flag `coverageRepeat: true`. No round can skip a player. The site validates the full schedule before play.

Every clue names its target, gives an observation, then a physical detail that contradicts the target's explanation; establish the source aloud. `events` record the ordered beats for that round. Character-card read-around, deliberation and vote after every round, final accusations/final vote, and the full reveal are required phases. The complete chain is stored in the story; no schedule is generated during play. Private `clues`, `backstory`, `secrets` and `motive` content is rejected on import.

On loading the update, pre-version-2 saves and saves containing private story fields are removed from this browser, with a notice. Version-2 public-only stories, drafts, player preferences and AI settings are retained. Cleanup runs when each device opens the updated site; downloaded files and offline devices cannot be erased remotely. Start a fresh game from the rewritten catalog. Old imports require an authored public rewrite before validation will accept them.

Authoring tips: plan the full event map first; give each new fact a spoken source and discovery; derive any special mechanic from this story's events; distinguish witness claims from established findings; revisit early suspicions without inventing alibis; make the final reveal interpret already released evidence. Add ghosts only when the story calls for a dead player character to return. Never put a confession in character text: the app alone supplies the optional murderer notification. Everyone reads their script exactly, with one character per guest.

Full five-round, three-player example: [`examples/example-story.json`](examples/example-story.json), **Death at the Lighthouse**. The land argument implicates the niece early; the logbook later distinguishes that dispute from the shipwreck disclosure. The doctor's silence gains context in round 4, while the key, oil and stair sighting build the final chain. Import this file to inspect the complete narration and each character's read-aloud clues.

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
