import type { CaseView, Offer } from "./domain.ts";

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function generateOfferHtmlPreview(caseView: CaseView, offer: Offer): string {
  return `<!doctype html>
<html lang="de">
  <head><meta charset="utf-8"><title>${offer.offerNumber}</title></head>
  <body>
    <h1>Angebot ${offer.offerNumber}</h1>
    <p>${caseView.customer.firstName} ${caseView.customer.lastName}</p>
    <p>${caseView.property.street}, ${caseView.property.postalCode} ${caseView.property.city}</p>
    <h2>Angebotsdaten</h2>
    <p>Marktwert: ${formatEuro(offer.marketValue)}</p>
    <p>Indikative Auszahlung: ${formatEuro(offer.payoutAmount)}</p>
    <h2>Annahmen</h2>
    <pre>${JSON.stringify(offer.assumptions, null, 2)}</pre>
    <p>Rechtlicher Hinweis: Dieses MVP-Dokument ist ein unverbindlicher Entwurf und ersetzt keine rechtliche oder notarielle Prüfung.</p>
  </body>
</html>`;
}

export function createPdfStubUrl(offer: Offer): string {
  return `/pdf-stub/${offer.offerNumber}.pdf`;
}
