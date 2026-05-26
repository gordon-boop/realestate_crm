import Image from "next/image";
import Link from "next/link";
import styles from "@/app/page.module.css";
import { footerLinks, mainNavigation, productTeasers } from "@/lib/site-content";

export type FaqItem = {
  q: string;
  a: string;
};

export type Crumb = {
  label: string;
  href: string;
};

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logoLink} aria-label="WohnKapital Startseite">
            <Image src="/brand/wohnkapital-logo.svg" alt="WohnKapital" width={170} height={36} priority />
          </Link>
          <nav className={styles.nav} aria-label="Hauptnavigation">
            {mainNavigation.map((item) =>
              "items" in item ? (
                <div key={item.label} className={styles.navGroup}>
                  <Link href={item.href} className={styles.navLink}>{item.label}</Link>
                  <div className={styles.navDropdown}>
                    {item.items.map((child) => (
                      <Link key={child.href} href={child.href}>{child.label}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href} className={styles.navLink}>{item.label}</Link>
              )
            )}
          </nav>
          <div className={styles.headerActions}>
            <span className={styles.headerPhone}>Hotline: 0800 000 000</span>
            <Link href="/#kontakt" className={styles.headerContact}>Kontakt</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image src="/brand/wohnkapital-logo.svg" alt="WohnKapital" width={150} height={32} />
            <p className={styles.footerTagline}>Im Haus bleiben. Im Leben gewinnen.</p>
            <p className={styles.footerSmall}>
              WohnKapital unterstützt Eigentümer dabei, Kapital aus der Immobilie freizusetzen
              und die Wohnsituation transparent zu planen.
            </p>
          </div>
          <nav className={styles.footerNav} aria-label="Footer">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.footerLink}>{link.label}</Link>
            ))}
          </nav>
          <div className={styles.footerLegal}>
            <Link href="/#kontakt" className={styles.footerLink}>Kontakt</Link>
            <Link href="/login" className={styles.footerLink}>Maklerportal Login</Link>
            <Link href="/impressum" className={styles.footerLink}>Impressum</Link>
            <Link href="/datenschutz" className={styles.footerLink}>Datenschutz</Link>
            <span className={styles.footerCopy}>© {new Date().getFullYear()} WohnKapital</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.main}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 ? <span aria-hidden="true">/</span> : null}
          <Link href={item.href}>{item.label}</Link>
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  cta = "Kostenlose Ersteinschätzung anfragen",
  ctaHref = "/#rechner",
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  cta?: string;
  ctaHref?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <section className={styles.pageHeader}>
      <div className={styles.container}>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageLead}>{lead}</p>
        <div className={styles.heroCtas}>
          <Link href={ctaHref} className={styles.btnPrimary}>{cta}</Link>
          <Link href="/so-funktioniert-es" className={styles.btnSecondary}>Ablauf ansehen</Link>
        </div>
      </div>
    </section>
  );
}

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Im Haus bleiben.
              <br />
              <em className={styles.italic}>Im Leben gewinnen.</em>
            </h1>
            <p className={styles.heroLead}>
              WohnKapital ermöglicht Eigentümern, Kapital aus der eigenen Immobilie freizusetzen
              und weiterhin im vertrauten Zuhause wohnen zu bleiben.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/#rechner" className={styles.btnPrimary}>
                Kostenlose Ersteinschätzung anfragen
              </Link>
              <Link href="/so-funktioniert-es" className={styles.btnSecondary}>So funktioniert es</Link>
            </div>
            <p className={styles.heroTrustHint}>Unverbindlich. Persönlich. Transparent.</p>
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
  );
}

export function TrustSection() {
  const items = [
    {
      title: "Notariell begleitet",
      text: "Der Verkauf einer Immobilie wird notariell beurkundet. Alle relevanten Vereinbarungen werden vorab verständlich besprochen.",
    },
    {
      title: "Transparente Bewertung",
      text: "Die Grundlage bilden nachvollziehbare Marktdaten und, vor einem verbindlichen Angebot, ein unabhängiges Gutachten.",
    },
    {
      title: "Keine versteckten Versprechen",
      text: "WohnKapital erklärt Chancen, Grenzen und Kosten offen. Es gibt keine unrealistischen Garantien.",
    },
  ];

  return (
    <section className={styles.trust} aria-label="Vertrauen">
      <div className={styles.container}>
        <div className={styles.trustGrid}>
          {items.map((item, index) => (
            <div key={item.title} className={styles.trustItem}>
              <div className={styles.trustNumber}>{String(index + 1).padStart(2, "0")}</div>
              <h2 className={styles.trustTitle}>{item.title}</h2>
              <p className={styles.trustText}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductTeaserCards() {
  return (
    <section className={styles.benefits}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Unsere Lösungen</h2>
          <p className={styles.sectionLead}>
            Nicht jede Immobilie und nicht jeder Lebensplan passt in dasselbe Modell.
            Deshalb prüfen wir transparent, welcher Weg sinnvoll sein kann.
          </p>
        </div>
        <div className={styles.linkCardGrid}>
          {productTeasers.map((teaser) => (
            <Link key={teaser.href} href={teaser.href} className={styles.linkCard}>
              <h3>{teaser.title}</h3>
              <p>{teaser.text}</p>
              <span>Mehr erfahren</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSteps({
  steps,
  title = "So funktioniert es",
  lead = "Der Prozess ist bewusst klar strukturiert. Sie entscheiden in jedem Schritt, ob Sie weitergehen möchten.",
  cta,
  ctaHref = "/so-funktioniert-es",
}: {
  steps: readonly { title: string; text: string }[];
  title?: string;
  lead?: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <section className={styles.process}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionLead}>{lead}</p>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNum}>{index + 1}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
        {cta ? (
          <div className={styles.sectionAction}>
            <Link href={ctaHref} className={styles.btnSecondary}>{cta}</Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function FAQAccordion({ faqs }: { faqs: readonly FaqItem[] }) {
  return (
    <div className={styles.faqList}>
      {faqs.map((item) => (
        <details key={item.q} className={styles.faqItem}>
          <summary className={styles.faqQ}>{item.q}</summary>
          <div className={styles.faqA}>{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function CTASection({
  title = "Sie möchten wissen, welches Kapital in Ihrer Immobilie steckt?",
  text = "Ein erstes Gespräch ist unverbindlich und kostenfrei. Wir nehmen uns Zeit und rechnen Ihnen die Möglichkeiten nachvollziehbar durch.",
  cta = "Kostenlose Ersteinschätzung anfragen",
  href = "/#rechner",
}: {
  title?: string;
  text?: string;
  cta?: string;
  href?: string;
}) {
  return (
    <section id="kontakt" className={styles.finalCta}>
      <div className={styles.container}>
        <div className={styles.finalInner}>
          <h2 className={styles.finalTitle}>{title}</h2>
          <p className={styles.finalLead}>{text}</p>
          <Link href={href} className={styles.btnPrimaryLg}>{cta}</Link>
        </div>
      </div>
    </section>
  );
}

export function InternalLinkCards({ title = "Verwandte Themen" }: { title?: string }) {
  return (
    <section className={styles.related}>
      <div className={styles.container}>
        <h2 className={styles.relatedTitle}>{title}</h2>
        <div className={styles.linkCardGrid}>
          {productTeasers.map((teaser) => (
            <Link key={teaser.href} href={teaser.href} className={styles.linkCard}>
              <h3>{teaser.title}</h3>
              <p>{teaser.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ComparisonTable({
  rows,
}: {
  rows: readonly { label: string; left: string; right: string }[];
}) {
  return (
    <div className={styles.comparisonTable}>
      <div className={styles.comparisonHead}>
        <span>Kriterium</span>
        <span>Teilverkauf</span>
        <span>WohnKapital-Alternative</span>
      </div>
      {rows.map((row) => (
        <div key={row.label} className={styles.comparisonRow}>
          <strong>{row.label}</strong>
          <span>{row.left}</span>
          <span>{row.right}</span>
        </div>
      ))}
    </div>
  );
}

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `https://www.wohn-kapital.de${item.href}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
