"use client";

import { useMemo } from "react";
import { AppShell } from "../../../_components/AppShell";
import { formatHours, formatMonthLabel, PIONEER_GOALS } from "../model";
import { usePlannerData } from "../usePlannerData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

export function MonthlyHistoryPage() {
  const data = usePlannerData();
  const monthlyRows = useMemo(() => {
    const map = new Map<string, { hours: number }[]>();
    data.entries.forEach((entry) => {
      const key = entry.date.slice(0, 7);
      const list = map.get(key) ?? [];
      list.push({ hours: entry.hours });
      map.set(key, list);
    });

    return [...map.entries()]
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([month, list]) => {
        const total = list.reduce((acc, e) => acc + e.hours, 0);
        const goal = PIONEER_GOALS[data.pioneerType];
        return { month, total, goal, remaining: Math.max(0, goal - total) };
      });
  }, [data.entries, data.pioneerType]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Histórico Mensal
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            Veja o consolidado de cada mês com totais e status da meta
          </p>
        </div>

        <div className="grid gap-3">
          {monthlyRows.length === 0 ? (
            <Card className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium border-dashed">
              Nenhum mês registrado ainda.
            </Card>
          ) : (
            monthlyRows.map((row) => {
              const isCompleted = row.remaining === 0;
              return (
                <Card
                  key={row.month}
                  className={`p-5 transition-colors ${
                    isCompleted
                      ? "border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                      : "border-amber-200/60 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">
                      {formatMonthLabel(row.month)}
                    </div>
                    <Badge variant={isCompleted ? "success" : "warning"} className="gap-1 px-3 py-1">
                      {isCompleted ? (
                        <>
                          <CheckCircle className="size-3.5" /> Meta concluída
                        </>
                      ) : (
                        <>
                          <AlertCircle className="size-3.5" /> Faltam {formatHours(row.remaining)}
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                      {formatHours(row.total)}
                    </span>{" "}
                    / {formatHours(row.goal)}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
