import test from 'node:test';
import assert from 'node:assert/strict';
import { premiumFixture, premiumIds } from './premium-fixture.mjs';
const seatToken = () => crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');

async function setup(t) {
  const f = await premiumFixture(); t.after(() => f.close());
  const order = (await f.buy()).body; f.approve(order.orderId); await f.capture(order.orderId);
  const host = (code, command, revision, extra = {}, user = 'buyer') => f.request('/api/premium/rooms/host',
    { user, method: 'POST', body: { code, command, revision, ...extra } });
  const guest = body => f.request('/api/premium/rooms/guest', { user: null, method: 'POST', body });
  const create = (gameId = 'lanternfall', capacity = 3) => f.request('/api/premium/rooms',
    { method: 'POST', body: { gameId, capacity } });
  return { ...f, host, guest, create, order };
}
test('host ownership, private seat filtering, atomic joins, removal and revocation', async t => {
  const f = await setup(t);
  assert.equal((await f.request('/api/premium/rooms', { user: 'other', method: 'POST', body: { gameId: 'ledger', capacity: 3 } })).status, 403);
  assert.equal((await f.create('ledger', 2)).status, 400);
  const created = (await f.create()).body, code = created.code;
  assert.match(code, /^[A-Z2-9]{8}$/);
  assert.equal((await f.host(code, 'view', null, {}, 'other')).status, 403);
  assert.equal((await f.host(code, 'start', created.revision)).status, 409);
  const tokens = Array.from({ length: 3 }, seatToken);
  const joined = await Promise.all(tokens.map((token, i) => f.guest({ code, command: 'join', token, name: `Guest ${i}` })));
  joined.forEach(r => assert.equal(r.status, 200, JSON.stringify(r.body)));
  const lobby = (await f.host(code, 'view')).body;
  assert.equal(lobby.players.length, 3);
  assert.ok(!JSON.stringify(lobby).includes('tokenHash'));
  const retry = await f.guest({ code, command: 'join', token: tokens[0], name: 'Guest 0' });
  assert.equal(retry.status, 200); assert.equal(retry.body.players.length, 3);
  assert.equal((await f.guest({ code, command: 'view', token: seatToken() })).status, 401);
  assert.equal((await f.guest({ code, command: 'join', token: seatToken(), name: 'Intruder' })).status, 409);
  const remove = await f.host(code, 'remove', (await f.host(code, 'view')).body.revision,
    { playerId: lobby.players.find(p => p.name === 'Guest 0').id });
  assert.equal(remove.status, 200);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 401);
  const replacement = seatToken();
  assert.equal((await f.guest({ code, command: 'join', token: replacement, name: 'Replacement' })).status, 200);
  const full = (await f.host(code, 'view')).body;
  assert.equal((await f.host(code, 'start', full.revision)).status, 200);
  const publicView = (await f.host(code, 'view')).body;
  assert.equal(publicView.private, null);
  assert.ok(publicView.players.every(p => !Object.hasOwn(p, 'role')));
  const ownView = (await f.guest({ code, command: 'view', token: replacement })).body;
  assert.equal(ownView.private.name, 'Replacement');
  assert.ok(!JSON.stringify(ownView).includes('tokenHash'));
  assert.equal((await f.guest({ code, command: 'night', token: replacement, round: 1, playerId: full.players[0].id, target: 'invalid' })).status, 400);
  const valid = ownView.private.targets[0].id;
  assert.equal((await f.guest({ code, command: 'night', token: replacement, round: 1, target: valid })).status, 200);
  assert.equal((await f.guest({ code, command: 'night', token: replacement, round: 1, target: valid })).status, 200);
  assert.equal((await f.guest({ code, command: 'night', token: replacement, round: 1, target: 'invalid' })).status, 409);
  await f.db.query("update public.gg_purchases set status='refunded' where user_id=$1", ['11111111-1111-4111-8111-111111111111']);
  assert.equal((await f.guest({ code, command: 'view', token: replacement })).status, 403);
});
for (const gameId of ['lanternfall', 'ledger']) for (const count of [3, 10]) {
  test(`${gameId}/${count}: independent phones complete all rounds with concurrent secret actions`, async t => {
    const f = await setup(t), code = (await f.create(gameId, count)).body.code;
    const tokens = Array.from({ length: count }, seatToken);
    // Sequential lobby joins keep this test focused on action concurrency.
    for (let i = 0; i < count; i++) assert.equal((await f.guest({ code, command: 'join', token: tokens[i], name: `Player ${i}` })).status, 200);
    const lobby = (await f.host(code, 'view')).body;
    assert.equal((await f.host(code, 'start', lobby.revision)).status, 200);
    let turns = 0;
    while (true) {
      const views = await Promise.all(tokens.map(token => f.guest({ code, command: 'view', token })));
      views.forEach(v => assert.equal(v.status, 200));
      const current = views[0].body;
      if (current.phase === 'finished') {
        assert.ok(current.players.every(p => p.role)); assert.ok(current.winner); break;
      }
      assert.ok(++turns <= 12);
      if (current.phase === 'discussion') {
        const host = (await f.host(code, 'view')).body;
        assert.equal((await f.host(code, 'council', host.revision)).status, 200); continue;
      }
      const submissions = await Promise.all(views.map((v, i) => f.guest({ code, token: tokens[i], command: current.phase,
        round: current.round, target: current.phase === 'vote' ? null : v.body.private.targets[0]?.id || null })));
      // A bounded CAS retry can ask a contending client to retry rather than lose an action.
      for (let i = 0; i < submissions.length; i++) {
        if (submissions[i].status === 409) {
          const view = (await f.guest({ code, token: tokens[i], command: 'view' })).body;
          if (!view.submitted && view.phase === current.phase) submissions[i] = await f.guest({ code, token: tokens[i], command: current.phase,
            round: current.round, target: current.phase === 'vote' ? null : view.private.targets[0]?.id || null });
        }
        assert.equal(submissions[i].status, 200, JSON.stringify(submissions[i].body));
      }
    }
    const room = (await f.host(code, 'view')).body;
    assert.equal((await f.host(code, 'close', room.revision)).body.phase, 'closed');
    assert.equal((await f.guest({ code, token: tokens[0], command: 'view' })).status, 410);
  });
}
test('room expiry, sandbox isolation, caps and direct database privileges', async t => {
  const f = await setup(t);
  const codes = [];
  for (let i = 0; i < 3; i++) codes.push((await f.create()).body.code);
  assert.equal((await f.create()).status, 409);
  await f.db.query("update public.gg_premium_rooms set expires_at=now()-interval '1 second' where code=$1", [codes[0]]);
  assert.equal((await f.host(codes[0], 'view')).status, 404);
  assert.equal((await f.create()).status, 200);
  assert.equal((await f.db.query('select count(*)::int as n from public.gg_premium_rooms where code=$1', [codes[0]])).rows[0].n, 0);
  const rights = await f.db.query("select has_table_privilege('anon','public.gg_premium_rooms','SELECT') as readable, has_function_privilege('authenticated','public.gg_room_access(text,text)','EXECUTE') as executable");
  assert.equal(rights.rows[0].readable, false); assert.equal(rights.rows[0].executable, false);
  assert.equal((await f.db.query("select public.gg_room_list($1,'sandbox') as rooms", ['11111111-1111-4111-8111-111111111111'])).rows[0].rooms.length, 0);
});

test('payment webhooks suspend active phone rooms, restore seller-won disputes, and never undo refunds', async t => {
  const f = await setup(t), code = (await f.create()).body.code;
  const tokens = Array.from({ length: 3 }, seatToken);
  for (let i = 0; i < tokens.length; i++) assert.equal((await f.guest({
    code, command: 'join', token: tokens[i], name: `Guest ${i}`,
  })).status, 200);
  const lobby = (await f.host(code, 'view')).body;
  assert.equal((await f.host(code, 'start', lobby.revision)).status, 200);
  const privateView = (await f.guest({ code, command: 'view', token: tokens[0] })).body;
  const action = { code, command: 'night', token: tokens[0], round: 1,
    target: privateView.private.targets[0].id };
  const capture = f.orders.get(f.order.orderId).purchase_units[0].payments.captures[0];
  const disputeId = 'PP-D-ROOMTEST0001';
  const dispute = { dispute_id: disputeId, status: 'OPEN',
    disputed_transactions: [{ seller_transaction_id: capture.id }] };
  f.disputes.set(disputeId, dispute);

  f.signatures(false);
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.CREATED', 'ROOMINVALID')).status, 403);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 200);
  f.signatures(true);
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.CREATED', 'ROOMDISPUTE')).status, 200);
  assert.equal((await f.host(code, 'view')).status, 403);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 403);
  assert.equal((await f.guest(action)).status, 403);
  assert.equal((await f.guest({ code, command: 'join', token: seatToken(), name: 'Late guest' })).status, 403);
  assert.equal((await f.webhook(f.order.orderId, 'PAYMENT.CAPTURE.COMPLETED', 'ROOMLATECAPTURE')).status, 200);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[0] })).status, 403);

  dispute.status = 'RESOLVED';
  dispute.dispute_outcome = { outcome_code: 'RESOLVED_SELLER_FAVOUR' };
  assert.equal((await f.webhook(disputeId, 'CUSTOMER.DISPUTE.RESOLVED', 'ROOMSELLERWON')).status, 200);
  const restored = (await f.guest({ code, command: 'view', token: tokens[0] })).body;
  assert.equal(restored.phase, privateView.phase);
  assert.equal(restored.private.role, privateView.private.role);
  assert.equal(restored.submitted, false);
  assert.equal((await f.guest(action)).status, 200);

  // Simulate a provider-dashboard refund, not the site's owner refund route.
  capture.status = 'REFUNDED';
  assert.equal((await f.webhook(f.order.orderId, 'PAYMENT.CAPTURE.REFUNDED', 'ROOMDASHBOARDREFUND')).status, 200);
  assert.equal((await f.webhook(f.order.orderId, 'PAYMENT.CAPTURE.REFUNDED', 'ROOMDASHBOARDREFUND')).status, 200);
  assert.equal((await f.host(code, 'view')).status, 403);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[1] })).status, 403);
  assert.equal((await f.request('/api/purchases')).body.owned, false);
  assert.equal((await f.webhook(f.order.orderId, 'CHECKOUT.ORDER.APPROVED', 'ROOMLATEAPPROVAL')).status, 200);
  assert.equal((await f.guest({ code, command: 'view', token: tokens[1] })).status, 403);
  const stored = await f.db.query('select status from public.gg_purchases where user_id=$1', [premiumIds.buyer]);
  assert.equal(stored.rows[0].status, 'refunded');
});
