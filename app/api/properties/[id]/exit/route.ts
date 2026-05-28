import { canMutateProperty, canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { propertyExitProcessUpdateSchema } from "@/lib/validation";

function dateOrNull(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    return json({ exitProcess: caseView.property.exitProcess ?? null });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canMutateProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = propertyExitProcessUpdateSchema.parse(await request.json());
    const exitProcess = await prisma.propertyExitProcess.upsert({
      where: { propertyId: params.id },
      create: {
        propertyId: params.id,
        usageRightEndedAt: dateOrNull(body.usageRightEndedAt),
        terminationReason: body.terminationReason,
        terminationProofAvailable: body.terminationProofAvailable ?? false,
        relativesOrEstateContact: body.relativesOrEstateContact ?? null,
        relativesContactedAt: dateOrNull(body.relativesContactedAt),
        propertyAccessClarified: body.propertyAccessClarified ?? false,
        keyHandoverPlannedAt: dateOrNull(body.keyHandoverPlannedAt),
        keysReceivedAt: dateOrNull(body.keysReceivedAt),
        inspectionPlannedAt: dateOrNull(body.inspectionPlannedAt),
        inspectionCompletedAt: dateOrNull(body.inspectionCompletedAt),
        postMoveOutConditionReportAvailable: body.postMoveOutConditionReportAvailable ?? false,
        clearanceRequired: body.clearanceRequired ?? false,
        clearanceOrderedAt: dateOrNull(body.clearanceOrderedAt),
        clearanceCompletedAt: dateOrNull(body.clearanceCompletedAt),
        safetyInspectionCompleted: body.safetyInspectionCompleted ?? false,
        insuranceCoverageChecked: body.insuranceCoverageChecked ?? false,
        repairNeedCaptured: body.repairNeedCaptured ?? false,
        salesPreparationStartedAt: dateOrNull(body.salesPreparationStartedAt),
        brokerMandatedAt: dateOrNull(body.brokerMandatedAt),
        marketingStartedAt: dateOrNull(body.marketingStartedAt),
        salePriceIndication: body.salePriceIndication ?? null,
        salePriceFinal: body.salePriceFinal ?? null,
        salesStatus: body.salesStatus ?? "under_review",
        saleNotarizedAt: dateOrNull(body.saleNotarizedAt),
        salePriceReceivedAt: dateOrNull(body.salePriceReceivedAt),
        exitCompletedAt: dateOrNull(body.exitCompletedAt),
        internalNote: body.internalNote ?? null,
        responsibleUserId: body.responsibleUserId ?? null,
        followUpAt: dateOrNull(body.followUpAt)
      },
      update: {
        usageRightEndedAt: dateOrNull(body.usageRightEndedAt),
        terminationReason: body.terminationReason ?? null,
        terminationProofAvailable: body.terminationProofAvailable ?? false,
        relativesOrEstateContact: body.relativesOrEstateContact ?? null,
        relativesContactedAt: dateOrNull(body.relativesContactedAt),
        propertyAccessClarified: body.propertyAccessClarified ?? false,
        keyHandoverPlannedAt: dateOrNull(body.keyHandoverPlannedAt),
        keysReceivedAt: dateOrNull(body.keysReceivedAt),
        inspectionPlannedAt: dateOrNull(body.inspectionPlannedAt),
        inspectionCompletedAt: dateOrNull(body.inspectionCompletedAt),
        postMoveOutConditionReportAvailable: body.postMoveOutConditionReportAvailable ?? false,
        clearanceRequired: body.clearanceRequired ?? false,
        clearanceOrderedAt: dateOrNull(body.clearanceOrderedAt),
        clearanceCompletedAt: dateOrNull(body.clearanceCompletedAt),
        safetyInspectionCompleted: body.safetyInspectionCompleted ?? false,
        insuranceCoverageChecked: body.insuranceCoverageChecked ?? false,
        repairNeedCaptured: body.repairNeedCaptured ?? false,
        salesPreparationStartedAt: dateOrNull(body.salesPreparationStartedAt),
        brokerMandatedAt: dateOrNull(body.brokerMandatedAt),
        marketingStartedAt: dateOrNull(body.marketingStartedAt),
        salePriceIndication: body.salePriceIndication ?? null,
        salePriceFinal: body.salePriceFinal ?? null,
        salesStatus: body.salesStatus ?? "under_review",
        saleNotarizedAt: dateOrNull(body.saleNotarizedAt),
        salePriceReceivedAt: dateOrNull(body.salePriceReceivedAt),
        exitCompletedAt: dateOrNull(body.exitCompletedAt),
        internalNote: body.internalNote ?? null,
        responsibleUserId: body.responsibleUserId ?? null,
        followUpAt: dateOrNull(body.followUpAt)
      }
    });

    await addDbActivity(params.id, user.id, "exit_process_updated", "Verkaufsprozess wurde aktualisiert.", {
      source: "admin",
      entityType: "property",
      entityId: params.id
    });

    return json({ exitProcess });
  } catch (err) {
    return handleApiError(err);
  }
}
