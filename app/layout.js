import "./globals.css";

export const metadata = {
  title: "壶中天机 · 八字排盘",
  description: "八字排盘 + AI 解读 — 学习版",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+SC:wght@400;500;600&family=Noto+Sans+SC:wght@400;500&family=Noto+Sans+Thai:wght@400;500&family=Noto+Sans+Khmer:wght@400;500&family=Noto+Sans+Lao:wght@400;500&family=Noto+Sans+JP:wght@400;500&family=Noto+Sans+KR:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('hztj.theme')==='dark')document.documentElement.setAttribute('data-theme','dark');var z=localStorage.getItem('hztj.zoom');if(z)document.documentElement.style.fontSize=z+'%'}catch(e){}` }} /></head>
      <body>{children}</body>
    </html>
  );
}
