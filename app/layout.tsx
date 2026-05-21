import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WohnKapital Maklerportal",
  description: "MVP für Partnerportal und Angebots-CRM Immobilienverrentung"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
