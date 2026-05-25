import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "WohnKapital - Im Haus bleiben. Im Leben gewinnen.",
  description:
    "WohnKapital ermöglicht Eigentümern, gebundenes Immobilienvermögen freizusetzen und gleichzeitig im vertrauten Zuhause wohnen zu bleiben.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "WohnKapital - Im Haus bleiben. Im Leben gewinnen.",
    description:
      "Faire Immobilienverrentung mit notariell gesichertem Wohnrecht. Persönliche Beratung, transparente Bewertung.",
    siteName: "WohnKapital",
    locale: "de_DE",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
