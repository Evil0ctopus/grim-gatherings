# Grim Gatherings

A murder-mystery party web app with an owner-maintained story catalog and a
separate, randomly dealt Mafia game.

**Production:** https://grimgatherings.com/

**Testing:** https://evil0ctopus.github.io/grim-gatherings/

## Current catalog and story ownership

Visitors choose a finished story, enter their player names and assign
characters. They cannot write or edit story content, generate stories with AI,
import/export story files, save their own story editions or submit community
stories. The site owner adds and revises stories through VS Code.

The free catalog contains four five-player mysteries:

- The Last Seance at Ravenmoor.
- The Ashes of Mercy Hollow.
- Footsteps Above Blackthorn Farm.
- The Last Will at Briar House.

**Blackwater Row is withdrawn pending a rewrite.** Its source remains in
[`js/editions/blackwater-row.js`](js/editions/blackwater-row.js), but it is not
imported by the catalog or available to resume. Saved rooms using withdrawn or
non-catalog stories return to story selection with their player list preserved.
Previously stored drafts and community database records are not deleted.

The old [`workshop.html`](workshop.html) address now serves accounts only, so
existing account, purchase and password-recovery links keep working. There is
no public workshop or JSON editor behind a direct link. The retired drafts,
submissions, community catalog and moderation API routes return HTTP 410.
Deploy the updated Supabase `community` function to apply that backend change;
updating static pages alone does not change an already deployed function.

## How to play

1. Choose **Create a new game**, add exactly the players required by the story,
   then choose a mystery.
2. Review the read-only story and assign players to characters. Atmosphere and
   optional murderer notification remain host settings, not story editing.
3. Open the lobby and share its QR code or room link. The host reads the setup
   and everyone reads their character card. Optional introduction discussion
   can follow.
4. Read each chapter, then follow the **Who's reading** window. It shows the
   current character and assigned player, not the full clue-chain diagram.
   Mark each clue read to advance the reader.
5. Discuss and vote after every round. Finish with final accusations, a final
   vote and the complete fixed-story reveal.

Removing the chain diagram does not change the authored reading order or clue
coverage. Everyone still reads one clue about another character per round.
The first N-1 rounds cover every other character exactly once; extra beats can
repeat only after coverage and with an authored explanation. Ghost parts exist
only when the story calls for a dead player character to return.

Game progress saves automatically in the host's browser. Keep that device
connected, open and awake: free rooms use PeerJS/WebRTC and the host is their
hub. A screen wake lock cannot keep a closed laptop or suspended browser alive.
Guests retain their last character/clues and retry when the host returns.
Reloading or returning home preserves progress; **Resume** restores the room.
New-room creation, story replacement and ending a game ask for confirmation.
These are accessible, gold-on-black in-app dialogs (Cancel is focused first,
Escape cancels); no blocking browser confirmations are used. The turn banner
announces the next reader to screen readers. The single home Join field routes
free and premium story codes automatically.

See the [hosting and joining guide](how-to-play.html), [privacy notice](privacy.html)
and [terms](terms.html). The [support tracker](https://github.com/Evil0ctopus/grim-gatherings/issues)
is public: do not post passwords, account details or live room links.

## Mafia

[`mafia.html`](mafia.html) is a separate hidden-role game and does not use the
fixed narrative-story loop. Enter player names; roles scale to the group and
shuffle every game. Everyone's-phone mode and one-phone narrator mode remain
available. The narrator console guides night actions, uses synthesized sounds,
counts votes, checks wins and re-deals on Play Again.
Visiting Mafia does not create a new room: choose **Create a Mafia room** or
narrator mode first. Table settings start collapsed. Mafia teammates always
know each other in this standard ruleset; this is not a configurable variant.
Selected night targets show a distinct highlight, a Selected label and an
accessible pressed state.

## Premium games and accounts

The **Shadow Societies: Two-Game Bundle** costs **$9.99 USD once** and includes
The Lanternfall Covenant and The Black Ledger Society. Each story has exactly
five players and uses the same universal narrative flow. Lantern/ward evidence
and counterfeit-ledger evidence are story-specific mechanics on that loop.
Secret faction/night-action gameplay is not part of these stories.

One purchasing host creates a premium room; guests join free without accounts.
The server controls phases and validates readers/voters. Rooms expire after
24 hours, with up to three active rooms per host. Reconnect in the same browser
using the private seat token. Optional pass-and-play remains available.
The shop shows the product before sign-in and uses one consent-gated PayPal
checkout button. Hosted PayPal checkout may offer eligible card payments.

Purchases are account-bound, not bound to a matching PayPal email. Only
server-verified completed payments unlock access. Signup and purchases never
grant administrator privileges. Refunds/disputes suspend access. Live checkout
is production-origin-only; sandbox purchases are administrator-only and isolated
from live purchases. See [payment operations](PAYMENTS.md) for merchant setup,
activation gates, webhooks, reconciliation and refunds.

Administrators can open **Developer playroom** from their account to test both
premium stories. This owner-only signed sandbox never charges or grants purchase
access. Rules and resolution live in server modules, not the static build.
Server source remains visible in the GitHub repository.

## Maintaining stories in VS Code

Edit or add a complete committed story in [`js/editions/`](js/editions/), then
register it in [`js/starters.js`](js/starters.js). The sample uses
[`js/sample.js`](js/sample.js). Each story has one fixed cast and must provide
setup, character cards, event map, hidden thread, event-derived mechanics,
two-part evidence, round schedules, final accusations and a fixed reveal.
Developer-only drafting and review helpers remain in
[`tools/story-core.mjs`](tools/story-core.mjs), excluded from the website build.

The internal story object/schema remains necessary to run and validate games;
removing the visitor-facing JSON tools does not remove that data format.
[`examples/example-story.json`](examples/example-story.json) is a developer
example, not a website import option. Validate through
[`js/story.js`](js/story.js) and the story/coverage tests before adding a story.
Do not invent missing submitted content or regenerate clue schedules at runtime.

## Static builds and releases

The site uses plain HTML/CSS/JavaScript modules. Node 24 is required for tooling.
`npm run build:site` creates disposable `dist/` output containing only the HTML
entry points and `assets/`, `css/`, `js/`, and `vendor/`. Server modules, tests,
tools and `.local-private/` are excluded. Never upload the whole local checkout.
Keep passwords and keys in a password manager; `.local-private/` is not encrypted.

GitHub Pages deploys `main`. Cloudflare Pages uses `npm run build:site`, output
`dist`, Node 24 and the `production` branch. Automatic preview builds are
disabled. Test the committed `main` release, then fast-forward `production` to
the tested commit. Do not force-push over another release. Verify live assets
on both sites after promotion.

Both sites share the Supabase backend. Use simulated local Auth/database tests
for destructive experiments. Deploy its Edge Function separately:

```powershell
npx supabase functions deploy community --no-verify-jwt
```

The handler verifies authentication itself. Keep Supabase/PayPal secrets on the
server; never in the static bundle. Backend environment setup includes
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`GG_ALLOWED_ORIGINS` and `GG_SITE_URL`. Public registration does not assign the
trusted administrator role. Existing database migrations retain legacy records.
The optional local SQLite service supports accounts and developer testing, not
payment checkout.

Production uses the owner's private Cloudflare Web Analytics. Visits/page views
are approximate metrics, not unique people or completed games. Do not add story
text, room codes, account details or authentication tokens to analytics events.

## Verification

```powershell
npm run build:site
npm run test:site
node --test tests/starters.mjs tests/editions.mjs tests/accusations.mjs tests/public-playthrough.mjs tests/blackwater-row.mjs tests/community.mjs
npm run test:catalog-browser
npm run test:visitor
npm run test:navigation
npm run test:developer
npm run test:developer-browser
npm run test:supabase
npm run test:payments
npm run test:payments-browser
npm run test:premium-rooms
npm run test:premium-rooms-browser
npm run check:edge
```

Browser fixtures use simulated transport or payment providers where documented;
they are not proof of real payment eligibility or physical-device compatibility.
Human mystery-quality and Mafia balance/fun testing remain necessary.

## Limitations

- Each device needs internet. Free rooms depend on PeerJS's public broker and
  browser WebRTC; restrictive networks can block connections.
- Free rooms are not always-on server rooms. Device sleep or host disconnection
  pauses them until reconnection.
- Browser storage can be lost. Public story downloads and cloud draft editing
  are no longer available.
- Story correctness and playability require authored content and human review,
  not only schema/coverage checks.
