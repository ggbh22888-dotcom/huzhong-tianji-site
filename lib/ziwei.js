// lib/ziwei.js — 紫微斗数 deterministic chart engine (wraps iztro)
// The rule engine calculates the chart. AI interpretation is a separate step.
const { astro } = require("iztro");
const { toTrueSolarTime } = require("./bazi");

const OPPOSITE_BRANCH = {
  子: "午", 丑: "未", 寅: "申", 卯: "酉", 辰: "戌", 巳: "亥",
  午: "子", 未: "丑", 申: "寅", 酉: "卯", 戌: "辰", 亥: "巳",
};

/** hour (0-23) → 时辰 index 0-12 as iztro expects (0=早子,1=丑 … 11=亥, 12=晚子) */
function hourToIndex(hour) {
  const h = Number(hour);
  if (h === 23) return 12;
  return Math.floor((h + 1) / 2);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateText(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateTimeText(date) {
  return `${dateText(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function starDetail(star, category) {
  return {
    name: star?.name || "",
    brightness: star?.brightness || "",
    mutagen: star?.mutagen || "",
    category,
  };
}

function starLabel(star) {
  if (!star) return "";
  return `${star.name || ""}${star.brightness || ""}${star.mutagen ? `（${star.mutagen}）` : ""}`;
}

function safeTiming(timing) {
  if (!timing) return null;
  return {
    name: timing.name || "",
    ganZhi: `${timing.heavenlyStem || ""}${timing.earthlyBranch || ""}`,
    palace: timing.palaceNames?.[0] || "",
    palaceNames: timing.palaceNames || [],
    mutagen: timing.mutagen || [],
    range: timing.range || null,
  };
}

function computeZiwei(input) {
  const {
    year, month, day, hour, minute = 0, gender = "女",
    hourUnknown = false,
    useTrueSolar = false,
    longitude = 103.82,
    tzHours = 8,
    birthplace = "",
  } = input || {};

  if (!year || !month || !day) throw new Error("请填写完整出生日期。");
  if (hourUnknown || hour === undefined || hour === null || hour === "") {
    throw new Error("紫微斗数依赖出生时辰；时辰不详时不应以正午或午夜代替。请先确认或比较候选时辰。");
  }

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const numericHour = Number(hour);
  const numericMinute = Number(minute) || 0;
  if (!Number.isInteger(numericYear) || numericYear < 1900 || numericYear > 2100) throw new Error("出生年份不在当前支持范围内。");
  if (!Number.isInteger(numericMonth) || numericMonth < 1 || numericMonth > 12) throw new Error("出生月份无效。");
  if (!Number.isInteger(numericDay) || numericDay < 1 || numericDay > 31) throw new Error("出生日期无效。");
  if (!Number.isInteger(numericHour) || numericHour < 0 || numericHour > 23) throw new Error("出生小时无效。");
  if (!Number.isInteger(numericMinute) || numericMinute < 0 || numericMinute > 59) throw new Error("出生分钟无效。");

  const clock = new Date(numericYear, numericMonth - 1, numericDay, numericHour, numericMinute, 0);
  const exactDate = clock.getFullYear() === numericYear
    && clock.getMonth() === numericMonth - 1
    && clock.getDate() === numericDay
    && clock.getHours() === numericHour
    && clock.getMinutes() === numericMinute;
  if (!exactDate || Number.isNaN(clock.getTime())) throw new Error("出生日期或时间无效，请重新核对。");

  let chartTime = clock;
  let solarCorrection = null;
  if (useTrueSolar) {
    chartTime = toTrueSolarTime(clock, Number(longitude), Number(tzHours));
    solarCorrection = {
      clockTime: dateTimeText(clock),
      trueSolarTime: dateTimeText(chartTime),
      shiftMinutes: Math.round((chartTime.getTime() - clock.getTime()) / 60000),
      crossedDate: dateText(clock) !== dateText(chartTime),
      crossedHourBranch: hourToIndex(clock.getHours()) !== hourToIndex(chartTime.getHours()),
    };
  }

  const chartDate = dateText(chartTime);
  const timeIndex = hourToIndex(chartTime.getHours());
  const chart = astro.bySolar(chartDate, timeIndex, gender === "男" ? "男" : "女", true, "zh-CN");

  const today = new Date();
  const horoscope = chart.horoscope(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);

  const basePalaces = chart.palaces.map((palace) => {
    const majorStarDetails = (palace.majorStars || []).map((star) => starDetail(star, "major"));
    const minorStarDetails = (palace.minorStars || []).map((star) => starDetail(star, "minor"));
    const adjectiveStarDetails = (palace.adjectiveStars || []).map((star) => starDetail(star, "adjective"));
    const branch = palace.earthlyBranch || "";
    return {
      name: palace.name,
      heavenlyStem: palace.heavenlyStem || "",
      earthlyBranch: branch,
      ganZhi: `${palace.heavenlyStem || ""}${branch}`,
      isBodyPalace: Boolean(palace.isBodyPalace),
      isLifePalace: palace.name === "命宫",
      majorStars: (palace.majorStars || []).map(starLabel),
      minorStars: (palace.minorStars || []).map(starLabel),
      adjectiveStars: (palace.adjectiveStars || []).map(starLabel),
      majorStarDetails,
      minorStarDetails,
      adjectiveStarDetails,
      decadal: palace.decadal?.range ? `${palace.decadal.range[0]}-${palace.decadal.range[1]}岁` : null,
      decadalRange: palace.decadal?.range || null,
      ages: palace.ages || [],
    };
  });

  const byBranch = Object.fromEntries(basePalaces.map((palace) => [palace.earthlyBranch, palace]));
  const palaces = basePalaces.map((palace) => {
    const opposite = byBranch[OPPOSITE_BRANCH[palace.earthlyBranch]];
    const borrowedStarDetails = palace.majorStarDetails.length === 0 ? (opposite?.majorStarDetails || []) : [];
    return {
      ...palace,
      oppositePalace: opposite ? { name: opposite.name, ganZhi: opposite.ganZhi } : null,
      borrowedMajorStars: borrowedStarDetails.map(starLabel),
      borrowedMajorStarDetails: borrowedStarDetails,
    };
  });

  const mutagens = [];
  for (const palace of palaces) {
    for (const star of [...palace.majorStarDetails, ...palace.minorStarDetails]) {
      if (star.mutagen) {
        mutagens.push({
          star: star.name,
          mutagen: star.mutagen,
          brightness: star.brightness,
          palace: palace.name,
          ganZhi: palace.ganZhi,
          category: star.category,
        });
      }
    }
  }

  return {
    system: "紫微斗数",
    engine: { name: "iztro", version: "2.6.1", ruleVersion: "hztj-ziwei-v2" },
    input: { year: numericYear, month: numericMonth, day: numericDay, hour: numericHour, minute: numericMinute, gender, birthplace },
    calculation: {
      calendar: "solar",
      recordedLocalTime: dateTimeText(clock),
      chartTime: dateTimeText(chartTime),
      timeIndex,
      hourBranchRule: "23:00 采用晚子时；其余按两小时一个时辰",
      trueSolarTimeApplied: Boolean(useTrueSolar),
      solarCorrection,
      longitude: Number(longitude),
      timezoneHours: Number(tzHours),
      birthplace,
      note: "紫微斗数流派、四化表、年界、闰月与换日规则可能不同；本结果仅代表当前已声明的计算设置。",
    },
    lunarDate: chart.lunarDate,
    chineseDate: chart.chineseDate,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
    sign: chart.sign,
    zodiac: chart.zodiac,
    palaces,
    mutagens,
    current: {
      nominalAge: horoscope?.age?.nominalAge,
      decadal: safeTiming(horoscope?.decadal),
      yearly: safeTiming(horoscope?.yearly),
    },
  };
}

module.exports = { computeZiwei, hourToIndex };
