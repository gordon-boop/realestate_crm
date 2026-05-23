import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Page() {
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
              <a href="#vorteile" className={styles.navLink}>Vorteile</a>
              <a href="#ablauf" className={styles.navLink}>Ablauf</a>
              <Link href="/immobilienmakler" className={styles.navLink}>Partner</Link>
              <a href="#faq" className={styles.navLink}>Fragen</a>
              <Link href="/login" className={styles.navCta}>Partnerportal</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <span className={styles.eyebrow}>Für Eigentümer ab 65</span>
              <h1 className={styles.heroTitle}>
                Im Haus bleiben.
                <br />
                <em className={styles.italic}>Im Leben gewinnen.</em>
              </h1>
              <p className={styles.heroLead}>
                WohnKapital ermöglicht Eigentümern, gebundenes Immobilienvermögen
                freizusetzen und gleichzeitig im vertrauten Zuhause wohnen zu bleiben.
              </p>
              <div className={styles.heroCtas}>
                <a href="#kontakt" className={styles.btnPrimary}>
                  Unverbindlich beraten lassen
                </a>
              </div>
            </div>
            <div className={styles.heroImage}>
              <Image
                src="/hero-couple.png"
                alt="Älteres Eigentümerpaar im vertrauten Zuhause"
                width={1536}
                height={1024}
                priority
                className={styles.heroImg}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trust} aria-label="Vertrauen">
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustNumber}>01</div>
              <h3 className={styles.trustTitle}>Persönliche Beratung</h3>
              <p className={styles.trustText}>
                Ein fester Ansprechpartner begleitet Sie vom ersten Gespräch bis
                zum Notartermin.
              </p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustNumber}>02</div>
              <h3 className={styles.trustTitle}>Transparente Bewertung</h3>
              <p className={styles.trustText}>
                Der Immobilienwert wird nachvollziehbar ermittelt. Jede Zahl ist
                belegt.
              </p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustNumber}>03</div>
              <h3 className={styles.trustTitle}>Wohnrecht notariell gesichert</h3>
              <p className={styles.trustText}>
                Ihr Wohnrecht wird im Grundbuch eingetragen. Ein Leben lang
                geschützt.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.problemSolution}>
        <div className={styles.container}>
          <div className={styles.psGrid}>
            <div className={styles.psBlock}>
              <span className={styles.psLabel}>Die Ausgangslage</span>
              <h2 className={styles.psHeading}>
                Vermögen im Haus.
                <br />
                Knappheit im Alltag.
              </h2>
              <p className={styles.psText}>
                Viele Eigentümer haben über Jahrzehnte Werte aufgebaut, die fest
                in den eigenen vier Wänden gebunden sind. Renovierung, Pflege,
                eine Reise oder einfach mehr finanzieller Spielraum bleiben oft
                schwer erreichbar, obwohl das Vermögen vorhanden ist.
              </p>
            </div>
            <div className={`${styles.psBlock} ${styles.psBlockSolution}`}>
              <span className={styles.psLabel}>Unsere Lösung</span>
              <h2 className={styles.psHeading}>
                Verkauf, Wohnrecht und Auszahlung.
                <br />
                Aus einer Hand.
              </h2>
              <p className={styles.psText}>
                WohnKapital verbindet den Verkauf der Immobilie mit einem
                lebenslangen, notariell gesicherten Wohnrecht und einer fairen
                Auszahlung. Sie bleiben in Ihrem Zuhause und gewinnen
                Bewegungsfreiheit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="ablauf" className={styles.process}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>So läuft es ab</span>
            <h2 className={styles.sectionTitle}>Vier Schritte zur Auszahlung</h2>
            <p className={styles.sectionLead}>
              Klar strukturiert, ohne Eile. Sie entscheiden in jedem Schritt,
              ob Sie weitergehen möchten.
            </p>
          </div>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <h3 className={styles.stepTitle}>Erstgespräch</h3>
              <p className={styles.stepText}>
                Wir hören zu und klären gemeinsam, ob WohnKapital zu Ihrer
                Situation passt.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <h3 className={styles.stepTitle}>Immobilienbewertung</h3>
              <p className={styles.stepText}>
                Eine sorgfältige, nachvollziehbare Bewertung Ihrer Immobilie
                bildet die Grundlage.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <h3 className={styles.stepTitle}>Angebot</h3>
              <p className={styles.stepText}>
                Sie erhalten ein verständliches Angebot mit allen Zahlen und
                Konditionen schwarz auf weiß.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>4</span>
              <h3 className={styles.stepTitle}>Notartermin und Auszahlung</h3>
              <p className={styles.stepText}>
                Beim Notar wird alles rechtssicher geregelt. Anschließend
                erfolgt die Auszahlung.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section id="vorteile" className={styles.benefits}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Vorteile</span>
            <h2 className={styles.sectionTitle}>Was WohnKapital bedeutet</h2>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitColumn}>
              <h3 className={styles.benefitColTitle}>Für Eigentümer</h3>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Kapital nutzen</strong>
                    <p className={styles.benefitText}>
                      Gebundenes Vermögen wird zu verfügbarem Kapital für das,
                      was Ihnen wichtig ist.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Zuhause bleiben</strong>
                    <p className={styles.benefitText}>
                      Sie wohnen in Ihrem vertrauten Umfeld. Möbel, Garten,
                      Nachbarschaft, alles bleibt.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Planungssicherheit</strong>
                    <p className={styles.benefitText}>
                      Klare Konditionen, ein festes Wohnrecht und planbare
                      Beträge geben Ruhe.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Keine Kreditbelastung</strong>
                    <p className={styles.benefitText}>
                      Keine Zinsen, keine Tilgung, keine monatliche Belastung
                      durch ein Darlehen.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className={`${styles.benefitColumn} ${styles.benefitColumnAlt}`}>
              <h3 className={styles.benefitColTitle}>Für Partner und Makler</h3>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Digitale Fallerfassung</strong>
                    <p className={styles.benefitText}>
                      Objekt- und Kundendaten lassen sich strukturiert online
                      einreichen.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Strukturierter Angebotsprozess</strong>
                    <p className={styles.benefitText}>
                      Klare Abläufe von der Einreichung bis zur Auszahlung.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Klare Rückfragen und Status</strong>
                    <p className={styles.benefitText}>
                      Sie sehen jederzeit, wo ein Fall steht und was als
                      Nächstes ansteht.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Professioneller Zugang</strong>
                    <p className={styles.benefitText}>
                      Ein eigener Bereich für Makler mit allen relevanten
                      Werkzeugen.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className={styles.faq}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Häufige Fragen</span>
            <h2 className={styles.sectionTitle}>Was Sie wissen sollten</h2>
          </div>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>Was bedeutet Wohnrecht?</summary>
              <div className={styles.faqA}>
                Ein Wohnrecht erlaubt es Ihnen, die Immobilie weiter zu bewohnen,
                auch wenn sie verkauft wurde. Bei WohnKapital wird dieses Recht
                notariell beurkundet und im Grundbuch eingetragen. Damit ist es
                rechtlich abgesichert und kann Ihnen nicht entzogen werden.
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>Muss ich sofort ausziehen?</summary>
              <div className={styles.faqA}>
                Nein. Genau das ist der Kern von WohnKapital. Sie bleiben in
                Ihrem Zuhause. Wann oder ob Sie ausziehen, bestimmen weiterhin
                Sie.
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>Wie wird der Immobilienwert ermittelt?</summary>
              <div className={styles.faqA}>
                Die Bewertung erfolgt auf Basis nachvollziehbarer Kriterien wie
                Lage, Zustand, Größe und vergleichbaren Verkäufen in Ihrer
                Region. Sie erhalten die Bewertung schriftlich und können jede
                Position nachvollziehen.
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>Ist das Angebot verbindlich?</summary>
              <div className={styles.faqA}>
                Unser Angebot ist konkret und transparent. Verbindlich wird es
                erst, wenn Sie es annehmen und beim Notar unterzeichnen. Bis
                dahin haben Sie alle Zeit, das Angebot zu prüfen und zu
                besprechen.
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQ}>Können auch Angehörige eingebunden werden?</summary>
              <div className={styles.faqA}>
                Ausdrücklich ja. Wir wissen, wie wichtig solche Entscheidungen
                im Familienkreis sind. Kinder, Enkel oder Vertrauenspersonen
                können in Gespräche, Beratung und Termine eingebunden werden.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section id="kontakt" className={styles.finalCta}>
        <div className={styles.container}>
          <div className={styles.finalInner}>
            <h2 className={styles.finalTitle}>
              Sie möchten wissen, welches Kapital
              <br />
              in Ihrer Immobilie steckt?
            </h2>
            <p className={styles.finalLead}>
              Ein erstes Gespräch ist unverbindlich und kostenfrei. Wir nehmen
              uns die Zeit, die Sie brauchen.
            </p>
            <a href="mailto:beratung@wohn-kapital.de" className={styles.btnPrimaryLg}>
              Unverbindliche Anfrage starten
            </a>
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
              <a href="#vorteile" className={styles.footerLink}>Vorteile</a>
              <a href="#ablauf" className={styles.footerLink}>Ablauf</a>
              <Link href="/immobilienmakler" className={styles.footerLink}>Partner</Link>
              <a href="#faq" className={styles.footerLink}>Fragen</a>
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
