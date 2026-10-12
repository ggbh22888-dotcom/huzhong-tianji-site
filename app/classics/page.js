import { CLASSICS } from "@/lib/classics";
export const metadata = { title: "壺中典籍 · 壺中天機", description: "周易、滴天髓、穷通宝鉴、子平真诠、紫微斗数全书、了凡四训 — 命理与易学经典导读" };
export default function ClassicsPage() {
  return (
    <main className="classics">
      <header><h1>壺中天機</h1><p className="tagline">壺中典籍 · 经典导读</p><nav className="crumbs"><a href="/">首页</a> · <a href="/pan">壺中排盤</a> · <a href="/articles">文章</a> · <a href="/tools">小工具</a></nav></header>
      <p className="muted intro">这些书，是壺中排盘与解读背后的来处。每一本写了它讲什么、怎么读、从哪里入手。引文为公版古籍短句。</p>
      {CLASSICS.map((c) => (
        <section key={c.cat}>
          <h3>{c.cat}</h3>
          <div className="classic-list">
            {c.items.map((b) => (
              <article key={b.name} className="card classic">
                <div className="classic-head"><h2>{b.name}</h2><span className="muted small">{b.era}{b.author ? ` · ${b.author}` : ""}</span></div>
                {b.lines && <blockquote>{b.lines.map((l, i) => <p key={i}>{l}</p>)}</blockquote>}
                <p><b>讲什么</b>{b.about}</p>
                <p><b>怎么读</b>{b.how}</p>
                {b.link && <a className="classic-link" href={b.link}>→ {b.linkLabel}</a>}
              </article>
            ))}
          </div>
        </section>
      ))}
      <footer>本站内容仅供参考与自我认识之用。</footer>
    </main>
  );
}
