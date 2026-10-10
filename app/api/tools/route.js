// app/api/tools/route.js — deterministic tool endpoints (no AI, no cost)
import { computeBazi } from "@/lib/bazi";
import { numberEnergy, convertDate, marriageTiming } from "@/lib/tools";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { tool, ...args } = await req.json();
    switch (tool) {
      case "wuxing":  return Response.json(computeBazi(args.person));
      case "nongli":  return Response.json(convertDate(args));
      case "number":  return Response.json(numberEnergy(String(args.digits || "")));
      case "yinyuan": return Response.json(marriageTiming(args.person));
      default: return Response.json({ error: "unknown tool" }, { status: 400 });
    }
  } catch (e) { return Response.json({ error: e.message }, { status: 400 }); }
}
