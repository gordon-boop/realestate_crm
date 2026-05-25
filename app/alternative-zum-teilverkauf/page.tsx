import type { Metadata } from "next";
import {
  BreadcrumbJsonLd,
  CTASection,
  ComparisonTable,
  InternalLinkCards,
  PageHeader,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl } from "@/lib/site-content";
import styles from "../page.module.css";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "Alternative zum Teilverkauf", href: "/alternative-zum-teilverkauf" },
];

const rows = [
  {
    label: "Eigentumsstruktur",
    left: "Sie bleiben Miteigentümer und ein weiterer Eigentümer kommt hinzu.",
    right: "Die Struktur wird als vollständiger Verkauf mit geregeltem Wohnenbleiben geprüft.",
  },
  {
    label: "Nutzung",
    left: "Die weitere Nutzung ist häufig mit Entgelt- oder Nutzungsregelungen verbunden.",
    right: "Wohnrecht auf Zeit oder Rückmietverkauf werden vorab transparent geregelt.",
  },
  {
    label: "Komplexität",
    left: "Miteigentum, spätere Verkäufe und Entgelte können erklärungsbedürftig sein.",
    right: "WohnKapital setzt auf eine klare Vertragsstruktur mit nachvollziehbarem Ablauf.",
  },
  {
    label: "Transparenz",
    left: "Die langfristige Kostenwirkung sollte genau geprüft werden.",
    right: "Annahmen, Kosten und Laufzeiten werden vor Entscheidung offen dargestellt.",
  },
] as const;

export const metadata: Metadata = {
  title: "Alternative zum Teilverkauf | WohnKapital",
  description:
    "Teilverkauf neutral erklärt: Risiken, Unterschiede und WohnKapital als mögliche Alternative für Eigentümer, die wohnen bleiben möchten.",
  alternates: { canonical: absoluteUrl("/alternative-zum-teilverkauf") },
  openGraph: {
    title: "Alternative zum Teilverkauf | WohnKapital",
    description:
      "WohnKapital erklärt Teilverkauf, mögliche Nachteile und Alternativen wie Wohnrecht auf Zeit oder Rückmietverkauf.",
    url: absoluteUrl("/alternative-zum-teilverkauf"),
    type: "article",
  },
};

export default function AlternativeZumTeilverkaufPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Alternative zum Teilverkauf"
        lead="Ein Teilverkauf kann für manche Eigentümer passend sein. Er ist aber nicht die einzige Möglichkeit, Kapital aus der Immobilie zu nutzen und wohnen zu bleiben."
        cta="Alternative prüfen lassen"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Was ist ein Teilverkauf?</h2>
            <p>
              Beim Teilverkauf verkaufen Eigentümer nur einen Anteil ihrer Immobilie. Sie bleiben
              Miteigentümer und nutzen das Objekt weiter. Daraus entstehen jedoch neue
              vertragliche Beziehungen, Nutzungsentgelte und spätere Abstimmungsfragen.
            </p>
            <h3>Mögliche Nachteile und Risiken</h3>
            <p>
              Kritisch zu prüfen sind laufende Entgelte, die spätere Gesamtverwertung, Rechte des
              Miteigentümers und die langfristige Kostenwirkung. Diese Punkte sollten nicht
              unterschätzt werden.
            </p>
          </div>
        </div>
      </section>
      <section className={styles.contentSectionAlt}>
        <div className={styles.container}>
          <ComparisonTable rows={rows} />
        </div>
      </section>
      <InternalLinkCards />
      <CTASection title="Sie möchten Alternativen vergleichen?" cta="Kostenlose Ersteinschätzung anfragen" />
    </PublicPageShell>
  );
}
