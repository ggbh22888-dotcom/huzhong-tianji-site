// lib/charts.js — one entry point: input + selected systems → all charts
const { computeBazi } = require("./bazi");
const { computeZiwei } = require("./ziwei");
const { computeWestern, computeVedic, lahiri } = require("./astro");
const { computeQizheng } = require("./qizheng");
const { computeNumerology, computeMaya, computeHumanDesign } = require("./others");

const SYSTEMS = ["八字", "紫微", "七政四余", "西洋星盘", "吠陀", "玛雅", "人类图", "灵数"];

/** Local civil time → UTC Date using the birthplace timezone offset */
function toUTC({ year, month, day, hour, minute = 0, tzHours = 8 }) {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - tzHours * 3600000);
}

function computeCharts(input, systems = SYSTEMS) {
  const { latitude = 1.35, longitude = 103.82, tzHours = 8 } = input;
  const utc = toUTC(input);
  const out = { input: { ...input }, systems: [] };
  const tryRun = (name, fn) => { if (!systems.includes(name)) return; try { out[name] = fn(); out.systems.push(name); } catch (e) { out[name] = { error: e.message }; } };

  tryRun("八字",     () => computeBazi(input));
  tryRun("紫微",     () => computeZiwei(input));
  tryRun("七政四余", () => computeQizheng(utc, lahiri(utc)));
  tryRun("西洋星盘", () => computeWestern(utc, latitude, longitude));
  tryRun("吠陀",     () => computeVedic(utc, latitude, longitude));
  tryRun("灵数",     () => computeNumerology(input));
  tryRun("玛雅",     () => computeMaya(input));
  tryRun("人类图",   () => computeHumanDesign(utc));
  return out;
}

module.exports = { computeCharts, SYSTEMS, toUTC };
