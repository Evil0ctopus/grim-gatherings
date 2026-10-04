import { esc, toast } from './util.js?v=f1ed522';
import { BACKDROPS, backdropFor, backdropHtml } from './backdrops.js?v=story-backdrops-v1';
import { ambientTrack, createAmbientAudio } from './ambient.js?v=ambient-audio-v1';

export const THEMES = ['manor', 'witch', 'farm', 'victorian'];
export const CUES = {
  dim: 'The lights grow dim',
  sting: 'A moment of suspense',
  discuss: 'Compare your clues. What changed your mind?',
};

export function storyTheme(story) {
  if (THEMES.includes(story?.atmosphere)) return story.atmosphere;
  const title = String(story?.title || '').toLowerCase();
  if (title.includes('mercy hollow')) return 'witch';
  if (title.includes('blackthorn')) return 'farm';
  if (title.includes('briar house')) return 'victorian';
  return 'manor';
}

export function createTransitionTracker() {
  let previous = null;
  const seen = new Set();
  return state => {
    const identity = `${state.room}|${state.me || 'host'}`;
    const key = `${identity}|${state.phase}|${state.roundIndex}`;
    const events = [];
    if (previous && previous.room === state.room) {
      if (state.me && state.me !== previous.me) events.push('character');
      if ((state.phase !== previous.phase || state.roundIndex !== previous.roundIndex) &&
          !seen.has(key) && ['lobby', 'round', 'vote', 'reveal'].includes(state.phase)) {
        events.push(state.phase);
      }
      if (state.phase === 'vote' && state.myVote && state.myVote !== previous.myVote) events.push('sealed');
    }
    seen.add(key);
    previous = { ...state, key };
    return events;
  };
}

export function createAtmosphere() {
  const track = createTransitionTracker();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let effects = true;
  try { effects = localStorage.getItem('gg-effects') !== 'off'; }
  catch (error) { console.warn('Could not read atmosphere preference', error); toast('Atmosphere preferences could not be loaded. Use the controls for this visit.'); }
  let audio = null;
  let sound = false;
  let volume = 0.6;
  let ambient = null;
  let ambienceEnabled = true;
  let phase = 'connecting';
  let timer = null;
  let dimTimer = null;
  let theme = 'manor';
  const activeSounds = new Set();
  const cueIds = new Set();
  const layer = document.createElement('div');
  layer.className = 'atmosphere-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = backdropHtml();
  const photograph = layer.querySelector('.story-photograph');
  photograph.addEventListener('error', () => {
    console.warn('Could not load story background', photograph.getAttribute('src'));
    toast('The background could not load. Your game is still available.');
  });
  document.body.prepend(layer);
  const banner = document.createElement('div');
  banner.className = 'scene-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.hidden = true;
  document.body.append(banner);
  const controls = document.createElement('details');
  controls.className = 'atmosphere-controls';
  controls.innerHTML = `<summary>Atmosphere</summary>
    <label class="check-row"><input type="checkbox" data-effects ${effects ? 'checked' : ''}>Visual effects</label>
    <button type="button" class="secondary small" data-sound aria-pressed="false">Enable sound</button>
    <button type="button" class="secondary small" data-test-sound disabled>Test sound</button>
    <label class="check-row"><input type="checkbox" data-ambience checked>Background ambience (home and preparation only)</label>
    <label class="small">Sound volume <input type="range" data-volume min="0" max="100" value="60" aria-label="Sound volume"></label>
    <p class="small muted" data-audio-status aria-live="polite">Sound is off.</p>
    <p class="small muted">Enable sound for recorded rain and wind on home, setup and story review. Background audio stops when the lobby opens; gameplay uses event sounds only. Test sound plays a chime. Check device volume and browser tab muting.</p>`;
  document.getElementById('app').before(controls);
  const applyPreferences = () => {
    document.body.dataset.effects = effects ? 'on' : 'off';
    document.body.dataset.motion = reducedMotion.matches ? 'reduced' : 'full';
    if (!effects || reducedMotion.matches) {
      document.body.classList.remove('scene-dim');
      document.querySelectorAll('.event-enter,.event-character,.event-reveal,.event-sealed').forEach(el => {
        el.classList.remove('event-enter', 'event-character', 'event-reveal', 'event-sealed');
      });
    }
  };
  applyPreferences();
  reducedMotion.addEventListener('change', applyPreferences);
  controls.querySelector('[data-effects]').addEventListener('change', event => {
    effects = event.target.checked;
    try { localStorage.setItem('gg-effects', effects ? 'on' : 'off'); }
    catch (error) { console.warn('Could not save atmosphere preference', error); toast('Effects changed for this visit; the preference could not be saved.'); }
    applyPreferences();
  });
  controls.querySelector('[data-sound]').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      if (!audio) {
        if (!window.AudioContext) throw new Error('Audio is not supported by this browser.');
        audio = new AudioContext();
        ambient = createAmbientAudio(audio, error => {
          console.warn('Background ambience unavailable', error);
          toast('The background recording could not play. Event sounds are still available; toggle Background ambience to retry.');
        });
      }
      if (!sound) {
        ambient.stop();
        await audio.resume();
        if (audio.state !== 'running') throw new Error(`Audio remained ${audio.state}.`);
      }
      sound = !sound;
      if (!sound) {
        for (const oscillator of activeSounds) oscillator.stop();
        activeSounds.clear();
      }
      button.textContent = sound ? 'Mute sound' : 'Enable sound';
      button.setAttribute('aria-pressed', String(sound));
      controls.querySelector('[data-test-sound]').disabled = !sound;
      if (sound) play('round');
      syncAmbience();
    } catch (error) {
      console.warn('Atmosphere audio unavailable', error);
      toast('Sound could not start. You can continue playing without it.');
    } finally {
      button.disabled = false;
    }
  });
  controls.querySelector('[data-volume]').addEventListener('input', event => {
    volume = Number(event.target.value) / 100;
    syncAmbience();
  });
  controls.querySelector('[data-ambience]').addEventListener('change', event => {
    ambienceEnabled = event.target.checked;
    syncAmbience();
  });
  document.addEventListener('visibilitychange', syncAmbience);
  window.addEventListener('pagehide', () => ambient?.stop());
  function syncAmbience() {
    ambient?.update({ phase, theme, volume, visible: !document.hidden, enabled: sound && ambienceEnabled });
    controls.querySelector('[data-audio-status]').textContent = !sound ? 'Sound is off.' :
      !ambientTrack(phase, theme) ? 'Game pages: event sounds only. Background ambience is stopped.' :
      ambienceEnabled ? 'Background ambience enabled. Event sounds are also on.' : 'Background ambience off. Event sounds are on.';
  }
  controls.querySelector('[data-test-sound]').addEventListener('click', async () => {
    try {
      await audio.resume();
      play('sting');
      syncAmbience();
    } catch (error) {
      console.warn('Sound test could not start', error);
      toast('Sound could not start. Check your browser and device audio settings.');
    }
  });

  function play(kind) {
    if (!sound || !audio) return;
    if (audio.state !== 'running') {
      toast('Audio is paused by the browser. Open Atmosphere and press Test sound to resume it.');
      return;
    }
    const base = { manor: 392, witch: 349.2, farm: 293.6, victorian: 440 }[theme];
    const notes = kind === 'reveal' || kind === 'sting' ? [base, base * 1.189, base * 1.5] : [base, base * 1.5];
    try {
      notes.forEach((frequency, index) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const start = audio.currentTime + index * 0.17;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3 * volume / notes.length, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(start);
        oscillator.stop(start + 1.15);
        activeSounds.add(oscillator);
        oscillator.onended = () => { activeSounds.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      });
    } catch (error) {
      console.warn('Atmosphere cue failed', error);
      toast('The sound cue could not play.');
    }
  }

  function announce(text) {
    clearTimeout(timer);
    banner.textContent = text;
    banner.hidden = false;
    timer = setTimeout(() => { banner.hidden = true; }, 3500);
  }

  function animate(selector, name) {
    if (!effects || reducedMotion.matches) return;
    const target = document.querySelector(selector);
    if (!target) return;
    target.classList.remove(name);
    void target.offsetWidth;
    target.classList.add(name);
    target.addEventListener('animationend', () => target.classList.remove(name), { once: true });
  }

  function update(state, story) {
    theme = storyTheme(story);
    phase = state.phase;
    syncAmbience();
    document.body.dataset.theme = theme;
    document.body.dataset.phase = state.phase;
    const scene = backdropFor(state.phase, theme);
    if (scene && layer.dataset.scene !== scene) {
      layer.dataset.scene = scene;
      photograph.src = BACKDROPS[scene];
    }
    for (const event of track(state)) {
      const messages = {
        character: 'Your sealed character packet has arrived',
        lobby: 'The doors are open',
        round: `New chapter: ${state.roundTitle || 'New clues have arrived'}`,
        vote: 'The accusation begins',
        reveal: 'The truth is revealed',
        sealed: 'Your accusation is sealed. You may still change your vote.',
      };
      announce(messages[event]);
      if (event === 'character') animate('#character-envelope', 'event-character');
      else if (event === 'reveal') animate('#reveal-killer, #killer-name', 'event-reveal');
      else if (event === 'sealed') animate('#my-vote', 'event-sealed');
      else {
        animate('#phase-card, #app', 'event-enter');
        if (event === 'round') animate('#my-clues', 'event-enter');
      }
      play(event);
    }
  }

  function cue(message) {
    if (!message || typeof message.id !== 'string' || !Object.hasOwn(CUES, message.kind) || cueIds.has(message.id)) return;
    cueIds.add(message.id);
    if (cueIds.size > 100) cueIds.delete(cueIds.values().next().value);
    announce(CUES[message.kind]);
    if (message.kind === 'dim' && effects && !reducedMotion.matches) {
      clearTimeout(dimTimer);
      document.body.classList.add('scene-dim');
      dimTimer = setTimeout(() => document.body.classList.remove('scene-dim'), 8000);
    }
    if (message.kind === 'sting') play('sting');
  }

  return { update, cue };
}

export function hostAtmospherePanel() {
  return `<details class="host-atmosphere"><summary>Host atmosphere controls</summary>
    <p class="small muted">Optional cues appear on connected phones too. They never release clues or advance the game. Sound plays only on devices that enabled it.</p>
    <div class="row">${Object.entries(CUES).map(([kind, text]) => `<button type="button" class="secondary small" data-act="atmosphere-cue" data-cue="${kind}">${esc(kind === 'dim' ? 'Dim lights (8 seconds)' : kind === 'sting' ? 'Play suspense chime' : text)}</button>`).join('')}</div>
  </details>`;
}
