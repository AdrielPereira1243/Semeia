import { AppShell } from "@/app/_features/planner/components/AppShell";
import { PlannerDataProvider } from "@/app/_features/planner/usePlannerData";

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlannerDataProvider>
      <AppShell>{children}</AppShell>
    </PlannerDataProvider>
  );
}
