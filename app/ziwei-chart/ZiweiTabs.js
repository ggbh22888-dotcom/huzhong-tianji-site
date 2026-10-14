"use client";

import styles from "./ZiweiResult.module.css";
import {
  StarBadge,
  SummaryItem,
  transformationClass,
} from "./ZiweiPrimitives";

export default function ZiweiTabs({
  chart,
  language,
  copy,
  activeTab,
  setActiveTab,
}) {
  return (
    <>
      <div className={styles.tabs}>
        {[
          ["overview", copy.tabOverview],
          ["palaces", copy.tabPalaces],
          ["timing", copy.tabTiming],
          ["rules", copy.tabRules],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={activeTab === key ? styles.tabActive : ""}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tabPanel}>
        {activeTab === "overview" && (
          <div>
            <div className={styles.overviewCards}>
              <SummaryItem label={copy.soul} value={chart.soul} />
              <SummaryItem label={copy.body} value={chart.body} />
              <SummaryItem label={copy.elementClass} value={chart.fiveElementsClass} accent />
              <SummaryItem
                label={copy.currentDecade}
                value={`${chart.current.decadal.name || "—"} · ${chart.current.decadal.palace || "—"}`}
              />
            </div>
            <h3>{copy.transformation}</h3>
            {chart.transformations.length ? (
              <div className={styles.transformationGrid}>
                {chart.transformations.map((item, index) => (
                  <article key={`${item.star}-${item.palace}-${index}`}>
                    <em className={transformationClass(item.mutagen)}>
                      化{item.mutagen}
                    </em>
                    <b>{item.star}</b>
                    <span>{item.palace} · {item.branch}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>{copy.noTransformation}</p>
            )}
          </div>
        )}

        {activeTab === "palaces" && (
          <div>
            <h3>{copy.palaceFacts}</h3>
            <div className={styles.palaceCards}>
              {chart.palaces.map((palace) => (
                <article key={`card-${palace.name}`}>
                  <header>
                    <div>
                      <span>{palace.ganZhi}</span>
                      <h4>{palace.name}</h4>
                    </div>
                    <small>{palace.decadal || "—"}</small>
                  </header>
                  <div className={styles.starList}>
                    {palace.majorStarDetails.length
                      ? palace.majorStarDetails.map((star) => (
                          <StarBadge key={`${palace.name}-${star.name}-card`} star={star} compact />
                        ))
                      : <em className={styles.empty}>{copy.emptyPalace}</em>}
                  </div>
                  <p>
                    {palace.minorStarDetails.map((star) => star.name).join(" · ") || "—"}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === "timing" && (
          <div>
            <h3>{copy.timingTitle}</h3>
            <p className={styles.muted}>{copy.timingText}</p>
            <div className={styles.timingGrid}>
              <article>
                <span>{copy.decade}</span>
                <h4>{chart.current.decadal.name || "—"}</h4>
                <b>{chart.current.decadal.ganZhi || "—"}</b>
                <p>{chart.current.decadal.palace || "—"}</p>
                <div>
                  {(chart.current.decadal.mutagen || []).map((item, index) => (
                    <small key={`d-${index}`}>{String(item)}</small>
                  ))}
                </div>
              </article>
              <article>
                <span>{copy.yearly}</span>
                <h4>{chart.current.yearly.name || "—"}</h4>
                <b>{chart.current.yearly.ganZhi || "—"}</b>
                <p>{chart.current.yearly.palace || "—"}</p>
                <div>
                  {(chart.current.yearly.mutagen || []).map((item, index) => (
                    <small key={`y-${index}`}>{String(item)}</small>
                  ))}
                </div>
              </article>
              <article>
                <span>{copy.asOf}</span>
                <h4>{chart.current.asOf}</h4>
                <b>{chart.current.nominalAge ? `${chart.current.nominalAge}岁` : "—"}</b>
                <p>{language === "zh" ? "按今日日期返回" : "Based on today's date"}</p>
              </article>
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div>
            <h3>{copy.ruleTitle}</h3>
            <dl className={styles.rulesList}>
              <div><dt>{copy.ruleEngine}</dt><dd>{chart.calculation.engine}</dd></div>
              <div><dt>{copy.ruleBasis}</dt><dd>{chart.calculation.chartBasis}</dd></div>
              <div><dt>{copy.ruleBoundary}</dt><dd>{chart.calculation.dayBoundary}</dd></div>
              <div><dt>{copy.ruleLunar}</dt><dd>{chart.calculation.leapMonthRule}</dd></div>
              <div><dt>{copy.ruleSeparate}</dt><dd>{copy.ruleSeparateText}</dd></div>
            </dl>
            {chart.birth.solarCorrection && (
              <div className={styles.correctionCard}>
                <b>{copy.corrected}</b>
                <span>
                  {chart.birth.solarCorrection.clockTime} → {chart.birth.solarCorrection.trueSolarTime}
                </span>
                <small>
                  {chart.birth.solarCorrection.crossedHourBranch
                    ? language === "zh"
                      ? "校正跨过时辰或日期边界，本盘可能与未校正结果不同。"
                      : "The correction crossed a time or date boundary, so the chart may differ."
                    : language === "zh"
                      ? "校正未跨过时辰边界。"
                      : "The correction did not cross a time-branch boundary."}
                </small>
              </div>
            )}
            <div className={styles.limitations}>
              <h4>{copy.limitationTitle}</h4>
              <p>{copy.limitationText}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
