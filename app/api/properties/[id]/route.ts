import { canMutateProperty, canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { filterCaseViewForUser, getDbCaseByPropertyId, toOptionalPrismaJson } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { propertyUpdateSchema } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ case: filterCaseViewForUser(caseView, user) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canMutateProperty(user, caseView.property)) throw new Error("Forbidden");
    const rawBody = await request.json();
    const body = propertyUpdateSchema.parse(rawBody);
    const isPortfolioCustomer = caseView.property.status === "IN_PORTFOLIO" || Boolean(caseView.property.portfolioEnteredAt);
    const hasField = (field: string) => Object.prototype.hasOwnProperty.call(rawBody, field);
    const modelChangeRequested =
      (hasField("desiredModel") && body.desiredModel !== caseView.property.desiredModel) ||
      (hasField("additionalOfferRequested") && body.additionalOfferRequested !== caseView.property.additionalOfferRequested) ||
      (hasField("additionalOfferModel") && body.additionalOfferModel !== caseView.property.additionalOfferModel);
    if (isPortfolioCustomer && modelChangeRequested) {
      throw new Error("Das Modell kann bei Bestandskunden nicht mehr geändert werden.");
    }
    if (body.leasehold !== undefined || body.monumentProtection !== undefined || body.leaseholdOrMonument !== undefined) {
      body.leaseholdOrMonument = Boolean(body.leaseholdOrMonument || body.leasehold || body.monumentProtection);
    }
    const { customerId: _customerId, energyCarriers, modernization, buildingCondition, ...propertyData } = body;
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        ...propertyData,
        caseSource: body.caseSource as never,
        propertyType: body.propertyType as never,
        condition: body.condition as never,
        desiredModel: body.desiredModel as never,
        preferredValuationProvider: body.preferredValuationProvider as never,
        residentialRightRecipients: body.residentialRightRecipients as never,
        additionalOfferModel: body.additionalOfferModel as never,
        additionalOfferResidentialRightRecipients: body.additionalOfferResidentialRightRecipients as never,
        parkingType: body.parkingType as never,
        basementType: body.basementType as never,
        visualConditionRating: body.visualConditionRating as never,
        moistureDamageStatus: body.moistureDamageStatus as never,
        accessibilityAssessment: body.accessibilityAssessment as never,
        hasElevator: body.propertyType === "apartment" ? body.hasElevator : body.propertyType ? null : body.hasElevator,
        knownMajorMaintenanceOrSpecialAssessmentsDescription: body.knownMajorMaintenanceOrSpecialAssessments === false ? null : body.knownMajorMaintenanceOrSpecialAssessmentsDescription,
        moistureDamageDescription: body.moistureDamageStatus === "NONE" ? null : body.moistureDamageDescription,
        energyCarriersJson: toOptionalPrismaJson(body.energyCarriers),
        modernizationJson: toOptionalPrismaJson(body.modernization),
        buildingConditionJson: toOptionalPrismaJson(body.buildingCondition)
      }
    });
    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
