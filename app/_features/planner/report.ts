import { formatHours, formatMonthLabel, type Entry } from "./model";

export function createMonthlyReport(month: string, entries: Entry[]) {
  const monthEntries = entries.filter((entry) => entry.date.slice(0, 7) === month);
  const hours = monthEntries.reduce((total, entry) => total + entry.hours, 0);
  // Repeated sessions with the same person count as one study for the month.
  // Entries whose contact was removed remain represented individually.
  const studies = new Set(
    monthEntries
      .filter((entry) => entry.activityType === "estudo")
      .map((entry) => entry.contactId ?? entry.id),
  ).size;

  return [
    `Relatório — ${formatMonthLabel(month)}`,
    `Total de horas: ${formatHours(hours)}`,
    `${studies} ${studies === 1 ? "estudo" : "estudos"}`,
  ].join("\n");
}

export function getWhatsAppReportUrl(month: string, entries: Entry[]) {
  return `https://wa.me/?text=${encodeURIComponent(createMonthlyReport(month, entries))}`;
}
