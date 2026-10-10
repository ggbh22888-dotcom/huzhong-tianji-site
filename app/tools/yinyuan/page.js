"use client";
import { useState } from "react";
import ToolShell, { useTool } from "@/app/components/ToolShell";
import PersonForm, { emptyPerson, personPayload } from "@/app/components/PersonForm";

export default function Page() {
  const [p, setP] = useState(emptyPerson());
  const { data, err, busy, run } = useTool();
  return (
    <ToolShell id="yinyuan" result={data && (
      <section className="card">
        <h3>缘分的年份</h3>
        <p className="muted small">日主 {data.dayMaster} · 配偶星 {data.spouseStars.join("/")} · 夫妻宫 {data.spousePalace}{data.peachInChart.length ? ` · 命带 ${data.peachInChart.join("、")}` : ""}</p>
        {data.candidates.length === 0 ? <p>未来十二年内没有明显的触发年份——这不代表没有缘分，只代表缘分不靠流年推动，更靠你自己走出去。</p> : (
          <ol className="yy">{data.candidates.map((c) => <li key={c.year}><b>{c.year}（{c.ganZhi}，{c.age}岁）</b><span>{c.reasons.join("；")}</span></li>)}</ol>
        )}
        <p className="muted small">{data.note}</p>
      </section>)}>
      <form onSubmit={(e) => { e.preventDefault(); run({ tool: "yinyuan", person: personPayload(p) }); }}>
        <PersonForm value={p} onChange={setP} />
        <button disabled={busy}>{busy ? "推算中…" : "看看哪几年"}</button>{err && <p className="error">{err}</p>}
      </form>
    </ToolShell>
  );
}
