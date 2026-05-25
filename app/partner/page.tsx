import type { Metadata } from "next";
import { FrontendPrototypeClient } from "@/components/prototype/FrontendPrototypeClient";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/site-content";
import { redirect } from "next/navigation";
import { PublicPartnerPage } from "./PublicPartnerPage";

export const metadata: Metadata = {
  title: "Partner werden | WohnKapital",
  description:
    "Informationen für Immobilienmakler und Vertriebspartner: Kundenfälle strukturiert einreichen und WohnKapital-Partner werden.",
  alternates: { canonical: absoluteUrl("/partner") },
  openGraph: {
    title: "Partner werden | WohnKapital",
    description:
      "WohnKapital für Makler und Vertriebspartner: klare Prozesse, digitale Fallerfassung und transparente Statusübersicht.",
    url: absoluteUrl("/partner"),
    type: "website",
  },
};

export default function Page() {
  const user = getCurrentUser();
  if (!user) return <PublicPartnerPage />;
  if (user.role === "admin") redirect("/admin");

  return <FrontendPrototypeClient initialUser={user} />;
}
