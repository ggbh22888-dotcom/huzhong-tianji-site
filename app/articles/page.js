import { ARTICLES } from "@/lib/articles";
export const metadata = { title: "壺中文章 · 壺中天機", description: "八字、紫微、易经、塔罗、数字能量 — 半壶的命理随笔，简体，给现代人看的白话" };
export default function ArticlesIndex() {
  const list = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <main>
      <header><h1>壺中天機</h1><p className="tagline">壺中文章 · 半壶随笔</p><nav className="crumbs"><a href="/">首页</a> · <a href="/pan">壺中排盤</a> · <a href="/tools">小工具</a> · <a href="/classics">典籍</a></nav></header>
      <section className="art-list">
        {list.map((a) => (
          <a key={a.slug} className="card art-card" href={`/articles/${a.slug}`}>
            <div className="art-meta"><span className="chip jade">{a.tag}</span><span className="muted small">{a.date} · 约 {a.minutes} 分钟</span></div>
            <h2>{a.title}</h2>
            <p className="muted">{a.summary}</p>
          </a>
        ))}
      </section>
      <footer>本站内容仅供参考与自我认识之用。</footer>
    </main>
  );
}
