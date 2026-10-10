// app/api/reading/route.js — compute charts for the chosen mode, stream Claude's reading
// Response: first line is JSON {"charts": …} followed by "\n\n" then the streamed markdown.
import Anthropic from "@anthropic-ai/sdk";
import { computeCharts, toUTC } from "@/lib/charts";
import { computeTransits, sunSignOnly, periodEvents } from "@/lib/astro";
import { drawTarot, mingGua, liuNian } from "@/lib/extras";
import { buildSystemPrompt } from "@/lib/prompts";
import { Solar } from "lunar-javascript";

export const runtime = "nodejs";
export const maxDuration = 120;

/** flow-months for 预测 mode */
function liuYue(year) {
  const out = [];
  for (let m = 1; m <= 12; m++) {
    const l = Solar.fromYmd(year, m, 15).getLunar();
    out.push({ month: m, ganZhi: l.getMonthInGanZhiExact(), jieQi: l.getPrevJieQi().getName() });
  }
  return out;
}

function prepare(body) {
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
      return { mode, targetYear: y, focus: body.focus || "", charts: computeCharts(p, systemsOf(p)), liuNian: liuNian(y), liuYue: liuYue(y) };
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
    case "dream": {
      const out = { mode, dream: body.dream || "" };
      if (body.person?.year) out.charts = computeCharts(body.person, ["八字"]);
      return out;
    }
    default:
      throw new Error("unknown mode " + mode);
  }
}

export async function POST(req) {
  let payload;
  try {
    payload = prepare(await req.json());
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  const header = JSON.stringify({ charts: payload }) + "\n\n";
  const enc = new TextEncoder();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(header + "⚠️ 未设置 ANTHROPIC_API_KEY，仅显示排盘结果。", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const client = new Anthropic();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(enc.encode(header));
      try {
        const s = client.messages.stream({
          model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
          max_tokens: 4000,
          system: buildSystemPrompt(payload.mode),
          messages: [{ role: "user", content: "请解读。\n\n```json\n" + JSON.stringify(payload, null, 1) + "\n```" }],
        });
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") controller.enqueue(enc.encode(ev.delta.text));
        }
      } catch (e) {
        controller.enqueue(enc.encode("\n\n[解读中断：" + e.message + "]"));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" } });
}
