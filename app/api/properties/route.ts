import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { Property, PropertyCondition, PropertyType, DesiredModel } from "@/lib/domain";
import { makeId, nowIso } from "@/lib/id";
import { addActivity, getCases, store } from "@/lib/store";
import { propertyCreateSchema } from "@/lib/validation";

export function GET(): Response {
  try {
    const user = requireRole("admin", "partner");
    const cases = getCases().filter((item) => canSeeProperty(user, item.property));
    return json({ cases });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = propertyCreateSchema.parse(await request.json());
    const now = nowIso();
    const customer = store.customers.find((item) => item.id === String(body.customerId ?? ""));
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");

    const property: Property = {
      id: makeId("pro"),
      caseNumber: body.caseNumber,
      objectTitle: body.objectTitle,
      customerId: customer.id,
      partnerId: customer.partnerId,
      propertyType: body.propertyType as PropertyType,
      street: body.street,
      postalCode: body.postalCode,
      city: body.city,
      livingAreaSqm: body.livingAreaSqm,
      plotAreaSqm: body.plotAreaSqm,
      yearBuilt: body.yearBuilt,
      condition: body.condition as PropertyCondition,
      occupancyStatus: body.occupancyStatus,
      desiredModel: body.desiredModel as DesiredModel,
      preferredValuationProvider: body.preferredValuationProvider,
      residentialRightRecipients: body.residentialRightRecipients,
      desiredResidentialRightYears: body.desiredResidentialRightYears,
      secondResidentialRightWanted: body.secondResidentialRightWanted,
      secondResidentialRightYears: body.secondResidentialRightYears,
      fixedTermReason: body.fixedTermReason,
      modelReason: body.modelReason,
      rentalModelDisclosureAccepted: body.rentalModelDisclosureAccepted,
      additionalOfferRequested: body.additionalOfferRequested,
      additionalOfferModel: body.additionalOfferModel as DesiredModel | undefined,
      additionalOfferResidentialRightYears: body.additionalOfferResidentialRightYears,
      additionalOfferReason: body.additionalOfferReason,
      rentalOptionDeselected: body.rentalOptionDeselected,
      usableAreaSqm: body.usableAreaSqm,
      coOwnershipShares: body.coOwnershipShares,
      parkingAvailable: body.parkingAvailable,
      parkingType: body.parkingType,
      parkingCount: body.parkingCount,
      basementType: body.basementType,
      heatingType: body.heatingType,
      heatingEnergySource: body.heatingEnergySource,
      heatingEnergySourceOther: body.heatingEnergySourceOther,
      heatingYear: body.heatingYear,
      energyCarriers: body.energyCarriers,
      windowMaterial: body.windowMaterial,
      windowInstallationYear: body.windowInstallationYear,
      asbestosRoofKnown: body.asbestosRoofKnown,
      energyCertificateAvailable: body.energyCertificateAvailable,
      energyCertificateType: body.energyCertificateType,
      energyClass: body.energyClass,
      visualConditionRating: body.visualConditionRating,
      leaseholdOrMonument: body.leaseholdOrMonument || body.leasehold || body.monumentProtection,
      leasehold: body.leasehold,
      monumentProtection: body.monumentProtection,
      knownDefects: body.knownDefects,
      remainingDebtKnown: body.remainingDebtKnown,
      remainingDebtAmount: body.remainingDebtAmount,
      modernization: body.modernization,
      buildingCondition: body.buildingCondition as Property["buildingCondition"],
      generalPropertyNotes: body.generalPropertyNotes,
      followUpRequired: false,
      offerCalculationSource: "application",
      notes: body.notes,
      status: "DRAFT",
      createdAt: now,
      updatedAt: now
    };
    store.properties.push(property);
    addActivity(property.id, user.id, "case_created", "Fall wurde angelegt.");
    return json({ property }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
