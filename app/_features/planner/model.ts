export type ActivityType =
  | "campo"
  | "cartas"
  | "testemunho informal"
  | "carrinho"
  | "revisita"
  | "estudo";

export type PioneerType =
  | "pioneiro auxiliar 15h"
  | "pioneiro auxiliar 30h"
  | "pioneiro regular"
  | "especial";

export type ContactType = "revisita" | "estudo";

export type Contact = {
  id: string;
  type: ContactType;
  personName: string;
  address: string;
  subject: string;
};

export type Entry = {
  id: string;
  date: string;
  hours: number;
  activityType: ActivityType;
  details: string;
  contactId?: string;
};

export const ENTRY_DRAFT_KEY = "service-report-entry-draft-v1";

export const ACTIVITY_TYPES: ActivityType[] = [
  "campo",
  "cartas",
  "testemunho informal",
  "carrinho",
  "revisita",
  "estudo",
];

export const PIONEER_GOALS: Record<PioneerType, number> = {
  "pioneiro auxiliar 15h": 15,
  "pioneiro auxiliar 30h": 30,
  "pioneiro regular": 50,
  especial: 100,
};

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayIso() {
  return toLocalIsoDate(new Date());
}

export function getCurrentMonth() {
  return toLocalIsoDate(new Date()).slice(0, 7);
}

export function getServiceYearPeriod(date = new Date()) {
  const currentYear = date.getFullYear();
  const startYear = date.getMonth() >= 8 ? currentYear : currentYear - 1;
  const serviceYear = startYear + 1;
  const start = `${startYear}-09-01`;
  const endExclusive = `${serviceYear}-09-01`;
  const dayInMs = 24 * 60 * 60 * 1000;
  const startUtc = Date.UTC(startYear, 8, 1);
  const endUtc = Date.UTC(serviceYear, 8, 1);
  const todayUtc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const totalDays = Math.round((endUtc - startUtc) / dayInMs);
  const elapsedDays = Math.min(
    totalDays,
    Math.max(0, Math.floor((todayUtc - startUtc) / dayInMs) + 1),
  );

  return { serviceYear, start, endExclusive, elapsedDays, totalDays };
}

export function formatHours(value: number) {
  const totalMinutes = Math.max(0, Math.round(value * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) return `${hours}h`;
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}

export function parseClockHours(value: string) {
  const match = value
    .trim()
    .replace(",", ".")
    .match(/^(\d{1,2})(?:\.(\d{1,2}))?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minuteDigits = match[2] ?? "0";
  const minutes = Number(minuteDigits.length === 1 ? `${minuteDigits}0` : minuteDigits);
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 0 || totalMinutes > 24 * 60) return null;
  return totalMinutes / 60;
}

export function formatClockInput(value: number) {
  const totalMinutes = Math.max(0, Math.round(value * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}.${String(minutes).padStart(2, "0")}`;
}

export function addClockMinutes(value: string, minutesToAdd: number) {
  const currentHours = parseClockHours(value) ?? 0;
  return formatClockInput(currentHours + minutesToAdd / 60);
}

export function formatMonthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  const dt = new Date(year, (m ?? 1) - 1, 1);
  return dt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function isContactType(x: unknown): x is ContactType {
  return x === "revisita" || x === "estudo";
}

export function isContactActivity(a: ActivityType): a is ContactType {
  return a === "revisita" || a === "estudo";
}

