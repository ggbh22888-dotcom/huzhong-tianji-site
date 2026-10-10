"use client";
import { useEffect, useState } from "react";
import PersonForm, { emptyPerson, personPayload } from "@/app/components/PersonForm";
import { ChartSet, Tarot, Gua, Reading, Transits, Hexagram } from "@/app/components/Charts";
import CoinCast from "@/app/components/CoinCast";

const MODES = [
  ["single", "单排"], ["multi", "合盘"], ["predict", "预测"], ["yijing", "一卦"], ["tarot", "塔罗"],
  ["horoscope", "星座运势"], ["naming", "起名"], ["fengshui", "风水"], ["pet", "宠物"], ["dream", "解梦"],
];
const SYSTEMS = ["八字", "紫微", "七政四余", "西洋星盘", "吠陀", "玛雅", "人类图", "灵数"];
const LAST_KEY = "hztj.lastPerson.v1";
const HIST_KEY = "hztj.history.v1";

export default function Home() {
  const [mode, setMode] = useState("single");
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
    try {
      const res = await fetch("/api/reading", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody()) });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      const reader = res.body.getReader(), dec = new TextDecoder();
      let buf = "", charts = null, reading = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        if (!charts) {
          const i = buf.indexOf("\n\n");
          if (i === -1) continue;
          charts = JSON.parse(buf.slice(0, i)).charts; buf = buf.slice(i + 2);
        }
        reading += buf; buf = "";
        setResult({ charts, reading });
      }
      saveHistory({ at: Date.now(), mode, charts, reading });
      try { localStorage.setItem(LAST_KEY, JSON.stringify(p1)); } catch {}
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const showSystems = ["single", "multi", "predict"].includes(mode);

  return (
    <main>
      <header>
        <h1>壺中天機</h1>
        <p className="tagline">天機藏於壺中 · 待君來問</p>
        <a href="/" className="back">← 回到壺中天機首页</a>
      </header>

      <nav className="modes">{MODES.map(([k, l]) => <button key={k} type="button" className={mode === k ? "on" : ""} onClick={() => { setMode(k); setResult(null); setCastValues(null); }}>{l}</button>)}</nav>

      <form onSubmit={submit} className="card">
        {showSystems && (
          <div className="systems">
            <span className="muted">排盘体系</span>
            {SYSTEMS.map((s) => <label key={s} className={`sys-pick ${systems.includes(s) ? "on" : ""}`}><input type="checkbox" checked={systems.includes(s)} onChange={() => toggleSystem(s)} />{s}</label>)}
          </div>
        )}

        {hasLast && mode !== "tarot" && <button type="button" className="ghost" onClick={fillLast}>↺ 历史一键填入</button>}

        {mode === "single" && <>
          <PersonForm value={p1} onChange={setP1} />
          <label className="full">想特别问的问题（选填）<input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="例如：明年适合换工作吗？" /></label>
        </>}

        {mode === "multi" && <>
          <label className="full">关系类型
            <select value={relationType} onChange={(e) => setRelationType(e.target.value)}>{["伴侣", "夫妻", "合伙人", "亲子", "朋友", "上司下属"].map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <PersonForm value={p1} onChange={setP1} label="第一位" />
          <PersonForm value={p2} onChange={setP2} label="第二位" />
          {p3 ? <PersonForm value={p3} onChange={setP3} label="第三位" /> : <button type="button" className="ghost" onClick={() => setP3(emptyPerson())}>+ 加第三位</button>}
        </>}

        {mode === "predict" && <>
          <PersonForm value={p1} onChange={setP1} />
          <div className="row">
            <label>预测年份 <select value={targetYear} onChange={(e) => setTargetYear(+e.target.value)}>{[0, 1, 2, 3].map((d) => { const y = new Date().getFullYear() + d; return <option key={y}>{y}</option>; })}</select></label>
            <label>关注重点 <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="事业 / 感情 / 搬迁 / 创业…" /></label>
          </div>
        </>}

        {mode === "yijing" && <>
          <label className="full">你的问题（可留空，心中默念即可）<textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} placeholder="一事一问，越具体越好。例：这个月该不该接下那个项目？" /></label>
          <CoinCast onDone={setCastValues} disabled={loading} />
        </>}

        {mode === "tarot" && <>
          <label className="full">你的问题<textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="尽量具体。例：我该接受这份新工作的邀约吗？" required /></label>
          <label className="full">牌阵
            <select value={spread} onChange={(e) => setSpread(e.target.value)}><option value="single">单牌 · 核心指引</option><option value="three">三牌 · 过去现在未来</option><option value="decision">五牌 · 两难抉择</option><option value="celtic">十牌 · 凯尔特十字</option></select>
          </label>
        </>}

        {mode === "naming" && <>
          <div className="row"><label>姓氏 <input value={surname} onChange={(e) => setSurname(e.target.value)} required placeholder="例：关" /></label></div>
          <PersonForm value={p1} onChange={setP1} label="出生资料" />
          <label className="full">父母的期望（选填）<textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="例：希望孩子温和有主见，不要太强势的字" /></label>
        </>}

        {mode === "fengshui" && <>
          <PersonForm value={p1} onChange={setP1} label="居住者" compact />
          <label className="full">居所情况<textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} required placeholder="大门朝向、卧室床头方向、书桌位置、厨房灶位、最近的困扰……越具体越好" /></label>
        </>}

        {mode === "pet" && <>
          <div className="row"><label>物种 <select value={species} onChange={(e) => setSpecies(e.target.value)}>{["猫", "狗", "兔", "鸟", "仓鼠", "乌龟", "鱼", "其他"].map((s) => <option key={s}>{s}</option>)}</select></label></div>
          <PersonForm value={p1} onChange={setP1} label="宠物出生资料（时辰不详可勾选）" compact />
          <label className="check"><input type="checkbox" checked={withOwner} onChange={(e) => setWithOwner(e.target.checked)} /> 一并看与主人的相处</label>
          {withOwner && <PersonForm value={p2} onChange={setP2} label="主人" compact />}
        </>}

        {mode === "horoscope" && <>
          <div className="row">
            <label>周期 <select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="today">今日</option><option value="week">本周</option><option value="month">本月</option><option value="year">今年</option></select></label>
            <label>关注重点 <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="选填：工作 / 感情 / 一个决定…" /></label>
          </div>
          <label className="check"><input type="checkbox" checked={knowBirth} onChange={(e) => setKnowBirth(e.target.checked)} /> 我知道出生日期与时间（个人化行运）</label>
          {knowBirth ? <PersonForm value={p1} onChange={setP1} /> : (
            <div className="row"><label>太阳星座 <select value={sunSign} onChange={(e) => setSunSign(e.target.value)}>{["白羊","金牛","双子","巨蟹","狮子","处女","天秤","天蝎","射手","摩羯","水瓶","双鱼"].map((s) => <option key={s}>{s}</option>)}</select></label></div>
          )}
        </>}

        {mode === "dream" && <>
          <label className="full">梦境描述<textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} required placeholder="尽量把场景、人物、情绪、醒来时的感觉写下来" /></label>
          <label className="check"><input type="checkbox" checked={withOwner} onChange={(e) => setWithOwner(e.target.checked)} /> 对照我的八字与流年</label>
          {withOwner && <PersonForm value={p1} onChange={setP1} compact />}
        </>}

        <button disabled={loading || (mode === "yijing" && !castValues)}>{loading ? "壶中正在倒出……" : mode === "yijing" ? "✦ 解卦 ✦" : "✦ 开壶 ✦"}</button>
        {error && <p className="error">{error}</p>}
      </form>

      {result && <Result mode={mode} data={result} loading={loading} />}

      {history.length > 0 && !result && (
        <section className="card">
          <h3>历史记录（仅存于本机）</h3>
          <ul className="hist">{history.map((h) => <li key={h.at}><button type="button" className="ghost" onClick={() => setResult({ charts: h.charts, reading: h.reading })}>{new Date(h.at).toLocaleString("zh-SG")} · {MODES.find((m) => m[0] === h.mode)?.[1]}</button></li>)}</ul>
        </section>
      )}

      <footer>本站测算结果仅供参考与自我认识之用。命由己造，相由心生。</footer>
    </main>
  );
}

function Result({ data, loading }) {
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
      <Reading text={data.reading} />
      <details><summary>查看原始 JSON（学习用）</summary><pre>{JSON.stringify(c, null, 2)}</pre></details>
    </section>
  );
}
