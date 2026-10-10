// lib/tools.js — deterministic helpers for the free tool pages (no AI cost)
const { Solar, Lunar } = require("lunar-javascript");
const { computeBazi } = require("./bazi");
const { shiShen } = require("./bazi-deep");

// ---------- 81 数理 (熊崎氏) ----------
const JI = new Set([1,3,5,6,7,8,11,13,15,16,17,18,21,23,24,25,29,31,32,33,35,37,39,41,45,47,48,52,57,61,63,65,67,68,81]);
const BANJI = new Set([27,30,38,51,55,58,71,73,75,77,78]);
const MEANING = { 1:"太极之数，万物开泰",3:"进取如意，名利双收",5:"福禄长寿，阴阳和合",6:"安稳余庆，吉人天相",7:"刚毅果断，勇往直前",8:"坚刚意志，克服困难",11:"旱苗逢雨，万物更新",13:"智略超群，博学多才",15:"福寿圆满，繁荣兴家",16:"厚重载德，安富尊荣",17:"突破万难，刚柔兼备",18:"有志竟成，内外有运",21:"明月中天，万物确立",23:"旭日东升，壮丽壮观",24:"家门余庆，金钱丰盈",25:"资性英敏，才能奇特",29:"智谋优秀，财力归集",31:"智勇得志，心想事成",32:"宝马金鞍，侥幸多望",33:"旭日升天，鸾凤相会",35:"温和平静，智达通畅",37:"权威显达，热诚忠信",39:"富贵荣华，财帛丰盈",41:"德高望重，事事如意",45:"顺风扬帆，新生泰和",47:"贵人助力，可成大业",48:"美化丰实，鹤立鸡群",52:"卓识达眼，先见之明",57:"寒雪青松，夜莺吟春",61:"牡丹芙蓉，花开富贵",63:"富贵荣华，身心安泰",65:"巨流归海，富贵长寿",67:"独营事业，事事如意",68:"思虑周详，计划力行",81:"万物回春，还元复始",
  27:"欲望无止，宜知收敛",30:"浮沉不定，吉凶参半",38:"意志薄弱，艺术可成",51:"盛衰交加，守成为上",55:"外美内苦，先吉后凶",58:"先苦后甘，晚景可期",71:"吉凶参半，惰性为患",73:"志高力微，守成则吉",75:"退守保吉，进取多忧",77:"先苦后乐，中年发达",78:"晚景凄凉，宜早筹划" };
function shuli(n) {
  n = ((n - 1) % 80) + 1;
  return { n, level: JI.has(n) ? "吉" : BANJI.has(n) ? "半吉" : "凶", meaning: MEANING[n] || (JI.has(n) ? "吉数" : BANJI.has(n) ? "半吉之数" : "需以德行化解，不必过虑") };
}

// ---------- 数字能量（八星磁场）----------
const STARS = [
  ["生气", ["14","41","67","76","39","93","28","82"], "人缘、贵人、乐观", "吉"],
  ["天医", ["13","31","68","86","49","94","27","72"], "财富、健康、智慧", "吉"],
  ["延年", ["19","91","78","87","43","34","26","62"], "领导、专业、责任", "吉"],
  ["伏位", ["11","22","33","44","66","77","88","99"], "稳定、等待、重复", "平"],
  ["绝命", ["12","21","69","96","48","84","37","73"], "投机、极端、大起大落", "凶"],
  ["五鬼", ["18","81","79","97","36","63","24","42"], "变动、聪明、不安", "凶"],
  ["六煞", ["16","61","47","74","38","83","29","92"], "桃花、感性、犹豫", "凶"],
  ["祸害", ["17","71","89","98","46","64","23","32"], "口舌、是非、固执", "凶"],
];
function numberEnergy(digits) {
  const d = digits.replace(/\D/g, "");
  const pairs = [];
  // 0 和 5 为"过渡/放大"，跳过后配对
  const core = d.split("").filter((x) => x !== "0" && x !== "5");
  for (let i = 0; i < core.length - 1; i++) {
    const pr = core[i] + core[i + 1];
    const star = STARS.find((s) => s[1].includes(pr));
    pairs.push({ pair: pr, star: star ? star[0] : "—", desc: star ? star[2] : "", level: star ? star[3] : "平" });
  }
  const tally = {}; pairs.forEach((p) => { tally[p.star] = (tally[p.star] || 0) + 1; });
  const last4 = +d.slice(-4) || 0;
  return { digits: d, pairs, tally, tail: shuli(last4), zeros: (d.match(/0/g) || []).length, fives: (d.match(/5/g) || []).length };
}

// ---------- 农历 / 公历 互换 ----------
function convertDate({ from, year, month, day, leap = false }) {
  if (from === "lunar") {
    const l = Lunar.fromYmd(year, leap ? -month : month, day); const s = l.getSolar();
    return { solar: `${s.getYear()}-${s.getMonth()}-${s.getDay()}`, lunar: l.toString(), ganZhi: `${l.getYearInGanZhi()}年 ${l.getMonthInGanZhi()}月 ${l.getDayInGanZhi()}日`, shengXiao: l.getYearShengXiao(), jieQi: l.getPrevJieQi().getName(), weekday: s.getWeekInChinese(), festivals: [...l.getFestivals(), ...s.getFestivals()] };
  }
  const s = Solar.fromYmd(year, month, day); const l = s.getLunar();
  return { solar: s.toYmd(), lunar: l.toString(), ganZhi: `${l.getYearInGanZhi()}年 ${l.getMonthInGanZhi()}月 ${l.getDayInGanZhi()}日`, shengXiao: l.getYearShengXiao(), jieQi: l.getPrevJieQi().getName(), weekday: s.getWeekInChinese(), festivals: [...l.getFestivals(), ...s.getFestivals()], yi: l.getDayYi().slice(0, 6), ji: l.getDayJi().slice(0, 6) };
}

// ---------- 姻缘何时来（流年配偶星 + 日支合 + 桃花红鸾天喜）----------
const LIU_HE = { 子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯", 辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午" };
function marriageTiming(person) {
  const b = computeBazi(person);
  const dg = b.dayMaster.gan, dz = b.pillars.day.zhi, gender = person.gender;
  const spouseStars = gender === "女" ? ["正官", "七杀"] : ["正财", "偏财"];
  const peach = new Set(b.shenSha.filter((s) => ["桃花", "红鸾", "天喜"].includes(s.name)).map((s) => s.name));
  const now = new Date().getFullYear();
  const years = [];
  for (const d of b.fortuneGrid) for (const l of d.liuNian) {
    if (l.year < now || l.year > now + 12) continue;
    const reasons = [];
    const g = l.ganZhi[0], z = l.ganZhi[1];
    if (spouseStars.includes(l.shiShen)) reasons.push(`流年透${l.shiShen}（配偶星）`);
    if (LIU_HE[dz] === z) reasons.push("流年支六合日支（夫妻宫动）");
    if (spouseStars.includes(shiShen(dg, d.ganZhi[0]))) reasons.push(`大运${d.ganZhi}透配偶星`);
    const yz = b.pillars.year.zhi;
    const peachZ = { 申: "酉", 子: "酉", 辰: "酉", 寅: "卯", 午: "卯", 戌: "卯", 巳: "午", 酉: "午", 丑: "午", 亥: "子", 卯: "子", 未: "子" }[yz];
    if (z === peachZ) reasons.push("流年逢桃花");
    if (reasons.length) years.push({ year: l.year, age: l.age, ganZhi: l.ganZhi, score: reasons.length, reasons });
  }
  years.sort((a, c) => c.score - a.score || a.year - c.year);
  return { dayMaster: dg, spouseStars, spousePalace: dz, peachInChart: [...peach], candidates: years.slice(0, 5), all: years,
           note: "以流年透配偶星、流年合夫妻宫、大运透配偶星、流年逢桃花计分。为倾向参考，不作定论。" };
}

module.exports = { shuli, numberEnergy, convertDate, marriageTiming, STARS };
