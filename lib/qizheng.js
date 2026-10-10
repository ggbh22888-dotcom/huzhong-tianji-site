// lib/qizheng.js — 七政四余 (Chinese classical astrology)
// 七政 = 日 月 金 木 水 火 土；四余 = 紫气 月孛 罗睺 计都
// Positions are SIDEREAL (恒星黄道), mapped onto 二十八宿 and 十二次/十二宫.
// Method notes:
//   - Sidereal = tropical − ayanamsa. We use the same Lahiri value as the Vedic chart
//     so 七政 and 吠陀 agree with each other; classical 果老 texts differ slightly.
//   - 罗睺 = 北交点(mean node), 计都 = 南交点 — the 果老星宗 convention (some schools swap).
//   - 月孛 = 月亮远地点 (mean lunar apogee), period ≈ 8.85 yr.
//   - 紫气 = fictitious, period 28 yr, retrograde-free; epoch per 《果老星宗》 approximation.
//   - 二十八宿 boundaries use the modern equal-ish 宿度 table (Qing dynasty values).
const A = require("astronomy-engine");
const { norm } = require("./astro");

const XIU = [ // name, start deg (sidereal, from 角宿 at 0 of 辰宫 ≈ Libra 0 sidereal) → we anchor 角 at sidereal 180°
  ["角", 12], ["亢", 9], ["氐", 16], ["房", 5], ["心", 6], ["尾", 18], ["箕", 10],
  ["斗", 24], ["牛", 7], ["女", 11], ["虚", 9], ["危", 16], ["室", 17], ["壁", 9],
  ["奎", 16], ["娄", 12], ["胃", 15], ["昴", 11], ["毕", 17], ["觜", 1], ["参", 10],
  ["井", 31], ["鬼", 3], ["柳", 14], ["星", 7], ["张", 17], ["翼", 19], ["轸", 18],
]; // sums to 360
const ANCHOR = 180; // 角宿初度 ≈ sidereal 180° (辰宫起点, 寿星之次)
const CI = ["寿星", "大火", "析木", "星纪", "玄枵", "娵訾", "降娄", "大梁", "实沈", "鹑首", "鹑火", "鹑尾"]; // from 辰 going 辰卯寅丑子亥戌酉申未午巳
const GONG = ["辰", "卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳"];
const WUXING = { 日: "火", 月: "水", 金: "金", 木: "木", 水: "水", 火: "火", 土: "土", 紫气: "木", 月孛: "水", 罗睺: "火", 计都: "土" };

function toXiu(sid) {
  let d = norm(sid - ANCHOR);
  for (const [name, span] of XIU) { if (d < span) return `${name}宿${d.toFixed(1)}度`; d -= span; }
  return "轸宿";
}
function toGong(sid) { const i = Math.floor(norm(sid - ANCHOR) / 30); return { gong: GONG[i] + "宫", ci: CI[i] }; }

function julianCenturies(date) { return (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525; }

function computeQizheng(dateUTC, ayanamsa) {
  const T = julianCenturies(dateUTC);
  const bodies = [["日", A.Body.Sun], ["月", A.Body.Moon], ["金", A.Body.Venus], ["木", A.Body.Jupiter], ["水", A.Body.Mercury], ["火", A.Body.Mars], ["土", A.Body.Saturn]];
  const list = bodies.map(([name, b]) => ({ name, trop: norm(A.Ecliptic(A.GeoVector(b, dateUTC, true)).elon) }));
  // Mean lunar node (Meeus) and mean apogee
  const node = norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
  const apogee = norm(83.3532465 + 4069.0137287 * T - 0.0103200 * T * T);
  // 紫气: 28-year cycle, direct motion ≈ 12.857°/yr; epoch: 2000-01-01 ≈ 283° tropical (approximation used by several modern 果老 programs)
  const ziqi = norm(283 + (T * 100) * (360 / 28));
  list.push({ name: "罗睺", trop: node }, { name: "计都", trop: norm(node + 180) }, { name: "月孛", trop: apogee }, { name: "紫气", trop: ziqi });

  const stars = list.map((s) => {
    const sid = norm(s.trop - ayanamsa);
    return { name: s.name, wuxing: WUXING[s.name], ...toGong(sid), xiu: toXiu(sid), sidereal: +sid.toFixed(2) };
  });
  const sun = stars[0], moon = stars[1];
  return {
    system: "七政四余",
    note: "恒星黄道（与吠陀同用 Lahiri 岁差）；罗睺=北交、计都=南交；紫气为推算虚星。各家起法有差，仅供参考。",
    ayanamsa: +ayanamsa.toFixed(2),
    sunGong: sun.gong, sunCi: sun.ci, moonXiu: moon.xiu,
    stars,
  };
}

module.exports = { computeQizheng };
