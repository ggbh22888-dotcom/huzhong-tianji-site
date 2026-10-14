import { computeZiwei } from "@/lib/ziwei";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const input = await request.json();
    const chart = computeZiwei(input);
    return Response.json(
      { chart },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: error?.message || "无法建立紫微命盘，请检查出生资料。" },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
