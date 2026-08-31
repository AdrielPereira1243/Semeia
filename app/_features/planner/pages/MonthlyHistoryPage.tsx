"use client";

import { useMemo } from "react";
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
    <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Histórico Mensal
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Veja o consolidado de cada mês com totais e status da meta
          </p>
        </div>

        <div className="grid gap-3">
          {monthlyRows.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-sm font-medium text-muted-foreground">
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
                    <div className="text-lg font-extrabold text-foreground">
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
                  <div className="text-sm font-semibold text-foreground/80">
                    <span className="text-base font-extrabold text-foreground">
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
  );
}
