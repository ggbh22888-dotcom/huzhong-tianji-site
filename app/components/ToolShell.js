"use client";
// ToolShell — shared frame for the free tools: title, intro, result area, 壺中一問 CTA
import { useState } from "react";
import { TOOLS } from "@/lib/tool-list";


export function useTool() {
  const [data, setData] = useState(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function run(body) {
    setBusy(true); setErr(""); setData(null);
    try { const r = await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const j = await r.json(); if (j.error) throw new Error(j.error); setData(j); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return { data, err, busy, run };
}

export default function ToolShell({ id, children, result }) {
  const t = TOOLS.find((x) => x[0] === id);
  return (
    <main>
      <header>
        <h1>壺中天機</h1>
        <p className="tagline">壺中小工具 · {t?.[1]}</p>
        <nav className="crumbs"><a href="/">首页</a> · <a href="/tools">全部工具</a> · <a href="/pan">AI 排盘</a></nav>
      </header>
      <section className="card">
        <h2 className="tool-h">{t?.[1]}</h2>
        <p className="muted">{t?.[2]}。免费，不记录资料。</p>
        {children}
      </section>
      {result}
      <section className="card cta">
        <p>工具只能告诉你"是什么"。想知道"所以呢"，带着一个具体的问题来 <b>壺中一問</b>——半壶替你把壶里的东西倒出来看清楚。</p>
        <div className="row"><a className="btn-gold" href="/#services">了解壺中一問</a><a className="btn-line" href="/pan">先免费开壺排盤</a></div>
      </section>
      <nav className="tool-links">{TOOLS.filter((x) => x[0] !== id).map(([k, n]) => <a key={k} href={`/tools/${k}`}>{n}</a>)}</nav>
      <footer>本站内容仅供参考与自我认识之用。</footer>
    </main>
  );
}
