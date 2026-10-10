"use client";
// CoinCast — three coins, six throws, hexagram builds bottom→top. Calls onDone(values) when all six are cast.
import { useState } from "react";

const rnd = () => (typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] & 1 : Math.random() < 0.5 ? 0 : 1);

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
            <div className="face front">字</div><div className="face back">背</div>
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
