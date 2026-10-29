// lib/duisui/liunian.js — 壺中度歲 流年运程引擎
// 输入：站点 computeBazi() 的输出（四柱、大运表、用神）+ 目标年份
// 输出：24 段（12 流月 × 上/下半月，以节/中气为界）结构化运程 + 全年配件
// 纯计算，无 AI。所有分值在同目录 *.json，改表不用改代码。
import { Lunar } from "lunar-javascript";
import shishenRules from "./shishen.json";
import dizhiRules from "./dizhi.json";
import shenshaRules from "./shensha.json";
import scoring from "./scoring.json";
import extras from "./extras.json";

const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const GAN_WX = { 甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水" };
const ZHI_WX = { 子:"水",丑:"土",寅:"木",卯:"木",辰:"土",巳:"火",午:"火",未:"土",申:"金",酉:"金",戌:"土",亥:"水" };
const YANG = new Set(["甲","丙","戊","庚","壬"]);
const SHENG = { 木:"火",火:"土",土:"金",金:"水",水:"木" };
const KE = { 木:"土",土:"水",水:"火",火:"金",金:"木" };

const MONTHS = [
  { jie:"立春", zhong:"雨水", zhi:"寅" }, { jie:"惊蛰", zhong:"春分", zhi:"卯" },
  { jie:"清明", zhong:"谷雨", zhi:"辰" }, { jie:"立夏", zhong:"小满", zhi:"巳" },
  { jie:"芒种", zhong:"夏至", zhi:"午" }, { jie:"小暑", zhong:"大暑", zhi:"未" },
  { jie:"立秋", zhong:"处暑", zhi:"申" }, { jie:"白露", zhong:"秋分", zhi:"酉" },
  { jie:"寒露", zhong:"霜降", zhi:"戌" }, { jie:"立冬", zhong:"小雪", zhi:"亥" },
  { jie:"大雪", zhong:"冬至", zhi:"子" }, { jie:"小寒", zhong:"大寒", zhi:"丑" },
];
const NEXT_YEAR_KEYS = { 冬至:"DONG_ZHI", 小寒:"XIAO_HAN", 大寒:"DA_HAN", 立春:"LI_CHUN" };
// 地支藏干 [本气, 中气, 余气]：上半月（节→中气）取中气人元，下半月取本气
const CANG_GAN = {
  子:["癸"], 丑:["己","癸","辛"], 寅:["甲","丙","戊"], 卯:["乙"], 辰:["戊","乙","癸"], 巳:["丙","庚","戊"],
  午:["丁","己"], 未:["己","丁","乙"], 申:["庚","壬","戊"], 酉:["辛"], 戌:["戊","辛","丁"], 亥:["壬","甲"],
};
const DIMS = scoring.dims;
const LITE = scoring.liteMap;

export function shiShen(dayGan, other) {
  const d = GAN_WX[dayGan], o = GAN_WX[other];
  const same = YANG.has(dayGan) === YANG.has(other);
  if (d === o) return same ? "比肩" : "劫财";
  if (SHENG[d] === o) return same ? "食神" : "伤官";
  if (KE[d] === o) return same ? "偏财" : "正财";
  if (KE[o] === d) return same ? "七杀" : "正官";
  return same ? "偏印" : "正印";
}
export function liuNianGanZhi(year) {
  const gan = GAN[((year - 4) % 10 + 10) % 10], zhi = ZHI[((year - 4) % 12 + 12) % 12];
  return { gan, zhi, ganZhi: gan + zhi };
}
/** 五虎遁 */
export function liuYueGanZhi(yearGan, monthIdx) {
  const first = ((GAN.indexOf(yearGan) % 5) * 2 + 2) % 10;
  return GAN[(first + monthIdx) % 10] + MONTHS[monthIdx].zhi;
}
const pairMatch = (pairs, a, b) => pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const clamp = (v) => Math.min(5, Math.max(1, Math.round(v * 2) / 2));

/**
 * @param {object} bazi   computeBazi() 输出：pillars.{year,month,day,hour}.{gan,zhi}、fortuneGrid、yongShen
 * @param {number} targetYear
 * @param {object} [opt]  { yongshen:[], jishen:[] } 覆盖站点自动用神
 */
export function computeLiuNian(bazi, targetYear, opt = {}) {
  const P = bazi.pillars;
  const dayGan = P.day.gan;
  const chartZhi = { 年支: P.year.zhi, 月支: P.month.zhi, 日支: P.day.zhi, 时支: P.hour.zhi };
  const chartPillars = [P.year, P.month, P.day, P.hour].map((p) => p.gan + p.zhi);
  const yongshen = opt.yongshen || bazi.yongShen?.like || [];
  const jishen = opt.jishen || bazi.yongShen?.dislike || [];

  const dy = (bazi.fortuneGrid || []).find((d) => targetYear >= d.startYear && targetYear <= d.endYear);
  const daYun = dy ? { ganZhi: dy.ganZhi, startYear: dy.startYear, endYear: dy.endYear, shiShen: dy.ganShiShen } : null;

  const ln = liuNianGanZhi(targetYear);
  const liuNian = { ...ln, shishen: shiShen(dayGan, ln.gan), element: GAN_WX[ln.gan] };

  const table = Lunar.fromYmd(targetYear, 6, 1).getJieQiTable();
  const jq = (name, nextYear = false) => new Date(table[nextYear ? NEXT_YEAR_KEYS[name] : name].toYmdHms().replace(" ", "T") + "+08:00");
  const winMs = scoring.jiaoJieWindowDays * 86400000;
  const segments = [];

  MONTHS.forEach((m, i) => {
    const isLast = i === 11;
    const tJie = jq(m.jie, isLast), tZhong = jq(m.zhong, isLast || m.zhong === "冬至");
    const tNext = isLast ? jq("立春", true) : jq(MONTHS[i + 1].jie);
    const ly = liuYueGanZhi(ln.gan, i), lyGan = ly[0], lyZhi = ly[1];

    [["上", tJie, tZhong, m.jie], ["下", tZhong, tNext, m.zhong]].forEach(([half, start, end, jieqi], h) => {
      const sc = {}; DIMS.forEach((d) => (sc[d] = scoring.base));
      let overall = scoring.base;
      const relations = [], shensha = [], hints = [];
      const addDims = (dims, mult = 1) => { if (dims) for (const [d, v] of Object.entries(dims)) if (sc[d] !== undefined) sc[d] += v * mult; };
      const apply = (ss, w) => { const r = shishenRules[ss]; DIMS.forEach((d) => (sc[d] += (r[d] ?? 0) * w)); };

      // 1. 十神：流年干 / 流月干 / 司令人元
      const ssY = liuNian.shishen, ssM = shiShen(dayGan, lyGan);
      const cg = CANG_GAN[lyZhi];
      const renYuan = half === "上" ? (cg[1] ?? cg[0]) : cg[0];
      const ssR = shiShen(dayGan, renYuan);
      apply(ssY, scoring.liuNianGanWeight); apply(ssM, scoring.liuYueGanWeight); apply(ssR, scoring.renYuanWeight);
      const theme = shishenRules[half === "下" ? ssM : ssR].theme;

      // 2. 用神 / 忌神
      const mEl = ZHI_WX[lyZhi];
      if (yongshen.includes(mEl)) overall += scoring.yongshen.monthElementIsYong;
      if (jishen.includes(mEl)) overall += scoring.yongshen.monthElementIsJi;
      if (yongshen.includes(GAN_WX[ln.gan])) overall += scoring.yongshen.liuNianGanIsYong;
      if (jishen.includes(GAN_WX[ln.gan])) overall += scoring.yongshen.liuNianGanIsJi;
      if (yongshen.includes(GAN_WX[renYuan])) overall += scoring.yongshen.renYuanIsYong;
      if (jishen.includes(GAN_WX[renYuan])) overall += scoring.yongshen.renYuanIsJi;

      // 3. 地支关系（同一对支只取优先级最高者）
      const targets = { ...chartZhi, ...(daYun ? { 大运支: daYun.ganZhi[1] } : {}), 流年支: ln.zhi };
      for (const [label, z] of Object.entries(targets)) {
        const hits = Object.entries(dizhiRules.relations).filter(([, r]) => pairMatch(r.pairs, lyZhi, z)).sort((a, b) => a[1].priority - b[1].priority);
        if (!hits.length) continue;
        const [relName, rel] = hits[0];
        const mult = label === "日支" ? dizhiRules.riZhiMultiplier : 1;
        overall += rel.score * mult; addDims(rel.dims, mult);
        relations.push(`流月支${lyZhi} ${relName} ${label}${z}`);
      }
      // 三合 / 半合：成用神局加、成忌神局减
      for (const [el, g] of Object.entries(dizhiRules["三合"].groups)) {
        if (!g.includes(lyZhi)) continue;
        const present = g.filter((x) => x !== lyZhi).filter((o) => Object.values(targets).includes(o));
        if (!present.length) continue;
        const sign = yongshen.includes(el) ? 1 : jishen.includes(el) ? -1 : 0;
        const full = present.length === 2;
        const v = dizhiRules["三合"].score * (full ? 1 : 0.5) * sign;
        overall += v; if (sign) { sc.self += v / 2; sc.zhengcai += v / 2; }
        const tag = sign > 0 ? "(用)" : sign < 0 ? "(忌)" : "";
        relations.push(full ? `${g.join("")}三合${el}局${tag}` : `${lyZhi}${present[0]}半合${el}${tag}`);
      }
      // 伏吟 / 反吟
      chartPillars.forEach((p, pi) => {
        const name = ["年柱", "月柱", "日柱", "时柱"][pi];
        if (p === ly) { overall += dizhiRules["伏吟"].score; addDims(dizhiRules["伏吟"].dims); relations.push(`流月${ly} 伏吟 ${name}`); }
        else if (pairMatch(dizhiRules.relations["六冲"].pairs, lyZhi, p[1]) && KE[GAN_WX[lyGan]] === GAN_WX[p[0]]) {
          overall += dizhiRules["反吟"].score; addDims(dizhiRules["反吟"].dims); relations.push(`流月${ly} 反吟 ${name}`);
        }
      });
      overall = Math.max(scoring.base + scoring.relationCap.min, Math.min(scoring.base + scoring.relationCap.max, overall));

      // 4. 神煞
      const addEffect = (name, eff) => { shensha.push(name); addDims(eff); if (eff.hint) hints.push(eff.hint); };
      for (const [name, def] of Object.entries(shenshaRules.byDayGan)) if ((def.map[dayGan] ?? []).includes(lyZhi)) addEffect(name, def.effect);
      const triads = new Set([shenshaRules.triadOf[chartZhi.年支], shenshaRules.triadOf[chartZhi.日支]]);
      for (const [name, def] of Object.entries(shenshaRules.byTriad)) for (const t of triads) if (def.map[t] === lyZhi) { addEffect(name, def.effect); break; }
      for (const [name, def] of Object.entries(shenshaRules.byLiuNianZhi)) if (ZHI[(ZHI.indexOf(ln.zhi) + def.offset) % 12] === lyZhi) addEffect(name, def.effect);

      // 5. 合成
      const offset = overall - scoring.base;
      const scores = {}; DIMS.forEach((d) => (scores[d] = clamp(sc[d] + offset / 2)));
      const lite = {}; for (const [k, ds] of Object.entries(LITE)) lite[k] = clamp(ds.reduce((a, d) => a + scores[d], 0) / ds.length);
      const overallFinal = clamp(DIMS.reduce((a, d) => a + scores[d], 0) / DIMS.length);

      segments.push({
        index: i * 2 + h + 1, month: i + 1, half, liuYue: ly, jieqi,
        start: start.toISOString(), end: end.toISOString(),
        jiaoJieWindow: { from: new Date(start.getTime() - winMs).toISOString(), to: new Date(start.getTime() + winMs).toISOString() },
        shishenYear: ssY, shishenMonth: ssM, renYuan, shishenRenYuan: ssR, monthElement: mEl,
        relations, shensha, hints, theme, scores, lite, overall: overallFinal,
      });
    });
  });

  const ranked = [...segments].sort((a, b) => b.overall - a.overall);
  return {
    targetYear, dayGan, yongshen, jishen, daYun, liuNian, taiSuiZhi: ln.zhi,
    dims: DIMS, dimensionLabels: scoring.dimensionLabels, liteLabels: scoring.liteLabels,
    extras: {
      luckyColors: yongshen.flatMap((e) => extras.colors[e] ?? []),
      luckyDirections: yongshen.map((e) => extras.directions[e]).filter(Boolean),
      guirenSurnames: yongshen.flatMap((e) => extras.surnames[e] ?? []),
      healthWatch: jishen.map((e) => extras.healthOrgans[e]).filter(Boolean),
    },
    segments,
    top3: ranked.slice(0, 3).map((s) => s.index),
    bottom3: ranked.slice(-3).map((s) => s.index),
  };
}
