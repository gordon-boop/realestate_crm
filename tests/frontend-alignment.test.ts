import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { CaseIntakeDraftDto } from "../lib/frontend-dtos.ts";
import { frontendStatusConfig } from "../lib/frontend-dtos.ts";
import { hausVorteilDesignTokens } from "../lib/design/tokens.ts";
import { completeOpenReminders, createReminder, getCaseByPropertyId } from "../lib/store.ts";
import { chatMessageCreateSchema, documentCreateSchema, portfolioUpdateSchema, propertyCreateSchema } from "../lib/validation.ts";

test("frontend status config contains sold workflow state", () => {
  assert.equal(frontendStatusConfig.some((item) => item.status === "SOLD" && item.label === "Verkauft"), true);
});

test("crm uses centralized HausVorteil design tokens", () => {
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");
  const globals = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.equal(hausVorteilDesignTokens.color.primary, "#1B4385");
  assert.equal(hausVorteilDesignTokens.color.secondary, "#8BB21F");
  assert.match(prototype, /hausVorteilDesignTokens/);
  assert.match(prototype, /className="crm-app"/);
  assert.match(globals, /--hv-primary: #1b4385/);
  assert.match(globals, /--hv-secondary: #8bb21f/);
  assert.match(globals, /--hv-focus-ring/);
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
    knownMajorMaintenanceOrSpecialAssessments: false,
    moistureDamageStatus: "NONE",
    accessibilityAssessment: "PARTIALLY_RESTRICTED",
    remainingDebtKnown: true,
    remainingDebtAmount: 50000,
    modernization: { roof: { scope: "partial", year: "2020" } },
    caseSource: "INTERNAL",
    buildingCondition: { roof: { rating: "good", description: "keine sichtbaren Schäden" } },
    generalPropertyNotes: "Kunde wünscht ruhigen Ablauf.",
    leasehold: false,
    monumentProtection: true
  });

  assert.equal(parsed.propertyType, "semi_detached");
  assert.equal(parsed.caseSource, "INTERNAL");
  assert.equal(parsed.condition, "average");
  assert.equal(parsed.monumentProtection, true);
  assert.equal(parsed.parkingType, "garage");
  assert.equal(parsed.occupancyStatus, undefined);
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
    additionalOfferResidentialRightRecipients: "",
    knownMajorMaintenanceOrSpecialAssessments: false,
    moistureDamageStatus: "NONE",
    accessibilityAssessment: "LOW_BARRIER",
    hasElevator: true
  });

  assert.equal(parsed.desiredModel, "sale_and_leaseback");
  assert.equal(parsed.residentialRightRecipients, undefined);
  assert.equal(parsed.additionalOfferResidentialRightRecipients, undefined);
});

test("property validation only accepts energy classes A to H", () => {
  const parsed = propertyCreateSchema.parse({
    customerId: "customer_schmidt",
    propertyType: "single_family",
    street: "Hauptstraße 14",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 142,
    plotAreaSqm: 380,
    desiredModel: "fixed_residential_right",
    energyCertificateAvailable: true,
    energyCertificateType: "demand",
    energyClass: "H",
    knownMajorMaintenanceOrSpecialAssessments: false,
    moistureDamageStatus: "NONE",
    accessibilityAssessment: "LOW_BARRIER"
  });

  assert.equal(parsed.energyClass, "H");
  assert.throws(() => propertyCreateSchema.parse({
    customerId: "customer_schmidt",
    propertyType: "single_family",
    street: "Hauptstraße 14",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 142,
    plotAreaSqm: 380,
    desiredModel: "fixed_residential_right",
    energyClass: "A+",
    knownMajorMaintenanceOrSpecialAssessments: false,
    moistureDamageStatus: "NONE",
    accessibilityAssessment: "LOW_BARRIER"
  }), /Invalid enum value/);
});

test("frontend case form renders energy class dropdown and barrier-free label", () => {
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");
  const newCaseForm = readFileSync(new URL("../components/NewCaseForm.tsx", import.meta.url), "utf8");
  const germanCustomers = JSON.parse(readFileSync(new URL("../messages/de/customers.json", import.meta.url), "utf8"));

  assert.match(prototype, /<Field label=\{t\('property\.energyClass'\)\} required/);
  assert.match(prototype, /'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'/);
  assert.doesNotMatch(prototype, /A\+/);
  assert.match(newCaseForm, /<select name="energyClass" required>/);
  assert.doesNotMatch(newCaseForm, /<input name="energyClass"/);
  assert.equal(germanCustomers.intake.modernisations.barrierFree, "Barrierefrei");
  assert.doesNotMatch(prototype, /Barrierearm/);
});

test("offer tabs use the selected intake model instead of product selection cards", () => {
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");
  const calculateRoute = readFileSync(new URL("../app/api/properties/[id]/offer/calculate/route.ts", import.meta.url), "utf8");

  assert.match(prototype, /Gewähltes Modell/);
  assert.match(prototype, /Aus Kundenerfassung übernommen/);
  assert.match(prototype, /Bitte wählen Sie zunächst ein Modell in der Kundenerfassung aus/);
  assert.doesNotMatch(prototype, /renderResidentialRightProductCards/);
  assert.doesNotMatch(prototype, /Wohnrecht-Produkte/);
  assert.doesNotMatch(prototype, /Vergleich Wohnrecht-Produkte/);
  assert.match(calculateRoute, /Die Angebotsberechnung verwendet das in der Kundenerfassung gewählte Modell/);
});

test("offer result boxes use clear investment labels", () => {
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");

  assert.match(prototype, /Wert des Wohnrechts/);
  assert.match(prototype, /Instandhaltungsrücklage/);
  assert.match(prototype, /Auszahlung an den Kunden/);
  assert.match(prototype, /Maximaler Auszahlungsbetrag/);
  assert.match(prototype, /Ankaufs-IRR/);
  assert.match(prototype, /Gesamtankaufskosten/);
  assert.doesNotMatch(prototype, /Interner Wohnrechtswert/);
  assert.doesNotMatch(prototype, /Gewichteter IRR/);
  assert.doesNotMatch(prototype, /Ziel-IRR/);
  assert.doesNotMatch(prototype, /Total Investor Commitment/);
  assert.doesNotMatch(prototype, /Gesamte Investorenauszahlung/);
  assert.doesNotMatch(prototype, /Instandhaltungsreserve/);
});

test("property validation accepts lifelong residential right as existing usage model variant", () => {
  const parsed = propertyCreateSchema.parse({
    customerId: "customer_schmidt",
    propertyType: "single_family",
    street: "HauptstraÃŸe 14",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 142,
    plotAreaSqm: 380,
    condition: "average",
    desiredModel: "fixed_residential_right",
    usageModel: "lifelong_residential_right",
    residentialRightRecipients: "one_person",
    knownMajorMaintenanceOrSpecialAssessments: false,
    moistureDamageStatus: "NONE",
    accessibilityAssessment: "LOW_BARRIER"
  });

  assert.equal(parsed.desiredModel, "fixed_residential_right");
  assert.equal(parsed.usageModel, "lifelong_residential_right");
});

test("property validation requires explicit desired model", () => {
  assert.throws(() => propertyCreateSchema.parse({
    customerId: "customer_schmidt",
    propertyType: "apartment",
    street: "Hauptstraße 14",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 78,
    plotAreaSqm: 0,
    condition: "average",
    desiredModel: "",
    knownMajorMaintenanceOrSpecialAssessments: false,
    moistureDamageStatus: "NONE",
    accessibilityAssessment: "LOW_BARRIER",
    hasElevator: true
  }), /Bitte wählen Sie ein Wunschmodell aus/);
});

test("property validation requires modernization year when modernization is selected", () => {
  assert.throws(() => propertyCreateSchema.parse({
    customerId: "customer_schmidt",
    propertyType: "single_family",
    street: "Hauptstraße 14",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 142,
    plotAreaSqm: 380,
    condition: "average",
    desiredModel: "fixed_residential_right",
    modernization: { roof: { scope: "partial" } }
  }), /Jahr ist erforderlich/);
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
      knownMajorMaintenanceOrSpecialAssessments: false,
      moistureDamageStatus: "NONE",
      accessibilityAssessment: "PARTIALLY_RESTRICTED",
      remainingDebtKnown: false,
      modernization: { roof: { scope: "partial", year: "2020" } },
      buildingCondition: { roof: { rating: "good", description: "keine sichtbaren Schäden" } },
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

test("portfolio file validation stores contract, rent and maintenance data", () => {
  const parsed = portfolioUpdateSchema.parse({
    purchaseContractNumber: "KV-2026-008",
    purchaseContractSignedAt: "2026-05-14",
    purchasePrice: "425000",
    payoutPaidAt: "2026-05-17",
    monthlyRent: "1650",
    rentStartAt: "2026-06-01",
    maintenancePlan: { nextReviewDate: "2026-11-15", responsible: "Asset Management" },
    portfolioTasks: { nextAppointmentDate: "2026-11-15", nextAppointmentType: "Objektprüfung" },
    portfolioNotes: "Bestandsübernahme dokumentiert."
  });

  assert.equal(parsed.purchasePrice, 425000);
  assert.equal(parsed.monthlyRent, 1650);
  assert.equal(parsed.maintenancePlan?.responsible, "Asset Management");
});
