import type { CaseView, DesiredModel, Offer, User } from "./domain.ts";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

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

export type IndicativeOfferPdfData = {
  customerSalutation: string;
  customerFullName: string;
  customerFirstName: string;
  customerLastName: string;
  customerStreet: string;
  customerPostalCode: string;
  customerCity: string;
  customerAddressBlock: string;
  customerGreeting: string;
  propertyStreet: string;
  propertyPostalCode: string;
  propertyCity: string;
  propertyAddressBlock: string;
  propertyType: string;
  livingAreaSqm: string;
  plotAreaSqm: string;
  offerDate: string;
  offerValidUntil: string;
  marketValue: string;
  payoutAmount: string;
  payoutRate: string;
  modelLabel: string;
  residentialRightYears: string;
  monthlyFeeAfterFreePeriod: string;
  annualRent: string;
  monthlyRent: string;
  advisorName: string;
  advisorRole: string;
  advisorPhone: string;
  advisorEmail: string;
  companyName: string;
  companyStreet: string;
  companyPostalCode: string;
  companyCity: string;
  managingDirectors: string;
  courtRegistration: string;
  caseNumber: string;
};

const modelLabels: Record<DesiredModel, string> = {
  fixed_residential_right: "Wohnrecht",
  sale_and_leaseback: "Rückmietverkauf",
  other: "Nutzungsmodell"
};

const propertyTypeLabels: Record<string, string> = {
  house: "Haus",
  single_family: "Einfamilienhaus",
  semi_detached: "Doppelhaushälfte",
  row_house: "Reihenhaus",
  apartment: "Wohnung",
  multi_family: "Mehrfamilienhaus",
  other: "Sonstiges Objekt"
};

function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatEuroCents(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatPercentValue(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

function valueOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function customerGreeting(caseView: CaseView): string {
  const lastName = caseView.customer.lastName || caseView.customer.displayName || caseView.customer.firstName || "";
  if (caseView.customer.gender === "female" && lastName) return `Sehr geehrte Frau ${lastName},`;
  if (caseView.customer.gender === "male" && lastName) return `Sehr geehrter Herr ${lastName},`;
  if (lastName) return `Guten Tag ${caseView.customer.firstName ? caseView.customer.firstName + " " : ""}${lastName},`;
  return "Guten Tag,";
}

function rentBackMetrics(offer: Offer) {
  const marketValue = Number(offer.marketValue || 0);
  const payoutRate = 0.7;
  const annualRentRate = 0.05;
  const payoutAmount = Math.round(marketValue * payoutRate * 100) / 100;
  const annualRent = Math.round(payoutAmount * annualRentRate * 100) / 100;
  const monthlyRent = Math.round((annualRent / 12) * 100) / 100;
  return { marketValue, payoutRate, payoutAmount, annualRentRate, annualRent, monthlyRent };
}

export function buildIndicativeOfferPdfData(caseView: CaseView, offer: Offer, advisor?: Pick<User, "name" | "email">): IndicativeOfferPdfData {
  const offerDate = offer.sentAt || caseView.property.indicativeOfferSentAt || offer.updatedAt || new Date().toISOString();
  const validUntil = new Date(offerDate);
  validUntil.setDate(validUntil.getDate() + 28);
  const customerFullName = [caseView.customer.firstName, caseView.customer.lastName].filter(Boolean).join(" ").trim();
  const customerAddress = [
    customerFullName,
    caseView.customer.street,
    [caseView.customer.postalCode, caseView.customer.city].filter(Boolean).join(" ")
  ].filter(Boolean).join("\n");
  const propertyAddress = [
    caseView.property.street,
    [caseView.property.postalCode, caseView.property.city].filter(Boolean).join(" ")
  ].filter(Boolean).join("\n");
  const isRentBack = offer.model === "sale_and_leaseback";
  const rentBack = isRentBack ? rentBackMetrics(offer) : null;
  const payoutAmount = rentBack?.payoutAmount ?? Number(offer.payoutAmount || 0);
  const marketValue = rentBack?.marketValue ?? Number(offer.marketValue || 0);
  const payoutRate = rentBack?.payoutRate ?? (marketValue > 0 ? payoutAmount / marketValue : 0);

  return {
    customerSalutation: caseView.customer.gender === "female" ? "Sehr geehrte Frau" : caseView.customer.gender === "male" ? "Sehr geehrter Herr" : "Guten Tag",
    customerFullName: valueOrDash(customerFullName),
    customerFirstName: valueOrDash(caseView.customer.firstName),
    customerLastName: valueOrDash(caseView.customer.lastName),
    customerStreet: valueOrDash(caseView.customer.street),
    customerPostalCode: valueOrDash(caseView.customer.postalCode),
    customerCity: valueOrDash(caseView.customer.city),
    customerAddressBlock: customerAddress || "-",
    customerGreeting: customerGreeting(caseView),
    propertyStreet: valueOrDash(caseView.property.street),
    propertyPostalCode: valueOrDash(caseView.property.postalCode),
    propertyCity: valueOrDash(caseView.property.city),
    propertyAddressBlock: propertyAddress || "-",
    propertyType: propertyTypeLabels[caseView.property.propertyType] ?? "-",
    livingAreaSqm: caseView.property.livingAreaSqm ? `${caseView.property.livingAreaSqm} m2` : "-",
    plotAreaSqm: caseView.property.plotAreaSqm ? `${caseView.property.plotAreaSqm} m2` : "-",
    offerDate: formatDate(offerDate),
    offerValidUntil: formatDate(validUntil),
    marketValue: formatEuroCents(marketValue),
    payoutAmount: formatEuroCents(payoutAmount),
    payoutRate: formatPercentValue(payoutRate),
    modelLabel: modelLabels[offer.model] ?? "Nutzungsmodell",
    residentialRightYears: offer.residentialRightYears ? `${offer.residentialRightYears} Jahre` : "-",
    monthlyFeeAfterFreePeriod: rentBack ? formatEuroCents(rentBack.monthlyRent) : "-",
    annualRent: rentBack ? formatEuroCents(rentBack.annualRent) : "-",
    monthlyRent: rentBack ? formatEuroCents(rentBack.monthlyRent) : "-",
    advisorName: advisor?.name || "WohnKapital Beratung",
    advisorRole: "Kundenberatung",
    advisorPhone: "-",
    advisorEmail: advisor?.email || "-",
    companyName: "WohnKapital",
    companyStreet: "Musterstraße 1",
    companyPostalCode: "12345",
    companyCity: "Stuttgart",
    managingDirectors: "-",
    courtRegistration: "-",
    caseNumber: caseView.property.caseNumber || caseView.property.id
  };
}

export type IndicativeOfferTemplateKind = "residential-right" | "rent-back";

export function getIndicativeOfferTemplateFileName(model: DesiredModel): string {
  return model === "sale_and_leaseback"
    ? "indicative-offer-template-rent-back.docx"
    : "indicative-offer-template.docx";
}

export function getIndicativeOfferTemplateKind(model: DesiredModel): IndicativeOfferTemplateKind {
  return model === "sale_and_leaseback" ? "rent-back" : "residential-right";
}

export function createIndicativeOfferDocx(template: Buffer, data: IndicativeOfferPdfData, kind: IndicativeOfferTemplateKind = "residential-right"): Buffer {
  const zip = new PizZip(template);
  prepareIndicativeOfferTemplate(zip, kind);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "-"
  });
  doc.render(data);
  return doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
}

function prepareIndicativeOfferTemplate(zip: PizZip, kind: IndicativeOfferTemplateKind): void {
  const xmlPaths = [
    "word/document.xml",
    "word/header1.xml",
    "word/header2.xml",
    "word/header3.xml",
    "word/footer1.xml",
    "word/footer2.xml",
    "word/footer3.xml"
  ];

  for (const path of xmlPaths) {
    const file = zip.file(path);
    if (!file) continue;
    zip.file(path, prepareIndicativeOfferTemplateXml(file.asText(), kind));
  }
}

function prepareIndicativeOfferTemplateXml(xml: string, kind: IndicativeOfferTemplateKind): string {
  const prepared = xml
    .replace(/Stuttgart, 11\.<\/w:t><\/w:r><w:r[\s\S]*?<w:t>01<\/w:t><\/w:r><w:r[\s\S]*?<w:t>\.202<\/w:t><\/w:r><w:r[\s\S]*?<w:t>6<\/w:t>/g, "{companyCity}, {offerDate}</w:t></w:r><w:r><w:t></w:t></w:r><w:r><w:t></w:t></w:r><w:r><w:t></w:t>")
    .replace(/XX\.XX\.202<\/w:t><\/w:r><w:r[\s\S]*?<w:t>6<\/w:t>/g, "{offerValidUntil}</w:t></w:r><w:r><w:t></w:t>")
    .replace(/Musterstraße 1 I 12345 Stuttgart/g, "{companyStreet} I {companyPostalCode} {companyCity}")
    .replace(/Max Mustermann/g, "{advisorName}")
    .replace(/0711\/123456/g, "{advisorPhone}")
    .replace(/m\.mustermann@wohnkapital\.de/g, "{advisorEmail}")
    .replace(/Stuttgart,\s*11\.\s*01\s*\.202\s*6/g, "{companyCity}, {offerDate}")
    .replace(/Herr und Frau Mustermann/g, "{customerFullName}")
    .replace(/Musterstraße 1/g, "{customerStreet}")
    .replace(/12345 Musterstadt/g, "{customerPostalCode} {customerCity}")
    .replace(/Sehr geehrte Frau Mustermann,/g, "{customerGreeting}")
    .replace(/sehr geehrter Herr Mustermann,/g, "")
    .replace(/XX\.XX\.202\s*6/g, "{offerValidUntil}")
    .replace(/Familie Mustermann/g, "{customerFullName}");

  return kind === "rent-back"
    ? prepareRentBackTemplateXml(prepared)
    : prepareResidentialRightTemplateXml(prepared);
}

function prepareResidentialRightTemplateXml(xml: string): string {
  return xml
    .replace(/XXX\.XXX €/g, "{marketValue}\nIndikative Auszahlung: {payoutAmount} ({payoutRate})")
    .replace(/X\.XXX €/g, "{monthlyFeeAfterFreePeriod}");
}

function prepareRentBackTemplateXml(xml: string): string {
  let prepared = replaceOnce(xml, /XXX\.XXX €/, "{marketValue}");
  prepared = replaceOnce(prepared, /XXX\.XXX € Auszahlung;/, "{payoutAmount} Auszahlung;");
  return prepared
    .replace(/XX %/g, "{payoutRate}")
    .replace(/X\.XXX €/g, "{monthlyRent}")
    .replace(/5 bis 6 % p\.a\./g, "5 % p.a.");
}

function replaceOnce(input: string, search: RegExp, replacement: string): string {
  return input.replace(search, replacement);
}

export function sanitizePdfFileName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function createIndicativeOfferPdf(data: IndicativeOfferPdfData): Buffer {
  const detailRows = [
    ["Kunde", data.customerFullName],
    ["Kundenadresse", data.customerAddressBlock.replace(/\n/g, ", ")],
    ["Objekt", data.propertyAddressBlock.replace(/\n/g, ", ")],
    ["Objektart", data.propertyType],
    ["Wohnfläche", data.livingAreaSqm],
    ["Grundstücksfläche", data.plotAreaSqm],
    ["Modell", data.modelLabel],
    ["Verkehrswert", data.marketValue],
    ["Indikative Auszahlung", data.payoutAmount],
    ["Auszahlungsquote", data.payoutRate],
    ["Wohnrechtslaufzeit", data.residentialRightYears],
    ["Jahresmiete", data.annualRent],
    ["Monatliche Miete", data.monthlyRent],
    ["Angebotsdatum", data.offerDate],
    ["Gültig bis", data.offerValidUntil],
    ["Ansprechpartner", data.advisorName],
    ["E-Mail", data.advisorEmail]
  ];

  const paragraphs = [
    `${data.customerSalutation} ${data.customerLastName === "-" ? data.customerFullName : data.customerLastName},`,
    "vielen Dank für Ihr Interesse an WohnKapital. Auf Basis der vorliegenden Angaben haben wir eine unverbindliche erste Einschätzung für Ihre Immobilie vorbereitet.",
    data.modelLabel === "Rückmietverkauf"
      ? "Beim Rückmietverkauf verkaufen Sie Ihre Immobilie und bleiben anschließend als Mieter/Bewohner im Objekt. Diese Demo-Kalkulation verwendet eine pauschale Auszahlungsquote von 70 % des Verkehrswerts und einen Mietfaktor von 5 % p.a. des Auszahlungsbetrags."
      : "Beim Wohnrecht-Modell verkaufen Sie Ihre Immobilie und sichern sich das Recht, weiterhin im vertrauten Zuhause wohnen zu bleiben. Die konkrete Ausgestaltung wird transparent besprochen und notariell geregelt.",
    "Dieses indikative Angebot ist unverbindlich. Es ersetzt keine rechtliche, steuerliche oder notarielle Beratung und steht unter dem Vorbehalt einer vollständigen Prüfung der Immobilie und Unterlagen."
  ];

  const lines: Array<{ text: string; size?: number; bold?: boolean; gap?: number }> = [
    { text: "WohnKapital", size: 18, bold: true },
    { text: "Indikatives Angebot Immobilienverrentung", size: 16, bold: true, gap: 10 },
    { text: `Fall: ${data.caseNumber} · Datum: ${data.offerDate}`, size: 10, gap: 14 },
    ...paragraphs.flatMap((text) => wrapText(text, 82).map((line, index) => ({ text: line, size: 10.5, gap: index === 0 ? 5 : 0 }))),
    { text: "Angebotsübersicht", size: 13, bold: true, gap: 14 },
    ...detailRows.map(([label, value]) => ({ text: `${label}: ${value}`, size: 10.5 })),
    { text: "Hinweis", size: 13, bold: true, gap: 14 },
    ...wrapText("Alle genannten Beträge und Konditionen stellen eine unverbindliche Ersteinschätzung dar. Die finale Vertragsgestaltung erfolgt erst nach Prüfung, Gutachten und notarieller Abstimmung.", 82).map((text) => ({ text, size: 10.5 })),
    { text: "Mit freundlichen Grüßen", size: 10.5, gap: 18 },
    { text: data.advisorName, size: 10.5, bold: true },
    { text: data.companyName, size: 10.5 }
  ];

  return buildSimplePdf(lines);
}

function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSimplePdf(lines: Array<{ text: string; size?: number; bold?: boolean; gap?: number }>): Buffer {
  const pages: string[] = [];
  let y = 790;
  let content = "";

  function newPage() {
    if (content) pages.push(content);
    content = "";
    y = 790;
  }

  for (const line of lines) {
    const gap = line.gap ?? 3;
    const size = line.size ?? 10;
    const lineHeight = Math.max(13, size + 4) + gap;
    if (y - lineHeight < 52) newPage();
    y -= gap;
    content += `BT /${line.bold ? "F2" : "F1"} ${size} Tf 50 ${y} Td ${pdfLiteral(line.text)} Tj ET\n`;
    y -= Math.max(13, size + 4);
  }
  if (content) pages.push(content);

  const objects: Buffer[] = [];
  const addObject = (body: string | Buffer) => {
    const header = Buffer.from(`${objects.length + 1} 0 obj\n`, "ascii");
    const footer = Buffer.from("\nendobj\n", "ascii");
    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body, "ascii");
    objects.push(Buffer.concat([header, bodyBuffer, footer]));
    return objects.length;
  };

  const catalogId = 1;
  const pagesId = 2;
  addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  addObject("PAGES_PLACEHOLDER");
  const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pageIds: number[] = [];

  for (const pageContent of pages) {
    const stream = Buffer.from(pageContent, "ascii");
    const contentId = addObject(Buffer.concat([
      Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, "ascii"),
      stream,
      Buffer.from("endstream", "ascii")
    ]));
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = Buffer.from(`${pagesId} 0 obj\n<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>\nendobj\n`, "ascii");

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(object);
  }
  const xrefOffset = Buffer.concat(chunks).length;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF"
  ].join("\n");
  chunks.push(Buffer.from(xref, "ascii"));
  return Buffer.concat(chunks);
}

function pdfLiteral(value: string): string {
  let output = "(";
  for (const char of normalizePdfText(value)) {
    const code = cp1252Code(char);
    if (code === 40 || code === 41 || code === 92) {
      output += `\\${String.fromCharCode(code)}`;
    } else if (code < 32 || code > 126) {
      output += `\\${code.toString(8).padStart(3, "0")}`;
    } else {
      output += String.fromCharCode(code);
    }
  }
  return `${output})`;
}

function normalizePdfText(value: string): string {
  return value
    .replace(/[“”„]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\u00A0/g, " ");
}

function cp1252Code(char: string): number {
  const special: Record<string, number> = {
    "€": 128,
    "‚": 130,
    "ƒ": 131,
    "„": 132,
    "…": 133,
    "†": 134,
    "‡": 135,
    "ˆ": 136,
    "‰": 137,
    "Š": 138,
    "‹": 139,
    "Œ": 140,
    "Ž": 142,
    "‘": 145,
    "’": 146,
    "“": 147,
    "”": 148,
    "•": 149,
    "–": 150,
    "—": 151,
    "˜": 152,
    "™": 153,
    "š": 154,
    "›": 155,
    "œ": 156,
    "ž": 158,
    "Ÿ": 159
  };
  if (special[char]) return special[char];
  const code = char.charCodeAt(0);
  return code <= 255 ? code : 63;
}
