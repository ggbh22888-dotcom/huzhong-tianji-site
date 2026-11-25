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
  // Motion is decorative and starts only after a working pause control is ready.
  const hero = document.getElementById('top');
  const motionButton = document.getElementById('hero-motion-toggle');
  if (hero && motionButton) {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let wantsMotion = !preference.matches;
    let inView = true;
    function renderMotion() {
      hero.dataset.motion = wantsMotion ? 'playing' : 'paused';
      hero.dataset.motionActive = String(wantsMotion && inView && !document.hidden);
      const zh = language() === 'zh';
      motionButton.querySelector('[data-motion-label]').textContent = wantsMotion
        ? (zh ? '暂停动画' : 'Pause animation')
        : (zh ? '播放动画' : 'Play animation');
    }
    motionButton.addEventListener('click', () => { wantsMotion = !wantsMotion; renderMotion(); });
    preference.addEventListener('change', e => {
      // A new request to reduce motion takes precedence; relaxing it never auto-restarts.
      if (e.matches) wantsMotion = false;
      renderMotion();
    });
    document.addEventListener('visibilitychange', renderMotion);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        renderMotion();
      }, {threshold:0}).observe(hero);
    }
    new MutationObserver(renderMotion).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
    renderMotion();
    hero.setAttribute('data-motion-ready', '');
    motionButton.hidden = false;
  }
})();
