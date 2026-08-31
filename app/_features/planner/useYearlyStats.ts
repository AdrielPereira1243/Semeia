import { useMemo } from "react";
import { usePlannerData } from "./usePlannerData";
import { getServiceYearPeriod, PIONEER_GOALS } from "./model";

/**
 * Calculates the current service year, which runs from September through August.
 */
export function useYearlyStats() {
  const data = usePlannerData();
  const period = getServiceYearPeriod();

  const yearEntries = useMemo(
    () =>
      data.entries.filter(
        (entry) =>
          entry.date >= period.start && entry.date < period.endExclusive,
      ),
    [data.entries, period.endExclusive, period.start],
  );

  const totalYearHours = yearEntries.reduce((acc, e) => acc + e.hours, 0);
  const goal = PIONEER_GOALS[data.pioneerType] * 12; // 12 months goal
  const progress = goal > 0 ? (totalYearHours / goal) * 100 : 0;

  const expectedHoursSoFar =
    goal > 0 ? (goal * period.elapsedDays) / period.totalDays : 0;
  const delta = totalYearHours - expectedHoursSoFar;
  const isLate = delta < -0.25;
  const isAhead = delta > 0.25;

  return {
    totalYearHours,
    goal,
    progress,
    expectedHoursSoFar,
    delta,
    isLate,
    isAhead,
    yearEntries,
    serviceYear: period.serviceYear,
  };
}
