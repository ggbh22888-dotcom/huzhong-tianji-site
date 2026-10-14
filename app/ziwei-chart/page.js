import ZiweiChartClient from "./ZiweiChartClient";

export const metadata = {
  title: "免费紫微斗数排盘｜十二宫、主星、四化与大限｜壶中天机",
  description:
    "输入出生日期、当地时间、地点与性别，建立壶中天机紫微命盘。清楚查看命宫、身宫、十二宫、主星、四化、大限与流年，并区分命盘事实与后续解读。",
  alternates: {
    canonical: "https://huzhongtianji.netlify.app/ziwei-chart",
  },
  openGraph: {
    title: "壶中紫微｜免费紫微斗数排盘",
    description:
      "十二宫、主星、四化、大限与流年，一张清楚、可核对的紫微命盘。",
    url: "https://huzhongtianji.netlify.app/ziwei-chart",
    siteName: "壶中天机",
    type: "website",
    images: ["/brand-logo.png"],
  },
};

export default function ZiweiChartPage() {
  return <ZiweiChartClient />;
}
