import { esc } from './util.js?v=workshop-v1';
import { communityRequest, storeSession, sessionToken } from './community-api.js?v=premium-v1';
import { createGameRoom } from './developer-lab.js?v=premium-v1';

const app = document.getElementById('shop');
let catalog = null, user = null, error = '', message = '', busy = false, room = null, playing = false, adminMode = false, adminOrders = [];
const params = new URLSearchParams(location.search);
let returnedOrder = params.get('payment') === 'return' ? params.get('token') || '' : '';
if (params.has('payment')) {
  message = params.get('payment') === 'cancel'
    ? 'Checkout was cancelled. No games have been unlocked. If PayPal shows a charge, check that payment below before trying again.'
    : 'You returned from PayPal. Sign in to the account used for checkout, then choose Check payment to confirm it.';
}
function render() {
  const bundle = catalog?.bundle;
  app.innerHTML = `<h1>${playing ? 'My premium game' : 'Premium games'}</h1>
    <nav class="row" aria-label="Premium navigation"><a class="btn secondary" href="index.html">Game home</a>
    <a class="btn secondary" href="workshop.html?account=1">My account</a>
    <button class="secondary" data-shop="refresh">Shop &amp; my purchases</button>
    ${user ? '<button class="secondary" data-shop="logout">Log out</button>' : ''}</nav>
    ${user?.role === 'admin' ? '<button class="secondary small" data-shop="payments-admin">Owner payment management</button>' : ''}
    <p class="${error ? 'err' : ''}" id="shop-error" role="alert">${esc(error)}</p>
    <p id="shop-message" role="status">${esc(message)}</p>
    ${busy ? '<p role="status">Working... Please wait.</p>' : ''}
    ${user ? `<p>Signed in as <b>${esc(user.name)}</b>. Purchases belong to this account, not the PayPal email.</p>` : loginHtml()}
    ${returnedOrder ? `<div class="card"><p>PayPal return reference: ${esc(returnedOrder)}. A return link alone never unlocks games.</p><button data-shop="capture-return" ${!user ? 'disabled' : ''}>Check payment</button></div>` : ''}
    ${adminMode ? adminHtml() : playing && room ? room.html() : bundle ? bundleHtml(bundle) : '<p>The shop is unavailable. Refresh to retry. Free games and your saved stories are unaffected.</p>'}
    ${!playing && user && catalog ? purchasesHtml() : ''}`;
  if (busy) app.querySelectorAll('button,input,select,textarea').forEach(el => { el.disabled = true; });
}
function adminHtml() {
  return `<section class="card"><h2>Owner payment management</h2><p>Latest 50 purchases in ${esc(catalog.environment)}. Only completed purchases can be refunded here. Each refund removes access from that purchase. Check PayPal directly for pending refunds, disputes or older records.</p>
    ${adminOrders.map(order => `<div class="card"><p>${esc(order.email)} - $${esc(order.amount)} ${esc(order.currency)} - ${esc(order.status)}</p>
      <p class="small">Receipt ${esc(order.id)} · PayPal ${esc(order.paypal_order_id || 'not created')}</p>
      ${order.status === 'paid' ? `<button class="danger" data-shop="refund" data-id="${esc(order.id)}">Refund full payment &amp; remove access</button>` : ''}</div>`).join('') || '<p>No payments yet.</p>'}</section>`;
}
function loginHtml() {
  return `<section class="card"><h2>Sign in before buying</h2><p>Both games are added to the Grim Gatherings account you use here. Guests do not need accounts or separate purchases.</p>
    <label for="shop-email">Email</label><input type="email" id="shop-email" autocomplete="username">
    <label for="shop-password">Password</label><input type="password" id="shop-password" autocomplete="current-password">
    <button data-shop="login">Log in</button> <a href="workshop.html?account=1">Create an account or reset password</a></section>`;
}
function bundleHtml(bundle) {
  return `<section class="card gold"><h2>${esc(bundle.title)}</h2><p><b>$${esc(bundle.amount)} ${esc(bundle.currency)} once for BOTH games.</b> No subscription. Replay for personal, non-commercial game nights while the service operates.</p>
    <h3>The Lanternfall Covenant</h3><p>Protect a fog-bound village's boundary lanterns while hidden Hollow sabotage the covenant. Secret roles, nightly wards and investigations, discussion and majority ballots.</p>
    <h3>The Black Ledger Society</h3><p>Expose counterfeiters at a midnight auction. Secret roles, debt attacks, escrow shields, private receipt reports and influence-weighted ballots.</p>
    <ul><li>Each game supports 3-10 players and up to four night/council rounds, followed by a final reveal.</li>
    <li><b>One host buys; everyone joins free on their own phone.</b> The host creates an eight-character room code. Guests receive only their own private roles, actions and ballots; no guest account is required.</li>
    <li>Purchases stay with your account across devices. Phone rooms persist for 24 hours; reconnect on the same browser to keep your seat. Optional pass-and-play saves only in this browser. Do not share your password.</li>
    <li>Mature fictional threats, deception and detention. These are social-deduction games, not the free five-chapter narrated mysteries. The free game catalog remains free.</li></ul>
    ${catalog.environment === 'sandbox' ? '<p class="err"><b>TEST MODE:</b> sandbox funds only; these purchases never unlock live purchases.</p>' : ''}
    ${catalog.checkoutNotice ? `<p class="card" role="status">${esc(catalog.checkoutNotice)}</p>` : ''}
    ${catalog.owned ? `<p class="pill ok">Owned by this account</p><button data-shop="play">Host a room - play my purchased games</button><button class="secondary" data-shop="play-pass">Optional pass-and-play</button><button class="secondary" data-shop="discard">Discard saved pass-and-play match</button>` : `
      <label class="check-row"><input type="checkbox" id="purchase-consent">I want immediate digital access to both games and accept the <a href="terms.html#purchases">purchase and refund terms</a>.</label>
      <div class="row"><button data-shop="buy-paypal" ${!user || !catalog.checkoutEnabled ? 'disabled' : ''}>Buy both with PayPal - $${esc(bundle.amount)}</button>
      <button data-shop="buy-card" ${!user || !catalog.checkoutEnabled ? 'disabled' : ''}>Buy both with credit/debit card - $${esc(bundle.amount)}</button></div>`}
    <p class="small muted">Checkout is hosted by PayPal. Card details are never entered on Grim Gatherings. Guest-card availability depends on PayPal eligibility and merchant settings; if unavailable, PayPal may offer account checkout instead. No PayPal.Me transfer can automatically unlock this bundle.</p>
    <p class="small">One host buys; guests play free. <a href="premium-room.html">Join a premium room</a> with your host’s code. This purchase gives game access only, never administrator or developer permissions.</p></section>`;
}
function purchasesHtml() {
  return `<section class="card"><h2>My purchases &amp; payment recovery</h2>${catalog.orders.length ? catalog.orders.map(order => `<div class="card">
    <p>${esc(catalog.bundle.title)} - $${esc(order.amount)} ${esc(order.currency)} - <b>${esc(order.status)}</b></p>
    <p class="small">Receipt ${esc(order.id)} · ${esc(new Date(order.createdAt).toLocaleString())}${order.orderId ? ` · PayPal ${esc(order.orderId)}` : ''}</p>
    ${order.orderId && !['refunded','reversed','denied','disputed'].includes(order.status) ? `<button class="secondary" data-shop="check-order" data-order="${esc(order.orderId)}">Check payment / restore access</button>` : ''}
    ${['refunded','reversed','denied','disputed'].includes(order.status) ? '<p>Access from this payment is inactive. Contact support if this is unexpected.</p>' : ''}
    </div>`).join('') : '<p>No purchases in this account yet.</p>'}
    <p class="small">If you were charged but the page closed, sign in here and check your existing payment. Do not buy again. Keep your PayPal receipt for private support; never post it publicly.</p>
    ${catalog.supportEmail ? `<p>Payment help or a refund request within 14 days: <a href="mailto:${esc(catalog.supportEmail)}">${esc(catalog.supportEmail)}</a>. Include your receipt reference privately, not your password or card number.</p>` : '<p>Private payment support will be provided before checkout opens. No charges are currently available.</p>'}</section>`;
}
async function refresh() {
  playing = false;
  adminMode = false; adminOrders = [];
  if (room) room.clear();
  if (sessionToken()) user = (await communityRequest('/api/auth/me')).user;
  else user = null;
  catalog = await communityRequest(user ? '/api/purchases' : '/api/shop');
}
async function capture(orderId) {
  await communityRequest('/api/purchases/capture', { method: 'POST', body: { orderId } });
  returnedOrder = '';
  history.replaceState(null, '', location.pathname);
  await refresh();
  message = 'Payment confirmed by PayPal. Both games are now in this account.';
}
const actions = {
  refresh,
  async login() {
    const response = await communityRequest('/api/auth/login', { method: 'POST', body: {
      username: app.querySelector('#shop-email').value, password: app.querySelector('#shop-password').value,
    } });
    storeSession(response);
    await refresh();
    if (returnedOrder) await capture(returnedOrder);
  },
  async logout() {
    await communityRequest('/api/auth/logout', { method: 'POST' });
    storeSession('');
    room?.clear(); room = null;
    await refresh();
  },
  play() { location.assign('premium-room.html?host=1'); },
  async 'play-pass'() {
    room = createGameRoom({ endpoint: '/api/premium/games',
      storageKey: `gg-premium-${catalog.environment}-${user.id}`,
      noticeHtml: '<div class="card"><b>Purchased pass-and-play games</b><p>One trusted device, 3-10 players. Everyone looks away during private turns. No remote phone room. Your match saves in this browser; your purchase stays in your account.</p></div>',
    });
    await room.open(); playing = true;
  },
  discard() {
    if (!confirm('Discard this browser’s saved premium match? Your purchased games stay in your account.')) return;
    localStorage.removeItem(`gg-premium-${catalog.environment}-${user.id}`);
    room?.clear(); playing = false;
    message = 'Saved match discarded. Your purchase is unchanged.';
  },
  async 'payments-admin'() {
    room?.clear(); playing = false;
    adminOrders = (await communityRequest('/api/admin/purchases')).orders;
    adminMode = true;
  },
  async refund(element) {
    if (!confirm('Issue a full PayPal refund and remove bundle access from this purchase? This cannot be undone.')) return;
    const result = await communityRequest('/api/admin/purchases/refund', { method: 'POST', body: { id: element.dataset.id, confirm: true } });
    message = result.message;
    await refresh();
    await actions['payments-admin']();
  },
  'capture-return': () => capture(returnedOrder),
  'check-order': el => capture(el.dataset.order),
};
async function buy(paymentMethod) {
  if (!app.querySelector('#purchase-consent').checked) throw new Error('Accept the immediate-access and purchase terms before checkout.');
  const order = await communityRequest('/api/purchases/orders', { method: 'POST', body: {
    consent: true, termsVersion: catalog.bundle.termsVersion, paymentMethod,
  } });
  location.assign(order.approvalUrl);
}
actions['buy-paypal'] = () => buy('paypal');
actions['buy-card'] = () => buy('card');
app.addEventListener('click', async event => {
  const element = event.target.closest('[data-shop],[data-action]');
  if (!element || busy) return;
  const handler = element.dataset.shop ? actions[element.dataset.shop]
    : element.dataset.action?.startsWith('lab-') && room ? () => room.action(element.dataset.action.slice(4), app) : null;
  if (!handler) return;
  error = ''; message = ''; busy = true;
  app.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try { await handler(element); }
  catch (failure) {
    error = failure.message;
    if (!sessionToken() || failure.status === 401 || failure.status === 403) {
      room?.clear(); playing = false;
      if (!sessionToken()) { user = null; catalog = null; }
    }
  } finally { busy = false; render(); }
});
try {
  await refresh();
  if (returnedOrder && user) await capture(returnedOrder);
}
catch (failure) { error = failure.message; }
render();
