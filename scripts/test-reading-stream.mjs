import test from "node:test";
import assert from "node:assert/strict";
import { readReadingStream } from "../lib/reading-stream.mjs";

const header = JSON.stringify({ charts: { mode: "dream" } }) + "\n\n";
function body(text, fail = false) {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream({ pull(controller) {
    if (offset < bytes.length) controller.enqueue(bytes.slice(offset, ++offset));
    else if (fail) controller.error(new Error("Connection interrupted"));
    else controller.close();
  } });
}

test("handles split headers and Chinese UTF-8 characters without losing text", async () => {
  const updates = [];
  const result = await readReadingStream(body(header + "你好，解读正文。"), value => updates.push(value));
  assert.equal(result.reading, "你好，解读正文。");
  assert.deepEqual(result.charts, { mode: "dream" });
  assert.equal(updates[0].reading, "");
});

test("chart-only responses preserve charts but fail instead of saving blank history", async () => {
  let latest;
  await assert.rejects(readReadingStream(body(header + "  \n"), value => { latest = value; }), /未收到解读文字/);
  assert.deepEqual(latest.charts, { mode: "dream" });
});

test("truncated headers and absent bodies report incomplete results", async () => {
  await assert.rejects(readReadingStream(body(header.slice(0, -1)), () => {}), /未完整收到/);
  await assert.rejects(readReadingStream(null, () => {}), /未收到解读内容/);
});

test("connection failures preserve the last rendered partial interpretation", async () => {
  let latest;
  await assert.rejects(readReadingStream(body(header + "已收到的文字", true), value => { latest = value; }), /Connection interrupted/);
  assert.equal(latest.reading, "已收到的文字");
});
