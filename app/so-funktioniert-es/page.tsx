import type { Metadata } from "next";
import {
  BreadcrumbJsonLd,
  CTASection,
  PageHeader,
  ProcessSteps,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl, processSteps } from "@/lib/site-content";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "So funktioniert es", href: "/so-funktioniert-es" },
];

export const metadata: Metadata = {
  title: "So funktioniert WohnKapital | Ablauf in 6 Schritten",
  description:
    "Vom unverbindlichen Beratungsgespräch bis zur Auszahlung nach Grundbucheintragung: der WohnKapital-Ablauf verständlich erklärt.",
  alternates: { canonical: absoluteUrl("/so-funktioniert-es") },
  openGraph: {
    title: "So funktioniert WohnKapital",
    description: "Beratung, Marktwertermittlung, Gutachten, Angebot, Notartermin und Auszahlung.",
    url: absoluteUrl("/so-funktioniert-es"),
    type: "article",
  },
};

export default function SoFunktioniertEsPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="So funktioniert es"
        lead="WohnKapital begleitet Sie Schritt für Schritt. Nichts muss überstürzt werden, und jede Entscheidung bleibt nachvollziehbar."
        cta="Unverbindliches Gespräch vereinbaren"
      />
      <ProcessSteps steps={processSteps} />
      <CTASection cta="Kostenlose Ersteinschätzung anfragen" />
    </PublicPageShell>
  );
}
