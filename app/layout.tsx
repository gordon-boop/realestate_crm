import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WohnKapital - Im Haus bleiben. Im Leben gewinnen.",
  description:
    "WohnKapital ermöglicht Eigentümern, gebundenes Immobilienvermögen freizusetzen und gleichzeitig im vertrauten Zuhause wohnen zu bleiben.",
  openGraph: {
    title: "WohnKapital - Im Haus bleiben. Im Leben gewinnen.",
    description:
      "Faire Immobilienverrentung mit notariell gesichertem Wohnrecht. Persönliche Beratung, transparente Bewertung.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
