"use client";

import Link from "next/link";
import { BarChart3, Calendar, History, LogOut, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "./NavLink";
import { usePlannerData } from "../usePlannerData";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profileName } = usePlannerData();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-3xl border border-border/60 bg-muted/60 shadow-sm shadow-slate-900/5">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-foreground">
                Semeia
              </div>
              <div className="text-xs text-muted-foreground">
                {profileName ? `Olá, ${profileName}` : "Gerenciador de horas"}
              </div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            <NavLink href="/" label="Mês" icon={<Calendar className="size-4" />} />
            <NavLink href="/history" label="Histórico" icon={<History className="size-4" />} />
            <NavLink href="/contacts" label="Pessoas" icon={<Users className="size-4" />} />
            <NavLink href="/settings" label="Configurações" icon={<Settings className="size-4" />} />
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" className="gap-2 text-muted-foreground">
                <LogOut className="size-4" />
                Sair
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-center sm:px-6">
          <Separator />
          <p className="text-xs text-muted-foreground">Desenvolvido por Adriel Pereira</p>
        </div>
      </footer>
    </div>
  );
}
