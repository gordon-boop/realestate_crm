import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireInternalRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { propertyRejectSchema } from "@/lib/validation";

const rejectionReasonLabels: Record<string, string> = {
  location: "Lage / Marktgängigkeit",
  condition: "Objektzustand",
  age: "Alter / Laufzeit passt nicht",
  documents: "Unterlagen oder Datenlage unzureichend",
  valuation: "Bewertung / Wirtschaftlichkeit",
  legal: "Rechtliche Ausschlusskriterien",
  occupancy: "Nutzung / Vermietung",
  other: "Sonstiger Grund"
};

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireInternalRole("admin", "super_admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = propertyRejectSchema.parse(await request.json());
    const reasonLabel = body.reasonLabel || (body.reasonCode === "location" ? "Lage / Marktgängigkeit" : rejectionReasonLabels[body.reasonCode]) || "Sonstiger Grund";
    const message = body.note
      ? `Fall wurde abgelehnt: ${reasonLabel}. Hinweis an Makler: ${body.note}`
      : `Fall wurde abgelehnt: ${reasonLabel}.`;

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        rejectionReasonCode: body.reasonCode,
        rejectionReasonLabel: reasonLabel,
        rejectionNote: body.note,
        rejectedAt: new Date(),
        rejectedByUserId: user.id,
        lastActivityLabel: "Gerade eben",
        lastActivityAt: new Date()
      }
    });

    await addDbActivity(params.id, user.id, "case_rejected", message, {
      source: "admin",
      entityType: "property",
      entityId: params.id,
      metadata: {
        reasonCode: body.reasonCode,
        reasonLabel,
        note: body.note
      }
    });

    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
