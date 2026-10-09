const nav = document.createElement('nav');
nav.className = 'site-nav';
nav.setAttribute('aria-label', 'Main navigation');
nav.innerHTML = RELEASE_ONLY
  ? `<a href="index.html">LOCKDOWN home</a><a href="index.html#join-game">Join a room</a><a href="${DEVELOPMENT_URL}">Development games</a>`
  : `<a href="index.html">Game home</a><a href="shop.html">Premium games</a>
  <a href="workshop.html?account=1">My account</a><a href="index.html#join-game">Join a room</a>`;
document.body.prepend(nav);
import { RELEASE_ONLY, DEVELOPMENT_URL } from './site-policy.js?v=lockdown-release-v1';
