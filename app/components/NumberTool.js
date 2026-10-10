"use client";
import { useState } from "react";
import ToolShell, { useTool } from "@/app/components/ToolShell";

export default function NumberTool({ id, label, placeholder, hint }) {
  const [v, setV] = useState("");
  const { data, err, busy, run } = useTool();
  return (
    <ToolShell id={id} result={data && (
      <section className="card">
        <h3>{data.digits}</h3>
        <div className="chips">{Object.entries(data.tally).map(([k, n]) => <span key={k} className={`chip ${["生气","天医","延年"].includes(k) ? "gold" : ["伏位"].includes(k) ? "" : "retro"}`}>{k} ×{n}</span>)}</div>
        <table className="qz" style={{ marginTop: 12 }}><thead><tr><th>数对</th><th>磁场</th><th>含义</th></tr></thead>
          <tbody>{data.pairs.map((p, i) => <tr key={i}><td>{p.pair}</td><td className={p.level === "吉" ? "gold-t" : p.level === "凶" ? "red-t" : ""}>{p.star}</td><td>{p.desc}</td></tr>)}</tbody></table>
        <p className="muted small" style={{ marginTop: 10 }}>尾四位数理 <b>{data.tail.n}</b>（{data.tail.level}）：{data.tail.meaning}{data.zeros ? ` · 含 ${data.zeros} 个 0（放大前后磁场）` : ""}{data.fives ? ` · 含 ${data.fives} 个 5（过渡/加强）` : ""}</p>
        <p className="muted small">数字能量与 81 数理皆为民间参考体系，用来觉察、不用来恐慌。号码用得顺手、记得住，本身就是好号码。</p>
      </section>)}>
      <form onSubmit={(e) => { e.preventDefault(); run({ tool: "number", digits: v }); }}>
        <label className="full">{label}<input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} required /></label>
        {hint && <p className="muted small">{hint}</p>}
        <button disabled={busy}>查看吉凶</button>{err && <p className="error">{err}</p>}
      </form>
    </ToolShell>
  );
}
