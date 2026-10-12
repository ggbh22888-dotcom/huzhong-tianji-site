import ReactMarkdown from "react-markdown";
import { ARTICLES, getArticle, CTA } from "@/lib/articles";
export function generateStaticParams() { return ARTICLES.map((a) => ({ slug: a.slug })); }
export function generateMetadata({ params }) { const a = getArticle(params.slug); return a ? { title: `${a.title} · 壺中天機`, description: a.summary } : {}; }
export default function ArticlePage({ params }) {
  const a = getArticle(params.slug);
  if (!a) return <main><header><h1>壺中天機</h1></header><p className="muted">没有这篇文章。<a href="/articles">回文章列表</a></p></main>;
  const others = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <main className="article">
      <header><h1>壺中天機</h1><nav className="crumbs"><a href="/">首页</a> · <a href="/articles">壺中文章</a></nav></header>
      <article className="card">
        <div className="art-meta"><span className="chip jade">{a.tag}</span><span className="muted small">{a.date} · 约 {a.minutes} 分钟 · 半壶</span></div>
        <h1 className="art-title">{a.title}</h1>
        <div className="reading"><ReactMarkdown>{a.body + "\n\n" + CTA}</ReactMarkdown></div>
        {a.tool && <a className="tool-cta" href={a.tool.href}>✦ {a.tool.label} ✦</a>}
      </article>
      <section>
        <h3>再读几篇</h3>
        <div className="tool-grid">{others.map((o) => <a key={o.slug} className="card tool-card" href={`/articles/${o.slug}`}><b>{o.title}</b><span>{o.tag}</span></a>)}</div>
      </section>
      <footer>本站内容仅供参考与自我认识之用。</footer>
    </main>
  );
}
