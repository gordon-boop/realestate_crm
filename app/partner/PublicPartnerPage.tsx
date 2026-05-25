import {
  BreadcrumbJsonLd,
  CTASection,
  PageHeader,
  PublicPageShell,
} from "@/components/site/PublicSite";
import styles from "../page.module.css";

const breadcrumbs = [
  { label: "Startseite", href: "/" },
  { label: "Partner", href: "/partner" },
];

export function PublicPartnerPage() {
  return (
    <PublicPageShell>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Partner für WohnKapital werden"
        lead="Immobilienmakler und Vertriebspartner können Kundenfälle strukturiert einreichen, Rückfragen nachvollziehen und den Angebotsprozess transparent begleiten."
        cta="Partneranfrage stellen"
        ctaHref="/register"
      />
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.contentBlock}>
              <h2>Warum Partner werden?</h2>
              <p>
                Viele Eigentümer möchten nicht klassisch verkaufen, weil sie in ihrem Zuhause
                bleiben wollen. WohnKapital bietet Partnern einen strukturierten Prozess, um
                solche Fälle sauber zu erfassen und intern prüfen zu lassen.
              </p>
              <h3>Für wen geeignet?</h3>
              <p>
                Geeignet ist die Zusammenarbeit für Immobilienmakler, Finanzberater und
                Vertriebspartner, die ältere Eigentümer seriös beraten und komplexe
                Immobilienentscheidungen transparent begleiten möchten.
              </p>
            </div>
            <aside className={styles.noteBox}>
              Der Zugang zum Maklerportal erfolgt nach Registrierung, E-Mail-Bestätigung und
              interner Freischaltung.
            </aside>
          </div>
        </div>
      </section>
      <section className={styles.contentSectionAlt}>
        <div className={styles.container}>
          <div className={styles.contentBlock}>
            <h2>Vorteile für Partner</h2>
            <ul className={styles.contentList}>
              <li>Digitale Fallerfassung für Kunden- und Objektdaten.</li>
              <li>Statusübersicht von Einreichung bis Angebot.</li>
              <li>Rückfragen, Dokumente und Aktivitäten nachvollziehbar an einem Ort.</li>
              <li>Strukturierter Prozess für Fälle, die kein klassischer Verkauf sind.</li>
            </ul>
          </div>
        </div>
      </section>
      <CTASection
        title="Sie möchten Partner werden?"
        text="Registrieren Sie sich für das Maklerportal. Die Freischaltung erfolgt nach Prüfung."
        cta="Partneranfrage stellen"
        href="/register"
      />
    </PublicPageShell>
  );
}
