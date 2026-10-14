"use client";
// PersonForm — reusable birth-data form (公历/农历, 闰月, 时辰, 出生地, 真太阳时)
import { PLACES } from "@/lib/places";
import { Lunar } from "lunar-javascript";
import { useLang } from "./Lang";

const YEARS = Array.from({ length: 2030 - 1920 + 1 }, (_, i) => 2030 - i);
const SHICHEN = ["子","丑","丑","寅","寅","卯","卯","辰","辰","巳","巳","午","午","未","未","申","申","酉","酉","戌","戌","亥","亥","子"];

function maxDay(person) {
  if (person.calendar === "lunar") return 30;
  return new Date(+person.year, +person.month, 0).getDate();
}

export const emptyPerson = (over = {}) => ({
  name: "", gender: "女", calendar: "solar", lunarLeap: false,
  year: 1990, month: 1, day: 1, hour: 12, minute: 0, hourUnknown: false,
  country: "新加坡", city: "新加坡 Singapore", useTrueSolar: true, ...over,
});

/** Convert the form state into the payload the API expects (always 公历). */
export function personPayload(p) {
  let { year, month, day } = p;
  if (p.calendar === "lunar") {
    try {
      const lunarMonth = p.lunarLeap ? -Math.abs(+month) : +month;
      const solar = Lunar.fromYmd(+year, lunarMonth, +day).getSolar();
      year = solar.getYear(); month = solar.getMonth(); day = solar.getDay();
    } catch {
      throw new Error("农历日期或闰月设置无效 / Invalid lunar date or leap-month setting.");
    }
  }
  const c = PLACES[p.country]?.[p.city] || [1.35, 103.82, 8];
  return {
    name: p.name, gender: p.gender, year: +year, month: +month, day: +day,
    hour: p.hourUnknown ? 12 : +p.hour, minute: p.hourUnknown ? 0 : +p.minute, hourUnknown: !!p.hourUnknown,
    latitude: c[0], longitude: c[1], tzHours: c[2], useTrueSolar: !!p.useTrueSolar && !p.hourUnknown,
    birthplace: p.city, calendarInput: p.calendar, lunarLeap: !!p.lunarLeap,
  };
}

export default function PersonForm({ value, onChange, label, compact = false }) {
  const { t, lang } = useLang();
  const leapLabel = lang?.startsWith("zh") ? "闰月" : "Leap month";
  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const next = { ...value, [k]: v };
    if (k === "country") next.city = Object.keys(PLACES[v])[0];
    if (k === "calendar" && v === "solar") next.lunarLeap = false;
    const days = maxDay(next);
    if (+next.day > days) next.day = days;
    onChange(next);
  };
  const days = maxDay(value);
  return (
    <fieldset className="person">
      {label && <legend>{label}</legend>}
      <div className="row">
        <label>{t("name")} <input value={value.name} onChange={set("name")} /></label>
        <label>{t("gender")} <select value={value.gender} onChange={set("gender")}><option value="女">{t("female")}</option><option value="男">{t("male")}</option></select></label>
        <label>{t("calendar")} <select value={value.calendar} onChange={set("calendar")}><option value="solar">{t("solar")}</option><option value="lunar">{t("lunar")}</option></select></label>
      </div>
      <div className="row">
        <label>{t("y")} <select value={value.year} onChange={set("year")}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></label>
        <label>{t("mo")} <select value={value.month} onChange={set("month")}>{[...Array(12)].map((_, i) => <option key={i}>{i + 1}</option>)}</select></label>
        <label>{t("d")} <select value={value.day} onChange={set("day")}>{[...Array(days)].map((_, i) => <option key={i}>{i + 1}</option>)}</select></label>
        {value.calendar === "lunar" && <label className="check"><input type="checkbox" checked={!!value.lunarLeap} onChange={set("lunarLeap")} /> {leapLabel}</label>}
      </div>
      <div className="row">
        <label>{t("h")}
          <select value={value.hour} onChange={set("hour")} disabled={value.hourUnknown}>
            {SHICHEN.map((z, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00 ({z}时)</option>)}
          </select>
        </label>
        <label>{t("mi")} <select value={value.minute} onChange={set("minute")} disabled={value.hourUnknown}>{[...Array(60)].map((_, i) => <option key={i}>{i}</option>)}</select></label>
        <label className="check"><input type="checkbox" checked={value.hourUnknown} onChange={set("hourUnknown")} /> {t("hour_unknown")}</label>
      </div>
      {!compact && (
        <div className="row">
          <label>{t("country")} <select value={value.country} onChange={set("country")}>{Object.keys(PLACES).map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>{t("city")} <select value={value.city} onChange={set("city")}>{Object.keys(PLACES[value.country] || {}).map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="check"><input type="checkbox" checked={value.useTrueSolar} onChange={set("useTrueSolar")} disabled={value.hourUnknown} /> {t("tst")}</label>
        </div>
      )}
    </fieldset>
  );
}
