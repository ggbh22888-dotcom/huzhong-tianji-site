"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PersonForm, { emptyPerson, personPayload } from "@/app/components/PersonForm";
import { useLang } from "@/app/components/Lang";
import styles from "./ziwei-chart.module.css";

const LAST_PERSON_KEY = "hztj.lastPerson.v1";
const PALACE_POSITION = {
  巳: "1 / 1", 午: "1 / 2", 未: "1 / 3", 申: "1 / 4",
  辰: "2 / 1", 酉: "2 / 4", 卯: "3 / 1", 戌: "3 / 4",
  寅: "4 / 1", 丑: "4 / 2", 子: "4 / 3", 亥: "4 / 4",
};
const MUTAGEN_CLASS = { 禄: "luck", 权: "power", 科: "honor", 忌: "challenge" };

const COPY = {
  zh: {
    home: "首页",
    fullReading: "综合排盘",
    articles: "壶中文章",
    eyebrow: "HU ZHONG ZI WEI",
    title: "壶中紫微命盘",
    lead: "先把命盘事实、计算依据和解读分开。输入出生资料，查看命宫、身宫、十二宫、主星、四化与大限背景。",
    feature1: "规则引擎排盘",
    feature2: "十二宫可点击",
    feature3: "真太阳时依据透明",
    feature4: "AI 解读独立进行",
    formTitle: "建立你的紫微命盘",
    formLead: "请使用有记录的出生日期、当地时间、出生地点与性别。紫微斗数依赖时辰，不会用正午代替未知时辰。",
    generate: "建立紫微命盘",
    generating: "正在排盘…",
    useLast: "使用上次资料",
    localNote: "成功排盘后，出生资料只保存在你的浏览器本机，方便下次使用。",
    hourRequired: "紫微斗数需要出生时辰。时辰不详时，请先确认候选时辰，不要直接填正午或午夜。",
    resultEyebrow: "DETERMINISTIC CHART",
    resultTitle: "命盘事实层",
    resultLead: "以下宫位、星曜、四化和时间层由规则引擎计算；后续文字解读不应改写这些结果。",
    lunar: "农历资料",
    fiveElements: "五行局",
    masters: "命主 · 身主",
    zodiac: "生肖 · 星座",
    lifePalace: "命宫",
    bodyPalace: "身宫",
    borrowed: "借对宫主星",
    noMajor: "本宫无十四主星",
    palaceDetail: "宫位详情",
    opposite: "对宫",
    decadal: "大限",
    ages: "流年年龄",
    majorStars: "主星",
    minorStars: "辅星",
    otherStars: "其他星曜",
    none: "未显示",
    transformations: "生年四化",
    transformationLead: "四化显示星曜在本命盘中的结构角色，不应单独被解释为必然事件。",
    currentTiming: "当前时间层",
    nominalAge: "虚岁",
    currentDecade: "当前大限",
    currentYear: "当前流年",
    calculation: "排盘依据",
    recordedTime: "记录时间",
    chartTime: "实际用于排盘",
    trueSolar: "真太阳时",
    applied: "已采用",
    notApplied: "未采用",
    birthplace: "出生地点",
    longitude: "经度／时区",
    engine: "计算引擎",
    rules: "规则说明",
    crossedBoundary: "校正后跨过时辰边界，命盘可能因此改变。",
    noBoundary: "校正未跨过时辰边界，因此时辰索引保持不变。",
    limitationTitle: "当前版本的边界",
    limitation: "不同流派可能采用不同四化表、年界、闰月与换日规则。当前页面会显示采用的设置，方便比较，但不会声称这是唯一正确的排法。农历闰月资料建议优先使用可靠公历记录核对。",
    aiTitle: "下一步：解释，而不是重排",
    aiLead: "完整解读应引用已经排出的宫位、主星、四化与时间层，并把传统命理判断、现实事实和行动建议分开。",
    aiButton: "进入壶中综合解读",
    whatsapp: "WhatsApp 咨询",
    disclaimer: "紫微斗数属于传统文化解释体系，适合用于自我观察与讨论，不替代医疗、法律、投资或其他专业意见。",
    language: "EN",
  },
  en: {
    home: "Home",
    fullReading: "Full Reading",
    articles: "Articles",
    eyebrow: "HU ZHONG ZI WEI",
    title: "Hu Zhong Zi Wei Chart",
    lead: "Keep chart facts, calculation settings, and interpretation separate. Enter recorded birth details to view the Life Palace, Body Palace, twelve palaces, stars, transformations and decade context.",
    feature1: "Rule-based calculation",
    feature2: "Interactive palaces",
    feature3: "Transparent solar-time basis",
    feature4: "AI interpretation stays separate",
    formTitle: "Build your Zi Wei chart",
    formLead: "Use a recorded birth date, local time, place and gender. Zi Wei depends on birth hour, so an unknown hour will not be replaced with noon.",
    generate: "Build Zi Wei Chart",
    generating: "Calculating…",
    useLast: "Use previous details",
    localNote: "After a successful calculation, birth details are stored only in this browser for convenient reuse.",
    hourRequired: "Zi Wei requires a birth hour. When the hour is unknown, compare plausible time ranges instead of inserting noon or midnight.",
    resultEyebrow: "DETERMINISTIC CHART",
    resultTitle: "Chart facts",
    resultLead: "The palaces, stars, transformations and timing layers below are calculated by the rule engine. Later interpretation should not rewrite them.",
    lunar: "Lunar date",
    fiveElements: "Five-element class",
    masters: "Life · Body masters",
    zodiac: "Zodiac · Sign",
    lifePalace: "Life Palace",
    bodyPalace: "Body Palace",
    borrowed: "Borrowed opposite stars",
    noMajor: "No major star in this palace",
    palaceDetail: "Palace details",
    opposite: "Opposite",
    decadal: "Decade",
    ages: "Annual ages",
    majorStars: "Major stars",
    minorStars: "Supporting stars",
    otherStars: "Other stars",
    none: "Not shown",
    transformations: "Natal transformations",
    transformationLead: "Transformations describe structural roles in this chart; they should not be treated as guaranteed events on their own.",
    currentTiming: "Current timing layers",
    nominalAge: "Nominal age",
    currentDecade: "Current decade",
    currentYear: "Current year",
    calculation: "Calculation basis",
    recordedTime: "Recorded time",
    chartTime: "Time used for chart",
    trueSolar: "True solar time",
    applied: "Applied",
    notApplied: "Not applied",
    birthplace: "Birthplace",
    longitude: "Longitude / time zone",
    engine: "Engine",
    rules: "Rule note",
    crossedBoundary: "The correction crossed a two-hour branch boundary, so the chart may change.",
    noBoundary: "The correction did not cross a branch boundary, so the hour index stayed the same.",
    limitationTitle: "Current scope and limits",
    limitation: "Schools may use different transformation tables, year boundaries, leap-month rules and day-change conventions. This page exposes its current settings for comparison and does not present one convention as the only valid method. For leap-month births, verify against a reliable Gregorian record where possible.",
    aiTitle: "Next: interpret, do not recalculate",
    aiLead: "A complete reading should cite the calculated palaces, stars, transformations and timing layers, while separating traditional interpretation, real-world facts and practical suggestions.",
    aiButton: "Open Hu Zhong Full Reading",
    whatsapp: "Ask on WhatsApp",
    disclaimer: "Zi Wei Dou Shu is a traditional interpretive system for reflection and discussion. It is not medical, legal, investment or other professional advice.",
    language: "中文",
  },
};

function copyFor(lang) {
  return lang?.startsWith("zh") ? COPY.zh : COPY.en;
}

function StarChip({ star, compact = false }) {
  if (!star?.name) return null;
  const tone = MUTAGEN_CLASS[star.mutagen];
  return (
    <span className={`${styles.starChip} ${compact ? styles.starCompact : ""} ${tone ? styles[tone] : ""}`}>
      <b>{star.name}</b>
      {star.brightness && <small>{star.brightness}</small>}
      {star.mutagen && <em>化{star.mutagen}</em>}
    </span>
  );
}

function PalaceCell({ palace, selected, onSelect, t }) {
  const major = palace.majorStarDetails || [];
  const borrowed = palace.borrowedMajorStarDetails || [];
  return (
    <button
      type="button"
      className={`${styles.palaceCell} ${selected ? styles.selectedPalace : ""} ${palace.isLifePalace ? styles.lifePalace : ""}`}
      style={{ gridArea: PALACE_POSITION[palace.earthlyBranch] }}
      onClick={() => onSelect(palace.name)}
      aria-pressed={selected}
    >
      <span className={styles.palaceHead}>
        <b>{palace.name}</b>
        <span>{palace.ganZhi}</span>
      </span>
      <span className={styles.palaceStars}>
        {major.length > 0
          ? major.slice(0, 4).map((star, index) => <StarChip key={`${star.name}-${index}`} star={star} compact />)
          : borrowed.slice(0, 3).map((star, index) => <StarChip key={`${star.name}-${index}`} star={star} compact />)}
        {major.length === 0 && borrowed.length === 0 && <span className={styles.emptyStar}>{t.noMajor}</span>}
      </span>
      <span className={styles.palaceFoot}>
        <span>{palace.isBodyPalace ? `身宫 · ${palace.decadal || ""}` : palace.decadal || ""}</span>
        {major.length === 0 && borrowed.length > 0 && <i>{t.borrowed}</i>}
      </span>
    </button>
  );
}

function StarGroup({ title, stars, emptyText }) {
  return (
    <div className={styles.starGroup}>
      <h4>{title}</h4>
      <div className={styles.starList}>
        {stars?.length ? stars.map((star, index) => <StarChip key={`${star.name}-${index}`} star={star} />) : <span className={styles.muted}>{emptyText}</span>}
      </div>
    </div>
  );
}

function ValueCard({ label, children }) {
  return (
    <div className={styles.valueCard}>
      <small>{label}</small>
      <b>{children || "—"}</b>
    </div>
  );
}

export default function ZiweiChartClient() {
  const { lang, setLang } = useLang();
  const t = copyFor(lang);
  const [person, setPerson] = useState(() => emptyPerson({ year: 1990, month: 1, day: 1, hour: 12, minute: 0, gender: "女" }));
  const [chart, setChart] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLast, setHasLast] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    try { setHasLast(Boolean(localStorage.getItem(LAST_PERSON_KEY))); } catch {}
  }, []);

  const selectedPalace = useMemo(() => {
    if (!chart?.palaces?.length) return null;
    return chart.palaces.find((palace) => palace.name === selectedName)
      || chart.palaces.find((palace) => palace.isLifePalace)
      || chart.palaces[0];
  }, [chart, selectedName]);

  const lifePalace = chart?.palaces?.find((palace) => palace.isLifePalace);
  const bodyPalace = chart?.palaces?.find((palace) => palace.isBodyPalace);

  function loadLast() {
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_PERSON_KEY));
      if (saved) setPerson({ ...emptyPerson(), ...saved });
    } catch {}
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setChart(null);
    if (person.hourUnknown) {
      setError(t.hourRequired);
      return;
    }

    setLoading(true);
    try {
      const payload = personPayload(person);
      const response = await fetch("/api/ziwei-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to calculate chart.");
      setChart(data.chart);
      const life = data.chart?.palaces?.find((palace) => palace.isLifePalace);
      setSelectedName(life?.name || data.chart?.palaces?.[0]?.name || "");
      try {
        localStorage.setItem(LAST_PERSON_KEY, JSON.stringify(person));
        setHasLast(true);
      } catch {}
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (caught) {
      setError(caught?.message || "Unable to calculate chart.");
    } finally {
      setLoading(false);
    }
  }

  const whatsappText = encodeURIComponent(lang?.startsWith("zh")
    ? "你好，我想了解壶中紫微命盘与完整解读。"
    : "Hello, I would like to learn more about the Hu Zhong Zi Wei chart and full reading.");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="壶中天机">
          <img src="/brand-logo.png" alt="壶中天机 HUZHONG TIANJI" />
        </a>
        <nav className={styles.nav}>
          <a href="/">{t.home}</a>
          <a href="/pan?mode=single">{t.fullReading}</a>
          <a href="/articles">{t.articles}</a>
          <button type="button" onClick={() => setLang(lang?.startsWith("zh") ? "en" : "zh-CN")}>{t.language}</button>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className={styles.lead}>{t.lead}</p>
          <div className={styles.featureRow}>
            {[t.feature1, t.feature2, t.feature3, t.feature4].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className={styles.heroDiagram} aria-hidden="true">
          <div className={styles.orbitOne} />
          <div className={styles.orbitTwo} />
          <div className={styles.heroSeal}>紫<br />微</div>
          <span className={styles.starA}>✦</span>
          <span className={styles.starB}>✧</span>
          <span className={styles.starC}>✦</span>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formIntro}>
          <p className={styles.sectionNumber}>01</p>
          <h2>{t.formTitle}</h2>
          <p>{t.formLead}</p>
        </div>
        <form className={styles.formCard} onSubmit={submit}>
          <PersonForm value={person} onChange={setPerson} />
          {hasLast && <button className={styles.secondaryButton} type="button" onClick={loadLast}>{t.useLast}</button>}
          {error && <div className={styles.error} role="alert">{error}</div>}
          <button className={styles.primaryButton} type="submit" disabled={loading}>
            {loading ? t.generating : t.generate}
          </button>
          <p className={styles.localNote}>{t.localNote}</p>
        </form>
      </section>

      {chart && (
        <section className={styles.resultSection} ref={resultRef}>
          <div className={styles.resultHeading}>
            <div>
              <p className={styles.eyebrow}>{t.resultEyebrow}</p>
              <h2>{t.resultTitle}</h2>
              <p>{t.resultLead}</p>
            </div>
            <span className={styles.engineBadge}>{chart.engine?.name || "iztro"} · {chart.engine?.ruleVersion || "v1"}</span>
          </div>

          <div className={styles.valueGrid}>
            <ValueCard label={t.lunar}>{chart.lunarDate}</ValueCard>
            <ValueCard label={t.fiveElements}>{chart.fiveElementsClass}</ValueCard>
            <ValueCard label={t.masters}>{chart.soul} · {chart.body}</ValueCard>
            <ValueCard label={t.zodiac}>{chart.zodiac} · {chart.sign}</ValueCard>
          </div>

          <div className={styles.chartLayout}>
            <div className={styles.chartScroll}>
              <div className={styles.chartGrid}>
                {chart.palaces.map((palace) => (
                  <PalaceCell
                    key={palace.ganZhi}
                    palace={palace}
                    selected={selectedPalace?.name === palace.name}
                    onSelect={setSelectedName}
                    t={t}
                  />
                ))}
                <div className={styles.chartCenter}>
                  <img src="/brand-logo.png" alt="" />
                  <b>{chart.chineseDate}</b>
                  <span>{chart.lunarDate}</span>
                  <div>
                    <small>{t.lifePalace}</small><strong>{lifePalace?.ganZhi || "—"}</strong>
                    <small>{t.bodyPalace}</small><strong>{bodyPalace?.name || "—"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {selectedPalace && (
              <aside className={styles.palaceDetail}>
                <div className={styles.detailHead}>
                  <div>
                    <small>{t.palaceDetail}</small>
                    <h3>{selectedPalace.name}</h3>
                  </div>
                  <span>{selectedPalace.ganZhi}{selectedPalace.isBodyPalace ? " · 身宫" : ""}</span>
                </div>
                <div className={styles.detailFacts}>
                  <span><small>{t.opposite}</small><b>{selectedPalace.oppositePalace?.name || "—"}</b></span>
                  <span><small>{t.decadal}</small><b>{selectedPalace.decadal || "—"}</b></span>
                  <span><small>{t.ages}</small><b>{selectedPalace.ages?.slice(0, 6).join("、") || "—"}</b></span>
                </div>
                <StarGroup title={t.majorStars} stars={selectedPalace.majorStarDetails} emptyText={t.noMajor} />
                {!selectedPalace.majorStarDetails?.length && selectedPalace.borrowedMajorStarDetails?.length > 0 && (
                  <StarGroup title={t.borrowed} stars={selectedPalace.borrowedMajorStarDetails} emptyText={t.none} />
                )}
                <StarGroup title={t.minorStars} stars={selectedPalace.minorStarDetails} emptyText={t.none} />
                <StarGroup title={t.otherStars} stars={selectedPalace.adjectiveStarDetails} emptyText={t.none} />
              </aside>
            )}
          </div>

          <div className={styles.lowerGrid}>
            <article className={styles.panel}>
              <p className={styles.sectionNumber}>02</p>
              <h3>{t.transformations}</h3>
              <p>{t.transformationLead}</p>
              <div className={styles.mutagenGrid}>
                {chart.mutagens?.length ? chart.mutagens.map((item, index) => (
                  <div className={`${styles.mutagenCard} ${styles[MUTAGEN_CLASS[item.mutagen]] || ""}`} key={`${item.star}-${item.mutagen}-${index}`}>
                    <small>化{item.mutagen}</small>
                    <b>{item.star}{item.brightness || ""}</b>
                    <span>{item.palace} · {item.ganZhi}</span>
                  </div>
                )) : <span className={styles.muted}>{t.none}</span>}
              </div>
            </article>

            <article className={styles.panel}>
              <p className={styles.sectionNumber}>03</p>
              <h3>{t.currentTiming}</h3>
              <div className={styles.timingList}>
                <span><small>{t.nominalAge}</small><b>{chart.current?.nominalAge || "—"}</b></span>
                <span><small>{t.currentDecade}</small><b>{chart.current?.decadal ? `${chart.current.decadal.name} ${chart.current.decadal.ganZhi}` : "—"}</b><em>{chart.current?.decadal?.palace || ""}</em></span>
                <span><small>{t.currentYear}</small><b>{chart.current?.yearly ? `${chart.current.yearly.name} ${chart.current.yearly.ganZhi}` : "—"}</b><em>{chart.current?.yearly?.palace || ""}</em></span>
              </div>
            </article>
          </div>

          <article className={styles.methodPanel}>
            <p className={styles.sectionNumber}>04</p>
            <h3>{t.calculation}</h3>
            <div className={styles.methodGrid}>
              <span><small>{t.recordedTime}</small><b>{chart.calculation?.recordedLocalTime}</b></span>
              <span><small>{t.chartTime}</small><b>{chart.calculation?.chartTime}</b></span>
              <span><small>{t.trueSolar}</small><b>{chart.calculation?.trueSolarTimeApplied ? t.applied : t.notApplied}</b></span>
              <span><small>{t.birthplace}</small><b>{chart.calculation?.birthplace || "—"}</b></span>
              <span><small>{t.longitude}</small><b>{chart.calculation?.longitude}° · UTC{chart.calculation?.timezoneHours >= 0 ? "+" : ""}{chart.calculation?.timezoneHours}</b></span>
              <span><small>{t.engine}</small><b>{chart.engine?.name} {chart.engine?.version}</b></span>
            </div>
            {chart.calculation?.solarCorrection && (
              <div className={styles.boundaryNote}>
                {chart.calculation.solarCorrection.crossedHourBranch ? t.crossedBoundary : t.noBoundary}
                <b>{chart.calculation.solarCorrection.shiftMinutes > 0 ? "+" : ""}{chart.calculation.solarCorrection.shiftMinutes} min</b>
              </div>
            )}
            <details className={styles.rules}>
              <summary>{t.rules}</summary>
              <p>{chart.calculation?.hourBranchRule}</p>
              <p>{chart.calculation?.note}</p>
              <h4>{t.limitationTitle}</h4>
              <p>{t.limitation}</p>
            </details>
          </article>

          <article className={styles.aiPanel}>
            <div>
              <p className={styles.sectionNumber}>05</p>
              <h3>{t.aiTitle}</h3>
              <p>{t.aiLead}</p>
            </div>
            <div className={styles.ctaRow}>
              <a className={styles.primaryButton} href="/pan?mode=single">{t.aiButton}</a>
              <a className={styles.secondaryButton} href={`https://wa.me/6580148899?text=${whatsappText}`} target="_blank" rel="noreferrer">{t.whatsapp}</a>
            </div>
          </article>

          <p className={styles.disclaimer}>{t.disclaimer}</p>
        </section>
      )}
    </main>
  );
}
