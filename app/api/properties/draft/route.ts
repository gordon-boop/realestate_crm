import { isInternalAdmin } from "@/lib/access-control";
import { formatAddress } from "@/lib/address";
import { handleApiError, json, requireRole } from "@/lib/api";
import { nextPropertyCaseNumber } from "@/lib/case-number";
import { draftSummary, intakeDraftRequestSchema } from "@/lib/intake-draft";
import { addDbActivity, toOptionalPrismaJson } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = intakeDraftRequestSchema.omit({ expectedUpdatedAt: true }).parse(await request.json());
    const summary = draftSummary(body.draft);
    const partnerId = user.role === "partner" ? user.partnerId : undefined;
    const assignedAdvisorUserId = user.role === "admin" ? user.id : undefined;
    if (!partnerId && !assignedAdvisorUserId) throw new Error("Partner oder Kundenberater required");
    if (user.role === "admin" && !isInternalAdmin(user) && !assignedAdvisorUserId) throw new Error("Forbidden");

    const caseNumber = await nextPropertyCaseNumber();
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          partnerId,
          assignedAdvisorUserId,
          displayName: summary.displayName,
          firstName: summary.firstName,
          lastName: summary.lastName,
          street: typeof body.draft.street === "string" ? body.draft.street : undefined,
          houseNumber: typeof body.draft.houseNumber === "string" ? body.draft.houseNumber : undefined,
          postalCode: typeof body.draft.postalCode === "string" ? body.draft.postalCode : undefined,
          city: typeof body.draft.city === "string" ? body.draft.city : undefined,
          addressText: formatAddress(body.draft),
          consentDataProcessing: body.draft.consentDataProcessing === true
        }
      });
      const property = await tx.property.create({
        data: {
          caseNumber,
          objectTitle: summary.objectTitle,
          customerId: customer.id,
          partnerId,
          assignedAdvisorUserId,
          caseSource: user.role === "partner" ? "PARTNER" : "INTERNAL",
          propertyType: summary.propertyType as never,
          street: summary.street,
          postalCode: summary.postalCode,
          city: summary.city,
          livingAreaSqm: summary.livingAreaSqm,
          plotAreaSqm: summary.plotAreaSqm,
          condition: summary.condition as never,
          desiredModel: summary.desiredModel as never,
          intakeDraftJson: toOptionalPrismaJson(body.draft),
          draftIntakeStep: body.currentStep,
          notes: user.role === "admin" && body.internalIntakeSource
            ? `Direkterfassung intern · Quelle: ${body.internalIntakeSource}`
            : undefined,
          status: "DRAFT"
        }
      });
      return { customer, property };
    });

    await addDbActivity(result.property.id, user.id, "case_created", "Entwurf wurde angelegt.");
    const currentVersion = await prisma.property.findUniqueOrThrow({
      where: { id: result.property.id },
      select: { updatedAt: true }
    });
    return json({
      success: true,
      draftId: result.property.id,
      updatedAt: currentVersion.updatedAt.toISOString(),
      ...result,
      property: {
        ...result.property,
        updatedAt: currentVersion.updatedAt
      }
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
