"use client";
import { useState } from "react";
import ToolShell, { useTool } from "@/app/components/ToolShell";
import PersonForm, { emptyPerson, personPayload } from "@/app/components/PersonForm";
import { Bazi } from "@/app/components/Charts";

export default function Page() {
  const [p, setP] = useState(emptyPerson());
  const { data, err, busy, run } = useTool();
  return (
    <ToolShell id="wuxing" result={data && <section className="card"><Bazi c={data} /></section>}>
      <form onSubmit={(e) => { e.preventDefault(); run({ tool: "wuxing", person: personPayload(p) }); }}>
        <PersonForm value={p} onChange={setP} />
        <button disabled={busy}>{busy ? "计算中…" : "查询五行"}</button>
        {err && <p className="error">{err}</p>}
      </form>
    </ToolShell>
  );
}
