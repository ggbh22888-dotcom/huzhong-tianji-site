// lib/extras.js — deterministic helpers for 塔罗 / 风水(八宅命卦) / 宠物 / 流年
const { Solar } = require("lunar-javascript");

// ---------- 塔罗 ----------
const MAJOR = ["愚者","魔术师","女祭司","皇后","皇帝","教皇","恋人","战车","力量","隐士","命运之轮","正义","倒吊人","死神","节制","恶魔","高塔","星星","月亮","太阳","审判","世界"];
const SUITS = { 权杖: "Wands", 圣杯: "Cups", 宝剑: "Swords", 星币: "Pentacles" };
const RANKS = ["一","二","三","四","五","六","七","八","九","十","侍从","骑士","王后","国王"];
const DECK = [...MAJOR.map((n, i) => `${i}. ${n}`), ...Object.keys(SUITS).flatMap((s) => RANKS.map((r) => `${s}${r}`))];
const SPREADS = {
  single: ["核心指引"],
  three: ["过去 / 根源", "现在 / 处境", "未来 / 走向"],
  decision: ["现状", "选择 A 的走向", "选择 B 的走向", "你未看见的因素", "建议"],
  celtic: ["现状", "阻碍 / 助力", "根基", "过去", "可能的结果", "近期", "你的态度", "环境", "希望与恐惧", "结局"],
};
function drawTarot(spread = "three") {
  const positions = SPREADS[spread] || SPREADS.three;
  const deck = [...DECK];
  const cards = positions.map((pos) => {
    const i = Math.floor(Math.random() * deck.length);
    const [card] = deck.splice(i, 1);
    return { position: pos, card, reversed: Math.random() < 0.3 };
  });
  return { system: "塔罗", spread, cards };
}

// ---------- 风水：八宅命卦 ----------
const GUA = { 1: "坎", 2: "坤", 3: "震", 4: "巽", 6: "乾", 7: "兑", 8: "艮", 9: "离" };
const GROUP = { 坎: "东四命", 震: "东四命", 巽: "东四命", 离: "东四命", 乾: "西四命", 坤: "西四命", 艮: "西四命", 兑: "西四命" };
const LUCKY = {
  坎: { 生气: "东南", 天医: "东", 延年: "南", 伏位: "北" }, 离: { 生气: "东", 天医: "东南", 延年: "北", 伏位: "南" },
  震: { 生气: "南", 天医: "北", 延年: "东南", 伏位: "东" }, 巽: { 生气: "北", 天医: "南", 延年: "东", 伏位: "东南" },
  乾: { 生气: "西", 天医: "东北", 延年: "西南", 伏位: "西北" }, 坤: { 生气: "东北", 天医: "西", 延年: "西北", 伏位: "西南" },
  艮: { 生气: "西南", 天医: "西北", 延年: "西", 伏位: "东北" }, 兑: { 生气: "西北", 天医: "西南", 延年: "东北", 伏位: "西" },
};
function mingGua({ year, month, day, gender }) {
  // use 立春 year boundary via lunar-javascript
  const y = year - (month < 2 || (month === 2 && day < 4) ? 1 : 0); // approx 立春 boundary
  const red = (n) => { while (n > 9) n = String(n).split("").reduce((a, b) => a + +b, 0); return n; };
  const s = red(y);
  let g = gender === "男" ? red(y < 2000 ? 11 - s : 9 - s) : red(y < 2000 ? s + 4 : s + 6);
  if (g === 0) g = 9;
  if (g === 5) g = gender === "男" ? 2 : 8;
  const gua = GUA[g];
  return { system: "风水·八宅", guaYear: y, mingGua: gua, group: GROUP[gua], luckyDirections: LUCKY[gua] };
}

// ---------- 流年 (for 预测 mode) ----------
function liuNian(targetYear) {
  const s = Solar.fromYmd(targetYear, 6, 1).getLunar();
  return { year: targetYear, ganZhi: s.getYearInGanZhiExact(), shengXiao: s.getYearShengXiaoExact() };
}

module.exports = { drawTarot, mingGua, liuNian, SPREADS };
