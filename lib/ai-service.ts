import type { CaseView, Offer } from "./domain.ts";

export type AiOfferText = {
  customerText: string;
  partnerSummary: string;
  internalRationale: string;
};

function eur(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function generateMockOfferText(caseView: CaseView, offer: Offer): AiOfferText {
  const customerName = `${caseView.customer.firstName} ${caseView.customer.lastName}`.trim();
  const address = `${caseView.property.street}, ${caseView.property.postalCode} ${caseView.property.city}`;
  const years = offer.residentialRightYears ? `${offer.residentialRightYears} Jahre` : "nach individueller Vereinbarung";
  const offerLabel = offer.kind === "binding" ? "verbindliche" : "indikative";
  const valueLabel = offer.kind === "binding" ? "Gutachtenwert" : "indikativen Marktwert";

  return {
    customerText:
      `ENTWURF: Sehr geehrte/r ${customerName}, auf Basis der geprüften Objektdaten zur Immobilie ${address} ` +
      `und des ${valueLabel}s von ${eur(offer.marketValue)} ergibt sich für das Modell ${offer.model} ` +
      `eine ${offerLabel} Auszahlung von ${eur(offer.payoutAmount)}. Das Wohnrecht wurde mit ${years} angesetzt. ` +
      "Der nächste Schritt ist die interne Finalprüfung und ein persönliches Beratungsgespräch.",
    partnerSummary:
      `ENTWURF: Angebot für ${customerName}: ${valueLabel} ${eur(offer.marketValue)}, ${offerLabel} Auszahlung ${eur(offer.payoutAmount)}, ` +
      `Modell ${offer.model}, Wohnrecht ${years}. Zahlen wurden aus der Angebotsberechnung übernommen und nicht durch KI verändert.`,
    internalRationale:
      `ENTWURF: Die Auszahlung basiert auf Marktwert ${eur(offer.marketValue)}, adjustiertem Wert ${eur(offer.adjustedMarketValue)}, ` +
      `Wohnrechtsabschlag ${eur(offer.residentialRightValue)}, Risikoabschlag ${eur(offer.riskDiscount)} und Zielmarge ${eur(offer.companyMargin)}.`
  };
}
