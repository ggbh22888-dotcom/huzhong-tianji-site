
/* Daily editorial reflections and manual WhatsApp subscription. */
(function(){
'use strict';
const entries=[{"zh":{"quote":"先把一件小事做好，方向就会慢慢清楚。","action":"花十分钟，完成一件拖延的小事。","question":"今天，什么值得你认真而不着急？"},"en":{"quote":"Do one small thing well; clarity can follow.","action":"Spend ten minutes finishing something you have put off.","question":"What deserves your care without your haste?"}},{"zh":{"quote":"留一点空白，才听得见自己的声音。","action":"给自己三分钟安静，不看手机。","question":"什么事情可以暂时放下？"},"en":{"quote":"Leave a little space to hear yourself.","action":"Take three quiet minutes away from your phone.","question":"What can you set aside for now?"}},{"zh":{"quote":"慢一点回应，也是一种体贴。","action":"先听完对方的一句话，再表达想法。","question":"你想被理解的事，是否已经说清楚？"},"en":{"quote":"A thoughtful pause can be a kindness.","action":"Listen to a full thought before offering your own.","question":"Have you clearly expressed what you want understood?"}},{"zh":{"quote":"把心力放回眼前，今天就有了起点。","action":"写下今天最重要的一件事，先做第一步。","question":"哪一步是你现在能做到的？"},"en":{"quote":"Bring your attention back to what is here.","action":"Write down one priority and take its first step.","question":"What step is within your reach now?"}},{"zh":{"quote":"一盏茶的时间，也能让忙碌有个停顿。","action":"慢慢喝一杯茶，感受温度与香气。","question":"今天有什么微小的美好？"},"en":{"quote":"A cup of tea can make room in a busy day.","action":"Sip a cup of tea slowly and notice its warmth and aroma.","question":"What small good thing have you noticed today?"}},{"zh":{"quote":"清理一处杂乱，也给思绪腾一点地方。","action":"整理桌面的一角，留下真正需要的东西。","question":"什么还在占用你的注意力？"},"en":{"quote":"Clear a little space for a clearer thought.","action":"Tidy one corner of your desk. Keep what you need.","question":"What is still taking up your attention?"}},{"zh":{"quote":"不必一次走完，走稳这一段就好。","action":"把一个大任务拆成三个小步骤。","question":"你能给自己怎样的耐心？"},"en":{"quote":"You can walk this stretch without finishing the whole road.","action":"Break a large task into three small steps.","question":"What patience can you offer yourself?"}},{"zh":{"quote":"把感谢说出来，让温暖有个去处。","action":"向一位帮助过你的人表达感谢。","question":"谁曾让你的一天轻松一点？"},"en":{"quote":"Give your gratitude somewhere to go.","action":"Thank someone who has helped you.","question":"Who has made your day a little easier?"}},{"zh":{"quote":"温柔地说清界限，也是在照顾关系。","action":"面对新请求，先看看自己的时间。","question":"哪些承诺需要量力而行？"},"en":{"quote":"Clear, kind boundaries can care for a relationship.","action":"Check your time before accepting a new request.","question":"Which commitments need a realistic limit?"}},{"zh":{"quote":"有些答案，要在行动以后才看得见。","action":"为一个想法做一次小小的尝试。","question":"怎样的尝试成本低，又能让你学到东西？"},"en":{"quote":"Some answers appear after a small action.","action":"Try one modest experiment with an idea.","question":"What small experiment could teach you something?"}},{"zh":{"quote":"今天的从容，从少一点比较开始。","action":"记录一件自己比昨天更熟练的事。","question":"你的进步，是否被自己看见？"},"en":{"quote":"A little less comparison can make room for calm.","action":"Note one thing you are getting better at.","question":"Have you noticed your own progress?"}},{"zh":{"quote":"给未完成留位置，也给休息留时间。","action":"为今天设一个合理的收工时间。","question":"哪些事可以明天继续？"},"en":{"quote":"Make room for unfinished work and for rest.","action":"Choose a reasonable time to finish work today.","question":"What can continue tomorrow?"}},{"zh":{"quote":"让脚步接近自然，让心回到当下。","action":"到窗边或户外，观察一片叶子或一段天空。","question":"你已经多久没有仔细看过身边？"},"en":{"quote":"Let a little nature bring you back to the moment.","action":"Notice a leaf or a patch of sky by a window or outside.","question":"When did you last look closely at your surroundings?"}},{"zh":{"quote":"把今天收好，明天就能轻一点出发。","action":"记下今天的一点收获和明天的第一步。","question":"什么经验值得你带到明天？"},"en":{"quote":"Close today with care and start tomorrow a little lighter.","action":"Note one lesson from today and one first step for tomorrow.","question":"What would you like to carry into tomorrow?"}}];
window.HZ_DAILY_ENTRIES=entries;
function selectedDate(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const get=t=>Number(parts.find(p=>p.type===t).value);
 return new Date(Date.UTC(get('year'),get('month')-1,get('day')+dayOffset));
}
const content=document.createElement('div');content.className='daily-reflection';
document.querySelector('#daily .daily-nav').before(content);
const subscription=document.createElement('details');subscription.className='daily-subscription';
document.querySelector('#daily .wrap').append(subscription);
function renderSubscription(){
 const zh=LANG==='zh';
 subscription.innerHTML='<summary><span aria-hidden="true">✉</span> '+(zh?'订阅壶中日签':'Subscribe to the Daily Page')+'</summary><form class="daily-register"><p>'+(zh?'留下 WhatsApp 号码，由壶中天机人工登记与发送每日 PDF。':'Register your WhatsApp number. Huzhong Tianji will manually register you and send the daily PDF.')+'</p><label for="daily-phone">'+(zh?'WhatsApp 号码（含国家代码）':'WhatsApp number (with country code)')+'</label><input id="daily-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+65 8123 4567" maxlength="24" required><label class="daily-consent"><input type="checkbox" required> <span>'+(zh?'我同意通过 WhatsApp 接收壶中日签；可随时回复「停止」退订。':'I agree to receive the Daily Page on WhatsApp. Reply STOP at any time to unsubscribe.')+'</span></label><button class="btn btn-gold" type="submit">'+(zh?'前往 WhatsApp 提交订阅':'Submit via WhatsApp')+'</button><p class="note">'+(zh?'网站不储存号码。下一步请在 WhatsApp 确认发送给 +65 8014 8899，由我们确认登记。日签每天早上 6 点（新加坡时间）准备，人工发送时间可能不同。':'This site does not store your number. Review and send to +65 8014 8899 in WhatsApp; we will confirm registration. The daily edition is prepared at 6 am Singapore time; manual delivery times may vary.')+'</p></form>';
 subscription.querySelector('form').addEventListener('submit',function(e){
 e.preventDefault();const input=subscription.querySelector('input[type=tel]');const phone=input.value.replace(/[\s()-]/g,'');
 if(!/^\+[1-9]\d{7,14}$/.test(phone)){input.setCustomValidity(zh?'请输入含国家代码的完整号码，例如 +65 8123 4567。':'Enter a full number including country code, e.g. +65 8123 4567.');input.reportValidity();return;}
 const msg=zh?'你好，我想订阅壶中日签每日 PDF。\n我的 WhatsApp 号码：'+phone+'\n我同意接收每日壶中日签，知道可回复「停止」退订。请确认登记。':'Hello, I would like to subscribe to the Daily Page PDF.\nMy WhatsApp number: '+phone+'\nI agree to receive the daily edition and understand I can reply STOP to unsubscribe. Please confirm registration.';
 window.open(waUrl(msg),'_blank','noopener');
 });
 subscription.querySelector('input[type=tel]').addEventListener('input',function(){this.setCustomValidity('');});
}
const previousRender=window.renderDaily;
window.renderDaily=function(){
 previousRender();
 const dt=selectedDate(),y=dt.getUTCFullYear(),m=dt.getUTCMonth()+1,d=dt.getUTCDate();
 // Gregorian Julian day number, using the standard positive-month conversion.
 const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
 const jd=d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
 const idx=(jd+49)%60,stem=STEMS[idx%10],meta=ELE_META[ELE[stem]][LANG],zh=LANG==='zh';
 document.getElementById('dailyDate').textContent=zh?y+'年'+m+'月'+d+'日':dt.toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'});
 document.getElementById('dailyGz').textContent=stem+BRANCHES[idx%12];
 document.getElementById('dailyNick').textContent=NICKS[idx];
 const labels=zh?['纳音','参考色','参考方位']:['Na Yin','Colour','Direction'];
 document.getElementById('dailyChips').innerHTML=[NAYIN[Math.floor(idx/2)],meta.c,meta.d].map((v,i)=>'<span class="chip">'+labels[i]+' · <b>'+v+'</b></span>').join('');
 const ordinal=Math.floor(dt.getTime()/86400000),entry=entries[((ordinal-20723)%entries.length+entries.length)%entries.length][LANG];
 content.innerHTML='<p class="kicker">'+(zh?'今日寄语':'A thought for today')+'</p><p class="daily-quote">'+entry.quote+'</p><div class="daily-reflection-grid"><div><h3>'+(zh?'今日行动':'One small action')+'</h3><p>'+entry.action+'</p></div><div><h3>'+(zh?'今日自问':'A question to keep')+'</h3><p>'+entry.question+'</p></div></div>';
 document.querySelector('#daily [data-i18n="da_note"]').textContent=zh?'按新加坡日期更新。寄语从编辑内容库每日轮换，是生活启发，并非个人运势预测；历法资料仅供传统文化参考。':'Updated by Singapore date. Editorial reflections rotate daily for inspiration, not personal predictions. Calendar details are a traditional cultural reference.';
};
const previousLang=window.setLang;
window.setLang=function(lang){previousLang(lang);renderSubscription();};
renderDaily();renderSubscription();
let lastDate=selectedDate().toISOString().slice(0,10);
setInterval(function(){const current=selectedDate().toISOString().slice(0,10);if(current!==lastDate){lastDate=current;renderDaily();}},60000);
})();
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
