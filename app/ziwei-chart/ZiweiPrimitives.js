"use client";

import styles from "./ZiweiResult.module.css";

export const GRID_POSITIONS = [
  { branch: "巳", column: 1, row: 1 },
  { branch: "午", column: 2, row: 1 },
  { branch: "未", column: 3, row: 1 },
  { branch: "申", column: 4, row: 1 },
  { branch: "辰", column: 1, row: 2 },
  { branch: "酉", column: 4, row: 2 },
  { branch: "卯", column: 1, row: 3 },
  { branch: "戌", column: 4, row: 3 },
  { branch: "寅", column: 1, row: 4 },
  { branch: "丑", column: 2, row: 4 },
  { branch: "子", column: 3, row: 4 },
  { branch: "亥", column: 4, row: 4 },
];

export function transformationClass(mutagen) {
  if (mutagen === "禄") return styles.mutagenLu;
  if (mutagen === "权") return styles.mutagenQuan;
  if (mutagen === "科") return styles.mutagenKe;
  if (mutagen === "忌") return styles.mutagenJi;
  return styles.mutagen;
}

export function StarBadge({ star, compact = false }) {
  if (!star?.name) return null;
  return (
    <span className={`${styles.starBadge} ${compact ? styles.starBadgeCompact : ""}`}>
      <b>{star.name}</b>
      {star.brightness && <small>{star.brightness}</small>}
      {star.mutagen && (
        <em className={transformationClass(star.mutagen)}>化{star.mutagen}</em>
      )}
    </span>
  );
}

export function SummaryItem({ label, value, accent = false }) {
  return (
    <div className={`${styles.summaryItem} ${accent ? styles.summaryAccent : ""}`}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}
