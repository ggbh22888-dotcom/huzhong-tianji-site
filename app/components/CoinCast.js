"use client";
// CoinCast — three coins, six throws, hexagram builds bottom→top. Calls onDone(values) when all six are cast.
import { useState } from "react";
import { shellRattle, coinClink, unlockAudio } from "@/lib/sfx";
import { useLang } from "./Lang";

const rnd = () => (typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] & 1 : Math.random() < 0.5 ? 0 : 1);

function CoinSVG({ side }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="cg" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#f3e3b0" /><stop offset=".55" stopColor="#c9a150" /><stop offset="1" stopColor="#6e5120" /></radialGradient>
        <radialGradient id="cr" cx="50%" cy="50%" r="50%"><stop offset=".86" stopColor="#8a6a2c" /><stop offset=".93" stopColor="#e2c87e" /><stop offset="1" stopColor="#5a4118" /></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill="url(#cr)" />
      <circle cx="50" cy="50" r="43" fill="url(#cg)" stroke="#5a4118" strokeWidth="1" />
      <rect x="39" y="39" width="22" height="22" fill="#15120c" stroke="#e2c87e" strokeWidth="1.5" />
      <rect x="36" y="36" width="28" height="28" fill="none" stroke="#5a4118" strokeWidth="1" />
      {side === "zi" ? (
        <g fill="#3a2a0c" fontFamily="'Noto Serif SC','Songti SC',serif" fontSize="15" fontWeight="600" textAnchor="middle">
          <text x="50" y="30">壺</text><text x="50" y="82">機</text>
          <text x="22" y="56">天</text><text x="78" y="56">中</text>
        </g>
      ) : (
        <g fill="#3a2a0c">
          <circle cx="50" cy="50" r="34" fill="none" stroke="#3a2a0c" strokeWidth="1.6" />
          <circle cx="50" cy="21" r="3" /><circle cx="50" cy="79" r="3" /><circle cx="21" cy="50" r="3" /><circle cx="79" cy="50" r="3" />
        </g>
      )}
    </svg>
  );
}

function Shell({ shaking }) {
  return (
    <div className={`shell ${shaking ? "shake" : ""}`}>
      <svg viewBox="0 0 200 140" width="100%" height="100%">
        <defs>
          <radialGradient id="sh" cx="45%" cy="35%" r="70%"><stop offset="0" stopColor="#8a6a3a" /><stop offset=".55" stopColor="#5b4322" /><stop offset="1" stopColor="#2e2010" /></radialGradient>
          <radialGradient id="shr" cx="50%" cy="50%" r="50%"><stop offset=".8" stopColor="#4a3418" /><stop offset="1" stopColor="#1f1508" /></radialGradient>
        </defs>
        <ellipse cx="100" cy="72" rx="92" ry="60" fill="url(#shr)" />
        <ellipse cx="100" cy="70" rx="80" ry="50" fill="url(#sh)" stroke="#2a1c0b" strokeWidth="2" />
        <g fill="none" stroke="#c9a24d" strokeWidth="1.2" opacity=".55">
          <path d="M100 22 L130 40 L124 72 L100 86 L76 72 L70 40 Z" />
          <path d="M70 40 L48 36 L34 58 L44 86 L76 72" /><path d="M130 40 L152 36 L166 58 L156 86 L124 72" />
          <path d="M100 22 L88 24 L70 40" /><path d="M100 22 L112 24 L130 40" />
          <path d="M100 86 L90 108 L44 86" /><path d="M100 86 L110 108 L156 86" />
          <ellipse cx="100" cy="70" rx="80" ry="50" strokeDasharray="4 6" />
        </g>
        <ellipse cx="100" cy="66" rx="34" ry="18" fill="#15100a" opacity=".85" />
        <text x="100" y="60" textAnchor="middle" fill="#c9a24d" fontSize="11" fontFamily="'Noto Serif SC',serif" letterSpacing="2" opacity=".8">壺中天機</text>
      </svg>
    </div>
  );
}

export default function CoinCast({ onDone, disabled }) {
  const { t } = useLang();
  const YN = t("yao_names").split(",");
  const [values, setValues] = useState([]);     // 6,7,8,9 bottom→top
  const [coins, setCoins] = useState([null, null, null]); // last throw faces: 1=背(阳) 0=字(阴)
  const [spinning, setSpinning] = useState(false);
  const [shown, setShown] = useState(3); // how many coins have emerged this throw

  function throwOnce() {
    if (spinning || values.length >= 6) return;
    unlockAudio();
    setSpinning(true);
    setCoins([null, null, null]); setShown(0);
    const faces = [rnd(), rnd(), rnd()];
    shellRattle({ dur: 1.1 });
    // coins emerge one by one: left, center, right
    const pans = [-0.7, 0, 0.7];
    faces.forEach((f, i) => {
      const at = 1250 + i * 420;
      setTimeout(() => {
        coinClink({ p: pans[i], pitch: f ? 1 : 0.93 });
        coinClink({ p: pans[i], t: 0.11, pitch: f ? 1.04 : 0.97 });
        setCoins((c) => { const n = [...c]; n[i] = f; return n; });
        setShown(i + 1);
      }, at);
    });
    setTimeout(() => {
      const v = faces.reduce((a, f) => a + (f ? 3 : 2), 0);
      const next = [...values, v];
      setValues(next);
      setSpinning(false);
      if (next.length === 6) onDone && onDone(next);
    }, 1250 + 3 * 420 + 350);
  }
  function reset() { setValues([]); setCoins([null, null, null]); setShown(3); }

  const n = values.length;
  return (
    <div className="coincast">
      <Shell shaking={spinning && shown === 0} />
      <div className="coins">
        {coins.map((f, i) => (
          <div key={i} className={`coin ${i < shown ? "drop" : "hidden"} ${f === null ? "" : f ? "bei" : "zi"}`}>
            <div className="face front"><CoinSVG side="zi" /></div><div className="face back"><CoinSVG side="bei" /></div>
          </div>
        ))}
      </div>
      <div className="hexbuild">
        {[5, 4, 3, 2, 1, 0].map((i) => {
          const v = values[i];
          return (
            <div key={i} className={`yao ${v === undefined ? "empty" : ""} ${v === 6 || v === 9 ? "chg" : ""}`}>
              {v === undefined ? <span className="ph">{YN[i]}{t("yao")}</span>
                : v % 2 === 1 ? <span className="yang" /> : <><span className="yin" /><span className="yin" /></>}
              {v !== undefined && <small>{v === 6 ? t("old_yin") : v === 9 ? t("old_yang") : v === 7 ? t("young_yang") : t("young_yin")}</small>}
            </div>
          );
        })}
      </div>
      <div className="row" style={{ justifyContent: "center", gap: 10 }}>
        <button type="button" className="throw" onClick={throwOnce} disabled={disabled || spinning || n >= 6}>
          {n >= 6 ? t("cc_done") : spinning ? (shown === 0 ? t("cc_shake") : t("cc_fall")) : t("cc_throw", { n: n + 1 })}
        </button>
        {n > 0 && n < 6 && <button type="button" className="ghost" onClick={reset} disabled={spinning}>{t("cc_reset")}</button>}
      </div>
      <p className="muted small" style={{ textAlign: "center" }}>{t("cc_hint")}</p>
    </div>
  );
}
