import "./globals.css";

export const metadata = {
  title: "壶中天机 · 八字排盘",
  description: "八字排盘 + AI 解读 — 学习版",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('hztj.theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}` }} /></head>
      <body>{children}</body>
    </html>
  );
}
