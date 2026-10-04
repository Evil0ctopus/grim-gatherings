import { startHost } from './host.js?v=volume-50-v1';
import { startPlayer } from './player.js?v=volume-50-v1';

const params = new URLSearchParams(location.search);
const room = (params.get('room') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
if (room) startPlayer(room);
else {
  startHost();
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'join-code') {
      const c = e.target.value.trim().toUpperCase();
      if (c) location.href = location.pathname + '?room=' + encodeURIComponent(c);
    }
  });
}
