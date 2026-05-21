"use client";
import { useState } from "react";
import { calculateOffer } from "@/lib/offer-calculator";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

// â”€â”€ Calculation logic (mirrors lib/offer-calculator.ts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function fmt(n: number): string {
  return n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
}

// â”€â”€ Inline SVG icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function IconHouse() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM6 20V4h5v7h7v9H6z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      width="14"
      height="14"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function IconPlus({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      width="18"
      height="18"
      style={{
        flexShrink: 0,
        transition: "transform 220ms",
        transform: open ? "rotate(45deg)" : "none",
      }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// â”€â”€ FAQ data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FAQS = [
  {
    q: "Für wen ist die Immobilienverrentung geeignet?",
    a: "Das Modell richtet sich an Eigentümerinnen und Eigentümer ab 65 Jahren, die ihr selbst bewohntes Eigenheim besitzen. Der Immobilienwert sollte mindestens 200.000 € betragen. Ob Haus oder Eigentumswohnung – beide Varianten sind möglich.",
  },
  {
    q: "Muss ich nach dem Verkauf ausziehen?",
    a: "Nein – das ist das Herzstück unserer Modelle. Sie verkaufen Ihre Immobilie zum Marktpreis und bleiben in Ihrem Zuhause: entweder als Mieter (Rückmietmodell) oder mit einem im Grundbuch gesicherten Wohnrecht für eine feste Laufzeit.",
  },
  {
    q: "Was kostet die Beratung?",
    a: "Nichts. Das Erstgespräch und die unabhängige Immobilienbewertung durch einen zertifizierten Sachverständigen sind für Sie vollständig kostenlos und unverbindlich. Auch die Notarkosten übernehmen wir.",
  },
  {
    q: "Wie lange dauert der Prozess bis zur Auszahlung?",
    a: "Typischerweise dauert es 6 bis 8 Wochen vom ersten Gespräch bis zur notariellen Beurkundung und vollständigen Auszahlung des Kaufpreises.",
  },
  {
    q: "Ist mein Wohnrecht rechtlich abgesichert?",
    a: "Ja. Das Wohnrecht wird erstrangig im Grundbuch eingetragen und gilt für die gesamte vereinbarte Laufzeit – unabhängig von eventuellen späteren Eigentümerwechseln.",
  },
  {
    q: "Was passiert, wenn ich dauerhaft ins Pflegeheim ziehen möchte?",
    a: "Sie sind nicht an das Wohnrecht gebunden – es ist ein Recht, keine Pflicht. Wenn Sie Ihr Zuhause dauerhaft verlassen, kann das Wohnrecht aufgehoben werden. Beim Rückmietmodell kündigen Sie einfach den Mietvertrag.",
  },
  {
    q: "Kann ich auch verkaufen, wenn noch eine Restschuld besteht?",
    a: "Ja, in vielen Fällen ist das möglich. Die Restschuld wird aus dem Kaufpreis abgelöst, und Sie erhalten den verbleibenden Betrag als Auszahlung. Sprechen Sie uns an – wir prüfen Ihre individuelle Situation.",
  },
];

// â”€â”€ FAQ accordion item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #ded7e4" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontWeight: 700,
          fontSize: "16px",
          color: "#0e2841",
        }}
      >
        <span>{q}</span>
        <span style={{ color: "#44005c" }}>
          <IconPlus open={open} />
        </span>
      </button>
      {open && (
        <p
          style={{
            margin: "0 0 20px",
            color: "#6d6472",
            lineHeight: 1.7,
            fontSize: "15px",
            maxWidth: "680px",
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// â”€â”€ Interactive calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Calculator() {
  const [value, setValue] = useState(400000);
  const [livingArea, setLivingArea] = useState(140);
  const [cond, setCond] = useState("good");
  const [model, setModel] = useState<"sale_and_leaseback" | "fixed_residential_right">("sale_and_leaseback");
  const [yrs, setYrs] = useState(10);

  const calculation = calculateOffer({
    valuation: { marketValue: value },
    condition: cond as "very_good" | "good" | "average" | "renovation_needed",
    model,
    residentialRightYears: yrs,
    livingAreaSqm: livingArea,
    propertyType: "house",
    energyClass: "E",
    garageCount: 1,
  });
  const payout = calculation.payoutAmount;
  const monthlyRent = Math.round((value * 0.04) / 12 / 50) * 50;
  const components = calculation.assumptions.components ?? {};

  return (
    <div>
      {/* Model tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
        {(
          [
            { key: "sale_and_leaseback", label: "Rückmietmodell" },
            { key: "fixed_residential_right", label: "Befristetes Wohnrecht" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setModel(key)}
            style={{
              flex: 1,
              minHeight: "44px",
              border: "2px solid",
              borderColor: model === key ? "#44005c" : "#ded7e4",
              borderRadius: "8px",
              background: model === key ? "#44005c" : "#fff",
              color: model === key ? "#fff" : "#0e2841",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 150ms",
              padding: "0 8px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Value slider */}
        <div className="field">
          <label>Geschätzter Immobilienwert</label>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <input
              type="range"
              min={150000}
              max={2000000}
              step={25000}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#44005c" }}
            />
            <span
              style={{
                minWidth: "112px",
                fontWeight: 800,
                color: "#44005c",
                fontSize: "17px",
                textAlign: "right",
              }}
            >
              {formatMoney(value)}
            </span>
          </div>
        </div>

        <div className="field">
          <label>Wohnfläche</label>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <input
              type="range"
              min={50}
              max={300}
              step={5}
              value={livingArea}
              onChange={(e) => setLivingArea(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#44005c" }}
            />
            <span
              style={{
                minWidth: "88px",
                fontWeight: 800,
                color: "#44005c",
                fontSize: "17px",
                textAlign: "right",
              }}
            >
              {livingArea} m²
            </span>
          </div>
        </div>

        {/* Condition */}
        <div className="field">
          <label>Zustand der Immobilie</label>
          <select value={cond} onChange={(e) => setCond(e.target.value)}>
            <option value="very_good">Sehr gut / Neuwertig</option>
            <option value="good">Gut gepflegt</option>
            <option value="average">Durchschnittlich</option>
            <option value="renovation_needed">Renovierungsbedürftig</option>
          </select>
        </div>

        {/* Wohnrecht duration */}
        {model === "fixed_residential_right" && (
          <div className="field">
            <label>Gewünschte Wohnrechtdauer</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {([5, 10, 15] as const).map((y) => (
                <button
                  key={y}
                  onClick={() => setYrs(y)}
                  style={{
                    flex: 1,
                    minHeight: "40px",
                    border: "2px solid",
                    borderColor: yrs === y ? "#ffac00" : "#ded7e4",
                    borderRadius: "6px",
                    background: yrs === y ? "#fff4cf" : "#fff",
                    color: "#0e2841",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 150ms",
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
          marginTop: "28px",
          padding: "26px 24px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #44005c 0%, #6b2084 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 90% 10%, rgba(255,172,0,0.28), transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            opacity: 0.65,
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            position: "relative",
          }}
        >
          Geschätzte Auszahlung
        </div>
        <div
          style={{
            fontSize: "clamp(34px, 7vw, 54px)",
            fontWeight: 900,
            lineHeight: 1,
            color: "#ffac00",
            position: "relative",
          }}
        >
          {formatMoney(payout)}
        </div>
        {model === "sale_and_leaseback" && (
          <div
            style={{ marginTop: "10px", fontSize: "13px", opacity: 0.78, position: "relative" }}
          >
            + marktübliche Miete ca. {formatMoney(monthlyRent)}/Monat
          </div>
        )}
        {model === "fixed_residential_right" && (
          <div
            style={{ marginTop: "10px", fontSize: "13px", opacity: 0.78, position: "relative" }}
          >
            inkl. mietfreiem Wohnrecht für {yrs} Jahre
          </div>
        )}
        <div
          style={{
            marginTop: "14px",
            fontSize: "11px",
            opacity: 0.48,
            position: "relative",
          }}
        >
          Unverbindliche Schätzung · Genaues Angebot nach kostenloser Bewertung
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          marginTop: "14px",
        }}
      >
        {(
          model === "sale_and_leaseback"
            ? [
                ["Auszahlungsquote", `${Math.round((components.payoutRate ?? 0.46) * 100)}%`],
                ["Instandhaltung", formatMoney(components.maintenancePledge ?? 12320)],
                ["Modellquelle", "Rückmietmodell"],
              ]
            : [
                ["Wohnrechtswert", formatMoney(calculation.residentialRightValue)],
                ["Instandhaltung", formatMoney(calculation.companyMargin)],
                ["Zinsabschlag", formatMoney(calculation.riskDiscount)],
              ]
        ).map(([label, valueText]) => (
          <div
            key={label}
            style={{
              border: "1px solid #ded7e4",
              borderRadius: "8px",
              padding: "10px 12px",
              background: "#fff",
            }}
          >
            <div style={{ color: "#6d6472", fontSize: "11px", fontWeight: 700 }}>{label}</div>
            <div style={{ color: "#44005c", fontSize: "13px", fontWeight: 800, marginTop: "3px" }}>{valueText}</div>
          </div>
        ))}
      </div>

      <a
        href="#kontakt"
        className="btn btn-primary"
        style={{
          display: "flex",
          width: "100%",
          marginTop: "14px",
          minHeight: "52px",
          fontSize: "16px",
          fontWeight: 800,
          justifyContent: "center",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        Kostenloses Erstgespräch anfragen &rarr;
      </a>
    </div>
  );
}

// â”€â”€ USP data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const USPS = [
  {
    symbol: "100%",
    title: "Volle Kaufpreis-Auszahlung",
    desc: "Sie erhalten den vollen Marktwert Ihrer Immobilie – keine Maklercourtage, keine versteckten Gebühren.",
  },
  {
    symbol: "0 €",
    title: "Keine Kosten für Sie",
    desc: "Beratung, Bewertung, Notar – wir übernehmen alle Kosten. Für Sie entstehen keinerlei Gebühren.",
  },
  {
    symbol: "§",
    title: "Rechtlich gesichert",
    desc: "Ihr Wohnrecht wird erstrangig im Grundbuch eingetragen – unabhängig von späteren Eigentümerwechseln.",
  },
  {
    symbol: "6–8W",
    title: "Schnelle Abwicklung",
    desc: "Vom Erstgespräch bis zur Auszahlung vergehen typischerweise nur 6 bis 8 Wochen.",
  },
  {
    symbol: "65+",
    title: "Für Ihre Lebensphase",
    desc: "Speziell für Eigentümerinnen und Eigentümer ab 65 – maßgeschneidert für Ihre Bedürfnisse.",
  },
  {
    symbol: "∞",
    title: "Langfristige Betreuung",
    desc: "Wir sind nicht nur beim Verkauf dabei, sondern als verlässlicher Partner auf Lebenszeit.",
  },
];

// â”€â”€ Main page component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function HomePage() {
  const [formSent, setFormSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [navOpen, setNavOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST to /api/leads
    setFormSent(true);
  }

  const navLinks = [
    { href: "#produkte", label: "Unsere Modelle" },
    { href: "#rechner", label: "Rechner" },
    { href: "#prozess", label: "So funktioniert’s" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <>
      {/* â”€â”€ NAV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header
        className="topbar"
        style={{ padding: "0 clamp(20px, 5vw, 60px)", justifyContent: "space-between" }}
      >
        <a href="/" className="brand">
          <img
            src="/brand/wohnkapital-logo.svg"
            alt="WohnKapital"
            className="brand-logo"
            style={{ width: "160px" }}
          />
        </a>
        <nav className="topnav lp-desktop-nav">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className="nav-link">
              {label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="btn btn-primary"
            style={{ marginLeft: "10px", padding: "0 18px", fontWeight: 800 }}
          >
            Beratung anfragen
          </a>
        </nav>
        <button
          onClick={() => setNavOpen((o) => !o)}
          className="lp-mobile-btn"
          aria-label="Menü"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#44005c",
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            {navOpen ? (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            ) : (
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            )}
          </svg>
        </button>
      </header>

      {navOpen && (
        <div
          style={{
            position: "sticky",
            top: "72px",
            zIndex: 19,
            background: "#fff",
            borderBottom: "1px solid #ded7e4",
            padding: "12px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="nav-link"
              onClick={() => setNavOpen(false)}
              style={{ display: "block" }}
            >
              {label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="btn btn-primary"
            onClick={() => setNavOpen(false)}
            style={{ marginTop: "8px", justifyContent: "center", display: "flex" }}
          >
            Beratung anfragen
          </a>
        </div>
      )}

      <main>
        {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          id="hero"
          style={{
            position: "relative",
            padding: "clamp(64px, 10vw, 124px) clamp(20px, 5vw, 60px)",
            background:
              "radial-gradient(circle at 72% 28%, rgba(255,172,0,0.24), transparent 42%), linear-gradient(158deg, rgba(68,0,92,0.98) 0%, rgba(45,0,61,0.95) 100%)",
            color: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 28px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
            <span
              className="section-label"
              style={{ marginBottom: "20px", display: "inline-flex" }}
            >
              Immobilienverrentung
            </span>
            <h1
              style={{
                fontFamily: '"Aptos Display", Aptos, "Segoe UI", sans-serif',
                fontSize: "clamp(38px, 7.5vw, 76px)",
                fontWeight: 900,
                lineHeight: 1.02,
                margin: "10px 0 22px",
                maxWidth: "860px",
                letterSpacing: "-0.01em",
              }}
            >
              Ihr Eigenheim.
              <br />
              Ihr Kapital.
              <br />
              <span style={{ color: "#ffac00" }}>Ihr Zuhause.</span>
            </h1>
            <p
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                color: "rgba(255,255,255,0.82)",
                maxWidth: "600px",
                lineHeight: 1.65,
                margin: "0 0 40px",
              }}
            >
              Verkaufen Sie Ihr Eigenheim zum Marktpreis und bleiben Sie in Ihrem Zuhause
              – lebenslang sicher, ohne Umzugsstress, mit sofortiger Auszahlung.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href="#rechner"
                className="btn"
                style={{
                  minHeight: "54px",
                  padding: "0 30px",
                  fontSize: "16px",
                  fontWeight: 800,
                  background: "#ffac00",
                  border: "none",
                  color: "#44005c",
                  borderRadius: "8px",
                }}
              >
                Auszahlung berechnen
              </a>
              <a
                href="#kontakt"
                className="btn"
                style={{
                  minHeight: "54px",
                  padding: "0 30px",
                  fontSize: "16px",
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  color: "#fff",
                  borderRadius: "8px",
                }}
              >
                Kostenlos beraten lassen
              </a>
            </div>
            <div
              style={{
                display: "flex",
                gap: "clamp(24px, 5vw, 56px)",
                marginTop: "64px",
                flexWrap: "wrap",
                paddingTop: "40px",
                borderTop: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              {[
                { value: "100 %", label: "Kaufpreisauszahlung" },
                { value: "0 €", label: "Maklergebühren" },
                { value: "6–8 Wochen", label: "bis zur Auszahlung" },
                { value: "ab 65", label: "Mindestalter" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: "clamp(24px, 4vw, 40px)",
                      fontWeight: 900,
                      color: "#ffac00",
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.65)",
                      marginTop: "6px",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ TRUST BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          style={{
            padding: "20px clamp(20px, 5vw, 60px)",
            background: "#fff",
            borderBottom: "1px solid #ded7e4",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px, 3vw, 40px)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#6d6472",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
              }}
            >
              Bekannt aus
            </span>
            {[
              "Frankfurter Allgemeine",
              "Handelsblatt",
              "Capital",
              "Wirtschaftswoche",
              "Stiftung Warentest",
            ].map((m) => (
              <span
                key={m}
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#334155",
                  opacity: 0.45,
                  whiteSpace: "nowrap",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </section>

        {/* â”€â”€ PRODUCTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section id="produkte" style={{ padding: "88px clamp(20px, 5vw, 60px)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span className="section-label">Unsere Modelle</span>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, sans-serif',
                  fontSize: "clamp(28px, 5vw, 48px)",
                  color: "#44005c",
                  margin: "12px 0 14px",
                  fontWeight: 900,
                }}
              >
                Zwei Wege zu Ihrem Kapital
              </h2>
              <p
                style={{
                  color: "#6d6472",
                  fontSize: "17px",
                  maxWidth: "520px",
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Wählen Sie das Modell, das zu Ihrer Lebenssituation passt – beide ohne Umzug.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Rückmietmodell */}
              <div className="panel" style={{ padding: "38px", borderTop: "4px solid #44005c" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #44005c, #6b2084)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "22px",
                    color: "#fff",
                  }}
                >
                  <IconHouse />
                </div>
                <h3
                  style={{ color: "#44005c", fontSize: "22px", fontWeight: 900, margin: "0 0 12px" }}
                >
                  Rückmietmodell
                </h3>
                <p
                  style={{ color: "#6d6472", fontSize: "15px", lineHeight: 1.7, margin: "0 0 26px" }}
                >
                  Sie verkaufen Ihr Eigenheim zum vollen Marktpreis und bleiben als Mieter in Ihrer
                  gewohnten Umgebung. Instandhaltung und Verwaltung übernehmen wir – Sie
                  genießen Ihr Zuhause sorgenfrei zur marktüblichen Miete.
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 32px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {[
                    "Sofortige Vollausschüttung des Kaufpreises",
                    "Keine Instandhaltungskosten mehr",
                    "Mietvertrag mit Kündigungsschutz",
                    "Steuerfreie Auszahlung möglich",
                    "Kein Makler, keine versteckten Gebühren",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "14px",
                        color: "#334155",
                      }}
                    >
                      <span style={{ flexShrink: 0, marginTop: "1px", color: "#44005c" }}>
                        <IconCheck />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#rechner"
                  className="btn btn-primary"
                  style={{ display: "flex", width: "100%", justifyContent: "center", borderRadius: "8px" }}
                >
                  Jetzt berechnen
                </a>
              </div>

              {/* Wohnrecht */}
              <div className="panel" style={{ padding: "38px", borderTop: "4px solid #ffac00" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #ffac00, #e09800)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "22px",
                    color: "#fff",
                  }}
                >
                  <IconDoc />
                </div>
                <h3
                  style={{ color: "#44005c", fontSize: "22px", fontWeight: 900, margin: "0 0 12px" }}
                >
                  Verkauf mit Wohnrecht
                </h3>
                <p
                  style={{ color: "#6d6472", fontSize: "15px", lineHeight: 1.7, margin: "0 0 26px" }}
                >
                  Sie verkaufen Ihre Immobilie und erhalten ein im Grundbuch gesichertes,
                  befristetes Wohnrecht für 5, 10 oder 15 Jahre. Kein Mietvertrag,
                  kein Vermieter – Sie wohnen mietfrei in Ihrem Eigenheim.
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 32px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {[
                    "Erstrangig im Grundbuch eingetragen",
                    "Mietfreies Wohnen für die volle Laufzeit",
                    "Auszahlung als Einmalbetrag oder Zeitrente",
                    "Wahlweise 5, 10 oder 15 Jahre Wohnrecht",
                    "Gilt unabhängig von späteren Eigentümerwechseln",
                  ].map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "14px",
                        color: "#334155",
                      }}
                    >
                      <span style={{ flexShrink: 0, marginTop: "1px", color: "#ffac00" }}>
                        <IconCheck />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#rechner"
                  className="btn"
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    borderColor: "#ffac00",
                    color: "#44005c",
                    fontWeight: 800,
                    background: "#fff4cf",
                    borderRadius: "8px",
                  }}
                >
                  Jetzt berechnen
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ CALCULATOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          id="rechner"
          style={{ padding: "88px clamp(20px, 5vw, 60px)", background: "var(--canvas)" }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "56px",
                alignItems: "start",
              }}
            >
              <div>
                <span className="section-label">Auszahlungsrechner</span>
                <h2
                  style={{
                    fontFamily: '"Aptos Display", Aptos, sans-serif',
                    fontSize: "clamp(26px, 4vw, 44px)",
                    color: "#44005c",
                    margin: "12px 0 16px",
                    fontWeight: 900,
                  }}
                >
                  Wie viel ist Ihre Immobilie wert?
                </h2>
                <p
                  style={{
                    color: "#6d6472",
                    fontSize: "16px",
                    lineHeight: 1.7,
                    margin: "0 0 32px",
                  }}
                >
                  Berechnen Sie unverbindlich, welche Auszahlung Sie erzielen könnten.
                  Das genaue Angebot erhalten Sie nach einer kostenlosen, unabhängigen Bewertung.
                </p>
                <div style={{ display: "grid", gap: "18px" }}>
                  {[
                    {
                      label: "Kostenlose Bewertung",
                      desc: "Unabhängiger Sachverständiger ermittelt den Marktwert Ihrer Immobilie.",
                    },
                    {
                      label: "Grundbuch-Absicherung",
                      desc: "Ihr Wohnrecht wird erstrangig im Grundbuch eingetragen.",
                    },
                    {
                      label: "Notarkosten inklusive",
                      desc: "Wir übernehmen die gesamte notarielle Abwicklung für Sie.",
                    },
                  ].map(({ label, desc }) => (
                    <div key={label} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "#f6edf9",
                          border: "1px solid #ded7e4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#44005c",
                        }}
                      >
                        <IconCheckCircle />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0e2841" }}>
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6d6472",
                            lineHeight: 1.55,
                            marginTop: "2px",
                          }}
                        >
                          {desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel" style={{ padding: "32px" }}>
                <Calculator />
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ PROCESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section id="prozess" style={{ padding: "88px clamp(20px, 5vw, 60px)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
            <span className="section-label">So funktioniert&apos;s</span>
            <h2
              style={{
                fontFamily: '"Aptos Display", Aptos, sans-serif',
                fontSize: "clamp(28px, 5vw, 48px)",
                color: "#44005c",
                margin: "12px 0 14px",
                fontWeight: 900,
              }}
            >
              In 4 Schritten zur Auszahlung
            </h2>
            <p
              style={{
                color: "#6d6472",
                fontSize: "17px",
                maxWidth: "520px",
                margin: "0 auto 56px",
                lineHeight: 1.6,
              }}
            >
              Unser Prozess ist transparent, schnell und vollständig kostenlos für Sie.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                textAlign: "left",
              }}
            >
              {[
                {
                  step: "01",
                  title: "Kostenloses Erstgespräch",
                  desc: "Schildern Sie uns Ihre Situation. Wir erklären alle Optionen und prüfen, ob unsere Modelle zu Ihnen passen – ohne Druck, ohne Verpflichtung.",
                },
                {
                  step: "02",
                  title: "Unabhängige Bewertung",
                  desc: "Ein zertifizierter Sachverständiger bewertet Ihre Immobilie neutral und kostenlos. Kein Makler, keine Provision.",
                },
                {
                  step: "03",
                  title: "Individuelles Angebot",
                  desc: "Sie erhalten ein transparentes Angebot mit allen Konditionen. Keine versteckten Kosten, keine Überraschungen – alles schriftlich.",
                },
                {
                  step: "04",
                  title: "Notartermin & Auszahlung",
                  desc: "Nach notarieller Beurkundung fließt die Auszahlung sofort. Das Wohnrecht wird im selben Zug erstrangig ins Grundbuch eingetragen.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="panel" style={{ padding: "28px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#fff4cf",
                      border: "1px solid #f1c15e",
                      color: "#44005c",
                      fontWeight: 900,
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    {step}
                  </div>
                  <h3
                    style={{ color: "#44005c", fontSize: "17px", fontWeight: 800, margin: "0 0 10px" }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: "#6d6472", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ USPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          style={{
            padding: "88px clamp(20px, 5vw, 60px)",
            background:
              "radial-gradient(circle at 80% 20%, rgba(255,172,0,0.18), transparent 40%), linear-gradient(158deg, rgba(68,0,92,0.98) 0%, rgba(45,0,61,0.95) 100%)",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span className="section-label">Ihre Vorteile</span>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, sans-serif',
                  fontSize: "clamp(28px, 5vw, 48px)",
                  color: "#fff",
                  margin: "12px 0 0",
                  fontWeight: 900,
                }}
              >
                Warum WohnKapital?
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
              }}
            >
              {USPS.map(({ symbol, title, desc }) => (
                <div
                  key={title}
                  style={{
                    padding: "28px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.11)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color: "#ffac00",
                      marginBottom: "14px",
                    }}
                  >
                    {symbol}
                  </div>
                  <h3
                    style={{ color: "#fff", fontSize: "16px", fontWeight: 800, margin: "0 0 10px" }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ TESTIMONIALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section style={{ padding: "88px clamp(20px, 5vw, 60px)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span className="section-label">Kundenstimmen</span>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, sans-serif',
                  fontSize: "clamp(28px, 5vw, 48px)",
                  color: "#44005c",
                  margin: "12px 0 0",
                  fontWeight: 900,
                }}
              >
                Was unsere Kunden sagen
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "22px",
              }}
            >
              {[
                {
                  name: "Gerhard & Heide Maria B.",
                  meta: "76 & 73 Jahre, Hannover",
                  quote:
                    "Wir wollten unsere Rente aufbessern, ohne unser Haus zu verlassen. WohnKapital hat das möglich gemacht – unkompliziert, fair und schnell.",
                  product: "Rückmietmodell",
                },
                {
                  name: "Wolf-Dieter S.",
                  meta: "71 Jahre, München",
                  quote:
                    "Nach dem Tod meiner Frau konnte ich die Instandhaltungskosten nicht mehr stemmen. Jetzt lebe ich sorgenfrei und muss mir um nichts mehr kümmern.",
                  product: "Befristetes Wohnrecht",
                },
                {
                  name: "Ingrid F.",
                  meta: "68 Jahre, Hamburg",
                  quote:
                    "Der Prozess war vollständig transparent. Keine versteckten Gebühren, keine Überraschungen. Ich bin froh, dass ich diesen Schritt gewagt habe.",
                  product: "Rückmietmodell",
                },
              ].map(({ name, meta, quote, product }) => (
                <div key={name} className="panel" style={{ padding: "30px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "2px",
                      marginBottom: "18px",
                      color: "#ffac00",
                      fontSize: "17px",
                      letterSpacing: "2px",
                    }}
                  >
                    &#9733;&#9733;&#9733;&#9733;&#9733;
                  </div>
                  <p
                    style={{
                      color: "#334155",
                      fontSize: "15px",
                      lineHeight: 1.72,
                      margin: "0 0 22px",
                      fontStyle: "italic",
                    }}
                  >
                    &bdquo;{quote}&ldquo;
                  </p>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "#0e2841" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6d6472" }}>{meta}</div>
                    <span className="badge" style={{ marginTop: "12px", background: "#f6edf9" }}>
                      {product}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          id="faq"
          style={{ padding: "88px clamp(20px, 5vw, 60px)", background: "var(--canvas)" }}
        >
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <span className="section-label">Häufige Fragen</span>
              <h2
                style={{
                  fontFamily: '"Aptos Display", Aptos, sans-serif',
                  fontSize: "clamp(28px, 5vw, 44px)",
                  color: "#44005c",
                  margin: "12px 0 0",
                  fontWeight: 900,
                }}
              >
                Ihre Fragen, unsere Antworten
              </h2>
            </div>
            <div style={{ borderTop: "1px solid #ded7e4" }}>
              {FAQS.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ CONTACT / LEAD FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section
          id="kontakt"
          style={{
            padding: "88px clamp(20px, 5vw, 60px)",
            background:
              "radial-gradient(circle at 20% 80%, rgba(255,172,0,0.16), transparent 40%), linear-gradient(158deg, #44005c 0%, #2d003d 100%)",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "60px",
                alignItems: "start",
              }}
            >
              <div>
                <span
                  className="section-label"
                  style={{ marginBottom: "18px", display: "inline-flex" }}
                >
                  Kontakt
                </span>
                <h2
                  style={{
                    fontFamily: '"Aptos Display", Aptos, sans-serif',
                    fontSize: "clamp(28px, 5vw, 48px)",
                    color: "#fff",
                    margin: "0 0 16px",
                    fontWeight: 900,
                  }}
                >
                  Starten Sie heute
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    fontSize: "17px",
                    lineHeight: 1.7,
                    margin: "0 0 36px",
                  }}
                >
                  Sprechen Sie mit einem unserer Berater. Das Erstgespräch ist kostenlos,
                  unverbindlich und dauert ca. 20 Minuten.
                </p>
                <div style={{ display: "grid", gap: "18px" }}>
                  {[
                    { Icon: IconPhone, text: "030 / 123 456 789" },
                    { Icon: IconMail, text: "info@wohnkapital.de" },
                    { Icon: IconClock, text: "Mo–Fr 8–18 Uhr | Sa 9–13 Uhr" },
                  ].map(({ Icon, text }) => (
                    <div
                      key={text}
                      style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "15px" }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#ffac00",
                        }}
                      >
                        <Icon />
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.88)" }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {formSent ? (
                  <div
                    style={{
                      padding: "44px 36px",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.14)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "#eaf7ef",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 18px",
                        color: "#196b24",
                        fontWeight: 900,
                        fontSize: "22px",
                      }}
                    >
                      &#10003;
                    </div>
                    <h3 style={{ color: "#fff", fontSize: "22px", margin: "0 0 10px" }}>
                      Anfrage erhalten!
                    </h3>
                    <p
                      style={{ color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.6 }}
                    >
                      Wir melden uns innerhalb von 24 Stunden bei Ihnen. Vielen Dank!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                    <div className="field">
                      <label style={{ color: "rgba(255,255,255,0.82)" }}>Ihr Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Max Mustermann"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
                    >
                      <div className="field">
                        <label style={{ color: "rgba(255,255,255,0.82)" }}>E-Mail *</label>
                        <input
                          required
                          type="email"
                          placeholder="max@beispiel.de"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                      <div className="field">
                        <label style={{ color: "rgba(255,255,255,0.82)" }}>Telefon</label>
                        <input
                          type="tel"
                          placeholder="+49 ..."
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label style={{ color: "rgba(255,255,255,0.82)" }}>
                        Ihre Nachricht (optional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Teilen Sie uns gern mehr zu Ihrer Immobilie und Situation mit..."
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        style={{ resize: "vertical" }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        minHeight: "54px",
                        fontSize: "16px",
                        fontWeight: 800,
                        background: "#ffac00",
                        border: "none",
                        color: "#44005c",
                        borderRadius: "8px",
                        cursor: "pointer",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Kostenloses Erstgespräch anfragen &rarr;
                    </button>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.44)",
                        margin: "2px 0 0",
                        textAlign: "center",
                        lineHeight: 1.55,
                      }}
                    >
                      Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.
                      Es gilt unsere{" "}
                      <a href="#" style={{ color: "rgba(255,255,255,0.6)" }}>
                        Datenschutzerklärung
                      </a>
                      .
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer
        style={{
          padding: "28px clamp(20px, 5vw, 60px)",
          background: "#1c0028",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <img
            src="/brand/wohnkapital-logo.svg"
            alt="WohnKapital"
            style={{ width: "134px", filter: "brightness(0) invert(1)", opacity: 0.7 }}
          />
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {["Impressum", "Datenschutz", "AGB"].map((link) => (
              <a key={link} href="#" style={{ color: "rgba(255,255,255,0.42)", fontSize: "13px" }}>
                {link}
              </a>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "12px" }}>
            &copy; 2026 WohnKapital GmbH &middot; Alle Rechte vorbehalten
          </div>
        </div>
      </footer>

      <style>{`
        .lp-mobile-btn { display: none; }
        @media (max-width: 680px) {
          .lp-mobile-btn { display: block !important; }
          .lp-desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}

