/* Presentation adapters for existing service and daily renderers. */
(() => {
  'use strict';
  const grid = document.getElementById('svcGrid');
  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  function decorateServices() {
    if (!grid) return;
    [...grid.children].forEach((card, i) => {
      const top = card.querySelector('.svc-top');
      if (!top) return;
      let number = top.querySelector('.svc-index');
      if (!number) { number = document.createElement('span'); number.className = 'svc-index'; number.setAttribute('aria-hidden', 'true'); top.prepend(number); }
      number.textContent = '壹贰叁肆伍陆柒捌'[i] || String(i + 1);
      const price = top.querySelector('.svc-price');
      if (price) card.insertBefore(price, card.querySelector('ul'));
      if (card.querySelector('.hot')) {
        let label = card.querySelector('.featured-label');
        if (!label) { label = document.createElement('span'); label.className = 'featured-label'; card.prepend(label); }
        label.textContent = language() === 'zh' ? '镇店 · 命书' : 'FEATURED · LIFE BOOK';
      }
    });
  }
  function arrangeDaily() {
    const card = document.querySelector('.daily-layout');
    const almanac = card?.querySelector('.daily-message .almanac');
    if (almanac) card.append(almanac);
  }
  if (grid) new MutationObserver(decorateServices).observe(grid, {childList:true});
  // Watch only the generated message area; existing date handlers keep owning its data.
  const message = document.querySelector('.daily-message');
  if (message) new MutationObserver(arrangeDaily).observe(message, {childList:true});
  new MutationObserver(decorateServices).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  decorateServices(); arrangeDaily();
})();
