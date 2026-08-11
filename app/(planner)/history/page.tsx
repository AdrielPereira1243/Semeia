import type { Metadata } from "next";
import { MonthlyHistoryPage } from "@/app/_features/planner/pages/MonthlyHistoryPage";

export const metadata: Metadata = {
  title: "Histórico Mensal",
  description: "Veja o histórico mensal de horas, progresso e metas do Service Report.",
};

export default function HistoryRoute() {
  return <MonthlyHistoryPage />;
}
