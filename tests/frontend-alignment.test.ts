import assert from "node:assert/strict";
import test from "node:test";
import type { CaseIntakeDraftDto } from "../lib/frontend-dtos.ts";
import { frontendStatusConfig } from "../lib/frontend-dtos.ts";
import { completeOpenReminders, createReminder, getCaseByPropertyId } from "../lib/store.ts";
import { documentCreateSchema, propertyCreateSchema } from "../lib/validation.ts";

test("frontend status config contains sold workflow state", () => {
  assert.equal(frontendStatusConfig.some((item) => item.status === "SOLD" && item.label === "Verkauft"), true);
});

test("property validation accepts frontend property types and split exclusion flags", () => {
  const parsed = propertyCreateSchema.parse({
    customerId: "customer_schmidt",
    propertyType: "semi_detached",
    street: "Hauptstraße 14",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 142,
    condition: "good",
    desiredModel: "fixed_residential_right",
    residentialRightRecipients: "one_person",
    desiredResidentialRightYears: 10,
    secondResidentialRightWanted: true,
    secondResidentialRightYears: 5,
    fixedTermReason: "Familienplanung",
    rentalOptionDeselected: false,
    occupancyStatus: "owner_occupied",
    usableAreaSqm: 55,
    coOwnershipShares: "124/1000",
    heatingType: "Gas-Brennwert",
    heatingYear: 2015,
    energyCertificateAvailable: false,
    energyCertificateType: "demand",
    energyClass: "D",
    parkingAvailable: true,
    parkingType: "garage",
    parkingCount: 1,
    basementType: "full",
    windowMaterial: "plastic",
    windowInstallationYear: 2012,
    visualConditionRating: "good",
    energyCarriers: ["photovoltaik"],
    modernization: { roof: { scope: "partial", year: "2020" } },
    buildingCondition: { roof: "good" },
    leasehold: false,
    monumentProtection: true
  });

  assert.equal(parsed.propertyType, "semi_detached");
  assert.equal(parsed.monumentProtection, true);
  assert.equal(parsed.parkingType, "garage");
  assert.equal(parsed.occupancyStatus, "owner_occupied");
  assert.deepEqual(parsed.energyCarriers, ["photovoltaik"]);
});

test("case intake dto covers modernization, document status and technical property fields", () => {
  const draft: CaseIntakeDraftDto = {
    currentStep: "documents",
    customer: {
      firstName: "Eva",
      lastName: "Schmidt",
      gender: "female",
      postalCode: "70563",
      consentDataProcessing: true
    },
    model: {
      residentialRightRecipients: "one_person",
      desiredResidentialRightYears: 10,
      secondResidentialRightWanted: true,
      secondResidentialRightYears: 5
    },
    property: {
      propertyType: "single_family",
      condition: "good",
      street: "Hauptstraße 14",
      postalCode: "70563",
      city: "Stuttgart",
      occupancyStatus: "owner_occupied",
      heatingType: "Gas-Brennwert",
      basementType: "full",
      parkingType: "garage",
      energyCarriers: ["photovoltaik"],
      modernization: { roof: { scope: "partial", year: "2020" } },
      buildingCondition: { roof: "good" }
    },
    document: {
      fileName: "Energieausweis",
      category: "energy_certificate",
      requirementLevel: "required",
      status: "missing"
    }
  };

  assert.equal(draft.property.modernization?.roof instanceof Object, true);
  assert.equal(draft.document?.status, "missing");
});

test("document validation persists missing status and required level", () => {
  const parsed = documentCreateSchema.parse({
    fileName: "Energieausweis",
    category: "energy_certificate",
    requirementLevel: "required",
    status: "missing",
    missingReason: "fehlt noch"
  });

  assert.equal(parsed.status, "missing");
  assert.equal(parsed.requirementLevel, "required");
});

test("reminders are persisted and can be completed", () => {
  const reminder = createReminder({
    propertyId: "property_berlin_1",
    createdByUserId: "user_admin",
    assignedToUserId: "user_partner",
    reason: "Hausgeldabrechnung fehlt",
    dueAt: new Date().toISOString()
  });

  const caseView = getCaseByPropertyId("property_berlin_1");
  assert.equal(caseView?.reminders.some((item) => item.id === reminder.id), true);

  completeOpenReminders("property_berlin_1", "user_partner");
  assert.equal(reminder.status, "done");
});
