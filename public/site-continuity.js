/* Original-site integration only. No requests, tracking, personal-data storage or new chart logic. */
(() => {
  'use strict';
  const hub = document.getElementById('hzc-start');
  if (!hub || window.__hzcInstalled) return;
  window.__hzcInstalled = true;
  const copy = {
    zh: {
      ziweiNav:'紫微命盘', heading:'此刻，想从哪里开始？', intro:'一签、一个方向，或一张命盘。按自己的步调，走进壶中。',
      dailyTitle:'今日天机', dailyDesc:'一页日签，给今天一个安静的开始。', dailyAction:'查看今日天机',
      compassTitle:'壶中罗盘', compassDesc:'了解原有个人方位服务与咨询方式。', compassAction:'探索壶中罗盘',
      ziweiTitle:'紫微命盘', ziweiDesc:'从出生资料出发，逐宫查看命盘结构。', ziweiAction:'进入紫微命盘',
      allTitle:'综合排盘', allDesc:'八字、合盘、问卦、翻牌与其他原有工具。', allAction:'查看完整工具'
    },
    en: {
      ziweiNav:'Zi Wei Chart', heading:'Where would you like to begin?', intro:'A daily reflection, a direction or a birth chart. Explore Huzhong at your own pace.',
      dailyTitle:'The Daily Page', dailyDesc:'Make a little room for reflection today.', dailyAction:'Explore today’s page',
      compassTitle:'Hu Zhong Compass', compassDesc:'Explore our existing personal direction reading and consultation.', compassAction:'Explore the Compass',
      ziweiTitle:'Zi Wei Chart', ziweiDesc:'Enter your birth details and explore the twelve palaces.', ziweiAction:'Open your Zi Wei chart',
      allTitle:'All Chart Tools', allDesc:'BaZi, relationship charts, I Ching, tarot and the original tools.', allAction:'Explore all tools'
    }
  };
  const key = hub.dataset.langKey;
  const isZh = value => /^zh/i.test(value || '');
  const previousSetLang = window.setLang;
  function refresh(lang) {
    const chosen = isZh(lang) ? 'zh' : 'en';
    document.querySelectorAll('[data-hzcopy]').forEach(el => {
      const text = copy[chosen][el.dataset.hzcopy];
      if (text) el.textContent = text;
    });
    document.documentElement.lang = chosen === 'zh' ? 'zh-Hans' : 'en';
    const next = chosen === 'zh' ? 'zh-CN' : 'en';
    try {
      const old = localStorage.getItem(key);
      if (!old) localStorage.setItem(key, next);
    } catch { /* Storage may be unavailable; the UI still works. */ }
  }
  if (typeof previousSetLang === 'function') {
    window.setLang = function (lang) {
      const chosen = isZh(lang) ? 'zh' : 'en';
      const result = previousSetLang.call(this, chosen);
      refresh(chosen);
      try { localStorage.setItem(key, chosen === 'zh' ? 'zh-CN' : 'en'); } catch {}
      return result;
    };
  }
  let stored = null;
  try { stored = localStorage.getItem(key); } catch {}
  const preferred = isZh(stored || navigator.language) ? 'zh' : 'en';
  if (typeof previousSetLang === 'function') previousSetLang(preferred);
  refresh(preferred);
  document.querySelectorAll('.hzp-lang [data-lang]').forEach(button => {
    button.addEventListener('click', () => window.setLang?.(button.dataset.lang));
  });
  const nav = document.getElementById('nav');
  const menu = document.querySelector('.menu-btn');
  if (nav && menu) {
    menu.setAttribute('aria-controls','nav');
    const sync = () => menu.setAttribute('aria-expanded',String(nav.classList.contains('open')));
    new MutationObserver(sync).observe(nav,{attributes:true,attributeFilter:['class']});
    sync();
    nav.addEventListener('click', e => { if (e.target.closest('a')) nav.classList.remove('open'); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); menu.focus(); }
    });
  }
  function setOffset() {
    const header = document.querySelector('body > header');
    if (header) document.documentElement.style.setProperty('--hzc-header-offset',`${Math.ceil(header.getBoundingClientRect().height)+18}px`);
  }
  setOffset();
  if ('ResizeObserver' in window) {
    const header = document.querySelector('body > header');
    if (header) new ResizeObserver(setOffset).observe(header);
  }
  window.addEventListener('resize',setOffset,{passive:true});
})();
