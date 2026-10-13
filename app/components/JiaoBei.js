"use client";
// JiaoBei — 擲筊：上香收心 → 按住凝神、放开掷出 → 两枚筊杯翻飞落地 → 圣杯/笑杯/阴杯 → 得圣杯方可起卦。
import { useEffect, useRef, useState } from "react";
import { playSample, preload, unlockAudio } from "@/lib/sfx";
import { useLang } from "./Lang";

const rnd = () => (typeof crypto !== "undefined" && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] & 1 : Math.random() < 0.5 ? 0 : 1);

/* A single 筊杯 as a 3D card: front = flat face (pale wood), back = convex face (vermilion) */
function Block({ face, phase, idx }) {
  // phase: idle | hold | fly | land
  return (
    <div className={`jb-block ${phase} f${face === null ? "x" : face}`} style={{ "--i": idx }}>
      <div className="jb-face jb-flat"><span /></div>
      <div className="jb-face jb-round"><span /></div>
    </div>
  );
}

export default function JiaoBei({ onGranted, disabled }) {
  const { t } = useLang();
  useEffect(() => { preload(["jiao_toss", "temple_bowl"]); }, []);
  const [step, setStep] = useState("altar");       // altar → incense → ready → result
  const [phase, setPhase] = useState("idle");      // block animation phase
  const [faces, setFaces] = useState([null, null]);
  const [result, setResult] = useState(null);      // sheng | xiao | yin
  const [holding, setHolding] = useState(false);
  const [charge, setCharge] = useState(0);
  const [tries, setTries] = useState(0);
  const holdRef = useRef(null);
  const granted = result === "sheng";

  // ---- 上香 ----
  function lightIncense() {
    unlockAudio();
    setStep("incense");
    setTimeout(() => setStep("ready"), 1800);
  }

  // ---- press & hold ----
  function holdStart(e) {
    if (step !== "ready" || disabled || phase === "fly") return;
    e.preventDefault?.();
    setHolding(true); setCharge(0); setPhase("hold");
    const t0 = Date.now();
    holdRef.current = setInterval(() => setCharge(Math.min(1, (Date.now() - t0) / 1400)), 40);
  }
  function holdEnd() {
    if (!holding) return;
    clearInterval(holdRef.current); setHolding(false);
    throwBlocks();
  }
  useEffect(() => {
    const down = (e) => { if (e.code === "Space" && step === "ready" && !holding) { e.preventDefault(); holdStart(e); } };
    const up = (e) => { if (e.code === "Space") holdEnd(); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  });

  function throwBlocks() {
    const f = [rnd(), rnd()];
    setPhase("fly"); setFaces([null, null]); setResult(null);
    playSample("jiao_toss", { t: 0.75, gain: 1.0 });
    setTimeout(() => { setFaces(f); setPhase("land"); }, 900);
    setTimeout(() => {
      const r = f[0] !== f[1] ? "sheng" : f[0] === 1 ? "xiao" : "yin";
      setResult(r); setStep("result"); setTries((n) => n + 1);
      if (r === "sheng") { playSample("temple_bowl", { t: 0.3, gain: 0.8 }); setTimeout(() => onGranted && onGranted(), 2200); }
    }, 1700);
  }
  function again() { setStep("ready"); setPhase("idle"); setFaces([null, null]); setResult(null); setCharge(0); }
  function restart() { setStep("altar"); setPhase("idle"); setFaces([null, null]); setResult(null); setCharge(0); setTries(0); }

  const R = { sheng: ["圣杯", t("jb_sheng")], xiao: ["笑杯", t("jb_xiao")], yin: ["阴杯", t("jb_yin")] };

  return (
    <div className={`jb ${step} ${granted ? "granted" : ""}`}>
      {/* ---- altar scene ---- */}
      <div className="jb-scene">
        <div className="jb-beam" />
        <div className="jb-lantern l" /><div className="jb-lantern r" />
        <div className="jb-plaque"><span>壺中天機</span><small>待君來問</small></div>
        <div className="jb-table">
          <div className="jb-censer">
            <i className="stick" /><i className="stick" /><i className="stick" />
            <b className="smoke s1" /><b className="smoke s2" /><b className="smoke s3" />
          </div>
          <div className="jb-candle l" /><div className="jb-candle r" />
        </div>
        <div className="jb-mat">
          <div className="jb-pair">
            <Block face={faces[0]} phase={phase} idx={0} />
            <Block face={faces[1]} phase={phase} idx={1} />
          </div>
        </div>
        {/* result overlay */}
        {step === "result" && result && (
          <div className={`jb-result ${result}`}>
            <div className="jb-glyph">{R[result][0]}</div>
            <p>{R[result][1]}</p>
          </div>
        )}
        {step === "ready" && (
          <div className={`jb-hint ${holding ? "on" : ""}`}>
            <div className="jb-ring" style={{ "--c": charge }} />
            <span>{holding ? t("jb_release") : t("jb_hold")}</span>
          </div>
        )}
      </div>

      {/* ---- controls ---- */}
      <div className="jb-ctl">
        {step === "altar" && <button type="button" className="throw" onClick={lightIncense} disabled={disabled}>{t("jb_incense")}</button>}
        {step === "incense" && <p className="jb-msg">{t("jb_settle")}</p>}
        {step === "ready" && (
          <button type="button" className={`throw hold ${holding ? "holding" : ""}`} disabled={disabled}
            onMouseDown={holdStart} onMouseUp={holdEnd} onMouseLeave={holdEnd}
            onTouchStart={holdStart} onTouchEnd={holdEnd} onTouchCancel={holdEnd}>
            {holding ? t("jb_release") : t("jb_hold_btn")}
          </button>
        )}
        {step === "result" && !granted && (
          <div className="row" style={{ justifyContent: "center", gap: 10 }}>
            <button type="button" className="throw" onClick={again} disabled={disabled}>{t("jb_again")}</button>
            <button type="button" className="ghost" onClick={restart}>{t("jb_restart")}</button>
          </div>
        )}
        {granted && <p className="jb-msg sheng">{t("jb_ok")}</p>}
        {step === "altar" && <p className="jb-msg">{t("jb_intro")}</p>}
        {step === "ready" && <p className="jb-msg muted">{t("jb_keys")}</p>}
      </div>
    </div>
  );
}
