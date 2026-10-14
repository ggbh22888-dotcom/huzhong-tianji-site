import ReactMarkdown from "react-markdown";
import { ARTICLES, getArticle, CTA } from "@/lib/allArticles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const article = getArticle(params.slug);
  return article ? { title: `${article.title} · 壺中天機`, description: article.summary } : {};
}

export default function ArticlePage({ params }) {
  const article = getArticle(params.slug);
  if (!article) return <main><header><h1>壺中天機</h1></header><p className="muted">没有这篇文章。<a href="/articles">回文章列表</a></p></main>;
  const others = ARTICLES.filter((item) => item.slug !== article.slug).slice(0, 3);
  return (
    <main className="article">
      <header><h1>壺中天機</h1><nav className="crumbs"><a href="/">首页</a> · <a href="/articles">壺中文章</a></nav></header>
      <article className="card">
        <div className="art-meta"><span className="chip jade">{article.tag}</span><span className="muted small">{article.date} · 约 {article.minutes} 分钟 · 半壶</span></div>
        <h1 className="art-title">{article.title}</h1>
        <div className="reading"><ReactMarkdown>{article.body + "\n\n" + CTA}</ReactMarkdown></div>
        {article.tool && <a className="tool-cta" href={article.tool.href}>✦ {article.tool.label} ✦</a>}
      </article>
      <section>
        <h3>再读几篇</h3>
        <div className="tool-grid">{others.map((item) => <a key={item.slug} className="card tool-card" href={`/articles/${item.slug}`}><b>{item.title}</b><span>{item.tag}</span></a>)}</div>
      </section>
      <footer>本站内容仅供参考与自我认识之用。</footer>
    </main>
  );
}
