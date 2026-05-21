import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WohnKapital – Immobilienverrentung",
  description: "Verkaufen Sie Ihr Eigenheim zum Marktpreis und bleiben Sie in Ihrem Zuhause. Kostenlose Beratung & Bewertung."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
