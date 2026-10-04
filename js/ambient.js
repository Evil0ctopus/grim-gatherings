const TRACKS = {
  rain: new URL('../assets/audio/rain.ogg', import.meta.url).href,
  wind: new URL('../assets/audio/howling-wind.ogg', import.meta.url).href,
};

export function ambientTrack(phase, theme) {
  if (!['home', 'setup', 'review'].includes(phase)) return null;
  return phase === 'home' || (phase === 'review' && theme === 'victorian') ? 'rain' : 'wind';
}

export function createAmbientAudio(context, reportError) {
  const buffers = new Map();
  let revision = 0;
  let requested = null;
  let playing = null;
  let level = 0;

  function stop() {
    revision++;
    requested = null;
    if (!playing) return;
    playing.source.stop();
    playing.source.disconnect();
    playing.filter.disconnect();
    playing.gain.disconnect();
    playing = null;
  }

  async function load(track) {
    if (!buffers.has(track)) {
      const promise = (async () => {
        const response = await fetch(TRACKS[track]);
        if (!response.ok) throw new Error(`Ambient recording returned HTTP ${response.status}.`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        let peak = 0;
        let energy = 0;
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          for (const sample of buffer.getChannelData(channel)) {
            peak = Math.max(peak, Math.abs(sample));
            energy += sample * sample;
          }
        }
        if (!peak) throw new Error('The ambient recording contains no sound.');
        const rms = Math.sqrt(energy / (buffer.length * buffer.numberOfChannels));
        const normalization = Math.min(0.85 / peak, 0.14 / rms);
        // Soften recording boundaries without scheduling any recurring timers.
        const edge = Math.min(Math.floor(buffer.sampleRate * 0.25), Math.floor(buffer.length / 2));
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const samples = buffer.getChannelData(channel);
          for (let i = 0; i < samples.length; i++) samples[i] *= normalization;
          for (let i = 0; i < edge; i++) {
            samples[i] *= i / edge;
            samples[buffer.length - 1 - i] *= i / edge;
          }
        }
        return buffer;
      })();
      buffers.set(track, promise);
      promise.catch(() => buffers.delete(track));
    }
    return buffers.get(track);
  }

  async function update({ phase, theme, enabled, visible, volume }) {
    const track = enabled && visible ? ambientTrack(phase, theme) : null;
    level = volume * 0.3;
    if (!track) return stop();
    if (requested === track) {
      if (playing) playing.gain.gain.setTargetAtTime(level, context.currentTime, 0.08);
      return;
    }
    stop();
    requested = track;
    const ticket = revision;
    try {
      const buffer = await load(track);
      // A lobby/round transition or mute may happen while a recording is loading.
      if (ticket !== revision || requested !== track) return;
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = 'lowpass';
      filter.frequency.value = track === 'wind' ? 1800 : 3200;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(level, context.currentTime + 1.2);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      playing = { source, filter, gain };
      source.start();
    } catch (error) {
      if (ticket !== revision) return;
      stop();
      reportError(error);
    }
  }

  return { update, stop };
}
