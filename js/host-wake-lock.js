export function createHostWakeLock({ wakeLock = navigator.wakeLock, visible = () => !document.hidden, onStatus = () => {} } = {}) {
  let active = false, sentinel = null, pending = null;

  async function setActive(value) {
    active = value;
    if (!active || !visible()) {
      const old = sentinel;
      sentinel = null;
      onStatus(active ? 'paused' : 'inactive');
      if (old && !old.released) {
        try { await old.release(); }
        catch (error) { console.warn('[host] screen wake-lock release failed', error); }
      }
      return;
    }
    if (sentinel && !sentinel.released) return;
    if (pending) return pending;
    if (!wakeLock?.request) { onStatus('unavailable'); return; }
    onStatus('requesting');
    pending = (async () => {
      let retryAfterRelease = false;
      try {
        const lock = await wakeLock.request('screen');
        if (!active || !visible()) {
          await lock.release();
          retryAfterRelease = active && visible();
        } else {
          sentinel = lock;
          lock.addEventListener('release', () => {
            if (sentinel !== lock) return;
            sentinel = null;
            onStatus(active ? 'released' : 'inactive');
          });
          onStatus('active');
        }
      } catch (error) {
        console.warn('[host] screen wake-lock request failed', error);
        if (active && visible()) onStatus('unavailable');
      } finally { pending = null; }
      if (retryAfterRelease) await setActive(true);
    })();
    return pending;
  }

  return { setActive };
}
