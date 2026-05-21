import { generateMockOfferText } from "./ai-service.ts";

export type AiOfferInput = {
  customerName: string;
  propertyAddress: string;
  marketValue: number;
  payoutAmount: number;
  residentialRightYears?: number | null;
  model: string;
};

export type AiOfferOutput = {
  customerText: string;
  partnerSummary: string;
  internalRationale: string;
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export async function generateAiOfferText(input: AiOfferInput): Promise<AiOfferOutput> {
  const yearsText = input.residentialRightYears ? `${input.residentialRightYears} Jahre` : "die vereinbarte Laufzeit";
  return {
    customerText:
      `ENTWURF: Auf Basis der geprüften Objektdaten zu ${input.propertyAddress} wurde ein indikatives Angebot erstellt. ` +
      `Der zugrunde gelegte Marktwert beträgt ${formatEuro(input.marketValue)}. Daraus ergibt sich für das Modell ${input.model} ` +
      `mit einem Wohnrecht über ${yearsText} eine indikative Auszahlung von ${formatEuro(input.payoutAmount)}. ` +
      "Dieses Angebot steht unter finaler Objektprüfung, rechtlicher Prüfung und notarieller Umsetzung.",
    partnerSummary:
      `ENTWURF: Indikatives Angebot für ${input.customerName}: Marktwert ${formatEuro(input.marketValue)}, Auszahlung ${formatEuro(input.payoutAmount)}, Modell ${input.model}.`,
    internalRationale: "ENTWURF: Der Text wurde aus freigegebenen Angebotsdaten erzeugt. Die KI hat keine Zahlen verändert."
  };
}

export { generateMockOfferText };
