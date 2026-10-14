import { computeZiwei } from "@/lib/ziwei";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function numberInRange(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

export async function POST(request) {
  try {
    const input = await request.json();

    if (
      !numberInRange(input.year, 1900, 2100) ||
      !numberInRange(input.month, 1, 12) ||
      !numberInRange(input.day, 1, 31) ||
      !numberInRange(input.hour, 0, 23) ||
      !numberInRange(input.minute ?? 0, 0, 59)
    ) {
      return Response.json(
        { error: "出生日期或时间不完整，请重新检查。" },
        { status: 400 }
      );
    }

    if (input.hourUnknown) {
      return Response.json(
        {
          error:
            "紫微斗数需要出生时辰。若时间不确定，请先比较两个最可能的时辰，不要用正午代替。",
          code: "BIRTH_TIME_REQUIRED",
        },
        { status: 422 }
      );
    }

    const chart = computeZiwei(input);
    return Response.json(
      { chart },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: error?.message || "暂时无法建立命盘，请稍后再试。" },
      { status: 400 }
    );
  }
}
