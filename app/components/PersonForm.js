"use client";
// PersonForm — reusable birth-data form (公历/农历, 时辰, 出生地, 真太阳时)
import { PLACES } from "@/lib/places";
import { Lunar } from "lunar-javascript";

const YEARS = Array.from({ length: 2030 - 1920 + 1 }, (_, i) => 2030 - i);
const SHICHEN = ["子","丑","丑","寅","寅","卯","卯","辰","辰","巳","巳","午","午","未","未","申","申","酉","酉","戌","戌","亥","亥","子"];

export const emptyPerson = (over = {}) => ({
  name: "", gender: "女", calendar: "solar", year: 1990, month: 1, day: 1, hour: 12, minute: 0, hourUnknown: false,
  country: "新加坡", city: "新加坡 Singapore", useTrueSolar: true, ...over,
});

/** Convert the form state into the payload the API expects (always 公历). */
export function personPayload(p) {
  let { year, month, day } = p;
  if (p.calendar === "lunar") {
    try { const s = Lunar.fromYmd(+year, +month, +day).getSolar(); year = s.getYear(); month = s.getMonth(); day = s.getDay(); } catch {}
  }
  const c = PLACES[p.country]?.[p.city] || [1.35, 103.82, 8];
  return {
    name: p.name, gender: p.gender, year: +year, month: +month, day: +day,
    hour: p.hourUnknown ? 12 : +p.hour, minute: p.hourUnknown ? 0 : +p.minute, hourUnknown: !!p.hourUnknown,
    latitude: c[0], longitude: c[1], tzHours: c[2], useTrueSolar: !!p.useTrueSolar && !p.hourUnknown,
    birthplace: p.city, calendarInput: p.calendar,
  };
}

export default function PersonForm({ value, onChange, label, compact = false }) {
  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const next = { ...value, [k]: v };
    if (k === "country") next.city = Object.keys(PLACES[v])[0];
    onChange(next);
  };
  return (
    <fieldset className="person">
      {label && <legend>{label}</legend>}
      <div className="row">
        <label>姓名 <input value={value.name} onChange={set("name")} placeholder="选填" /></label>
        <label>性别 <select value={value.gender} onChange={set("gender")}><option>女</option><option>男</option></select></label>
        <label>历法 <select value={value.calendar} onChange={set("calendar")}><option value="solar">公历</option><option value="lunar">农历</option></select></label>
      </div>
      <div className="row">
        <label>年 <select value={value.year} onChange={set("year")}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></label>
        <label>月 <select value={value.month} onChange={set("month")}>{[...Array(12)].map((_, i) => <option key={i}>{i + 1}</option>)}</select></label>
        <label>日 <select value={value.day} onChange={set("day")}>{[...Array(value.calendar === "lunar" ? 30 : 31)].map((_, i) => <option key={i}>{i + 1}</option>)}</select></label>
      </div>
      <div className="row">
        <label>时辰
          <select value={value.hour} onChange={set("hour")} disabled={value.hourUnknown}>
            {SHICHEN.map((z, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00 ({z}时)</option>)}
          </select>
        </label>
        <label>分 <select value={value.minute} onChange={set("minute")} disabled={value.hourUnknown}>{[...Array(60)].map((_, i) => <option key={i}>{i}</option>)}</select></label>
        <label className="check"><input type="checkbox" checked={value.hourUnknown} onChange={set("hourUnknown")} /> 时辰不详</label>
      </div>
      {!compact && (
        <div className="row">
          <label>国家/地区 <select value={value.country} onChange={set("country")}>{Object.keys(PLACES).map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>城市 <select value={value.city} onChange={set("city")}>{Object.keys(PLACES[value.country] || {}).map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="check"><input type="checkbox" checked={value.useTrueSolar} onChange={set("useTrueSolar")} disabled={value.hourUnknown} /> 真太阳时</label>
        </div>
      )}
    </fieldset>
  );
}
