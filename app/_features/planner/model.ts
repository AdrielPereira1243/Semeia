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

export function formatHours(v: number) {
  return `${v.toFixed(1)}h`;
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

