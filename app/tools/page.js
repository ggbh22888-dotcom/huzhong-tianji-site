import { TOOLS } from "@/lib/tool-list";
export const metadata = { title: "壺中小工具 · 壺中天機", description: "八字五行查询、农历换算、手机车牌号码吉凶、姻缘何时来 — 免费命理小工具" };
export default function ToolsIndex() {
  return (
    <main>
      <header><h1>壺中天機</h1><p className="tagline">壺中小工具 · 免费 · 即时</p><nav className="crumbs"><a href="/">首页</a> · <a href="/pan">AI 排盘</a></nav></header>
      <section className="tool-grid">{TOOLS.map(([k, n, d]) => <a key={k} className="card tool-card" href={`/tools/${k}`}><b>{n}</b><span>{d}</span></a>)}</section>
      <footer>本站内容仅供参考与自我认识之用。</footer>
    </main>
  );
}
