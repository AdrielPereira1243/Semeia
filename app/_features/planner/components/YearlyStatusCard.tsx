import { MetricsCard } from "./MetricsCard";
import { useYearlyStats } from "../useYearlyStats";
import { formatHours } from "../model";
import { Clock } from "lucide-react";

export function YearlyStatusCard() {
  const {
    totalYearHours,
    goal,
    progress,
    delta,
    isLate,
    isAhead,
  } = useYearlyStats();

  const statusText = isLate
    ? `Atrasado ${Math.abs(delta).toFixed(1)}h`
    : isAhead
    ? `Adiantado +${delta.toFixed(1)}h`
    : "Em dia";

  const statusClass = isLate
    ? "text-red-600 dark:text-red-400"
    : isAhead
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-indigo-600 dark:text-indigo-400";

  return (
    <MetricsCard
      title="Ano – Progresso"
      value={`${formatHours(totalYearHours)} / ${formatHours(goal)}`}
      description={`Meta anual – ${progress.toFixed(0)}% concluído. ${statusText}`}
      icon={<Clock className="size-5" />}
      statusClass={statusClass}
    />
  );
}
