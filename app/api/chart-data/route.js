import { prepare } from "@/lib/reading-charts";

export const runtime = "nodejs";

// Fast deterministic calculation only; long AI requests run at the edge.
export async function POST(request) {
  try {
    const body = await request.json();
    return Response.json({ charts: prepare(body), lang: body.lang }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "排盘资料无效，请检查输入后重试。" }, { status: 400 });
  }
}
