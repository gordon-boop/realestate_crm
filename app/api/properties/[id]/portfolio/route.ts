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
        maintenancePlanJson: toOptionalPrismaJson(body.maintenancePlan),
        portfolioTasksJson: toOptionalPrismaJson(body.portfolioTasks),
        portfolioNotes: body.portfolioNotes ?? null
      }
    });

    await addDbActivity(params.id, user.id, "portfolio_file_updated", "Bestandsakte wurde aktualisiert.", {
      source: "admin",
      entityType: "property",
      entityId: params.id
    });

    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
