import { TOOLS } from "@/lib/tool-list";

export const metadata = {
  title: "壺中小工具 · 壺中天機",
  description: "免费紫微斗数排盘、八字五行查询、农历换算、手机车牌号码吉凶与姻缘工具。",
};

export default function ToolsIndex() {
  return (
    <main>
      <header>
        <h1>壺中天機</h1>
        <p className="tagline">壺中小工具 · 免费 · 即时</p>
        <nav className="crumbs">
          <a href="/">首页</a> · <a href="/ziwei-chart">紫微排盘</a> · <a href="/pan">壺中排盤</a> · <a href="/articles">文章</a> · <a href="/classics">典籍</a>
        </nav>
      </header>
      <section className="tool-grid">
        <a className="card tool-card" href="/ziwei-chart">
          <b>壺中紫微 · 免费命盘</b>
          <span>十二宫、主星、四化、大限与当前流年；命盘计算与 AI 解读分开呈现。</span>
        </a>
        {TOOLS.map(([k, n, d]) => (
          <a key={k} className="card tool-card" href={`/tools/${k}`}>
            <b>{n}</b>
            <span>{d}</span>
          </a>
        ))}
      </section>
      <footer>本站内容仅供参考与自我认识之用。</footer>
    </main>
  );
}
