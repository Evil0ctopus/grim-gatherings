# Grim Gatherings roadmap

Stage 1 is the launch gate. Stage 2 monetization starts only after Stage 1 is
verified. A checked item means completed with evidence, not merely planned.

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
- [ ] Verify the owner's actual login and hosted approval screen.
- [x] Verify the sending domain in Resend (DKIM and sending DNS records).
- [x] Configure custom SMTP and verify saved settings.
- [ ] Test real signup confirmation and password-reset delivery and redirects.
- [ ] Keep public signup closed until those tests pass.
- [ ] Review Auth email limits, sender tracking, and abuse controls.
- [ ] Test a real author's save, backup, submission, requested changes,
  resubmission, owner approval, catalog visibility, and unpublishing.
- [ ] Confirm unauthorized users cannot approve stories.

### Gameplay and recovery

- [x] Pass automated gameplay, reconnect, session, and multi-tab draft regressions.
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

- Offer premium mysteries and themed bundles alongside complete free mysteries.
- One host purchases access; guests join that host's game without paying.
- Starting price experiments: $5-$10 per story and $15-$25 per bundle.
  These are hypotheses, not promises of revenue or final prices.
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
site. SMTP, public signup, and actual owner login are still pending. No payment
integration or paid content has been launched.

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
in Resend's queue; inbox delivery and link completion remain to be checked.
Public registration remains closed.

Private account identifiers and dashboard links belong in `.local-private/`,
not this public roadmap. Update this checklist as each launch gate is verified.
