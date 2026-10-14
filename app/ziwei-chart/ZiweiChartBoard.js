"use client";

import styles from "./ZiweiResult.module.css";
import { GRID_POSITIONS, StarBadge } from "./ZiweiPrimitives";

export default function ZiweiChartBoard({
  chart,
  copy,
  selectedPalace,
  setSelectedPalaceName,
}) {
  return (
    <div className={styles.chartLayout}>
      <div className={styles.chartScroller}>
        <div className={styles.palaceGrid}>
          {GRID_POSITIONS.map((position) => {
            const palace = chart.palaces.find(
              (item) => item.earthlyBranch === position.branch
            );
            if (!palace) return null;
            const selected = selectedPalace?.name === palace.name;
            return (
              <button
                type="button"
                key={position.branch}
                className={[
                  styles.palaceCell,
                  selected ? styles.palaceSelected : "",
                  palace.isSoulPalace ? styles.soulPalace : "",
                  palace.isBodyPalace ? styles.bodyPalace : "",
                ].join(" ")}
                style={{
                  gridColumn: position.column,
                  gridRow: position.row,
                }}
                onClick={() => setSelectedPalaceName(palace.name)}
              >
                <div className={styles.palaceTop}>
                  <b>{palace.name}</b>
                  <span>{palace.ganZhi}</span>
                </div>
                <div className={styles.cellStars}>
                  {palace.majorStarDetails.length ? (
                    palace.majorStarDetails.map((star) => (
                      <StarBadge key={`${palace.name}-${star.name}`} star={star} compact />
                    ))
                  ) : (
                    <em className={styles.empty}>{copy.emptyPalace}</em>
                  )}
                </div>
                <div className={styles.palaceBottom}>
                  <span>{palace.decadal || "—"}</span>
                  <span>
                    {palace.isSoulPalace ? "命" : ""}
                    {palace.isBodyPalace ? "身" : ""}
                  </span>
                </div>
              </button>
            );
          })}

          <div className={styles.chartCenter}>
            <img src="/brand-logo.png" alt="" />
            <p>壶中紫微</p>
            <strong>{chart.chineseDate}</strong>
            <span>{chart.lunarDate}</span>
            <div>
              {chart.fiveElementsClass} · 命主{chart.soul} · 身主{chart.body}
            </div>
            <small>{copy.selectPalace}</small>
          </div>
        </div>
      </div>

      {selectedPalace && (
        <aside className={styles.palaceDetail}>
          <div className={styles.detailHeading}>
            <div>
              <span>{selectedPalace.ganZhi}</span>
              <h3>{selectedPalace.name}</h3>
            </div>
            <div className={styles.detailTags}>
              {selectedPalace.isSoulPalace && <b>命宫</b>}
              {selectedPalace.isBodyPalace && <b>身宫</b>}
            </div>
          </div>

          <div className={styles.detailBlock}>
            <h4>{copy.majorStars}</h4>
            <div className={styles.starList}>
              {selectedPalace.majorStarDetails.length ? (
                selectedPalace.majorStarDetails.map((star) => (
                  <StarBadge key={`detail-major-${star.name}`} star={star} />
                ))
              ) : (
                <span className={styles.empty}>{copy.emptyPalace}</span>
              )}
            </div>
          </div>

          <div className={styles.detailBlock}>
            <h4>{copy.minorStars}</h4>
            <div className={styles.minorList}>
              {selectedPalace.minorStarDetails.length
                ? selectedPalace.minorStarDetails.map((star) => (
                    <StarBadge key={`detail-minor-${star.name}`} star={star} />
                  ))
                : "—"}
            </div>
          </div>

          <details className={styles.moreStars}>
            <summary>{copy.adjectiveStars}</summary>
            <div className={styles.minorList}>
              {selectedPalace.adjectiveStarDetails.length
                ? selectedPalace.adjectiveStarDetails.map((star) => (
                    <StarBadge key={`detail-extra-${star.name}`} star={star} />
                  ))
                : "—"}
            </div>
          </details>

          <div className={styles.decadeBox}>
            <span>{copy.palaceDecade}</span>
            <b>{selectedPalace.decadal || "—"}</b>
          </div>
          <p className={styles.structureNote}>{copy.structureNote}</p>
        </aside>
      )}
    </div>
  );
}
