import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const noFail = args.includes("--no-fail");
const configPath = getArg("--config", "manager/site-config.json");
const jsonPath = getArg("--json", "reports/website-health.json");
const markdownPath = getArg("--markdown", "reports/website-health.md");

const config = JSON.parse(await readFile(configPath, "utf8"));
const siteUrl = String(process.env.MANAGER_SITE_URL || config.siteUrl).replace(/\/+$/, "");
const timeoutMs = Number(config.timeoutMs || 12000);
const approvedDigits = String(config.approvedWhatsAppDigits || "").replace(/\D/g, "");
const started = Date.now();

async function request(url, readBody = true) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const begun = Date.now();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "HuzhongTianji-WebsiteManager/1.0" }
    });
    const body = readBody ? await response.text() : "";
    if (!readBody) await response.body?.cancel();
    return {
      url,
      finalUrl: response.url,
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - begun,
      contentType: response.headers.get("content-type") || "",
      body
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
      ok: false,
      status: 0,
      latencyMs: Date.now() - begun,
      contentType: "",
      body: "",
      error: error?.name === "AbortError" ? "Request timed out" : String(error?.message || error)
    };
  } finally {
    clearTimeout(timer);
  }
}

function tagText(html, tag) {
  return (html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaText(html, attribute, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+${attribute}=["']${escaped}["']`, "i"));
  return (match?.[1] || match?.[2] || "").trim();
}

function auditSeo(html) {
  const title = tagText(html, "title");
  const description = metaText(html, "name", "description");
  const ogTitle = metaText(html, "property", "og:title");
  const ogDescription = metaText(html, "property", "og:description");
  const ogImage = metaText(html, "property", "og:image");
  const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']|<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.slice(1).find(Boolean) || "").trim();
  const htmlLang = (html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] || "").trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const jsonLdCount = (html.match(/application\/ld\+json/gi) || []).length;
  const critical = [];
  const warnings = [];
  if (!title) critical.push("Missing <title>.");
  if (!description) critical.push("Missing meta description.");
  if (title && (title.length < 20 || title.length > 70)) warnings.push(`Title length is ${title.length}; aim for 20–70 characters.`);
  if (description && (description.length < 50 || description.length > 180)) warnings.push(`Meta description length is ${description.length}; aim for 50–180 characters.`);
  if (h1Count !== 1) warnings.push(`Expected one H1, found ${h1Count}.`);
  if (!htmlLang) warnings.push("Missing html lang attribute.");
  if (!ogTitle || !ogDescription || !ogImage) warnings.push("Open Graph metadata is incomplete.");
  if (!canonical) warnings.push("Canonical URL is not set.");
  if (!jsonLdCount) warnings.push("No JSON-LD structured data found.");
  if (canonical) {
    try {
      const host = new URL(canonical, `${siteUrl}/`).host;
      if (!(config.allowedSeoHosts || []).includes(host)) warnings.push(`Canonical host ${host} is outside the approved host list.`);
    } catch {
      warnings.push("Canonical URL is invalid.");
    }
  }
  return { title, description, ogTitle, ogDescription, ogImage, canonical, htmlLang, h1Count, jsonLdCount, critical, warnings };
}

function internalLinks(html) {
  const origin = new URL(siteUrl).origin;
  const found = new Set();
  const re = /(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html))) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    try {
      const url = new URL(raw, `${siteUrl}/`);
      if (url.origin !== origin || url.pathname.startsWith("/_next/")) continue;
      url.hash = "";
      found.add(url.href);
    } catch {}
  }
  return [...found].slice(0, Number(config.maxInternalLinks || 40));
}

const routes = await Promise.all((config.routes || []).map(async (route) => {
  const result = await request(new URL(route, `${siteUrl}/`).href, route === "/");
  return { route, ...result, body: route === "/" ? result.body : undefined };
}));
const home = routes.find((item) => item.route === "/");
const homeHtml = home?.body || "";
const sources = await Promise.all((config.contentSources || []).map(async (source) => ({ source, ...(await request(new URL(source, `${siteUrl}/`).href)) })));
const assets = await Promise.all((config.requiredAssets || []).map(async (asset) => ({ asset, ...(await request(new URL(asset, `${siteUrl}/`).href, false)) })));
const searchable = [homeHtml, ...sources.filter((item) => item.ok).map((item) => item.body || "")].join("\n");
const requiredText = (config.requiredHomepageText || []).map((text) => ({ text, found: searchable.includes(text) }));
const whatsAppFound = approvedDigits ? searchable.replace(/\D/g, "").includes(approvedDigits) : true;
const links = await Promise.all(internalLinks(homeHtml).map(async (url) => {
  const result = await request(url, false);
  return { url, ok: result.ok, status: result.status, latencyMs: result.latencyMs, error: result.error };
}));
const seo = auditSeo(homeHtml);
const issues = [...seo.critical];
const warnings = [...seo.warnings];

for (const item of routes) {
  if (!item.ok) issues.push(`Route ${item.route} failed (${item.status || item.error || "unknown error"}).`);
  else if (item.latencyMs > 5000) warnings.push(`Route ${item.route} is slow (${item.latencyMs} ms).`);
}
for (const item of sources) if (!item.ok) issues.push(`Required content source ${item.source} failed (${item.status || item.error || "unknown error"}).`);
for (const item of assets) if (!item.ok) issues.push(`Required asset ${item.asset} failed (${item.status || item.error || "unknown error"}).`);
for (const item of requiredText) if (!item.found) issues.push(`Site is missing required brand text: ${item.text}.`);
if (!whatsAppFound) issues.push(`Site does not contain approved WhatsApp number +${approvedDigits}.`);
for (const item of links) if (!item.ok) issues.push(`Broken internal link: ${item.url} (${item.status || item.error || "unknown error"}).`);

const report = {
  version: "1.0.0",
  siteUrl,
  generatedAt: new Date().toISOString(),
  durationMs: Date.now() - started,
  status: issues.length ? "attention" : warnings.length ? "warning" : "healthy",
  ok: issues.length === 0,
  summary: {
    routesChecked: routes.length,
    routesPassed: routes.filter((item) => item.ok).length,
    internalLinksChecked: links.length,
    internalLinksPassed: links.filter((item) => item.ok).length,
    issueCount: issues.length,
    warningCount: warnings.length
  },
  brand: { requiredText, approvedWhatsAppDigits: approvedDigits, whatsAppFound },
  routes: routes.map(({ body, ...item }) => item),
  contentSources: sources.map(({ body, ...item }) => item),
  assets: assets.map(({ body, ...item }) => item),
  internalLinks: links,
  seo,
  issues,
  warnings
};

const mark = (ok) => ok ? "✅" : "❌";
const lines = [
  "# 壶中天机 Website Manager Report",
  "",
  `**Status:** ${report.ok ? "✅ Healthy" : "⚠️ Needs attention"}`,
  `**Site:** ${siteUrl}`,
  `**Generated:** ${report.generatedAt}`,
  `**Duration:** ${report.durationMs} ms`,
  "",
  "## Core routes",
  "",
  "| Route | Status | Latency |",
  "|---|---:|---:|",
  ...report.routes.map((item) => `| ${item.route} | ${mark(item.ok)} ${item.status || item.error || "error"} | ${item.latencyMs} ms |`),
  "",
  "## Brand safeguards",
  "",
  ...requiredText.map((item) => `- ${mark(item.found)} Required text: **${item.text}**`),
  `- ${mark(whatsAppFound)} WhatsApp: **+${approvedDigits}**`,
  ...report.contentSources.map((item) => `- ${mark(item.ok)} Content source: **${item.source}**`),
  ...report.assets.map((item) => `- ${mark(item.ok)} Asset: **${item.asset}**`),
  "",
  "## SEO",
  "",
  `- ${mark(Boolean(seo.title))} Title: ${seo.title || "Missing"}`,
  `- ${mark(Boolean(seo.description))} Meta description`,
  `- ${mark(seo.h1Count === 1)} H1 count: ${seo.h1Count}`,
  `- ${mark(Boolean(seo.ogTitle && seo.ogDescription && seo.ogImage))} Open Graph metadata`,
  `- ${seo.canonical ? "✅" : "⚠️"} Canonical: ${seo.canonical || "Not set"}`
];
if (issues.length) lines.push("", "## Issues", "", ...issues.map((item) => `- ❌ ${item}`));
if (warnings.length) lines.push("", "## Warnings", "", ...warnings.map((item) => `- ⚠️ ${item}`));
if (!issues.length && !warnings.length) lines.push("", "No issues or warnings were found.");
lines.push("", "_Generated automatically. No customer birth data, messages or payment data were collected._", "");

await mkdir(path.dirname(jsonPath), { recursive: true });
await mkdir(path.dirname(markdownPath), { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(markdownPath, `${lines.join("\n")}\n`, "utf8");
console.log(lines.join("\n"));
if (!report.ok && !noFail) process.exitCode = 1;
