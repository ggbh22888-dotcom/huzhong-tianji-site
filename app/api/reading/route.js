// app/api/reading/route.js — compute charts for the chosen mode, stream Claude's reading
// Response: first line is JSON {"charts": …} followed by "\n\n" then the streamed markdown.
import Anthropic from "@anthropic-ai/sdk";
import { prepare } from "@/lib/reading-charts";
import { buildSystemPrompt } from "@/lib/prompts";
import { readingOptions } from "@/lib/reading-options.mjs";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req) {
  let payload, lang;
  try {
    const body = await req.json(); lang = body.lang;
    payload = prepare(body);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  const header = JSON.stringify({ charts: payload }) + "\n\n";
  const enc = new TextEncoder();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(header + "解读服务暂未就绪。目前可以查看排盘结果，请稍后再试。", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }

  const client = new Anthropic({ timeout: 90000, maxRetries: 0 });
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(enc.encode(header));
      let hasText = false;
      try {
        const s = client.messages.stream({
          ...readingOptions(process.env.CLAUDE_MODEL || "claude-sonnet-5-5"),
          system: buildSystemPrompt(payload.mode, lang),
          messages: [{ role: "user", content: "请解读。\n\n```json\n" + JSON.stringify(payload, null, 1) + "\n```" }],
        });
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
            if (ev.delta.text.trim()) hasText = true;
            controller.enqueue(enc.encode(ev.delta.text));
          }
        }
        if (!hasText) controller.enqueue(enc.encode("排盘已完成，但本次未收到解读文字，请稍后重新开启。"));
      } catch (e) {
        console.error("Reading generation failed", { status: e.status, name: e.name });
        controller.enqueue(enc.encode("\n\n本次解读未能完成。排盘结果仍可查看，请稍后重新开启。"));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" } });
}
