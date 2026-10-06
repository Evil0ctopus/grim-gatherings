// A live data channel is not a successful join until the host sends game state.
export function createPlayerConnection({
  createPeer, hostId, hello, onMessage, onStatus,
  online = () => navigator.onLine !== false,
  now = () => Date.now(),
  timers = globalThis,
}) {
  let peer = null, conn = null, ready = false, stopped = false, paused = false;
  let retryTimer = null, deadline = null, lastMessage = 0, awaitingState = 0;
  let connectedBefore = false, blocked = false;

  function clearDeadline() {
    timers.clearTimeout(deadline);
    deadline = null;
  }

  function retire() {
    clearDeadline();
    const oldConn = conn, oldPeer = peer;
    conn = null; peer = null; ready = false; awaitingState = 0;
    if (oldConn) oldConn.close();
    if (oldPeer && !oldPeer.destroyed) oldPeer.destroy();
  }

  function fail(detail, delay = 2000, waiting = false) {
    if (stopped || paused) return;
    timers.clearTimeout(retryTimer);
    retire();
    if (!online()) {
      onStatus('offline', 'Your phone is offline. Reconnect to Wi-Fi or mobile data; your character is still saved.');
      return;
    }
    onStatus(waiting ? 'waiting' : 'reconnecting', detail);
    retryTimer = timers.setTimeout(connect, delay);
  }

  function waitForStage(detail, ms) {
    clearDeadline();
    deadline = timers.setTimeout(() => fail(detail), ms);
  }

  function write(message) {
    try {
      conn.send(message);
      return true;
    } catch (error) {
      console.warn('[player] send failed', error);
      fail('The connection stopped sending messages. Trying a fresh connection.');
      return false;
    }
  }

  function openConnection(p) {
    if (peer !== p || stopped || paused || conn) return;
    clearDeadline();
    let c;
    try {
      c = p.connect(hostId, { reliable: true, serialization: 'binary' });
    } catch (error) {
      console.warn('[player] connection failed', error);
      fail('Could not open the host connection. Retrying.');
      return;
    }
    conn = c;
    waitForStage('The host connection timed out. Check the room code and keep the host screen open. Retrying.', 12000);
    c.on('open', () => {
      if (conn !== c || stopped || paused) return;
      lastMessage = now();
      waitForStage('The host did not send game state. Trying a fresh connection without changing your character.', 10000);
      write(hello());
    });
    c.on('data', message => {
      if (conn !== c || stopped || paused || !message || typeof message !== 'object') return;
      lastMessage = now();
      if (message.t === 'state' && message.view && Array.isArray(message.view.roster)) {
        clearDeadline();
        ready = true; connectedBefore = true; awaitingState = 0;
        onStatus('connected', '');
      }
      if (ready || ['ended', 'error', 'superseded'].includes(message.t)) onMessage(message);
    });
    c.on('close', () => {
      if (conn === c) fail('The host connection closed. Rejoining the same room and character.');
    });
    c.on('error', error => {
      if (conn !== c) return;
      console.warn('[player] data connection error', error);
      fail('The host connection failed. Trying a fresh connection.');
    });
  }

  function connect() {
    retryTimer = null;
    if (stopped || paused) return;
    retire();
    if (!online()) {
      onStatus('offline', 'Your phone is offline. Reconnect to Wi-Fi or mobile data; your character is still saved.');
      return;
    }
    onStatus(connectedBefore ? 'reconnecting' : 'connecting', 'Connecting to the host. Your saved character will be restored automatically.');
    let p;
    try {
      p = createPeer();
    } catch (error) {
      console.error('[player] could not create peer', error);
      fail('Could not start the connection service. Check your internet connection and reload if this continues.', 5000);
      return;
    }
    peer = p;
    waitForStage('The connection service did not respond. Retrying; check your internet connection.', 12000);
    p.on('open', () => openConnection(p));
    p.on('disconnected', () => {
      if (peer !== p || stopped || paused) return;
      // Losing signaling does not necessarily interrupt the existing game channel.
      if (!ready || !conn?.open) {
        fail('Lost the connection service before joining. Retrying.');
      } else {
        try { p.reconnect(); } catch (error) {
          console.warn('[player] signaling reconnect failed; checking the game channel', error);
        }
      }
    });
    p.on('close', () => {
      if (peer === p) fail('The connection service closed. Rejoining your saved character.');
    });
    p.on('error', error => {
      if (peer !== p) return;
      console.warn('[player] peer error', error.type, error.message);
      if (['browser-incompatible', 'invalid-id', 'invalid-key', 'ssl-unavailable'].includes(error.type)) {
        blocked = true;
        timers.clearTimeout(retryTimer);
        retire();
        onStatus('offline', error.type === 'browser-incompatible'
          ? 'This browser cannot use WebRTC. Open the game in an up-to-date Safari or Chrome browser, not an embedded app browser.'
          : `The connection service cannot start (${error.type}). Reload the page or contact the host.`);
        return;
      }
      if (ready && conn?.open && ['network', 'server-error', 'socket-error', 'socket-closed'].includes(error.type)) return;
      fail(error.type === 'peer-unavailable'
        ? 'Waiting for the host to open this room. Check the code and ask the host to open the lobby and keep the game screen awake. We will retry automatically.'
        : 'Could not reach the host. Retrying; if this continues, try another network.',
      3000, error.type === 'peer-unavailable');
    });
  }

  const heartbeat = timers.setInterval(() => {
    if (stopped || paused || !ready) return;
    if (!conn?.open) {
      fail('The game channel is no longer open. Rejoining your saved character.');
    } else if (now() - lastMessage > 12000) {
      fail('The host stopped responding. Rejoining without losing your character.');
    } else if (awaitingState && now() - awaitingState > 10000) {
      fail('The host did not confirm your action. Rejoining to check the latest game state.');
    } else {
      write({ t: 'ping' });
    }
  }, 4000);

  return {
    start: connect,
    send(message) {
      if (!ready || !conn?.open || stopped || paused) return false;
      if (message.t !== 'ping' && !awaitingState) awaitingState = now();
      return write(message);
    },
    reconnect() {
      if (stopped) return;
      blocked = false;
      paused = false;
      timers.clearTimeout(retryTimer);
      connect();
    },
    resume() {
      if (stopped || blocked) return;
      if (paused || !ready || !conn?.open || now() - lastMessage > 6000) this.reconnect();
      else write({ t: 'ping' });
    },
    suspend() {
      paused = true;
      timers.clearTimeout(retryTimer);
      retire();
      onStatus('reconnecting', 'The page was paused. Your character is saved and will reconnect when you return.');
    },
    stop() {
      stopped = true;
      timers.clearTimeout(retryTimer);
      timers.clearInterval(heartbeat);
      retire();
    },
  };
}
