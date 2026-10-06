import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createSupabaseHandler } from '../server/supabase-api.js';

export const premiumIds = { buyer: '11111111-1111-4111-8111-111111111111',
  other: '22222222-2222-4222-8222-222222222222', owner: '33333333-3333-4333-8333-333333333333' };
export async function premiumFixture({ origin = 'https://game.test', enabled = true, environment = 'live', liveApproved = true, supportEmail = 'support@game.test' } = {}) {
  const db = new PGlite();
  await db.exec('create role anon; create role authenticated; create role service_role;');
  for (const file of ['20261005120000_community.sql', '20261006050000_premium.sql', '20261006230000_premium_rooms.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
  }
  for (const [name, id] of Object.entries(premiumIds)) await db.query(
    'insert into public.gg_profiles(id,email,name,role) values($1,$2,$3,$4)',
    [id, `${name}@example.test`, name, name === 'owner' ? 'admin' : 'author']);
  const orders = new Map(), disputes = new Map(), calls = [];
  let signaturesValid = true, failure = null;
  const fetchImpl = async (url, options) => {
    const destination = new URL(url), path = destination.pathname;
    const body = options.body?.startsWith('{') ? JSON.parse(options.body) : null;
    if (destination.hostname === 'project.supabase.co') {
      if (path.startsWith('/rest/')) {
        assert.equal(options.headers.apikey, 'server-only-test');
        try {
          const params = Object.keys(body);
          const result = await db.query(`select public.${path.split('/').at(-1)}(${params.map((key, i) => `${key}=>$${i + 1}`).join(',')}) as result`,
            Object.values(body).map(value => value && typeof value === 'object' ? JSON.stringify(value) : value));
          return Response.json(result.rows[0].result);
        } catch (error) { return Response.json({ code: error.code, message: error.message }, { status: 400 }); }
      }
      if (path.endsWith('/token')) {
        const name = body.email?.split('@')[0] || 'buyer';
        if (!premiumIds[name]) return Response.json({ message: 'Invalid credentials' }, { status: 400 });
        return Response.json({ access_token: `${name}-token`, refresh_token: `${name}-refresh`, expires_in: 3600 });
      }
      if (path.endsWith('/logout')) return Response.json({});
      if (path.endsWith('/user')) {
        const name = options.headers.Authorization?.replace('Bearer ', '').replace('-token', '');
        if (!premiumIds[name]) return Response.json({ message: 'Log in again' }, { status: 401 });
        return Response.json({ id: premiumIds[name], email: `${name}@example.test`, user_metadata: { name, role: 'admin' } });
      }
    }
    assert.ok(['api-m.paypal.com', 'api-m.sandbox.paypal.com'].includes(destination.hostname));
    calls.push({ path, method: options.method, body, requestId: options.headers['PayPal-Request-Id'] });
    if (failure && path.includes(failure)) return Response.json({ name: 'TEST_FAILURE', debug_id: 'test' }, { status: 503 });
    if (path.endsWith('/oauth2/token')) return Response.json({ access_token: 'fake-provider-token', expires_in: 3600 });
    if (path.endsWith('/verify-webhook-signature')) return Response.json({ verification_status: signaturesValid ? 'SUCCESS' : 'FAILURE' });
    const disputeId = /^\/v1\/customer\/disputes\/([^/]+)$/.exec(path)?.[1];
    if (disputeId && disputes.has(disputeId)) return Response.json(disputes.get(disputeId));
    if (path === '/v2/checkout/orders' && options.method === 'POST') {
      const previous = Array.from(orders.values()).find(order => order.requestId === options.headers['PayPal-Request-Id']);
      if (previous) return Response.json(previous);
      const id = `ORDER${String(orders.size + 1).padStart(12, '0')}`;
      const unit = body.purchase_units[0];
      const order = { id, intent: 'CAPTURE', status: 'CREATED', requestId: options.headers['PayPal-Request-Id'],
        purchase_units: [structuredClone(unit)], links: [{ rel: 'payer-action',
          href: `https://${environment === 'live' ? 'www.paypal.com' : 'www.sandbox.paypal.com'}/checkoutnow?token=${id}` }] };
      orders.set(id, order);
      return Response.json(order);
    }
    const orderId = /^\/v2\/checkout\/orders\/([^/]+)/.exec(path)?.[1];
    if (orderId && orders.has(orderId)) {
      const order = orders.get(orderId);
      if (path.endsWith('/capture')) {
        order.status = 'COMPLETED';
        const capture = { id: orderId.replace('ORDER', 'CAPTURE'), status: 'COMPLETED',
          amount: structuredClone(order.purchase_units[0].amount), final_capture: true,
          supplementary_data: { related_ids: { order_id: orderId } } };
        order.purchase_units[0].payments = { captures: [capture] };
      }
      return Response.json(order);
    }
    const captureId = /^\/v2\/payments\/captures\/([^/]+)(?:\/refund)?$/.exec(path)?.[1];
    if (captureId) {
      const capture = Array.from(orders.values()).flatMap(order => order.purchase_units[0].payments?.captures || []).find(item => item.id === captureId);
      if (capture) {
        if (path.endsWith('/refund')) {
          capture.status = 'REFUNDED';
          return Response.json({ id: 'REFUND00000000001', status: 'COMPLETED', amount: capture.amount });
        }
        return Response.json(capture);
      }
    }
    throw new Error(`Unexpected fake provider request: ${path}`);
  };
  const config = { enabled, environment, liveApproved, supportEmail,
    clientId: 'test-client', clientSecret: 'test-secret', merchantId: 'TESTMERCHANT1', webhookId: 'TESTWEBHOOK1' };
  const handler = createSupabaseHandler({ url: 'https://project.supabase.co', anonKey: 'test-public',
    serviceKey: 'server-only-test', origins: [origin, 'https://testing.game.test'], siteUrl: origin + '/workshop.html', paypal: config, fetchImpl });
  const request = async (path, { user = 'buyer', method = 'GET', body, headers = {} } = {}) => {
    const response = await handler(new Request('https://project.supabase.co/functions/v1/community' + path, {
      method, headers: { Origin: origin, ...(user ? { Authorization: `Bearer ${user}-token` } : {}), ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }));
    return { status: response.status, body: await response.json() };
  };
  const buy = async (user = 'buyer', paymentMethod = 'paypal') => request('/api/purchases/orders', { user, method: 'POST',
    body: { consent: true, termsVersion: '2026-10-06', paymentMethod } });
  const approve = id => { orders.get(id).status = 'APPROVED'; };
  const capture = (orderId, user = 'buyer') => request('/api/purchases/capture', { user, method: 'POST', body: { orderId } });
  const webhook = async (orderId, type = 'PAYMENT.CAPTURE.COMPLETED', eventId = 'TESTEVENT1') => {
    const resource = type === 'CHECKOUT.ORDER.APPROVED' ? { id: orderId }
      : type.startsWith('CUSTOMER.DISPUTE.') ? { dispute_id: orderId }
      : type.endsWith('REFUNDED') ? {
        id: 'REFUND00000000001', supplementary_data: { related_ids: { capture_id: orders.get(orderId).purchase_units[0].payments.captures[0].id } },
      } : { id: orders.get(orderId).purchase_units[0].payments.captures[0].id };
    return request('/api/paypal/webhook', { user: null, method: 'POST', headers: {
      'paypal-auth-algo': 'SHA256withRSA', 'paypal-cert-url': 'https://api.paypal.com/cert',
      'paypal-transmission-id': 'TESTTRANSMISSION', 'paypal-transmission-sig': 'fake-signature', 'paypal-transmission-time': new Date().toISOString(),
    }, body: { id: eventId, event_type: type, resource } });
  };
  return { db, handler, request, buy, approve, capture, webhook, orders, disputes, calls, config,
    fail: path => { failure = path; }, signatures: value => { signaturesValid = value; }, close: () => db.close() };
}
