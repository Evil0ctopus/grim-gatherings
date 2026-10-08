// Mafia sound effects, synthesized with WebAudio so no audio files are needed.
// Browsers only allow audio after a tap, so call unlock() from a click handler first.
export function createSounds() {
  let ctx = null;
  let enabled = true;

  function audio() {
    if (!enabled) return null;
    if (!ctx) {
      const C = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C(); } catch { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function master(c, level) {
    const g = c.createGain();
    g.gain.value = level;
    g.connect(c.destination);
    return g;
  }

  function noise(c, seconds) {
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    return src;
  }

  function env(c, param, t, peak, attack, decay, floor = 0.0001) {
    param.setValueAtTime(floor, t);
    param.exponentialRampToValueAtTime(peak, t + attack);
    param.exponentialRampToValueAtTime(floor, t + attack + decay);
  }

  function tone(c, out, { type = 'sine', freq, t, peak = 0.3, attack = 0.01, decay = 1, detune = 0 }) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
    env(c, g.gain, t, peak, attack, decay);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + attack + decay + 0.05);
    return o;
  }

  // Sharp crack, low body thump, then a room echo.
  function gunshot() {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.02, out = master(c, 0.9);
    const crack = noise(c, 0.6), hp = c.createBiquadFilter(), cg = c.createGain();
    hp.type = 'highpass'; hp.frequency.value = 900;
    env(c, cg.gain, t, 1, 0.002, 0.25);
    crack.connect(hp).connect(cg).connect(out); crack.start(t); crack.stop(t + 0.6);
    const body = noise(c, 0.8), lp = c.createBiquadFilter(), bg = c.createGain();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(1800, t); lp.frequency.exponentialRampToValueAtTime(120, t + 0.5);
    env(c, bg.gain, t, 1, 0.003, 0.55);
    body.connect(lp).connect(bg).connect(out); body.start(t); body.stop(t + 0.8);
    const thump = c.createOscillator(), tg = c.createGain();
    thump.frequency.setValueAtTime(140, t); thump.frequency.exponentialRampToValueAtTime(38, t + 0.35);
    env(c, tg.gain, t, 0.9, 0.003, 0.4);
    thump.connect(tg).connect(out); thump.start(t); thump.stop(t + 0.5);
    const echo = noise(c, 1.4), el = c.createBiquadFilter(), eg = c.createGain();
    el.type = 'lowpass'; el.frequency.value = 600;
    env(c, eg.gain, t + 0.18, 0.25, 0.04, 1.1);
    echo.connect(el).connect(eg).connect(out); echo.start(t + 0.18); echo.stop(t + 1.6);
  }

  // Heavenly rising arpeggio with a shimmering pad underneath.
  function chime() {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.02, out = master(c, 0.55);
    [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => {
      tone(c, out, { freq: f, t: t + i * 0.14, peak: 0.28, attack: 0.01, decay: 1.8 });
      tone(c, out, { freq: f * 2.01, t: t + i * 0.14, peak: 0.06, attack: 0.01, decay: 0.9 });
    });
    [523.25, 659.25, 783.99].forEach(f => tone(c, out, { type: 'triangle', freq: f, t: t + 0.3, peak: 0.07, attack: 0.6, decay: 2.4, detune: 6 }));
  }

  // Sad muted-trombone "wah wah wah waaah": descending notes through an opening/closing filter.
  function wahwah() {
    const c = audio(); if (!c) return;
    const t0 = c.currentTime + 0.02, out = master(c, 0.5);
    const notes = [[311.13, 0.42], [293.66, 0.42], [277.18, 0.42], [261.63, 1.5]];
    let t = t0;
    notes.forEach(([f, len], i) => {
      const o = c.createOscillator(), filt = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t);
      filt.type = 'lowpass'; filt.Q.value = 7;
      filt.frequency.setValueAtTime(250, t);
      filt.frequency.linearRampToValueAtTime(1300, t + Math.min(0.18, len / 2));
      filt.frequency.linearRampToValueAtTime(300, t + len);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.04);
      g.gain.setValueAtTime(0.5, t + len - 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      if (i === notes.length - 1) {
        const lfo = c.createOscillator(), depth = c.createGain();
        lfo.frequency.value = 5.5; depth.gain.value = 7;
        lfo.connect(depth).connect(o.frequency); lfo.start(t + 0.3); lfo.stop(t + len);
        o.frequency.linearRampToValueAtTime(f * 0.94, t + len);
      }
      o.connect(filt).connect(g).connect(out);
      o.start(t); o.stop(t + len + 0.02);
      t += len + 0.04;
    });
  }

  // Low swelling drone as the town falls asleep.
  function nightfall() {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.02, out = master(c, 0.4);
    [[55, 0.35], [82.4, 0.2], [110, 0.1]].forEach(([f, p]) => {
      const o = tone(c, out, { freq: f, t, peak: p, attack: 1.2, decay: 2.6 });
      o.frequency.exponentialRampToValueAtTime(f * 0.92, t + 3.8);
    });
    [880, 698.46].forEach((f, i) => tone(c, out, { type: 'triangle', freq: f, t: t + 0.4 + i * 0.5, peak: 0.05, attack: 0.05, decay: 1.4 }));
  }

  // Bright open fifths as dawn breaks.
  function daybreak() {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.02, out = master(c, 0.4);
    [[261.63, 0], [392, 0.18], [523.25, 0.36], [783.99, 0.54]].forEach(([f, d]) => tone(c, out, { type: 'triangle', freq: f, t: t + d, peak: 0.22, attack: 0.08, decay: 1.6 }));
  }

  // Deep drum hit for a verdict.
  function gavel() {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.02, out = master(c, 0.8);
    [0, 0.32].forEach(d => {
      const o = tone(c, out, { freq: 120, t: t + d, peak: 0.9, attack: 0.004, decay: 0.6 });
      o.frequency.exponentialRampToValueAtTime(45, t + d + 0.5);
      const n = noise(c, 0.1), g = c.createGain();
      env(c, g.gain, t + d, 0.4, 0.002, 0.08);
      n.connect(g).connect(out); n.start(t + d); n.stop(t + d + 0.1);
    });
  }

  function tick() {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.01, out = master(c, 0.35);
    tone(c, out, { type: 'square', freq: 1500, t, peak: 0.25, attack: 0.001, decay: 0.05 });
  }

  function timeUp() {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.02, out = master(c, 0.5);
    [0, 0.45, 0.9].forEach(d => {
      tone(c, out, { freq: 440, t: t + d, peak: 0.3, attack: 0.005, decay: 1.2 });
      tone(c, out, { freq: 1102, t: t + d, peak: 0.1, attack: 0.005, decay: 0.7 });
    });
  }

  // Triumphant major brass for the town; slow ominous minor descent for the mafia.
  function fanfare(team) {
    const c = audio(); if (!c) return;
    const t = c.currentTime + 0.02, out = master(c, 0.45);
    const seq = team === 'town'
      ? [[392, 0, 0.25], [523.25, 0.22, 0.25], [659.25, 0.44, 0.25], [783.99, 0.66, 1.6], [523.25, 0.66, 1.6], [659.25, 0.66, 1.6]]
      : [[146.83, 0, 0.9], [138.59, 0.8, 0.9], [130.81, 1.6, 0.9], [98, 2.4, 2.4], [138.59, 2.4, 2.4], [116.54, 2.4, 2.4]];
    for (const [f, d, len] of seq) {
      const o = c.createOscillator(), filt = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      filt.type = 'lowpass'; filt.frequency.value = team === 'town' ? 2200 : 700;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.22, t + d + 0.05);
      g.gain.setValueAtTime(0.22, t + d + len * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + len);
      o.connect(filt).connect(g).connect(out);
      o.start(t + d); o.stop(t + d + len + 0.05);
    }
  }

  const effects = { gunshot, chime, wahwah, nightfall, daybreak, gavel, tick, timeUp, fanfare };
  return {
    ...effects,
    play(name, ...args) {
      try { globalThis.dispatchEvent?.(new CustomEvent('mafia-sound', { detail: { name, args, enabled } })); } catch {}
      try { effects[name]?.(...args); } catch (e) { console.warn('[mafia] sound failed', e); }
    },
    after(ms, name, ...args) { setTimeout(() => this.play(name, ...args), ms); },
    unlock() { audio(); },
    get enabled() { return enabled; },
    set enabled(v) { enabled = !!v; if (!enabled && ctx) ctx.suspend().catch(() => {}); },
  };
}
