"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "@/app/page.module.css";

type ProductInterest = "fixed_residential_right" | "sale_and_leaseback" | "other";
type SubmitState = "idle" | "submitting" | "success" | "error";

const formatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function HomepageCalculator() {
  const [city, setCity] = useState("Stuttgart");
  const [postalCode, setPostalCode] = useState("");
  const [propertyType, setPropertyType] = useState("single_family");
  const [estimatedMarketValue, setEstimatedMarketValue] = useState(450000);
  const [livingArea, setLivingArea] = useState(130);
  const [years, setYears] = useState(10);
  const [productInterest, setProductInterest] = useState<ProductInterest>("fixed_residential_right");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const result = useMemo(() => {
    const marketValue = roundToThousand(estimatedMarketValue);
    const low = roundToThousand(marketValue * 0.9);
    const high = roundToThousand(marketValue * 1.1);
    const residentialRightRate = years <= 5 ? 0.6 : years <= 10 ? 0.52 : 0.44;
    const twoPhasePayout = roundToThousand(marketValue * residentialRightRate);
    const saleAndLeasebackPayoutLow = roundToThousand(marketValue * 0.65);
    const saleAndLeasebackPayoutHigh = roundToThousand(marketValue * 0.75);
    const monthlyRentLow = roundToEuro((saleAndLeasebackPayoutLow * 0.05) / 12);
    const monthlyRentHigh = roundToEuro((saleAndLeasebackPayoutHigh * 0.06) / 12);
    const rentPerSqmLow = roundToTen(monthlyRentLow / Math.max(1, livingArea));
    const rentPerSqmHigh = roundToTen(monthlyRentHigh / Math.max(1, livingArea));

    return {
      marketValue,
      low,
      high,
      twoPhasePayout,
      saleAndLeasebackPayoutLow,
      saleAndLeasebackPayoutHigh,
      monthlyRentLow,
      monthlyRentHigh,
      rentPerSqmLow,
      rentPerSqmHigh,
    };
  }, [estimatedMarketValue, livingArea, years]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!email && !phone) {
      setState("error");
      setMessage("Bitte geben Sie mindestens E-Mail oder Telefon an.");
      return;
    }

    setState("submitting");
    setMessage("");

    const leadMessage = [
      "Homepage-Rechner genutzt.",
      `Immobilientyp: ${propertyTypeLabel(propertyType)}`,
      `Ort/PLZ: ${postalCode || "-"} ${city || ""}`.trim(),
      `Geschätzter Marktwert unbewohnt: ${formatter.format(estimatedMarketValue)}`,
      `Wohnfläche: ${livingArea || "-"} m²`,
      `Gewünschtes Modell: ${productInterestLabel(productInterest)}`,
      `Orientierungswert: ${formatter.format(result.low)} bis ${formatter.format(result.high)}`,
      `Zwei-Phasen-Auszahlung ca.: ${formatter.format(result.twoPhasePayout)}`,
      `Voraussichtliche Auszahlungsspanne Rückmietverkauf: ${formatter.format(result.saleAndLeasebackPayoutLow)} bis ${formatter.format(result.saleAndLeasebackPayoutHigh)}`,
      `Geschätzte monatliche Miete: ${formatter.format(result.monthlyRentLow)} bis ${formatter.format(result.monthlyRentHigh)}`,
    ].join("\n");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "homepage",
          firstName: String(data.get("firstName") || "").trim() || undefined,
          lastName: String(data.get("lastName") || "").trim() || undefined,
          email: email || undefined,
          phone: phone || undefined,
          postalCode: postalCode || undefined,
          city: city || undefined,
          propertyType,
          estimatedPropertyValueRange: `${Math.round(result.low / 1000)}-${Math.round(result.high / 1000)}`,
          productInterest,
          message: leadMessage,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Die Anfrage konnte nicht gesendet werden.");
      }

      form.reset();
      setState("success");
      setMessage("Vielen Dank. Ihr Rechner-Ergebnis wurde übermittelt. Wir melden uns zeitnah bei Ihnen.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden.");
    }
  }

  return (
    <section id="rechner" className={styles.calculator}>
      <div className={styles.container}>
        <div className={styles.calculatorGrid}>
          <div>
            <span className={styles.eyebrow}>Orientierungsrechner</span>
            <h2 className={styles.sectionTitle}>Persönliche Auszahlung berechnen</h2>
            <p className={styles.sectionLead}>
              Schieben Sie die Regler auf Ihre Situation. Sie erhalten eine erste Orientierung
              für die mögliche Auszahlung und die monatliche Mietindikation. Die kostenlose
              Immobilienbewertung prüfen wir anschließend persönlich.
            </p>
          </div>

          <form className={styles.calculatorCard} onSubmit={handleSubmit}>
            <div className={styles.sliderStack}>
              <label className={styles.sliderField}>
                <span>
                  Geschätzter Marktwert unbewohnt
                  <strong>{formatter.format(estimatedMarketValue)}</strong>
                </span>
                <input
                  type="range"
                  min="150000"
                  max="1000000"
                  step="10000"
                  value={estimatedMarketValue}
                  onChange={(event) => setEstimatedMarketValue(Number(event.target.value))}
                />
                <small>150.000 € bis 1.000.000 €. Höhere Werte prüfen wir individuell.</small>
              </label>

              <label className={styles.sliderField}>
                <span>
                  Wohnfläche
                  <strong>{livingArea} m²</strong>
                </span>
                <input
                  type="range"
                  min="50"
                  max="260"
                  step="5"
                  value={livingArea}
                  onChange={(event) => setLivingArea(Number(event.target.value))}
                />
              </label>

              <label className={styles.sliderField}>
                <span>
                  Wunschlaufzeit Wohnphase
                  <strong>{years} Jahre</strong>
                </span>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={years}
                  onChange={(event) => setYears(Number(event.target.value))}
                />
              </label>
            </div>

            <div className={styles.calculatorFieldsCompact}>
              <label className={styles.leadField}>
                <span>Immobilientyp</span>
                <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                  <option value="single_family">Einfamilienhaus</option>
                  <option value="semi_detached">Doppelhaushälfte</option>
                  <option value="row_house">Reihenhaus</option>
                  <option value="apartment">Eigentumswohnung</option>
                </select>
              </label>
              <label className={styles.leadField}>
                <span>Wohnfläche</span>
                <input
                  type="number"
                  min="40"
                  value={livingArea}
                  onChange={(event) => setLivingArea(Number(event.target.value))}
                />
              </label>
              <label className={styles.leadField}>
                <span>PLZ</span>
                <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} inputMode="numeric" />
              </label>
              <label className={styles.leadField}>
                <span>Ort</span>
                <input value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
            </div>

            <div className={styles.calculatorResult}>
              <div>
                <span>unverbindliche Ersteinschätzung</span>
                <strong>{formatter.format(result.low)} bis {formatter.format(result.high)}</strong>
              </div>
              <div>
                <span>Zwei-Phasen-Wohnrecht</span>
                <strong>ca. {formatter.format(result.twoPhasePayout)}</strong>
              </div>
              <div>
                <span>voraussichtliche Auszahlungsspanne</span>
                <strong>{formatter.format(result.saleAndLeasebackPayoutLow)} bis {formatter.format(result.saleAndLeasebackPayoutHigh)}</strong>
                <small>geschätzte monatliche Miete ca. {formatter.format(result.monthlyRentLow)} bis {formatter.format(result.monthlyRentHigh)} / {formatter.format(result.rentPerSqmLow)} bis {formatter.format(result.rentPerSqmHigh)} je m²</small>
              </div>
            </div>

            <div className={styles.calculatorContact}>
              <label className={styles.leadField}>
                <span>Gewünschtes Modell</span>
                <select
                  value={productInterest}
                  onChange={(event) => setProductInterest(event.target.value as ProductInterest)}
                >
                  <option value="fixed_residential_right">Zwei-Phasen-Wohnrecht</option>
                  <option value="sale_and_leaseback">Rückmietverkauf</option>
                  <option value="other">Beide vergleichen</option>
                </select>
              </label>
              <div className={styles.leadFormGrid}>
                <label className={styles.leadField}>
                  <span>Vorname</span>
                  <input name="firstName" autoComplete="given-name" />
                </label>
                <label className={styles.leadField}>
                  <span>Nachname</span>
                  <input name="lastName" autoComplete="family-name" />
                </label>
                <label className={styles.leadField}>
                  <span>E-Mail</span>
                  <input name="email" type="email" autoComplete="email" />
                </label>
                <label className={styles.leadField}>
                  <span>Telefon</span>
                  <input name="phone" type="tel" autoComplete="tel" />
                </label>
              </div>
            </div>

            <p className={styles.calculatorNote}>
              Hinweis: Diese Berechnung ist eine unverbindliche Ersteinschätzung und ersetzt kein
              Gutachten, keine rechtliche Prüfung und kein verbindliches Angebot.
            </p>

            <button className={styles.btnPrimaryLg} type="submit" disabled={state === "submitting"}>
              {state === "submitting" ? "Ergebnis wird gesendet..." : "Kostenlose Ersteinschätzung erhalten"}
            </button>

            {message ? (
              <p className={state === "success" ? styles.leadFormSuccess : styles.leadFormError}>
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}

function roundToThousand(value: number): number {
  return Math.round(value / 1000) * 1000;
}

function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}

function roundToEuro(value: number): number {
  return Math.round(value);
}

function propertyTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    single_family: "Einfamilienhaus",
    semi_detached: "Doppelhaushälfte",
    row_house: "Reihenhaus",
    apartment: "Eigentumswohnung",
  };
  return labels[value] || value;
}

function productInterestLabel(value: ProductInterest): string {
  const labels: Record<ProductInterest, string> = {
    fixed_residential_right: "Zwei-Phasen-Wohnrecht",
    sale_and_leaseback: "Rückmietverkauf",
    other: "Beide vergleichen",
  };
  return labels[value];
}
