"use client";
import { useState } from "react";

/* ─── Formatting ───────────────────────────────────────────────────────────── */
function formatMoney(n: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

/* ─── Types & constants (for calculator) ──────────────────────────────────── */
type CalcModel = "fixed_residential_right" | "sale_and_leaseback";
type CalcCondition = "very_good" | "good" | "average" | "renovation_needed";

const conditionFactors: Record<CalcCondition, number> = {
  very_good: 1,
  good: 0.98,
  average: 0.95,
  renovation_needed: 0.9,
};
const residentialRightRates: Record<number, number> = { 5: 0.15, 10: 0.28, 15: 0.4 };

function calculateEstimate(input: {
  marketValue: number;
  condition: CalcCondition;
  model: CalcModel;
  residentialRightYears: number;
}) {
  const adj = input.marketValue * conditionFactors[input.condition];
  if (input.model === "sale_and_leaseback") {
    return {
      payoutAmount: Math.round(adj * 0.46),
      note: "Rückmietmodell · ca. 46 % des Immobilienwerts",
    };
  }
  const rate = residentialRightRates[input.residentialRightYears] ?? 0.28;
  const wrValue = Math.round(adj * rate);
  const buffer = Math.round(adj * 0.12);
  return {
    payoutAmount: Math.round(adj - wrValue - buffer),
    note: `Befristetes Wohnrecht · ${input.residentialRightYears} Jahre mietfrei wohnen`,
  };
}

/* ─── FAQ data ─────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Muss ich aus meinem Haus ausziehen?",
    a: "Nein. Das ist das Herzstück unseres Modells. Sie verkaufen Ihre Immobilie an WohnKapital, erhalten eine hohe Einmalzahlung und behalten gleichzeitig ein gesichertes Wohnrecht in Ihrem Zuhause. Sie müssen nichts ändern – und niemanden fragen.",
  },
  {
    q: "Wie wird die Auszahlung berechnet?",
    a: "Die Auszahlung hängt vom Verkehrswert Ihrer Immobilie und vom gewählten Modell ab. Als grober Richtwert gilt: ca. 30–60 % des Immobilienwerts als Einmalzahlung. Den genauen Betrag berechnen wir Ihnen individuell – kostenlos und unverbindlich.",
  },
  {
    q: "Ist die Beratung kostenlos?",
    a: "Ja, vollständig. Das erste Gespräch, die unabhängige Immobilienbewertung durch einen zertifizierten Sachverständigen und alle weiteren Informationen sind für Sie kostenlos und unverbindlich. Auch die Notarkosten übernehmen wir.",
  },
  {
    q: "Was passiert mit dem Wohnrecht?",
    a: "Das Wohnrecht wird vertraglich festgelegt und erstrangig im Grundbuch eingetragen. Es gilt für die gesamte vereinbarte Laufzeit – unabhängig davon, ob die Immobilie später weiterverkauft wird. Ihr Recht bleibt bestehen.",
  },
  {
    q: "Kann meine Familie eingebunden werden?",
    a: "Ja, ausdrücklich. Wir empfehlen, Angehörige, einen Steuerberater oder Rechtsanwalt einzubeziehen. Wir nehmen uns die Zeit für alle Fragen und erklären alles verständlich – auch in mehreren Gesprächen.",
  },
  {
    q: "Entstehen Maklergebühren?",
    a: "Nein. Es entstehen keinerlei Maklergebühren oder Provisionen. WohnKapital kauft direkt – ohne Zwischenhändler. Alle Kosten trägt WohnKapital.",
  },
  {
    q: "Wie lange dauert der Prozess?",
    a: "Typischerweise 6 bis 8 Wochen vom ersten Gespräch bis zur vollständigen Auszahlung. Wir arbeiten strukturiert, aber ohne Druck. Sie haben ausreichend Zeit, sich mit Ihrer Familie zu beraten.",
  },
];

/* ─── FAQ accordion ────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #dde8dd" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "22px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontWeight: 600,
          fontSize: "17px",
          color: "#1a2d1a",
          lineHeight: 1.4,
        }}
      >
        <span>{q}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#196B24"
          strokeWidth="2.5"
          width="20"
          height="20"
          style={{ flexShrink: 0, transition: "transform 220ms", transform: open ? "rotate(180deg)" : "none" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <p style={{ margin: "0 0 22px", color: "#4a5a4a", lineHeight: 1.8, fontSize: "16px", maxWidth: "720px" }}>
          {a}
        </p>
      )}
    </div>
  );
}

/* ─── Lead form (hero) ─────────────────────────────────────────────────────── */
function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ plz: "", type: "", value: "", age: "" });

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "36px 20px" }}>
        <div
          style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "#196B24", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 18px", color: "#fff",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="26" height="26">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 style={{ color: "#196B24", margin: "0 0 10px", fontSize: "20px", fontWeight: 700 }}>
          Vielen Dank für Ihre Anfrage
        </h3>
        <p style={{ color: "#4a5a4a", margin: 0, lineHeight: 1.7, fontSize: "16px" }}>
          Wir melden uns persönlich bei Ihnen und erklären die nächsten Schritte verständlich.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
      style={{ display: "grid", gap: "14px" }}
    >
      <div className="lf-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="field">
          <label>Postleitzahl</label>
          <input
            type="text" inputMode="numeric" placeholder="z. B. 80331"
            maxLength={5} required value={form.plz}
            onChange={(e) => setForm((f) => ({ ...f, plz: e.target.value }))}
          />
        </div>
        <div className="field">
          <label>Immobilientyp</label>
          <select required value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="">Bitte wählen</option>
            <option value="house">Einfamilienhaus</option>
            <option value="semi">Doppelhaus / Reihenhaus</option>
            <option value="apartment">Eigentumswohnung</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>
        <div className="field">
          <label>Geschätzter Immobilienwert</label>
          <select required value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}>
            <option value="">Bitte wählen</option>
            <option value="200-300">200.000 – 300.000 €</option>
            <option value="300-500">300.000 – 500.000 €</option>
            <option value="500-800">500.000 – 800.000 €</option>
            <option value="800-1200">800.000 – 1.200.000 €</option>
            <option value="1200+">Über 1.200.000 €</option>
          </select>
        </div>
        <div className="field">
          <label>Alter des jüngsten Eigentümers</label>
          <select required value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}>
            <option value="">Bitte wählen</option>
            <option value="65-69">65 – 69 Jahre</option>
            <option value="70-74">70 – 74 Jahre</option>
            <option value="75-79">75 – 79 Jahre</option>
            <option value="80+">80 Jahre oder älter</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        style={{
          marginTop: "4px", minHeight: "54px", background: "#196B24",
          border: "none", borderRadius: "8px", color: "#fff",
          fontSize: "17px", fontWeight: 700, cursor: "pointer",
          letterSpacing: "0.01em",
        }}
      >
        Auszahlung unverbindlich berechnen
      </button>
      <p style={{ margin: 0, textAlign: "center", fontSize: "13px", color: "#7a8a7a" }}>
        Kostenlos &amp; unverbindlich · Keine Weitergabe an Dritte
      </p>
    </form>
  );
}

/* ─── Interactive calculator ───────────────────────────────────────────────── */
function Calculator() {
  const [value, setValue] = useState(400000);
  const [cond, setCond] = useState<CalcCondition>("good");
  const [model, setModel] = useState<CalcModel>("fixed_residential_right");
  const [yrs, setYrs] = useState(10);

  const estimate = calculateEstimate({ marketValue: value, condition: cond, model, residentialRightYears: yrs });

  return (
    <div>
      {/* Model tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {(
          [
            { key: "fixed_residential_right", label: "Befristetes Wohnrecht" },
            { key: "sale_and_leaseback", label: "Rückmietmodell" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setModel(key)}
            style={{
              flex: 1, minHeight: "44px", border: "2px solid",
              borderColor: model === key ? "#196B24" : "#d8e8d8",
              borderRadius: "8px",
              background: model === key ? "#196B24" : "#fff",
              color: model === key ? "#fff" : "#4a5a4a",
              fontWeight: 600, cursor: "pointer", fontSize: "14px",
              transition: "all 150ms", padding: "0 8px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        <div className="field">
          <label>Geschätzter Immobilienwert</label>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <input
              type="range" min={150000} max={2000000} step={25000}
              value={value} onChange={(e) => setValue(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#196B24" }}
            />
            <span style={{ minWidth: "120px", fontWeight: 800, color: "#196B24", fontSize: "17px", textAlign: "right" }}>
              {formatMoney(value)}
            </span>
          </div>
        </div>

        <div className="field">
          <label>Zustand der Immobilie</label>
          <select value={cond} onChange={(e) => setCond(e.target.value as CalcCondition)}>
            <option value="very_good">Sehr gut / Neuwertig</option>
            <option value="good">Gut gepflegt</option>
            <option value="average">Durchschnittlich</option>
            <option value="renovation_needed">Renovierungsbedürftig</option>
          </select>
        </div>

        {model === "fixed_residential_right" && (
          <div className="field">
            <label>Gewünschte Wohnrechtdauer</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {([5, 10, 15] as const).map((y) => (
                <button
                  key={y}
                  onClick={() => setYrs(y)}
                  style={{
                    flex: 1, minHeight: "42px", border: "2px solid",
                    borderColor: yrs === y ? "#196B24" : "#d8e8d8",
                    borderRadius: "6px",
                    background: yrs === y ? "#e8f5ea" : "#fff",
                    color: yrs === y ? "#196B24" : "#4a5a4a",
                    fontWeight: 700, cursor: "pointer", fontSize: "14px", transition: "all 150ms",
                  }}
                >
                  {y} Jahre
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      <div
        style={{
          marginTop: "28px", padding: "28px 24px", borderRadius: "12px",
          background: "linear-gradient(135deg, #196B24 0%, #0f4a1a 100%)", color: "#fff",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: 700, opacity: 0.65, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Geschätzte Einmalzahlung
        </div>
        <div style={{ fontSize: "clamp(32px, 6vw, 50px)", fontWeight: 900, lineHeight: 1, color: "#c9e5a2" }}>
          {formatMoney(estimate.payoutAmount)}
        </div>
        <div style={{ marginTop: "10px", fontSize: "14px", opacity: 0.8 }}>
          {estimate.note}
        </div>
        <div style={{ marginTop: "12px", fontSize: "12px", opacity: 0.48 }}>
          Unverbindliche Schätzung · Genaues Angebot nach kostenloser Bewertung
        </div>
      </div>

      <a
        href="#kontakt"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", marginTop: "14px", minHeight: "52px",
          background: "#196B24", border: "none", borderRadius: "8px",
          color: "#fff", fontSize: "16px", fontWeight: 700,
          textDecoration: "none", cursor: "pointer",
        }}
      >
        Kostenloses Erstgespräch anfragen →
      </a>
    </div>
  );
}

/* ─── Contact form ─────────────────────────────────────────────────────────── */
function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div
          style={{
            width: "60px", height: "60px", borderRadius: "50%",
            background: "#196B24", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 20px", color: "#fff",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 style={{ color: "#196B24", margin: "0 0 12px", fontSize: "21px", fontWeight: 700 }}>
          Vielen Dank für Ihre Anfrage
        </h3>
        <p style={{ color: "#4a5a4a", margin: 0, lineHeight: 1.7, fontSize: "16px" }}>
          Wir melden uns persönlich bei Ihnen – in der Regel innerhalb eines Werktags.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "grid", gap: "14px" }}>
      <div className="cf-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div className="field">
          <label>Ihr Name</label>
          <input type="text" placeholder="Maria Müller" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="field">
          <label>Telefonnummer</label>
          <input type="tel" placeholder="089 / 123 456" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
      </div>
      <div className="field">
        <label>E-Mail-Adresse</label>
        <input type="email" placeholder="maria.mueller@email.de" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <div className="field">
        <label>Ihre Nachricht (optional)</label>
        <textarea rows={3} placeholder="Ich möchte mehr über das Modell erfahren..." value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} style={{ resize: "vertical" }} />
      </div>
      <button
        type="submit"
        style={{
          minHeight: "54px", background: "#196B24", border: "none",
          borderRadius: "8px", color: "#fff", fontSize: "17px",
          fontWeight: 700, cursor: "pointer", marginTop: "4px",
        }}
      >
        Jetzt kostenlos beraten lassen →
      </button>
      <p style={{ margin: 0, fontSize: "13px", color: "#7a8a7a", textAlign: "center" }}>
        Ihre Daten werden vertraulich behandelt · Keine Weitergabe an Dritte
      </p>
    </form>
  );
}

/* ─── Shared section heading ───────────────────────────────────────────────── */
function SectionHead({ title, sub, center = true }: { title: string; sub?: string; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: "48px" }}>
      <h2
        style={{
          fontFamily: '"Aptos Display", Aptos, "Segoe UI", Georgia, sans-serif',
          fontSize: "clamp(24px, 3.5vw, 38px)",
          fontWeight: 800,
          color: "#1a2d1a",
          margin: "0 0 14px",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ color: "#5a6a5a", fontSize: "17px", maxWidth: "600px", margin: center ? "0 auto" : 0, lineHeight: 1.7 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [navOpen, setNavOpen] = useState(false);

  const navLinks = [
    { href: "#prozess", label: "So funktioniert's" },
    { href: "#vorteile", label: "Vorteile" },
    { href: "#rechner", label: "Rechner" },
    { href: "#faq", label: "FAQ" },
  ];

  // Button shared styles
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minHeight: "54px", padding: "0 30px", fontSize: "17px", fontWeight: 700,
    background: "#196B24", border: "none", color: "#fff",
    borderRadius: "8px", textDecoration: "none", cursor: "pointer",
    letterSpacing: "0.01em",
  };
  const btnOutline: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minHeight: "54px", padding: "0 26px", fontSize: "17px", fontWeight: 600,
    background: "transparent", border: "2px solid #196B24", color: "#196B24",
    borderRadius: "8px", textDecoration: "none", cursor: "pointer",
  };

  return (
    <>
      <style>{`
        .lp-mobile-btn { display: none; }
        @media (max-width: 700px) {
          .lp-mobile-btn { display: block !important; }
          .lp-desktop-nav { display: none !important; }
        }
        @media (max-width: 920px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-img { display: none !important; }
        }
        @media (max-width: 720px) {
          .two-col { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
          .step-grid { grid-template-columns: 1fr 1fr !important; }
          .audience-grid { grid-template-columns: 1fr !important; }
          .lf-grid { grid-template-columns: 1fr !important; }
          .cf-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .step-grid { grid-template-columns: 1fr !important; }
        }
        .nav-link:hover { background: #e8f5ea; color: #196B24; }
        .lp-btn-primary:hover { background: #33004a !important; border-color: #33004a !important; }
        .lp-btn-outline:hover { background: #e8f5ea !important; }
        a.lp-link { color: #196B24; font-weight: 700; text-decoration: none; font-size: 15px; }
        a.lp-link:hover { text-decoration: underline; }
      `}</style>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <header className="topbar" style={{ padding: "0 clamp(20px, 5vw, 60px)" }}>
        <a href="/" className="brand">
          <img src="/brand/wohnkapital-logo.svg" alt="WohnKapital" className="brand-logo" style={{ width: "158px" }} />
        </a>
        <nav className="topnav lp-desktop-nav">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className="nav-link">
              {label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="btn lp-btn-primary"
            style={{ marginLeft: "12px", padding: "0 20px", fontWeight: 700, fontSize: "15px", background: "#44005C", border: "1px solid #44005C", color: "#fff" }}
          >
            Beratung anfragen
          </a>
        </nav>
        <button
          onClick={() => setNavOpen((o) => !o)}
          className="lp-mobile-btn"
          aria-label="Menü öffnen"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#196B24" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
            {navOpen
              ? <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              : <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            }
          </svg>
        </button>
      </header>

      {navOpen && (
        <div style={{
          position: "sticky", top: "72px", zIndex: 19,
          background: "#fff", borderBottom: "1px solid #dde8dd",
          padding: "12px 20px 18px", display: "flex", flexDirection: "column", gap: "4px",
        }}>
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className="nav-link" onClick={() => setNavOpen(false)} style={{ display: "block" }}>
              {label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="btn lp-btn-primary"
            onClick={() => setNavOpen(false)}
            style={{ marginTop: "8px", justifyContent: "center", display: "flex", background: "#44005C", border: "1px solid #44005C", color: "#fff" }}
          >
            Beratung anfragen
          </a>
        </div>
      )}

      <main>
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          id="hero"
          style={{
            position: "relative",
            background: "#f5f9f5",
            padding: "clamp(56px, 9vw, 108px) clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #dde8dd",
          }}
        >
          <div
            className="hero-grid"
            style={{
              maxWidth: "1200px", margin: "0 auto",
              display: "grid", gridTemplateColumns: "1fr 520px",
              gap: "clamp(24px, 4vw, 56px)", alignItems: "center",
            }}
          >
            {/* Left: text */}
            <div>
              <h1
                style={{
                  fontFamily: '"Aptos Display", Aptos, "Segoe UI", Georgia, sans-serif',
                  fontSize: "clamp(34px, 5.5vw, 60px)",
                  fontWeight: 800,
                  lineHeight: 1.12,
                  margin: "0 0 24px",
                  color: "#1a2d1a",
                  letterSpacing: "-0.01em",
                }}
              >
                Immobilie verkaufen.
                <br />
                Zuhause wohnen bleiben.
                <br />
                <span style={{ color: "#196B24" }}>Finanziell frei werden.</span>
              </h1>
              <p
                style={{
                  fontSize: "clamp(16px, 1.8vw, 19px)",
                  color: "#4a5a4a",
                  maxWidth: "540px",
                  lineHeight: 1.78,
                  margin: "0 0 36px",
                }}
              >
                Mit WohnKapital erhalten Eigentümer ab 65 Jahren eine hohe Einmalzahlung
                aus ihrer Immobilie und behalten zugleich ihr Zuhause. Persönlich beraten,
                transparent berechnet und rechtlich klar geregelt.
              </p>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <a href="#lead" style={btnPrimary} className="lp-btn-primary">
                  Kostenlose Ersteinschätzung starten
                </a>
                <a href="#prozess" style={btnOutline} className="lp-btn-outline">
                  So funktioniert WohnKapital
                </a>
              </div>

              {/* Trust stats */}
              <div
                style={{
                  display: "flex", gap: "clamp(20px, 4vw, 48px)",
                  marginTop: "44px", flexWrap: "wrap",
                  paddingTop: "32px", borderTop: "1px solid #cce0cc",
                }}
              >
                {[
                  { value: "ab 65", label: "Mindestalter" },
                  { value: "0 €", label: "Maklergebühren" },
                  { value: "6–8 Wo.", label: "bis zur Auszahlung" },
                  { value: "100 %", label: "kostenlose Beratung" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div style={{ fontSize: "clamp(20px, 2.8vw, 30px)", fontWeight: 800, color: "#196B24", lineHeight: 1 }}>
                      {value}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6a7a6a", marginTop: "5px", lineHeight: 1.3 }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: photo */}
            <div className="hero-img" style={{ position: "relative" }}>
              <img
                src="/hero-couple.png"
                alt="Älteres Ehepaar genießt ihr Eigenheim"
                style={{
                  width: "100%", height: "540px", objectFit: "cover", objectPosition: "55% 28%",
                  borderRadius: "16px",
                  boxShadow: "0 20px 48px rgba(0,0,0,0.16)",
                  display: "block",
                }}
              />
              {/* Floating badge */}
              <div
                style={{
                  position: "absolute", bottom: "24px", left: "-20px",
                  background: "#fff", borderRadius: "12px",
                  padding: "14px 18px", boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                  display: "flex", alignItems: "center", gap: "12px", minWidth: "210px",
                }}
              >
                <div
                  style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "#196B24", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#fff", flexShrink: 0,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "#1a2d1a" }}>Wohnrecht gesichert</div>
                  <div style={{ fontSize: "12px", color: "#6a7a6a", marginTop: "2px" }}>grundbuchlich eingetragen</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LEAD FORM ─────────────────────────────────────────────────────── */}
        <section
          id="lead"
          style={{
            background: "#fff",
            padding: "72px clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #e4ede4",
          }}
        >
          <div style={{ maxWidth: "880px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, "Segoe UI", sans-serif',
                  fontSize: "clamp(24px, 3.5vw, 36px)",
                  fontWeight: 800, color: "#1a2d1a", margin: "0 0 12px",
                }}
              >
                Was wäre Ihre Immobilie wert?
              </h2>
              <p style={{ color: "#5a6a5a", fontSize: "17px", margin: 0, lineHeight: 1.7 }}>
                Geben Sie einige Angaben zu Ihrer Immobilie ein. Wir melden uns persönlich
                bei Ihnen und erklären verständlich, welche Auszahlung möglich wäre.
              </p>
            </div>
            <div
              style={{
                background: "#f5f9f5",
                border: "1px solid #cce0cc",
                borderRadius: "16px",
                padding: "clamp(24px, 4vw, 44px)",
                boxShadow: "0 4px 24px rgba(25,107,36,0.07)",
              }}
            >
              <LeadForm />
            </div>
          </div>
        </section>

        {/* ── TRUST ─────────────────────────────────────────────────────────── */}
        <section
          style={{
            background: "#f5f9f5",
            padding: "80px clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #dde8dd",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <SectionHead
              title="Warum Eigentümer WohnKapital vertrauen können"
              sub="Wir verstehen, dass dieser Schritt gut überlegt sein muss. Transparenz, Sicherheit und persönliche Begleitung sind für uns selbstverständlich."
            />
            <div
              className="trust-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
            >
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="#196B24" width="32" height="32">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                    </svg>
                  ),
                  title: "Erfahrung aus der Praxis",
                  desc: "Das Team hat langjährige Erfahrung mit Immobilienverrentung und dem Aufbau entsprechender Immobilienportfolios.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="#196B24" width="32" height="32">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  ),
                  title: "Wohnrecht rechtlich abgesichert",
                  desc: "Das Wohnrecht wird vertraglich geregelt und erstrangig im Grundbuch eingetragen – unabhängig von späteren Eigentümerwechseln.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="#196B24" width="32" height="32">
                      <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.34 8-7 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2h-2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z" />
                    </svg>
                  ),
                  title: "Keine Entscheidung unter Druck",
                  desc: "Kostenlose Erstberatung, transparente Berechnung und ausreichend Zeit zur Prüfung mit Familie, Steuerberater oder Rechtsanwalt.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  style={{
                    background: "#fff",
                    border: "1px solid #d8e8d8",
                    borderRadius: "14px",
                    padding: "32px 28px",
                    boxShadow: "0 2px 12px rgba(25,107,36,0.05)",
                  }}
                >
                  <div style={{ marginBottom: "18px" }}>{icon}</div>
                  <h3 style={{ color: "#1a2d1a", fontSize: "18px", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.3 }}>
                    {title}
                  </h3>
                  <p style={{ color: "#4a5a4a", fontSize: "15px", lineHeight: 1.78, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section
          id="prozess"
          style={{
            background: "#fff",
            padding: "80px clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #e4ede4",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <SectionHead
              title="So funktioniert WohnKapital"
              sub="Vier klare Schritte – von der ersten Anfrage bis zur Auszahlung und Ihrem gesicherten Wohnrecht."
            />
            <div
              className="step-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}
            >
              {[
                {
                  step: "1",
                  title: "Kostenlose Ersteinschätzung",
                  desc: "Sie geben erste Informationen zu Ihrer Immobilie ein. Wir melden uns persönlich bei Ihnen.",
                },
                {
                  step: "2",
                  title: "Persönliche Beratung",
                  desc: "Wir erklären Ihnen verständlich, welche Möglichkeiten es gibt – ohne Druck, in Ihrem Tempo.",
                },
                {
                  step: "3",
                  title: "Unabhängige Bewertung",
                  desc: "Bei Interesse wird der Immobilienwert durch einen zertifizierten Sachverständigen professionell ermittelt.",
                },
                {
                  step: "4",
                  title: "Auszahlung & Wohnrecht",
                  desc: "Sie erhalten Ihre Einmalzahlung und bleiben weiterhin zuhause wohnen – rechtlich abgesichert.",
                },
              ].map(({ step, title, desc }, i, arr) => (
                <div key={step} style={{ textAlign: "center", position: "relative" }}>
                  {/* Connector line */}
                  {i < arr.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "28px",
                        left: "calc(50% + 28px)",
                        right: "calc(-50% + 28px)",
                        height: "2px",
                        background: "linear-gradient(90deg, #cce0cc, #e4ede4)",
                        zIndex: 0,
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: "56px", height: "56px", borderRadius: "50%",
                      background: "#196B24", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "22px", fontWeight: 800,
                      margin: "0 auto 20px", position: "relative", zIndex: 1,
                      boxShadow: "0 4px 14px rgba(25,107,36,0.28)",
                    }}
                  >
                    {step}
                  </div>
                  <h3 style={{ color: "#1a2d1a", fontSize: "16px", fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3 }}>
                    {title}
                  </h3>
                  <p style={{ color: "#5a6a5a", fontSize: "14px", lineHeight: 1.75, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFITS ──────────────────────────────────────────────────────── */}
        <section
          id="vorteile"
          style={{
            background: "#f5f9f5",
            padding: "80px clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #dde8dd",
          }}
        >
          <div
            className="two-col"
            style={{
              maxWidth: "1100px", margin: "0 auto",
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "clamp(40px, 6vw, 80px)", alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, "Segoe UI", sans-serif',
                  fontSize: "clamp(24px, 3.5vw, 38px)",
                  fontWeight: 800, color: "#1a2d1a",
                  margin: "0 0 18px", lineHeight: 1.2, letterSpacing: "-0.01em",
                }}
              >
                Mehr finanzieller Spielraum.
                <br />
                Ohne das Zuhause aufzugeben.
              </h2>
              <p style={{ color: "#4a5a4a", fontSize: "17px", lineHeight: 1.78, margin: "0 0 28px", maxWidth: "480px" }}>
                Sie verkaufen Ihre Immobilie an WohnKapital. Im Gegenzug erhalten Sie eine
                hohe Einmalzahlung und behalten ein gesichertes Wohnrecht. So können Sie
                Kapital aus Ihrem Zuhause freisetzen, ohne ausziehen zu müssen.
              </p>
              <a href="#lead" style={btnPrimary} className="lp-btn-primary">
                Ersteinschätzung starten →
              </a>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                "Bestehende Kredite zurückzahlen",
                "Kinder oder Enkel unterstützen",
                "Pflege, Umbauten oder Modernisierung finanzieren",
                "Reisen oder persönliche Wünsche ermöglichen",
                "Rücklagen für die eigene Sicherheit schaffen",
                "Weiter im vertrauten Zuhause wohnen",
              ].map((benefit) => (
                <div
                  key={benefit}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "15px 18px", background: "#fff",
                    border: "1px solid #d8e8d8", borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: "#e8f5ea", border: "1px solid #c4dcc4",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#196B24", flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span style={{ color: "#1a2d1a", fontSize: "16px", fontWeight: 500, lineHeight: 1.4 }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TARGET GROUPS ─────────────────────────────────────────────────── */}
        <section
          style={{
            background: "#fff",
            padding: "80px clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #e4ede4",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <SectionHead
              title="Für wen ist WohnKapital gedacht?"
              sub="WohnKapital richtet sich an Eigentümer ab 65 Jahren – und an alle, die ihnen dabei helfen möchten, eine gute Entscheidung zu treffen."
            />
            <div
              className="audience-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}
            >
              {[
                {
                  emoji: "🏡",
                  title: "Für Eigentümer",
                  titleColor: "#196B24",
                  body: "Sie sind 65 Jahre oder älter, Eigentümer einer Immobilie und möchten finanziell freier sein – ohne Ihr Zuhause aufzugeben und ohne Umzugsstress. Wir erklären Ihnen Ihre Möglichkeiten verständlich und ohne Druck.",
                  link: { href: "#lead", label: "Ersteinschätzung starten →" },
                },
                {
                  emoji: "👨‍👩‍👧",
                  title: "Für Kinder & Angehörige",
                  titleColor: "#196B24",
                  body: "Sie möchten Ihre Eltern oder Angehörigen unterstützen und eine faire, transparente Lösung verstehen. Wir nehmen uns Zeit für Ihre Fragen – auch gemeinsam in einem Gespräch mit allen Beteiligten.",
                  link: { href: "#kontakt", label: "Gemeinsam beraten lassen →" },
                },
              ].map(({ emoji, title, titleColor, body, link }) => (
                <div
                  key={title}
                  style={{
                    background: "#f5f9f5",
                    border: "1px solid #cce0cc",
                    borderRadius: "16px",
                    padding: "36px 32px",
                  }}
                >
                  <div style={{ fontSize: "42px", marginBottom: "18px" }}>{emoji}</div>
                  <h3 style={{ color: titleColor, fontSize: "21px", fontWeight: 800, margin: "0 0 14px" }}>{title}</h3>
                  <p style={{ color: "#4a5a4a", fontSize: "16px", lineHeight: 1.78, margin: "0 0 22px" }}>{body}</p>
                  <a href={link.href} className="lp-link">{link.label}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CALCULATOR ────────────────────────────────────────────────────── */}
        <section
          id="rechner"
          style={{
            background: "#f5f9f5",
            padding: "80px clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #dde8dd",
          }}
        >
          <div
            className="two-col"
            style={{
              maxWidth: "1100px", margin: "0 auto",
              display: "grid", gridTemplateColumns: "1fr 1.1fr",
              gap: "clamp(40px, 6vw, 80px)", alignItems: "start",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, "Segoe UI", sans-serif',
                  fontSize: "clamp(24px, 3.5vw, 38px)",
                  fontWeight: 800, color: "#1a2d1a", margin: "0 0 16px",
                }}
              >
                Ihre mögliche Einmalzahlung berechnen
              </h2>
              <p style={{ color: "#4a5a4a", fontSize: "17px", lineHeight: 1.78, margin: "0 0 28px" }}>
                Der Rechner zeigt eine erste Orientierung. Die genaue Berechnung erfolgt
                individuell – persönlich, kostenlos und ohne Verpflichtung durch unser Team.
              </p>
              <div style={{ display: "grid", gap: "14px" }}>
                {[
                  "Alle Angaben sind unverbindlich",
                  "Keine persönlichen Daten erforderlich",
                  "Genaues Angebot nach kostenloser Bewertung",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", color: "#4a5a4a", fontSize: "15px" }}>
                    <div style={{ color: "#196B24", flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: "36px", padding: "20px 22px",
                  background: "#fff8ea", border: "1px solid #e8d8a0",
                  borderRadius: "10px", fontSize: "14px", color: "#6a5a2a", lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "#4a3a1a" }}>Hinweis:</strong> Die Einmalzahlung liegt typischerweise bei ca. 30–60 % des Immobilienwerts und hängt vom Modell, vom Alter der Eigentümer und vom Zustand der Immobilie ab.
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #d8e8d8",
                borderRadius: "16px",
                padding: "clamp(24px, 3vw, 36px)",
                boxShadow: "0 4px 20px rgba(25,107,36,0.07)",
              }}
            >
              <Calculator />
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section
          id="faq"
          style={{
            background: "#fff",
            padding: "80px clamp(20px, 5vw, 60px)",
            borderBottom: "1px solid #e4ede4",
          }}
        >
          <div style={{ maxWidth: "780px", margin: "0 auto" }}>
            <SectionHead
              title="Häufige Fragen"
              sub="Wir beantworten die wichtigsten Fragen rund um WohnKapital und die Immobilienverrentung."
            />
            {FAQS.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
            <div style={{ marginTop: "36px", textAlign: "center" }}>
              <p style={{ color: "#5a6a5a", fontSize: "16px", marginBottom: "16px" }}>
                Haben Sie weitere Fragen? Wir antworten persönlich.
              </p>
              <a href="#kontakt" style={btnPrimary} className="lp-btn-primary">
                Jetzt kostenlos anfragen
              </a>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA / CONTACT ───────────────────────────────────────────── */}
        <section
          id="kontakt"
          style={{
            background: "linear-gradient(160deg, #196B24 0%, #0d3f17 100%)",
            padding: "80px clamp(20px, 5vw, 60px)",
          }}
        >
          <div
            className="contact-grid"
            style={{
              maxWidth: "1100px", margin: "0 auto",
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "clamp(40px, 6vw, 80px)", alignItems: "start",
            }}
          >
            {/* Left: copy */}
            <div>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, "Segoe UI", sans-serif',
                  fontSize: "clamp(26px, 4vw, 44px)",
                  fontWeight: 800, color: "#fff",
                  margin: "0 0 18px", lineHeight: 1.15, letterSpacing: "-0.01em",
                }}
              >
                Möchten Sie wissen, welche Auszahlung möglich wäre?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "17px", lineHeight: 1.78, margin: "0 0 36px" }}>
                Starten Sie mit einer kostenlosen und unverbindlichen Ersteinschätzung.
                Wir melden uns persönlich bei Ihnen und erklären die nächsten Schritte verständlich.
              </p>
              <div style={{ display: "grid", gap: "14px" }}>
                {[
                  "Kostenlos & unverbindlich",
                  "Persönliche Beratung durch erfahrene Experten",
                  "Zeit für Ihre Familie und alle Fragen",
                  "Keine versteckten Kosten",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,0.9)", fontSize: "16px" }}>
                    <div
                      style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "clamp(24px, 3vw, 40px)",
                boxShadow: "0 20px 48px rgba(0,0,0,0.22)",
              }}
            >
              <h3 style={{ color: "#1a2d1a", fontSize: "20px", fontWeight: 700, margin: "0 0 24px", lineHeight: 1.3 }}>
                Kostenlose Ersteinschätzung starten
              </h3>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer
          style={{
            background: "#f0f5f0",
            borderTop: "1px solid #d8e8d8",
            padding: "36px clamp(20px, 5vw, 60px)",
          }}
        >
          <div
            style={{
              maxWidth: "1100px", margin: "0 auto",
              display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <img src="/brand/wohnkapital-logo.svg" alt="WohnKapital" style={{ width: "140px", display: "block" }} />
            <p style={{ color: "#7a8a7a", fontSize: "13px", margin: 0, lineHeight: 1.6, textAlign: "right" }}>
              © 2025 WohnKapital · Immobilienverrentung für Eigentümer ab 65 Jahren
              <br />
              Alle Angaben unverbindlich · Kein Rechtsanspruch auf bestimmte Konditionen
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
