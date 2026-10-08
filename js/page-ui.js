const nav = document.createElement('nav');
nav.className = 'site-nav';
nav.setAttribute('aria-label', 'Main navigation');
nav.innerHTML = `<a href="index.html">Game home</a><a href="shop.html">Premium games</a>
  <a href="workshop.html?account=1">My account</a><a href="index.html#join-game">Join a room</a>`;
document.body.prepend(nav);
