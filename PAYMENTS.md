# Premium payment operations

## Product and price

Shadow Societies: Two-Game Bundle (`shadow-societies-v1`) includes **The
Lanternfall Covenant** and **The Black Ledger Society** for **$9.99 USD once**.
Both are original 3-10-player social-deduction games with up to four
night/council rounds and a final reveal. One buyer hosts a room; guests join
free on their own phones without accounts. Premium rooms use eight-character
codes and server-side state, expire after 24 hours, and check the host's active
purchase on every read/update. Private seat tokens stay on guest devices;
only hashes are stored in the database. Optional single-device pass-and-play
remains available. There are no downloadable kits or subscriptions.

The price is the owner's approved lower introductory price, not a claim to be
the cheapest product in the market. On October 6, 2026, the official
[Freeform Games shop](https://www.freeformgames.com/shop/) listed A Will to
Murder at GBP 26.99 and A Heroic Death / A Purrfect Murder at GBP 30.99.
Those larger downloadable party kits are not like-for-like browser bundles,
and currencies are not interchangeable. This comparison supports inexpensive
positioning; it does not establish a statistically verified market average.
Review conversion, processor fees, refunds and hosting costs before changing
the price. Do not advertise invented competitor USD prices or revenue.

## Release safely with checkout closed

1. Apply only `supabase/migrations/20261006050000_premium.sql` once to the
   existing community database. Do not rerun the initial community migration.
   New installations need that initial migration first. Apply
   `supabase/migrations/20261006230000_premium_rooms.sql` once after the premium
   migration for phone rooms. Verify browser roles have no purchase or room
   table/RPC access. Only the Edge handler returns filtered player views.
2. Deploy the `community` function with the repository Edge wrapper and its
   server-only environment configuration. This project currently uses a
   dashboard wrapper importing a commit-pinned GitHub handler: update its
   pinned import **and** PayPal configuration when releasing. A repository
   wrapper change alone does not update that dashboard deployment.
3. Leave `GG_PAYPAL_ENABLED` and `GG_PAYPAL_LIVE_APPROVED` unset/false.
   Default environment is `sandbox`. Unconfigured checkout shows an explicit
   closed notice and creates no provider order.
4. Deploy/test committed `main` on GitHub Pages before promoting the same
   commit to `production`. Both websites share the backend: switching its
   PayPal environment changes the premium library environment on both.
5. Verify the live shop, normal author history, anonymous 401, unpaid premium
   403, author admin 403, owner playroom, and free-game health/reconnect.
   Never write synthetic paid purchases into the production database.

## Merchant setup: owner action required before real sales

Use the owner's PayPal Business account and a REST Checkout app; a PayPal.Me
link alone cannot securely automate account ownership. Enter merchant identity,
payout and any account-verification details directly in PayPal. Never send
passwords/client secrets through public issues, repository commits or frontend
configuration.

Set these in **Supabase Edge Function secrets**, not browser files:

| Secret | Purpose |
| --- | --- |
| `GG_PAYPAL_ENVIRONMENT` | `sandbox` first; `live` only after verification |
| `GG_PAYPAL_CLIENT_ID` | REST app client ID for this environment |
| `GG_PAYPAL_CLIENT_SECRET` | Matching app secret, server-only |
| `GG_PAYPAL_MERCHANT_ID` | Verified receiving merchant ID |
| `GG_PAYPAL_WEBHOOK_ID` | Webhook ID registered in the matching REST app |
| `GG_SUPPORT_EMAIL` | Working, monitored private payment/refund mailbox |
| `GG_PAYPAL_ENABLED` | Exact `true` opens configured checkout |
| `GG_PAYPAL_LIVE_APPROVED` | Exact `true` additionally required for live checkout |

Keep the existing `GG_SITE_URL` pointing at the approved workshop Auth redirect.
Payments derive `shop.html` beside it, so purchase returns do not enter the
workshop and Auth recovery keeps working. For production it must use the
canonical production origin; live purchase creation checks that origin.
Purchases in a different allowed testing origin are disabled. Recovery and
refunds still work with checkout closed if merchant configuration remains.

Keep Supabase gateway JWT verification disabled for this existing public
community function: it verifies user Auth and trusted database roles itself,
and PayPal webhooks cannot supply a game JWT. Every paid game catalog/action
checks database ownership; webhook requests instead need a verified PayPal
signature. This is not a reason to expose the service-role key.

Register the matching environment's webhook endpoint:

`https://yrnfkaatsyenlzdmjbzt.supabase.co/functions/v1/community/api/paypal/webhook`

Subscribe to:

- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.PENDING`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `PAYMENT.CAPTURE.REVERSED`
- `CUSTOMER.DISPUTE.CREATED`
- `CUSTOMER.DISPUTE.RESOLVED`

Enable PayPal Account Optional / guest checkout where the merchant is eligible.
The card button requests hosted `GUEST_CHECKOUT`; PayPal may still request an
account depending on buyer/merchant eligibility. Do not promise universal
card availability. See PayPal's official
[guest-checkout help](https://www.paypal.com/us/cshelp/article/how-do-i-accept-cards-with-checkout-using-the-guest-checkout-option--help307),
[Orders v2 API](https://developer.paypal.com/docs/api/orders/v2/),
[Payments v2 API](https://developer.paypal.com/docs/api/payments/v2/) and
[webhook documentation](https://developer.paypal.com/api/rest/webhooks/).

Before live sales, verify applicable taxes, merchant disclosures and consumer
law for the business's actual jurisdiction. The app charges the disclosed
$9.99 USD total; it does not calculate jurisdictional tax or certify legal
compliance. Human balance/accessibility playtesting and physical-device
checkout testing are also still required.

## Real sandbox acceptance checks

Use the site's trusted owner account; sandbox checkout is admin-only. Configure
the sandbox app/merchant/webhook/support, set enabled true, leave liveApproved
false and use test buyer funds. Do **not** run a real charge as a substitute.

- Complete PayPal and eligible guest-card checkout; verify exactly USD 9.99.
- Confirm return targets the shop, both games unlock and receipts are present.
- Approve then close PayPal without returning: verify the signed approved-order
  webhook captures and unlocks the purchase on the same game account.
- Retry return / Check payment and duplicate events: no duplicate charges.
- Confirm a different account has no ownership, rules or developer privileges.
- Sign in on a second browser/device: ownership persists without repurchase.
- Play both games through final reveal at 3 and 10 players; refresh during
  private turns and confirm cards are hidden.
- Cancel before approval: no ownership. Pending/failed capture: no ownership.
- Issue a full sandbox refund from owner management and separately test a
  PayPal-dashboard refund. Verify webhook delivery and loss of game access.
- Test supported dispute/reversal events with the provider's sandbox tools;
  inspect PayPal delivery logs and database event/settlement records.
- Check live history remains empty: sandbox is not a real entitlement.

Local automated tests use real PostgreSQL but **fake PayPal/Auth HTTP**. They
cover the server and UI, not payment-provider credentials, eligibility or
delivery. Matching live credentials and webhook ID can be staged with both
charging gates false to verify authentication without accepting payments.
Only after the checks above pass should explicit liveApproved be set. Leave
enabled false until the owner is ready to accept charges.

### Provider verification status: October 6, 2026

The owner completed PayPal Business onboarding, confirmed the business email
and created the live Grim Gatherings REST app. Sandbox and live webhooks were
registered separately with the eight events listed above. The approved public
payment-support mailbox is `grimgatherings2026@gmail.com`.

Actual sandbox checks completed using PayPal test funds:

- Hosted PayPal checkout charged exactly USD 9.99, returned to the canonical
  shop and unlocked both games on the purchasing Grim Gatherings account.
- Rechecking the completed purchase preserved its paid state and access.
- A second approval with navigation back to the site deliberately blocked
  unlocked the account through the signed approved-order webhook. This was
  verified on the plain shop without a return token or client capture action.
- Cancellation before approval left the third order created with no access.
  That same order was subsequently used for the guest-card check.
- Guest-card checkout completed with an official PayPal-generated US sandbox
  Visa and account creation switched off. The return opened in a tab without
  the game login; payment recovery in the original signed-in tab confirmed the
  payment and unlocked both games. This does not establish universal guest-card
  eligibility or independently prove webhook capture for the card purchase.
- All three completed test purchases received full refunds from owner
  management, with refunded history and inactive access confirmed.
- Deliberately invalid webhook signatures were rejected with HTTP 403.

The backend now has matching **live** app/merchant/webhook configuration staged,
with `GG_PAYPAL_ENABLED=false` and `GG_PAYPAL_LIVE_APPROVED=false`. The public
catalog reports live mode and closed checkout. An invalid-signature live
webhook probe returned HTTP 403, exercising actual live OAuth and PayPal
signature verification without creating an order or making a real charge.
This is not a successful live checkout or a guarantee of merchant eligibility.

The later follow-up below records actual dispute-created delivery and the
owner's tax-treatment/conditional launch decision. Provider resolution/reversal
acceptance remains incomplete. Physical-device checkout testing of the new
premium rooms has not been established; the owner reports four human game
playtests. No real customer sale or real-money test charge has been performed.
Do not open checkout or treat sandbox ownership as a live entitlement.
The requested free-story polish remains deferred until payments are activated,
as requested by the owner.

### Follow-up launch checks: October 6, 2026

After premium phone-room deployment, a focused integration test verified that
payment webhook handling also protects an already-running room:

- An invalid dispute signature leaves the room accessible.
- A verified open dispute blocks host views, guest views, joining and actions.
- A late capture event cannot reopen that disputed room.
- A verified seller-favour resolution restores the same roles and progress.
- A simulated provider-dashboard refund blocks room access; duplicate refund
  and late approval events do not undo the refund.

These checks ran against real local PostgreSQL with **simulated PayPal HTTP**,
not actual provider dispute/refund delivery. The production health/catalog
checks passed and checkout remained closed in live mode.

The owner restored the PayPal developer login and actual dashboard testing
resumed with matching sandbox credentials temporarily enabled for the owner.
A fourth USD 9.99 purchase returned successfully and unlocked both games.
An accountless guest joined its deployed Lanternfall room. A full USD 9.99
refund was then issued directly from the sandbox merchant dashboard, not
through site refund management or payment recovery. Without either site
action, the existing guest room returned HTTP 403 with "The host no longer
has active bundle access" and its UI removed the room view. This verifies
actual provider-dashboard refund delivery and room-access revocation, not
just the simulated regression above. The room was in the lobby; actual
mid-match provider-refund acceptance is not claimed.

Operator references: order `5C46447505129814X`, receipt
`ef488210-f389-4569-8f43-f7e256f63ba8`, capture `7DR93466VX357623N`,
dashboard refund `80P34378L3402972U`. Only sandbox funds were used.
Matching live app/merchant/webhook credentials were restored afterward,
with both charging gates false. The public catalog returned HTTP 200,
live mode, checkout disabled and USD 9.99. The secrets replacement was
confirmed and the input form cleared.

The matching app's provider event detail confirms refund event
`WH-6TE96957N7476762J-9DJ447091M225521P` has status SUCCESS and its
first delivery attempt to webhook `7DR56420GN994032C` was DELIVERED.
The list initially displayed a stale Pending status; the event detail
reconciled it. The approval and capture events for the fourth purchase
also displayed Success. No sandbox event was resent against restored
live credentials.

Actual dispute testing resumed with a fifth USD 9.99 sandbox purchase,
order `3V379418P5342930M`, receipt
`32908393-824c-47e9-83b6-d078fa3be2e1`, capture `7VB10556441490317`.
Signed approval/capture webhooks unlocked the original purchasing account
without using Check payment. Three synthetic, accountless guests joined a
deployed Ledger room, received their own private roles, completed the first
night and reached the vote phase.

The synthetic buyer then filed case `PP-R-DHR-10190436` through the sandbox
Resolution Center, explicitly describing it as an integration test with no
real customer complaint. PayPal's dispute API confirmed the case against
that capture. Created event `WH-7CB33929N2677900B-6C188209070520407`
was recorded as disputed in the production settlement table at
2026-10-06 23:24:36 UTC. Without a site recovery/refund action, the purchasing
account lost access and host view, existing guest view, voting and new joining
all returned HTTP 403. This verifies actual signed dispute delivery and
suspension of an already-running room. The provider event-detail API confirmed
CUSTOMER.DISPUTE.CREATED even while the event-list UI lagged.

The seller escalated the synthetic case through PayPal's advertised API
action and submitted explicit sandbox-only test notes using provide-evidence;
both returned HTTP 200. The case reached UNDER_REVIEW / CHARGEBACK, but
PayPal did not offer an adjudicate action. Its documented sandbox adjudicate
endpoint returned HTTP 400 / ACTION_NOT_ALLOWED_IN_CURRENT_DISPUTE_STATE
in both the earlier INQUIRY stage and the later CHARGEBACK stage. The merchant
transaction page also offered no refund action while the case was under
review. The capture is now PENDING, so no refund request was sent and no
seller-favour restoration, buyer-favour reversal or completed refund is
claimed for this fifth purchase. The fifth test case remains open.

This is the concrete remaining provider-acceptance blocker. Matching live
credentials were restored with both charging gates false; the Supabase
replacement completed and its input form cleared. The public catalog again
returned HTTP 200, live mode, USD 9.99, the approved support email and
checkoutEnabled false. Sandbox ownership did not become live ownership.
Any later sandbox resolution event must be inspected or retried only with
matching sandbox credentials/webhook, never resent into live configuration.

A later retry used the case's advertised provide-supporting-info action with
explicit synthetic integration-test notes; PayPal returned HTTP 200. A fresh
case read still showed UNDER_REVIEW / CHARGEBACK, with only self and
provide_supporting_info actions, not adjudicate. Repeating requests is not
evidence of resolution. The 18 targeted payment and premium-room regression
tests passed again, including simulated seller/buyer resolutions and room
restoration. These do not replace the outstanding actual-provider check.
An explicit decision to defer provider resolution and physical-phone checks
until after launch was requested, but no answer was available; neither check
has been silently waived and live charging remains disabled.

The owner reports four human game playtests
and continuing corrections; physical-device testing specifically of the new
premium rooms has not been established. Automated Chromium/WebKit multi-seat
tests and the deployed synthetic room check are separate evidence, not a
claim of physical-phone testing. Do not substitute locally simulated events
for provider acceptance.

## Recovery, refunds and disputes

### Owner tax-readiness research: October 6, 2026

The owner confirmed the public business name Grim Gatherings and a Missouri
business location, but has not yet checked tax requirements. Missouri DOR
[LR 8408](https://dor.mo.gov/rulings/show/8408), dated September 24, 2026,
states that the applicant's paid online software access is not subject to
Missouri sales/use tax. [LR 8250](https://dor.mo.gov/rulings/show/8250) also
cites 12 CSR 10-109.050(2)(I), which excludes software as a service from tax.
The older ruling's three-year binding period has elapsed, and both rulings
are applicant-specific; neither is a binding determination for this business.

Browser-only game access without a physical kit appears consistent with this
guidance, but product classification should be confirmed with Missouri DOR
or a qualified tax adviser. The guidance does not establish requirements
for customers in other states/countries, income/self-employment tax, or
business-name registration. Do not interpret a Missouri ZIP code as a
worldwide no-tax determination or enable checkout on that basis alone.

The owner subsequently directed use of the September 2026 ruling as the
Missouri tax-treatment basis for the current browser-only bundle. Record
this as the owner's business decision, not as a binding ruling issued to
Grim Gatherings or confirmation of other jurisdictions' requirements.
No verified nearby seller's public tax policy was found; lack of a
competitor tax statement is not evidence that tax is unnecessary.

The owner has authorized live launch after the remaining payment checks,
using that Missouri treatment basis, and plans to call Missouri DOR for
confirmation the following day. No real-money test charge is authorized.

Purchase UUIDs generate stable create/capture/refund request IDs. A pending
capture cannot start another charge even after a day. Return tokens are only
lookup inputs; the server checks the signed-in account, merchant, references,
amount/currency and final completed capture. Do not grant access manually based
on a screenshot, browser flag, success URL or direct PayPal.Me transfer.

If charged with no access, the buyer signs into the original game account and
uses **My purchases / Check payment**. If uncertain, inspect PayPal and Edge
logs privately before retrying. Leave configured merchant secrets in place
when closing new sales so old payment recovery/webhooks/refunds still work.

The stated policy is a full bundle refund on request within 14 days, without
restricting statutory rights. The owner signs into the shop and uses **Owner
payment management**, confirms the full refund and checks the provider result.
Only the trusted DB admin role can list other receipts or refund.
PayPal accepted PENDING refunds suspend access immediately and show an explicit
pending result; the database marks that purchase refunded. Check completion in
PayPal and follow up if it fails. Older receipts and nonstandard refunds require
the PayPal dashboard; the site shows the latest 50.

Partial/full refund, reversal and denial events cannot be undone by late
completed events. A dispute suspends access; an ordinary capture cannot
restore it. A provider-verified resolved seller-favour dispute can restore a
still-completed payment, but never override an earlier refund/reversal.
Ambiguous outcomes or multi-transaction disputes require manual PayPal/support
review; automated handling fails visibly instead of assuming a win.

Monitor failed/pending provider payments, webhook retries, refund completion,
disputes, auth outages and database quotas. Keep appropriate private purchase
and story backups; do not log card data or tokens. Account deletion currently
needs private support and applicable financial-record retention review.
Game rules are excluded from static builds but remain visible in this public
source repository: access controls are not source-code confidentiality or
copy protection after delivery to an authorized host.
