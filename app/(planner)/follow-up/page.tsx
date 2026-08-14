import type { Metadata } from "next";
import { Suspense } from "react";
import { FollowUpPage } from "@/app/_features/planner/pages/FollowUpPage";

export const metadata: Metadata = {
  title: "Cadastro de Revisita",
  description: "Cadastre revisitas e estudos vinculados aos lançamentos do Semeia.",
};

export default function FollowUpRoute() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando...</div>}>
      <FollowUpPage />
    </Suspense>
  );
}
