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

/* ===== 传统质感版 ===== */
/** 木筊落在石板/地砖上：一声实木主响 + 两三次递减弹跳 + 短促滚动 */
export function blockLand({ p = 0, t = 0, pitch = 1 } = {}) {
  woodClack({ p, t, pitch });
  woodClack({ p: p * 0.9, t: t + 0.11, pitch: pitch * 1.06 });
  woodClack({ p: p * 0.8, t: t + 0.19, pitch: pitch * 1.1 });
  const c = ac(); if (!c) return; const now = c.currentTime + t + 0.26;
  // 滚动：一串快速衰减的轻碰
  for (let i = 0; i < 6; i++) {
    const tt = now + i * 0.045 + Math.random() * 0.01;
    const o = c.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(420 * pitch, tt); o.frequency.exponentialRampToValueAtTime(200 * pitch, tt + 0.04);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.22 / (i + 1), tt + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.06);
    const P = pan(c, p * (1 - i * 0.1)); o.connect(g).connect(P).connect(c.destination); o.start(tt); o.stop(tt + 0.07);
  }
}

/** 龟壳摇卦：铜钱在壳内闷响碰撞（低通），三下一组「哗啦、哗啦、哗啦」 */
export function shellShakeTraditional({ t = 0, shakes = 3 } = {}) {
  const c = ac(); if (!c) return;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; lp.Q.value = 0.7;
  const master = c.createGain(); master.gain.value = 0.9; lp.connect(master).connect(c.destination);
  const dur = 0.42, gap = 0.16;
  for (let s = 0; s < shakes; s++) {
    const base = t + s * (dur + gap);
    const hits = 9 + Math.floor(Math.random() * 4);
    for (let i = 0; i < hits; i++) {
      const tt = c.currentTime + base + (i / hits) * dur + Math.random() * 0.02;
      const side = Math.sin(i * 2.3 + s) * 0.6;
      const P = pan(c, side); P.connect(lp);
      // 铜钱对铜钱：短促金属
      [[1900, 0.09], [3100, 0.06], [820, 0.12]].forEach(([f, d]) => {
        const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f * (0.9 + Math.random() * 0.2);
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.18, tt + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, tt + d);
        o.connect(g).connect(P); o.start(tt); o.stop(tt + d + 0.02);
      });
      // 铜钱撞壳壁：空心木/骨质闷响
      if (i % 3 === 0) {
        const o = c.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(260, tt); o.frequency.exponentialRampToValueAtTime(140, tt + 0.08);
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.35, tt + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12);
        o.connect(g).connect(P); o.start(tt); o.stop(tt + 0.14);
      }
    }
  }
  return shakes * (dur + gap);
}

/** 铜钱倒在木桌上：主响 + 递减弹跳 + 旋转抖动（wobble）后静止 */
export function coinLand({ p = 0, t = 0, pitch = 1 } = {}) {
  coinClink({ p, t, pitch });
  coinClink({ p, t: t + 0.09, pitch: pitch * 1.02 });
  coinClink({ p, t: t + 0.16, pitch: pitch * 1.03 });
  const c = ac(); if (!c) return; const start = c.currentTime + t + 0.22;
  // wobble：间隔由长到短、音量递减的轻敲，模拟铜钱转圈停下
  let acc = 0;
  for (let i = 0; i < 14; i++) {
    const interval = 0.11 - i * 0.0065; acc += Math.max(interval, 0.02);
    const tt = start + acc;
    const o = c.createOscillator(); o.type = "sine"; o.frequency.value = 2400 * pitch;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.16 * (1 - i / 15), tt + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.03);
    const P = pan(c, p); o.connect(g).connect(P).connect(c.destination); o.start(tt); o.stop(tt + 0.04);
  }
  // 木桌共鸣
  const o = c.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(180, c.currentTime + t); o.frequency.exponentialRampToValueAtTime(110, c.currentTime + t + 0.1);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, c.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + 0.15);
  const P = pan(c, p); o.connect(g).connect(P).connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.17);
}

/** 得圣杯：一声低沉铜磬（庙里的那种），而非清脆铃 */
export function templeBowl({ t = 0 } = {}) {
  const c = ac(); if (!c) return; const now = c.currentTime + t;
  [[523, 2.6, 0.4], [1046, 2.0, 0.18], [1568, 1.4, 0.08], [2093, 1.0, 0.05]].forEach(([f, dur, a]) => {
    const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(a, now + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(c.destination); o.start(now); o.stop(now + dur + 0.05);
  });
  // 敲击瞬态
  const n = noise(c, 0.015); const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800;
  const ng = c.createGain(); ng.gain.setValueAtTime(0.2, now); ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
  n.connect(bp).connect(ng).connect(c.destination); n.start(now); n.stop(now + 0.02);
}
