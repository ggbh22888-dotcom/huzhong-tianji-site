// lib/sfx.js — synthesized stereo sound effects (Web Audio, no files). All calls are safe no-ops on the server.
let ctx = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function pan(c, p) { if (c.createStereoPanner) { const n = c.createStereoPanner(); n.pan.value = p; return n; } const g = c.createGain(); return g; }
function noise(c, dur) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = buf; return s;
}

/** 木块落地：短促的敲木声 */
export function woodClack({ p = 0, t = 0, pitch = 1 } = {}) {
  const c = ac(); if (!c) return; const now = c.currentTime + t;
  const o = c.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(620 * pitch, now); o.frequency.exponentialRampToValueAtTime(180 * pitch, now + 0.08);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.6, now + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  const n = noise(c, 0.05); const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2200 * pitch; bp.Q.value = 1.2;
  const ng = c.createGain(); ng.gain.setValueAtTime(0.35, now); ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  const P = pan(c, p); o.connect(g).connect(P); n.connect(bp).connect(ng).connect(P); P.connect(c.destination);
  o.start(now); o.stop(now + 0.16); n.start(now); n.stop(now + 0.05);
}

/** 铜钱落在龟壳/桌面：金属叮声，带余韵 */
export function coinClink({ p = 0, t = 0, pitch = 1 } = {}) {
  const c = ac(); if (!c) return; const now = c.currentTime + t;
  const P = pan(c, p); P.connect(c.destination);
  [[2850, 0.5, 0.5], [4300, 0.25, 0.35], [6100, 0.12, 0.25], [1450, 0.18, 0.4]].forEach(([f, a, dur], i) => {
    const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f * pitch * (1 + (Math.random() - 0.5) * 0.02);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(a * 0.5, now + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(P); o.start(now); o.stop(now + dur + 0.02);
  });
  const n = noise(c, 0.02); const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 5000;
  const ng = c.createGain(); ng.gain.setValueAtTime(0.25, now); ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
  n.connect(hp).connect(ng).connect(P); n.start(now); n.stop(now + 0.02);
}

/** 龟壳摇晃：铜钱在壳里来回碰撞，左右声道交替 */
export function shellRattle({ dur = 1.2, t = 0 } = {}) {
  const c = ac(); if (!c) return;
  const n = Math.floor(dur / 0.09);
  for (let i = 0; i < n; i++) {
    const tt = t + i * 0.09 + Math.random() * 0.03;
    const side = Math.sin(i * 1.9) * 0.8;
    coinClink({ p: side, t: tt, pitch: 0.55 + Math.random() * 0.25 });
    if (i % 2 === 0) woodClack({ p: -side * 0.5, t: tt + 0.02, pitch: 0.7 });
  }
}

/** 轻轻一声磬，用于圣杯得允 */
export function chime({ t = 0 } = {}) {
  const c = ac(); if (!c) return; const now = c.currentTime + t;
  [[1046, 1.6], [2093, 1.0], [3135, 0.6]].forEach(([f, dur], i) => {
    const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.35 / (i + 1), now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    const P = pan(c, (i - 1) * 0.3); o.connect(g).connect(P).connect(c.destination); o.start(now); o.stop(now + dur + 0.05);
  });
}

export function unlockAudio() { ac(); }
