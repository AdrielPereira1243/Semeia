import type { Metadata } from "next";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = {
  title: "Entrar ou criar conta",
  description: "Acesse sua conta do Service Report.",
};

export default function LoginPage() {
  return <AuthForm />;
}
