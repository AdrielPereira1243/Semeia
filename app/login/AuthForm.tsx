"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  Loader2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "login" | "signup";

const welcomeCopy = {
  login: {
    eyebrow: "Que bom ter você de volta",
    title: "Bem-vindo ao seu espaço de organização.",
    description:
      "Acompanhe suas horas, mantenha seus registros em dia e siga com clareza para o próximo mês.",
  },
  signup: {
    eyebrow: "Comece por aqui",
    title: "Boas-vindas ao Semeia.",
    description:
      "Crie sua conta e transforme seus registros mensais em uma rotina simples, segura e organizada.",
  },
} satisfies Record<Mode, { eyebrow: string; title: string; description: string }>;

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = welcomeCopy[mode];

  function handleModeChange(value: string) {
    setMode(value as Mode);
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase ainda nao foi configurado. Copie .env.example para .env.local.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Informe um nome com pelo menos 2 caracteres.");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/`,
          },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage("Conta criada. Confira seu e-mail para confirmar o cadastro.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }

      router.replace("/");
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Nao foi possivel autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-1/4 size-80 rounded-full bg-secondary/5 blur-3xl"
      />

      <Card className="relative grid w-full max-w-4xl overflow-hidden border-border/70 bg-card/90 shadow-2xl shadow-black/25 backdrop-blur-xl md:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative flex min-h-64 flex-col justify-between overflow-hidden border-b border-border/70 bg-muted/35 p-7 sm:p-9 md:min-h-[590px] md:border-b-0 md:border-r">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 size-64 rounded-full border-[48px] border-primary/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/10 blur-2xl"
          />

          <div className="relative flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BarChart3 className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Semeia</p>
              <p className="text-xs text-muted-foreground">Relatórios sem complicação</p>
            </div>
          </div>

          <div key={mode} className="auth-mode-enter relative my-8 max-w-sm md:my-auto">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              {copy.eyebrow}
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              {copy.description}
            </p>
          </div>

          <div className="relative hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="size-3.5" />
            </span>
            Seus dados sincronizados e protegidos
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col justify-center p-7 sm:p-10 md:p-12">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Sua conta
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {mode === "login"
                ? "Informe seus dados para continuar."
                : "Leva menos de um minuto para começar."}
            </p>
          </div>

          <Tabs value={mode} onValueChange={handleModeChange} className="mb-7">
            <TabsList className="relative grid w-full grid-cols-2 overflow-hidden border border-border/60 bg-muted/50 p-1">
              <span
                aria-hidden="true"
                className={`absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-xl bg-background shadow-sm transition-transform duration-300 ease-out ${
                  mode === "signup" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <TabsTrigger
                value="login"
                className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Criar conta
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div key={mode} className="auth-mode-enter grid gap-4">
              {mode === "signup" && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="Como podemos chamar você?"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 bg-background/35 px-4"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 bg-background/35 px-4"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Senha</Label>
                  {mode === "signup" && (
                    <span className="text-xs text-muted-foreground">Mínimo de 8 caracteres</span>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 bg-background/35 px-4"
                  required
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="flex items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                <Check className="mt-0.5 size-4 shrink-0" />
                {message}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-2 h-12 w-full gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Aguarde..." : mode === "login" ? "Entrar na minha conta" : "Criar minha conta"}
            </Button>
          </form>
        </section>
      </Card>
    </main>
  );
}
