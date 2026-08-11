"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ActivityType, Contact, ContactType, Entry, PioneerType } from "./model";

const DEFAULT_PIONEER_TYPE: PioneerType = "pioneiro auxiliar 15h";

type ContactRow = {
  id: string;
  type: ContactType;
  person_name: string;
  address: string;
  subject: string;
};

type EntryRow = {
  id: string;
  date: string;
  hours: number | string;
  activity_type: ActivityType;
  details: string;
  contact_id: string | null;
};

type PlannerDataContextValue = {
  profileName: string;
  pioneerType: PioneerType;
  contacts: Contact[];
  entries: Entry[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  setPioneerType: (nextType: PioneerType) => Promise<void>;
  addContact: (input: Omit<Contact, "id">) => Promise<string>;
  updateContact: (id: string, patch: Partial<Omit<Contact, "id">>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addEntry: (input: Omit<Entry, "id">) => Promise<string>;
  updateEntry: (id: string, patch: Partial<Omit<Entry, "id">>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

const PlannerDataContext = createContext<PlannerDataContextValue | null>(null);

function contactFromRow(row: ContactRow): Contact {
  return {
    id: row.id,
    type: row.type,
    personName: row.person_name,
    address: row.address,
    subject: row.subject,
  };
}

function entryFromRow(row: EntryRow): Entry {
  return {
    id: row.id,
    date: row.date,
    hours: Number(row.hours),
    activityType: row.activity_type,
    details: row.details,
    contactId: row.contact_id ?? undefined,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Nao foi possivel sincronizar os dados.";
}

export function PlannerDataProvider({ children }: { children: React.ReactNode }) {
  const [profileName, setProfileName] = useState("");
  const [pioneerType, setPioneerTypeState] = useState<PioneerType>(DEFAULT_PIONEER_TYPE);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null);

  const getClient = useCallback(() => {
    clientRef.current ??= createClient();
    return clientRef.current;
  }, []);

  const requireUserId = useCallback(async () => {
    if (userIdRef.current) return userIdRef.current;
    const { data, error: userError } = await getClient().auth.getUser();
    if (userError || !data.user) throw new Error("Sua sessao expirou. Entre novamente.");
    userIdRef.current = data.user.id;
    return data.user.id;
  }, [getClient]);

  const run = useCallback(async <T,>(operation: () => Promise<T>) => {
    setError(null);
    try {
      return await operation();
    } catch (operationError) {
      setError(errorMessage(operationError));
      throw operationError;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError("Configure as variaveis publicas do Supabase para continuar.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = getClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        userIdRef.current = null;
        setProfileName("");
        setContacts([]);
        setEntries([]);
        return;
      }

      userIdRef.current = authData.user.id;
      const [profileResult, settingsResult, contactsResult, entriesResult] = await Promise.all([
        supabase.from("profiles").select("name").maybeSingle(),
        supabase.from("planner_settings").select("pioneer_type").maybeSingle(),
        supabase
          .from("contacts")
          .select("id,type,person_name,address,subject")
          .order("person_name", { ascending: true }),
        supabase
          .from("entries")
          .select("id,date,hours,activity_type,details,contact_id")
          .order("date", { ascending: false }),
      ]);

      const queryError =
        profileResult.error ?? settingsResult.error ?? contactsResult.error ?? entriesResult.error;
      if (queryError) throw queryError;

      setProfileName(profileResult.data?.name ?? "");
      const setting = settingsResult.data as { pioneer_type: PioneerType } | null;
      setPioneerTypeState(setting?.pioneer_type ?? DEFAULT_PIONEER_TYPE);
      setContacts(((contactsResult.data ?? []) as ContactRow[]).map(contactFromRow));
      setEntries(((entriesResult.data ?? []) as EntryRow[]).map(entryFromRow));
      setError(null);
    } catch (refreshError) {
      setError(errorMessage(refreshError));
    } finally {
      setLoading(false);
    }
  }, [getClient]);

  useEffect(() => {
    void refresh();
    if (!isSupabaseConfigured()) return;

    const { data } = getClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        userIdRef.current = null;
        setProfileName("");
        setContacts([]);
        setEntries([]);
        setPioneerTypeState(DEFAULT_PIONEER_TYPE);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        window.setTimeout(() => void refresh(), 0);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [getClient, refresh]);

  const value: PlannerDataContextValue = {
    profileName,
    pioneerType,
    contacts,
    entries,
    loading,
    error,
    clearError: () => setError(null),
    async setPioneerType(nextType) {
      await run(async () => {
        const userId = await requireUserId();
        const { error: saveError } = await getClient().from("planner_settings").upsert({
          user_id: userId,
          pioneer_type: nextType,
          updated_at: new Date().toISOString(),
        });
        if (saveError) throw saveError;
        setPioneerTypeState(nextType);
      });
    },
    async addContact(input) {
      return run(async () => {
        const userId = await requireUserId();
        const id = crypto.randomUUID();
        const { error: saveError } = await getClient().from("contacts").insert({
          id,
          user_id: userId,
          type: input.type,
          person_name: input.personName.trim(),
          address: input.address.trim(),
          subject: input.subject.trim(),
        });
        if (saveError) throw saveError;
        setContacts((current) => [...current, { ...input, id }]);
        return id;
      });
    },
    async updateContact(id, patch) {
      await run(async () => {
        const update: TablesUpdate<"contacts"> = { updated_at: new Date().toISOString() };
        if (patch.type !== undefined) update.type = patch.type;
        if (patch.personName !== undefined) update.person_name = patch.personName.trim();
        if (patch.address !== undefined) update.address = patch.address.trim();
        if (patch.subject !== undefined) update.subject = patch.subject.trim();
        const { error: saveError } = await getClient().from("contacts").update(update).eq("id", id);
        if (saveError) throw saveError;
        setContacts((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
      });
    },
    async deleteContact(id) {
      await run(async () => {
        const { error: deleteError } = await getClient().from("contacts").delete().eq("id", id);
        if (deleteError) throw deleteError;
        setContacts((current) => current.filter((item) => item.id !== id));
        setEntries((current) =>
          current.map((entry) => (entry.contactId === id ? { ...entry, contactId: undefined } : entry)),
        );
      });
    },
    async addEntry(input) {
      return run(async () => {
        if (!Number.isFinite(input.hours) || input.hours <= 0 || input.hours > 24) {
          throw new Error("Informe uma quantidade valida de horas, entre 0 e 24.");
        }
        const userId = await requireUserId();
        const id = crypto.randomUUID();
        const { error: saveError } = await getClient().from("entries").insert({
          id,
          user_id: userId,
          date: input.date,
          hours: input.hours,
          activity_type: input.activityType,
          details: input.details.trim(),
          contact_id: input.contactId ?? null,
        });
        if (saveError) throw saveError;
        setEntries((current) => [...current, { ...input, id }]);
        return id;
      });
    },
    async updateEntry(id, patch) {
      await run(async () => {
        if (
          patch.hours !== undefined &&
          (!Number.isFinite(patch.hours) || patch.hours <= 0 || patch.hours > 24)
        ) {
          throw new Error("Informe uma quantidade valida de horas, entre 0 e 24.");
        }
        const update: TablesUpdate<"entries"> = {
          updated_at: new Date().toISOString(),
        };
        if (patch.date !== undefined) update.date = patch.date;
        if (patch.hours !== undefined) update.hours = patch.hours;
        if (patch.activityType !== undefined) update.activity_type = patch.activityType;
        if (patch.details !== undefined) update.details = patch.details.trim();
        if ("contactId" in patch) update.contact_id = patch.contactId ?? null;
        const { error: saveError } = await getClient().from("entries").update(update).eq("id", id);
        if (saveError) throw saveError;
        setEntries((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
      });
    },
    async deleteEntry(id) {
      await run(async () => {
        const { error: deleteError } = await getClient().from("entries").delete().eq("id", id);
        if (deleteError) throw deleteError;
        setEntries((current) => current.filter((item) => item.id !== id));
      });
    },
    async clearAll() {
      await run(async () => {
        const supabase = getClient();
        const userId = await requireUserId();
        const entriesResult = await supabase.from("entries").delete().eq("user_id", userId);
        if (entriesResult.error) throw entriesResult.error;
        const contactsResult = await supabase.from("contacts").delete().eq("user_id", userId);
        if (contactsResult.error) throw contactsResult.error;
        const settingsResult = await supabase.from("planner_settings").delete().eq("user_id", userId);
        if (settingsResult.error) throw settingsResult.error;
        setPioneerTypeState(DEFAULT_PIONEER_TYPE);
        setContacts([]);
        setEntries([]);
      });
    },
  };

  return (
    <PlannerDataContext.Provider value={value}>
      {children}
      {loading && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
          Sincronizando dados...
        </div>
      )}
      {error && (
        <button
          type="button"
          onClick={() => setError(null)}
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-red-500/40 bg-red-950 px-4 py-3 text-left text-xs text-red-100 shadow-lg"
        >
          {error} Clique para fechar.
        </button>
      )}
    </PlannerDataContext.Provider>
  );
}

export function usePlannerData() {
  const context = useContext(PlannerDataContext);
  if (!context) throw new Error("usePlannerData precisa estar dentro de PlannerDataProvider.");
  return context;
}
