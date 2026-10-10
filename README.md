# Grim Gatherings

A murder-mystery party web app with an owner-maintained story catalog and a
separate, randomly dealt Mafia game.

**Production:** https://grimgatherings.com/

**Testing:** https://evil0ctopus.github.io/grim-gatherings/

The homepage uses a detailed sourced gothic cartoon mansion, surrounded by
layered textured grounds, sourced ornate ironwork and candlelight: opening gates,
a one-time approach per page visit,
sheltered candle lanterns, a window silhouette, low fog, two rain layers and
occasional thin, branching vertical lightning striking the distant ground with a soft flash
(first strike around 1.2 seconds, then every 12 seconds; no rapid strobing).
The bolt sits behind the ground, house and trees; its soft sky illumination remains visible above the scene shading.
A dark, billowing textured storm-cloud bank spans the sky around the bolt's origin,
clipped above the mansion's roof so it cannot cover the house.
The driveway, candles and gate opening share the front-step centerline.
Complete framed iron gates connect to masonry pillars and flanking fences.
Detailed sourced withered trees are proportionally scaled and set away from the house; shaded
masonry pillars incorporate its stone texture rather than stretching a small
cutout into a full-height column. The artwork sources are disclosed as AI-generated.
Image credits and licenses appear in the
[About page](how-to-play.html#image-credits). Returning
home does not replay the entrance. Visual effects can be disabled in Ambience;
reduced-motion users receive a still scene without rain or lightning. Existing
storm audio remains independently controlled by the sound settings.

For a reusable breakdown of the artwork, layers, geometry, movement, controls
and adaptation workflow, see the local
[background animation guide](BACKGROUND-ANIMATION-GUIDE.md).

## Woodland Hollow — author-final release

Woodland Hollow is available on both sites for **exactly 14 players**, with the
author's **six rounds** and three-killer ending. The final supplied JSON is bundled
unchanged in [the story asset](assets/stories/woodland-hollow.story.json).
The catalog adapter maps its named clues and reading groups to the existing
phone/host runtime without rewriting the story or re-grading it against the
general rules. Its approved exceptions remain attached to the game.

Deaths never remove a seat: ghosts read the supplied self-memories from the
chapter in which they die, after the living reading groups, and continue taking
part in discussion. Each chapter has all 14 readers. No authored voting setup
was supplied, so discussion advances directly to the next chapter or the
author's ending, which reveals all three killers.

Run `node --test tests/woodland.mjs` and `node tests/woodland-browser.mjs` to
verify data mapping, placeholders, ghost transitions, phone views, saved-room
restoration and the six-chapter host flow. These are integration checks, not a
story compatibility grade.

## Authoritative game rules

[`RULESETS.md`](RULESETS.md) contains the replacement rules supplied by Muse
and Melissa on October 8, 2026. It supersedes earlier reference rules and
separates narrative mysteries from social deduction games. It includes
chain consistency, the chain-ends exception, repeat gaps, authoring-scaffolding
conversion, approved amendments and compatibility grading with an 85% threshold.
Section 34 requires least-invasive repairs: rearrange before adding or
rewriting, leave passing content alone, preserve the solution and evidence
spine, and record the original content and reason for every intervention.
Submission refers to the owner's authoring/review process; public story
submission remains retired.

This update records the supplied specification only. Existing gameplay,
validators and stories have not been migrated to its new requirements, and
automated compatibility grading is not yet implemented. The sections below
describe the current implementation, not proof of compliance with the new rules.

## Current catalog and story ownership

Visitors choose a finished story, enter their player names and assign
characters. They cannot write or edit story content, generate stories with AI,
import/export story files, save their own story editions or submit community
stories. The site owner adds and revises stories through VS Code.

The free catalog contains four five-player mysteries and one four-player
playtesting edition:

- The Last Seance at Ravenmoor.
- The Ashes of Mercy Hollow.
- Footsteps Above Blackthorn Farm.
- The Last Will at Briar House.
- The Barber of Blackwater Row (4 players; back for playtesting).

**Blackwater Row is available again for testing.** Its twenty player clues now
use the same short first-person voice. The longer original witness details are
read in the same round's narration, preserving all evidence and its release
timing. Its four-player cast completes all twelve directed reader-target pairs
in the first three rounds; the authored exception repeats pairs in rounds four
and five because each of the five deaths needs its own chapter. All player
characters remain alive, so there are no ghost roles.
Saved rooms using non-catalog stories return to story selection with their
player list preserved. Start a new Blackwater game for the revised wording;
existing saved games retain their saved story text.
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

In the current implementation, removing the chain diagram does not change the authored reading order or clue
coverage. Everyone still reads one clue about another character per round.
The current validator requires at least four rounds. The latest supplied
reference in [`RULESETS.md`](RULESETS.md) instead requires exactly seven rounds
and describes scalable fixed-count editions. LOCKDOWN and Lago implement seven-round
count-selected editions; existing stories retain their authored round counts.
The owner-approved scalable design preserves the smallest edition as the
master: unchanged base clues and targets, shared chapters, ending and key
evidence. Larger editions add supporting characters and clues, with explicit
reading groups rather than forcing changes to the base loop. Group-aware
validation and automatic count selection are implemented for LOCKDOWN's
owner-approved unfinished playtest and Lago's master-preserving editions.
General authoring support remains pending.
Authors choose reader-to-target pairs from
story events; full directed coverage is not mandatory. Pairs can repeat only in
flagged §6 rounds after all possible pairings have been used, with an authored
explanation. The workshop generator still produces full coverage. Ghost parts exist
only when the story calls for a dead player character to return.
For the replacement chain-ends exception and repeat-gap requirements, see
[`RULESETS.md`](RULESETS.md), sections 5–7.

### Briar House 3–12-player testing editions

The owner requested all ten fixed-count editions of Briar House for testing,
with unfinished-canon disclosure like LOCKDOWN. The source does not specify
the physical murder method; the supplied killer, motive, opportunity and ending
remain unchanged. These editions are **unfinished author playtests**, not a
completed rules-compliant release. The notice appears in selection, host review,
the lobby and player views.

The locked three-player playtest master is
[`tools/story-sources/briar-master.json`](tools/story-sources/briar-master.json).
Edmund Pell, Ada March and Iris Shaw retain exactly the same cards, seven clues,
targets and reading loop across every count. Five original discovery sequences
remain in rounds 1, 2, 4, 5 and 7; rounds 3 and 6 compare already released
records without introducing new discoveries. All 25 original five-player
responses are spoken by the host in their corresponding discovery chapters.
The larger source's existing supporting observations are also spoken in shared
chapters before supplemental readers use them.

The nested twelve-seat order is Pell, Ada, Iris, Beatrice, Felix, Sylvia, Rowan,
Nora, Julian, Marian, Julian's Bank Contact and Ada's Brother. The first ten are
the original named characters. The final two are explicitly **source-linked
comparison readers**, based on unnamed people already referenced in the source.
They are not new suspects placed in the study, and their cards and clues do not
invent names, firsthand observations, travel, attendance or alibis. Treat those
seats as record-comparison roles during the eleven- and twelve-player playtests.
They cannot establish a new opportunity or replace the original evidence.

Run `node tools/author-briar.mjs` to reproduce the editions from the hashed
master. It validates the twelve-player endpoint before producing editions 4–11.
`--check` is read-only; `--create-master` refuses to overwrite the master.
LF checkout attributes protect the master and generated asset on Windows.
Run `node --test --test-concurrency=1 tests/briar-playtest.mjs` and
`node tests/lago-browser.mjs --briar` for validation. Use one browser and one
heavy job at a time, only with at least 4 GB free RAM and 8 GB free virtual memory.
When local headroom is insufficient, the Briar validation workflow runs the
full serial unit suite and all ten complete browser games on GitHub-hosted
runners from the nondeploying `playtest/briar-house` branch. After publication
on `main`, its live job checks exact assets, every count, disclosure and saved
game reload on both websites. Run `node tests/briar-live.mjs --assets-only`
for a lightweight HTTP-only check; the full live command launches one browser.

Unlike LOCKDOWN's legacy draft exceptions, Briar still requires nonempty
two-part clues, distinct text, target-only references, complete target coverage
before repeats, legal reading groups and no consecutive repeated targets.
All 525 clues across ten editions are tested, along with chapter equality,
canon preservation, count selection, saved-game restoration and packet secrecy.
Its incomplete murder method is a disclosed authoring gap, not permission
to relax gameplay validation or invent a physical cause of death.

Each count needs its own human playtest feedback: 3 tests the base loop; 4–10
test supporting readers and discussion pace; 11–12 additionally test the
role-labelled comparison seats. Automated passes do not certify voice,
suspicion balance, historical authenticity or complete canon. Record whether
the long shared accounts and analytical supplemental voice are comfortable
to read aloud, whether the bell sequence is understood and whether the
two account types stay distinct. Final canon decisions remain with the author.
The historical five-player asset is unchanged; start a new game for these editions.

### Blackwater Row master and count-selected editions

Blackwater Row has ten fixed-count editions for 3 through 12 players on both
websites. Xander, Marla and Jasper form the finalized three-player master in
[`tools/story-sources/blackwater-master.json`](tools/story-sources/blackwater-master.json).
Their cards, seven clues and targets, all evidence chapters and the ending are
unchanged in every expansion. The twelve-player endpoint is validated before
the intermediate editions are emitted.

The five original discoveries remain in order, in rounds 1, 2, 3, 5 and 7.
Rounds 4 and 6 compare already released evidence and correct unsupported
inferences. The identifiable razor remains in the fourth discovery; Barker's
identity, trade and the Mayor's old documents remain in the last discovery.
Every original witness background and all twenty original short responses
are read aloud in their corresponding discovery chapter, even when a named
neighbor is not playable. Conversion records retain the original clue fields
and the reason for each intervention. No new murders, suspects' actions or
solution facts were added.

Supporting seats come from existing people: Lydia, Nell, Della, Finn, Ada,
Owen, Edith, the unnamed town investigator and Della's unnamed granddaughter.
The last two use role labels, not invented personal identities. A player
assigned the investigator still reads only their supplied clue; the actual host
reads shared narration. The pupil only responds to public accounts and is
never assigned new firsthand murder evidence. All supporting observations are
already spoken by the host. All ordered pairs are covered before repeats,
and repeat comparison clues explicitly correct unsupported conclusions.

Regenerate with `node tools/author-blackwater.mjs`; use `--check` for a
read-only reproducibility check. `--create-master` refuses to overwrite the
finalized master, whose hash is checked before any expansion. Narrow LF
attributes also protect the Ravenmoor and Blackwater fingerprinted masters
and generated assets on Windows checkouts without changing their content.
Validate serially with
`node --test --test-concurrency=1 tests/blackwater-scalable.mjs tests/blackwater-row.mjs`
and `node tests/lago-browser.mjs --blackwater`. The historical four-player
asset remains unchanged for regression and source comparisons; new selection
uses the separate scalable catalog. Saved historical games are not resized.

The owner approved continuing the conversion and publication. The following
per-edition AI-assisted editorial assessment accompanies the mechanical checks;
it is not a claim of an independent human playtest:

| Players | Structure /25 | Clue craft /30 | Content integrity /25 | Repeat discipline /20 | Total |
| --- | --- | --- | --- | --- | --- |
| 3 | 25 | 27 | 23 | 20 | 95 |
| 4 | 25 | 24 | 23 | 20 | 92 |
| 5 | 25 | 24 | 23 | 20 | 92 |
| 6 | 25 | 24 | 23 | 20 | 92 |
| 7 | 25 | 24 | 23 | 20 | 92 |
| 8 | 25 | 24 | 23 | 20 | 92 |
| 9 | 25 | 24 | 23 | 20 | 92 |
| 10 | 25 | 24 | 23 | 20 | 92 |
| 11 | 25 | 23 | 23 | 20 | 91 |
| 12 | 25 | 22 | 22 | 20 | 89 |

Critical checks pass separately for every count. Deductions reflect analytical
reaction voice, repeated indirect account introductions, long host passages,
and lighter suspicion against supporting witnesses. The final role-labelled
seats need particularly clear hosting and content notes. Every edition exceeds
the 85% release threshold, but live games may still benefit from pacing revisions
that leave the finalized master intact.

### Ravenmoor master and count-selected editions

Both website catalogs offer Ravenmoor's ten editions for 3 through 12 players. The three-player
master is stored in
[`tools/story-sources/ravenmoor-master.json`](tools/story-sources/ravenmoor-master.json).
The physician, butler and sister's cards, clue fields and targets, victim,
shared chapters, finale and solution are identical in every edition. The
twelve-player cast comes from the original source, not invented supporting roles.

The five original discovery chapters remain in order. Two inserted comparison
chapters introduce no new discoveries. All five original character accounts are
spoken verbatim by the host in their original discovery chapter, so evidence never
depends on an absent player. Named sources remain named; supplemental readers
explicitly respond to the accounts just read instead of claiming to witness them.
The conversion record retains the original clues and reasons for the changes.

Run `node tools/author-ravenmoor.mjs` to regenerate the expansions from the
established master. The compiler validates the twelve-player endpoint before
emitting the intermediate editions. `--create-master` is only for initial authoring:
it refuses to overwrite an existing master. The unit suite pins the master hash
and checks all 525 clues, all ten editions, evidence timing and pre-reveal secrecy.
The compiler also checks the master hash and refuses an altered master before
writing output. It rejects supplemental evidence not already spoken in the master.
Run `node tools/author-ravenmoor.mjs --check` to verify reproducibility without
overwriting either the master or the generated editions.
Use `node --test --test-concurrency=1 tests/ravenmoor.mjs` followed by
`node tests/lago-browser.mjs --ravenmoor` for sequential, single-browser validation.

The owner approved publication of the corrected editions on October 9, 2026,
following the AI-assisted evidence, voice, canon and repeat review. Automated
passing checks alone are not editorial approval. Start a new Ravenmoor game
when using the new editions; the historical five-player source asset remains
unchanged for editorial comparisons and regression tests.

**Pre-approval draft repair:** the Round 4 clue now asks why Eleanor's death was
"certified as fever" rather than why her medicine was "called harmless."
The certificate is released public evidence; the harmless-tonic claim occurs
only in private source acting instructions. Original and replacement wording
and the reason are retained in the conversion record. The corrected master is
identical across all ten editions and pinned by the updated hash. Supplemental readings use
distinct spoken introductions and evidence-specific complications; the two
comparison rounds explicitly correct unsupported earlier accusations. Passing
first-person and word-count checks does not establish natural spoken voice.

Independent release review under section 21:

| Players | Structure /25 | Clue craft /30 | Content integrity /25 | Repeat discipline /20 | Total |
| --- | --- | --- | --- | --- | --- |
| 3 | 25 | 27 | 23 | 20 | 95 |
| 4 | 25 | 25 | 23 | 20 | 93 |
| 5 | 25 | 25 | 23 | 20 | 93 |
| 6 | 25 | 25 | 23 | 20 | 93 |
| 7 | 25 | 25 | 23 | 20 | 93 |
| 8 | 25 | 25 | 23 | 20 | 93 |
| 9 | 25 | 25 | 23 | 20 | 93 |
| 10 | 25 | 25 | 23 | 20 | 93 |
| 11 | 25 | 25 | 23 | 20 | 93 |
| 12 | 25 | 25 | 23 | 20 | 93 |

All critical items pass in each edition. Scores combine mechanical checks with
editorial judgment, not an automated quality metric: core spoken clues sometimes
sound analytical; supplemental accounts are intentionally indirect, with repeated
reading introductions. The long host accounts and increasing incoming accusations
leave room for pacing and suspicion-balance improvements. These deductions do not
waive canon, source, timing, coverage or master-preservation requirements.

### The Lago Cabin editions

Both website catalogs include **The Lago Cabin**, supplied as ten
fixed-count editions for 3 through 12 players, each with seven chapters and
the same reveal. The player list selects the edition automatically. These
historically inspired drafts contain non-graphic adult and child deaths,
arson and an execution. Supporting observations include fictionalized material.

All ten editions pass the gameplay validator. Each preserves the original
three-player clues, targets, seven chapters and reveal verbatim. The original
trio reads in a closed loop, then each added character reads supplemental
evidence. Master repeats are checked against the trio's six directed pairs;
added readers must target every other character before repeating, with no
consecutive repeated targets. Three six-player Round 5 supplemental clues
use the previously unused targets and existing chapter facts rather than
repeating early. No killer, method, motive or reveal facts were changed.

Run `node tools/import-lago-editions.mjs` to regenerate
[`js/editions/lago-cabin.js`](js/editions/lago-cabin.js) from
[`tools/lago-all-10-editions.txt`](tools/lago-all-10-editions.txt).
The importer retains original clue text alongside display placeholders,
records source issues and every repair's original and replacement content.
Master-preserving reading groups replace the supplied all-cast chains without
changing master targets. Optional recap and suspicion material comes from the
master chapter. It does not waive clue validation or rewrite the solution.
Verify with `node --test --test-concurrency=1 tests/lago.mjs`
and `node tests/lago-browser.mjs` (one Chromium instance, sequential editions).

### LOCKDOWN playtest and separate website catalogs

The owner requested publication of the unfinished LOCKDOWN story for Melissa's
testing. The host chooses the exact authored 3–12-player edition from the player
list; unsupported counts fail explicitly. All editions have seven rounds, preserve
the three-player master cards, clues/targets and chapters, and use the same
supplied Derek Hayes ending. Author TODO labels are removed from the playable
reveal, but no cause of death or missing facts are invented.

The original trio reads in its fixed loop, followed by supplemental readers;
everyone discusses and votes together. Host/guest screens identify this as an
unfinished author playtest. Its explicit `authorPlaytest` policy permits the
supplied clue voice, duplicated observations and supplemental repeats pending
author review; it is not a claim of full rule compliance. Structural validation
still requires valid targets, a complete group partition, consistent reader
order, seven rounds, flagged repeats and no consecutive repeated pairs. Normal
stories retain their existing validation requirements.

- **grimgatherings.com:** Blackwater Row, Ravenmoor, The Lago Cabin, LOCKDOWN and the Briar House playtest. Other game pages point to development.
- **GitHub Pages:** all existing games plus LOCKDOWN, The Lago Cabin and the scalable Ravenmoor, Blackwater Row and Briar House testing editions.
- Cloudflare's `production` branch builds automatically set the release-only
  policy, retire other game entry pages and exclude old story assets. Run
  `npm run build:site -- --production` to reproduce this build locally.
- The default/GitHub build preserves the complete development catalog. Domain
  policy also prevents older saved mysteries from resuming on the .com host.

### Local editorial comparison preview

The ten supplied editions (3–12 players, seven rounds each) are retained in
[`tools/lockdown-drafts.json`](tools/lockdown-drafts.json). Start the local-only
preview with `node tools/lockdown-preview-server.mjs`, then open
`http://127.0.0.1:8786/tools/lockdown-preview.html`.
Entering a player count selects that exact authored edition; unsupported counts
show an error instead of resizing a story.

The preview restores the three-player master cards, clues/targets, chapters and
shared ending across every edition, displaying core and supplemental reading
groups separately. The original expanded drafts remain preserved for comparison.
This separate editorial preview is not a playable room or an approved pairing
schedule. It explicitly reports unresolved repeat assignments,
the pending clue-voice pass, and the supplied reveal's missing author decisions.
No murder method or other missing facts have been invented.

All editorial preview tools remain outside the website build allowlist. The
separate playable catalog is bundled in [`js/editions/lockdown.js`](js/editions/lockdown.js).
Existing story content and Mafia behavior remain unchanged on development.

The free mysteries use short, first-person player clues: what the speaker
witnessed or found, followed by their own doubt or reaction. Each clue keeps its
separate `observation` and `contradictingDetail` fields; `text` joins both for
reading aloud. Full clue text is at most 35 words before character-name
substitution. Narrator chapters, evidence, targets and fixed solutions are
unchanged in the original four mysteries. Blackwater's supporting witness
accounts moved into same-round narration without changing its facts, targets,
solution or reading order. This voice pass does not apply to Mafia.

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
entry points, the public `RULESETS.md` reference, and `assets/`, `css/`, `js/`,
and `vendor/`. Server modules, tests,
tools and `.local-private/` are excluded. Never upload the whole local checkout.
Keep passwords and keys in a password manager; `.local-private/` is not encrypted.

GitHub Pages deploys `main`. Cloudflare Pages uses `npm run build:site`, output
`dist`, Node 24 and the `production` branch. Automatic preview builds are
disabled. All changes go to the GitHub Pages test site for review first.
The owner must explicitly give final approval for the exact reviewed commit
before it is promoted to the `.com` site. Publishing a test candidate never
authorizes updating `production`. After approval, fast-forward `production`
to that tested commit; do not force-push over another release. Verify live
assets on both sites after promotion. See the
[release approval instructions](.github/instructions/release-approval.instructions.md).

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
node --test tests/clue-voice.mjs
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
The clue-voice checks pin pre-rewrite targets, narration and other non-voice
data, preserve placeholder names in each field, and require every clue to be
shorter than its original. They do not replace human fact and spoken-voice review.

## Limitations

- Each device needs internet. Free rooms depend on PeerJS's public broker and
  browser WebRTC; restrictive networks can block connections.
- Free rooms are not always-on server rooms. Device sleep or host disconnection
  pauses them until reconnection.
- Browser storage can be lost. Public story downloads and cloud draft editing
  are no longer available.
- Story correctness and playability require authored content and human review,
  not only schema/coverage checks.
