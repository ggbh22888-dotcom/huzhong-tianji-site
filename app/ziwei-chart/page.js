import ZiweiChartClient from "./ZiweiChartClient";

export const metadata = {
  title: "免费紫微斗数排盘｜十二宫、主星与四化 · 壶中天机",
  description:
    "输入出生日期、当地时间、出生地点与性别，建立紫微斗数命盘，查看命宫、身宫、十二宫、主星、四化、大限及排盘依据。",
  alternates: { canonical: "https://huzhongtianji.com/ziwei-chart" },
  openGraph: {
    title: "免费紫微斗数排盘 · 壶中天机",
    description: "查看十二宫、主星、四化、大限与清楚列出的排盘依据。",
    url: "https://huzhongtianji.com/ziwei-chart",
    images: ["https://huzhongtianji.netlify.app/brand-logo.png"],
  },
};

export default function ZiweiChartPage() {
  return <ZiweiChartClient />;
}
