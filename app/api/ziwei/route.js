import { computeCharts } from "@/lib/charts";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request) {
  try {
    const person = await request.json();
    const charts = computeCharts(person, ["紫微"]);
    const chart = charts["紫微"];

    if (!chart || chart.error) {
      throw new Error(chart?.error || "紫微命盘建立失败，请检查出生资料。");
    }

    return Response.json({ chart }, {
      headers: {
        "Cache-Control": "no-store",
        "X-Chart-Engine": chart.engine?.name || "iztro",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "紫微命盘建立失败。" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
