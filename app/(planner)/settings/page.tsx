import type { Metadata } from "next";
import { SettingsPage } from "@/app/_features/planner/pages/SettingsPage";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Ajuste suas metas e preferências no Service Report.",
};

export default function SettingsRoute() {
  return <SettingsPage />;
}
