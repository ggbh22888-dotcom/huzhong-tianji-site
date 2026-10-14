/** Additive integration of the ORIGINAL homepage. No service/engine replacement. */
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const file = 'public/home.html';
const source = await readFile(file, 'utf8');
let html = source;
const insertBefore = (needle, content) => {
  assert.equal(html.split(needle).length, 2, `Expected exactly one integration anchor: ${needle}`);
  html = html.replace(needle, content + '\n' + needle);
};
for (const id of ['top', 'approach', 'services', 'draw', 'daily', 'book']) {
  assert.ok(source.includes(`id="${id}"`), `Original section missing: ${id}`);
}
const i18n = await readFile('lib/i18n.js', 'utf8');
const langKey = i18n.match(/(?:const|let|var)\s+LANG_KEY\s*=\s*["']([^"']+)["']/)?.[1];
assert.ok(langKey && /^[\w.-]+$/.test(langKey), 'Cannot safely find the existing shared language key');

if (!html.includes('href="/site-continuity.css"')) {
  insertBefore('</head>', '<link rel="stylesheet" href="/site-continuity.css">');
}
if (!html.includes('src="/site-continuity.js"')) {
  insertBefore('</body>', '<script src="/site-continuity.js" defer></script>');
}
if (!html.includes('id="hzc-ziwei-nav"')) {
  insertBefore('      <a href="/tools"', '      <a id="hzc-ziwei-nav" href="/ziwei-chart" data-hzcopy="ziweiNav">紫微命盘</a>');
}
if (!html.includes('id="hzc-start"')) {
  const cards = [
    ['daily', '#daily', '01', '今日天机', '一页日签，给今天一个安静的开始。', '查看今日天机'],
    ['compass', '#compass', '02', '壶中罗盘', '了解原有个人方位服务与咨询方式。', '探索壶中罗盘'],
    ['ziwei', '/ziwei-chart', '03', '紫微命盘', '从出生资料出发，逐宫查看命盘结构。', '进入紫微命盘'],
    ['all', '/pan', '04', '综合排盘', '八字、合盘、问卦、翻牌与其他原有工具。', '查看完整工具'],
  ];
  const cardHtml = cards.map(([id, href, n, title, desc, label]) => `<a class="hzc-card hzc-${id}" href="${href}"><span class="hzc-number" aria-hidden="true">${n}</span><h3 data-hzcopy="${id}Title">${title}</h3><p data-hzcopy="${id}Desc">${desc}</p><span class="hzc-link"><span data-hzcopy="${id}Action">${label}</span><span aria-hidden="true">↗</span></span></a>`).join('\n');
  insertBefore('<section id="approach">', `<section id="hzc-start" class="hzc-start" data-lang-key="${langKey}" aria-labelledby="hzc-heading"><div class="wrap"><div class="hzc-intro"><div><p class="hzc-kicker">HUZHONG TIANJI · EXPLORE</p><h2 id="hzc-heading" data-hzcopy="heading">此刻，想从哪里开始？</h2></div><p data-hzcopy="intro">一签、一个方向，或一张命盘。按自己的步调，走进壶中。</p></div><div class="hzc-grid">${cardHtml}</div></div></section>`);
}
if (!html.includes('class="hzc-footer-logo"')) {
  const footer = /<footer>\s*<div class="wrap">/;
  assert.ok(footer.test(html), 'Original footer not found');
  html = html.replace(footer, '$&\n<a class="hzc-footer-logo" href="#top"><img src="/brand-logo.png" alt="壶中天机 HUZHONG TIANJI" loading="lazy"></a>');
}
// Preserve every original inline script verbatim: services, prices, payments,
// daily logic, contact numbers and existing feature handlers must not change.
const inlineScripts = s => [...s.matchAll(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi)]
  .map(x => x[0]).filter(x => !/^<script\s[^>]*\bsrc=/i.test(x));
assert.deepEqual(inlineScripts(html), inlineScripts(source), 'An original inline script was altered');
for (const id of ['services', 'draw', 'daily', 'book']) assert.ok(html.includes(`id="${id}"`));
if (html !== source) await writeFile(file, html);
console.log('Site continuity: homepage preserved; navigation, discovery cards and presentation linked.');
