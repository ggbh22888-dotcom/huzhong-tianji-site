"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PersonForm, { emptyPerson, personPayload } from "@/app/components/PersonForm";
import { LangProvider, useLang } from "@/app/components/Lang";
import styles from "./ziwei-chart.module.css";

const COPY = {
  zh: {
    navHome: "首页",
    navAll: "综合排盘",
    navArticles: "文章",
    navContact: "WhatsApp 咨询",
    eyebrow: "规则化排盘 · 计算与解读分开",
    titleA: "免费紫微斗数排盘",
    titleB: "先看清命盘，再理解人生主题",
    intro: "输入出生日期、当地时间、出生地点与性别，建立可核对的紫微命盘。先看命宫、身宫、十二宫、主星、四化与大限，再决定是否进入 AI 深度解读。",
    start: "开始紫微排盘",
    viewMethod: "查看排盘方法",
    trust1: "基础命盘无需登录",
    trust2: "规则引擎先计算",
    trust3: "AI 解读另一步进行",
    trust4: "明确显示计算依据",
    formKicker: "BIRTH DATA",
    formTitle: "填写出生资料",
    formIntro: "请尽量使用有记录的出生时间。紫微斗数依赖时辰；若时辰不确定，请保留不确定性，不要为了得到完整命盘而随意填正午或午夜。",
    privacy: "本工具不要求身份证、电话或付款资料。姓名可留空；出生资料只用于本次排盘请求。",
    generate: "生成紫微命盘",
    generating: "正在建立命盘…",
    beforeTitle: "排盘前先确认",
    before1: "出生日期是公历还是农历；农历资料需确认是否闰月。",
    before2: "时间应为出生地当时的当地钟表时间。",
    before3: "出生地点用于经度、时区与真太阳时校正。",
    before4: "不同流派、四化表、年界与换日规则，可能产生不同结果。",
    previewTitle: "十二宫同盘呈现",
    previewSub: "主星、四化、大限与依据分层阅读",
    resultKicker: "YOUR ZI WEI CHART",
    resultTitle: "紫微命盘",
    resultIntro: "命盘事实来自规则引擎；下方说明只帮助你读懂字段，不把传统解释写成确定的人生结论。",
    print: "打印／保存 PDF",
    newChart: "重新排盘",
    summary: "命盘总览",
    fiveClass: "五行局",
    soul: "命主",
    body: "身主",
    zodiac: "生肖",
    decadal: "当前大限",
    yearly: "当前流年",
    palaceHint: "点击任何宫位，查看完整星曜与对宫资料。",
    bodyPalace: "身宫",
    lifePalace: "命宫",
    borrowed: "借对宫主星",
    noMajor: "本宫无十四主星",
    minor: "辅星",
    adjective: "杂曜",
    ages: "对应岁数",
    opposite: "对宫",
    decade: "大限",
    transformations: "四化落点",
    noTransform: "当前引擎未回传独立四化清单，请以命盘星曜旁的四化标记为准。",
    basis: "排盘依据",
    recordedTime: "记录时间",
    chartTime: "实际采用时间",
    trueSolar: "真太阳时",
    applied: "已启用",
    notApplied: "未启用",
    place: "出生地点",
    engine: "计算引擎",
    rule: "时辰规则",
    warningBoundary: "真太阳时校正跨过时辰边界，命盘可能与未校正版本不同。",
    methodTitle: "为什么不同网站可能排出不同命盘？",
    methodText: "常见差异来自公历／农历转换、闰月、历史时区、真太阳时、23:00 或 00:00 换日、年界、流派与四化表。比较时应固定出生资料，每次只检查一项规则。",
    separationTitle: "规则引擎与 AI 解读分开",
    separationText: "规则引擎只负责计算宫位、星曜、四化与时间层；AI 只能整理已计算的结果，不应补造未知出生时间，也不应悄悄更换计算规则。",
    nextTitle: "想继续看完整解读？",
    nextText: "可把这份命盘带入壶中排盘，进一步阅读命盘主轴、天赋挑战、事业资源、关系主题、大限与流年。",
    aiCta: "进入壶中排盘",
    askCta: "先用 WhatsApp 咨询",
    disclaimer: "紫微斗数属于传统文化解释体系，仅供自我观察与个人参考，不构成医疗、法律、投资或其他专业意见。",
    errorGeneric: "无法建立命盘，请检查出生日期、时间与地点。",
    palaceTheme: "此宫观察的主题",
    readStars: "星曜资料",
    shift: "校正",
    minutes: "分钟",
  },
  en: {
    navHome: "Home",
    navAll: "All Charts",
    navArticles: "Articles",
    navContact: "WhatsApp",
    eyebrow: "RULE-BASED CHART · CALCULATION BEFORE INTERPRETATION",
    titleA: "Free Zi Wei Dou Shu Chart",
    titleB: "See the chart clearly before interpreting its themes",
    intro: "Enter the recorded birth date, local time, birthplace and gender to build a transparent Zi Wei chart. Review the Life and Body Palaces, twelve palaces, stars, transformations and decade cycle before choosing an AI interpretation.",
    start: "Create my Zi Wei chart",
    viewMethod: "Read the method",
    trust1: "No login for the base chart",
    trust2: "Rule engine calculates first",
    trust3: "AI interpretation is separate",
    trust4: "Calculation settings are shown",
    formKicker: "BIRTH DATA",
    formTitle: "Enter birth details",
    formIntro: "Use a recorded birth time whenever possible. Zi Wei depends on the time period; when the time is uncertain, keep that uncertainty instead of entering noon or midnight simply to obtain a complete-looking chart.",
    privacy: "No identity number, phone or payment details are required. Name is optional; birth details are used for this chart request.",
    generate: "Generate Zi Wei chart",
    generating: "Building the chart…",
    beforeTitle: "Confirm before calculating",
    before1: "Whether the date is solar or lunar, and whether a lunar date is a leap month.",
    before2: "Use the local clock time recorded at the birthplace.",
    before3: "Birthplace provides longitude, time-zone and true-solar-time context.",
    before4: "Different schools, transformation tables, year boundaries and day-change rules may produce different charts.",
    previewTitle: "All twelve palaces in one view",
    previewSub: "Read stars, transformations, decade cycles and evidence in layers",
    resultKicker: "YOUR ZI WEI CHART",
    resultTitle: "Zi Wei Chart",
    resultIntro: "Chart facts come from the rule engine. The explanatory text helps identify fields without presenting traditional interpretation as scientific certainty.",
    print: "Print / Save PDF",
    newChart: "New chart",
    summary: "Chart overview",
    fiveClass: "Five-element class",
    soul: "Life master",
    body: "Body master",
    zodiac: "Zodiac",
    decadal: "Current decade",
    yearly: "Current year",
    palaceHint: "Select any palace to view its full star list and opposite palace.",
    bodyPalace: "Body Palace",
    lifePalace: "Life Palace",
    borrowed: "Borrowed from opposite",
    noMajor: "No major star in this palace",
    minor: "Supporting stars",
    adjective: "Additional stars",
    ages: "Ages",
    opposite: "Opposite palace",
    decade: "Decade cycle",
    transformations: "Transformations",
    noTransform: "No separate transformation list was returned; use the markers shown beside the stars.",
    basis: "Calculation basis",
    recordedTime: "Recorded time",
    chartTime: "Time used for chart",
    trueSolar: "True solar time",
    applied: "Applied",
    notApplied: "Not applied",
    place: "Birthplace",
    engine: "Rule engine",
    rule: "Time-period rule",
    warningBoundary: "True-solar-time correction crossed a time-period boundary, so this chart may differ from the uncorrected version.",
    methodTitle: "Why can different websites produce different charts?",
    methodText: "Differences commonly come from solar/lunar conversion, leap months, historical time zones, true solar time, 23:00 versus 00:00 day changes, year boundaries, schools and transformation tables. Hold the birth data constant and compare one rule at a time.",
    separationTitle: "Keep calculation and AI interpretation separate",
    separationText: "The rule engine calculates palaces, stars, transformations and time layers. AI may organize those results, but should not invent an unknown birth time or silently switch the declared rules.",
    nextTitle: "Continue to a fuller interpretation",
    nextText: "Take the chart into the full Huzhong reading flow for themes, strengths and challenges, work and resources, relationships, decade cycles and annual timing.",
    aiCta: "Open full chart reading",
    askCta: "Ask on WhatsApp first",
    disclaimer: "Zi Wei Dou Shu is a traditional cultural interpretation system for reflection and personal reference only. It is not medical, legal, investment or other professional advice.",
    errorGeneric: "The chart could not be created. Please check the birth date, time and place.",
    palaceTheme: "Theme observed in this palace",
    readStars: "Star data",
    shift: "Correction",
    minutes: "minutes",
  },
};

const PALACE_THEME = {
  命宫: ["自我定位、做事方式与人生主轴", "identity, operating style and life direction"],
  兄弟: ["同辈、手足与协作方式", "peers, siblings and collaboration"],
  夫妻: ["亲密关系、承诺与伴侣互动", "intimacy, commitment and partnership"],
  子女: ["子女缘、创造力与作品延伸", "children, creativity and what you create"],
  财帛: ["资源观、收入方式与价值交换", "resources, earning style and value exchange"],
  疾厄: ["身心负荷、压力模式与日常照顾", "stress patterns, capacity and everyday care"],
  迁移: ["外部环境、移动与离开熟悉圈后的表现", "outside environments, movement and life beyond familiar settings"],
  仆役: ["朋友、团队、部属与社会网络", "friends, teams, colleagues and networks"],
  官禄: ["事业角色、责任、成就与社会位置", "career roles, responsibility and public contribution"],
  田宅: ["家宅、资产、空间与安全感", "home, property, space and security"],
  福德: ["内在满足、精神节奏与休息方式", "inner fulfilment, mental rhythm and rest"],
  父母: ["长辈、支持系统、制度与传承", "elders, support systems, institutions and inheritance"],
};

const GRID_POSITIONS = {
  巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4],
  辰: [2, 1], 酉: [2, 4], 卯: [3, 1], 戌: [3, 4],
  寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4],
};

const MUTAGEN_CLASS = { 禄: styles.lu, 权: styles.quan, 科: styles.ke, 忌: styles.ji };

function textValue(value, fallback = "—") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function normalisePalaceName(name = "") {
  return name.endsWith("宫") ? name : `${name}宫`;
}

function Star({ star, major = false, borrowed = false }) {
  if (!star?.name) return null;
  return (
    <span className={`${styles.star} ${major ? styles.majorStar : styles.minorStar} ${borrowed ? styles.borrowedStar : ""}`}>
      <b>{star.name}</b>
      {star.mutagen && <em className={MUTAGEN_CLASS[star.mutagen] || styles.mutagen}>{star.mutagen}</em>}
      {star.brightness && <small>{star.brightness}</small>}
    </span>
  );
}

function PalaceCell({ palace, active, onSelect, c }) {
  if (!palace) return null;
  const position = GRID_POSITIONS[palace.earthlyBranch] || [1, 1];
  const major = palace.majorStarDetails || [];
  const borrowed = palace.borrowedMajorStarDetails || [];
  const minor = (palace.minorStarDetails || []).slice(0, 5);
  return (
    <button
      type="button"
      className={`${styles.palaceCell} ${active ? styles.activePalace : ""} ${palace.isLifePalace ? styles.lifeCell : ""}`}
      style={{ gridRow: position[0], gridColumn: position[1] }}
      onClick={() => onSelect(palace)}
      aria-pressed={active}
    >
      <span className={styles.palaceHead}>
        <strong>{palace.name}</strong>
        <small>{palace.ganZhi}</small>
      </span>
      <span className={styles.palaceTags}>
        {palace.isLifePalace && <i>{c.lifePalace}</i>}
        {palace.isBodyPalace && <i>{c.bodyPalace}</i>}
      </span>
      <span className={styles.cellStars}>
        {major.map((star) => <Star key={`${palace.name}-${star.name}-${star.mutagen}`} star={star} major />)}
        {!major.length && borrowed.map((star) => <Star key={`${palace.name}-borrow-${star.name}`} star={star} major borrowed />)}
        {!major.length && !borrowed.length && <span className={styles.emptyMajor}>{c.noMajor}</span>}
      </span>
      {minor.length > 0 && <span className={styles.cellMinor}>{minor.map((star) => star.name).join(" · ")}</span>}
      <span className={styles.palaceFoot}>
        <small>{palace.decadal || ""}</small>
        {borrowed.length > 0 && <small>{c.borrowed}</small>}
      </span>
    </button>
  );
}

function PreviewChart({ c }) {
  const names = ["命", "兄", "夫", "子", "财", "疾", "迁", "友", "官", "田", "福", "父"];
  return (
    <div className={styles.previewShell} aria-hidden="true">
      <div className={styles.previewGrid}>
        {names.map((name, index) => <span key={name} className={index === 0 ? styles.previewActive : ""}>{name}</span>)}
        <div className={styles.previewCenter}>
          <img src="/brand-logo.png" alt="" />
          <b>{c.previewTitle}</b>
          <small>{c.previewSub}</small>
        </div>
      </div>
    </div>
  );
}

function ChartExperience() {
  const { lang, setLang } = useLang();
  const isZh = lang.startsWith("zh");
  const c = isZh ? COPY.zh : COPY.en;
  const [person, setPerson] = useState(() => emptyPerson());
  const [chart, setChart] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!chart?.palaces?.length) return;
    const life = chart.palaces.find((palace) => palace.isLifePalace) || chart.palaces[0];
    setSelected(life);
  }, [chart]);

  const summaryItems = useMemo(() => {
    if (!chart) return [];
    return [
      [c.fiveClass, chart.fiveElementsClass],
      [c.soul, chart.soul],
      [c.body, chart.body],
      [c.zodiac, chart.zodiac || chart.sign],
      [c.decadal, chart.current?.decadal ? `${chart.current.decadal.name || ""} ${chart.current.decadal.ganZhi || ""}`.trim() : "—"],
      [c.yearly, chart.current?.yearly ? `${chart.current.yearly.name || ""} ${chart.current.yearly.ganZhi || ""}`.trim() : "—"],
    ];
  }, [chart, c]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (person.hourUnknown) throw new Error(isZh ? "紫微斗数需要出生时辰。请先确认时辰，或比较可能的候选时辰。" : "Zi Wei requires a birth time. Confirm it first, or compare plausible time periods.");
      const payload = personPayload(person);
      const response = await fetch("/api/ziwei-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || c.errorGeneric);
      setChart(data.chart);
      try { localStorage.setItem("hztj.lastPerson.v1", JSON.stringify(person)); } catch {}
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (err) {
      setError(err?.message || c.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function resetChart() {
    setChart(null);
    setSelected(null);
    setError("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  const themeKey = normalisePalaceName(selected?.name || "");
  const theme = PALACE_THEME[themeKey] || ["此宫位对应的人生主题", "the life theme represented by this palace"];
  const waMessage = encodeURIComponent(isZh ? "你好，我想咨询壶中天机的紫微斗数命盘解读。" : "Hello, I would like to ask about a Zi Wei Dou Shu chart reading.");

  return (
    <div className={styles.page}>
      <header className={styles.siteHeader}>
        <a href="/" className={styles.logoLink} aria-label="壶中天机">
          <img src="/brand-logo.png" alt="壶中天机 HUZHONG TIANJI" />
        </a>
        <nav className={styles.nav}>
          <a href="/">{c.navHome}</a>
          <a href="/pan?mode=single">{c.navAll}</a>
          <a href="/articles">{c.navArticles}</a>
          <a href={`https://wa.me/6580148899?text=${waMessage}`} target="_blank" rel="noreferrer">{c.navContact}</a>
        </nav>
        <div className={styles.langSwitch} aria-label="Language">
          <button type="button" className={isZh ? styles.langOn : ""} onClick={() => setLang("zh-CN")}>中文</button>
          <button type="button" className={!isZh ? styles.langOn : ""} onClick={() => setLang("en")}>EN</button>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{c.eyebrow}</p>
            <h1><span>{c.titleA}</span>{c.titleB}</h1>
            <p className={styles.lead}>{c.intro}</p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton} onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>{c.start}</button>
              <a className={styles.secondaryButton} href="#method">{c.viewMethod}</a>
            </div>
            <div className={styles.trustStrip}>
              {[c.trust1, c.trust2, c.trust3, c.trust4].map((item) => <span key={item}>✓ {item}</span>)}
            </div>
          </div>
          <PreviewChart c={c} />
        </section>

        <section className={styles.formSection} ref={formRef}>
          <div className={styles.formCard}>
            <p className={styles.eyebrow}>{c.formKicker}</p>
            <h2>{c.formTitle}</h2>
            <p className={styles.formIntro}>{c.formIntro}</p>
            <form onSubmit={submit}>
              <div className={styles.personWrap}><PersonForm value={person} onChange={setPerson} /></div>
              <p className={styles.privacyNote}>🔒 {c.privacy}</p>
              {error && <div className={styles.error} role="alert">{error}</div>}
              <button className={styles.generateButton} type="submit" disabled={loading}>{loading ? c.generating : c.generate}</button>
            </form>
          </div>
          <aside className={styles.beforeCard}>
            <div className={styles.beforeSeal}>天机</div>
            <h3>{c.beforeTitle}</h3>
            <ol>
              <li>{c.before1}</li>
              <li>{c.before2}</li>
              <li>{c.before3}</li>
              <li>{c.before4}</li>
            </ol>
          </aside>
        </section>

        {chart && (
          <section className={styles.resultSection} ref={resultRef}>
            <div className={styles.resultHead}>
              <div>
                <p className={styles.eyebrow}>{c.resultKicker}</p>
                <h2>{c.resultTitle}</h2>
                <p>{c.resultIntro}</p>
              </div>
              <div className={styles.resultActions}>
                <button type="button" onClick={() => window.print()}>{c.print}</button>
                <button type="button" onClick={resetChart}>{c.newChart}</button>
              </div>
            </div>

            <div className={styles.summaryBlock}>
              <h3>{c.summary}</h3>
              <div className={styles.summaryGrid}>
                {summaryItems.map(([label, value]) => (
                  <div key={label}><small>{label}</small><b>{textValue(value)}</b></div>
                ))}
              </div>
            </div>

            {chart.calculation?.solarCorrection?.crossedHourBranch && <div className={styles.boundaryWarning}>⚠ {c.warningBoundary}</div>}

            <div className={styles.chartLayout}>
              <div>
                <p className={styles.chartHint}>{c.palaceHint}</p>
                <div className={styles.chartGrid}>
                  {(chart.palaces || []).map((palace) => (
                    <PalaceCell key={`${palace.name}-${palace.ganZhi}`} palace={palace} active={selected?.ganZhi === palace.ganZhi} onSelect={setSelected} c={c} />
                  ))}
                  <div className={styles.chartCenter}>
                    <img src="/brand-logo.png" alt="壶中天机" />
                    <strong>{chart.chineseDate}</strong>
                    <span>{chart.lunarDate}</span>
                    <div>
                      <small>{chart.fiveElementsClass}</small>
                      <small>{c.soul} {chart.soul}</small>
                      <small>{c.body} {chart.body}</small>
                    </div>
                  </div>
                </div>
              </div>

              {selected && (
                <aside className={styles.palaceDetail}>
                  <div className={styles.detailTitle}>
                    <div><small>{selected.ganZhi}</small><h3>{selected.name}</h3></div>
                    <div className={styles.detailBadges}>
                      {selected.isLifePalace && <span>{c.lifePalace}</span>}
                      {selected.isBodyPalace && <span>{c.bodyPalace}</span>}
                    </div>
                  </div>
                  <div className={styles.themeBox}><small>{c.palaceTheme}</small><p>{isZh ? theme[0] : theme[1]}</p></div>
                  <section className={styles.starSection}>
                    <h4>{c.readStars}</h4>
                    <div className={styles.starGroup}>
                      {(selected.majorStarDetails || []).map((star) => <Star key={`detail-major-${star.name}-${star.mutagen}`} star={star} major />)}
                      {!(selected.majorStarDetails || []).length && (selected.borrowedMajorStarDetails || []).map((star) => <Star key={`detail-borrow-${star.name}`} star={star} major borrowed />)}
                      {!(selected.majorStarDetails || []).length && !(selected.borrowedMajorStarDetails || []).length && <span className={styles.emptyMajor}>{c.noMajor}</span>}
                    </div>
                  </section>
                  {(selected.minorStarDetails || []).length > 0 && <section className={styles.starSection}><h4>{c.minor}</h4><div className={styles.starGroup}>{selected.minorStarDetails.map((star) => <Star key={`detail-minor-${star.name}-${star.mutagen}`} star={star} />)}</div></section>}
                  {(selected.adjectiveStarDetails || []).length > 0 && <section className={styles.starSection}><h4>{c.adjective}</h4><p className={styles.starText}>{selected.adjectiveStarDetails.map((star) => star.name).join(" · ")}</p></section>}
                  <dl className={styles.detailList}>
                    <div><dt>{c.decade}</dt><dd>{selected.decadal || "—"}</dd></div>
                    <div><dt>{c.opposite}</dt><dd>{selected.oppositePalace ? `${selected.oppositePalace.name} · ${selected.oppositePalace.ganZhi}` : "—"}</dd></div>
                    <div><dt>{c.ages}</dt><dd>{selected.ages?.length ? selected.ages.join("、") : "—"}</dd></div>
                  </dl>
                </aside>
              )}
            </div>

            <div className={styles.mutagenBlock}>
              <h3>{c.transformations}</h3>
              {chart.mutagens?.length ? (
                <div className={styles.mutagenGrid}>{chart.mutagens.map((item, index) => (
                  <div key={`${item.star}-${item.mutagen}-${index}`}>
                    <span className={MUTAGEN_CLASS[item.mutagen] || styles.mutagen}>{item.mutagen}</span>
                    <b>{item.star}</b>
                    <small>{item.palace} · {item.ganZhi}</small>
                  </div>
                ))}</div>
              ) : <p className={styles.muted}>{c.noTransform}</p>}
            </div>

            <div className={styles.basisBlock}>
              <h3>{c.basis}</h3>
              <div className={styles.basisGrid}>
                <div><small>{c.recordedTime}</small><b>{chart.calculation?.recordedLocalTime}</b></div>
                <div><small>{c.chartTime}</small><b>{chart.calculation?.chartTime}</b></div>
                <div><small>{c.trueSolar}</small><b>{chart.calculation?.trueSolarTimeApplied ? c.applied : c.notApplied}</b>{chart.calculation?.solarCorrection && <span>{c.shift} {chart.calculation.solarCorrection.shiftMinutes > 0 ? "+" : ""}{chart.calculation.solarCorrection.shiftMinutes} {c.minutes}</span>}</div>
                <div><small>{c.place}</small><b>{chart.calculation?.birthplace || "—"}</b><span>{chart.calculation?.longitude}° · UTC{chart.calculation?.timezoneHours >= 0 ? "+" : ""}{chart.calculation?.timezoneHours}</span></div>
                <div><small>{c.engine}</small><b>{chart.engine?.name} {chart.engine?.version}</b><span>{chart.engine?.ruleVersion}</span></div>
                <div><small>{c.rule}</small><b>{chart.calculation?.hourBranchRule}</b></div>
              </div>
              <p className={styles.methodNote}>{chart.calculation?.note}</p>
            </div>
          </section>
        )}

        <section className={styles.methodSection} id="method">
          <div>
            <p className={styles.eyebrow}>METHOD & EVIDENCE</p>
            <h2>{c.methodTitle}</h2>
            <p>{c.methodText}</p>
          </div>
          <div>
            <p className={styles.eyebrow}>RULE ENGINE ≠ AI</p>
            <h2>{c.separationTitle}</h2>
            <p>{c.separationText}</p>
          </div>
        </section>

        <section className={styles.nextSection}>
          <div><p className={styles.eyebrow}>NEXT STEP</p><h2>{c.nextTitle}</h2><p>{c.nextText}</p></div>
          <div className={styles.nextActions}>
            <a href="/pan?mode=single" className={styles.primaryButton}>{c.aiCta}</a>
            <a href={`https://wa.me/6580148899?text=${waMessage}`} target="_blank" rel="noreferrer" className={styles.secondaryButton}>{c.askCta}</a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <img src="/brand-logo.png" alt="壶中天机 HUZHONG TIANJI" />
        <p>{c.disclaimer}</p>
        <div><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="https://wa.me/6580148899" target="_blank" rel="noreferrer">+65 8014 8899</a></div>
      </footer>
    </div>
  );
}

export default function ZiweiChartClient() {
  return <LangProvider><ChartExperience /></LangProvider>;
}
