import { redirect } from "next/navigation";

export const metadata = {
  title: "紫微斗数命盘 · 壶中天机",
  description: "前往壶中紫微命盘，查看十二宫、主星、四化、大限、流年与排盘依据。",
};

export default function ZiweiToolRedirect() {
  redirect("/ziwei-chart");
}
