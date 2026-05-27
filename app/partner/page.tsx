import type { Metadata } from "next";
import { FrontendPrototypeClient } from "@/components/prototype/FrontendPrototypeClient";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/site-content";
import { redirect } from "next/navigation";
import { PublicPartnerPage } from "./PublicPartnerPage";

export const dynamic = "force-dynamic";

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

function searchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const user = getCurrentUser();
  if (!user) return <PublicPartnerPage />;
  if (user.role === "admin") redirect("/admin");

  return (
    <FrontendPrototypeClient
      initialUser={user}
      initialCaseId={searchParam(searchParams?.case) ?? searchParam(searchParams?.caseId)}
      initialTab={searchParam(searchParams?.tab)}
      initialReturnTab={searchParam(searchParams?.returnTab)}
      initialScreen={searchParam(searchParams?.screen) ?? searchParam(searchParams?.view)}
    />
  );
}
