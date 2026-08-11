"use client";

import { useMemo, useState } from "react";
import type { ContactType } from "../model";
import { usePlannerData } from "../usePlannerData";
import { ContactEditor } from "../components/EntryEditors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, Edit2, Trash2, MapPin } from "lucide-react";

export function ContactsPage() {
  const data = usePlannerData();
  const [filter, setFilter] = useState<ContactType>("estudo");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.contacts
      .filter((c) => c.type === filter)
      .filter((c) => {
        if (!q) return true;
        return (
          c.personName.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.personName.localeCompare(b.personName));
  }, [data.contacts, filter, query]);

  const countUsedById = useMemo(() => {
    const map = new Map<string, number>();
    data.entries.forEach((e) => {
      if (!e.contactId) return;
      map.set(e.contactId, (map.get(e.contactId) ?? 0) + 1);
    });
    return map;
  }, [data.entries]);

  return (
    <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pessoas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie seus estudos e revisitas com facilidade
          </p>
        </div>

        <div className="grid gap-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as ContactType)}>
            <TabsList>
              <TabsTrigger value="estudo">Estudos</TabsTrigger>
              <TabsTrigger value="revisita">Revisitas</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome ou assunto..."
                className="pl-9"
              />
            </div>
            <Button asChild className="gap-2">
              <a href={`/follow-up?type=${filter}`}>
                <UserPlus className="size-4" /> Novo {filter}
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Nenhum {filter} cadastrado ainda.
              </CardContent>
            </Card>
          ) : (
            filtered.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{c.personName || "(sem nome)"}</CardTitle>
                      <CardDescription>{c.subject || "Sem assunto"}</CardDescription>
                      {c.address && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3.5" />
                          <span>{c.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(editingId === c.id ? null : c.id)}
                        title="Editar Contato"
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const used = countUsedById.get(c.id) ?? 0;
                          const ok = window.confirm(
                            used > 0
                              ? `Remover este ${filter}? Ele esta vinculado a ${used} lancamento(s).`
                              : `Remover este ${filter}?`
                          );
                          if (!ok) return;
                          void data.deleteContact(c.id).catch(() => undefined);
                          if (editingId === c.id) setEditingId(null);
                        }}
                        title="Remover Contato"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Badge variant="secondary" className="text-[10px]">
                    Usado em {countUsedById.get(c.id) ?? 0} lancamento(s)
                  </Badge>

                  {editingId === c.id && (
                    <div className="mt-4">
                      <ContactEditor
                        contact={c}
                        onCancel={() => setEditingId(null)}
                        onSave={(patch) => {
                          void data
                            .updateContact(c.id, patch)
                            .then(() => setEditingId(null))
                            .catch(() => undefined);
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </div>
  );
}
