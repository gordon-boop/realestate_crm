import { canMutateProperty } from "@/lib/access-control";
import { formatAddress } from "@/lib/address";
import { handleApiError, json, requireRole } from "@/lib/api";
import { assertCurrentDraftVersion, draftSummary, intakeDraftRequestSchema } from "@/lib/intake-draft";
import { toOptionalPrismaJson } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = intakeDraftRequestSchema.parse(await request.json());
    const current = await prisma.property.findUnique({
      where: { id: params.id },
      include: { customer: true }
    });
    if (!current) throw new Error("Property not found");
    if (!canMutateProperty(user, current as never)) throw new Error("Forbidden");
    if (current.status !== "DRAFT") throw new Error("Nur Entwürfe können über die Erfassung geändert werden.");
    assertCurrentDraftVersion(current.updatedAt, body.expectedUpdatedAt);
    const summary = draftSummary(body.draft);

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.update({
        where: { id: current.customerId },
        data: {
          displayName: summary.displayName,
          firstName: summary.firstName,
          lastName: summary.lastName,
          street: typeof body.draft.street === "string" ? body.draft.street : null,
          houseNumber: typeof body.draft.houseNumber === "string" ? body.draft.houseNumber : null,
          postalCode: typeof body.draft.postalCode === "string" ? body.draft.postalCode : null,
          city: typeof body.draft.city === "string" ? body.draft.city : null,
          addressText: formatAddress(body.draft),
          consentDataProcessing: body.draft.consentDataProcessing === true
        }
      });
      const property = await tx.property.update({
        where: { id: current.id },
        data: {
          objectTitle: summary.objectTitle,
          street: summary.street,
          postalCode: summary.postalCode,
          city: summary.city,
          propertyType: summary.propertyType as never,
          livingAreaSqm: summary.livingAreaSqm,
          plotAreaSqm: summary.plotAreaSqm,
          condition: summary.condition as never,
          desiredModel: summary.desiredModel as never,
          intakeDraftJson: toOptionalPrismaJson(body.draft),
          draftIntakeStep: body.currentStep,
          notes: user.role === "admin" && body.internalIntakeSource
            ? `Direkterfassung intern · Quelle: ${body.internalIntakeSource}`
            : current.notes
        }
      });
      return { customer, property };
    });
    return json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
