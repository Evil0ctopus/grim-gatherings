import { startHost } from './host.js?v=current-stories-v1';
import { startPlayer } from './player.js?v=five-rounds-v1';
import { removeOutdatedSavedContent } from './saved-content.js?v=current-stories-v1';
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
  startHost();
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'join-code') {
      const c = e.target.value.trim().toUpperCase();
      if (c) location.href = location.pathname + '?room=' + encodeURIComponent(c);
    }
  });
}
if (cleanupNotice) toast(cleanupNotice, 6000);
