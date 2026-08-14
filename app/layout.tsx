import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semeia",
  description: "Relatório mensal de horas e planejamento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark h-full antialiased">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent/20 selection:text-foreground">
        {children}
      </body>
    </html>
  );
}
