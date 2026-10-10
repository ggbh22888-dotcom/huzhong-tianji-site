"use client";
import { useState } from "react";
import ToolShell, { useTool } from "@/app/components/ToolShell";

export default function Page() {
  const [f, setF] = useState({ from: "solar", year: 1990, month: 1, day: 1, leap: false });
  const { data, err, busy, run } = useTool();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <ToolShell id="nongli" result={data && (
      <section className="card">
        <h3>结果</h3>
        <div className="kv"><span>公历</span><b>{data.solar}（周{data.weekday}）</b><span>农历</span><b>{data.lunar}</b><span>干支</span><b>{data.ganZhi}</b><span>生肖</span><b>{data.shengXiao}</b><span>节气</span><b>{data.jieQi}后</b>
          {data.festivals?.length > 0 && <><span>节日</span><b>{data.festivals.join("、")}</b></>}
          {data.yi && <><span>宜</span><b>{data.yi.join(" ")}</b><span>忌</span><b>{data.ji.join(" ")}</b></>}
        </div>
      </section>)}>
      <form onSubmit={(e) => { e.preventDefault(); run({ tool: "nongli", ...f, year: +f.year, month: +f.month, day: +f.day }); }}>
        <div className="row">
          <label>方向 <select value={f.from} onChange={set("from")}><option value="solar">公历 → 农历</option><option value="lunar">农历 → 公历</option></select></label>
          <label>年 <input type="number" min="1900" max="2100" value={f.year} onChange={set("year")} /></label>
          <label>月 <input type="number" min="1" max="12" value={f.month} onChange={set("month")} /></label>
          <label>日 <input type="number" min="1" max="31" value={f.day} onChange={set("day")} /></label>
          {f.from === "lunar" && <label className="check"><input type="checkbox" checked={f.leap} onChange={set("leap")} /> 闰月</label>}
        </div>
        <button disabled={busy}>换算</button>{err && <p className="error">{err}</p>}
      </form>
    </ToolShell>
  );
}
