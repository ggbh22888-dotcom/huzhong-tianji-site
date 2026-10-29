"use client";
// Charts — renders whatever chart systems came back from the API
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

export function Bazi({ c }) {
  if (!c || c.error) return null;
  const cols = ["year", "month", "day", "hour"], names = { year: "年柱", month: "月柱", day: "日柱", hour: "时柱" };
  return (
    <div className="sys">
      <h4>四柱八字 <small>属{c.shengXiao} · 农历 {c.lunarDate} · {c.jieQi}后{c.solarCorrection ? ` · 真太阳时 ${c.solarCorrection.trueSolarTime}（${c.solarCorrection.shiftMinutes > 0 ? "+" : ""}${c.solarCorrection.shiftMinutes}分）` : ""}</small></h4>
      <table className="pillars">
        <thead><tr>{cols.map((k) => <th key={k}>{names[k]}</th>)}</tr></thead>
        <tbody>
          <tr className="shishen">{cols.map((k) => <td key={k}>{c.pillars[k].shiShen}</td>)}</tr>
          <tr className="gan">{cols.map((k) => <td key={k} className={k === "day" ? "daymaster" : ""}>{c.pillars[k].gan}</td>)}</tr>
          <tr className="zhi">{cols.map((k) => <td key={k}>{c.pillars[k].zhi}</td>)}</tr>
          <tr className="hide">{cols.map((k) => <td key={k}>{c.pillars[k].hideGan.join(" ")}</td>)}</tr>
          <tr className="nayin">{cols.map((k) => <td key={k}>{c.pillars[k].naYin}</td>)}</tr>
        </tbody>
      </table>
      {c.strength && (
        <div className="strength">
          <div className="bar">{["木","火","土","金","水"].map((k) => <span key={k} className={`seg wx-${k}`} style={{ width: c.strength.percent[k] + "%" }} title={`${k} ${c.strength.percent[k]}%`}>{c.strength.percent[k] > 8 ? `${k}${c.strength.percent[k]}%` : ""}</span>)}</div>
          <div className="chips">
            <span className="chip gold">{c.strength.verdict} · 同党{c.strength.selfRatio}%{c.strength.deLing ? " · 得令" : " · 失令"}</span>
            {c.pattern && <span className="chip gold">{c.pattern.name}{c.pattern.touChu ? "（透）" : ""}</span>}
            {c.yongShen && <span className="chip">喜 {c.yongShen.like.join("")} · 忌 {c.yongShen.dislike.join("")}</span>}
            {c.xunKong && <span className="chip">日空 {c.xunKong.day}</span>}
          </div>
        </div>
      )}
      {c.shenSha?.length > 0 && <div className="chips shensha">{c.shenSha.map((s, i) => <span key={i} className="chip">{s.name}<small>·{s.where}</small></span>)}</div>}
      {c.shiShenStats && <p className="muted small">十神：{Object.entries(c.shiShenStats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}${v}`).join(" · ")}</p>}
      <div className="dayun">{(c.fortuneGrid || c.daYun).map((d) => <div key={d.startYear} className={d.current ? "cur" : ""}><b>{d.ganZhi}</b><small>{d.startAge}岁 · {d.startYear}</small>{d.ganShiShen && <small>{d.ganShiShen}</small>}</div>)}</div>
      {c.fortuneGrid && (
        <details className="grid-wrap"><summary>大运流年表</summary>
          <table className="ln"><tbody>
            {c.fortuneGrid.map((d) => (
              <tr key={d.startYear} className={d.current ? "cur" : ""}>
                <th>{d.ganZhi}<small>{d.startAge}岁</small></th>
                {d.liuNian.map((l) => <td key={l.year} className={l.now ? "now" : ""}><b>{l.ganZhi}</b><small>{l.year}</small><small>{l.shiShen}</small></td>)}
              </tr>
            ))}
          </tbody></table>
        </details>
      )}
    </div>
  );
}

export function Ziwei({ c }) {
  if (!c || c.error) return null;
  // Classic 4x4 ring layout: 巳午未申 / 辰 . . 酉 / 卯 . . 戌 / 寅丑子亥
  const order = ["巳", "午", "未", "申", "辰", null, null, "酉", "卯", null, null, "戌", "寅", "丑", "子", "亥"];
  const byZhi = Object.fromEntries(c.palaces.map((p) => [p.ganZhi.slice(-1), p]));
  return (
    <div className="sys">
      <h4>紫微斗数 <small>{c.fiveElementsClass} · 命主{c.soul} · 身主{c.body} · 当前{c.current.decadal.name} {c.current.decadal.ganZhi}（{c.current.decadal.palace}）</small></h4>
      <div className="zw">
        {order.map((z, i) => {
          if (!z) return i === 5 ? <div key={i} className="zw-center"><b>{c.chineseDate}</b><small>{c.lunarDate}</small></div> : <div key={i} className="zw-blank" />;
          const p = byZhi[z];
          return (
            <div key={z} className={`zw-cell ${p.isBodyPalace ? "body" : ""}`}>
              <div className="zw-major">{p.majorStars.join(" ") || "—"}</div>
              <div className="zw-minor">{p.minorStars.join(" ")}</div>
              <div className="zw-foot"><span>{p.name}{p.isBodyPalace ? "·身" : ""}</span><span>{p.ganZhi}</span></div>
              <div className="zw-dec">{p.decadal}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Qizheng({ c }) {
  if (!c || c.error) return null;
  return (
    <div className="sys">
      <h4>七政四余 <small>日躔{c.sunGong}·{c.sunCi} · 月在{c.moonXiu} · 恒星黄道</small></h4>
      <table className="qz"><thead><tr><th>星</th><th>五行</th><th>宫</th><th>次</th><th>宿度</th></tr></thead>
        <tbody>{c.stars.map((s) => <tr key={s.name} className={["紫气","月孛","罗睺","计都"].includes(s.name) ? "yu" : ""}><td>{s.name}</td><td>{s.wuxing}</td><td>{s.gong}</td><td>{s.ci}</td><td>{s.xiu}</td></tr>)}</tbody></table>
      <p className="muted small">{c.note}</p>
    </div>
  );
}

export function Western({ c }) {
  if (!c || c.error) return null;
  return (
    <div className="sys">
      <h4>西洋本命星盘 <small>太阳{c.big3.sun} · 月亮{c.big3.moon} · 上升{c.big3.rising} {c.ascendant.deg}° · {c.houseSystem}</small></h4>
      <div className="chips">{c.planets.map((p) => <span key={p.name} className="chip">{p.name} {p.sign}{p.deg}° · {p.house}宫</span>)}</div>
      {c.aspects.length > 0 && <p className="muted small">相位：{c.aspects.join("，")}</p>}
    </div>
  );
}

export function Vedic({ c }) {
  if (!c || c.error) return null;
  return (
    <div className="sys">
      <h4>印占吠陀 <small>上升{c.lagna.sign} · 月亮{c.moonSign} · 本命星宿 {c.janmaNakshatra} · {c.ayanamsa}</small></h4>
      <div className="chips">{c.planets.map((p) => <span key={p.name} className="chip">{p.name} {p.sign} · {p.nakshatra} · {p.house}宫</span>)}</div>
    </div>
  );
}

export function Numerology({ c }) {
  if (!c || c.error) return null;
  return (
    <div className="sys">
      <h4>灵数</h4>
      <div className="chips">
        <span className="chip gold">生命灵数 {c.lifePath}</span><span className="chip">生日数 {c.birthday}</span><span className="chip">态度数 {c.attitude}</span>
        <span className="chip">个人年 {c.personalYear}</span><span className="chip">挑战数 {c.challenges.join("/")}</span>
        {c.missing.length > 0 && <span className="chip">空缺 {c.missing.join(" ")}</span>}
      </div>
    </div>
  );
}

export function Maya({ c }) {
  if (!c || c.error) return null;
  return (
    <div className="sys">
      <h4>玛雅历法 <small>Kin {c.kin}</small></h4>
      <div className="chips"><span className="chip gold">{c.tone} · {c.seal}</span><span className="chip">{c.wavespell}</span><span className="chip">引导 {c.guide}</span><span className="chip">支持 {c.analog}</span><span className="chip">挑战 {c.challenge}</span><span className="chip">隐藏 {c.occult}</span></div>
    </div>
  );
}

export function HumanDesign({ c }) {
  if (!c || c.error) return null;
  return (
    <div className="sys">
      <h4>人类图 <small>简版 · 人生角色 {c.profile}</small></h4>
      <div className="chips">
        <span className="chip gold">意识太阳 {c.personality.sun.gate}.{c.personality.sun.line}</span><span className="chip">意识地球 {c.personality.earth.gate}.{c.personality.earth.line}</span>
        <span className="chip">设计太阳 {c.design.sun.gate}.{c.design.sun.line}</span><span className="chip">设计地球 {c.design.earth.gate}.{c.design.earth.line}</span>
        <span className="chip">轮回交叉 {c.incarnationCross}</span>
      </div>
      <p className="muted small">{c.note}</p>
    </div>
  );
}

export function ChartSet({ charts, title }) {
  if (!charts) return null;
  return (
    <div className="chartset">
      {title && <h3>{title}</h3>}
      <Bazi c={charts["八字"]} /><Ziwei c={charts["紫微"]} /><Qizheng c={charts["七政四余"]} /><Western c={charts["西洋星盘"]} /><Vedic c={charts["吠陀"]} />
      <Numerology c={charts["灵数"]} /><Maya c={charts["玛雅"]} /><HumanDesign c={charts["人类图"]} />
    </div>
  );
}

export function Tarot({ draw }) {
  const [zoom, setZoom] = useState(null); // index of enlarged card
  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e) => { if (e.key === "Escape") setZoom(null); if (e.key === "ArrowRight") setZoom((z) => (z + 1) % draw.cards.length); if (e.key === "ArrowLeft") setZoom((z) => (z - 1 + draw.cards.length) % draw.cards.length); };
    window.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [zoom, draw]);
  if (!draw) return null;
  const z = zoom === null ? null : draw.cards[zoom];
  return (
    <div className="sys">
      <h4>牌阵 <small>点牌面可放大</small></h4>
      <div className="tarot">{draw.cards.map((c, i) => (
        <div key={i} className={`card-t ${c.reversed ? "rev" : ""}`} onClick={() => setZoom(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setZoom(i)}>
          <small>{c.position}</small>
          <div className="card-img">{c.image ? <img src={c.image} alt={c.card} /> : <div className="card-ph">{c.card}</div>}</div>
          <b>{c.card}</b><span>{c.reversed ? "逆位" : "正位"}{c.tag ? ` · ${c.tag}` : ""}</span>
        </div>
      ))}</div>
      <p className="muted small">牌面：東方塔羅牌 · GGHB STUDIO</p>
      {z && (
        <div className="lightbox" onClick={() => setZoom(null)}>
          <button type="button" className="lb-close" aria-label="关闭" onClick={() => setZoom(null)}>×</button>
          {draw.cards.length > 1 && <button type="button" className="lb-nav prev" aria-label="上一张" onClick={(e) => { e.stopPropagation(); setZoom((zoom - 1 + draw.cards.length) % draw.cards.length); }}>‹</button>}
          <figure onClick={(e) => e.stopPropagation()}>
            <div className={`lb-img ${z.reversed ? "rev" : ""}`}><img src={z.image} alt={z.card} /></div>
            <figcaption>
              <small>{z.position}</small>
              <b>{z.card} <span className={z.reversed ? "seal" : "jade"}>{z.reversed ? "逆位" : "正位"}</span></b>
              {z.tag && <em>【{z.tag}】</em>}
              {z.gist && <p>{z.gist}</p>}
              <p className="muted small">{z.reversed ? `逆位：${z.reversedMeaning || ""}` : `正位：${z.upright || ""}`}</p>
            </figcaption>
          </figure>
          {draw.cards.length > 1 && <button type="button" className="lb-nav next" aria-label="下一张" onClick={(e) => { e.stopPropagation(); setZoom((zoom + 1) % draw.cards.length); }}>›</button>}
        </div>
      )}
    </div>
  );
}

export function Gua({ gua }) {
  if (!gua) return null;
  return (
    <div className="sys">
      <h4>八宅命卦 <small>{gua.mingGua}卦 · {gua.group}</small></h4>
      <div className="chips">{Object.entries(gua.luckyDirections).map(([k, v]) => <span key={k} className="chip">{k} {v}</span>)}</div>
    </div>
  );
}

export function Transits({ t, events = [], sunSign }) {
  return (
    <div className="sys">
      <h4>当前行运 <small>{t.date} · {t.moon.name}{sunSign ? ` · 太阳${sunSign.sign}座（${sunSign.element}象 · ${sunSign.modality}）` : ""}</small></h4>
      <div className="chips">{t.transits.map((p) => <span key={p.name} className={`chip ${p.retro ? "retro" : ""}`}>{p.name} {p.sign}{p.deg}°{p.retro ? " ℞" : ""}{p.house ? ` · ${p.house}宫` : ""}</span>)}</div>
      {t.aspectsToNatal?.length > 0 && <p className="muted small">行运相位：{t.aspectsToNatal.slice(0, 12).join("，")}</p>}
      {events.length > 0 && <ul className="events">{events.slice(0, 10).map((e, i) => <li key={i}><span>{e.date}</span>{e.event}</li>)}</ul>}
    </div>
  );
}

export function Hexagram({ cast, date, question }) {
  if (!cast) return null;
  const draw = (h) => (
    <div className="hexfig">
      {[5,4,3,2,1,0].map((i) => <div key={i} className={`yao ${cast.changing.includes(i + 1) && h === cast.ben ? "chg" : ""}`}>{h.bits[i] ? <span className="yang" /> : <><span className="yin" /><span className="yin" /></>}</div>)}
      <b>{h.name}</b><small>第{h.number}卦 · 上{h.upper.name}{h.upper.nature} 下{h.lower.name}{h.lower.nature}</small>
    </div>
  );
  return (
    <div className="sys">
      <h4>壺中問卦 <small>{date?.ganZhi} · 问：{question}</small></h4>
      <div className="hexrow">
        {draw(cast.ben)}
        {cast.zhi && <><span className="arrow">→</span>{draw(cast.zhi)}</>}
        <div className="hexmeta">
          <p><b>卦辞</b> {cast.ben.text}</p>
          {cast.zhi && <p><b>之卦</b> {cast.zhi.name}：{cast.zhi.text}</p>}
          <p><b>互卦</b> {cast.hu.name}</p>
          <p><b>变爻</b> {cast.changing.length ? cast.changing.map((n) => cast.lines[n - 1].label).join("、") : "无"}</p>
          <p className="muted small">{cast.rule}</p>
        </div>
      </div>
      <table className="qz"><tbody>{[...cast.lines].reverse().map((l) => <tr key={l.position} className={l.changing ? "" : "yu"}><td>{l.label}</td><td>{l.coins}</td><td>{l.value}</td><td>{l.changing ? "变" : ""}</td></tr>)}</tbody></table>
    </div>
  );
}

export function Reading({ text }) {
  return <div className="reading"><ReactMarkdown>{text}</ReactMarkdown></div>;
}


// ---------- 壺中度歲 · 廿四节气流年表 ----------
const star = (v) => "★".repeat(Math.floor(v)) + (v % 1 ? "☆" : "");
const fmtSG = (iso) => new Date(iso).toLocaleString("zh-SG", { timeZone: "Asia/Singapore", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
export function Duisui({ d }) {
  const [full, setFull] = useState(false);
  if (!d || d.error) return null;
  const dims = full ? d.dims : Object.keys(d.liteLabels);
  const labels = full ? d.dimensionLabels : d.liteLabels;
  const top = new Set(d.top3), low = new Set(d.bottom3);
  return (
    <div className="sys duisui">
      <h4>壺中度歲 · {d.targetYear} {d.liuNian.ganZhi}年 <small>流年{d.liuNian.shishen}{d.daYun ? ` · 大运 ${d.daYun.ganZhi}` : ""} · 喜{d.yongshen.join("")} 忌{d.jishen.join("")} · 按廿四节气分廿四段</small></h4>
      <p className="muted" style={{ fontSize: ".85rem" }}>
        有利颜色：{d.extras.luckyColors.join("、")}　方位：{d.extras.luckyDirections.join("、")}　贵人姓氏：{d.extras.guirenSurnames.slice(0, 8).join("、")}
        <button type="button" className="ghost" style={{ marginLeft: 12 }} onClick={() => setFull(!full)}>{full ? "五维简表" : "九维全表"}</button>
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="pillars duisui-t">
          <thead><tr><th>节气</th><th>起</th><th>流月</th><th>司令</th><th>总评</th>{dims.map((k) => <th key={k}>{labels[k]}</th>)}<th>关系 · 神煞</th></tr></thead>
          <tbody>
            {d.segments.map((s) => (
              <tr key={s.index} className={top.has(s.index) ? "hi" : low.has(s.index) ? "lo" : ""}>
                <td>{s.jieqi}</td><td className="muted">{fmtSG(s.start)}</td><td>{s.liuYue}</td><td className="muted">{s.renYuan}{s.shishenRenYuan}</td>
                <td><b>{s.overall}</b></td>
                {dims.map((k) => <td key={k} className="stars">{star(full ? s.scores[k] : s.lite[k])}</td>)}
                <td className="muted rel">{[...s.relations, ...s.shensha].join("、")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: ".8rem" }}>上半月以中气前人元司令、下半月以本气司令；交节前后三天为气场切换期，宜静不宜动。</p>
    </div>
  );
}
