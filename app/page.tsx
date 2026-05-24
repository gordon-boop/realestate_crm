import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const faqs = [
  {
    group: "Allgemein zur Immobilienverrentung",
    items: [
      {
        q: "Was bedeutet Immobilienverrentung?",
        a: "Immobilienverrentung ist der Sammelbegriff für Modelle, mit denen Sie Kapital aus Ihrer Immobilie freisetzen und gleichzeitig darin wohnen bleiben. WohnKapital bietet zwei Wege: das Zwei-Phasen-Wohnrecht mit Eintragung im Grundbuch und den Verkauf mit Rückmiete. Beide Modelle ermöglichen Ihnen den Verbleib in Ihrem Zuhause bei substanzieller Kapitalauszahlung.",
      },
      {
        q: "Welche Modelle bietet WohnKapital an?",
        a: "Wir bieten zwei Modelle: das Zwei-Phasen-Modell mit mietfreiem Wohnrecht und den Verkauf mit Rückmiete. Beim Zwei-Phasen-Modell erhalten Sie einen Teil des Verkehrswerts als Einmalzahlung und wohnen in der vereinbarten ersten Phase mietfrei. Bei der Rückmiete erhalten Sie den vollen Verkehrswert, zahlen dafür aber laufend Miete.",
      },
      {
        q: "Welches Modell passt zu mir?",
        a: "Das hängt von Ihrem Alter, dem Wert Ihrer Immobilie und der Frage ab, ob Sie laufende Miete oder mietfreies Wohnen bevorzugen. Wir rechnen Ihnen beide Varianten konkret durch, damit Sie die Entscheidung nachvollziehbar vergleichen können.",
      },
      {
        q: "Ab welchem Alter ist Immobilienverrentung sinnvoll?",
        a: "Beim Zwei-Phasen-Modell richtet sich WohnKapital an Eigentümer ab 65 Jahren. Der Verkauf mit Rückmiete kann je nach Situation auch unabhängig vom Alter geprüft werden.",
      },
      {
        q: "Wie wird der Wert meiner Immobilie ermittelt?",
        a: "Grundlage ist ein unabhängiges Verkehrswertgutachten. Berücksichtigt werden Lage, Zustand, Größe, Baujahr, energetische Eigenschaften und vergleichbare Verkäufe in Ihrer Region. Das Gutachten erhalten Sie schriftlich.",
      },
    ],
  },
  {
    group: "Zum Zwei-Phasen-Modell",
    items: [
      {
        q: "Was ist das Zwei-Phasen-Wohnrecht?",
        a: "Sie verkaufen Ihre Immobilie an WohnKapital und erhalten ein gestaffeltes Wohnrecht. Phase 1 läuft für eine vereinbarte Dauer von 5 bis 15 Jahren und ist für Sie mietfrei. Das Wohnrecht wird erstrangig im Grundbuch eingetragen. Wenn Sie länger bleiben möchten, beginnt Phase 2 mit einer Nutzungsentschädigung.",
      },
      {
        q: "Warum ist das Zwei-Phasen-Modell schon ab 65 möglich?",
        a: "Bei klassischen lebenslangen Wohnrechten ist die Wohndauer für den Käufer schwer kalkulierbar. Das variable Wohnrecht von 5 bis 15 Jahren macht die Konstruktion planbarer und ermöglicht zugleich eine substanzielle Einmalzahlung.",
      },
      {
        q: "Was passiert nach Ablauf der ersten Phase?",
        a: "Sie können wohnen bleiben. Das Wohnrecht geht in Phase 2 über, in der eine Nutzungsentschädigung anfällt, die sich an der ortsüblichen Vergleichsmiete orientiert. Dadurch entsteht kein Druck, sofort ausziehen zu müssen.",
      },
      {
        q: "Was passiert mit dem Erbe meiner Kinder?",
        a: "Die Immobilie geht mit dem Verkauf an WohnKapital über. Vererbbar bleibt der ausgezahlte Einmalbetrag beziehungsweise das, was davon nicht verbraucht wurde. Wir empfehlen, Kinder oder Vertrauenspersonen früh einzubeziehen.",
      },
    ],
  },
  {
    group: "Zum Verkauf mit Rückmiete",
    items: [
      {
        q: "Was unterscheidet Rückmiete von einem normalen Mietverhältnis?",
        a: "Sie verkaufen die Immobilie und bleiben als Mieter in Ihrem Zuhause. Die Konditionen werden vorab transparent vereinbart. WohnKapital übernimmt größere Instandhaltungen, während Sie planbare Mietkosten haben.",
      },
      {
        q: "Wie hoch ist die Miete und wann wird sie erhöht?",
        a: "Die Miete orientiert sich an der ortsüblichen Vergleichsmiete und wird vor Vertragsabschluss festgelegt. Die konkreten Regelungen zu möglichen Anpassungen sehen Sie im Angebot schwarz auf weiß.",
      },
      {
        q: "Was passiert, wenn der Käufer insolvent wird?",
        a: "Beim Zwei-Phasen-Modell ist Ihr Wohnrecht erstrangig im Grundbuch eingetragen. Beim Verkauf mit Rückmiete besteht der Schutz über den Mietvertrag und das geltende Mietrecht. Die Unterschiede besprechen wir transparent im Beratungsgespräch.",
      },
    ],
  },
  {
    group: "Zum Ablauf",
    items: [
      {
        q: "Ist das Angebot von WohnKapital verbindlich?",
        a: "Unser Angebot ist konkret kalkuliert und transparent. Verbindlich wird es erst, wenn Sie es annehmen und beim Notar unterzeichnen. Bis dahin können Sie das Angebot in Ruhe prüfen und mit Ihrer Familie oder einem unabhängigen Berater besprechen.",
      },
      {
        q: "Welche Kosten entstehen für mich?",
        a: "Die Kosten für Verkehrswertgutachten, Notariat und Grundbucheintragung übernimmt in der Regel WohnKapital. Eine eigene anwaltliche Prüfung empfehlen wir Ihnen; diese Kosten tragen Sie selbst.",
      },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((group) =>
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

export default function Page() {
  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
              <a href="#modelle" className={styles.navLink}>Modelle</a>
              <a href="#ablauf" className={styles.navLink}>Ablauf</a>
              <a href="#vorteile" className={styles.navLink}>Vorteile</a>
              <a href="#faq" className={styles.navLink}>Fragen</a>
            </nav>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <span className={styles.eyebrow}>Immobilienverrentung ab 65 Jahren</span>
              <h1 className={styles.heroTitle}>
                Im Haus bleiben.
                <br />
                <em className={styles.italic}>Im Leben gewinnen.</em>
              </h1>
              <p className={styles.heroLead}>
                Setzen Sie das Kapital aus Ihrer Immobilie frei und bleiben Sie zuhause wohnen.
                WohnKapital bietet zwei Wege: Vollverrentung mit mietfreiem Wohnrecht ab
                65 Jahren oder Verkauf mit Rückmiete für maximale Auszahlung. Welcher Weg
                zu Ihnen passt, klären wir gemeinsam.
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
              <h3 className={styles.trustTitle}>Erstrangiges Wohnrecht</h3>
              <p className={styles.trustText}>
                Ihr Wohnrecht wird notariell beurkundet und erstrangig im Grundbuch
                eingetragen. Selbst bei Eigentümerwechsel oder Insolvenz bleibt es bestehen.
              </p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustNumber}>02</div>
              <h3 className={styles.trustTitle}>Substanzielle Einmalzahlung</h3>
              <p className={styles.trustText}>
                Sie erhalten je nach Modell eine direkte Auszahlung aus dem Immobilienwert.
                Die Berechnung ist transparent und wird vor einer Entscheidung erläutert.
              </p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustNumber}>03</div>
              <h3 className={styles.trustTitle}>Keine Sanierungssorgen</h3>
              <p className={styles.trustText}>
                Heizung, Dach, Fassade: WohnKapital übernimmt die kostenintensive
                Instandhaltung. Sie wohnen, wir kümmern uns um das Haus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.problemSolution}>
        <div className={styles.container}>
          <div className={styles.psGrid}>
            <div className={styles.psBlock}>
              <span className={styles.psLabel}>Die stille Lücke</span>
              <h2 className={styles.psHeading}>
                Reich an Mauern,
                <br />
                knapp an Mitteln.
              </h2>
              <p className={styles.psText}>
                Viele Eigentümer leben in einem Haus, das mehrere hunderttausend Euro wert
                ist. Doch dieses Vermögen ist gebunden. Es finanziert keine Sanierung, keine
                Pflege, keine Reise und keinen zusätzlichen Spielraum im Alltag. Ein klassischer
                Verkauf hieße oft: Umzug, Abschied von der Nachbarschaft und ein neuer
                Mietvertrag mit allen Risiken.
              </p>
            </div>
            <div className={`${styles.psBlock} ${styles.psBlockSolution}`}>
              <span className={styles.psLabel}>Unsere Lösung</span>
              <h2 className={styles.psHeading}>
                Zwei Wege.
                <br />
                Ein klares Ziel.
              </h2>
              <p className={styles.psText}>
                WohnKapital kauft Ihre Immobilie und zahlt Ihnen einen substanziellen Betrag
                aus. Sie bleiben in Ihrem Zuhause wohnen. Je nachdem, was für Sie wichtiger
                ist, wählen wir gemeinsam den passenden Weg: das Zwei-Phasen-Modell mit
                Wohnrecht im Grundbuch oder den Verkauf mit Rückmiete.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="modelle" className={styles.modelle}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Modelle im Überblick</span>
            <h2 className={styles.sectionTitle}>Zwei Modelle. Welches passt zu Ihnen?</h2>
            <p className={styles.sectionLead}>
              Die Wahl hängt davon ab, was Ihnen wichtiger ist. Manche Eigentümer wollen
              mietfrei wohnen und nehmen dafür eine geringere Einmalzahlung in Kauf. Andere
              wollen den maximalen Verkaufserlös sofort und akzeptieren dafür laufende
              Mietzahlungen.
            </p>
          </div>

          <div className={styles.modelleGrid}>
            <article className={`${styles.modellCard} ${styles.modellCardA}`}>
              <span className={styles.modellEyebrow}>WohnKapital-Innovation</span>
              <h3 className={styles.modellTitle}>Zwei-Phasen-Wohnrecht</h3>
              <p className={styles.modellTagline}>
                <em>Mietfrei wohnen, schon ab 65.</em>
              </p>
              <p className={styles.modellHow}>
                Sie verkaufen Ihre Immobilie an WohnKapital und erhalten eine Einmalzahlung.
                In Phase 1 wohnen Sie für 5 bis 15 Jahre mietfrei, abgesichert durch ein
                erstrangiges Wohnrecht im Grundbuch. In Phase 2 können Sie weiter wohnen und
                zahlen eine Nutzungsentschädigung.
              </p>
              <div className={styles.modellSection}>
                <h4 className={styles.modellSubtitle}>Stärken</h4>
                <ul className={styles.modellList}>
                  <li>Mietfreies Wohnen in der vereinbarten ersten Phase</li>
                  <li>Erstrangiges Wohnrecht im Grundbuch</li>
                  <li>Schon ab 65 Jahren möglich</li>
                  <li>Schutz, falls Sie länger bleiben möchten als zunächst geplant</li>
                </ul>
              </div>
              <div className={styles.modellSection}>
                <h4 className={styles.modellSubtitle}>Passt zu Ihnen, wenn</h4>
                <ul className={styles.modellList}>
                  <li>Sie planbare Wohnkosten ohne laufende Miete wünschen</li>
                  <li>Sie auf hohe rechtliche Absicherung Wert legen</li>
                  <li>Sie eine klare Laufzeit für Ihr Wohnrecht bevorzugen</li>
                </ul>
              </div>
            </article>

            <article className={`${styles.modellCard} ${styles.modellCardB}`}>
              <span className={styles.modellEyebrow}>Maximale Auszahlung</span>
              <h3 className={styles.modellTitle}>Verkauf mit Rückmiete</h3>
              <p className={styles.modellTagline}>
                <em>Voller Verkehrswert, dafür laufende Miete.</em>
              </p>
              <p className={styles.modellHow}>
                Sie verkaufen Ihre Immobilie an WohnKapital zum Verkehrswert und erhalten
                den Kaufpreis ausgezahlt. Sie bleiben als Mieter wohnen, zahlen eine vorab
                vereinbarte Miete und WohnKapital übernimmt größere Instandhaltungen.
              </p>
              <div className={styles.modellSection}>
                <h4 className={styles.modellSubtitle}>Stärken</h4>
                <ul className={styles.modellList}>
                  <li>Höchste Einmalzahlung durch Verkauf zum Verkehrswert</li>
                  <li>Klare Trennung: Sie wohnen, WohnKapital besitzt</li>
                  <li>Keine Sanierungssorgen bei größeren Instandhaltungen</li>
                  <li>Auch bei besonderen Lebenssituationen prüfbar</li>
                </ul>
              </div>
              <div className={styles.modellSection}>
                <h4 className={styles.modellSubtitle}>Passt zu Ihnen, wenn</h4>
                <ul className={styles.modellList}>
                  <li>Sie den maximalen Verkaufserlös sofort benötigen</li>
                  <li>Sie laufende Miete als planbare Wohnkosten akzeptieren</li>
                  <li>Sie Wert auf hohe Liquidität legen</li>
                </ul>
              </div>
            </article>
          </div>

          <p className={styles.modelleHint}>
            Welches Modell für Sie das richtige ist, hängt von Ihrem Alter, der Immobilie
            und Ihren Wünschen ab. Wir rechnen Ihnen beide Varianten konkret durch.
          </p>
        </div>
      </section>

      <section id="ablauf" className={styles.process}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>So läuft es ab</span>
            <h2 className={styles.sectionTitle}>Vier Schritte zur Auszahlung</h2>
            <p className={styles.sectionLead}>
              Klar strukturiert, ohne Eile. Sie entscheiden in jedem Schritt, ob Sie
              weitergehen möchten.
            </p>
          </div>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <h3 className={styles.stepTitle}>Erstgespräch</h3>
              <p className={styles.stepText}>
                Persönliches Gespräch, telefonisch oder bei Ihnen vor Ort. Wir klären Ihre
                Situation, beantworten Fragen und beziehen auf Wunsch Ihre Familie ein.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <h3 className={styles.stepTitle}>Verkehrswertgutachten</h3>
              <p className={styles.stepText}>
                Ein unabhängiger Sachverständiger ermittelt den Verkehrswert auf Basis von
                Lage, Zustand, Größe und vergleichbaren Verkäufen.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <h3 className={styles.stepTitle}>Angebot und Vergleich</h3>
              <p className={styles.stepText}>
                Sie bekommen ein konkretes Angebot mit allen Zahlen schwarz auf weiß und
                können die Varianten nachvollziehbar vergleichen.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>4</span>
              <h3 className={styles.stepTitle}>Notartermin und Auszahlung</h3>
              <p className={styles.stepText}>
                Beim Notar wird der Vertrag beurkundet, Ihr Wohnrecht oder Mietvertrag
                rechtssicher fixiert und der Kaufpreis ausgezahlt.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section id="vorteile" className={styles.benefits}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Vorteile</span>
            <h2 className={styles.sectionTitle}>Was WohnKapital für Sie bedeutet</h2>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitColumn}>
              <h3 className={styles.benefitColTitle}>Für Eigentümer</h3>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Substanzielle Einmalzahlung</strong>
                    <p className={styles.benefitText}>
                      Sie nutzen gebundenes Immobilienvermögen für das, was Ihnen wichtig ist.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Zuhause bleiben</strong>
                    <p className={styles.benefitText}>
                      In beiden Modellen wohnen Sie weiter in Ihrer vertrauten Umgebung.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Notarielle Absicherung</strong>
                    <p className={styles.benefitText}>
                      Wohnrecht im Grundbuch oder Mietvertrag mit klar geregelten Konditionen.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className={`${styles.benefitColumn} ${styles.benefitColumnAlt}`}>
              <h3 className={styles.benefitColTitle}>Mehr Sicherheit im Alltag</h3>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Keine Kreditbelastung</strong>
                    <p className={styles.benefitText}>
                      Sie wandeln Vermögen um, statt einen Kredit aufzunehmen.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Schluss mit Sanierungssorgen</strong>
                    <p className={styles.benefitText}>
                      Kostenintensive Instandhaltung wie Heizung, Dach und Fassade übernimmt
                      WohnKapital.
                    </p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <span className={styles.benefitMark} aria-hidden="true" />
                  <div>
                    <strong className={styles.benefitTitle}>Familie einbeziehbar</strong>
                    <p className={styles.benefitText}>
                      Kinder und Vertrauenspersonen sind bei Beratung, Gutachten und Notartermin
                      willkommen.
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
          <div className={styles.faqGroups}>
            {faqs.map((group) => (
              <div key={group.group} className={styles.faqGroup}>
                <h3 className={styles.faqGroupTitle}>{group.group}</h3>
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

      <section id="kontakt" className={styles.finalCta}>
        <div className={styles.container}>
          <div className={styles.finalInner}>
            <h2 className={styles.finalTitle}>
              Wie viel Kapital steckt
              <br />
              in Ihrer Immobilie?
            </h2>
            <p className={styles.finalLead}>
              Ein erstes Gespräch ist unverbindlich und kostenfrei. Wir nehmen uns Zeit,
              beziehen auf Wunsch Ihre Familie ein und rechnen Ihnen beide Modelle
              individuell durch.
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
              <a href="#modelle" className={styles.footerLink}>Modelle</a>
              <a href="#ablauf" className={styles.footerLink}>Ablauf</a>
              <a href="#vorteile" className={styles.footerLink}>Vorteile</a>
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
