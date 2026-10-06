# Premium payment operations

## Product and price

Shadow Societies: Two-Game Bundle (`shadow-societies-v1`) includes **The
Lanternfall Covenant** and **The Black Ledger Society** for **$9.99 USD once**.
Both are original 3-10-player social-deduction games with up to four
night/council rounds and a final reveal. One buyer hosts by passing one trusted
device; guests need neither accounts nor purchases. There are no remote phone
rooms, downloadable kits, subscriptions or cloud match saves.

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
   New installations need that initial migration first. Verify browser roles
   have no purchase table/RPC access.
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
delivery. Only after the checks above pass should matching live credentials,
webhook ID and explicit liveApproved be set. Leave enabled false until the
owner is ready to accept charges.

## Recovery, refunds and disputes

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
