(function () {
  'use strict';
  var panel = document.createElement('aside');
  panel.className = 'wa-panel'; panel.id = 'wa-panel'; panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'wa-title');
  panel.innerHTML = '<div class="wa-head"><img src="brand-logo.png" alt="壶中天机"><button type="button" class="wa-close">×</button></div><h2 id="wa-title" style="font-size:19px"></h2><p class="wa-note" id="wa-intro"></p><div class="wa-options"></div><label for="wa-message" id="wa-label"></label><textarea id="wa-message" maxlength="2000"></textarea><a class="btn btn-gold" id="wa-send" target="_blank" rel="noopener"></a><p class="wa-note" id="wa-privacy"></p>';
  var launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'btn btn-gold wa-launch';
  launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'wa-panel');
  document.body.append(panel, launch);
  var footer = document.createElement('div'); footer.className = 'wa-footer';
  document.querySelector('footer .wrap').insertBefore(footer, document.querySelector('footer .fine'));
  var message = document.getElementById('wa-message');
  var send = document.getElementById('wa-send');
  function close() { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); launch.focus(); }
  launch.addEventListener('click', function () {
    if (!panel.hidden) { close(); return; }
    panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); panel.querySelector('button').focus();
  });
  panel.querySelector('.wa-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
  function greeting() { return LANG === 'zh' ? '你好，我想咨询壶中天机的服务。' : 'Hello, I would like to ask about Huzhong Tianji services.'; }
  function updateLink() { send.href = waUrl(message.value.trim() || greeting()); }
  message.addEventListener('input', updateLink);
  function refresh() {
    var zh = LANG === 'zh';
    launch.textContent = zh ? 'WhatsApp 咨询' : 'Chat on WhatsApp';
    panel.querySelector('.wa-close').setAttribute('aria-label', zh ? '关闭咨询窗口' : 'Close chat panel');
    document.getElementById('wa-title').textContent = zh ? '壶中天机 · 有问，慢慢聊' : 'Huzhong Tianji · Let’s talk';
    document.getElementById('wa-intro').textContent = '+65 8014 8899 · ' + (zh ? '选择问题，前往 WhatsApp 与我们联系。' : 'Choose a topic to contact us on WhatsApp.');
    document.getElementById('wa-label').textContent = zh ? '想问些什么？' : 'Your question';
    send.textContent = zh ? '前往 WhatsApp' : 'Continue to WhatsApp';
    document.getElementById('wa-privacy').textContent = zh ? '点击后在 WhatsApp 确认发送；此处不会自动发送或储存您的留言。' : 'Review and send in WhatsApp. This page does not automatically send or store your message.';
    var topics = zh ? ['不确定选哪项服务', '出生时辰不确定', '索取匿名样书', '付款前先咨询', '咨询壶中罗盘'] : ['Help me choose a service', 'My birth time is uncertain', 'Request an anonymised sample', 'Ask before paying', 'Ask about the Personal Compass'];
    var opts = panel.querySelector('.wa-options'); opts.replaceChildren();
    topics.forEach(function (topic) { var a = document.createElement('a'); a.textContent = topic; a.href = waUrl(topic); a.target = '_blank'; a.rel = 'noopener'; opts.appendChild(a); });
    footer.replaceChildren();
    var link = document.createElement('a'); link.className = 'btn btn-line'; link.textContent = 'WhatsApp · +65 8014 8899'; link.href = waUrl(greeting()); link.target = '_blank'; link.rel = 'noopener'; footer.appendChild(link);
    document.querySelectorAll('#svcGrid .svc').forEach(function (card, i) {
      var existing = card.querySelector('.wa-service'); if (existing) existing.remove();
      var a = document.createElement('a'); a.className = 'wa-service'; a.textContent = zh ? '购买前先问 →' : 'Ask before ordering →';
      a.href = waUrl((zh ? '你好，我想咨询：' : 'Hello, I would like to ask about: ') + SERVICES[i][LANG].n); a.target = '_blank'; a.rel = 'noopener'; card.appendChild(a);
      if (i === 2) card.querySelector('.btn').href = waUrl(topics[4]);
    });
    updateLink();
  }
  var originalSetLang = window.setLang;
  window.setLang = function (lang) { originalSetLang(lang); refresh(); };
  document.getElementById('intakeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var zh = LANG === 'zh', data = new FormData(e.target);
    var labels = zh ? {name:'姓名',email:'电邮',gender:'性别',service:'订购项目',lang:'版本',birthdate:'出生日期',birthtime:'出生时间',birthplace:'出生地',receipt:'付款单号',home:'现居环境',note:'备注'} : {name:'Name',email:'Email',gender:'Gender',service:'Service',lang:'Language',birthdate:'Birth date',birthtime:'Birth time',birthplace:'Birth place',receipt:'Payment reference',home:'Home details',note:'Notes'};
    var lines = [zh ? '你好，以下是我的壶中天机服务资料：' : 'Hello, here are my Huzhong Tianji service details:'];
    Object.keys(labels).forEach(function (key) { var value = String(data.get(key) || '').trim(); if (value) lines.push(labels[key] + ': ' + value); });
    window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
  });
  refresh();
})();
