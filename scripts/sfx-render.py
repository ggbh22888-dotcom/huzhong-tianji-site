# Offline modal-synthesis of ritual sounds → wav (then ffmpeg → mp3/ogg)
import numpy as np, scipy.signal as sg, os
SR = 44100
rng = np.random.default_rng(7)
OUT = os.path.dirname(__file__)

def modal(freqs, amps, decays, dur, excite_ms=1.5, noise_bw=None, brightness=1.0):
    """Struck resonator: short noise burst → bank of damped sinusoids (approx. by filtering impulse)."""
    n = int(SR * dur); t = np.arange(n) / SR
    out = np.zeros(n)
    # excitation: short noise burst with fast decay
    ne = int(SR * excite_ms / 1000)
    exc = rng.normal(size=n) * np.exp(-np.arange(n) / max(ne, 1)) * (np.arange(n) < ne * 6)
    for f, a, d in zip(freqs, amps, decays):
        if f >= SR / 2: continue
        # resonator via 2-pole bandpass with decay d (seconds to -60dB)
        r = np.exp(-6.91 / (d * SR))
        b = [1 - r]; aa = [1, -2 * r * np.cos(2 * np.pi * f / SR), r * r]
        out += a * sg.lfilter(b, aa, exc) * (brightness if f > 1500 else 1)
    return out

def env(x, attack=0.0005, release=None):
    n = len(x); e = np.ones(n)
    a = int(SR * attack); e[:a] = np.linspace(0, 1, a)
    if release:
        rl = int(SR * release); e[-rl:] *= np.linspace(1, 0, rl)
    return x * e

def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1; return x / m * peak

def place(canvas, x, at, gain=1.0, pan=0.0):
    """mix mono x into stereo canvas at time `at` (s) with constant-power pan (-1..1)"""
    i = int(at * SR); n = min(len(x), canvas.shape[0] - i)
    if n <= 0: return
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    canvas[i:i + n, 0] += x[:n] * gain * l; canvas[i:i + n, 1] += x[:n] * gain * r

def save(name, stereo):
    from scipy.io import wavfile
    s = norm(stereo, 0.85)
    wavfile.write(f"{OUT}/{name}.wav", SR, (s * 32767).astype(np.int16))

# ---------- 1. 木筊 (hardwood block, ~ 4cm, hitting stone floor) ----------
def wood_hit(pitch=1.0, hard=1.0):
    # wood block modes: inharmonic, fast decay; plus floor thud
    f0 = 740 * pitch
    freqs = [f0, f0 * 1.52, f0 * 2.31, f0 * 3.04, f0 * 4.2]
    amps = [1.0, 0.55, 0.35, 0.2, 0.1]
    decays = [0.09, 0.06, 0.045, 0.03, 0.02]
    w = modal(freqs, amps, decays, 0.35, excite_ms=0.8)
    thud = modal([95, 140], [1.0, 0.4], [0.08, 0.05], 0.35, excite_ms=2.5) * 0.9
    return env(w + thud * hard, release=0.05)

def jiao_toss():
    dur = 2.2; c = np.zeros((int(SR * dur), 2))
    # two blocks land ~150ms apart; each: main hit, 2-3 bounces (shorter, higher), roll
    for k, (t0, pan, pitch) in enumerate([(0.00, -0.5, 1.0), (0.17, 0.5, 0.92)]):
        place(c, wood_hit(pitch, 1.0), t0, 1.0, pan)
        bounce_gaps = [0.095, 0.065, 0.045, 0.03]
        tt = t0; g = 0.6
        for bg in bounce_gaps:
            tt += bg; g *= 0.62
            place(c, wood_hit(pitch * (1 + 0.04 * rng.normal()), 0.5), tt, g, pan * 0.9)
        # roll: rapid soft wooden ticks, decelerating
        tt += 0.03; g = 0.22
        for i in range(9):
            tt += 0.022 + i * 0.006; g *= 0.85
            place(c, wood_hit(pitch * 1.3, 0.2) * 0.6, tt, g, pan * (0.9 - i * 0.05))
    save("jiao_toss", c)

# ---------- 2. 铜钱 (bronze coin, 2.5cm, with square hole) ----------
def coin_ring(pitch=1.0, dur=0.9):
    f0 = 3150 * pitch
    freqs = [f0, f0 * 1.47, f0 * 2.09, f0 * 2.83, f0 * 0.62]
    amps = [1.0, 0.5, 0.3, 0.15, 0.25]
    decays = [0.55, 0.35, 0.25, 0.15, 0.3]
    return env(modal(freqs, amps, decays, dur, excite_ms=0.4), release=0.1)

def table_thud():
    return env(modal([160, 240, 410], [1, 0.5, 0.25], [0.12, 0.08, 0.05], 0.3, excite_ms=2.0) * 0.8, release=0.05)

def coin_drop(pan=0.0, pitch=1.0, name=None):
    dur = 1.8; c = np.zeros((int(SR * dur), 2))
    # falls on wooden table: ring + thud, bounces, then wobble/spin to rest
    place(c, coin_ring(pitch), 0.0, 1.0, pan); place(c, table_thud(), 0.0, 0.9, pan)
    tt = 0; g = 0.7
    for bg in [0.11, 0.08, 0.06, 0.045, 0.035]:
        tt += bg; g *= 0.6
        place(c, coin_ring(pitch * (1 + 0.02 * rng.normal()), 0.5), tt, g, pan); place(c, table_thud(), tt, g * 0.6, pan)
    # wobble: ticks accelerating, fading (coin settling flat)
    tt += 0.05; g = 0.35
    for i in range(22):
        tt += max(0.075 - i * 0.003, 0.012); g *= 0.9
        place(c, coin_ring(pitch * 1.1, 0.12) * 0.7, tt, g, pan + 0.05 * np.sin(i))
    save(name or f"coin_drop", c)

# ---------- 3. 龟壳摇 (coins rattling inside hollow shell) ----------
def shell_shake():
    dur = 2.4; c = np.zeros((int(SR * dur), 2))
    # 3 shakes; inside each: many coin-coin clicks + coin-on-shell knocks, through a hollow body resonance
    body_ir = modal([310, 520, 790, 1180], [1, 0.6, 0.35, 0.2], [0.07, 0.05, 0.04, 0.03], 0.15, excite_ms=0.3)
    body_ir = body_ir / (np.max(np.abs(body_ir)) or 1)
    for s in range(3):
        base = s * 0.62
        hits = 14
        for i in range(hits):
            t = base + (i / hits) * 0.44 + rng.uniform(0, 0.015)
            pan = 0.55 * np.sin(i * 1.7 + s * 0.4)
            # coin-on-coin: short bronze click (muffled, dampened by hand/shell)
            click = coin_ring(rng.uniform(0.85, 1.15), 0.12) * 0.5
            place(c, click, t, 0.45 * rng.uniform(0.6, 1.0), pan)
            # coin-on-shell: knock through body resonance
            if i % 2 == 0:
                knock = modal([620, 900], [1, 0.5], [0.03, 0.02], 0.1, excite_ms=0.5)
                knock = sg.fftconvolve(knock, body_ir)[: int(SR * 0.25)]
                place(c, knock, t, 0.7 * rng.uniform(0.6, 1.0), pan)
    # muffle whole thing a bit (hand over shell): lowpass
    b, a = sg.butter(2, 3800 / (SR / 2)); c = sg.lfilter(b, a, c, axis=0)
    save("shell_shake", c)

# ---------- 4. 铜磬 (temple bowl) ----------
def temple_bowl():
    dur = 4.0; c = np.zeros((int(SR * dur), 2))
    f0 = 528
    freqs = [f0, f0 * 2.0, f0 * 2.98, f0 * 4.1, f0 * 5.4]
    amps = [1.0, 0.45, 0.22, 0.1, 0.05]
    decays = [3.6, 2.6, 1.8, 1.2, 0.8]
    bowl = modal(freqs, amps, decays, dur, excite_ms=1.2)
    # slow beating (two close partials) for shimmer
    beat = modal([f0 * 1.004], [0.5], [3.2], dur, excite_ms=1.2)
    x = env(bowl + beat, release=0.3)
    place(c, x, 0.0, 1.0, -0.1); place(c, x * 0.9, 0.012, 1.0, 0.1)
    save("temple_bowl", c)

jiao_toss(); shell_shake(); temple_bowl()
coin_drop(0, 1.0, "coin_drop_a"); coin_drop(0, 0.94, "coin_drop_b"); coin_drop(0, 1.06, "coin_drop_c")
print("ok")
