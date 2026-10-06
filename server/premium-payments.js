export const PREMIUM_BUNDLE = Object.freeze({
  id: 'shadow-societies-v1', title: 'Shadow Societies: Two-Game Bundle',
  amount: '9.99', currency: 'USD', games: ['lanternfall', 'ledger'],
  termsVersion: '2026-10-06', refundDays: 14,
});
export class PaymentError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const requireValue = (value, status, message) => { if (!value) throw new PaymentError(status, message); };
const providerId = value => typeof value === 'string' && /^[A-Z0-9]{8,32}$/.test(value);

export function createPremiumPayments({ rpc, config = {}, siteUrl, fetchImpl = fetch }) {
  const environment = config.environment || 'sandbox';
  requireValue(['sandbox', 'live'].includes(environment), 500, 'PayPal environment must be sandbox or live.');
  const configured = !!(config.clientId && config.clientSecret && config.merchantId && config.webhookId);
  const supportEmail = typeof config.supportEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail) ? config.supportEmail : '';
  const enabled = config.enabled === true && configured && !!supportEmail &&
    (environment === 'sandbox' || config.liveApproved === true);
  const origin = environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const returnUrl = new URL('shop.html', siteUrl);
  const purchaseOrigin = returnUrl.origin;
  returnUrl.search = '?shop=1&payment=return';
  returnUrl.hash = '';
  const cancelUrl = new URL(returnUrl);
  cancelUrl.search = '?shop=1&payment=cancel';
  async function providerFetch(url, options) {
    try { return await fetchImpl(url, options); }
    catch (error) {
      console.warn('PayPal network request failed', error.name);
      throw new PaymentError(502, 'PayPal could not be reached. Check your existing payment before paying again.');
    }
  }
  async function providerJson(response) {
    try { return await response.json(); }
    catch {
      console.warn('PayPal returned an unreadable response', response.status);
      throw new PaymentError(502, 'PayPal returned an unexpected response. Check your existing payment before paying again.');
    }
  }
  let credentials = null, credentialsExpire = 0, authenticating = null;
  async function authorizationToken() {
    if (credentials && credentialsExpire > Date.now()) return credentials.access_token;
    if (!authenticating) authenticating = (async () => {
      const authorization = await providerFetch(origin + '/v1/oauth2/token', {
        method: 'POST', headers: { Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials', signal: AbortSignal.timeout(15000),
      });
      if (!authorization.ok) console.warn('PayPal authentication failed', authorization.status);
      requireValue(authorization.ok, 502, 'PayPal authentication is unavailable. No access has been granted; contact support or retry.');
      credentials = await providerJson(authorization);
      requireValue(typeof credentials?.access_token === 'string', 502, 'PayPal returned an invalid authentication response.');
      credentialsExpire = Date.now() + Math.max(0, (Number(credentials.expires_in) || 0) - 60) * 1000;
      return credentials.access_token;
    })();
    try { return await authenticating; }
    finally { authenticating = null; }
  }
  async function paypal(path, { method = 'GET', body, requestId } = {}) {
    const accessToken = await authorizationToken();
    const response = await providerFetch(origin + path, {
      method, headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json',
        ...(requestId ? { 'PayPal-Request-Id': requestId } : {}), Prefer: 'return=representation' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
    });
    const result = await providerJson(response);
    if (!response.ok) {
      if (response.status === 401) { credentials = null; credentialsExpire = 0; }
      console.warn('PayPal request failed', response.status, result?.name, result?.debug_id);
      throw new PaymentError(502, 'PayPal could not confirm this transaction. Use Check payment again; do not pay again if PayPal already charged you.');
    }
    return result;
  }
  function requireCheckout(user, requestOrigin) {
    requireValue(enabled, 503, 'Checkout is not enabled yet. No payment will be taken.');
    requireValue(environment !== 'sandbox' || user.role === 'admin', 403, 'Sandbox checkout is available only to the site owner.');
    requireValue(environment !== 'live' || requestOrigin === purchaseOrigin, 403, 'Real checkout is available only on the production website. No payment was taken.');
  }
  function verifyOrder(order, stored) {
    requireValue(order.id === stored.paypal_order_id && order.intent === 'CAPTURE' && order.purchase_units?.length === 1,
      502, 'PayPal order does not match this purchase. Contact support.');
    const unit = order.purchase_units[0];
    requireValue(unit.custom_id === stored.id && unit.invoice_id === stored.id &&
      unit.payee?.merchant_id === config.merchantId &&
      unit.amount?.currency_code === stored.currency && unit.amount?.value === stored.amount,
    502, 'PayPal purchase amount, recipient or reference does not match. No access was granted.');
    return unit;
  }
  function verifyCapture(capture, stored) {
    requireValue(providerId(capture.id) && capture.amount?.currency_code === stored.currency &&
      capture.amount?.value === stored.amount && capture.final_capture === true &&
      capture.supplementary_data?.related_ids?.order_id === stored.paypal_order_id,
    502, 'PayPal capture does not match the purchase. No access was granted.');
  }
  async function reconcile(stored, order, eventId = null) {
    const unit = verifyOrder(order, stored);
    const captures = unit.payments?.captures || [];
    requireValue(captures.length === 1 && providerId(captures[0].id), 409, 'Payment is not completed yet. Check payment again after PayPal finishes.');
    const capture = await paypal(`/v2/payments/captures/${captures[0].id}`);
    verifyCapture(capture, stored);
    const status = ({ COMPLETED: 'paid', REFUNDED: 'refunded', PARTIALLY_REFUNDED: 'refunded', REVERSED: 'reversed', DENIED: 'denied', DECLINED: 'denied', PENDING: 'pending' })[capture.status];
    requireValue(status, 502, 'PayPal returned an unknown payment state. Contact support.');
    return rpc('gg_payment_settle', { p_id: stored.id, p_capture: capture.id, p_status: status,
      p_event: eventId, p_environment: environment });
  }
  return {
    environment,
    async catalog(user = null, requestOrigin = null) {
      const library = user ? await rpc('gg_purchases', { p_user: user.id, p_environment: environment }) : { owned: false, orders: [] };
      const testingSite = environment === 'live' && requestOrigin !== purchaseOrigin;
      return { bundle: PREMIUM_BUNDLE, ...library, environment, supportEmail,
        checkoutEnabled: enabled && !testingSite && (environment === 'live' || user?.role === 'admin'),
        checkoutNotice: !enabled ? 'Purchases are not open yet. PayPal merchant configuration, private support and checkout verification are required.'
          : testingSite ? `Real purchases are available only at ${purchaseOrigin}. This testing website does not start real checkout.`
          : environment === 'sandbox' ? 'Owner-only PayPal sandbox: test funds only. Sandbox purchases do not grant live access.' : '' };
    },
    async create(user, body, requestOrigin) {
      requireCheckout(user, requestOrigin);
      requireValue(['paypal', 'card'].includes(body.paymentMethod), 400, 'Choose PayPal or credit/debit card checkout.');
      requireValue(body.consent === true && body.termsVersion === PREMIUM_BUNDLE.termsVersion, 400, 'Accept the purchase terms and immediate digital access before checkout.');
      const stored = await rpc('gg_payment_begin', { p_user: user.id, p_environment: environment,
        p_amount: PREMIUM_BUNDLE.amount, p_currency: PREMIUM_BUNDLE.currency, p_terms: PREMIUM_BUNDLE.termsVersion });
      if (stored.status === 'paid') throw new PaymentError(409, 'You already own this bundle. Open My purchased games.');
      requireValue(stored.status !== 'pending', 409, 'Your existing payment is pending. Check that payment instead of buying again.');
      const order = stored.paypal_order_id ? await paypal(`/v2/checkout/orders/${stored.paypal_order_id}`)
        : await paypal('/v2/checkout/orders', { method: 'POST', requestId: `create-${stored.id}`, body: {
        intent: 'CAPTURE',
        purchase_units: [{ reference_id: PREMIUM_BUNDLE.id, custom_id: stored.id, invoice_id: stored.id,
          description: PREMIUM_BUNDLE.title, payee: { merchant_id: config.merchantId },
          amount: { currency_code: stored.currency, value: stored.amount } }],
        payment_source: { paypal: { experience_context: {
          brand_name: 'Grim Gatherings', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW',
          landing_page: body.paymentMethod === 'card' ? 'GUEST_CHECKOUT' : 'LOGIN',
          return_url: returnUrl.href, cancel_url: cancelUrl.href,
        } } },
      } });
      if (stored.paypal_order_id) {
        verifyOrder(order, stored);
        requireValue(order.status === 'CREATED' || order.status === 'PAYER_ACTION_REQUIRED', 409, 'You have an existing payment to check. Use Check payment before buying again.');
      }
      requireValue(providerId(order.id), 502, 'PayPal did not return a valid order.');
      await rpc('gg_payment_attach', { p_user: user.id, p_id: stored.id, p_paypal: order.id });
      const approval = order.links?.find(link => ['payer-action', 'approve'].includes(link.rel))?.href;
      let link;
      try { link = new URL(approval); } catch { throw new PaymentError(502, 'PayPal did not return an approval link. Retry checkout.'); }
      requireValue(link.protocol === 'https:' && link.hostname === (environment === 'live' ? 'www.paypal.com' : 'www.sandbox.paypal.com') &&
        !link.username && !link.password, 502, 'PayPal returned an unexpected checkout destination.');
      return { orderId: order.id, approvalUrl: link.href, environment };
    },
    async capture(user, body) {
      requireValue(configured, 503, 'PayPal payment verification is not configured. Contact support before paying again.');
      requireValue(environment !== 'sandbox' || user.role === 'admin', 403, 'Sandbox payment recovery is available only to the site owner.');
      requireValue(providerId(body.orderId), 400, 'Choose a valid PayPal order.');
      const stored = await rpc('gg_payment_order', { p_user: user.id, p_paypal: body.orderId, p_environment: environment });
      requireValue(!['refunded', 'reversed', 'denied', 'disputed'].includes(stored.status), 409, 'This payment was refunded, reversed, disputed or denied. It cannot unlock the bundle.');
      let order = await paypal(`/v2/checkout/orders/${body.orderId}`);
      verifyOrder(order, stored);
      if (order.status === 'APPROVED') {
        // Retries use the durable purchase ID, never a fresh capture request ID.
        order = await paypal(`/v2/checkout/orders/${body.orderId}/capture`, {
          method: 'POST', body: {}, requestId: `capture-${stored.id}`,
        });
      }
      const result = await reconcile(stored, order);
      requireValue(result.status === 'paid', 409, 'PayPal has not completed payment. No access yet; check payment again later.');
      return { ...result, bundle: PREMIUM_BUNDLE };
    },
    async adminOrders(user) {
      return rpc('gg_payment_admin', { p_user: user.id, p_id: null, p_environment: environment });
    },
    async refund(user, body) {
      requireValue(configured, 503, 'PayPal merchant configuration is required to issue refunds.');
      requireValue(user.role === 'admin', 403, 'Only the administrator can refund purchases.');
      const stored = await rpc('gg_payment_admin', { p_user: user.id, p_id: body.id, p_environment: environment });
      requireValue(stored.status === 'paid' && providerId(stored.capture_id), 409, 'Only a completed, active payment can be refunded.');
      const result = await paypal(`/v2/payments/captures/${stored.capture_id}/refund`, {
        method: 'POST', requestId: `refund-${stored.id}`, body: {
          amount: { value: stored.amount, currency_code: stored.currency },
          note_to_payer: 'Grim Gatherings two-game bundle refund.',
        },
      });
      requireValue(providerId(result.id) && ['COMPLETED', 'PENDING'].includes(result.status) &&
        result.amount?.value === stored.amount && result.amount?.currency_code === stored.currency,
      502, 'PayPal did not confirm the refund. Check the PayPal dashboard before retrying.');
      await rpc('gg_payment_settle', { p_id: stored.id, p_capture: stored.capture_id,
        p_status: 'refunded', p_event: `owner-refund-${result.id}`, p_environment: environment });
      return { id: stored.id, refundId: result.id, status: result.status,
        message: result.status === 'COMPLETED' ? 'Full refund confirmed. Bundle access from this purchase is removed.'
          : 'PayPal accepted a pending refund. Bundle access is suspended; check its completion in PayPal.' };
    },
    async webhook(request, event) {
      requireValue(configured, 503, 'PayPal webhook verification is not configured.');
      requireValue(typeof event.id === 'string' && event.id.length <= 128 && typeof event.event_type === 'string', 400, 'Invalid PayPal event.');
      const signature = {};
      for (const [header, field] of Object.entries({ 'paypal-auth-algo': 'auth_algo', 'paypal-cert-url': 'cert_url',
        'paypal-transmission-id': 'transmission_id', 'paypal-transmission-sig': 'transmission_sig', 'paypal-transmission-time': 'transmission_time' })) {
        const value = request.headers.get(header);
        requireValue(value && value.length <= 4096, 400, 'PayPal signature headers are required.');
        signature[field] = value;
      }
      const verified = await paypal('/v1/notifications/verify-webhook-signature', {
        method: 'POST', body: { ...signature, webhook_id: config.webhookId, webhook_event: event },
      });
      requireValue(verified.verification_status === 'SUCCESS', 403, 'PayPal event signature is invalid.');
      if (['CUSTOMER.DISPUTE.CREATED', 'CUSTOMER.DISPUTE.RESOLVED'].includes(event.event_type)) {
        requireValue(typeof event.resource?.dispute_id === 'string' && /^[A-Z0-9-]{8,64}$/.test(event.resource.dispute_id), 400, 'Invalid dispute reference.');
        const dispute = await paypal(`/v1/customer/disputes/${event.resource.dispute_id}`);
        requireValue(dispute.disputed_transactions?.length === 1, 502, 'Dispute requires manual review in PayPal.');
        const captureId = dispute.disputed_transactions[0].seller_transaction_id;
        requireValue(providerId(captureId), 502, 'Dispute has no valid payment reference.');
        const capture = await paypal(`/v2/payments/captures/${captureId}`);
        const orderId = capture.supplementary_data?.related_ids?.order_id;
        requireValue(providerId(orderId), 502, 'Disputed capture has no order reference.');
        const stored = await rpc('gg_payment_lookup', { p_paypal: orderId, p_environment: environment });
        if (!stored) return { received: true, ignored: true };
        verifyCapture(capture, stored);
        verifyOrder(await paypal(`/v2/checkout/orders/${orderId}`), stored);
        const resolved = dispute.status === 'RESOLVED';
        const outcome = dispute.dispute_outcome?.outcome_code;
        const sellerWon = resolved && outcome === 'RESOLVED_SELLER_FAVOUR';
        const buyerWon = resolved && outcome === 'RESOLVED_BUYER_FAVOUR';
        await rpc('gg_payment_settle', { p_id: stored.id, p_capture: captureId,
          p_status: sellerWon && capture.status === 'COMPLETED' ? 'paid' : buyerWon ? 'reversed' : 'disputed',
          p_event: sellerWon ? `dispute-won-${event.id}` : event.id, p_environment: environment });
        return { received: true };
      }
      if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
        const id = event.resource?.id;
        requireValue(providerId(id), 400, 'Invalid approved order reference.');
        const stored = await rpc('gg_payment_lookup', { p_paypal: id, p_environment: environment });
        if (!stored || ['refunded', 'reversed', 'denied', 'disputed'].includes(stored.status)) return { received: true, ignored: true };
        let order = await paypal(`/v2/checkout/orders/${id}`);
        verifyOrder(order, stored);
        if (order.status === 'APPROVED') order = await paypal(`/v2/checkout/orders/${id}/capture`, {
          method: 'POST', body: {}, requestId: `capture-${stored.id}`,
        });
        await reconcile(stored, order, event.id);
        return { received: true };
      }
      if (!['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.PENDING', 'PAYMENT.CAPTURE.DENIED',
        'PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.CAPTURE.REVERSED'].includes(event.event_type)) return { received: true, ignored: true };
      const resource = event.resource;
      const captureId = event.event_type === 'PAYMENT.CAPTURE.REFUNDED'
        ? resource?.supplementary_data?.related_ids?.capture_id ||
          resource?.links?.map(link => /^https:\/\/api(?:-m)?(?:\.sandbox)?\.paypal\.com\/v2\/payments\/captures\/([A-Z0-9]+)$/.exec(link.href)?.[1]).find(Boolean)
        : resource?.id;
      requireValue(providerId(captureId), 400, 'PayPal event has no valid capture reference.');
      const capture = await paypal(`/v2/payments/captures/${captureId}`);
      const orderId = capture.supplementary_data?.related_ids?.order_id;
      requireValue(providerId(orderId), 502, 'PayPal capture has no order reference.');
      const stored = await rpc('gg_payment_lookup', { p_paypal: orderId, p_environment: environment });
      if (!stored) return { received: true, ignored: true };
      verifyCapture(capture, stored);
      const order = await paypal(`/v2/checkout/orders/${orderId}`);
      verifyOrder(order, stored);
      // Refund/reversal events are terminal even if a subsequent GET is briefly stale.
      if (['PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.CAPTURE.REVERSED', 'PAYMENT.CAPTURE.DENIED'].includes(event.event_type)) {
        await rpc('gg_payment_settle', { p_id: stored.id, p_capture: captureId,
          p_status: event.event_type.endsWith('REFUNDED') ? 'refunded' : event.event_type.endsWith('REVERSED') ? 'reversed' : 'denied',
          p_event: event.id, p_environment: environment });
      } else await reconcile(stored, order, event.id);
      return { received: true };
    },
  };
}
