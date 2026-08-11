"use client";

import { useMemo, useState } from "react";
import type { ActivityType, Contact, Entry } from "../model";
import { ACTIVITY_TYPES, isContactActivity } from "../model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, User, X, Check } from "lucide-react";

export function EditEntryForm({
  entry,
  contacts,
  onCancel,
  onSave,
}: {
  entry: Entry;
  contacts: Contact[];
  onCancel: () => void;
  onSave: (patch: Partial<Omit<Entry, "id">>) => void;
}) {
  const [date, setDate] = useState(entry.date);
  const [activityType, setActivityType] = useState<ActivityType>(entry.activityType);
  const [hours, setHours] = useState(String(entry.hours));
  const [details, setDetails] = useState(entry.details);
  const [selectedContactId, setSelectedContactId] = useState(entry.contactId ?? "");

  const availableContacts = useMemo(() => {
    if (!isContactActivity(activityType)) return [];
    return contacts.filter((c) => c.type === activityType);
  }, [activityType, contacts]);

  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Edit className="size-4" />
        Editar lancamento
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="grid gap-2">
          <Label>Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-xs" />
        </div>

        <div className="grid gap-2">
          <Label>Tipo</Label>
          <Select
            value={activityType}
            onValueChange={(next) => {
              setActivityType(next as ActivityType);
              setSelectedContactId("");
            }}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Horas</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <Label>Detalhes</Label>
          <Input
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="h-9 text-xs"
            placeholder="Detalhes"
          />
        </div>

        <div className="grid gap-2 lg:col-span-1">
          <Label>Contato</Label>
          {isContactActivity(activityType) ? (
            <Select value={selectedContactId} onValueChange={setSelectedContactId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={`Selecione ${activityType}`} />
              </SelectTrigger>
              <SelectContent>
                {availableContacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.personName || "(sem nome)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-9 items-center rounded-md border border-dashed px-3 text-xs text-muted-foreground">
              Nao se aplica
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="size-3.5" /> Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => {
            const n = Number(hours);
            if (!date || Number.isNaN(n) || n <= 0) return;
            onSave({
              date,
              activityType,
              hours: n,
              details,
              contactId: isContactActivity(activityType)
                ? selectedContactId || undefined
                : undefined,
            });
          }}
        >
          <Check className="size-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
}

export function ContactEditor({
  contact,
  onCancel,
  onSave,
}: {
  contact: Contact;
  onCancel: () => void;
  onSave: (patch: Partial<Omit<Contact, "id">>) => void;
}) {
  const [personName, setPersonName] = useState(contact.personName);
  const [address, setAddress] = useState(contact.address);
  const [subject, setSubject] = useState(contact.subject);

  return (
    <div className="mt-4 grid gap-4 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <User className="size-4" />
        Editar contato
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`contact-name-${contact.id}`}>Nome</Label>
        <Input
          id={`contact-name-${contact.id}`}
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Nome"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`contact-address-${contact.id}`}>Endereco</Label>
        <Input
          id={`contact-address-${contact.id}`}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Endereco"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`contact-subject-${contact.id}`}>Assunto</Label>
        <Textarea
          id={`contact-subject-${contact.id}`}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Assunto / Notas"
          className="min-h-24"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="size-3.5" /> Cancelar
        </Button>
        <Button size="sm" onClick={() => onSave({ personName, address, subject })}>
          <Check className="size-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
}
