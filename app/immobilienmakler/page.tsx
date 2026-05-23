import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

export default function ImmobilienmaklerPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.logoLink} aria-label="WohnKapital Startseite">
              <Image
                src="/brand/wohnkapital-logo.svg"
                alt="WohnKapital"
                width={170}
                height={36}
                priority
              />
            </Link>
            <nav className={styles.nav} aria-label="Hauptnavigation">
              <Link href="/#vorteile" className={styles.navLink}>Vorteile</Link>
              <Link href="/#ablauf" className={styles.navLink}>Ablauf</Link>
              <Link href="/immobilienmakler" className={styles.navLink}>Partner</Link>
              <Link href="/#faq" className={styles.navLink}>Fragen</Link>
              <Link href="/register" className={styles.navCta}>Als Partner registrieren</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className={styles.partner}>
        <div className={styles.container}>
          <div className={styles.partnerInner}>
            <div className={styles.partnerImageWrap}>
              <Image
                src="/hero-couple.png"
                alt="WohnKapital Beratungssituation in einem Zuhause"
                width={1536}
                height={1024}
                priority
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerText}>
              <span className={styles.eyebrow}>Für Immobilienmakler</span>
              <h1 className={styles.sectionTitle}>
                Kundenfälle einreichen.
                <br />
                Status nachvollziehen.
              </h1>
              <p className={styles.partnerLead}>
                Immobilienmakler können Kundenfälle digital einreichen, Objekt-
                und Kundendaten strukturiert erfassen und den Status jederzeit
                nachvollziehen. Ein professioneller Zugang mit klaren Prozessen.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/register" className={styles.btnPrimary}>
                  Als Partner registrieren
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.benefits}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Maklerprozess</span>
            <h2 className={styles.sectionTitle}>Vom Erstkontakt zum geprüften Fall</h2>
            <p className={styles.sectionLead}>
              Der Partnerbereich ist auf schnelle Erfassung, klare Rückfragen und
              nachvollziehbare Angebotsstände ausgelegt.
            </p>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitColumn}>
              <h3 className={styles.benefitColTitle}>Für Ihre Arbeit</h3>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Leads strukturiert übernehmen</strong>
                    <p className={styles.benefitText}>
                      Zugewiesene Interessenten lassen sich direkt in Kundenfälle
                      überführen.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Unterlagen nachhalten</strong>
                    <p className={styles.benefitText}>
                      Pflichtdokumente, fehlende Unterlagen und Rückfragen bleiben
                      transparent.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Status jederzeit sehen</strong>
                    <p className={styles.benefitText}>
                      Sie erkennen sofort, ob ein Fall in Bewertung, Prüfung oder
                      beim Kunden ist.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className={`${styles.benefitColumn} ${styles.benefitColumnAlt}`}>
              <h3 className={styles.benefitColTitle}>Für WohnKapital</h3>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Saubere Datenbasis</strong>
                    <p className={styles.benefitText}>
                      Kunden-, Objekt- und Wunschmodell-Daten kommen vollständig
                      und prüfbar an.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Schnellere Angebote</strong>
                    <p className={styles.benefitText}>
                      Bewertung, Kalkulation und interne Freigabe laufen in einem
                      klaren Prozess.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Nachvollziehbarer Verlauf</strong>
                    <p className={styles.benefitText}>
                      Aktivitäten, Rückfragen und Freigaben bleiben dokumentiert.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <Image
                src="/brand/wohnkapital-logo.svg"
                alt="WohnKapital"
                width={150}
                height={32}
              />
              <p className={styles.footerTagline}>
                Im Haus bleiben. Im Leben gewinnen.
              </p>
            </div>
            <nav className={styles.footerNav} aria-label="Footer">
              <Link href="/#vorteile" className={styles.footerLink}>Vorteile</Link>
              <Link href="/#ablauf" className={styles.footerLink}>Ablauf</Link>
              <Link href="/immobilienmakler" className={styles.footerLink}>Partner</Link>
              <Link href="/#faq" className={styles.footerLink}>Fragen</Link>
            </nav>
            <div className={styles.footerLegal}>
              <Link href="/impressum" className={styles.footerLink}>Impressum</Link>
              <Link href="/datenschutz" className={styles.footerLink}>Datenschutz</Link>
              <span className={styles.footerCopy}>© {new Date().getFullYear()} WohnKapital</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
