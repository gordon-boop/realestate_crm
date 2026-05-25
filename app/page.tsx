import type { Metadata } from "next";
import { HomepageCalculator } from "@/components/HomepageCalculator";
import {
  CTASection,
  FAQAccordion,
  HeroSection,
  ProcessSteps,
  ProductTeaserCards,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl, homeFaqs } from "@/lib/site-content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "WohnKapital | Immobilie verkaufen und wohnen bleiben",
  description:
    "Mit WohnKapital setzen Eigentümer Kapital aus ihrer Immobilie frei und bleiben weiterhin im vertrauten Zuhause. Unverbindlich informieren.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "WohnKapital | Im Haus bleiben. Im Leben gewinnen.",
    description:
      "Immobilie verkaufen, wohnen bleiben und Kapital freisetzen. Wohnrecht auf Zeit oder Rückmietverkauf transparent prüfen.",
    url: absoluteUrl("/"),
    type: "website",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "WohnKapital",
  url: absoluteUrl("/"),
  logo: absoluteUrl("/brand/wohnkapital-logo.svg"),
};

const homeProcessSteps = [
  {
    title: "Unverbindliches Gespräch",
    text: "Wir sprechen über Ihre Situation, Ihre Immobilie und darüber, welche Lösung grundsätzlich passen kann.",
  },
  {
    title: "Erste Marktwerteinschätzung",
    text: "WohnKapital prüft Lage, Objekt und Unterlagen und erstellt eine erste transparente Orientierung.",
  },
  {
    title: "Individuelles Angebot",
    text: "Sie erhalten ein Angebot mit klaren Annahmen, verständlichen Konditionen und ausreichend Zeit zur Prüfung.",
  },
  {
    title: "Notartermin und Auszahlung",
    text: "Wenn Sie sich entscheiden, werden Vertrag, Wohnrecht oder Mietregelung notariell strukturiert.",
  },
] as const;

const advantages = [
  {
    title: "Kapital freisetzen",
    text: "Nutzen Sie den Wert Ihrer Immobilie, ohne sofort ausziehen zu müssen.",
  },
  {
    title: "Zuhause bleiben",
    text: "Bleiben Sie in Ihrer vertrauten Umgebung und behalten Sie Ihre Lebensqualität.",
  },
  {
    title: "Sicher geregelt",
    text: "Wohnrecht, Bewertung und Auszahlung werden transparent und rechtssicher strukturiert.",
  },
] as const;

const safetyItems = [
  "unabhängige Immobilienbewertung",
  "notarielle Beurkundung",
  "grundbuchliche Absicherung",
  "transparente Vertragsstruktur",
  "persönliche Beratung",
] as const;

export default function Page() {
  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HeroSection />
      <section className={styles.homeOrientation}>
        <div className={styles.container}>
          <div className={styles.orientationInner}>
            <h2>Unverbindlich prüfen, welche Lösung zu Ihrer Immobilie passt</h2>
            <p>
              Viele Eigentümer besitzen eine wertvolle Immobilie, möchten diese aber nicht verlassen.
              Mit dem WohnKapital-Rechner erhalten Sie eine erste Orientierung zu möglichen Wegen,
              bevor wir die Details persönlich und transparent mit Ihnen besprechen.
            </p>
          </div>
        </div>
      </section>
      <HomepageCalculator />
      <section className={styles.homeAdvantages}>
        <div className={styles.container}>
          <div className={styles.advantageGrid}>
            {advantages.map((item) => (
              <article key={item.title} className={styles.advantageCard}>
                <span aria-hidden="true" className={styles.advantageIcon}>✓</span>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ProcessSteps
        steps={homeProcessSteps}
        title="So einfach starten Sie"
        lead="Der Einstieg ist bewusst schlank gehalten. Sie erhalten erst eine Orientierung und entscheiden dann in Ruhe, ob Sie weitergehen möchten."
        cta="Ablauf im Detail ansehen"
      />
      <section className={styles.securityBlock}>
        <div className={styles.container}>
          <div className={styles.securityGrid}>
            <div>
              <h2 className={styles.sectionTitle}>Vertrauen entsteht durch Klarheit</h2>
              <p className={styles.sectionLead}>
                Eine Immobilienentscheidung braucht Zeit, gute Informationen und nachvollziehbare
                Unterlagen. Deshalb legt WohnKapital Wert auf persönliche Beratung und transparente
                Vertragsstrukturen.
              </p>
              <a href="/sicherheit" className={styles.btnSecondary}>Mehr zur Sicherheit erfahren</a>
            </div>
            <ul className={styles.securityList}>
              {safetyItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <ProductTeaserCards />
      <section className={styles.faq}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Häufige Fragen</h2>
            <p className={styles.sectionLead}>
              Ein Auszug der wichtigsten Fragen. Weitere Antworten finden Sie im FAQ-Bereich.
            </p>
          </div>
          <FAQAccordion faqs={homeFaqs} />
          <div className={styles.sectionAction}>
            <a href="/faq" className={styles.btnSecondary}>Alle Fragen ansehen</a>
          </div>
        </div>
      </section>
      <CTASection
        title="Finden Sie heraus, welche Lösung zu Ihrer Immobilie passt."
        text="Eine erste Einschätzung ist kostenlos und unverbindlich."
        cta="Kostenlose Ersteinschätzung anfragen"
      />
    </PublicPageShell>
  );
}
