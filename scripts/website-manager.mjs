import { readFile, writeFile, mkdir, readdir, stat, access } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "manager", "config.json");
const REPORT_DIR = path.join(ROOT, "reports", "website-manager");
const command = process.argv[2] || "health";

function arg(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function digits(value) { return String(value || "").replace(/\D/g, ""); }
function cleanUrl(value) { return String(value || "").replace(/\/+$/, ""); }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function badge(ok) { return ok ? "✅" : "❌"; }

async function loadConfig() {
  return JSON.parse(await readFile(CONFIG_PATH, "utf8"));
}

async function timedFetch(url, timeoutMs, { readBody = true } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": "HuzhongTianji-WebsiteManager/1.0" }
    });
    return {
      url,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      latencyMs: Date.now() - started,
      contentType: response.headers.get("content-type") || "",
      body: readBody ? await response.text() : ""
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
      status: 0,
      ok: false,
      latencyMs: Date.now() - started,
      contentType: "",
      body: "",
      error: error?.name === "AbortError" ? "Request timed out" : String(error?.message || error)
    };
  } finally {
    clearTimeout(timer);
  }
}

function metaContent(html, attribute, key) {
  const escaped = escapeRegExp(key);
  for (const pattern of [
    new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attribute}=["']${escaped}["'][^>]*>`, "i")
  ]) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  return "";
}

function tagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return (match?.[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function auditSeo(html, pageUrl) {
  const title = tagText(html, "title");
  const description = metaContent(html, "name", "description");
  const ogTitle = metaContent(html, "property", "og:title");
  const ogDescription = metaContent(html, "property", "og:description");
  const ogImage = metaContent(html, "property", "og:image");
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>|<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  const canonical = (canonicalMatch?.[1] || canonicalMatch?.[2] || "").trim();
  const htmlLang = (html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] || "").trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const structuredDataCount = (html.match(/type=["']application\/ld\+json["']/gi) || []).length;
  const warnings = [];
  const critical = [];
  if (!title) critical.push("Missing <title>.");
  else if (title.length < 20 || title.length > 70) warnings.push(`Title length is ${title.length}; aim for 20–70 characters.`);
  if (!description) critical.push("Missing meta description.");
  else if (description.length < 50 || description.length > 180) warnings.push(`Meta description length is ${description.length}; aim for 50–180 characters.`);
  if (h1Count !== 1) warnings.push(`Expected one H1, found ${h1Count}.`);
  if (!htmlLang) warnings.push("Missing html lang attribute.");
  if (!ogTitle || !ogDescription || !ogImage) warnings.push("Open Graph metadata is incomplete.");
  if (!canonical) warnings.push("Canonical URL is not set.");
  if (!structuredDataCount) warnings.push("No JSON-LD structured data found.");
  if (canonical) {
    try {
      if (new URL(pageUrl).host !== new URL(canonical).host) warnings.push(`Canonical host differs from checked site host: ${canonical}`);
    } catch { warnings.push("Canonical URL is invalid."); }
  }
  return { title, description, canonical, ogTitle, ogDescription, ogImage, htmlLang, h1Count, structuredDataCount, warnings, critical };
}

function internalLinks(html, siteUrl) {
  const found = new Set();
  const re = /(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html))) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    try {
      const url = new URL(raw, `${siteUrl}/`);
      if (url.origin !== new URL(siteUrl).origin || url.pathname.startsWith("/_next/")) continue;
      url.hash = "";
      found.add(url.href);
    } catch {}
  }
  return [...found];
}

async function health() {
  const config = await loadConfig();
  const siteUrl = cleanUrl(arg("site", process.env.MANAGER_SITE_URL || config.siteUrl));
  const timeoutMs = config.thresholds?.timeoutMs || 12000;
  const warningLatencyMs = config.thresholds?.warningLatencyMs || 5000;
  const maxLinks = config.thresholds?.maxInternalLinks || 40;
  const started = Date.now();

  const routes = await Promise.all(config.routes.map(async route => {
    const result = await timedFetch(new URL(route, `${siteUrl}/`).href, timeoutMs, { readBody: route === "/" });
    return { route, ...result, body: route === "/" ? result.body : undefined };
  }));
  const homeHtml = routes.find(item => item.route === "/")?.body || "";
  const sources = await Promise.all((config.contentSources || []).map(async source => ({ source, ...await timedFetch(new URL(source, `${siteUrl}/`).href, timeoutMs) })));
  const searchable = [homeHtml, ...sources.filter(item => item.ok).map(item => item.body || "")].join("\n");
  const requiredText = config.requiredHomepageText.map(text => ({ text, found: searchable.includes(text) }));
  const whatsappDigits = digits(config.approvedWhatsAppDigits || config.approvedWhatsApp);
  const whatsappFound = digits(searchable).includes(whatsappDigits);
  const assets = await Promise.all(config.requiredAssets.map(async asset => ({ asset, ...await timedFetch(new URL(asset, `${siteUrl}/`).href, timeoutMs, { readBody: false }) })));
  const links = internalLinks(homeHtml, siteUrl).slice(0, maxLinks);
  const linkResults = await Promise.all(links.map(async url => {
    const result = await timedFetch(url, timeoutMs, { readBody: false });
    return { url, status: result.status, ok: result.ok, latencyMs: result.latencyMs, error: result.error };
  }));
  const seo = auditSeo(homeHtml, `${siteUrl}/`);
  const issues = [...seo.critical];
  const warnings = [...seo.warnings];

  for (const item of routes) {
    if (!item.ok) issues.push(`Route ${item.route} failed (${item.status || item.error || "unknown error"}).`);
    else if (item.latencyMs > warningLatencyMs) warnings.push(`Route ${item.route} is slow (${item.latencyMs} ms).`);
  }
  for (const item of sources) if (!item.ok) issues.push(`Required source ${item.source} failed.`);
  for (const item of assets) if (!item.ok) issues.push(`Required asset ${item.asset} failed.`);
  for (const item of requiredText) if (!item.found) issues.push(`Required brand text is missing: ${item.text}.`);
  if (!whatsappFound) issues.push(`Approved WhatsApp +${whatsappDigits} was not found.`);
  for (const item of linkResults) if (!item.ok) issues.push(`Broken internal link: ${item.url} (${item.status || item.error || "unknown error"}).`);

  const report = {
    version: "1.0.0",
    siteUrl,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    status: issues.length ? "attention" : warnings.length ? "warning" : "healthy",
    ok: issues.length === 0,
    summary: {
      routesChecked: routes.length,
      routesPassed: routes.filter(item => item.ok).length,
      internalLinksChecked: linkResults.length,
      internalLinksPassed: linkResults.filter(item => item.ok).length,
      issueCount: issues.length,
      warningCount: warnings.length
    },
    brand: { requiredText, approvedWhatsApp: config.approvedWhatsApp, whatsappFound },
    routes: routes.map(({ body, ...item }) => item),
    sources: sources.map(({ body, ...item }) => item),
    assets: assets.map(({ body, ...item }) => item),
    internalLinks: linkResults,
    seo,
    issues,
    warnings
  };
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(path.join(REPORT_DIR, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(REPORT_DIR, "latest.md"), `${formatReport(report)}\n`);
  console.log(formatReport(report));
  if (process.argv.includes("--strict") && !report.ok) process.exitCode = 1;
}

function formatReport(report) {
  const lines = [
    "# 壶中天机 Website Manager Report", "",
    `**Status:** ${report.ok ? "✅ Healthy" : "⚠️ Needs attention"}`,
    `**Site:** ${report.siteUrl}`,
    `**Generated:** ${report.generatedAt}`, "",
    "## Core routes", "", "| Route | Status | Latency |", "|---|---:|---:|"
  ];
  for (const item of report.routes) lines.push(`| ${item.route} | ${badge(item.ok)} ${item.status || item.error || "error"} | ${item.latencyMs} ms |`);
  lines.push("", "## Brand safeguards", "");
  for (const item of report.brand.requiredText) lines.push(`- ${badge(item.found)} **${item.text}**`);
  lines.push(`- ${badge(report.brand.whatsappFound)} WhatsApp: **${report.brand.approvedWhatsApp}**`);
  lines.push("", "## SEO", "");
  lines.push(`- ${badge(Boolean(report.seo.title))} Title: ${report.seo.title || "Missing"}`);
  lines.push(`- ${badge(Boolean(report.seo.description))} Meta description`);
  lines.push(`- ${badge(report.seo.h1Count === 1)} H1 count: ${report.seo.h1Count}`);
  lines.push(`- ${badge(Boolean(report.seo.ogTitle && report.seo.ogDescription && report.seo.ogImage))} Open Graph`);
  lines.push(`- ${report.seo.canonical ? "✅" : "⚠️"} Canonical: ${report.seo.canonical || "Not set"}`);
  if (report.issues.length) { lines.push("", "## Issues", ""); for (const x of report.issues) lines.push(`- ❌ ${x}`); }
  if (report.warnings.length) { lines.push("", "## Warnings", ""); for (const x of report.warnings) lines.push(`- ⚠️ ${x}`); }
  lines.push("", "_No customer birth data or messages were collected._", "");
  return lines.join("\n");
}

async function exists(file) { try { await access(path.join(ROOT, file)); return true; } catch { return false; } }
async function repoCheck() {
  const config = await loadConfig();
  const issues = [], warnings = [];
  for (const file of ["public/home.html", "public/contact.js", "public/brand-logo.png", "public/privacy.html", "public/terms.html", "manager/BRAND_GUARDRAILS.md"]) {
    if (!(await exists(file))) issues.push(`Missing required file: ${file}`);
  }
  const home = await readFile(path.join(ROOT, "public/home.html"), "utf8");
  const contact = await readFile(path.join(ROOT, "public/contact.js"), "utf8");
  const source = `${home}\n${contact}`;
  for (const required of config.requiredHomepageText) if (!source.includes(required)) issues.push(`Required brand text missing: ${required}`);
  if (!digits(source).includes(config.approvedWhatsAppDigits)) issues.push(`Approved WhatsApp ${config.approvedWhatsApp} not found.`);
  if (!/<meta[^>]+name=["']description["']/i.test(home)) warnings.push("Homepage meta description is missing.");
  if (!/<meta[^>]+property=["']og:image["']/i.test(home)) warnings.push("Homepage Open Graph image is missing.");
  if (!/<script[^>]+type=["']application\/ld\+json["']/i.test(home)) warnings.push("Homepage JSON-LD is missing.");

  const extensions = new Set([".js", ".mjs", ".json", ".md", ".html", ".toml", ".yml", ".yaml", ".txt"]);
  const skip = new Set(["node_modules", ".git", ".next", "reports"]);
  async function walk(dir) {
    const output = [];
    for (const name of await readdir(dir)) {
      if (skip.has(name)) continue;
      const full = path.join(dir, name);
      const info = await stat(full);
      if (info.isDirectory()) output.push(...await walk(full));
      else if (extensions.has(path.extname(name))) output.push(full);
    }
    return output;
  }
  const secretPatterns = [/sk-ant-[A-Za-z0-9_-]{20,}/g, /sk-proj-[A-Za-z0-9_-]{20,}/g, /ghp_[A-Za-z0-9]{30,}/g, /github_pat_[A-Za-z0-9_]{30,}/g, /NETLIFY_AUTH_TOKEN\s*=\s*[^\s$][^\n]*/g];
  for (const file of await walk(ROOT)) {
    const value = await readFile(file, "utf8");
    for (const pattern of secretPatterns) { pattern.lastIndex = 0; if (pattern.test(value)) issues.push(`Possible secret detected in ${path.relative(ROOT, file)}.`); }
  }
  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(path.join(REPORT_DIR, "repository-guardrails.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), ok: !issues.length, issues, warnings }, null, 2)}\n`);
  console.log(`# Website Manager Guardrails\n\n${issues.length ? "❌ Failed" : "✅ Passed"}`);
  for (const x of issues) console.error(`❌ ${x}`);
  for (const x of warnings) console.warn(`⚠️ ${x}`);
  if (issues.length) process.exitCode = 1;
}

async function verifyContent() {
  const dir = path.join(ROOT, "content", "drafts");
  let files = [];
  try { files = await readdir(dir); } catch { console.log("No content drafts found."); return; }
  const issues = [];
  for (const file of files.filter(name => name.endsWith(".json"))) {
    let draft;
    try { draft = JSON.parse(await readFile(path.join(dir, file), "utf8")); }
    catch { issues.push(`${file}: invalid JSON.`); continue; }
    if (draft.status !== "draft") issues.push(`${file}: status must remain draft.`);
    if (draft.humanApprovalRequired !== true) issues.push(`${file}: humanApprovalRequired must be true.`);
    const combined = `${draft.bodyMarkdown || ""}\n${draft.englishBodyMarkdown || ""}\n${draft.disclaimer || ""}`;
    if (!/传统文化|personal reference|professional advice|专业建议/i.test(combined)) issues.push(`${file}: missing disclaimer.`);
    if (/(sk-ant-|sk-proj-|ghp_|github_pat_)/.test(combined)) issues.push(`${file}: possible secret detected.`);
    if (/一定发财|保证发财|一定结婚|必有灾|guaranteed to happen|definitely become rich/i.test(combined)) issues.push(`${file}: prohibited absolute claim.`);
  }
  if (issues.length) { for (const x of issues) console.error(`❌ ${x}`); process.exitCode = 1; }
  else console.log(`✅ Verified ${files.filter(name => name.endsWith(".json")).length} content draft(s).`);
}

function safeSlug(value) {
  return String(value || "").normalize("NFKD").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || `proposal-${Date.now()}`;
}
function extractJson(value) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || value;
  const start = fenced.indexOf("{"), end = fenced.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("AI response did not contain JSON.");
  return JSON.parse(fenced.slice(start, end + 1));
}
async function contentProposal() {
  const topic = arg("topic"), language = arg("language", "bilingual"), objective = arg("objective", "educate and build trust"), cta = arg("cta", "Invite the reader to a relevant tool or WhatsApp consultation.");
  if (!topic) throw new Error("Missing --topic.");
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required in GitHub Actions secrets.");
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const guardrails = await readFile(path.join(ROOT, "manager", "BRAND_GUARDRAILS.md"), "utf8");
  const model = process.env.WEBSITE_MANAGER_MODEL || process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
  const response = await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create({
    model, max_tokens: 5000,
    system: `You are the editorial draft assistant for 壶中天机 / HUZHONG TIANJI. You only prepare drafts. Follow these rules exactly:\n\n${guardrails}`,
    messages: [{ role: "user", content: `Create a website article proposal.\nTopic: ${topic}\nLanguage: ${language}\nObjective: ${objective}\nCTA: ${cta}\n\nReturn JSON only with title, englishTitle, slug, tag, summary, seoDescription, keywords (array), minutes (number), tool {href,label}, bodyMarkdown, englishBodyMarkdown, disclaimer. Avoid absolute predictions and unsupported claims.` }]
  });
  const raw = response.content.filter(item => item.type === "text").map(item => item.text).join("\n");
  const draft = extractJson(raw), slug = safeSlug(draft.slug || topic), now = new Date(), date = now.toISOString().slice(0, 10);
  const dir = path.join(ROOT, "content", "drafts");
  await mkdir(dir, { recursive: true });
  const record = { status: "draft", humanApprovalRequired: true, generatedAt: now.toISOString(), model, sourceTopic: topic, language, objective, ...draft, slug };
  const markdown = `---\nstatus: draft\nhumanApprovalRequired: true\ngeneratedAt: ${record.generatedAt}\nslug: ${slug}\ntitle: ${JSON.stringify(record.title || topic)}\ndate: ${date}\ntag: ${JSON.stringify(record.tag || "壶中天机")}\n---\n\n${record.bodyMarkdown || ""}\n\n---\n\n${record.disclaimer || "传统文化内容仅供个人参考，不构成医疗、法律、投资或其他专业建议。"}\n`;
  await writeFile(path.join(dir, `${date}-${slug}.json`), `${JSON.stringify(record, null, 2)}\n`);
  await writeFile(path.join(dir, `${date}-${slug}.md`), markdown);
  console.log(`Created draft: ${date}-${slug}`);
}

if (command === "health") await health();
else if (command === "repo-check") await repoCheck();
else if (command === "verify-content") await verifyContent();
else if (command === "content") await contentProposal();
else throw new Error(`Unknown command: ${command}`);
