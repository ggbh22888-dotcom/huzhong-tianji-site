// lib/others.js — 灵数 (Pythagorean numerology), 玛雅历法 (Tzolkin), 人类图 (simplified gates)
const { planets, norm } = require("./astro");

// ---------- 灵数 ----------
const reduce = (n, keepMaster = true) => {
  while (n > 9 && !(keepMaster && [11, 22, 33].includes(n))) n = String(n).split("").reduce((a, b) => a + +b, 0);
  return n;
};
const digitsOf = (n) => String(n).split("").map(Number);

function computeNumerology({ year, month, day }) {
  const now = new Date();
  const lifePath = reduce(reduce(year) + reduce(month) + reduce(day));
  const birthday = reduce(day);
  const attitude = reduce(reduce(month) + reduce(day));                 // 态度数 (生日+月)
  const personalYear = reduce(reduce(month) + reduce(day) + reduce(now.getFullYear()));
  const m = reduce(month, false), d = reduce(day, false), y = reduce(year, false);
  const challenges = [Math.abs(m - d), Math.abs(d - y)];
  challenges.push(Math.abs(challenges[0] - challenges[1]), Math.abs(m - y));
  // 生日金字塔 / 九宫格: count of each digit in full birth date
  const grid = {}; for (const n of digitsOf(`${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`)) if (n) grid[n] = (grid[n] || 0) + 1;
  const missing = [1,2,3,4,5,6,7,8,9].filter((n) => !grid[n]);
  return { system: "灵数", lifePath, birthday, attitude, personalYear, challenges, grid, missing };
}

// ---------- 玛雅历法 (Tzolkin, GMT correlation 584283) ----------
const SEALS = ["红龙","白风","蓝夜","黄种子","红蛇","白世界桥","蓝手","黄星星","红月","白狗","蓝猴","黄人","红天行者","白巫师","蓝鹰","黄战士","红地球","白镜","蓝风暴","黄太阳"];
const TONES = ["磁性","月亮","电力","自我存在","超频","韵律","共振","银河星系","太阳","行星","光谱","水晶","宇宙"];
function jdn(y, m, d) { const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045; }
function computeMaya({ year, month, day }) {
  const kin = ((((jdn(year, month, day) - 584283) + 160 - 1) % 260) + 260) % 260 + 1;
  const tone = ((kin - 1) % 13) + 1, seal = ((kin - 1) % 20);
  // 波符 (wavespell) = the kin that starts this 13-day run
  const waveStart = kin - (tone - 1); const waveSeal = ((waveStart - 1) % 20);
  // 引导 (guide) rule by tone
  const guideOffset = { 1: 0, 6: 0, 11: 0, 2: 12, 7: 12, 12: 12, 3: 4, 8: 4, 13: 4, 4: 16, 9: 16, 5: 8, 10: 8 }[tone];
  const challenge = (seal + 10) % 20, analog = (19 - seal) % 20, occult = (21 - seal + 20) % 20 % 20;
  return { system: "玛雅历法", kin, tone: `${TONES[tone - 1]}之调性 ${tone}`, seal: SEALS[seal], wavespell: SEALS[waveSeal] + "波符",
           guide: SEALS[(seal + guideOffset) % 20], analog: SEALS[analog], challenge: SEALS[challenge], occult: SEALS[(occult) % 20] };
}

// ---------- 人类图 (简版：太阳/地球门, 人生角色, 轮回交叉粗略) ----------
// Gate wheel order starting at 302° (Aquarius 2°) going counter-clockwise, 5.625° each.
const GATES = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
function gateOf(lon) { const off = norm(lon - 302); const idx = Math.floor(off / 5.625); const line = Math.floor((off % 5.625) / 0.9375) + 1; return { gate: GATES[idx], line }; }
function sunLon(date) { return planets(date).find((p) => p.name === "太阳").lon; }
function computeHumanDesign(dateUTC) {
  const pSun = sunLon(dateUTC);
  // Design = moment the Sun was 88° earlier (≈ 88 days before birth) — solve by stepping
  let t = new Date(dateUTC.getTime() - 88 * 86400000);
  for (let i = 0; i < 6; i++) { const diff = norm(pSun - 88 - sunLon(t)); const step = (diff > 180 ? diff - 360 : diff) / 0.9856; t = new Date(t.getTime() + step * 86400000); }
  const dSun = sunLon(t);
  const ps = gateOf(pSun), pe = gateOf(pSun + 180), ds = gateOf(dSun), de = gateOf(dSun + 180);
  return {
    system: "人类图（简版）",
    note: "完整类型/权威需全部13颗星体与通道定义；此处给出核心四门与人生角色。",
    profile: `${ps.line}/${ds.line}`,
    personality: { sun: ps, earth: pe },
    design: { sun: ds, earth: de, date: t.toISOString().slice(0, 10) },
    incarnationCross: `${ps.gate}/${pe.gate} | ${ds.gate}/${de.gate}`,
  };
}

module.exports = { computeNumerology, computeMaya, computeHumanDesign };
