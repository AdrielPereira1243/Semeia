"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toCsv, saveCsv } from "../csv";
import {
  ACTIVITY_TYPES,
  PIONEER_GOALS,
  formatHours,
  getCurrentMonth,
  getTodayIso,
  isContactActivity,
  type ActivityType,
  type Entry,
} from "../model";
import { MetricsCard } from "../components/MetricsCard";
import { YearlyStatusCard } from "../components/YearlyStatusCard";
import { EditEntryForm } from "../components/EntryEditors";
import { ENTRY_DRAFT_KEY } from "../model";
import { usePlannerData } from "../usePlannerData";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Briefcase,
  Mail,
  MessageSquare,
  ShoppingBag,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  Edit2,
  Trash2,
  UserPlus,
  PieChart,
} from "lucide-react";

// Configuração visual minimalista e limpa para cada atividade
const ACTIVITY_CONFIG: Record<
  ActivityType,
  {
    label: string;
    icon: React.ReactNode;
    bg: string;
    text: string;
    border: string;
    activeBg: string;
  }
> = {
  campo: {
    label: "Campo",
    icon: <Briefcase className="size-4" />,
    bg: "bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:hover:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200/50 dark:border-blue-900/30",
    activeBg:
      "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 border-blue-600",
  },
  cartas: {
    label: "Cartas",
    icon: <Mail className="size-4" />,
    bg: "bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200/50 dark:border-amber-900/30",
    activeBg:
      "bg-linear-to-r from-amber-500 to-amber-400 text-white shadow-md shadow-amber-500/20 border-amber-500",
  },
  "testemunho informal": {
    label: "Informal",
    icon: <MessageSquare className="size-4" />,
    bg: "bg-teal-50/70 hover:bg-teal-100/70 dark:bg-teal-950/20 dark:hover:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200/50 dark:border-teal-900/30",
    activeBg:
      "bg-linear-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-500/20 border-teal-600",
  },
  carrinho: {
    label: "Carrinho",
    icon: <ShoppingBag className="size-4" />,
    bg: "bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200/50 dark:border-indigo-900/30",
    activeBg:
      "bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20 border-indigo-600",
  },
  revisita: {
    label: "Revisita",
    icon: <RotateCcw className="size-4" />,
    bg: "bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:hover:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200/50 dark:border-rose-900/30",
    activeBg:
      "bg-linear-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20 border-rose-600",
  },
  estudo: {
    label: "Estudo",
    icon: <BookOpen className="size-4" />,
    bg: "bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200/50 dark:border-emerald-900/30",
    activeBg:
      "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-600",
  },
};

function formatDateLabel(isoDate: string) {
  const today = getTodayIso();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().slice(0, 10);

  if (isoDate === today) return "Hoje";
  if (isoDate === yesterdayIso) return "Ontem";

  const [year, month, day] = isoDate.split("-").map(Number);
  const dt = new Date(year, (month ?? 1) - 1, day);
  return dt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function DashboardPage() {
  const router = useRouter();
  const data = usePlannerData();
  const [month, setMonth] = useState(getCurrentMonth());
  const [date, setDate] = useState(getTodayIso());
  const [activityType, setActivityType] = useState<ActivityType>("campo");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [hours, setHours] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const isContactMode = isContactActivity(activityType);

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Bom dia";
    if (hr < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const contactsForSelectedType = useMemo(() => {
    if (!isContactMode) return [];
    return data.contacts.filter((c) => c.type === activityType);
  }, [activityType, data.contacts, isContactMode]);

  const monthEntries = useMemo(
    () => data.entries.filter((e) => e.date.startsWith(month)),
    [data.entries, month],
  );

  const totalHours = monthEntries.reduce((acc, e) => acc + e.hours, 0);
  const goal = PIONEER_GOALS[data.pioneerType];
  const progress = goal > 0 ? (totalHours / goal) * 100 : 0;

  const AVG_DAYS_PER_MONTH = 365.2425 / 12;
  const currentMonth = getCurrentMonth();
  const todayDay = new Date().getDate();
  const elapsedDays =
    month === currentMonth
      ? Math.min(todayDay, AVG_DAYS_PER_MONTH)
      : month < currentMonth
        ? AVG_DAYS_PER_MONTH
        : 0;
  const expectedHoursSoFar =
    goal > 0 ? (goal * elapsedDays) / AVG_DAYS_PER_MONTH : 0;
  const delta = totalHours - expectedHoursSoFar;
  const isLate = delta < -0.25;
  const isAhead = delta > 0.25;
  const daysWithEntries = new Set(monthEntries.map((e) => e.date)).size;

  const selectedTypeHours = useMemo(() => {
    return monthEntries
      .filter((e) => e.activityType === activityType)
      .reduce((sum, e) => sum + e.hours, 0);
  }, [monthEntries, activityType]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Entry[]>();
    monthEntries.forEach((e) => {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    });
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  }, [monthEntries]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, progress) / 100) * circumference;

  const currentTypeConfig = ACTIVITY_CONFIG[activityType];

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Banner Header */}
        <div className="overflow-hidden rounded-[2.5rem] bg-linear-to-br from-slate-950 via-slate-800 to-orange-500 p-6 sm:p-8 text-white shadow-2xl shadow-black/20">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-100">
                <span className="flex size-2 animate-pulse rounded-full bg-emerald-300" />
                Painel do Pioneiro
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {greeting}, {data.profileName || "Pioneiro"}! 👋
              </h1>
              <p className="mt-3 text-sm text-amber-50/95 max-w-md leading-relaxed">
                Acompanhe seu serviço de campo, organize lançamentos e gerencie
                metas com facilidade.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-3xl border border-white/15 bg-white/10 px-4 py-3 shadow-sm shadow-black/10 backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                Período
              </span>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-auto h-10 bg-white text-slate-950 font-semibold border-none text-xs rounded-2xl shadow-inner cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Métricas e Progresso Geral */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Circular Progress Ring */}
          <Card className="flex items-center justify-between gap-6 p-6">
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Progresso Geral
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 font-medium truncate">
                {totalHours >= goal && goal > 0
                  ? "Meta mensal concluída! 🎉"
                  : `Você completou ${progress.toFixed(0)}% da sua meta.`}
              </p>
              <div className="mt-4 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Esperado até hoje:
                </span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {formatHours(expectedHoursSoFar)}
                </span>
              </div>
            </div>

            {/* SVG Ring */}
            <div className="relative flex items-center justify-center size-24 shrink-0">
              <svg className="size-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-zinc-100 dark:stroke-zinc-800/80"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className={`transition-all duration-500 ease-out ${
                    isLate
                      ? "stroke-red-500"
                      : isAhead
                        ? "stroke-emerald-500"
                        : "stroke-indigo-600"
                  }`}
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {Math.min(100, progress).toFixed(0)}%
              </span>
            </div>
          </Card>

          {/* Quick Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricsCard
              title="Horas"
              value={formatHours(totalHours)}
              description={
                totalHours >= goal
                  ? "Meta atingida!"
                  : `Faltam ${formatHours(Math.max(0, goal - totalHours))}`
              }
              icon={<Clock className="size-4" />}
            />

            <MetricsCard
              title="Dias"
              value={daysWithEntries}
              description="Dias ativos no mês"
              icon={<CalendarIcon className="size-4" />}
            />

            <MetricsCard
              title="Meta"
              value={formatHours(goal)}
              description={data.pioneerType.replace("pioneiro ", "")}
              icon={<CheckCircle className="size-4" />}
            />

            <Card
              className={`p-5 flex flex-col justify-between ${
                isLate
                  ? "bg-red-50/40 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40"
                  : isAhead
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40"
                    : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/40"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center ${
                      isLate
                        ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                        : isAhead
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    }`}
                  >
                    {isAhead ? (
                      <TrendingUp className="size-4" />
                    ) : isLate ? (
                      <TrendingDown className="size-4" />
                    ) : (
                      <Minus className="size-4" />
                    )}
                  </div>
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isLate
                        ? "text-red-600 dark:text-red-400"
                        : isAhead
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    Ritmo
                  </h3>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    isLate
                      ? "text-red-700 dark:text-red-400"
                      : isAhead
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {month > currentMonth
                    ? "Planejado"
                    : isLate
                      ? "Atrasado"
                      : isAhead
                        ? "Adiantado"
                        : "Em dia"}
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
                {month > currentMonth
                  ? "Ainda não iniciado"
                  : delta === 0
                    ? "No ritmo correto"
                    : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}h do esperado`}
              </p>
            </Card>
          </div>
        </div>

        {/* Lançamento + Distribuição das Horas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Novo Lançamento */}
          <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    Novo Lançamento
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Registre a atividade realizada
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Input Data */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Data do Registro
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Grid de Chips de Atividade */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Tipo de Atividade
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {ACTIVITY_TYPES.map((type) => {
                        const cfg = ACTIVITY_CONFIG[type];
                        const isSelected = activityType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setActivityType(type);
                              setSelectedContactId("");
                            }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? cfg.activeBg
                                : `${cfg.bg} ${cfg.border} ${cfg.text}`
                            }`}
                          >
                            <span className="mb-1">{cfg.icon}</span>
                            <span className="text-[10px] font-bold tracking-tight truncate max-w-full">
                              {cfg.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Input Horas e Quick Add */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Quantidade de Horas
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          placeholder="0.0"
                          className="pr-14"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                          horas
                        </span>
                      </div>
                      <div className="flex gap-1.5 justify-center sm:justify-start">
                        {[0.5, 1, 2, 4].map((h) => (
                          <Button
                            key={h}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const val = (Number(hours) || 0) + h;
                              setHours(String(val));
                            }}
                            className="font-bold text-xs"
                          >
                            +{h}h
                          </Button>
                        ))}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setHours("")}
                          className="text-xs"
                        >
                          Zerar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo da Categoria Selecionada */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${currentTypeConfig.bg} ${currentTypeConfig.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-zinc-900 border ${currentTypeConfig.border} ${currentTypeConfig.text}`}
                    >
                      {currentTypeConfig.icon}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold uppercase tracking-wider ${currentTypeConfig.text}`}
                      >
                        Acumulado de {currentTypeConfig.label}
                      </h4>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mt-0.5">
                        Total acumulado:{" "}
                        <span className="font-extrabold underline">
                          {formatHours(selectedTypeHours)}
                        </span>{" "}
                        neste mês.
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={selectedTypeHours > 0 ? "success" : "secondary"}
                  >
                    {selectedTypeHours > 0 ? "Ativo" : "Sem registros"}
                  </Badge>
                </div>

                {/* Se for modalidade de Contato */}
                {isContactMode && (
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Vincular Pessoa ({activityType})
                      </label>
                      <select
                        value={selectedContactId}
                        onChange={(e) => setSelectedContactId(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-100 cursor-pointer"
                      >
                        <option value="">Selecione um contato existente</option>
                        {contactsForSelectedType.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.personName || "(sem nome)"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const n = Number(hours);
                        if (!date || Number.isNaN(n) || n <= 0) return;
                        window.sessionStorage.setItem(
                          ENTRY_DRAFT_KEY,
                          JSON.stringify({
                            date,
                            hours: n,
                            activityType,
                          }),
                        );
                        router.push(`/follow-up?type=${activityType}`);
                      }}
                      className="gap-2"
                    >
                      <UserPlus className="size-4 text-indigo-500" />
                      Criar Novo Contato
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="button"
                className="w-full h-11 text-sm font-bold"
                onClick={async () => {
                  const n = Number(hours);
                  if (!date || !activityType || Number.isNaN(n) || n <= 0)
                    return;
                  if (isContactMode) {
                    const available = data.contacts.filter(
                      (c) => c.type === activityType,
                    );
                    if (available.length === 0 || !selectedContactId) {
                      window.sessionStorage.setItem(
                        ENTRY_DRAFT_KEY,
                        JSON.stringify({
                          date,
                          hours: n,
                          activityType,
                        }),
                      );
                      router.push(`/follow-up?type=${activityType}`);
                      return;
                    }
                    try {
                      await data.addEntry({
                        date,
                        activityType,
                        hours: n,
                        details: "",
                        contactId: selectedContactId,
                      });
                      setHours("");
                      setSelectedContactId("");
                    } catch {
                      // O provider apresenta a mensagem de erro.
                    }
                    return;
                  }
                  try {
                    await data.addEntry({ date, activityType, hours: n, details: "" });
                    setHours("");
                  } catch {
                    // O provider apresenta a mensagem de erro.
                  }
                }}
              >
                <CheckCircle className="size-4" />
                Salvar Registro
              </Button>
            </div>
          </Card>

          {/* Distribuição por Atividade */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <PieChart className="size-4 text-indigo-500" />
                Distribuição do Serviço
              </h3>
              <div className="space-y-4">
                {ACTIVITY_TYPES.map((type) => {
                  const cfg = ACTIVITY_CONFIG[type];
                  const hoursForType = monthEntries
                    .filter((e) => e.activityType === type)
                    .reduce((sum, e) => sum + e.hours, 0);
                  const percentage =
                    totalHours > 0 ? (hoursForType / totalHours) * 100 : 0;

                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <span className={cfg.text}>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </div>
                        <span className="text-zinc-900 dark:text-white">
                          {formatHours(hoursForType)} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Ano – Progresso */}
        <div>
          <YearlyStatusCard />
        </div>

        {/* Registros do Mês */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <CalendarIcon className="size-4" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Registros do Mês
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                saveCsv(
                  toCsv(monthEntries, data.contacts),
                  `servico-${month}.csv`,
                )
              }
              className="gap-2 text-xs"
            >
              <FileSpreadsheet className="size-4 text-indigo-500" />
              Exportar CSV
            </Button>
          </div>

          {groupedByDate.length === 0 ? (
            <Card className="py-16 text-center text-zinc-500 dark:text-zinc-400 border-dashed">
              <span className="text-4xl mb-3 block">📅</span>
              <p className="text-sm font-semibold">
                Nenhum lançamento registrado neste mês.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Preencha o formulário acima para registrar suas horas.
              </p>
            </Card>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l border-zinc-200 dark:border-zinc-800 ml-4 sm:ml-5 py-2 space-y-8">
              {groupedByDate.map(([d, list]) => (
                <div key={d} className="relative space-y-3">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 size-3.5 rounded-full border-2 border-indigo-600 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    <div className="size-1 rounded-full bg-indigo-600" />
                  </div>

                  <div className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest pl-1">
                    {formatDateLabel(d)}
                  </div>

                  <div className="grid gap-3">
                    {list.map((e) => {
                      const cfg = ACTIVITY_CONFIG[e.activityType] ?? {
                        label: e.activityType,
                        icon: <Briefcase className="size-4" />,
                        text: "text-zinc-600 dark:text-zinc-300",
                      };
                      return (
                        <div key={e.id} className="group flex flex-col">
                          <Card className="p-4 flex items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`shrink-0 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl size-9 flex items-center justify-center ${cfg.text}`}
                              >
                                {cfg.icon}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-900 dark:text-white text-sm">
                                    {cfg.label}
                                  </span>
                                  {e.contactId && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] uppercase"
                                    >
                                      Vinculado
                                    </Badge>
                                  )}
                                </div>
                                {e.contactId && (
                                  <div className="mt-0.5 max-w-50 truncate text-xs text-zinc-500 sm:max-w-xs dark:text-zinc-400">
                                    Pessoa:{" "}
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                      {data.contacts.find(
                                        (c) => c.id === e.contactId,
                                      )?.personName || "Sem nome"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="font-black text-zinc-900 dark:text-white text-base">
                                {formatHours(e.hours)}
                              </div>

                              <div className="flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setEditingId(
                                      editingId === e.id ? null : e.id,
                                    )
                                  }
                                  title="Editar Registro"
                                >
                                  <Edit2 className="size-3.5" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const ok = window.confirm(
                                      "Deseja mesmo excluir este registro?",
                                    );
                                    if (ok) void data.deleteEntry(e.id).catch(() => undefined);
                                  }}
                                  title="Excluir Registro"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </Card>

                          {editingId === e.id && (
                            <div className="mt-2 pl-3 border-l-2 border-indigo-500 animate-slide-down">
                              <EditEntryForm
                                entry={e}
                                contacts={data.contacts}
                                onCancel={() => setEditingId(null)}
                                onSave={(patch) => {
                                  void data
                                    .updateEntry(e.id, patch)
                                    .then(() => setEditingId(null))
                                    .catch(() => undefined);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
