import { computeCharts, toUTC } from "@/lib/charts";
import { computeTransits, sunSignOnly, periodEvents } from "@/lib/astro";
import { drawTarot, mingGua, liuNian } from "@/lib/extras";
import { castFromValues, castRandom } from "@/lib/yijing";
import { Solar } from "lunar-javascript";
import { computeLiuNian } from "@/lib/duisui/liunian";


/** flow-months for 预测 mode */
function liuYue(year) {
  const out = [];
  for (let m = 1; m <= 12; m++) {
    const l = Solar.fromYmd(year, m, 15).getLunar();
    out.push({ month: m, ganZhi: l.getMonthInGanZhiExact(), jieQi: l.getPrevJieQi().getName() });
  }
  return out;
}

export function prepare(body) {
  const { mode = "single" } = body;
  const systemsOf = (p) => (p.systems && p.systems.length ? p.systems : body.systems) || ["八字"];

  switch (mode) {
    case "single": {
      const p = body.person;
      return { mode, question: body.question || "", charts: computeCharts(p, systemsOf(p)) };
    }
    case "multi": {
      const persons = (body.persons || []).slice(0, 3).map((p) => ({ label: p.name || p.label, charts: computeCharts(p, systemsOf(p)) }));
      return { mode, relationType: body.relationType || "伴侣", persons };
    }
    case "predict": {
      const p = body.person, y = +body.targetYear || new Date().getFullYear();
      const charts = computeCharts(p, systemsOf(p));
      let duisui = null;
      try { if (charts["八字"] && !charts["八字"].error) duisui = computeLiuNian(charts["八字"], y); } catch (e) { duisui = { error: e.message }; }
      return { mode, targetYear: y, focus: body.focus || "", charts, liuNian: liuNian(y), liuYue: liuYue(y), duisui };
    }
    case "tarot":
      return { mode, question: body.question || "", draw: drawTarot(body.spread || "three") };
    case "naming": {
      const p = body.person;
      return { mode, surname: body.surname, expectation: body.expectation || "", charts: computeCharts(p, ["八字"]) };
    }
    case "fengshui": {
      const p = body.person;
      return { mode, gua: mingGua(p), home: body.home || "", charts: computeCharts(p, ["八字"]) };
    }
    case "pet": {
      const pet = body.pet;
      const out = { mode, species: body.species, petName: pet.name, petCharts: computeCharts({ ...pet, hour: pet.hour ?? 12 }, ["八字"]) };
      if (body.owner?.year) out.ownerCharts = computeCharts(body.owner, ["八字"]);
      return out;
    }
    case "horoscope": {
      const days = { today: 1, week: 7, month: 30, year: 365 }[body.period] || 7;
      const now = new Date();
      const out = { mode, period: body.period || "week", periodDays: days, focus: body.focus || "" };
      if (body.person?.year) {
        const charts = computeCharts(body.person, ["西洋星盘", "八字"]);
        out.charts = charts;
        out.transitsNow = computeTransits(charts["西洋星盘"], now);
        if (days > 1) out.transitsEnd = computeTransits(charts["西洋星盘"], new Date(now.getTime() + days * 86400000));
      } else {
        out.sunSign = sunSignOnly(body.sunSign || "白羊");
        out.transitsNow = computeTransits(null, now);
      }
      out.events = periodEvents(now, Math.min(days, 60));
      const l = Solar.fromDate(now).getLunar();
      out.todayGanZhi = { year: l.getYearInGanZhiExact(), month: l.getMonthInGanZhiExact(), day: l.getDayInGanZhi() };
      return out;
    }
    case "yijing": {
      const cast = Array.isArray(body.values) && body.values.length === 6 ? castFromValues(body.values) : castRandom();
      const l = Solar.fromDate(new Date()).getLunar();
      return { mode, question: body.question || "（默念，未写出）", cast, castDate: { solar: new Date().toISOString().slice(0, 10), ganZhi: `${l.getYearInGanZhiExact()}年 ${l.getMonthInGanZhiExact()}月 ${l.getDayInGanZhi()}日` } };
    }
    case "dream": {
      const out = { mode, dream: body.dream || "" };
      if (body.person?.year) out.charts = computeCharts(body.person, ["八字"]);
      return out;
    }
    default:
      throw new Error("unknown mode " + mode);
  }
}

