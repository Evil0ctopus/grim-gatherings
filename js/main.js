import { startPlayer } from './player.js?v=public-only-v1';
import { removeOutdatedSavedContent } from './saved-content.js?v=count-editions-v1';
import { toast } from './util.js?v=f1ed522';

let cleanupNotice = '';
try {
  const { removedStories, removedGame } = removeOutdatedSavedContent(localStorage);
  if (removedStories || removedGame) cleanupNotice = 'Outdated saved stories and games were removed. Choose a current ready-to-play mystery.';
} catch (error) {
  console.error('Saved content cleanup failed', error);
  cleanupNotice = `Could not remove outdated saved content: ${error.message}`;
}

const params = new URLSearchParams(location.search);
const room = (params.get('room') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
if (room) startPlayer(room);
else {
  try {
    const { startHost } = await import('./host.js?v=blackwater-row-v1');
    startHost();
  } catch (error) {
    console.error('Host application failed to load', error);
    document.getElementById('app').textContent = `Could not load the host application. Reload to retry. ${error.message}`;
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'join-code') {
      const c = e.target.value.trim().toUpperCase();
      if (c) location.href = location.pathname + '?room=' + encodeURIComponent(c);
    }
  });
}
if (cleanupNotice) toast(cleanupNotice, 6000);
