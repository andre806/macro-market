import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MacroMarket — Terminal financeiro",
  description:
    "Acompanhe mercados, compare ativos e explore tendências econômicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
