// lib/astro.js — 西洋本命星盘 + 印占吠陀 (sidereal) using astronomy-engine
// Planet longitudes are geocentric apparent ecliptic longitudes (of date).
// Houses: Whole Sign (simple, defensible, needs only the Ascendant).
const A = require("astronomy-engine");

const SIGNS = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];
const NAKSHATRA = ["阿湿毗尼","婆罗尼","昴宿","毕宿","觜宿","参宿","井宿","鬼宿","柳宿","星宿","张宿","翼宿","轸宿","角宿","亢宿","氐宿","房宿","心宿","尾宿","箕宿","斗宿","牛宿","女宿","虚宿","危宿","室宿","壁宿"];
const BODIES = [
  ["太阳", A.Body.Sun], ["月亮", A.Body.Moon], ["水星", A.Body.Mercury], ["金星", A.Body.Venus],
  ["火星", A.Body.Mars], ["木星", A.Body.Jupiter], ["土星", A.Body.Saturn],
  ["天王星", A.Body.Uranus], ["海王星", A.Body.Neptune], ["冥王星", A.Body.Pluto],
];

const norm = (d) => ((d % 360) + 360) % 360;
const signOf = (lon) => ({ sign: SIGNS[Math.floor(norm(lon) / 30)], deg: +(norm(lon) % 30).toFixed(2) });

/** Lahiri ayanamsa (good to ~0.01° for 1900–2100) */
function lahiri(date) {
  const T = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
  return 23.85 + 1.396042 * T + 0.000308 * T * T; // ≈ 23°51' at J2000, +50.3"/yr
}

/** Ascendant from local sidereal time + latitude + obliquity */
function ascendant(date, lat, lon) {
  const gst = A.SiderealTime(date);                       // hours
  const lst = norm((gst + lon / 15) * 15);                // degrees
  const eps = 23.4393 * Math.PI / 180;
  const ramc = lst * Math.PI / 180, phi = lat * Math.PI / 180;
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return norm(asc * 180 / Math.PI);
}

function planets(date) {
  return BODIES.map(([name, body]) => {
    const vec = A.GeoVector(body, date, true);
    const ecl = A.Ecliptic(vec);
    return { name, lon: norm(ecl.elon) };
  });
}

/**
 * @param date  JS Date of birth in UTC (caller converts local → UTC)
 * @param lat, lon  birthplace
 */
function computeWestern(date, lat, lon) {
  const asc = ascendant(date, lat, lon);
  const ascSign = Math.floor(asc / 30);
  const ps = planets(date).map((p) => ({
    ...p, ...signOf(p.lon),
    house: ((Math.floor(p.lon / 30) - ascSign + 12) % 12) + 1,
  }));
  const sun = ps.find((p) => p.name === "太阳"), moon = ps.find((p) => p.name === "月亮");
  return {
    system: "西洋本命星盘",
    houseSystem: "整宫制 Whole Sign",
    ascendant: signOf(asc),
    big3: { sun: sun.sign, moon: moon.sign, rising: SIGNS[ascSign] },
    planets: ps.map(({ name, sign, deg, house }) => ({ name, sign, deg, house })),
    aspects: aspects(ps),
  };
}

function computeVedic(date, lat, lon) {
  const ay = lahiri(date);
  const asc = norm(ascendant(date, lat, lon) - ay);
  const ascSign = Math.floor(asc / 30);
  const ps = planets(date).map((p) => {
    const sl = norm(p.lon - ay);
    return { name: p.name, ...signOf(sl), house: ((Math.floor(sl / 30) - ascSign + 12) % 12) + 1,
             nakshatra: NAKSHATRA[Math.floor(sl / (360 / 27))], pada: Math.floor((sl % (360 / 27)) / (360 / 108)) + 1 };
  }).filter((p) => !["天王星", "海王星", "冥王星"].includes(p.name));
  const moon = ps.find((p) => p.name === "月亮");
  return {
    system: "印占吠陀",
    ayanamsa: `Lahiri ${ay.toFixed(2)}°`,
    lagna: signOf(asc),
    moonSign: moon.sign, janmaNakshatra: `${moon.nakshatra} 第${moon.pada}步`,
    planets: ps,
  };
}

function aspects(ps) {
  const out = [], defs = [[0, "合", 8], [60, "六分", 4], [90, "刑", 6], [120, "三分", 6], [180, "冲", 8]];
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const d = Math.abs(((ps[i].lon - ps[j].lon + 540) % 360) - 180);
    for (const [ang, name, orb] of defs) if (Math.abs(d - ang) <= orb)
      out.push(`${ps[i].name}${name}${ps[j].name}(${Math.abs(d - ang).toFixed(1)}°)`);
  }
  return out;
}

module.exports = { computeWestern, computeVedic, planets, norm, lahiri };

// ---------- Transits / Horoscope ----------
const SIGN_EL = { 白羊: "火", 狮子: "火", 射手: "火", 金牛: "土", 处女: "土", 摩羯: "土", 双子: "风", 天秤: "风", 水瓶: "风", 巨蟹: "水", 天蝎: "水", 双鱼: "水" };

function isRetro(body, date) {
  const a = A.Ecliptic(A.GeoVector(body, new Date(date.getTime() - 43200000), true)).elon;
  const b = A.Ecliptic(A.GeoVector(body, new Date(date.getTime() + 43200000), true)).elon;
  return ((b - a + 540) % 360) - 180 < 0;
}

function moonPhase(date) {
  const ph = A.MoonPhase(date); // 0 new, 90 first quarter, 180 full, 270 last quarter
  const name = ph < 22.5 || ph >= 337.5 ? "新月" : ph < 67.5 ? "娥眉月" : ph < 112.5 ? "上弦月" : ph < 157.5 ? "盈凸月" : ph < 202.5 ? "满月" : ph < 247.5 ? "亏凸月" : ph < 292.5 ? "下弦月" : "残月";
  return { angle: +ph.toFixed(1), name };
}

/**
 * Transits for a moment, read against a natal chart (from computeWestern).
 * natal may be null → sun-sign-only mode.
 */
function computeTransits(natal, date = new Date()) {
  const now = BODIES.map(([name, body]) => {
    const lon = norm(A.Ecliptic(A.GeoVector(body, date, true)).elon);
    const s = signOf(lon);
    const o = { name, lon, sign: s.sign, deg: s.deg, retro: name !== "太阳" && name !== "月亮" && isRetro(body, date) };
    if (natal) o.house = ((Math.floor(lon / 30) - SIGNS.indexOf(natal.ascendant.sign) + 12) % 12) + 1;
    return o;
  });
  const out = { date: date.toISOString().slice(0, 10), moon: moonPhase(date), transits: now.map(({ lon, ...r }) => r) };
  if (natal) {
    const defs = [[0, "合", 3], [90, "刑", 3], [120, "三分", 3], [180, "冲", 3], [60, "六分", 2]];
    const asp = [];
    const natalLons = natal.planets.map((p) => ({ name: p.name, lon: SIGNS.indexOf(p.sign) * 30 + p.deg }));
    natalLons.push({ name: "上升", lon: SIGNS.indexOf(natal.ascendant.sign) * 30 + natal.ascendant.deg });
    for (const t of now) for (const n of natalLons) {
      const d = Math.abs(((t.lon - n.lon + 540) % 360) - 180);
      for (const [ang, nm, orb] of defs) if (Math.abs(d - ang) <= orb) asp.push(`行运${t.name}${nm}本命${n.name}(${Math.abs(d - ang).toFixed(1)}°)`);
    }
    out.aspectsToNatal = asp;
  }
  return out;
}

/** Sun-sign quick profile (no birth time) */
function sunSignOnly(sign) {
  const MODAL = { 白羊: "开创", 巨蟹: "开创", 天秤: "开创", 摩羯: "开创", 金牛: "固定", 狮子: "固定", 天蝎: "固定", 水瓶: "固定", 双子: "变动", 处女: "变动", 射手: "变动", 双鱼: "变动" };
  const RULER = { 白羊: "火星", 金牛: "金星", 双子: "水星", 巨蟹: "月亮", 狮子: "太阳", 处女: "水星", 天秤: "金星", 天蝎: "冥王星/火星", 射手: "木星", 摩羯: "土星", 水瓶: "天王星/土星", 双鱼: "海王星/木星" };
  return { sign, element: SIGN_EL[sign], modality: MODAL[sign], ruler: RULER[sign] };
}

module.exports.computeTransits = computeTransits;
module.exports.sunSignOnly = sunSignOnly;
module.exports.SIGNS = SIGNS;

/** Lunar events (new/quarter/full moons) and planet sign ingresses inside a window */
function periodEvents(start, days) {
  const end = new Date(start.getTime() + days * 86400000);
  const events = [];
  let q = A.SearchMoonQuarter(start);
  while (q && q.time.date < end) { events.push({ date: q.time.date.toISOString().slice(0, 10), event: ["新月", "上弦月", "满月", "下弦月"][q.quarter] + " · " + signOf(norm(A.Ecliptic(A.GeoVector(A.Body.Moon, q.time.date, true)).elon)).sign }); q = A.NextMoonQuarter(q); }
  for (const [name, body] of BODIES.filter(([n]) => n !== "月亮")) {
    let prev = Math.floor(norm(A.Ecliptic(A.GeoVector(body, start, true)).elon) / 30);
    for (let d = 1; d <= days; d++) {
      const t = new Date(start.getTime() + d * 86400000);
      const cur = Math.floor(norm(A.Ecliptic(A.GeoVector(body, t, true)).elon) / 30);
      if (cur !== prev) { events.push({ date: t.toISOString().slice(0, 10), event: `${name}进入${SIGNS[cur]}` }); prev = cur; }
    }
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}
module.exports.periodEvents = periodEvents;
