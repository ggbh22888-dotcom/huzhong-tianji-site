import { buildSystemPrompt } from "../../lib/prompts.js";
import { forwardText } from "../../lib/anthropic-text-stream.mjs";

export default async function reading(request) {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const raw = await request.text();
  if (raw.length > 200000) return new Response("Request too large", { status: 413 });
  // Keep birth calculations in Node; do not store the request or interpretation.
  const chartResponse = await fetch(new URL("/api/chart-data", request.url), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: raw,
  });
  if (!chartResponse.ok) return chartResponse;
  const { charts, lang } = await chartResponse.json();
  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  const upstream = (Netlify.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/$/, "");
  const model = Netlify.env.get("CLAUDE_MODEL") || "claude-sonnet-5-5";
  const encoder = new TextEncoder();
  const abort = new AbortController();
  let cancelled = false;
  const body = new ReadableStream({
    async start(controller) {
      const emit = text => { if (!cancelled) controller.enqueue(encoder.encode(text)); };
      emit(JSON.stringify({ charts }) + "\n\n");
      if (!key) {
        emit("解读服务暂未就绪，请稍后再试。");
        controller.close();
        return;
      }
      const timeout = setTimeout(() => abort.abort(), 110000);
      try {
        const response = await fetch(upstream + "/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
          signal: abort.signal,
          body: JSON.stringify({ model, max_tokens: 4000, stream: true,
            system: buildSystemPrompt(charts.mode, lang),
            messages: [{ role: "user", content: "请解读。\n\n```json\n" + JSON.stringify(charts, null, 1) + "\n```" }],
          }),
        });
        if (!response.ok || !response.body) throw new Error("Provider HTTP " + response.status);
        await forwardText(response.body, emit);
      } catch (error) {
        // Operational metadata only: never log birth data, prompts or credentials.
        console.error("Reading edge failed", { reason: error.name, message: error.message });
        emit("\n\n本次解读未能完整生成，排盘结果仍可查看，请稍后重试。");
      } finally {
        clearTimeout(timeout);
        if (!cancelled) controller.close();
      }
    },
    cancel() { cancelled = true; abort.abort(); },
  });
  // Return headers immediately. The Node handler's wall-clock limit no longer
  // cuts off the provider while it is waiting for or streaming an interpretation.
  return new Response(body, { headers: {
    "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store",
    "X-Reading-Runtime": "edge-v1", "X-Content-Type-Options": "nosniff",
  } });
}

export const config = { path: "/api/reading" };
