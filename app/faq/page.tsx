import type { Metadata } from "next";
import {
  BreadcrumbJsonLd,
  CTASection,
  PageHeader,
  PublicPageShell,
} from "@/components/site/PublicSite";
import { absoluteUrl, faqGroups } from "@/lib/site-content";
import styles from "../page.module.css";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "FAQ", href: "/faq" },
];

export const metadata: Metadata = {
  title: "FAQ zu Immobilienverrentung und Wohnenbleiben | WohnKapital",
  description:
    "Antworten zu Immobilienbewertung, Wohnrecht, Auszahlung, Notar, Grundbuch, Kosten, Erben und Ablauf bei WohnKapital.",
  alternates: { canonical: absoluteUrl("/faq") },
  openGraph: {
    title: "FAQ | WohnKapital",
    description: "Häufige Fragen zu Immobilie verkaufen, wohnen bleiben, Wohnrecht und Rückmietverkauf.",
    url: absoluteUrl("/faq"),
    type: "website",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqGroups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    }))
  ),
};

export default function FAQPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Häufige Fragen"
        lead="Hier finden Sie Antworten auf die wichtigsten Fragen rund um Immobilienbewertung, Wohnrecht, Rückmietverkauf, Notar und Auszahlung."
        cta="Persönliche Frage stellen"
      />
      <section className={styles.faq}>
        <div className={styles.container}>
          <div className={styles.faqGroups}>
            {faqGroups.map((group) => (
              <div key={group.group} className={styles.faqGroup}>
                <h2 className={styles.faqGroupTitle}>{group.group}</h2>
                <div className={styles.faqList}>
                  {group.items.map((item) => (
                    <details key={item.q} className={styles.faqItem}>
                      <summary className={styles.faqQ}>{item.q}</summary>
                      <div className={styles.faqA}>{item.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </PublicPageShell>
  );
}
