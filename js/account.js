import { esc } from './util.js?v=workshop-v1';
import { communityRequest, sessionToken, sessionVersion, storeSession, emailAccounts, acceptEmailRedirect } from './community-api.js?v=premium-v1';
import { openDeveloperLab, developerLabHtml, developerLabAction, clearDeveloperLab } from './developer-lab.js?v=ui-refresh-v1';

const app = document.getElementById('workshop');
let user = null, view = 'account', busy = false;
let message = '', error = '', serviceNotice = '';
const action = (name, text, secondary = true) => `<button type="button" data-action="${name}" ${secondary ? 'class="secondary"' : ''}>${text}</button>`;

function accountHtml() {
  if (!user) return `<div class="card"><h2>Log in to your account</h2>
    <p>Accounts are optional for free games. Sign in to access your premium purchases. ${emailAccounts ? 'Check your inbox after registering to confirm your account.' : 'Sessions expire after 24 hours.'}</p>
    <label for="username">${emailAccounts ? 'Email address' : 'Username'}</label><input id="username" type="${emailAccounts ? 'email' : 'text'}" autocomplete="username">
    <label for="password">Password (12 or more characters for a new account)</label><input id="password" type="password" autocomplete="current-password">
    <label for="author-name">Display name (for a new account)</label><input id="author-name" autocomplete="nickname">
    <div class="row">${action('login', 'Log in', false)}${action('register', 'Create account')}${emailAccounts ? action('recover', 'Forgot password?') : ''}</div></div>`;
  return `<div class="card"><p>Logged in as ${esc(user.name)} (${esc(user.role)}).</p>${action('logout', 'Log out')}
    <h2>Purchased games</h2><p>Your paid bundle belongs to this account across devices. Purchases do not change your account role.</p><a class="btn secondary" href="shop.html">My purchased games &amp; receipts</a>
    ${emailAccounts ? `<details ${message.includes('new password') ? 'open' : ''}><summary>Change / reset password</summary><label for="new-password">New password (12 or more characters)</label><input id="new-password" type="password" autocomplete="new-password">${action('change-password', 'Save new password')}</details>` : ''}</div>`;
}

function render() {
  app.innerHTML = `<h1>${view === 'developer' ? 'Developer playroom' : 'Your account'}</h1>
    ${view === 'developer' || user?.role === 'admin' ? `<nav class="row" aria-label="Account tools">
      ${view === 'developer' ? action('account', 'Back to my account') : action('developer', 'Developer playroom')}</nav>` : ''}
    <p id="service-notice" class="card small" role="status" ${serviceNotice ? '' : 'hidden'}>${esc(serviceNotice)}</p>
    <div id="workshop-error" class="${error ? 'err' : ''}" role="alert">${esc(error)}</div>
    <p id="workshop-message" role="status">${esc(message)}</p>
    ${view === 'developer' ? developerLabHtml() : accountHtml()}`;
  if (busy) app.querySelectorAll('button, input, textarea, select').forEach(el => { el.disabled = true; });
}

const actions = {
  account() { view = 'account'; },
  async developer() { await openDeveloperLab(); view = 'developer'; },
  async login() {
    const data = await communityRequest('/api/auth/login', { method: 'POST', body: { username: app.querySelector('#username').value, password: app.querySelector('#password').value } });
    storeSession(data); user = data.user; view = 'account';
  },
  async register() {
    const data = await communityRequest('/api/auth/register', { method: 'POST', body: { username: app.querySelector('#username').value, password: app.querySelector('#password').value, name: app.querySelector('#author-name').value } });
    if (data.confirmationRequired) { message = 'Check your email to confirm your account, then return here and log in.'; return; }
    storeSession(data); user = data.user; view = 'account';
  },
  async recover() {
    const data = await communityRequest('/api/auth/recover', { method: 'POST', body: { username: app.querySelector('#username').value } });
    message = data.message;
  },
  async 'change-password'() {
    const data = await communityRequest('/api/auth/password', { method: 'POST', body: { password: app.querySelector('#new-password').value } });
    message = data.message;
  },
  async logout() {
    await communityRequest('/api/auth/logout', { method: 'POST' });
    storeSession(''); clearDeveloperLab(); user = null; view = 'account';
  },
};

app.addEventListener('click', async event => {
  const el = event.target.closest('[data-action]');
  if (!el || busy) return;
  const handler = el.dataset.action.startsWith('lab-') && user?.role === 'admin'
    ? () => developerLabAction(el.dataset.action.slice(4), app) : actions[el.dataset.action];
  if (!handler) return;
  error = ''; message = ''; busy = true;
  app.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try {
    const operation = handler();
    app.querySelectorAll('input, textarea, select').forEach(field => { field.disabled = true; });
    app.querySelector('#workshop-message').textContent = 'Working... Please keep this page open.';
    await operation;
  } catch (failure) {
    error = failure.message;
    if (!sessionToken() || (failure.status === 403 && (view === 'developer' || el.dataset.action === 'developer'))) {
      user = null; clearDeveloperLab(); view = 'account';
    }
  } finally { busy = false; }
  render();
});

render();
try {
  const redirect = acceptEmailRedirect();
  const version = sessionVersion();
  if (sessionToken()) {
    const data = await communityRequest('/api/auth/me');
    if (sessionVersion() === version) {
      user = data.user;
      if (redirect && !busy && view === 'account') {
        message = redirect === 'recovery' ? 'Your password-reset link is verified. Enter a new password below.' : 'Email confirmed. You are logged in.';
      }
      if (!busy && view === 'account') render();
    }
  }
} catch (failure) {
  error = failure.message;
  render();
}
try { await communityRequest('/api/health'); }
catch (failure) {
  serviceNotice = `Accounts are currently unavailable: ${failure.message}. Free games do not require an account.`;
  const notice = app.querySelector('#service-notice');
  notice.textContent = serviceNotice; notice.hidden = false;
}
