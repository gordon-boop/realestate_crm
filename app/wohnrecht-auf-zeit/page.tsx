import type { Metadata } from "next";
import {
  BreadcrumbJsonLd,
  CTASection,
  FAQAccordion,
  InternalLinkCards,
  PageHeader,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl } from "@/lib/site-content";
import styles from "../page.module.css";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "Wohnrecht auf Zeit", href: "/wohnrecht-auf-zeit" },
];

const faqs = [
  {
    q: "Was bedeutet Wohnrecht auf Zeit?",
    a: "Ein Wohnrecht auf Zeit erlaubt Ihnen, für eine vorher vereinbarte Dauer in der Immobilie wohnen zu bleiben.",
  },
  {
    q: "Ist ein Wohnrecht dasselbe wie ein Mietvertrag?",
    a: "Nein. Ein Wohnrecht und ein Mietvertrag sind unterschiedliche rechtliche Konstruktionen. Die konkrete Ausgestaltung wird vor Abschluss erklärt und notariell geregelt.",
  },
  {
    q: "Welche Risiken sollte ich kennen?",
    a: "Wichtig sind Laufzeit, Rang im Grundbuch, Kostenstruktur und die Frage, was nach Ablauf der ersten Phase gilt. Diese Punkte müssen transparent geprüft werden.",
  },
];

export const metadata: Metadata = {
  title: "Wohnrecht auf Zeit einfach erklärt | WohnKapital",
  description:
    "Was ist ein befristetes Wohnrecht? WohnKapital erklärt Absicherung, Unterschiede zur Miete, Vorteile, Risiken und Ablauf verständlich.",
  alternates: { canonical: absoluteUrl("/wohnrecht-auf-zeit") },
  openGraph: {
    title: "Wohnrecht auf Zeit | WohnKapital",
    description: "Befristetes Wohnrecht transparent erklärt: Grundbuch, Laufzeit, Vorteile und Risiken.",
    url: absoluteUrl("/wohnrecht-auf-zeit"),
    type: "article",
  },
};

export default function WohnrechtAufZeitPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Wohnrecht auf Zeit"
        lead="Ein Wohnrecht auf Zeit kann ein Weg sein, Kapital aus der Immobilie freizusetzen und für eine klar vereinbarte Dauer im Zuhause zu bleiben."
        cta="Unverbindliches Gespräch vereinbaren"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.contentBlock}>
              <h2>Befristetes Wohnrecht verständlich erklärt</h2>
              <p>
                Beim Wohnrecht auf Zeit wird vorab geregelt, wie lange Sie in der Immobilie
                wohnen bleiben. Diese Struktur macht die Planung für beide Seiten nachvollziehbarer
                als ein unklarer oder unbegrenzter Zeitraum.
              </p>
              <h3>Grundbuchliche Absicherung</h3>
              <p>
                Die Absicherung im Grundbuch ist ein zentraler Baustein. Entscheidend sind die
                konkrete Ausgestaltung und Rangstelle, die vor einem Vertragsabschluss transparent
                geprüft werden.
              </p>
            </div>
            <aside className={styles.noteBox}>
              WohnKapital behauptet keine juristische Beratung. Verträge sollten immer in Ruhe
              geprüft und bei Bedarf mit unabhängigem Rat besprochen werden.
            </aside>
          </div>
        </div>
      </section>
      <section className={styles.contentSectionAlt}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.contentBlock}>
              <h2>Vorteile</h2>
              <ul className={styles.contentList}>
                <li>Klare Laufzeit und transparente Bedingungen.</li>
                <li>Wohnenbleiben im vertrauten Umfeld.</li>
                <li>Planbare Struktur für Auszahlung und Nutzung.</li>
              </ul>
            </div>
            <div className={styles.contentBlock}>
              <h2>Worauf Sie achten sollten</h2>
              <ul className={styles.contentList}>
                <li>Was passiert nach Ablauf der Wohnrechtsphase?</li>
                <li>Welche Kosten bleiben bei Ihnen?</li>
                <li>Wie wird der Immobilienwert ermittelt?</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.faq}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>FAQ zum Wohnrecht</h2>
          </div>
          <FAQAccordion faqs={faqs} />
        </div>
      </section>
      <InternalLinkCards />
      <CTASection />
    </PublicPageShell>
  );
}
