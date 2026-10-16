// Read the provider's SSE stream without depending on TCP chunk boundaries.
export async function forwardText(body, emit) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = "", hasText = false, complete = false, stopReason = null;
  function consume(text) {
    pending += text;
    let boundary;
    while ((boundary = pending.indexOf("\n")) >= 0) {
      const line = pending.slice(0, boundary).trim();
      pending = pending.slice(boundary + 1);
      if (!line.startsWith("data:")) continue;
      const event = JSON.parse(line.slice(5).trim());
      if (event.type === "error") throw new Error("Provider stream failed");
      if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
        if (event.delta.text.trim()) hasText = true;
        emit(event.delta.text);
      }
      if (event.type === "message_delta") stopReason = event.delta?.stop_reason;
      if (event.type === "message_stop") complete = true;
    }
  }
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      consume(decoder.decode(value, { stream: true }));
    }
    consume(decoder.decode() + "\n");
    if (!complete) throw new Error("Provider stream ended before completion");
    if (!hasText) throw new Error("Provider returned no interpretation");
    if (stopReason === "max_tokens") throw new Error("Provider output was truncated");
  } finally {
    reader.releaseLock();
  }
}
