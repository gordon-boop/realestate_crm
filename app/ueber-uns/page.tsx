import type { Metadata } from "next";
import {
  BreadcrumbJsonLd,
  CTASection,
  PageHeader,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl } from "@/lib/site-content";
import styles from "../page.module.css";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "Über uns", href: "/ueber-uns" },
];

export const metadata: Metadata = {
  title: "Über WohnKapital | Seriöse Immobilienlösungen",
  description:
    "WohnKapital verbindet Immobilien- und Finanzverständnis mit menschlicher Beratung für Eigentümer, die verkaufen und wohnen bleiben möchten.",
  alternates: { canonical: absoluteUrl("/ueber-uns") },
  openGraph: {
    title: "Über uns | WohnKapital",
    description: "Warum WohnKapital: transparent, menschlich und mit Erfahrung in Immobilien und Finanzen.",
    url: absoluteUrl("/ueber-uns"),
    type: "website",
  },
};

export default function UeberUnsPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Warum WohnKapital"
        lead="Wir möchten Immobilienentscheidungen im Alter verständlicher, planbarer und menschlicher machen."
        cta="WohnKapital kennenlernen"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.contentBlock}>
              <h2>Unsere Mission</h2>
              <p>
                Viele Eigentümer haben Vermögen aufgebaut, das in der Immobilie gebunden ist.
                WohnKapital hilft dabei, dieses Vermögen transparent zu prüfen und eine Lösung
                zu finden, die zur Wohn- und Lebenssituation passt.
              </p>
              <h3>Seriös und menschlich</h3>
              <p>
                Wir erklären keine komplexen Modelle mit Druck, sondern mit Ruhe. Entscheidungen
                rund um das eigene Zuhause brauchen Zeit, Familie und nachvollziehbare Unterlagen.
              </p>
            </div>
            <aside className={styles.noteBox}>
              Platzhalter für Team: Hier können später Ansprechpartner, Erfahrung im Immobilien-
              und Finanzbereich sowie regionale Zuständigkeiten ergänzt werden.
            </aside>
          </div>
        </div>
      </section>
      <section className={styles.contentSectionAlt}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Warum WohnKapital?</h2>
            <ul className={styles.contentList}>
              <li>Fokus auf Eigentümer, die verkaufen und wohnen bleiben möchten.</li>
              <li>Klare Prozesse vom Erstgespräch bis zum Notartermin.</li>
              <li>Transparente Einordnung von Chancen, Grenzen und Kosten.</li>
              <li>Erfahrung an der Schnittstelle von Immobilie, Finanzierung und Lebensplanung.</li>
            </ul>
          </div>
        </div>
      </section>
      <CTASection />
    </PublicPageShell>
  );
}
