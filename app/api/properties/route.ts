import { canSeeProperty, isInternalAdmin } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { nextPropertyCaseNumber } from "@/lib/case-number";
import { addDbActivity, getDbCases, toOptionalPrismaJson } from "@/lib/persistence";
import { geocodePostalCode } from "@/lib/postal-code-geocoding";
import { prisma } from "@/lib/prisma";
import { propertyCreateSchema } from "@/lib/validation";

export async function GET(): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const cases = (await getDbCases(user)).filter((item) => canSeeProperty(user, item.property));
    return json({ cases });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = propertyCreateSchema.parse(await request.json());
    const customer = await prisma.customer.findUnique({ where: { id: String(body.customerId ?? "") } });
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");
    if (user.role === "admin" && !isInternalAdmin(user) && customer.assignedAdvisorUserId !== user.id) throw new Error("Forbidden");

    const caseSource = user.role === "partner"
      ? "PARTNER"
      : body.caseSource === "INTERNAL" || !customer.partnerId
        ? "INTERNAL"
        : "PARTNER";
    if (caseSource === "PARTNER" && !customer.partnerId) throw new Error("Partner case requires a partner");
    const assignedAdvisorUserId = caseSource === "INTERNAL"
      ? customer.assignedAdvisorUserId ?? user.id
      : customer.assignedAdvisorUserId ?? (user.role === "admin" ? user.id : undefined);
    const caseNumber = body.caseNumber || await nextPropertyCaseNumber();

    const property = await prisma.property.create({
      data: {
        caseNumber,
        objectTitle: body.objectTitle,
        customerId: customer.id,
        partnerId: caseSource === "PARTNER" ? customer.partnerId : undefined,
        assignedAdvisorUserId,
        caseSource,
        propertyType: body.propertyType as never,
        street: body.street,
        postalCode: body.postalCode,
        city: body.city,
        livingAreaSqm: body.livingAreaSqm,
        plotAreaSqm: body.plotAreaSqm,
        yearBuilt: body.yearBuilt,
        condition: body.condition as never,
        occupancyStatus: body.occupancyStatus,
        desiredModel: body.desiredModel as never,
        preferredValuationProvider: body.preferredValuationProvider as never,
        residentialRightRecipients: body.residentialRightRecipients as never,
        residentialRightPerson: body.residentialRightPerson,
        desiredResidentialRightYears: body.desiredResidentialRightYears,
        secondResidentialRightWanted: body.secondResidentialRightWanted,
        secondResidentialRightYears: body.secondResidentialRightYears,
        fixedTermReason: body.fixedTermReason,
        modelReason: body.modelReason,
        rentalModelDisclosureAccepted: body.rentalModelDisclosureAccepted,
        additionalOfferRequested: body.additionalOfferRequested,
        additionalOfferModel: body.additionalOfferModel as never,
        additionalOfferResidentialRightRecipients: body.additionalOfferResidentialRightRecipients as never,
        additionalOfferResidentialRightPerson: body.additionalOfferResidentialRightPerson,
        additionalOfferResidentialRightYears: body.additionalOfferResidentialRightYears,
        additionalOfferReason: body.additionalOfferReason,
        additionalOfferRentalModelDisclosureAccepted: body.additionalOfferRentalModelDisclosureAccepted,
        rentalOptionDeselected: body.rentalOptionDeselected,
        usableAreaSqm: body.usableAreaSqm,
        coOwnershipShares: body.coOwnershipShares,
        parkingAvailable: body.parkingAvailable,
        parkingType: body.parkingType as never,
        parkingCount: body.parkingCount,
        basementType: body.basementType as never,
        heatingType: body.heatingType,
        heatingEnergySource: body.heatingEnergySource,
        heatingEnergySourceOther: body.heatingEnergySourceOther,
        heatingYear: body.heatingYear,
        energyCarriersJson: toOptionalPrismaJson(body.energyCarriers),
        windowMaterial: body.windowMaterial,
        windowInstallationYear: body.windowInstallationYear,
        asbestosRoofKnown: body.asbestosRoofKnown,
        energyCertificateAvailable: body.energyCertificateAvailable,
        energyCertificateType: body.energyCertificateType,
        energyClass: body.energyClass,
        visualConditionRating: body.visualConditionRating as never,
        leaseholdOrMonument: body.leaseholdOrMonument || body.leasehold || body.monumentProtection,
        leasehold: body.leasehold,
        monumentProtection: body.monumentProtection,
        knownDefects: body.knownDefects,
        knownMajorMaintenanceOrSpecialAssessments: body.knownMajorMaintenanceOrSpecialAssessments,
        knownMajorMaintenanceOrSpecialAssessmentsDescription: body.knownMajorMaintenanceOrSpecialAssessments
          ? body.knownMajorMaintenanceOrSpecialAssessmentsDescription
          : undefined,
        moistureDamageStatus: body.moistureDamageStatus as never,
        moistureDamageDescription: body.moistureDamageStatus && body.moistureDamageStatus !== "NONE"
          ? body.moistureDamageDescription
          : undefined,
        accessibilityAssessment: body.accessibilityAssessment as never,
        hasElevator: body.propertyType === "apartment" ? body.hasElevator : undefined,
        remainingDebtKnown: body.remainingDebtKnown,
        remainingDebtAmount: body.remainingDebtAmount,
        modernizationJson: toOptionalPrismaJson(body.modernization),
        buildingConditionJson: toOptionalPrismaJson(body.buildingCondition),
        generalPropertyNotes: body.generalPropertyNotes,
        followUpRequired: false,
        offerCalculationSource: "application",
        notes: body.notes,
        status: "DRAFT"
      }
    });
    const coords = geocodePostalCode(property.postalCode, property.id);
    await prisma.property.update({
      where: { id: property.id },
      data: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        geocodingSource: coords.source
      }
    });
    await addDbActivity(property.id, user.id, "case_created", "Fall wurde angelegt.");
    return json({ property }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
