import type { Metadata } from "next";
import {
  BreadcrumbJsonLd,
  CTASection,
  FAQAccordion,
  PageHeader,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl } from "@/lib/site-content";
import styles from "../page.module.css";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "Sicherheit", href: "/sicherheit" },
];

const faqs = [
  {
    q: "Welche Rolle spielt der Notar?",
    a: "Der Notar beurkundet den Immobilienverkauf und sorgt dafür, dass die vertraglichen Erklärungen rechtssicher festgehalten werden.",
  },
  {
    q: "Warum ist das Grundbuch wichtig?",
    a: "Das Grundbuch dokumentiert Rechte an der Immobilie. Bei einem Wohnrecht ist die Eintragung ein zentraler Sicherheitsbaustein.",
  },
  {
    q: "Gibt es versteckte Kosten?",
    a: "Kosten, Annahmen und Bedingungen müssen vor einer Entscheidung transparent dargestellt werden. Genau darauf legt WohnKapital Wert.",
  },
];

export const metadata: Metadata = {
  title: "Sicherheit beim Immobilienverkauf mit Wohnrecht | WohnKapital",
  description:
    "Notar, Grundbuch, Gutachten und transparente Bewertung: WohnKapital erklärt die Sicherheitsbausteine beim Verkauf mit Wohnenbleiben.",
  alternates: { canonical: absoluteUrl("/sicherheit") },
  openGraph: {
    title: "Sicherheit | WohnKapital",
    description: "Notar, Grundbuch, Gutachten, transparente Bewertung und klare Vertragsstruktur.",
    url: absoluteUrl("/sicherheit"),
    type: "article",
  },
};

export default function SicherheitPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Sicherheit und Transparenz"
        lead="Eine Entscheidung rund um das eigene Zuhause braucht Ruhe, klare Informationen und nachvollziehbare Verträge."
        cta="Sicherheitsfragen besprechen"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.linkCardGrid}>
            {[
              ["Notar", "Der Verkauf wird notariell beurkundet und vorab verständlich vorbereitet."],
              ["Grundbuch", "Rechte wie ein Wohnrecht werden strukturiert und transparent eingeordnet."],
              ["Unabhängiges Gutachten", "Ein Gutachten schafft eine nachvollziehbare Grundlage für das Angebot."],
              ["Transparente Bewertung", "Annahmen, Werte und Konditionen werden offen erklärt."],
              ["Keine versteckten Kosten", "Kostenpositionen werden vor Entscheidung benannt."],
              ["Klare Vertragsstruktur", "Die wesentlichen Rechte und Pflichten werden verständlich festgehalten."],
            ].map(([title, text]) => (
              <article key={title} className={styles.linkCard}>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.faq}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>FAQ zur Sicherheit</h2>
          </div>
          <FAQAccordion faqs={faqs} />
        </div>
      </section>
      <CTASection />
    </PublicPageShell>
  );
}
