import type { Metadata } from "next";
import { AppIntlProvider } from "@/components/i18n/AppIntlProvider";
import { getDefaultLocale } from "@/i18n/config";
import { getMessagesForLocale } from "@/i18n/messages";
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
  const locale = getDefaultLocale();
  const messages = getMessagesForLocale(locale);
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
      </head>
      <body>
        <AppIntlProvider locale={locale} messages={messages}>
          {children}
        </AppIntlProvider>
      </body>
    </html>
  );
}
