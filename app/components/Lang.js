"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { makeT, detectLang, LANG_KEY } from "@/lib/i18n";
const Ctx = createContext({ lang: "zh-CN", t: makeT("zh-CN"), setLang: () => {} });
export function LangProvider({ children }) {
  const [lang, setLangState] = useState("zh-CN");
  useEffect(() => { const l = detectLang(); setLangState(l); document.documentElement.lang = l; }, []);
  const setLang = (l) => { setLangState(l); try { localStorage.setItem(LANG_KEY, l); } catch {} document.documentElement.lang = l; };
  return <Ctx.Provider value={{ lang, t: makeT(lang), setLang }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
