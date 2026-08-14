"use client";

import { PIONEER_GOALS, type PioneerType, formatHours } from "../model";
import { usePlannerData } from "../usePlannerData";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, HardDrive, Info, Trash2 } from "lucide-react";

export function SettingsPage() {
  const data = usePlannerData();

  return (
    <div className="grid max-w-2xl gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configuracoes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina seu tipo de pioneiro e acompanhe a meta mensal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" /> Tipo de Pioneiro
            </CardTitle>
            <CardDescription>
              Selecione sua modalidade de servico para ajustar a meta mensal de horas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={data.pioneerType}
              onValueChange={(value) =>
                void data.setPioneerType(value as PioneerType).catch(() => undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pioneiro auxiliar 15h">
                  Pioneiro auxiliar - 15 horas
                </SelectItem>
                <SelectItem value="pioneiro auxiliar 30h">
                  Pioneiro auxiliar - 30 horas
                </SelectItem>
                <SelectItem value="pioneiro regular">
                  Pioneiro regular - 50 horas
                </SelectItem>
                <SelectItem value="especial">Especial - 100 horas</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-sm text-muted-foreground">
              Meta atual:{" "}
              <span className="font-semibold text-foreground">
                {formatHours(PIONEER_GOALS[data.pioneerType])}
              </span>{" "}
              por mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="size-4" /> Dados da Conta
            </CardTitle>
            <CardDescription>
              Seus registros ficam sincronizados com sua conta no Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                const ok = window.confirm(
                  "Tem certeza? Esta acao vai deletar todos os seus dados."
                );
                if (ok) {
                  void data.clearAll().catch(() => undefined);
                }
              }}
              className="gap-2"
            >
              <Trash2 className="size-4" /> Limpar todos os dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4" /> Sobre o Aplicativo
            </CardTitle>
            <CardDescription>
              Semeia - Gerenciador moderno de horas de atividades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Desenvolvido com carinho por Adriel Pereira
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
