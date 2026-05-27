import { isInternalAdmin } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { geocodePostalCode } from "@/lib/postal-code-geocoding";
import { prisma } from "@/lib/prisma";
import type { PropertyStatus } from "@prisma/client";

/**
 * Schlanke API für das Karten-Widget im Admin-Dashboard.
 * Liefert pro Objekt nur die Felder, die das Widget für Marker + Popup braucht.
 *
 * Rechte:
 * - super_admin / admin (intern): alle Objekte
 * - advisor / employee (intern): nur zugewiesene
 * - partner: KEINER ZUGRIFF (Widget ist intern). Wer einen Partner-Map-View
 *   später braucht, baut eine eigene Route.
 *
 * Query-Parameter:
 * - status: kommaseparierte Liste von PropertyStatus-Werten zum Filtern.
 *   Default: alle außer DRAFT, REJECTED, LOST.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin");

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const statusFilter = parseStatusFilter(statusParam);

    const where = {
      status: { in: statusFilter },
      ...(isInternalAdmin(user) ? {} : { assignedAdvisorUserId: user.id }),
    };

    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        caseNumber: true,
        objectTitle: true,
        street: true,
        postalCode: true,
        city: true,
        status: true,
        desiredModel: true,
        latitude: true,
        longitude: true,
        customer: { select: { firstName: true, lastName: true, displayName: true } },
        partner: { select: { companyName: true } },
        valuations: {
          select: { marketValue: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        offers: {
          select: { payoutAmount: true, kind: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const markers = properties
      .map((p) => {
        const coords =
          p.latitude !== null && p.longitude !== null
            ? { latitude: Number(p.latitude), longitude: Number(p.longitude), source: "stored" as const }
            : geocodePostalCode(p.postalCode, p.id);

        return {
          id: p.id,
          caseNumber: p.caseNumber ?? p.id,
          objectTitle: p.objectTitle,
          address: `${p.street}, ${p.postalCode} ${p.city}`,
          status: p.status,
          desiredModel: p.desiredModel,
          customerName:
            p.customer?.displayName ??
            [p.customer?.firstName, p.customer?.lastName].filter(Boolean).join(" ").trim() ??
            null,
          partnerName: p.partner?.companyName ?? null,
          marketValue: p.valuations[0]?.marketValue ? Number(p.valuations[0].marketValue) : null,
          payoutAmount: p.offers[0]?.payoutAmount ? Number(p.offers[0].payoutAmount) : null,
          latitude: coords.latitude,
          longitude: coords.longitude,
          geocodingSource: "source" in coords ? coords.source : "plz_region",
        };
      })
      // Sicherheitsnetz: Marker ohne valide Koordinaten ausschließen.
      .filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude));

    return json({ markers, statusFilter });
  } catch (err) {
    return handleApiError(err);
  }
}

const DEFAULT_EXCLUDED: PropertyStatus[] = ["DRAFT", "REJECTED", "LOST"];
const ALL_STATUSES: PropertyStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "DATA_INCOMPLETE",
  "VALUATION_PENDING",
  "VALUATED",
  "OFFER_CALCULATED",
  "OFFER_DRAFTED",
  "INTERNAL_REVIEW",
  "APPROVED",
  "SENT",
  "INDICATIVE_OFFER_SENT",
  "OFFER_ACCEPTED",
  "EXPERT_OPINION_ORDERED",
  "EXPERT_OPINION_RECEIVED",
  "BINDING_OFFER_SENT",
  "BINDING_OFFER_ACCEPTED",
  "PURCHASE_STARTED",
  "NOTARY_APPOINTMENT",
  "PURCHASED",
  "IN_PORTFOLIO",
  "APPOINTMENT_SCHEDULED",
  "REJECTED",
  "WON",
  "SOLD",
  "LOST",
];

function parseStatusFilter(param: string | null): PropertyStatus[] {
  if (!param) {
    return ALL_STATUSES.filter((s) => !DEFAULT_EXCLUDED.includes(s));
  }
  const requested = param.split(",").map((s) => s.trim()).filter(Boolean);
  const validated = requested.filter((s): s is PropertyStatus =>
    ALL_STATUSES.includes(s as PropertyStatus)
  );
  return validated.length > 0
    ? validated
    : ALL_STATUSES.filter((s) => !DEFAULT_EXCLUDED.includes(s));
}
