import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputFile = process.env.MANAGED_ARTICLES_FILE || "content/managed-articles.json";

function slugify(value) {
  const ascii = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  if (ascii) return ascii;
  const hash = createHash("sha1").update(String(value)).digest("hex").slice(0, 8);
  return `article-${new Date().toISOString().slice(0, 10)}-${hash}`;
}

function estimateMinutes(body) {
  return Math.max(3, Math.min(15, Math.ceil(String(body || "").replace(/\s+/g, "").length / 450)));
}

function stripFence(value) {
  return String(value || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function parseModelJson(text) {
  const clean = stripFence(text);
  try {
    return JSON.parse(clean);
  } catch {
    const first = clean.indexOf("{");
    const last = clean.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(clean.slice(first, last + 1));
    throw new Error("AI response was not valid JSON.");
  }
}

function fallbackArticle(input) {
  const language = input.lang === "en" ? "English" : input.lang === "bilingual" ? "Chinese and English" : "简体中文";
  return {
    title: input.title,
    summary: `${input.focus}。这是一份由 AI Website Manager 建立、等待人工审核的内容草稿。`,
    tag: input.tag,
    body: `这是一份等待审核的文章草稿。\n\n## 主题\n\n${input.focus}\n\n## 编写要求\n\n- 使用语言：${language}\n- 保持「知命，不认命」的品牌原则\n- 不制造恐惧，不作绝对断言\n- 不替代医疗、法律、投资或其他专业意见\n\n## 来源备注\n\n${input.sourceNotes || "尚未提供。发布前请补充可核实的依据与原创观点。"}\n\n## 下一步\n\n请在 Pull Request 中补充论据、润色文字，并确认服务链接与免责声明后再合并发布。`,
    tool: input.toolHref ? { href: input.toolHref, label: input.toolLabel || "查看相关工具" } : null
  };
}

async function generateWithAnthropic(input) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const system = `You are the editorial assistant for 壶中天机 / Huzhong Tianji. Create a thoughtful, readable article draft for a modern audience. Traditional Chinese metaphysics must be framed as cultural and reflective material, not deterministic proof. Never manufacture citations, client stories, guarantees, medical claims, legal claims or investment claims. Do not use fear-based language. Clearly separate traditional interpretation from practical reflection. Return ONLY valid JSON with keys: title, summary, tag, body, tool. body must be Markdown. tool is null or {"href":"...","label":"..."}.`;
  const user = {
    language: input.lang,
    requestedTitle: input.title,
    focus: input.focus,
    tag: input.tag,
    sourceNotes: input.sourceNotes,
    desiredTool: input.toolHref ? { href: input.toolHref, label: input.toolLabel } : null,
    requirements: [
      "Keep the tone calm, warm and grounded.",
      "Use short sections and useful headings.",
      "End with one practical reflection or small action.",
      "Include a short traditional-culture disclaimer in the closing paragraph.",
      "Do not claim certainty or guaranteed outcomes."
    ]
  };
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
      max_tokens: 3200,
      temperature: 0.4,
      system,
      messages: [{ role: "user", content: JSON.stringify(user, null, 2) }]
    })
  });
  if (!response.ok) throw new Error(`Anthropic request failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  const text = (payload.content || []).filter((item) => item.type === "text").map((item) => item.text).join("\n");
  return parseModelJson(text);
}

async function readArticles() {
  try {
    const parsed = JSON.parse(await readFile(outputFile, "utf8"));
    if (!Array.isArray(parsed)) throw new Error(`${outputFile} must contain a JSON array.`);
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

const input = {
  title: String(process.env.CONTENT_TITLE || "").trim(),
  focus: String(process.env.CONTENT_FOCUS || "").trim(),
  tag: String(process.env.CONTENT_TAG || "壶中随笔").trim(),
  lang: String(process.env.CONTENT_LANG || "zh").trim(),
  sourceNotes: String(process.env.CONTENT_SOURCE_NOTES || "").trim(),
  toolHref: String(process.env.CONTENT_TOOL_HREF || "").trim(),
  toolLabel: String(process.env.CONTENT_TOOL_LABEL || "").trim()
};
if (!input.title) throw new Error("CONTENT_TITLE is required.");
if (!input.focus) throw new Error("CONTENT_FOCUS is required.");

let generated;
let usedAi = false;
try {
  generated = await generateWithAnthropic(input);
  usedAi = Boolean(generated);
} catch (error) {
  console.warn(`AI generation failed; using review template instead. ${error.message}`);
}
if (!generated) generated = fallbackArticle(input);

const slug = slugify(process.env.CONTENT_SLUG || generated.slug || input.title);
const date = String(process.env.CONTENT_DATE || new Date().toISOString().slice(0, 10));
const body = String(generated.body || "").trim();
if (!body) throw new Error("Generated article body is empty.");
const article = {
  slug,
  title: String(generated.title || input.title).trim(),
  date,
  tag: String(generated.tag || input.tag).trim(),
  minutes: Number(generated.minutes) || estimateMinutes(body),
  tool: generated.tool || (input.toolHref ? { href: input.toolHref, label: input.toolLabel || "查看相关工具" } : null),
  summary: String(generated.summary || input.focus).trim(),
  body,
  managedBy: "AI Website Manager",
  language: input.lang,
  generatedWithAI: usedAi
};

const articles = await readArticles();
const existing = articles.findIndex((item) => item.slug === slug);
if (existing >= 0) articles[existing] = article;
else articles.push(article);
articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(articles, null, 2)}\n`, "utf8");

const summary = [
  "## AI Website Manager content proposal",
  "",
  `- Title: ${article.title}`,
  `- Slug: ${article.slug}`,
  `- Date: ${article.date}`,
  `- Language: ${article.language}`,
  `- AI generation: ${usedAi ? "used" : "fallback review template"}`,
  `- Output: ${outputFile}`,
  "",
  "This article will only reach production after the Pull Request is reviewed and merged."
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`, { flag: "a" });
