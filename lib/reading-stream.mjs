// Keep the chart available while the interpretation arrives in arbitrary chunks.
export async function readReadingStream(body, onUpdate) {
  if (!body) throw new Error("未收到解读内容，请稍后重新开启。");
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "", charts = null, reading = "";
  function consume(text) {
    pending += text;
    if (!charts) {
      const boundary = pending.indexOf("\n\n");
      if (boundary < 0) return;
      charts = JSON.parse(pending.slice(0, boundary)).charts;
      if (!charts || typeof charts !== "object") throw new Error("排盘资料未完整收到，请重新开启。");
      pending = pending.slice(boundary + 2);
    }
    reading += pending;
    pending = "";
    onUpdate({ charts, reading });
  }
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      consume(decoder.decode(value, { stream: true }));
    }
    consume(decoder.decode());
    if (!charts) throw new Error("排盘资料未完整收到，请重新开启。");
    if (!reading.trim()) throw new Error("排盘已完成，但本次未收到解读文字，请稍后重新开启。");
    return { charts, reading };
  } finally {
    reader.releaseLock();
  }
}
