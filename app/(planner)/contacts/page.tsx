import type { Metadata } from "next";
import { ContactsPage } from "@/app/_features/planner/pages/ContactsPage";

export const metadata: Metadata = {
  title: "Pessoas e Contatos",
  description:
    "Gerencie pessoas, estudos e revisitas no Semeia com organização e histórico.",
};

export default function ContactsRoute() {
  return <ContactsPage />;
}
