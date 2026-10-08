import { startMafiaHost } from './host.js?v=mafia-v1';
import { startMafiaPlayer } from './player.js?v=mafia-v1';

const room = new URLSearchParams(location.search).get('room');
if (room && /^[A-Za-z0-9]{3,12}$/.test(room)) startMafiaPlayer(room.toUpperCase());
else startMafiaHost();
