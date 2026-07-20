import { isInternalAdmin } from "@/lib/access-control";
import { handleApiError, json } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatAddress } from "@/lib/address";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 15;

const leadStatusLabels: Record<string, string> = {
  NEW: "Lead",
  QUALIFIED: "Qualifiziert",
  ASSIGNED: "An Makler weitergeleitet",
  CONTACTED: "Kontaktiert",
  CONVERTED: "In Kundenfall umgewandelt",
  IN_REVIEW: "In Prüfung",
  ASSIGNED_TO_PARTNER: "An Makler weitergeleitet",
  PARTNER_CONTACT_PENDING: "Kontakt durch Makler offen",
  CONVERTED_TO_CASE: "In Kundenfall umgewandelt",
  CLOSED: "Geschlossen",
  REJECTED: "Abgelehnt",
};

const caseStatusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  SUBMITTED: "Eingereicht",
  DATA_INCOMPLETE: "Daten unvollständig",
  VALUATION_PENDING: "Bewertung läuft",
  VALUATED: "Bewertung fertig",
  OFFER_CALCULATED: "Angebot berechnet",
  OFFER_DRAFTED: "Angebotsentwurf",
  INTERNAL_REVIEW: "Interne Prüfung",
  APPROVED: "Freigegeben",
  SENT: "Versendet",
  INDICATIVE_OFFER_SENT: "UVA abgegeben",
  OFFER_ACCEPTED: "UVA angenommen",
  EXPERT_OPINION_ORDERED: "Gutachten beauftragt",
  EXPERT_OPINION_RECEIVED: "Gutachten eingegangen",
  BINDING_OFFER_SENT: "VA abgegeben",
  BINDING_OFFER_ACCEPTED: "VA angenommen",
  PURCHASE_STARTED: "Ankauf gestartet",
  NOTARY_APPOINTMENT: "Notartermin vereinbart",
  PURCHASED: "Kaufvertrag abgeschlossen",
  IN_PORTFOLIO: "Im Bestand",
  APPOINTMENT_SCHEDULED: "Termin vereinbart",
  WON: "Gewonnen",
  SOLD: "Verkauft",
  EXIT_COMPLETED: "Abgeschlossen",
  REJECTED: "Abgelehnt",
  LOST: "Verloren",
};

function contains(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

function compactAddress(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(", ");
}

function fullName(firstName?: string | null, lastName?: string | null, fallback?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || fallback || "Name offen";
}

export async function GET(request: Request): Promise<Response> {
  try {
    const user = requireCurrentUser();
    const url = new URL(request.url);
    const query = (url.searchParams.get("q") || "").trim();

    if (query.length < 2) {
      return json({ results: [] });
    }

    const queryTerms = query.split(/\s+/).filter((term) => term.length >= 2).slice(0, 4);
    const basePath = user.role === "admin" ? "/admin" : "/partner";
    const propertyVisibility = user.role === "partner"
      ? { partnerId: user.partnerId }
      : isInternalAdmin(user)
        ? {}
        : { assignedAdvisorUserId: user.id };
    const leadVisibility = user.role === "partner"
      ? { assignedPartnerId: user.partnerId }
      : isInternalAdmin(user)
        ? {}
        : { assignedAdvisorUserId: user.id };

    const propertySearch = [
      { caseNumber: contains(query) },
      { objectTitle: contains(query) },
      { street: contains(query) },
      { postalCode: contains(query) },
      { city: contains(query) },
      { customer: { is: { firstName: contains(query) } } },
      { customer: { is: { lastName: contains(query) } } },
      { customer: { is: { displayName: contains(query) } } },
      { customer: { is: { street: contains(query) } } },
      { customer: { is: { houseNumber: contains(query) } } },
      { customer: { is: { postalCode: contains(query) } } },
      { customer: { is: { city: contains(query) } } },
      { customer: { is: { email: contains(query) } } },
      { customer: { is: { phone: contains(query) } } },
      { customer: { is: { mobile: contains(query) } } },
      ...(queryTerms.length > 1 ? [{
        customer: {
          is: {
            AND: queryTerms.map((term) => ({
              OR: [
                { firstName: contains(term) },
                { lastName: contains(term) },
                { displayName: contains(term) },
                { street: contains(term) },
                { houseNumber: contains(term) },
                { postalCode: contains(term) },
                { city: contains(term) },
              ],
            })),
          },
        },
      }] : []),
    ];

    const leadSearch = [
      { leadNumber: contains(query) },
      { name: contains(query) },
      { firstName: contains(query) },
      { lastName: contains(query) },
      { email: contains(query) },
      { phone: contains(query) },
      { mobilePhone: contains(query) },
      { street: contains(query) },
      { houseNumber: contains(query) },
      { postalCode: contains(query) },
      { city: contains(query) },
      { propertyStreet: contains(query) },
      { propertyPostalCode: contains(query) },
      { propertyCity: contains(query) },
      { region: contains(query) },
      ...(queryTerms.length > 1 ? [{
        AND: queryTerms.map((term) => ({
          OR: [
            { name: contains(term) },
            { firstName: contains(term) },
            { lastName: contains(term) },
            { street: contains(term) },
            { houseNumber: contains(term) },
            { postalCode: contains(term) },
            { city: contains(term) },
            { propertyStreet: contains(term) },
            { propertyPostalCode: contains(term) },
            { propertyCity: contains(term) },
          ],
        })),
      }] : []),
    ];

    const [properties, leads] = await Promise.all([
      prisma.property.findMany({
        where: {
          ...propertyVisibility,
          OR: propertySearch,
        },
        include: {
          customer: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.lead.findMany({
        where: {
          ...leadVisibility,
          OR: leadSearch,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    const caseResults = properties.map((property) => ({
      type: "case",
      id: property.id,
      caseNumber: property.caseNumber || property.id,
      customerName: fullName(property.customer.firstName, property.customer.lastName, property.customer.displayName),
      propertyAddress: compactAddress([property.street, [property.postalCode, property.city].filter(Boolean).join(" ")]),
      status: property.status,
      statusLabel: caseStatusLabels[property.status] || property.status,
      href: `${basePath}?case=${encodeURIComponent(property.id)}&tab=kunde`,
    }));

    const leadResults = leads.map((lead) => ({
      type: "lead",
      id: lead.id,
      leadNumber: lead.leadNumber,
      customerName: fullName(lead.firstName, lead.lastName, lead.name),
      propertyAddress: lead.propertyStreet
        ? compactAddress([
            lead.propertyStreet,
            [lead.propertyPostalCode || lead.postalCode, lead.propertyCity || lead.city].filter(Boolean).join(" "),
          ])
        : formatAddress(lead) || lead.region || "Ort offen",
      status: lead.status,
      statusLabel: leadStatusLabels[lead.status] || "Lead",
      href: `${basePath}?screen=leads&lead=${encodeURIComponent(lead.id)}`,
    }));

    return json({ results: [...caseResults, ...leadResults].slice(0, MAX_RESULTS) });
  } catch (err) {
    return handleApiError(err);
  }
}
