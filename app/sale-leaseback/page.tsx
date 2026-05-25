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
  { label: "Rückmietverkauf", href: "/sale-leaseback" },
];

export const metadata: Metadata = {
  title: "Rückmietverkauf Immobilie | WohnKapital",
  description:
    "Rückmietverkauf für Immobilien verständlich erklärt: Immobilie verkaufen, als Mieter wohnen bleiben und Auszahlung erhalten.",
  alternates: { canonical: absoluteUrl("/sale-leaseback") },
  openGraph: {
    title: "Rückmietverkauf Immobilie | WohnKapital",
    description: "Rückmietverkauf als WohnKapital-Modell einfach und transparent erklärt.",
    url: absoluteUrl("/sale-leaseback"),
    type: "article",
  },
};

export default function SaleLeasebackPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Rückmietverkauf für Immobilien"
        lead="Beim Rückmietverkauf verkaufen Sie Ihre Immobilie und bleiben anschließend als Mieter in Ihrem Zuhause wohnen."
        cta="Rückmietverkauf unverbindlich prüfen"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.contentBlock}>
              <h2>Einfach erklärt</h2>
              <p>
                Rückmietverkauf bedeutet: Die Immobilie wird verkauft, anschließend wird die
                weitere Nutzung über einen Mietvertrag geregelt. Dadurch entsteht Liquidität,
                ohne dass ein sofortiger Umzug nötig ist.
              </p>
              <h3>Für wen kann das geeignet sein?</h3>
              <p>
                Das Modell kann interessant sein, wenn eine hohe Auszahlung wichtiger ist als
                mietfreies Wohnen und die laufende Miete langfristig tragbar ist.
              </p>
            </div>
            <aside className={styles.noteBox}>
              Wichtig: Ab dem ersten Tag nach Vertragsvollzug fällt Miete an. Diese laufende
              Belastung muss zur persönlichen Einkommenssituation passen.
            </aside>
          </div>
        </div>
      </section>
      <section className={styles.contentSectionAlt}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Vorteile und Einordnung</h2>
            <ul className={styles.contentList}>
              <li>Hohe Auszahlung, weil die Immobilie vollständig verkauft wird.</li>
              <li>Wohnenbleiben wird mietvertraglich geregelt.</li>
              <li>Größere Instandhaltungen können je nach Vertrag beim Eigentümer liegen.</li>
              <li>Im Vergleich zum Teilverkauf gibt es keine dauerhafte Miteigentümerstruktur.</li>
            </ul>
          </div>
        </div>
      </section>
      <ProcessSteps steps={processSteps.slice(0, 5)} />
      <InternalLinkCards />
      <CTASection cta="Unverbindliches Gespräch vereinbaren" />
    </PublicPageShell>
  );
}
