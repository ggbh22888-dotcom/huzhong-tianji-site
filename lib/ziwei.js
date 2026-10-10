// lib/ziwei.js — 紫微斗数 engine (wraps iztro)
// Docs: https://docs.iztro.com
const { astro } = require("iztro");

/** hour (0-23) → 时辰 index 0-12 as iztro expects (0=早子,1=丑 … 11=亥, 12=晚子) */
function hourToIndex(h) {
  if (h === 23) return 12;
  return Math.floor((h + 1) / 2);
}

function computeZiwei({ year, month, day, hour, gender }) {
  const a = astro.bySolar(`${year}-${month}-${day}`, hourToIndex(hour), gender === "男" ? "男" : "女", true, "zh-CN");
  const today = new Date();
  const h = a.horoscope(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);

  const palaces = a.palaces.map((p) => ({
    name: p.name,
    ganZhi: p.heavenlyStem + p.earthlyBranch,
    isBodyPalace: p.isBodyPalace,
    majorStars: p.majorStars.map((s) => s.name + (s.brightness || "") + (s.mutagen ? "(" + s.mutagen + ")" : "")),
    minorStars: p.minorStars.map((s) => s.name + (s.mutagen ? "(" + s.mutagen + ")" : "")),
    adjectiveStars: p.adjectiveStars.map((s) => s.name),
    decadal: p.decadal ? `${p.decadal.range[0]}-${p.decadal.range[1]}岁` : null,
  }));

  return {
    system: "紫微斗数",
    lunarDate: a.lunarDate,
    chineseDate: a.chineseDate,
    fiveElementsClass: a.fiveElementsClass,
    soul: a.soul,       // 命主
    body: a.body,       // 身主
    sign: a.sign,
    zodiac: a.zodiac,
    palaces,
    current: {
      nominalAge: h.age?.nominalAge,
      decadal: { name: h.decadal.name, ganZhi: h.decadal.heavenlyStem + h.decadal.earthlyBranch, palace: h.decadal.palaceNames?.[0], mutagen: h.decadal.mutagen },
      yearly:  { name: h.yearly.name,  ganZhi: h.yearly.heavenlyStem + h.yearly.earthlyBranch,   palace: h.yearly.palaceNames?.[0],  mutagen: h.yearly.mutagen },
    },
  };
}

module.exports = { computeZiwei };
