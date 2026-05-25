import type { Metadata } from "next";
import { PageHeader, PublicPageShell } from "@/components/site/PublicSite";
import { absoluteUrl } from "@/lib/site-content";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Datenschutz | WohnKapital",
  description: "Datenschutzhinweise der WohnKapital Website.",
  alternates: { canonical: absoluteUrl("/datenschutz") },
};

export default function DatenschutzPage() {
  return (
    <PublicPageShell>
      <PageHeader
        title="Datenschutz"
        lead="Platzhalter für die Datenschutzhinweise. Bitte vor Veröffentlichung juristisch final prüfen und vollständig ergänzen."
        cta="Zur Startseite"
        ctaHref="/"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Datenschutzhinweise</h2>
            <p>
              Diese Seite wird vor dem Produktivgang mit Informationen zu Verantwortlichem,
              Rechtsgrundlagen, Speicherdauer, Betroffenenrechten und Kontaktmöglichkeiten ergänzt.
            </p>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
