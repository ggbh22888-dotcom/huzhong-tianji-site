import { readFile } from "node:fs/promises";

const file = process.env.MANAGED_ARTICLES_FILE || "content/managed-articles.json";
const articles = JSON.parse(await readFile(file, "utf8"));

if (!Array.isArray(articles)) throw new Error(`${file} must contain a JSON array.`);

const issues = [];
const seen = new Set();
const disclaimerPattern = /传统文化|个人参考|personal reference|professional advice|专业建议/i;
const absoluteClaimPattern = /一定发财|保证发财|一定结婚|必有灾|必定发生|百分之百|guaranteed to happen|definitely become rich|certainly marry/i;
const secretPattern = /(sk-ant-|sk-proj-|ghp_|github_pat_|NETLIFY_AUTH_TOKEN\s*=)/i;

for (const [index, article] of articles.entries()) {
  const label = article?.slug || `entry ${index + 1}`;
  if (!article || typeof article !== "object") {
    issues.push(`${label}: entry must be an object.`);
    continue;
  }
  for (const key of ["slug", "title", "summary", "body", "date"]) {
    if (!String(article[key] || "").trim()) issues.push(`${label}: missing ${key}.`);
  }
  if (article.slug) {
    if (seen.has(article.slug)) issues.push(`${label}: duplicate slug.`);
    seen.add(article.slug);
    if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(article.slug)) issues.push(`${label}: slug must use lowercase letters, numbers, and hyphens.`);
  }
  if (article.date && !/^\d{4}-\d{2}-\d{2}$/.test(article.date)) issues.push(`${label}: date must be YYYY-MM-DD.`);
  const combined = `${article.title || ""}\n${article.summary || ""}\n${article.body || ""}`;
  if (!disclaimerPattern.test(combined)) issues.push(`${label}: missing traditional-culture / professional-advice disclaimer.`);
  if (absoluteClaimPattern.test(combined)) issues.push(`${label}: contains a prohibited absolute prediction or guarantee.`);
  if (secretPattern.test(combined)) issues.push(`${label}: possible secret detected.`);
  if (article.tool?.href) {
    const href = String(article.tool.href).trim();
    if (/^(javascript:|data:|vbscript:)/i.test(href)) issues.push(`${label}: unsafe CTA URL protocol.`);
    if (!(href.startsWith("/") || /^https:\/\//i.test(href))) issues.push(`${label}: CTA URL must be an internal path or HTTPS URL.`);
  }
}

if (issues.length) {
  console.error(`# Managed article validation failed\n`);
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`✅ Validated ${articles.length} managed article proposal(s).`);
}
