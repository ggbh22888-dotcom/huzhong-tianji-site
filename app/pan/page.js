"use client";
import { useEffect, useState } from "react";
import PersonForm, { emptyPerson, personPayload } from "@/app/components/PersonForm";
import { ChartSet, Tarot, Gua, Reading, Transits, Hexagram } from "@/app/components/Charts";
import CoinCast from "@/app/components/CoinCast";
import JiaoBei from "@/app/components/JiaoBei";
import TopBar from "@/app/components/TopBar";
import { LangProvider, useLang } from "@/app/components/Lang";
import { readReadingStream } from "@/lib/reading-stream.mjs";

const MODES = [
  ["single", "壺中一命"], ["multi", "壺中合盤"], ["predict", "壺中度歲"], ["jiaobei", "壺中擲筊"], ["yijing", "壺中問卦"], ["tarot", "壺中翻牌"],
  ["horoscope", "壺中觀星"], ["naming", "壺中賜名"], ["fengshui", "壺中安居"], ["pet", "壺中小伴"], ["dream", "壺中入夢"],
];
const SYSTEMS = ["八字", "紫微", "七政四余", "西洋星盘", "吠陀", "玛雅", "人类图", "灵数"];
const SYS_EN = { 八字: "BaZi", 紫微: "Zi Wei", 七政四余: "Qi Zheng", 西洋星盘: "Western", 吠陀: "Vedic", 玛雅: "Maya", 人类图: "Human Design", 灵数: "Numerology" };
const LAST_KEY = "hztj.lastPerson.v1";
const HIST_KEY = "hztj.history.v1";

export default function Home() { return <LangProvider><Pan /></LangProvider>; }

function Pan() {
  const { t, lang } = useLang();
  const [mode, setMode] = useState("single");
  const [granted, setGranted] = useState(false); // 擲筊得圣杯
  useEffect(() => { try { const m = new URLSearchParams(window.location.search).get("mode"); if (m && MODES.some(([k]) => k === m)) setMode(m); } catch {} }, []);
  const [systems, setSystems] = useState(["八字", "紫微"]);
  // per-mode state
  const [p1, setP1] = useState(emptyPerson());
  const [p2, setP2] = useState(emptyPerson({ gender: "男" }));
  const [p3, setP3] = useState(null);
  const [relationType, setRelationType] = useState("伴侣");
  const [question, setQuestion] = useState("");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [spread, setSpread] = useState("three");
  const [surname, setSurname] = useState("");
  const [text, setText] = useState(""); // expectation / home / dream
  const [species, setSpecies] = useState("猫");
  const [withOwner, setWithOwner] = useState(false);
  const [period, setPeriod] = useState("week");
  const [sunSign, setSunSign] = useState("白羊");
  const [knowBirth, setKnowBirth] = useState(true);
  const [castValues, setCastValues] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { charts, reading }
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [hasLast, setHasLast] = useState(false);
  const fillLast = () => { try { const v = JSON.parse(localStorage.getItem(LAST_KEY)); if (v) setP1(v); } catch {} };

  useEffect(() => { try { setHistory(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); setHasLast(!!localStorage.getItem(LAST_KEY)); } catch {} }, []);
  const saveHistory = (entry) => { try { const h = [entry, ...history].slice(0, 20); setHistory(h); localStorage.setItem(HIST_KEY, JSON.stringify(h)); } catch {} };

  const toggleSystem = (s) => setSystems((cur) => cur.includes(s) ? (cur.length > 1 ? cur.filter((x) => x !== s) : cur) : [...cur, s]);

  function buildBody() {
    switch (mode) {
      case "single":   return { mode, person: personPayload(p1), systems, question };
      case "multi":    return { mode, persons: [p1, p2, p3].filter(Boolean).map(personPayload), systems, relationType };
      case "predict":  return { mode, person: personPayload(p1), systems, targetYear, focus: question };
      case "tarot":    return { mode, question, spread };
      case "yijing":   return { mode, question, values: castValues };
      case "naming":   return { mode, person: personPayload(p1), surname, expectation: text };
      case "fengshui": return { mode, person: personPayload(p1), home: text };
      case "pet":      return { mode, pet: personPayload(p1), species, owner: withOwner ? personPayload(p2) : null };
      case "horoscope": return { mode, period, focus: question, person: knowBirth ? personPayload(p1) : null, sunSign };
      case "dream":    return { mode, dream: text, person: withOwner ? personPayload(p1) : null };
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 120000);
    try {
      const res = await fetch("/api/reading", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...buildBody(), lang }), signal: abort.signal });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      const { charts, reading } = await readReadingStream(res.body, setResult);
      saveHistory({ at: Date.now(), mode, charts, reading });
      try { localStorage.setItem(LAST_KEY, JSON.stringify(p1)); } catch {}
    } catch (err) {
      setError(err.name === "AbortError" ? "解读等待时间较长，本次未能完成，请稍后重新开启。" : /[\u4e00-\u9fff]/.test(err.message) ? err.message : "解读连接中断，请检查网络后重新开启。");
    }
    finally { clearTimeout(timeout); setLoading(false); }
  }

  const showSystems = ["single", "multi", "predict"].includes(mode);

  return (
    <main>
      <TopBar onNew={() => { setResult(null); setCastValues(null); setGranted(false); setQuestion(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      <header>
        <h1>壺中天機</h1>
        <p className="tagline">{t("tagline")}</p>
        <nav className="crumbs"><a href="/">{t("nav_home")}</a> · <a href="/tools">{t("nav_tools")}</a> · <a href="/articles">{t("nav_articles")}</a> · <a href="/classics">{t("nav_classics")}</a></nav>
      </header>

      <nav className="modes">{MODES.map(([k, l]) => <button key={k} type="button" className={mode === k ? "on" : ""} title={t("m_" + k)} onClick={() => { setMode(k); setResult(null); setCastValues(null); setGranted(false); }}>{l}{lang !== "zh-CN" && lang !== "zh-TW" && <small>{t("m_" + k)}</small>}</button>)}</nav>

      <form onSubmit={submit} className="card">
        {showSystems && (
          <div className="systems">
            <span className="muted">{t("systems")}</span>
            {SYSTEMS.map((s) => <label key={s} className={`sys-pick ${systems.includes(s) ? "on" : ""}`}><input type="checkbox" checked={systems.includes(s)} onChange={() => toggleSystem(s)} />{s}{!lang.startsWith("zh") && <span className="sys-en">{SYS_EN[s]}</span>}</label>)}
          </div>
        )}

        {hasLast && mode !== "tarot" && <button type="button" className="ghost" onClick={fillLast}>{t("fill_last")}</button>}

        {mode === "single" && <>
          <PersonForm value={p1} onChange={setP1} />
          <label className="full">{t("q_opt")}<input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("q_opt_ph")} /></label>
        </>}

        {mode === "multi" && <>
          <label className="full">{t("relation")}
            <select value={relationType} onChange={(e) => setRelationType(e.target.value)}>{[["伴侣","rel_partner"], ["夫妻","rel_spouse"], ["合伙人","rel_biz"], ["亲子","rel_parent"], ["朋友","rel_friend"], ["上司下属","rel_boss"]].map(([r, k]) => <option key={r} value={r}>{t(k)}</option>)}</select>
          </label>
          <PersonForm value={p1} onChange={setP1} label={t("p1")} />
          <PersonForm value={p2} onChange={setP2} label={t("p2")} />
          {p3 ? <PersonForm value={p3} onChange={setP3} label={t("p3")} /> : <button type="button" className="ghost" onClick={() => setP3(emptyPerson())}>{t("add_third")}</button>}
        </>}

        {mode === "predict" && <>
          <PersonForm value={p1} onChange={setP1} />
          <div className="row">
            <label>{t("year")} <select value={targetYear} onChange={(e) => setTargetYear(+e.target.value)}>{[0, 1, 2, 3].map((d) => { const y = new Date().getFullYear() + d; return <option key={y}>{y}</option>; })}</select></label>
            <label>{t("focus")} <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("focus_ph")} /></label>
          </div>
        </>}

        {mode === "yijing" && <>
          <label className="full">{t("yq")}<textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} placeholder={t("yq_ph")} /></label>
          <CoinCast onDone={setCastValues} disabled={loading} />
        </>}

        {mode === "jiaobei" && <>
          <label className="full">{t("jbq")}<input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("jbq_ph")} maxLength={60} /></label>
          <div className="chips jb-chips">{["jbq1", "jbq2", "jbq3", "jbq4"].map((k) => <button key={k} type="button" className="chip" onClick={() => setQuestion(t(k))}>{t(k)}</button>)}</div>
          <JiaoBei question={question} disabled={loading} onGranted={() => {}} />
        </>}

        {mode === "tarot" && <>
          <label className="full">{t("tq")}<textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder={t("tq_ph")} required /></label>
          <label className="full">{t("spread")}
            <select value={spread} onChange={(e) => setSpread(e.target.value)}><option value="single">{t("sp_single")}</option><option value="three">{t("sp_three")}</option><option value="decision">{t("sp_decision")}</option><option value="celtic">{t("sp_celtic")}</option></select>
          </label>
        </>}

        {mode === "naming" && <>
          <div className="row"><label>{t("surname")} <input value={surname} onChange={(e) => setSurname(e.target.value)} required placeholder={t("surname_ph")} /></label></div>
          <PersonForm value={p1} onChange={setP1} label={t("birth")} />
          <label className="full">{t("expect")}<textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={t("expect_ph")} /></label>
        </>}

        {mode === "fengshui" && <>
          <PersonForm value={p1} onChange={setP1} label={t("resident")} compact />
          <label className="full">{t("home")}<textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} required placeholder={t("home_ph")} /></label>
        </>}

        {mode === "pet" && <>
          <div className="row"><label>{t("species")} <select value={species} onChange={(e) => setSpecies(e.target.value)}>{[["猫","sp_cat"], ["狗","sp_dog"], ["兔","sp_rabbit"], ["鸟","sp_bird"], ["仓鼠","sp_hamster"], ["乌龟","sp_turtle"], ["鱼","sp_fish"], ["其他","sp_other"]].map(([s, k]) => <option key={s} value={s}>{t(k)}</option>)}</select></label></div>
          <PersonForm value={p1} onChange={setP1} label={t("pet_birth")} compact />
          <label className="check"><input type="checkbox" checked={withOwner} onChange={(e) => setWithOwner(e.target.checked)} /> {t("with_owner")}</label>
          {withOwner && <PersonForm value={p2} onChange={setP2} label={t("owner")} compact />}
        </>}

        {mode === "horoscope" && <>
          <div className="row">
            <label>{t("period")} <select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="today">{t("pd_today")}</option><option value="week">{t("pd_week")}</option><option value="month">{t("pd_month")}</option><option value="year">{t("pd_year")}</option></select></label>
            <label>{t("focus")} <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("focus_ph2")} /></label>
          </div>
          <label className="check"><input type="checkbox" checked={knowBirth} onChange={(e) => setKnowBirth(e.target.checked)} /> {t("know_birth")}</label>
          {knowBirth ? <PersonForm value={p1} onChange={setP1} /> : (
            <div className="row"><label>{t("sun_sign")} <select value={sunSign} onChange={(e) => setSunSign(e.target.value)}>{["白羊","金牛","双子","巨蟹","狮子","处女","天秤","天蝎","射手","摩羯","水瓶","双鱼"].map((s, i) => <option key={s} value={s}>{t("z" + (i + 1))}</option>)}</select></label></div>
          )}
        </>}

        {mode === "dream" && <>
          <label className="full">{t("dream")}<textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} required placeholder={t("dream_ph")} /></label>
          <label className="check"><input type="checkbox" checked={withOwner} onChange={(e) => setWithOwner(e.target.checked)} /> {t("with_bazi")}</label>
          {withOwner && <PersonForm value={p1} onChange={setP1} compact />}
        </>}

        {mode !== "jiaobei" && <button disabled={loading || (mode === "yijing" && !castValues)}>{loading ? t("loading") : mode === "yijing" ? t("interpret") : t("open")}</button>}
        {error && <p className="error">{error}</p>}
      </form>

      {result && <Result mode={mode} data={result} loading={loading} error={error} />}

      {history.length > 0 && !result && (
        <section className="card">
          <h3>{t("history")}</h3>
          <ul className="hist">{history.map((h) => <li key={h.at}><button type="button" className="ghost" onClick={() => setResult({ charts: h.charts, reading: h.reading })}>{new Date(h.at).toLocaleString("zh-SG")} · {MODES.find((m) => m[0] === h.mode)?.[1]}</button></li>)}</ul>
        </section>
      )}

      <footer>{t("footer")}</footer>
    </main>
  );
}

function Result({ data, loading, error }) {
  const c = data.charts;
  return (
    <section className="card">
      {c.charts && <ChartSet charts={c.charts} />}
      {c.persons && c.persons.map((p, i) => <ChartSet key={i} charts={p.charts} title={p.label || `第${i + 1}位`} />)}
      {c.petCharts && <ChartSet charts={c.petCharts} title={`${c.petName || "宠物"}（${c.species}）`} />}
      {c.ownerCharts && <ChartSet charts={c.ownerCharts} title="主人" />}
      {c.draw && <Tarot draw={c.draw} />}
      {c.cast && <Hexagram cast={c.cast} date={c.castDate} question={c.question} />}
      {c.gua && <Gua gua={c.gua} />}
      {c.transitsNow && <Transits t={c.transitsNow} events={c.events} sunSign={c.sunSign} />}
      {c.liuNian && <p className="muted">流年 {c.liuNian.year} {c.liuNian.ganZhi}（{c.liuNian.shengXiao}）</p>}
      <h3>半壶解读{loading && <span className="cursor">▍</span>}</h3>
      {data.reading?.trim() && <Reading text={data.reading} />}
      {loading && <p role="status" className="muted">{data.reading?.trim() ? "解读仍在生成，请稍候…" : "排盘已完成，正在生成解读，请稍候…"}</p>}
      {!loading && (error || !data.reading?.trim()) && <p role="alert" className="error">{error || "这份记录没有保存解读文字，请重新开启。"}</p>}
    </section>
  );
}
