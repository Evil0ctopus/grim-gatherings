# Grim Gatherings roadmap

## Clean, simple UI refresh

- Visitor story authoring, AI help and story-file tools are retired; accounts remain.
- Blackwater Row is back for playtesting at four players, with short first-person
  clues and its complete supporting evidence in same-round narration.
- Gold-on-black pages have clearer spacing, touch targets and live turn banners;
  clue-chain computation and reader order are unchanged.
- Confirmations use accessible in-app dialogs, including keyboard cancellation.
- Home has two hosting choices and one free/premium story join flow.
- Mafia requires explicit new-room creation; settings start collapsed.
- The shop is product-first with one consent-gated checkout; help is concise and
  long host guidance is collapsed.

Stage 1 is the launch gate. Stage 2 monetization starts only after Stage 1 is
verified. A checked item means completed with evidence, not merely planned.

## October 7 catalog cleanup

The current code removes public story creation, AI assistance, JSON tools and
community publishing. The former workshop address is now accounts only.
Blackwater Row was withdrawn for rewriting and returned on October 8 with
first-person clues and unchanged four-player coverage and solution. Clue-chain
diagrams are hidden while reader prompts and the authored order remain.
Historical workshop/catalog checks below describe older releases, not current
features. Static release and deployment of the updated Supabase `community`
function must be verified separately.

## Stage 1 - connected, reliable, playable

### Hosting and releases

- [x] Register grimgatherings.com in the owner's account.
- [x] Maintain local-only account links outside Git and website uploads.
- [x] Serve the public game over HTTPS at https://grimgatherings.com.
- [x] Keep GitHub Pages as a separate testing site, without redirecting it to the
  production domain.
- [x] Configure Cloudflare Pages to deploy only an approved `production` branch.
  GitHub Pages continues to deploy `main`.
- [x] Prepare and test a static-only deployment build that excludes local notes,
  backend files, tests, and database scripts.
- [x] Verify the production host uses that build, not the repository root.
- [ ] Configure production Auth redirects and backend allowed origins, then
  verify cross-origin login and community access.
- [ ] Isolate testing from live account/story writes. A separate website pointed
  at production Supabase is not an isolated backend.
- [ ] Verify rollback to a known-good production release.
- [ ] Explain browser-storage migration and verify export/import of local stories
  before switching the public URL.

### Accounts, submissions, and approval

- [x] Deploy the Supabase database and community API.
- [x] Create a verified owner account with a trusted administrator role.
- [x] Verify the owner's actual login and hosted approval screen.
- [x] Verify the sending domain in Resend (DKIM and sending DNS records).
- [x] Configure custom SMTP and verify saved settings.
- [x] Test real signup confirmation and confirmed-account login.
- [x] Test real password-reset delivery, redirects, and password replacement.
- [x] Keep public signup closed until those tests pass, then open registration.
- [x] Review Auth email limits, sender tracking, and abuse controls.
- [x] Test a real author's save, backup, submission, requested changes,
  resubmission, owner approval, catalog visibility, and unpublishing.
- [x] Confirm unauthorized users cannot approve stories in automated API/SQL
  tests, including forged role metadata. Production profiles currently contain
  only the verified site owner as administrator.

### Gameplay and recovery

- [x] Pass automated gameplay, reconnect, session, and multi-tab draft regressions.
- [x] Fix host Back/Forward history and reload-after-Back in mobile WebKit and
  Chromium; preserve saved setup/rooms and suspend hidden host connections.
- [x] Configure missing www DNS and canonical HTTP/HTTPS redirects with path
  and query preservation. Physical-iPhone follow-up remains a separate check.
- [x] Verify reported dead finale and End/Home controls with a real production
  four-guest match: both worked, including End/Home confirmation.
- [x] Protect saved rooms and mystery replacements with confirmation; cancel
  preserves progress. Add visible host-availability guidance and supported
  screen wake-lock lifecycle handling, not a promise of background hosting.
- [x] Provide About, three-step play/hosting guidance, public support contact,
  privacy and terms links; normalize starter descriptions. Check 320-1280px
  layouts, accessibility description uniqueness and browser exceptions.
- [ ] Play an approved community story from the production domain with real
  phones, including an iPhone, through every round and reveal.
- [ ] Verify exit/rejoin, host restoration, release/reclaim, wrong room codes,
  poor connectivity, and starting a fresh game after a disconnect.
- [x] Confirm rotating clue targets, evidence provenance, and round-by-round
  narration do not reveal the solution early.
- [ ] Confirm a failed network request is visible and does not erase drafts.

### Traffic monitoring and launch operations

- [x] Create free Cloudflare Web Analytics for grimgatherings.com with automatic
  setup and a private owner dashboard.
- [x] Verify the production home page and workshop emit analytics beacons, then
  confirm page views/visits appear in the owner's private dashboard.
- [x] Keep testing traffic separate; filter reports to the production hostname.
- [x] Provide a short analytics/privacy notice. Do not send account emails,
  story contents, room codes, passwords, or Auth tokens as custom analytics data.
- [x] Explain that page views are not unique people. Browser blocking and bots
  affect counts; analytics is not an exact visitor census or a game-completion
  tracker.
- [ ] Document private database/story backups, service limits, account recovery,
  monitoring links, and the completed launch checks.

## Stage 2 - sustainable income

### First: optional support

- Add an optional "Support Grim Gatherings" button using a hosted checkout.
- Keep the core game and player joining free; do not interrupt rounds with ads.
- Owner creates the payment account and enters identity/payout details directly.
- Use sandbox payments in testing and real payments only on production.
- Publish clear privacy, payment, refund, and support information.
- Track processor fees, refunds, taxes, and operating costs before estimating
  profit. Support payments are not represented as tax-deductible donations.

### Next: one-time premium content

- [x] Build two original 3-10 player social-deduction candidates in an
  administrator-only developer playroom: The Lanternfall Covenant and The
  Black Ledger Society. Complete pass-and-play rounds and finales; no free
  selector/catalog entries. Owner testing remains independent of purchases.
- [x] Build the approved $9.99 USD one-time two-game bundle shop and account
  library, PayPal-hosted/card-eligible checkout, verified captures/webhooks,
  purchase recovery, private database entitlements and owner refunds.
- [x] Test simulated buy/return/recovery, account isolation and no admin
  elevation, 3/10-player paid matches, private refresh, refunds and disputes.
- [x] Configure the actual merchant app/webhook and monitored private support,
  staging live credentials with both charging gates closed.
- [ ] Verify real PayPal sandbox checkout/card eligibility, webhook delivery
  and refunds before explicitly approving live charges.
- [ ] Review merchant disclosures/taxes/consumer law and human balance/fun.
- [x] Implement premium room-code play: one purchasing host, free accountless
  guests, private phone views, durable 24-hour rooms and atomic secret choices.
- [ ] Verify premium phone rooms on physical devices before live sales.

- Offer premium mysteries and themed bundles alongside complete free mysteries.
- One host purchases access; guests join that host's game without paying.
- Current approved price: $9.99 USD once for both social-deduction games.
  See [payment operations](PAYMENTS.md) for source-backed price context,
  exact format, merchant gates and remaining activation checks.
- Show theme, content guidance, player counts, included editions, and replay
  terms before checkout.
- Store purchases and access rights in the backend, not a browser flag.
- Verify signed payment webhooks, handle retries idempotently, and reconcile
  successful purchases, refunds, and disputed payments.
- Do not grant access based on a success-page visit or client-supplied payment ID.
- Keep premium story files out of public static assets/catalog responses.
  Do not promise copy protection once content is delivered to an authorized host.
- Keep community stories free initially. Existing publication consent does not
  automatically grant commercial resale rights; obtain explicit permission and
  any creator compensation agreement before selling submitted work.
- Confirm commercial permissions for contributed stories, including Melissa's,
  and review third-party characters/material before offering paid content.

### Later: custom work and subscriptions

- Offer personalized mysteries with clear scope, delivery time, revisions,
  pricing, and content boundaries.
- Consider a host subscription only once new content can be delivered regularly.
- Explore $5-$8/month as an initial pricing hypothesis, with clear cancellation,
  renewal, and access terms.
- Evaluate free-to-paid conversion and creator workload before expanding.
- Revisit hosting/database plans when measured usage requires it, not
  speculatively.

## Current launch status

As of October 5, 2026: Cloudflare Pages has deployed the `production` branch,
using the static-only build, and grimgatherings.com has been activated. Public
DNS resolved the domain and a browser smoke check using that DNS answer passed
valid HTTPS, game UI, workshop/account UI, public catalog, and backend CORS.
The local router's stale negative DNS cache expired; ordinary shared-browser,
Node fetch, curl HTTPS, and a fresh workshop browser test now pass without
DNS overrides. GitHub Pages remains a separate testing
site. Public signup and complete email-flow testing were still pending at that
initial deployment. The completed account checks below supersede that status.
The premium implementation now exists behind merchant activation gates; no
real payments are accepted until actual sandbox and merchant checks pass.

The static deployment build passed five packaging/workflow regression tests;
the initial 47 output assets matched source byte-for-byte. A traffic notice adds
one static page. Production home/workshop analytics beacons returned HTTP 204;
the private dashboard showed 4 visits and 5 page views during setup (including
our verification traffic). Backend allowed origins include
the custom domain and production Pages hostname; Auth site URL and allowed
redirects include the custom domain. Public signup remains closed.

Production browser verification on October 5 also passed 357/357 gameplay
checks for the four-player Barber of Blackwater Row through all five rounds and
the reveal, 26/26 reconnect/recovery checks, and private workshop creation,
import, saving, reopening, and playable-story selection. These checks used
Chromium mobile emulation, not physical phones. A temporary browser-only DNS
mapping bypassed this network's stale router DNS cache; no system DNS settings
were changed. After the cache expired, the production workshop test passed again
without any DNS mapping. Another 28 focused story/backend permission tests passed
locally. Auth redirects also allow the canonical /workshop URL.

Resend has verified grimgatherings.com for sending. The DKIM TXT and DNS-only
send/rsend CNAME records are published. Custom SMTP settings persisted after
reload. A password-reset request from production returned HTTP 200 and appeared
in Resend's queue, then reported Delivered. The owner confirmed inbox arrival;
reset-link completion remains to be checked.
Public website registration opened after the account lifecycle checks below.

The owner signed in on the production domain. The Story approval screen shows
Account: Site owner and an empty submission queue; refreshing the protected
admin submissions request returned HTTP 200.

A regular test author confirmed the real signup email and successfully logged
in on production with the author role. Its approval controls were absent and
the protected admin submissions endpoint returned HTTP 403. Real account backup
and reload, submission, owner-requested changes, revision-2 resubmission,
approval, catalog visibility, and unpublishing passed. The temporary published
test was removed from the public catalog. The user reported completing the
recovery link in Edge, and the old temporary password was then rejected by the
live login endpoint. The temporary browser credential was removed. The user
then successfully logged in with their replacement password in VS Code; the
shared production tab returned the author role and still rejected admin
access. Redirect credentials were absent from its address.

Website registration is now open: live health reports registration enabled,
both production and testing account forms expose Create account, and the live
registration route rejects invalid input with HTTP 400 rather than the closed
gate's HTTP 403. Email confirmation remains required. Auth email limits are
30/hour with a 60-second SMTP per-user interval; sender tracking is not
configured. These limits are not comprehensive bot protection or a guarantee
of capacity for a large launch. No CAPTCHA was added. Both websites still
share the same backend. Setting GG_REGISTRATION=closed closes website signup
but does not globally disable Supabase Auth signup.

Private account identifiers and dashboard links belong in `.local-private/`,
not this public roadmap. Update this checklist as each launch gate is verified.
