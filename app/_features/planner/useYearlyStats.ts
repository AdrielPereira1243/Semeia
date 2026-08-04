import { useMemo } from 'react';
import { usePlannerData } from './usePlannerData';
import { PIONEER_GOALS } from './model';

/**
 * Hook that calculates yearly statistics based on planner entries.
 * It mirrors the monthly calculations but aggregates over the full year.
 */
export function useYearlyStats() {
  const data = usePlannerData();
  const currentYear = new Date().getFullYear().toString();

  const yearEntries = useMemo(
    () => data.entries.filter((e) => e.date.startsWith(currentYear)),
    [data.entries, currentYear],
  );

  const totalYearHours = yearEntries.reduce((acc, e) => acc + e.hours, 0);
  const goal = PIONEER_GOALS[data.pioneerType] * 12; // 12 months goal
  const progress = goal > 0 ? (totalYearHours / goal) * 100 : 0;

  // Expected hours up to today of the year (pro-rated)
  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }, []);

  const expectedHoursSoFar = goal > 0 ? (goal * dayOfYear) / 365.2425 : 0;
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
  };
}
