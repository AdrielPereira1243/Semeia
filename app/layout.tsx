import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const themeScript = `(function(){var p="system";try{var s=localStorage.getItem("semeia-theme");if(s==="light"||s==="dark"||s==="system")p=s}catch(e){}var r=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;var d=document.documentElement;d.dataset.theme=r;d.dataset.themePreference=p;d.classList.toggle("dark",r==="dark");d.style.colorScheme=r})()`;

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
    <html
      lang="pt-BR"
      className="h-full antialiased"
      data-theme="light"
      data-theme-preference="system"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent/20 selection:text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
