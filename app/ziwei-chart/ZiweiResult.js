"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ZiweiResult.module.css";
import ZiweiChartBoard from "./ZiweiChartBoard";
import { SummaryItem } from "./ZiweiPrimitives";
import ZiweiTabs from "./ZiweiTabs";

export default function ZiweiResult({ chart, language, copy, onReset }) {
  const initialPalace =
    chart.palaces.find((palace) => palace.isSoulPalace)?.name ||
    chart.palaces[0]?.name ||
    "";
  const [selectedPalaceName, setSelectedPalaceName] = useState(initialPalace);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setSelectedPalaceName(initialPalace);
    setActiveTab("overview");
  }, [initialPalace]);

  const selectedPalace = useMemo(() => {
    if (!chart?.palaces?.length) return null;
    return (
      chart.palaces.find((palace) => palace.name === selectedPalaceName) ||
      chart.palaces.find((palace) => palace.isSoulPalace) ||
      chart.palaces[0]
    );
  }, [chart, selectedPalaceName]);

  return (
    <section className={styles.resultSection} id="ziwei-result">
      <div className={styles.resultHeading}>
        <div>
          <p className={styles.kicker}>{copy.resultKicker}</p>
          <h2>{chart.name ? `${chart.name} · ` : ""}{copy.resultTitle}</h2>
          <p>{chart.gender} · {chart.birthplace || "—"} · {chart.chineseDate}</p>
        </div>
        <div className={styles.resultActions}>
          <button type="button" onClick={() => window.print()}>
            {language === "zh" ? "打印／存 PDF" : "Print / Save PDF"}
          </button>
          <button type="button" onClick={onReset}>
            {language === "zh" ? "重新排盘" : "New chart"}
          </button>
        </div>
      </div>

      <div className={styles.timeDisclosure}>
        <div>
          <span>{copy.recorded}</span>
          <b>{chart.birth.recorded}</b>
        </div>
        <div>
          <span>{copy.used}</span>
          <b>{chart.birth.used}</b>
        </div>
        <div>
          <span>{copy.corrected}</span>
          <b>
            {chart.birth.solarCorrection
              ? `${chart.birth.solarCorrection.shiftMinutes > 0 ? "+" : ""}${chart.birth.solarCorrection.shiftMinutes} min`
              : copy.noCorrection}
          </b>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <SummaryItem label={copy.soul} value={chart.soul} />
        <SummaryItem label={copy.body} value={chart.body} />
        <SummaryItem label={copy.elementClass} value={chart.fiveElementsClass} accent />
        <SummaryItem
          label={copy.currentDecade}
          value={`${chart.current.decadal.name || "—"} ${chart.current.decadal.ganZhi || ""}`}
        />
        <SummaryItem
          label={copy.currentYear}
          value={`${chart.current.yearly.name || "—"} ${chart.current.yearly.ganZhi || ""}`}
        />
      </div>

      <ZiweiChartBoard
        chart={chart}
        copy={copy}
        selectedPalace={selectedPalace}
        setSelectedPalaceName={setSelectedPalaceName}
      />

      <ZiweiTabs
        chart={chart}
        language={language}
        copy={copy}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className={styles.ctaPanel}>
        <div>
          <p className={styles.kicker}>NEXT STEP</p>
          <h3>{copy.ctaTitle}</h3>
          <p>{copy.ctaText}</p>
        </div>
        <div>
          <a href="/pan">{copy.ctaReading}</a>
          <a
            className={styles.whatsapp}
            href={`https://wa.me/6580148899?text=${encodeURIComponent(
              language === "zh"
                ? "你好，我刚完成壶中紫微排盘，想了解适合我的深度解读。"
                : "Hello, I have completed my Hu Zhong Zi Wei chart and would like to ask about a deeper reading."
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            {copy.ctaWhatsapp}
          </a>
        </div>
      </div>
    </section>
  );
}
