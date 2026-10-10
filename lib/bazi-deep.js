// lib/bazi-deep.js — 八字进阶：十神全表、神煞、五行权重与身强弱、格局、喜用神、大运流年表
// All verdicts here are 倾向判断 (tendencies). Schools differ; the output says so.
const { LunarUtil } = require("lunar-javascript");

const GAN = "甲乙丙丁戊己庚辛壬癸", ZHI = "子丑寅卯辰巳午未申酉戌亥";
const GAN_WX = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
const ZHI_WX = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
const SHENG = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" }; // 我生
const KE = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };    // 我克
const shiShen = (dayGan, gan) => LunarUtil.SHI_SHEN[dayGan + gan] || "";

// ---------- 藏干 weights (本气/中气/余气) ----------
const HIDE_W = { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.3, 0.1] };

// ---------- 神煞 tables (常用) ----------
const TIANYI = { 甲: "丑未", 戊: "丑未", 庚: "丑未", 乙: "子申", 己: "子申", 丙: "亥酉", 丁: "亥酉", 壬: "卯巳", 癸: "卯巳", 辛: "午寅" };
const WENCHANG = { 甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申", 己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯" };
const LU = { 甲: "寅", 乙: "卯", 丙: "巳", 丁: "午", 戊: "巳", 己: "午", 庚: "申", 辛: "酉", 壬: "亥", 癸: "子" };
const YANGREN = { 甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子" };
const SAN_HE = { 申: "申子辰", 子: "申子辰", 辰: "申子辰", 寅: "寅午戌", 午: "寅午戌", 戌: "寅午戌", 巳: "巳酉丑", 酉: "巳酉丑", 丑: "巳酉丑", 亥: "亥卯未", 卯: "亥卯未", 未: "亥卯未" };
const BY_TRIAD = { // 以年支/日支三合局查：桃花 驿马 华盖 将星
  申子辰: { 桃花: "酉", 驿马: "寅", 华盖: "辰", 将星: "子" }, 寅午戌: { 桃花: "卯", 驿马: "申", 华盖: "戌", 将星: "午" },
  巳酉丑: { 桃花: "午", 驿马: "亥", 华盖: "丑", 将星: "酉" }, 亥卯未: { 桃花: "子", 驿马: "巳", 华盖: "未", 将星: "卯" },
};
const HONGLUAN = { 子: "卯", 丑: "寅", 寅: "丑", 卯: "子", 辰: "亥", 巳: "戌", 午: "酉", 未: "申", 申: "未", 酉: "午", 戌: "巳", 亥: "辰" }; // 以年支
const GUCHEN = { 亥: "寅", 子: "寅", 丑: "寅", 寅: "巳", 卯: "巳", 辰: "巳", 巳: "申", 午: "申", 未: "申", 申: "亥", 酉: "亥", 戌: "亥" };
const GUASU = { 亥: "戌", 子: "戌", 丑: "戌", 寅: "丑", 卯: "丑", 辰: "丑", 巳: "辰", 午: "辰", 未: "辰", 申: "未", 酉: "未", 戌: "未" };
const KUIGANG = ["庚辰", "庚戌", "壬辰", "戊戌"];

function shenSha(p, dayXunKong) {
  // p: { year:{gan,zhi}, month, day, hour }, returns list of { name, where }
  const out = [], cols = ["year", "month", "day", "hour"], label = { year: "年", month: "月", day: "日", hour: "时" };
  const dg = p.day.gan, yz = p.year.zhi, dz = p.day.zhi;
  const hit = (name, zhiSet, basis) => cols.forEach((c) => { if (zhiSet.includes(p[c].zhi)) out.push({ name, where: label[c] + "支", basis }); });
  hit("天乙贵人", TIANYI[dg], "日干");
  hit("文昌", WENCHANG[dg], "日干");
  hit("禄神", LU[dg], "日干");
  if (YANGREN[dg]) hit("羊刃", YANGREN[dg], "日干");
  for (const [basis, z] of [["年支", yz], ["日支", dz]]) {
    const t = BY_TRIAD[SAN_HE[z]];
    for (const [name, target] of Object.entries(t)) cols.forEach((c) => { if (p[c].zhi === target && !(basis === "日支" && c === "day")) out.push({ name, where: label[c] + "支", basis }); });
  }
  hit("红鸾", HONGLUAN[yz], "年支");
  hit("天喜", ZHI[(ZHI.indexOf(HONGLUAN[yz]) + 6) % 12], "年支");
  hit("孤辰", GUCHEN[yz], "年支"); hit("寡宿", GUASU[yz], "年支");
  if (KUIGANG.includes(p.day.gan + p.day.zhi)) out.push({ name: "魁罡", where: "日柱", basis: "日柱" });
  // 空亡 (日柱旬空)
  const kong = dayXunKong || "";
  if (kong) cols.filter((c) => c !== "day").forEach((c) => { if (kong.includes(p[c].zhi)) out.push({ name: "空亡", where: label[c] + "支", basis: "日柱旬空" }); });
  // dedupe
  const seen = new Set();
  return out.filter((s) => { const k = s.name + s.where; if (seen.has(k)) return false; seen.add(k); return true; });
}

// ---------- 五行权重 & 身强弱 ----------
function strength(pillars, dayGan) {
  const me = GAN_WX[dayGan];
  const w = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const add = (wx, v) => { w[wx] += v; };
  const colW = { year: 1.0, month: 1.2, day: 1.0, hour: 1.0 };
  for (const c of ["year", "month", "day", "hour"]) {
    const p = pillars[c];
    if (c !== "day") add(GAN_WX[p.gan], 1.0 * colW[c]);          // 天干（日主自身不计）
    const hs = p.hideGan, ws = HIDE_W[hs.length] || [1];
    const zhiW = c === "month" ? 3.0 : 1.5;                         // 月令权重最高
    hs.forEach((g, i) => add(GAN_WX[g], zhiW * ws[i]));
  }
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  const pct = Object.fromEntries(Object.entries(w).map(([k, v]) => [k, +((v / total) * 100).toFixed(1)]));
  // 同党 = 比劫(同我) + 印(生我)；异党 = 其余
  const shengMe = Object.keys(SHENG).find((k) => SHENG[k] === me);
  const self = w[me] + w[shengMe], other = total - self;
  const ratio = self / total;
  const monthZhiWx = ZHI_WX[pillars.month.zhi];
  const deLing = monthZhiWx === me || monthZhiWx === shengMe;
  let verdict = ratio >= 0.58 ? "身强" : ratio <= 0.42 ? "身弱" : "中和";
  if (verdict === "中和") verdict = deLing ? "中和偏强" : "中和偏弱";
  return { weights: w, percent: pct, selfRatio: +(ratio * 100).toFixed(1), deLing, verdict,
           note: "权重法：月令藏干×3，其余地支藏干×1.5，天干×1（月干×1.2），藏干按本/中/余气 0.6/0.3/0.1 分摊。为倾向判断。" };
}

// ---------- 格局 (月令取格) ----------
function pattern(pillars, dayGan) {
  const mz = pillars.month.zhi, hs = pillars.month.hideGan;
  const touGan = [pillars.year.gan, pillars.month.gan, pillars.hour.gan];
  // 优先透出的藏干取格，否则取本气
  let geGan = hs.find((g) => touGan.includes(g)) || hs[0];
  let ss = shiShen(dayGan, geGan);
  let name;
  if (ss === "比肩") name = "建禄格"; else if (ss === "劫财") name = "月刃格"; else name = ss + "格";
  return { name, byGan: geGan, shiShen: ss, touChu: touGan.includes(geGan), note: "按月令藏干透干取格；特殊格局（从格、化格等）未判定。" };
}

// ---------- 喜用神 (简法) ----------
function yongShen(dayGan, str) {
  const me = GAN_WX[dayGan];
  const shengMe = Object.keys(SHENG).find((k) => SHENG[k] === me);
  const keMe = Object.keys(KE).find((k) => KE[k] === me);
  const strong = /强/.test(str.verdict);
  const like = strong ? [KE[me], SHENG[me], keMe] : [shengMe, me];           // 强：财 食伤 官杀；弱：印 比劫
  const dislike = strong ? [shengMe, me] : [keMe, KE[me], SHENG[me]];
  // 调候：冬生火暖、夏生水润（粗略）
  return { like, dislike, basis: strong ? "身强宜克泄耗" : "身弱宜生扶", note: "以扶抑为主，未细论调候与通关；仅供参考。" };
}

// ---------- 大运 + 流年表 ----------
function fortuneGrid(ec, gender, dayGan) {
  const yun = ec.getYun(gender === "男" ? 1 : 0);
  const now = new Date().getFullYear();
  return yun.getDaYun().slice(1, 9).map((d) => ({
    ganZhi: d.getGanZhi(),
    startAge: d.getStartAge(), startYear: d.getStartYear(), endYear: d.getEndYear(),
    ganShiShen: shiShen(dayGan, d.getGanZhi()[0]),
    current: now >= d.getStartYear() && now <= d.getEndYear(),
    liuNian: d.getLiuNian().map((l) => ({ year: l.getYear(), age: l.getAge(), ganZhi: l.getGanZhi(), shiShen: shiShen(dayGan, l.getGanZhi()[0]), now: l.getYear() === now })),
  }));
}

// ---------- 十神分布统计 ----------
function shiShenStats(pillars, dayGan) {
  const count = {};
  const bump = (k, v) => { count[k] = (count[k] || 0) + v; };
  for (const c of ["year", "month", "day", "hour"]) {
    const p = pillars[c];
    if (c !== "day") bump(shiShen(dayGan, p.gan), 1);
    const ws = HIDE_W[p.hideGan.length] || [1];
    p.hideGan.forEach((g, i) => bump(shiShen(dayGan, g), ws[i]));
  }
  return Object.fromEntries(Object.entries(count).map(([k, v]) => [k, +v.toFixed(1)]));
}

function deepen(ec, pillars, dayGan, gender) {
  const str = strength(pillars, dayGan);
  return {
    strength: str,
    pattern: pattern(pillars, dayGan),
    yongShen: yongShen(dayGan, str),
    shenSha: shenSha(pillars, ec.getDayXunKong()),
    xunKong: { day: ec.getDayXunKong(), year: ec.getYearXunKong() },
    shiShenStats: shiShenStats(pillars, dayGan),
    fortuneGrid: fortuneGrid(ec, gender, dayGan),
  };
}

module.exports = { deepen, shiShen };
