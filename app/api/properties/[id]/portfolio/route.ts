import { canMutateProperty, canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId, toOptionalPrismaJson } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { portfolioUpdateSchema } from "@/lib/validation";

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

    return json({ portfolio: caseView.property });
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

    const body = portfolioUpdateSchema.parse(await request.json());
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        purchaseContractNumber: body.purchaseContractNumber ?? null,
        purchaseContractSignedAt: dateOrNull(body.purchaseContractSignedAt),
        purchasePrice: body.purchasePrice ?? null,
        payoutPaidAt: dateOrNull(body.payoutPaidAt),
        ownershipTransferAt: dateOrNull(body.ownershipTransferAt),
        landRegisterEntryAt: dateOrNull(body.landRegisterEntryAt),
        monthlyRent: body.monthlyRent ?? null,
        rentStartAt: dateOrNull(body.rentStartAt),
        rentDeposit: body.rentDeposit ?? null,
        residentialRightStartAt: dateOrNull(body.residentialRightStartAt),
        residentialRightEndAt: dateOrNull(body.residentialRightEndAt),
        residentialRightNotes: body.residentialRightNotes ?? null,
        notaryAppointmentRequestedAt: dateOrNull(body.notaryAppointmentRequestedAt),
        purchaseContractDraftReceivedAt: dateOrNull(body.purchaseContractDraftReceivedAt),
        purchaseContractDraftReviewedAt: dateOrNull(body.purchaseContractDraftReviewedAt),
        priorityNoticeRegisteredAt: dateOrNull(body.priorityNoticeRegisteredAt),
        purchasePriceDueAt: dateOrNull(body.purchasePriceDueAt),
        purchasePricePaidAt: dateOrNull(body.purchasePricePaidAt),
        residentialRightRegisteredAt: dateOrNull(body.residentialRightRegisteredAt),
        benefitsAndBurdensTransferAt: dateOrNull(body.benefitsAndBurdensTransferAt),
        buildingInsuranceClarified: body.buildingInsuranceClarified ?? false,
        propertyManagerInformed: body.propertyManagerInformed ?? false,
        serviceChargeInfoRequested: body.serviceChargeInfoRequested ?? false,
        propertyTaxInfoAvailable: body.propertyTaxInfoAvailable ?? false,
        propertyFileComplete: body.propertyFileComplete ?? false,
        portfolioEnteredAt: dateOrNull(body.portfolioEnteredAt),
        residentStaysInProperty: body.residentStaysInProperty ?? true,
        residentName: body.residentName ?? null,
        usageModel: body.usageModel ?? null,
        usageRightStartsAt: dateOrNull(body.usageRightStartsAt),
        usageRightEndsAt: dateOrNull(body.usageRightEndsAt),
        monthlyUsageFee: body.monthlyUsageFee ?? null,
        residentContactName: body.residentContactName ?? null,
        residentEmergencyContact: body.residentEmergencyContact ?? null,
        propertyManagerName: body.propertyManagerName ?? null,
        buildingInsurance: body.buildingInsurance ?? null,
        serviceChargeStatus: body.serviceChargeStatus ?? null,
        repairReportingChannelClarified: body.repairReportingChannelClarified ?? false,
        conditionDocumentationAvailable: body.conditionDocumentationAvailable ?? false,
        nextPortfolioReviewAt: dateOrNull(body.nextPortfolioReviewAt),
        maintenancePlanJson: toOptionalPrismaJson(body.maintenancePlan),
        portfolioTasksJson: toOptionalPrismaJson(body.portfolioTasks),
        portfolioNotes: body.portfolioNotes ?? null
      }
    });

    await addDbActivity(params.id, user.id, "portfolio_file_updated", "Bestandsakte und Bewohnerverwaltung wurden aktualisiert.", {
      source: "admin",
      entityType: "property",
      entityId: params.id
    });

    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
