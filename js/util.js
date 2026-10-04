export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const PEER_PREFIX = 'grimgath-v1-';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Plain text -> paragraphs (blank line = new paragraph, single newline = <br>)
export function paras(text) {
  const t = String(text ?? '').trim();
  if (!t) return '';
  return t.split(/\n\s*\n/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
}
export function uid(n = 12) {
  const a = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  const r = crypto.getRandomValues(new Uint8Array(n));
  for (const x of r) s += a[x % a.length];
  return s;
}
export function randomRoom() {
  const a = 'BCDFGHJKLMNPQRSTVWXZ';
  let s = '';
  const r = crypto.getRandomValues(new Uint8Array(5));
  for (const x of r) s += a[x % a.length];
  return s;
}
export function baseUrl() {
  return location.origin + location.pathname.replace(/index\.html$/, '');
}
export function joinUrl(room) {
  return baseUrl() + '?room=' + encodeURIComponent(room);
}
export function toast(msg, ms = 2600) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.hidden = true), ms);
}
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function qrSvg(text) {
  if (typeof window.qrcode !== 'function') return '<p class="muted">(QR library failed to load — use the link)</p>';
  const qr = window.qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}
export function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
