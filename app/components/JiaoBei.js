"use client";
// JiaoBei — 擲筊：两枚月牙形筊杯，掷出一平一凸为圣杯（允），方可起卦。
import { useState } from "react";
import { woodClack, chime, unlockAudio } from "@/lib/sfx";

const rnd = () => (typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] & 1 : Math.random() < 0.5 ? 0 : 1);

function Block({ face, spinning, delay }) {
  // face: 1 = 平面朝上(阳/平), 0 = 凸面朝上(阴/凸)
  return (
    <div className={`jiao ${spinning ? "toss" : ""} ${face === null ? "" : face ? "flat" : "round"}`} style={{ animationDelay: `${delay}ms` }}>
      <svg viewBox="0 0 120 70" width="100%" height="100%">
        <defs>
          <linearGradient id="jg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9553a" /><stop offset=".6" stopColor="#a8382a" /><stop offset="1" stopColor="#6e2318" /></linearGradient>
          <linearGradient id="jf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0c9b0" /><stop offset="1" stopColor="#c98e78" /></linearGradient>
        </defs>
        {/* crescent body */}
        <path d="M8 40 Q60 -8 112 40 Q60 70 8 40 Z" fill="url(#jg)" stroke="#5a1c12" strokeWidth="1.5" />
        {face === 1 && <path d="M14 40 Q60 10 106 40 Q60 58 14 40 Z" fill="url(#jf)" opacity=".95" />}
        {face === 0 && <path d="M30 22 Q60 6 90 22" fill="none" stroke="#f3b9a3" strokeWidth="2" opacity=".6" />}
        {face === null && <path d="M14 40 Q60 10 106 40 Q60 58 14 40 Z" fill="url(#jf)" opacity=".5" />}
      </svg>
    </div>
  );
}

export default function JiaoBei({ onGranted, disabled }) {
  const [faces, setFaces] = useState([null, null]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null); // "sheng" | "xiao" | "yin"
  const [tries, setTries] = useState(0);
  const granted = result === "sheng";

  function toss() {
    if (spinning || disabled || granted) return;
    unlockAudio();
    setSpinning(true); setResult(null); setFaces([null, null]);
    const f = [rnd(), rnd()];
    // land sounds: left block then right block
    woodClack({ p: -0.6, t: 0.62, pitch: 1.0 });
    woodClack({ p: 0.6, t: 0.74, pitch: 0.92 });
    setTimeout(() => {
      setFaces(f); setSpinning(false); setTries((n) => n + 1);
      const r = f[0] !== f[1] ? "sheng" : f[0] === 1 ? "xiao" : "yin";
      setResult(r);
      if (r === "sheng") { chime({ t: 0.15 }); setTimeout(() => onGranted && onGranted(), 900); }
    }, 820);
  }

  const msg = { sheng: "圣杯 · 一平一凸，神明允准。可以起卦。", xiao: "笑杯 · 两平，神明笑而不答。静一静，再掷。", yin: "阴杯 · 两凸，此刻不宜。调整问题，再掷。" };
  return (
    <div className={`jiaobei ${granted ? "granted" : ""}`}>
      <div className="jiao-row">
        <Block face={faces[0]} spinning={spinning} delay={0} />
        <Block face={faces[1]} spinning={spinning} delay={90} />
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button type="button" className={`throw ${granted ? "ghost" : ""}`} onClick={toss} disabled={disabled || spinning || granted}>
          {granted ? "✓ 已得圣杯" : spinning ? "筊杯在空中……" : tries ? "再掷一次" : "擲筊 · 请示"}
        </button>
      </div>
      <p className={`jiao-msg ${result || ""}`}>{result ? msg[result] : "先擲筊请示：两枚筊杯一平一凸为圣杯，得圣杯方可摇卦。"}</p>
    </div>
  );
}
