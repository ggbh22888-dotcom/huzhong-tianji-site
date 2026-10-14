// lib/ziwei.js — 紫微斗数 deterministic chart engine (wraps iztro)
// The calculation layer and the reading layer stay separate.
// Docs: https://docs.iztro.com
const { astro } = require("iztro");
const { toTrueSolarTime } = require("./bazi");

/** hour (0-23) → 时辰 index as iztro expects.
 * 0 = 早子, 1 = 丑 … 11 = 亥, 12 = 晚子
 */
function hourToIndex(hour) {
  const h = Number(hour);
  if (h === 23) return 12;
  return Math.floor((h + 1) / 2);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatStar(star) {
  if (!star) return "";
  return `${star.name || ""}${star.brightness || ""}${star.mutagen ? `(${star.mutagen})` : ""}`;
}

function starDetail(star) {
  return {
    name: star?.name || "",
    brightness: star?.brightness || "",
    mutagen: star?.mutagen || "",
  };
}

function currentDateIn(timeZone = "Asia/Singapore") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function safePeriod(period = {}) {
  return {
    name: period.name || "",
    heavenlyStem: period.heavenlyStem || "",
    earthlyBranch: period.earthlyBranch || "",
    ganZhi: `${period.heavenlyStem || ""}${period.earthlyBranch || ""}`,
    palace: period.palaceNames?.[0] || "",
    palaceNames: period.palaceNames || [],
    mutagen: period.mutagen || [],
  };
}

function normaliseBirth(input) {
  const {
    year,
    month,
    day,
    hour,
    minute = 0,
    useTrueSolar = false,
    longitude = 103.82,
    tzHours = 8,
  } = input;

  const values = [year, month, day, hour, minute].map(Number);
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("出生日期或时间不完整。");
  }

  const clock = new Date(values[0], values[1] - 1, values[2], values[3], values[4], 0);
  if (
    clock.getFullYear() !== values[0] ||
    clock.getMonth() + 1 !== values[1] ||
    clock.getDate() !== values[2]
  ) {
    throw new Error("出生日期无效，请重新检查。");
  }

  let used = clock;
  let solarCorrection = null;
  if (useTrueSolar) {
    const corrected = toTrueSolarTime(clock, Number(longitude), Number(tzHours));
    solarCorrection = {
      clockTime: formatDateTime(clock),
      trueSolarTime: formatDateTime(corrected),
      shiftMinutes: Math.round((corrected.getTime() - clock.getTime()) / 60000),
      crossedHourBranch:
        hourToIndex(clock.getHours()) !== hourToIndex(corrected.getHours()) ||
        clock.getDate() !== corrected.getDate(),
    };
    used = corrected;
  }

  return { clock, used, solarCorrection };
}

function computeZiwei(input) {
  if (input?.hourUnknown) {
    throw new Error("紫微斗数依赖出生时辰。请提供较可靠的时间，或先比较候选时辰。");
  }

  const { used, solarCorrection } = normaliseBirth(input);
  const date = `${used.getFullYear()}-${pad(used.getMonth() + 1)}-${pad(used.getDate())}`;
  const gender = input.gender === "男" ? "男" : "女";

  const chart = astro.bySolar(
    date,
    hourToIndex(used.getHours()),
    gender,
    true,
    "zh-CN"
  );

  const currentDate = currentDateIn("Asia/Singapore");
  const horoscope = chart.horoscope(currentDate);

  const palaces = chart.palaces.map((palace, index) => {
    const majorStarDetails = (palace.majorStars || []).map(starDetail);
    const minorStarDetails = (palace.minorStars || []).map(starDetail);
    const adjectiveStarDetails = (palace.adjectiveStars || []).map(starDetail);
    const allStars = [
      ...majorStarDetails,
      ...minorStarDetails,
      ...adjectiveStarDetails,
    ];

    return {
      index,
      name: palace.name,
      heavenlyStem: palace.heavenlyStem,
      earthlyBranch: palace.earthlyBranch,
      ganZhi: `${palace.heavenlyStem}${palace.earthlyBranch}`,
      isSoulPalace: palace.name === "命宫",
      isBodyPalace: Boolean(palace.isBodyPalace),
      majorStars: (palace.majorStars || []).map(formatStar),
      minorStars: (palace.minorStars || []).map(formatStar),
      adjectiveStars: (palace.adjectiveStars || []).map(formatStar),
      majorStarDetails,
      minorStarDetails,
      adjectiveStarDetails,
      transformations: allStars
        .filter((star) => star.mutagen)
        .map((star) => ({ star: star.name, mutagen: star.mutagen })),
      decadal: palace.decadal?.range
        ? `${palace.decadal.range[0]}-${palace.decadal.range[1]}岁`
        : null,
      decadalRange: palace.decadal?.range || null,
    };
  });

  const transformations = palaces.flatMap((palace) =>
    palace.transformations.map((item) => ({
      ...item,
      palace: palace.name,
      branch: palace.earthlyBranch,
    }))
  );

  return {
    system: "紫微斗数",
    name: input.name || "",
    gender,
    birthplace: input.birthplace || "",
    calendarInput: input.calendarInput || "solar",
    birth: {
      recorded: formatDateTime(
        new Date(
          Number(input.year),
          Number(input.month) - 1,
          Number(input.day),
          Number(input.hour),
          Number(input.minute || 0),
          0
        )
      ),
      used: formatDateTime(used),
      solarCorrection,
      hourBranchIndex: hourToIndex(used.getHours()),
      hourBranchRule: used.getHours() === 23 ? "晚子时" : "双小时辰",
    },
    lunarDate: chart.lunarDate,
    chineseDate: chart.chineseDate,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
    sign: chart.sign,
    zodiac: chart.zodiac,
    palaces,
    transformations,
    current: {
      nominalAge: horoscope.age?.nominalAge,
      decadal: safePeriod(horoscope.decadal),
      yearly: safePeriod(horoscope.yearly),
      asOf: currentDate,
    },
    calculation: {
      engine: "iztro",
      chartBasis: "公历日期 + 出生时辰",
      trueSolarTimeApplied: Boolean(input.useTrueSolar),
      leapMonthRule: "农历输入先转换为公历，再交由规则引擎排盘",
      dayBoundary: "23:00 以晚子时索引处理",
      historicalTimezone: "出生地采用内置时区资料；暂不校正历史夏令时。",
      interpretationSeparated: true,
    },
  };
}

module.exports = { computeZiwei, hourToIndex };
