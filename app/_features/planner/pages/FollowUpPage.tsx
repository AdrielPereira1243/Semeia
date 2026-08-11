"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ENTRY_DRAFT_KEY, isContactType } from "../model";
import type { ContactType } from "../model";
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

  const [draft, setDraft] = useState<{
    date: string;
    hours: number;
    details?: string;
  } | null>(null);
  const [personName, setPersonName] = useState("");
  const [address, setAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(ENTRY_DRAFT_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        date?: unknown;
        hours?: unknown;
        activityType?: unknown;
        details?: unknown;
      };
      if (
        typeof parsed.date === "string" &&
        typeof parsed.hours === "number" &&
        Number.isFinite(parsed.hours) &&
        parsed.hours > 0 &&
        parsed.hours <= 24 &&
        parsed.activityType === contactType &&
        (parsed.details === undefined || typeof parsed.details === "string")
      ) {
        setDraft({
          date: parsed.date,
          hours: parsed.hours,
          details: parsed.details,
        });
        return;
      }
    } catch {
      // O rascunho inválido será descartado abaixo.
    }

    window.sessionStorage.removeItem(ENTRY_DRAFT_KEY);
  }, [contactType]);

  const canSave =
    personName.trim().length > 0 ||
    address.trim().length > 0 ||
    subject.trim().length > 0;

  return (
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
                disabled={!canSave || saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const id = await data.addContact({
                      type: contactType,
                      personName,
                      address,
                      subject,
                    });

                    if (draft) {
                      await data.addEntry({
                        date: draft.date,
                        hours: draft.hours,
                        activityType: contactType,
                        details: draft.details ?? "",
                        contactId: id,
                      });
                      window.sessionStorage.removeItem(ENTRY_DRAFT_KEY);
                    }

                    router.push("/");
                  } catch {
                    // O provider apresenta a mensagem de erro.
                  } finally {
                    setSaving(false);
                  }
                }}
                className="gap-2"
              >
                <Save className="size-4" /> {saving ? "Salvando..." : `Salvar ${contactType}`}
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
