import type { Metadata } from "next";
import { PageHeader, PublicPageShell } from "@/components/site/PublicSite";
import { absoluteUrl } from "@/lib/site-content";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Impressum | WohnKapital",
  description: "Impressum der WohnKapital Website.",
  alternates: { canonical: absoluteUrl("/impressum") },
};

export default function ImpressumPage() {
  return (
    <PublicPageShell>
      <PageHeader
        title="Impressum"
        lead="Platzhalter für die rechtlichen Anbieterinformationen. Bitte vor Veröffentlichung juristisch final prüfen und vollständig ergänzen."
        cta="Zur Startseite"
        ctaHref="/"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>WohnKapital</p>
            <p>Adresse, Vertretungsberechtigte, Registerangaben und Kontakt werden hier ergänzt.</p>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
