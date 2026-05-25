import assert from "node:assert/strict";
import test from "node:test";
import type { CaseIntakeDraftDto } from "../lib/frontend-dtos.ts";
import { frontendStatusConfig } from "../lib/frontend-dtos.ts";
import { completeOpenReminders, createReminder, getCaseByPropertyId } from "../lib/store.ts";
import { chatMessageCreateSchema, documentCreateSchema, propertyCreateSchema } from "../lib/validation.ts";

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
    plotAreaSqm: 380,
    condition: "good",
    desiredModel: "fixed_residential_right",
    residentialRightRecipients: "one_person",
    desiredResidentialRightYears: 10,
    secondResidentialRightWanted: true,
    secondResidentialRightYears: 5,
    fixedTermReason: "Familienplanung",
    modelReason: "Kunde plant in 10 Jahren einen Umzug.",
    rentalModelDisclosureAccepted: true,
    additionalOfferRequested: true,
    additionalOfferModel: "sale_and_leaseback",
    additionalOfferReason: "Vergleich für den Kunden",
    rentalOptionDeselected: false,
    occupancyStatus: "owner_occupied",
    usableAreaSqm: 55,
    coOwnershipShares: "124/1000",
    heatingType: "Gas-Brennwert",
    heatingEnergySource: "gas",
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
    remainingDebtKnown: true,
    remainingDebtAmount: 50000,
    modernization: { roof: { scope: "partial", year: "2020" } },
    buildingCondition: { roof: "good" },
    generalPropertyNotes: "Kunde wünscht ruhigen Ablauf.",
    leasehold: false,
    monumentProtection: true
  });

  assert.equal(parsed.propertyType, "semi_detached");
  assert.equal(parsed.monumentProtection, true);
  assert.equal(parsed.parkingType, "garage");
  assert.equal(parsed.occupancyStatus, "owner_occupied");
  assert.deepEqual(parsed.energyCarriers, ["photovoltaik"]);
  assert.equal(parsed.additionalOfferRequested, true);
  assert.equal(parsed.heatingEnergySource, "gas");
  assert.equal(parsed.remainingDebtKnown, true);
});

test("property validation treats empty optional offer enums as absent", () => {
  const parsed = propertyCreateSchema.parse({
    customerId: "customer_schmidt",
    propertyType: "apartment",
    street: "Hauptstraße 14",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 78,
    plotAreaSqm: 0,
    condition: "average",
    desiredModel: "sale_and_leaseback",
    residentialRightRecipients: "",
    additionalOfferResidentialRightRecipients: ""
  });

  assert.equal(parsed.desiredModel, "sale_and_leaseback");
  assert.equal(parsed.residentialRightRecipients, undefined);
  assert.equal(parsed.additionalOfferResidentialRightRecipients, undefined);
});

test("case intake dto covers modernization, document status and technical property fields", () => {
  const draft: CaseIntakeDraftDto = {
    currentStep: "documents",
    customer: {
      firstName: "Eva",
      lastName: "Schmidt",
      gender: "female",
      maritalStatus: "married",
      spouseFirstName: "Hans",
      spouseLastName: "Schmidt",
      spouseGender: "male",
      propertyOwnership: "both",
      postalCode: "70563",
      consentDataProcessing: true
    },
    model: {
      residentialRightRecipients: "one_person",
      desiredResidentialRightYears: 10,
      modelReason: "Befristung passt zur Umzugsplanung",
      additionalOfferRequested: true,
      additionalOfferModel: "sale_and_leaseback"
    },
    property: {
      propertyType: "single_family",
      condition: "good",
      street: "Hauptstraße 14",
      postalCode: "70563",
      city: "Stuttgart",
      occupancyStatus: "owner_occupied",
      heatingType: "Gas-Brennwert",
      heatingEnergySource: "gas",
      basementType: "full",
      parkingType: "garage",
      energyCarriers: ["photovoltaik"],
      remainingDebtKnown: false,
      modernization: { roof: { scope: "partial", year: "2020" } },
      buildingCondition: { roof: "good" },
      generalPropertyNotes: "Allgemeiner Hinweis"
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
    scanStatus: "pending",
    missingReason: "fehlt noch"
  });

  assert.equal(parsed.status, "missing");
  assert.equal(parsed.requirementLevel, "required");
  assert.equal(parsed.scanStatus, "pending");
});

test("chat messages are case linked and validated", () => {
  const parsed = chatMessageCreateSchema.parse({
    message: "Bitte Gutachtertermin mit dem Kunden abstimmen.",
    visibility: "shared"
  });
  const caseView = getCaseByPropertyId("property_berlin_1");

  assert.equal(parsed.message, "Bitte Gutachtertermin mit dem Kunden abstimmen.");
  assert.equal(parsed.visibility, "shared");
  assert.equal(caseView?.chatMessages.every((message) => message.propertyId === "property_berlin_1"), true);
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
