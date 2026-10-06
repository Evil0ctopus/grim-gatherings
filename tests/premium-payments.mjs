import test from 'node:test';
import assert from 'node:assert/strict';
import { premiumFixture, premiumIds } from './premium-fixture.mjs';
import { createPremiumPayments } from '../server/premium-payments.js';

test('PayPal and card purchases are price-fixed, account-bound and idempotent, without admin elevation', async t => {
  const f = await premiumFixture(); t.after(f.close);
  assert.equal((await f.request('/api/shop', { user: null })).body.bundle.amount, '9.99');
  assert.equal((await f.request('/api/premium/games')).status, 403);
  assert.equal((await f.request('/api/purchases/orders', { user: null, method: 'POST', body: {} })).status, 401);
  assert.equal((await f.request('/api/purchases/orders', { method: 'POST', body: { consent: false, paymentMethod: 'card' } })).status, 400);
  const first = await f.request('/api/purchases/orders', { method: 'POST', body: {
    consent: true, termsVersion: '2026-10-06', paymentMethod: 'card',
    amount: '0.01', currency: 'EUR', userId: premiumIds.other, role: 'admin', owned: true,
  } });
  assert.equal(first.status, 200);
  const id = first.body.orderId;
  const creation = f.calls.find(call => call.path === '/v2/checkout/orders');
  assert.equal(creation.body.purchase_units[0].amount.value, '9.99');
  assert.equal(creation.body.payment_source.paypal.experience_context.landing_page, 'GUEST_CHECKOUT');
  assert.equal(creation.body.payment_source.paypal.experience_context.shipping_preference, 'NO_SHIPPING');
  assert.equal(creation.body.payment_source.paypal.experience_context.return_url, 'https://game.test/shop.html?shop=1&payment=return');
  assert.equal(creation.body.payment_source.paypal.experience_context.cancel_url, 'https://game.test/shop.html?shop=1&payment=cancel');
  assert.equal((await f.buy('buyer', 'card')).body.orderId, id);
  assert.equal(f.orders.size, 1);
  assert.equal((await f.capture(id, 'other')).status, 404);
  assert.equal((await f.capture(id)).status, 409);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  f.approve(id);
  assert.equal((await f.capture(id)).status, 200);
  assert.equal((await f.capture(id)).status, 200);
  assert.equal(f.calls.filter(call => call.path.endsWith('/capture')).length, 1);
  assert.equal((await f.request('/api/purchases')).body.owned, true);
  assert.equal((await f.request('/api/purchases', { user: 'other' })).body.owned, false);
  assert.equal((await f.buy()).status, 409);
  assert.equal((await f.request('/api/auth/me')).body.user.role, 'author');
  assert.equal((await f.request('/api/admin/developer')).status, 403);
  assert.equal((await f.request('/api/premium/games')).body.games.length, 2);
  const deal = await f.request('/api/premium/games', { method: 'POST', body: { command: { type: 'create' }, gameId: 'lanternfall', names: ['A', 'B', 'C'] } });
  assert.equal(deal.status, 200);
  const resume = { state: deal.body.state, seal: deal.body.seal, command: { type: 'resume' } };
  assert.equal((await f.request('/api/premium/games', { method: 'POST', body: resume })).status, 200);
  assert.equal((await f.request('/api/premium/games', { user: 'other', method: 'POST', body: resume })).status, 403);
  resume.state.round = 3;
  assert.equal((await f.request('/api/premium/games', { method: 'POST', body: resume })).status, 400);
});

test('signed approved-order webhook captures without a browser return and recovery works with checkout closed', async t => {
  const f = await premiumFixture(); t.after(f.close);
  const [first, retry] = await Promise.all([f.buy(), f.buy()]);
  assert.equal(first.body.orderId, retry.body.orderId);
  assert.equal(f.orders.size, 1);
  const id = first.body.orderId;
  f.approve(id);
  f.signatures(false);
  assert.equal((await f.webhook(id, 'CHECKOUT.ORDER.APPROVED', 'APPROVEDEVENT')).status, 403);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  f.signatures(true);
  assert.equal((await f.webhook(id, 'CHECKOUT.ORDER.APPROVED', 'APPROVEDEVENT')).status, 200);
  assert.equal((await f.webhook(id, 'CHECKOUT.ORDER.APPROVED', 'APPROVEDEVENT')).status, 200);
  assert.equal(f.calls.filter(call => call.path.endsWith('/capture')).length, 1);
  assert.equal((await f.request('/api/purchases')).body.owned, true);
  await f.webhook(id, 'PAYMENT.CAPTURE.REFUNDED', 'REFUNDEVENT');
  assert.equal((await f.webhook(id, 'CHECKOUT.ORDER.APPROVED', 'LATEAPPROVAL')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  const closed = await premiumFixture({ enabled: false }); t.after(closed.close);
  const purchase = (await closed.db.query("select public.gg_payment_begin($1,'live',9.99,'USD','2026-10-06') as value", [premiumIds.buyer])).rows[0].value;
  const orderId = 'ORDER000000000001';
  closed.orders.set(orderId, { id: orderId, intent: 'CAPTURE', status: 'APPROVED', purchase_units: [{
    custom_id: purchase.id, invoice_id: purchase.id, payee: { merchant_id: closed.config.merchantId }, amount: { value: '9.99', currency_code: 'USD' },
  }] });
  await closed.db.query('select public.gg_payment_attach($1,$2,$3)', [premiumIds.buyer, purchase.id, orderId]);
  assert.equal((await closed.buy()).status, 503);
  assert.equal((await closed.capture(orderId)).status, 200);
  assert.equal((await closed.request('/api/purchases')).body.owned, true);
});

test('verified disputes suspend access; ordinary capture events cannot restore it, and seller resolution can', async t => {
  const f = await premiumFixture(); t.after(f.close);
  const id = (await f.buy()).body.orderId;
  f.approve(id); await f.capture(id);
  const disputeId = 'PP-D-TEST00000001';
  const dispute = { dispute_id: disputeId, status: 'OPEN', disputed_transactions: [{
    seller_transaction_id: f.orders.get(id).purchase_units[0].payments.captures[0].id,
  }] };
  f.disputes.set(disputeId, dispute);
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.CREATED', 'DISPUTEOPEN')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  assert.equal((await f.capture(id)).status, 409);
  assert.equal((await f.webhook(id, 'PAYMENT.CAPTURE.COMPLETED', 'LATECAPTURE')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  dispute.status = 'RESOLVED'; dispute.dispute_outcome = { outcome_code: 'RESOLVED_SELLER_FAVOUR' };
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.RESOLVED', 'DISPUTEWON')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, true);
  dispute.dispute_outcome.outcome_code = 'RESOLVED_BUYER_FAVOUR';
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.RESOLVED', 'DISPUTELOST')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  dispute.dispute_outcome.outcome_code = 'RESOLVED_SELLER_FAVOUR';
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.RESOLVED', 'LATEMISMATCH')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
});

test('live checkout needs explicit approval and private support, not only merchant credentials', async t => {
  for (const options of [{ liveApproved: false }, { supportEmail: '' }, { supportEmail: 'invalid' }]) {
    const f = await premiumFixture(options); t.after(f.close);
    assert.equal((await f.request('/api/shop', { user: null })).body.checkoutEnabled, false);
    assert.equal((await f.buy()).status, 503);
    assert.equal(f.orders.size, 0);
  }
  const f = await premiumFixture(); t.after(f.close);
  const headers = { Origin: 'https://testing.game.test' };
  assert.equal((await f.request('/api/shop', { user: null, headers })).body.checkoutEnabled, false);
  assert.equal((await f.request('/api/purchases/orders', { method: 'POST', headers,
    body: { consent: true, termsVersion: '2026-10-06', paymentMethod: 'card' } })).status, 403);
  assert.equal(f.orders.size, 0);
});

test('a long-running pending capture cannot start another charge, and late pending cannot downgrade paid', async t => {
  const f = await premiumFixture(); t.after(f.close);
  const id = (await f.buy()).body.orderId;
  f.approve(id); await f.capture(id);
  const capture = f.orders.get(id).purchase_units[0].payments.captures[0];
  capture.status = 'PENDING';
  await f.db.query("update public.gg_purchases set status='pending',created_at=now()-interval '1 day'");
  assert.equal((await f.buy()).status, 409);
  assert.equal(f.orders.size, 1);
  assert.equal((await f.capture(id)).status, 409);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  capture.status = 'COMPLETED';
  assert.equal((await f.capture(id)).status, 200);
  capture.status = 'PENDING';
  assert.equal((await f.webhook(id, 'PAYMENT.CAPTURE.PENDING', 'LATEPENDING')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, true);
});

test('verified webhooks recover lost capture responses, deduplicate and never resurrect refunded access', async t => {
  const f = await premiumFixture(); t.after(f.close);
  const id = (await f.buy()).body.orderId;
  f.approve(id);
  await f.capture(id);
  await f.db.query("update public.gg_purchases set status='created',capture_id=null");
  f.signatures(false);
  assert.equal((await f.webhook(id)).status, 403);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  f.signatures(true);
  assert.equal((await f.webhook(id)).status, 200);
  assert.equal((await f.webhook(id)).status, 200);
  assert.equal((await f.db.query('select count(*)::int as count from public.gg_payment_events')).rows[0].count, 1);
  assert.equal((await f.request('/api/purchases')).body.owned, true);
  assert.equal((await f.webhook(id, 'PAYMENT.CAPTURE.REFUNDED', 'REFUNDEVENT')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  assert.equal((await f.capture(id)).status, 409);
  assert.equal((await f.request('/api/premium/games')).status, 403);
  assert.equal((await f.webhook(id, 'PAYMENT.CAPTURE.COMPLETED', 'LATEREPLAY')).status, 200);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  const replacement = await f.buy();
  assert.equal(replacement.status, 200);
  assert.notEqual(replacement.body.orderId, id);
});

test('mismatched PayPal price/currency/payee/reference and nonfinal captures cannot grant access', async t => {
  const f = await premiumFixture(); t.after(f.close);
  const id = (await f.buy()).body.orderId, order = f.orders.get(id), unit = order.purchase_units[0];
  f.approve(id);
  for (const [object, key, value] of [[unit.amount,'value','0.01'], [unit.amount,'currency_code','EUR'],
    [unit.payee,'merchant_id','OTHERSELLER'], [unit,'custom_id','foreign-id'], [unit,'invoice_id','foreign-id']]) {
    const old = object[key]; object[key] = value;
    assert.equal((await f.capture(id)).status, 502);
    assert.equal((await f.request('/api/purchases')).body.owned, false);
    object[key] = old;
  }
  await f.capture(id);
  await f.db.query("update public.gg_purchases set status='created',capture_id=null");
  const capture = unit.payments.captures[0];
  capture.final_capture = false;
  assert.equal((await f.capture(id)).status, 502);
  capture.final_capture = true;
  capture.amount.value = '0.01';
  assert.equal((await f.capture(id)).status, 502);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
});

test('sandbox cannot charge public authors or leak access into live purchases', async t => {
  const f = await premiumFixture({ environment: 'sandbox' }); t.after(f.close);
  assert.equal((await f.request('/api/purchases')).body.checkoutEnabled, false);
  assert.equal((await f.buy()).status, 403);
  const id = (await f.buy('owner')).body.orderId;
  f.approve(id);
  assert.equal((await f.capture(id, 'owner')).status, 200);
  assert.equal((await f.request('/api/purchases', { user: 'owner' })).body.owned, true);
  const result = await f.db.query("select public.gg_purchases($1,'live') as value", [premiumIds.owner]);
  assert.equal(result.rows[0].value.owned, false);
});

test('closed/unconfigured checkout and PayPal failures explicitly fail without unlocking', async t => {
  const f = await premiumFixture({ enabled: false }); t.after(f.close);
  assert.equal((await f.request('/api/shop', { user: null })).body.checkoutEnabled, false);
  assert.equal((await f.buy()).status, 503);
  assert.equal(f.orders.size, 0);
  const payments = createPremiumPayments({ rpc: async () => ({ owned: false, orders: [] }),
    config: { enabled: true }, siteUrl: 'https://game.test/shop.html' });
  assert.equal((await payments.catalog()).checkoutEnabled, false);
  const active = await premiumFixture(); t.after(active.close);
  active.fail('/checkout/orders');
  assert.equal((await active.buy()).status, 502);
  assert.equal((await active.request('/api/purchases')).body.owned, false);
  active.fail(null);
  const id = (await active.buy()).body.orderId;
  active.approve(id);
  active.fail('/capture');
  assert.equal((await active.capture(id)).status, 502);
  assert.equal((await active.request('/api/purchases')).body.owned, false);
  active.fail(null);
  assert.equal((await active.capture(id)).status, 200);
});

test('purchase SQL tables and granting RPCs deny browser roles and prevent cross-account reads/overwrites', async t => {
  const f = await premiumFixture(); t.after(f.close);
  for (const role of ['anon','authenticated']) {
    await f.db.exec(`set role ${role}`);
    await assert.rejects(f.db.query('select * from public.gg_purchases'), /permission denied/);
    await assert.rejects(f.db.query("select public.gg_payment_settle(gen_random_uuid(),'FAKECAPTURE','paid',null,'live')"), /permission denied/);
    await assert.rejects(f.db.query("select public.gg_purchases($1,'live')", [premiumIds.buyer]), /permission denied/);
    await f.db.exec('reset role');
  }
  const id = (await f.buy()).body.orderId;
  const purchase = (await f.db.query('select * from public.gg_purchases')).rows[0];
  await assert.rejects(f.db.query('select public.gg_payment_attach($1,$2,$3)', [premiumIds.other, purchase.id, 'FOREIGNORDER1']), /not found/);
  await assert.rejects(f.db.query('select public.gg_payment_attach($1,$2,$3)', [premiumIds.buyer, purchase.id, 'FOREIGNORDER1']), /reference changed/);
  f.approve(id);
  await f.capture(id);
  const capture = f.orders.get(id).purchase_units[0].payments.captures[0].id;
  await f.db.query("select public.gg_payment_settle($1,$2,'pending',null,'live')", [purchase.id,capture]);
  assert.equal((await f.request('/api/purchases')).body.owned, true);
});

test('only trusted administrator can list receipts and issue a verified full refund', async t => {
  const f = await premiumFixture(); t.after(f.close);
  const id = (await f.buy()).body.orderId;
  f.approve(id); await f.capture(id);
  const purchase = (await f.request('/api/purchases')).body.orders[0];
  assert.equal((await f.request('/api/admin/purchases')).status, 403);
  assert.equal((await f.request('/api/admin/purchases/refund', { method: 'POST', body: { id: purchase.id, confirm: true } })).status, 403);
  assert.equal((await f.request('/api/admin/purchases', { user: 'owner' })).body.orders[0].email, 'buyer@example.test');
  assert.equal((await f.request('/api/admin/purchases/refund', { user: 'owner', method: 'POST', body: { id: purchase.id, confirm: false } })).status, 400);
  f.fail('/refund');
  assert.equal((await f.request('/api/admin/purchases/refund', { user: 'owner', method: 'POST', body: { id: purchase.id, confirm: true } })).status, 502);
  assert.equal((await f.request('/api/purchases')).body.owned, true);
  f.fail(null);
  const refund = await f.request('/api/admin/purchases/refund', { user: 'owner', method: 'POST', body: { id: purchase.id, confirm: true } });
  assert.equal(refund.status, 200);
  assert.equal(refund.body.status, 'COMPLETED');
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  assert.equal((await f.request('/api/premium/games')).status, 403);
});
