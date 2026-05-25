import type { Metadata } from "next";
import {
  BreadcrumbJsonLd,
  CTASection,
  InternalLinkCards,
  PageHeader,
  ProcessSteps,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl, processSteps } from "@/lib/site-content";
import styles from "../page.module.css";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "Haus verkaufen & wohnen bleiben", href: "/haus-verkaufen-wohnen-bleiben" },
];

export const metadata: Metadata = {
  title: "Haus verkaufen und wohnen bleiben | WohnKapital",
  description:
    "Sie möchten Ihr Haus verkaufen und wohnen bleiben? WohnKapital erklärt Möglichkeiten, Ablauf, Sicherheit und Unterschiede zum klassischen Verkauf.",
  alternates: { canonical: absoluteUrl("/haus-verkaufen-wohnen-bleiben") },
  openGraph: {
    title: "Haus verkaufen und wohnen bleiben | WohnKapital",
    description:
      "Immobilie verkaufen, Kapital freisetzen und im vertrauten Zuhause bleiben. Transparent erklärt von WohnKapital.",
    url: absoluteUrl("/haus-verkaufen-wohnen-bleiben"),
    type: "article",
  },
};

export default function HausVerkaufenWohnenBleibenPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Haus verkaufen und wohnen bleiben"
        lead="Viele Eigentümer möchten Kapital aus ihrer Immobilie nutzen, aber nicht aus dem vertrauten Zuhause ausziehen. Genau für diese Situation prüft WohnKapital strukturierte Modelle."
        cta="Kostenlose Ersteinschätzung anfragen"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.contentBlock}>
              <h2>Das Problem: Vermögen ist gebunden</h2>
              <p>
                Ein klassischer Verkauf schafft Liquidität, bedeutet aber oft Umzug, neue
                Wohnkosten und Abschied von Nachbarschaft und Alltag. Viele Eigentümer suchen
                deshalb einen Weg, der Kapital freisetzt und das Wohnen im Haus weiter ermöglicht.
              </p>
              <h3>Die Lösung: Verkauf mit geregeltem Wohnenbleiben</h3>
              <p>
                WohnKapital verbindet den Verkauf der Immobilie mit einer klar geregelten
                Wohnlösung. Je nach Situation kommt ein Wohnrecht auf Zeit oder ein Verkauf mit
                Rückmietverkauf in Betracht.
              </p>
            </div>
            <aside className={styles.noteBox}>
              Die genaue Ausgestaltung hängt von Immobilie, Alter, gewünschter Laufzeit,
              Gutachtenwert und persönlicher Planung ab. Eine erste Einschätzung ersetzt kein
              verbindliches Angebot.
            </aside>
          </div>
        </div>
      </section>
      <section className={styles.contentSectionAlt}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Vorteile gegenüber einem klassischen Verkauf</h2>
            <ul className={styles.contentList}>
              <li>Sie können im vertrauten Umfeld wohnen bleiben.</li>
              <li>Die Auszahlung schafft finanziellen Spielraum.</li>
              <li>Die Wohnlösung wird vor Vertragsabschluss transparent geregelt.</li>
              <li>Ihre Familie kann in Gespräche und Prüfung eingebunden werden.</li>
            </ul>
          </div>
        </div>
      </section>
      <ProcessSteps steps={processSteps.slice(0, 4)} />
      <section className={styles.contentSectionAlt}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Beispielrechnung</h2>
            <p>
              Eine Beispielrechnung wird erst sinnvoll, wenn Immobilienwert, Wohnfläche, Lage,
              gewünschte Laufzeit und Modell feststehen. Nutzen Sie dafür zunächst den
              Orientierungsrechner auf der Startseite.
            </p>
          </div>
        </div>
      </section>
      <InternalLinkCards />
      <CTASection cta="Immobilienwert grob einschätzen lassen" />
    </PublicPageShell>
  );
}
