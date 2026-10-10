"use client";
// CoinCast — three coins, six throws, hexagram builds bottom→top. Calls onDone(values) when all six are cast.
import { useState } from "react";

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

export default function CoinCast({ onDone, disabled }) {
  const [values, setValues] = useState([]);     // 6,7,8,9 bottom→top
  const [coins, setCoins] = useState([null, null, null]); // last throw faces: 1=背(阳) 0=字(阴)
  const [spinning, setSpinning] = useState(false);

  function throwOnce() {
    if (spinning || values.length >= 6) return;
    setSpinning(true);
    setCoins([null, null, null]);
    setTimeout(() => {
      const faces = [rnd(), rnd(), rnd()];
      const v = faces.reduce((a, f) => a + (f ? 3 : 2), 0);
      setCoins(faces);
      const next = [...values, v];
      setValues(next);
      setSpinning(false);
      if (next.length === 6) onDone && onDone(next);
    }, 900);
  }
  function reset() { setValues([]); setCoins([null, null, null]); }

  const n = values.length;
  return (
    <div className="coincast">
      <div className="coins">
        {coins.map((f, i) => (
          <div key={i} className={`coin ${spinning ? "spin" : ""} ${f === null ? "" : f ? "bei" : "zi"}`}>
            <div className="face front"><CoinSVG side="zi" /></div><div className="face back"><CoinSVG side="bei" /></div>
          </div>
        ))}
      </div>
      <div className="hexbuild">
        {[5, 4, 3, 2, 1, 0].map((i) => {
          const v = values[i];
          return (
            <div key={i} className={`yao ${v === undefined ? "empty" : ""} ${v === 6 || v === 9 ? "chg" : ""}`}>
              {v === undefined ? <span className="ph">{["初", "二", "三", "四", "五", "上"][i]}爻</span>
                : v % 2 === 1 ? <span className="yang" /> : <><span className="yin" /><span className="yin" /></>}
              {v !== undefined && <small>{v === 6 ? "老阴 ○" : v === 9 ? "老阳 ×" : v === 7 ? "少阳" : "少阴"}</small>}
            </div>
          );
        })}
      </div>
      <div className="row" style={{ justifyContent: "center", gap: 10 }}>
        <button type="button" className="throw" onClick={throwOnce} disabled={disabled || spinning || n >= 6}>
          {n >= 6 ? "六爻已成" : spinning ? "铜钱在转……" : `摇第 ${n + 1} 爻`}
        </button>
        {n > 0 && n < 6 && <button type="button" className="ghost" onClick={reset} disabled={spinning}>重摇</button>}
      </div>
      <p className="muted small" style={{ textAlign: "center" }}>静心，默念问题，每摇一次成一爻，自下而上，共六次。</p>
    </div>
  );
}
