import { startMafiaHost } from './host.js?v=ui-refresh-v1';
import { startMafiaPlayer } from './player.js?v=mafia-v2';
import { startMafiaNarrator } from './narrator.js?v=ui-refresh-v1';

const params = new URLSearchParams(location.search);
const room = params.get('room');
if (room && /^[A-Za-z0-9]{3,12}$/.test(room)) startMafiaPlayer(room.toUpperCase());
else if (params.get('mode') === 'narrator') startMafiaNarrator();
else startMafiaHost();
