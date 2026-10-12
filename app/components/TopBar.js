"use client";
// TopBar — 夜间模式 / 新开一问 / 语言 / 积分 / 账户（后两项待账户系统上线）
import { useEffect, useRef, useState } from "react";
import { LANGS } from "@/lib/i18n";
import { useLang } from "./Lang";

export default function TopBar({ onNew }) {
  const { lang, t, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => { if (!open) return; const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  const [dark, setDark] = useState(false);
  const [zoom, setZoom] = useState(100);
  const ZOOMS = [85, 100, 115, 130, 150];
  useEffect(() => { try { const z = +localStorage.getItem("hztj.zoom"); if (ZOOMS.includes(z)) { setZoom(z); document.documentElement.style.fontSize = z + "%"; } } catch {} }, []);
  function zoomBy(dir) {
    const i = ZOOMS.indexOf(zoom); const z = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + dir))];
    setZoom(z); document.documentElement.style.fontSize = z + "%";
    try { localStorage.setItem("hztj.zoom", String(z)); } catch {}
  }
  useEffect(() => { try { const t = localStorage.getItem("hztj.theme"); if (t === "dark") { setDark(true); document.documentElement.setAttribute("data-theme", "dark"); } } catch {} }, []);
  function toggle() {
    const d = !dark; setDark(d);
    document.documentElement.setAttribute("data-theme", d ? "dark" : "light");
    try { localStorage.setItem("hztj.theme", d ? "dark" : "light"); } catch {}
  }
  return (
    <div className="topbar">
      <button type="button" title={dark ? t("tb_light") : t("tb_dark")} onClick={toggle} aria-label="主题">
        {dark ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}
      </button>
      <span className="zoomctl" title={t("tb_zoom")}>
        <button type="button" aria-label="缩小" onClick={() => zoomBy(-1)} disabled={zoom === 85}>A−</button>
        <b>{zoom}%</b>
        <button type="button" aria-label="放大" onClick={() => zoomBy(1)} disabled={zoom === 150}>A+</button>
      </span>
      <button type="button" title={t("tb_new")} onClick={onNew} aria-label={t("tb_new")}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg></button>
      <span className="langwrap" ref={menuRef}>
        <button type="button" title={t("tb_lang")} aria-label={t("tb_lang")} aria-expanded={open} onClick={() => setOpen((o) => !o)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg></button>
        {open && <ul className="langmenu" role="listbox">{LANGS.map(([c, n]) => <li key={c} role="option" aria-selected={c === lang} className={c === lang ? "on" : ""} onClick={() => { setLang(c); setOpen(false); }}>{n}{c === lang && <span>✓</span>}</li>)}</ul>}
      </span>
      <span className="credits">{t("tb_credits")}</span>
      <a className="acct" href="#" title={t("tb_acct")} aria-label={t("tb_acct")} onClick={(e) => e.preventDefault()}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg></a>
    </div>
  );
}
