"use client";
// JiaoBei — 擲筊：两枚月牙形筊杯，掷出一平一凸为圣杯（允），方可起卦。
import { useState } from "react";
import { blockLand, templeBowl, unlockAudio } from "@/lib/sfx";
import { useLang } from "./Lang";

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
  const { t } = useLang();
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
    blockLand({ p: -0.55, t: 0.62, pitch: 1.0 });
    blockLand({ p: 0.55, t: 0.76, pitch: 0.93 });
    setTimeout(() => {
      setFaces(f); setSpinning(false); setTries((n) => n + 1);
      const r = f[0] !== f[1] ? "sheng" : f[0] === 1 ? "xiao" : "yin";
      setResult(r);
      if (r === "sheng") { templeBowl({ t: 0.5 }); setTimeout(() => onGranted && onGranted(), 1600); }
    }, 1250);
  }

  const msg = { sheng: t("jb_sheng"), xiao: t("jb_xiao"), yin: t("jb_yin") };
  return (
    <div className={`jiaobei ${granted ? "granted" : ""}`}>
      <div className="jiao-row">
        <Block face={faces[0]} spinning={spinning} delay={0} />
        <Block face={faces[1]} spinning={spinning} delay={90} />
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button type="button" className={`throw ${granted ? "ghost" : ""}`} onClick={toss} disabled={disabled || spinning || granted}>
          {granted ? t("jb_ok") : spinning ? t("jb_air") : tries ? t("jb_again") : t("jb_toss")}
        </button>
      </div>
      <p className={`jiao-msg ${result || ""}`}>{result ? msg[result] : t("jb_intro")}</p>
    </div>
  );
}
