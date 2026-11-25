/* Presentation only: no birth data, readings, payments or tracking. */
(() => {
  'use strict';
  const panel = document.getElementById('report-panel');
  if (!panel) return;
  const tabs = [...document.querySelectorAll('[data-chapter]')];
  let current = 0;
  const copy = {
    zh: {
      skip:'跳至主要内容', edition:'壶中天机 · 人生参考手册', heroReport:'翻开我的命书 ↗', heroNote:'观天时 · 知自性 · 择时而行', artCaption:'壶中有天地 · 盘里见人生',
      reportKicker:'一册命书 · THE LIFE BOOK', reportTitle:'把命盘，读成生活。', reportDesc:'从天性到际遇，从一张盘到下一步。翻开几个篇章，看看一份解读如何与你的生活相连。', indexLabel:'书中有你关心的事',
      chapter0:'认识自己', chapter1:'事业与方向', chapter2:'关系与相处', chapter3:'人生的时序', chapter4:'日常的行动', indexNote:'八字与紫微合参。用生活语言，读懂传统智慧。', sample:'阅读示意', reflection:'留一个问题给自己', sampleNote:'内容结构示意，非个人命盘或预测。', reportFoot:'一份可以留存、重读的人生参考。具体内容依所选服务而定。', reportAction:'查看命书与咨询 ↗',
      artRibbon:'一壶一世界', swipe:'← 左右滑动查看八项服务 →', drawSlip:'壶中一签', drawWait:'静心片刻 · 签在壶中', artAlt:'米白宣纸上的水墨茶壶与金色星图', tabLabel:'命书篇章',
      chapters:[
        ['第一章 · 认识自己','读懂天性，也看见可能。','从八字与紫微的不同视角，梳理你习惯的思考、表达与行动方式。',[['天赋','什么让你做起来更自然？'],['模式','什么情境容易让你反复消耗？'],['选择','如何为自己创造合适的环境？']],'最近一次感到自在而投入，是在做什么？'],
        ['第二章 · 事业与方向','找到适合自己的发力方式。','把命盘中的性情线索放进真实的工作情境，思考角色、协作与成长方向。',[['角色','独立深耕，还是与团队协作？'],['环境','你在哪种节奏里更能发挥？'],['合作','哪些沟通习惯值得调整？']],'现在的工作，最让你有成就感的是哪一部分？'],
        ['第三章 · 关系与相处','理解彼此，从理解自己开始。','观察亲密关系与人际互动中的习惯，给沟通、界限与相处留出新的空间。',[['表达','你如何表达关心与需要？'],['界限','哪些时刻需要说清自己的感受？'],['相处','怎样让彼此都感到被听见？']],'有哪一句一直没说出口的话，可以温和地表达？'],
        ['第四章 · 人生的时序','看见阶段，让步调更从容。','从大运与流年的传统视角，整理不同阶段值得留意的主题，再结合现实条件作判断。',[['回望','哪些经验已经成为你的积累？'],['当下','眼前最值得投入精力的是什么？'],['前路','下一阶段想提前做哪些准备？']],'如果只为接下来三个月安排一件事，你会选什么？'],
        ['第五章 · 日常的行动','把读懂的事，放进每一天。','将解读整理成可以回看、可以尝试的小提醒，让认识自己有一个实际的起点。',[['整理','留下一个想继续保持的习惯。'],['尝试','选择一件成本小、能做到的事。'],['回看','给自己的尝试留一个复盘时间。']],'今天可以做的最小一步是什么？']
      ]
    },
    en: {
      skip:'Skip to content', edition:'HUZHONG · A GUIDE TO YOUR NATURE', heroReport:'Open the Life Book ↗', heroNote:'Know your nature. Move at your own pace.', artCaption:'A universe within the vessel',
      reportKicker:'THE LIFE BOOK', reportTitle:'A chart, translated into life.', reportDesc:'From your nature to your next step. Explore a few chapters to see how a reading connects with everyday life.', indexLabel:'A few things you may be wondering',
      chapter0:'Your nature', chapter1:'Work & direction', chapter2:'Relationships', chapter3:'Life’s seasons', chapter4:'Everyday actions', indexNote:'Four Pillars and Zi Wei, read together. Classical wisdom in everyday language.', sample:'ILLUSTRATIVE', reflection:'A question to take with you', sampleNote:'Illustrative structure. Not a personal chart or prediction.', reportFoot:'A personal reference to keep and revisit. Contents vary by service.', reportAction:'Explore readings & consultations ↗',
      artRibbon:'A world in a vessel', swipe:'← Swipe to explore all eight services →', drawSlip:'A moment for you', drawWait:'Take a breath. Your reading awaits.', artAlt:'An ink-wash teapot and golden star charts on cream paper', tabLabel:'Life Book chapters',
      chapters:[
        ['CHAPTER ONE · YOUR NATURE','Understand your nature. See your possibilities.','Look at familiar ways of thinking, expressing yourself and taking action through Four Pillars and Zi Wei.',[['Strengths','What comes more naturally to you?'],['Patterns','Which situations leave you drained?'],['Choices','What environment helps you thrive?']],'The last time you felt fully absorbed and at ease, what were you doing?'],
        ['CHAPTER TWO · WORK & DIRECTION','Find a way of working that fits.','Connect the temperament themes in a chart with real working situations, roles and opportunities to grow.',[['Role','Independent work or collaboration?'],['Environment','What pace brings out your strengths?'],['Collaboration','What could you communicate differently?']],'Which part of your work gives you the most satisfaction?'],
        ['CHAPTER THREE · RELATIONSHIPS','Understanding others starts with yourself.','Reflect on patterns in close relationships and daily interactions, with room for communication and boundaries.',[['Expression','How do you express care and needs?'],['Boundaries','When do your feelings need a voice?'],['Connection','What helps both people feel heard?']],'What have you left unsaid that you could express with care?'],
        ['CHAPTER FOUR · LIFE’S SEASONS','Recognise the season. Find your pace.','Use traditional cycle and annual themes as prompts for reflection, alongside your actual circumstances.',[['Past','What have your experiences taught you?'],['Present','What deserves your attention now?'],['Next','What would you like to prepare for?']],'If you chose one focus for the next three months, what would it be?'],
        ['CHAPTER FIVE · EVERYDAY ACTIONS','Bring what you learn into each day.','Turn reflections into small, practical reminders you can revisit, try and adjust as you go.',[['Keep','Choose one habit worth continuing.'],['Try','Pick a small, manageable experiment.'],['Reflect','Make time to look back and learn.']],'What is the smallest step you can take today?']
      ]
    }
  };
  function language(){ return document.documentElement.lang.startsWith('zh') ? 'zh' : 'en'; }
  function render(){
    const c = copy[language()], chapter = c.chapters[current];
    document.querySelectorAll('[data-design]').forEach(el => { if(c[el.dataset.design]) el.textContent = c[el.dataset.design]; });
    document.querySelector('.vessel-art img').alt = c.artAlt;
    document.querySelector('.scroll-cue').setAttribute('aria-label', language() === 'zh' ? '探索网站' : 'Explore the website');
    document.querySelector('.report-tabs').setAttribute('aria-label', c.tabLabel);
    tabs.forEach((tab, i) => {tab.setAttribute('aria-selected', String(i === current));tab.tabIndex = i === current ? 0 : -1;});
    document.querySelector('.sheet-watermark').textContent = '壹贰叁肆伍'[current];
    tabs.forEach((tab, i) => tab.firstElementChild.textContent = language() === 'zh' ? '壹贰叁肆伍'[i] : String(i+1).padStart(2,'0'));
    panel.setAttribute('aria-labelledby',tabs[current].id);
    ['sheet-chapter','sheet-title','sheet-lede'].forEach((id,i) => document.getElementById(id).textContent=chapter[i]);
    const topics = document.getElementById('sheet-topics');topics.replaceChildren();
    chapter[3].forEach(([label,text]) => {const d=document.createElement('div'), small=document.createElement('small'), p=document.createElement('p');small.textContent=label;p.textContent=text;d.append(small,p);topics.append(d);});
    document.getElementById('sheet-question').textContent=chapter[4];
    document.getElementById('sheet-page').textContent=String(current+1).padStart(2,'0')+' / 05';
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click',() => {current=i;render();});
    tab.addEventListener('keydown',e => {
      let next=current;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(current+1)%tabs.length;
      else if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(current+tabs.length-1)%tabs.length;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=tabs.length-1;
      else return;
      e.preventDefault();current=next;render();tabs[current].focus();
    });
  });
  // The existing site owns language choice; follow its DOM language signal.
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();
