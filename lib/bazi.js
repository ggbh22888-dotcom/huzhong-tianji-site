// lib/bazi.js — 排盘引擎 (the calculation layer)
// ============================================================
// This is the ONLY file that knows how to turn a birth date
// into a 八字. Everything else (UI, AI) just consumes its output.
//
// Library: lunar-javascript by 6tail  https://6tail.cn/calendar/api.html
//   Solar = 公历 (Gregorian)   Lunar = 农历   EightChar = 八字
// ============================================================

const { Solar, Lunar } = require("lunar-javascript");

// 五行 lookup for 天干 and 地支 — so we can count elements ourselves
const GAN_WUXING = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
const ZHI_WUXING = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
const GAN_YINYANG = { 甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳", 己: "阴", 庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴" };

/**
 * 真太阳时 (true solar time) correction.
 * lunar-javascript does NOT do this for you — ichingfate.com's toggle
 * does exactly this step before 排盘.
 *
 * Two parts:
 *  1. Longitude correction: 4 minutes per degree away from the
 *     timezone's standard meridian (e.g. UTC+8 → 120°E).
 *     Singapore is ~103.8°E but uses UTC+8, so clock time is ~65 min
 *     AHEAD of local mean solar time.
 *  2. Equation of time (地球公转椭圆轨道 + 黄赤交角造成的 ±16 分钟误差).
 *     Formula below is the standard approximation (Spencer/NOAA style).
 *
 * @param {Date} clock   civil clock time of birth
 * @param {number} lon   birthplace longitude in degrees (E positive)
 * @param {number} tzHours  timezone offset in hours (SG = 8)
 * @returns {Date} true solar time
 */
function toTrueSolarTime(clock, lon, tzHours) {
  const standardMeridian = tzHours * 15;
  const longitudeMinutes = (lon - standardMeridian) * 4;

  // Equation of time
  const start = new Date(clock.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((clock - start) / 86400000);
  const B = ((2 * Math.PI) / 365) * (dayOfYear - 81);
  const eotMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const totalMinutes = longitudeMinutes + eotMinutes;
  return new Date(clock.getTime() + totalMinutes * 60000);
}

/**
 * Main entry point.
 * @param {object} input
 *   name, gender ("男"|"女"), year, month, day, hour, minute,
 *   useTrueSolar (bool), longitude (number), tzHours (number)
 */
function computeBazi(input) {
  const {
    name = "",
    gender = "男",
    year, month, day, hour, minute = 0,
    useTrueSolar = false,
    longitude = 103.8, // default: Singapore
    tzHours = 8,
  } = input;

  let birth = new Date(year, month - 1, day, hour, minute, 0);
  let solarCorrection = null;

  if (useTrueSolar) {
    const corrected = toTrueSolarTime(birth, longitude, tzHours);
    solarCorrection = {
      clockTime: fmt(birth),
      trueSolarTime: fmt(corrected),
      shiftMinutes: Math.round((corrected - birth) / 60000),
    };
    birth = corrected;
  }

  // --- lunar-javascript does the heavy lifting from here ---
  const solar = Solar.fromYmdHms(
    birth.getFullYear(), birth.getMonth() + 1, birth.getDate(),
    birth.getHours(), birth.getMinutes(), 0
  );
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  ec.setSect(2); // 2 = 23:00 后算次日子时 (晚子时) — common modern convention

  // 四柱
  const pillars = {
    year:  pillar(ec.getYearGan(),  ec.getYearZhi(),  ec.getYearHideGan(),  ec.getYearShiShenGan(),  ec.getYearNaYin()),
    month: pillar(ec.getMonthGan(), ec.getMonthZhi(), ec.getMonthHideGan(), ec.getMonthShiShenGan(), ec.getMonthNaYin()),
    day:   pillar(ec.getDayGan(),   ec.getDayZhi(),   ec.getDayHideGan(),   "日主",                  ec.getDayNaYin()),
    hour:  pillar(ec.getTimeGan(),  ec.getTimeZhi(),  ec.getTimeHideGan(),  ec.getTimeShiShenGan(),  ec.getTimeNaYin()),
  };

  // 五行统计 (天干 + 地支本气, simple count — refine later with 藏干 weights)
  const wuxing = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const p of Object.values(pillars)) {
    wuxing[GAN_WUXING[p.gan]]++;
    wuxing[ZHI_WUXING[p.zhi]]++;
  }

  // 大运 — gender decides 顺行/逆行. lunar-javascript: 1 = 男, 0 = 女
  const yun = ec.getYun(gender === "男" ? 1 : 0);
  const daYun = yun.getDaYun().slice(1, 9).map((d) => ({
    startAge: d.getStartAge(),
    startYear: d.getStartYear(),
    ganZhi: d.getGanZhi(),
  }));

  return {
    name,
    gender,
    input: { year, month, day, hour, minute },
    solarCorrection,
    lunarDate: lunar.toString(),           // e.g. 一九九〇年四月廿一
    solarDate: solar.toYmdHms(),
    jieQi: lunar.getPrevJieQi().getName(), // current 节气 — explains month pillar
    pillars,
    dayMaster: {
      gan: ec.getDayGan(),
      wuxing: GAN_WUXING[ec.getDayGan()],
      yinYang: GAN_YINYANG[ec.getDayGan()],
    },
    wuxing,
    shengXiao: lunar.getYearShengXiao(),
    // 起运: getStartYear/Month/Day = how long AFTER birth 大运 starts (not a calendar date)
    qiYun: {
      afterYears: yun.getStartYear(),
      afterMonths: yun.getStartMonth(),
      afterDays: yun.getStartDay(),
      date: yun.getStartSolar().toYmd(),
    },
    daYun,
  };
}

function pillar(gan, zhi, hideGan, shiShen, naYin) {
  return { gan, zhi, ganZhi: gan + zhi, hideGan, shiShen, naYin,
           wuxing: GAN_WUXING[gan] + ZHI_WUXING[zhi] };
}

function fmt(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

module.exports = { computeBazi, toTrueSolarTime };
