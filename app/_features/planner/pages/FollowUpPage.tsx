"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "../../../_components/AppShell";
import { ENTRY_DRAFT_KEY, isContactType } from "../model";
import type { ActivityType, ContactType } from "../model";
import { formatHours } from "../model";
import { usePlannerData } from "../usePlannerData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Info } from "lucide-react";

export function FollowUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = usePlannerData();

  const queryType = searchParams.get("type");
  const contactType: ContactType = isContactType(queryType)
    ? queryType
    : "revisita";

  const draft = useMemo(() => {
    const raw = window.localStorage.getItem(ENTRY_DRAFT_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as {
        date: string;
        hours: number;
        activityType: ActivityType;
        details?: string;
      };
      if (!parsed?.date || !parsed?.hours || !parsed?.activityType) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const [personName, setPersonName] = useState("");
  const [address, setAddress] = useState("");
  const [subject, setSubject] = useState("");

  const canSave =
    personName.trim().length > 0 ||
    address.trim().length > 0 ||
    subject.trim().length > 0;

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Cadastrar {contactType}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Salve nome, endereco e um lembrete para a proxima conversa
            </p>
          </div>
          <Badge variant={contactType === "estudo" ? "success" : "default"}>
            {contactType === "estudo" ? "Estudo" : "Revisita"}
          </Badge>
        </div>

        {draft && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4" />
                Lancamento pendente
              </CardTitle>
              <CardDescription>
                Este contato sera vinculado ao lancamento salvo do fluxo atual.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <span className="font-medium">{draft.date}</span>{" "}
              <span className="text-muted-foreground">-</span>{" "}
              <span className="font-medium">{formatHours(draft.hours)}</span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="grid gap-2">
              <Label htmlFor="person-name">Nome</Label>
              <Input
                id="person-name"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Ex.: Maria"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, numero, referencia..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Assunto / Lembrete</Label>
              <Textarea
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex.: Tema sobre esperanca, combinar retorno..."
                className="min-h-28"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <ArrowLeft className="size-4" /> Voltar
              </Button>
              <Button
                type="button"
                disabled={!canSave}
                onClick={() => {
                  const id = data.addContact({
                    type: contactType,
                    personName,
                    address,
                    subject,
                  });

                  const raw = window.localStorage.getItem(ENTRY_DRAFT_KEY);
                  if (raw) {
                    try {
                      const parsed = JSON.parse(raw) as {
                        date: string;
                        hours: number;
                        activityType: ActivityType;
                        details?: string;
                      };
                      data.addEntry({
                        date: parsed.date,
                        hours: parsed.hours,
                        activityType: contactType,
                        details: parsed.details ?? "",
                        contactId: id,
                      });
                      window.localStorage.removeItem(ENTRY_DRAFT_KEY);
                    } catch {
                      // ignore
                    }
                  }

                  router.push("/");
                }}
                className="gap-2"
              >
                <Save className="size-4" /> Salvar {contactType}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
