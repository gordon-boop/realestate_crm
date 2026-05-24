import { z } from "zod";

const emptyToUndefined = (value: unknown) => value === "" || value === null ? undefined : value;
const optionalString = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());
const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().finite().optional());
const optionalBoolean = z.preprocess((value) => value === "on" ? true : value === "yes" ? true : value === "no" ? false : value, z.boolean().optional());
const optionalEnum = <T extends [string, ...string[]]>(values: T) => z.preprocess(emptyToUndefined, z.enum(values).optional());

export const customerCreateSchema = z.object({
  partnerId: optionalString,
  displayName: optionalString,
  title: optionalString,
  firstName: z.string().trim().min(1, "Vorname ist erforderlich"),
  lastName: z.string().trim().min(1, "Nachname ist erforderlich"),
  ageAtSubmission: optionalNumber,
  gender: z.enum(["male", "female", "diverse", "not_specified"]).optional(),
  email: optionalString,
  phone: optionalString,
  mobile: optionalString,
  dateOfBirth: optionalString,
  maritalStatus: z.enum(["single", "married", "divorced", "widowed", "other"]).optional(),
  spouseTitle: optionalString,
  spouseFirstName: optionalString,
  spouseLastName: optionalString,
  spouseGender: z.enum(["male", "female", "diverse", "not_specified"]).optional(),
  spouseDateOfBirth: optionalString,
  propertyOwnership: z.enum(["customer_1", "customer_2", "both"]).optional(),
  monthlyIncomeRange: z.enum(["under_1000", "from_1000_to_2000", "from_2000_to_3000", "over_3000"]).optional(),
  street: optionalString,
  postalCode: optionalString,
  city: optionalString,
  addressText: optionalString,
  consentDataProcessing: z.coerce.boolean()
});

export const propertyCreateSchema = z.object({
  customerId: z.string().trim().min(1, "Kunde ist erforderlich"),
  caseNumber: optionalString,
  objectTitle: optionalString,
  propertyType: z.enum(["house", "single_family", "semi_detached", "row_house", "apartment"]).default("house"),
  street: z.string().trim().min(1, "Straße ist erforderlich"),
  postalCode: z.string().trim().min(1, "PLZ ist erforderlich"),
  city: z.string().trim().min(1, "Ort ist erforderlich"),
  livingAreaSqm: z.coerce.number().positive("Wohnfläche ist erforderlich"),
  plotAreaSqm: z.coerce.number().nonnegative("Grundstück ist erforderlich"),
  yearBuilt: optionalNumber,
  condition: z.enum(["very_good", "good", "average", "renovation_needed"]).default("average"),
  occupancyStatus: optionalString,
  desiredModel: z.enum(["fixed_residential_right", "sale_and_leaseback", "other"]).default("fixed_residential_right"),
  preferredValuationProvider: z.enum(["mock", "pricehubble", "sprengnetter", "other"]).default("sprengnetter"),
  residentialRightRecipients: optionalEnum(["one_person", "both"]),
  residentialRightPerson: optionalString,
  desiredResidentialRightYears: optionalNumber,
  secondResidentialRightWanted: optionalBoolean.default(false),
  secondResidentialRightYears: optionalNumber,
  fixedTermReason: optionalString,
  modelReason: optionalString,
  rentalModelDisclosureAccepted: optionalBoolean.default(false),
  additionalOfferRequested: optionalBoolean.default(false),
  additionalOfferModel: optionalEnum(["fixed_residential_right", "sale_and_leaseback", "other"]),
  additionalOfferResidentialRightRecipients: optionalEnum(["one_person", "both"]),
  additionalOfferResidentialRightPerson: optionalString,
  additionalOfferResidentialRightYears: optionalNumber,
  additionalOfferReason: optionalString,
  additionalOfferRentalModelDisclosureAccepted: optionalBoolean.default(false),
  rentalOptionDeselected: optionalBoolean.default(false),
  usableAreaSqm: optionalNumber,
  coOwnershipShares: optionalString,
  parkingAvailable: optionalBoolean,
  parkingType: z.enum(["garage", "carport", "outdoor_space", "duplex"]).optional(),
  parkingCount: optionalNumber,
  basementType: z.enum(["none", "partial", "full"]).optional(),
  heatingType: optionalString,
  heatingEnergySource: optionalString,
  heatingEnergySourceOther: optionalString,
  heatingYear: optionalNumber,
  energyCarriers: z.array(z.string()).optional(),
  windowMaterial: optionalString,
  windowInstallationYear: optionalNumber,
  asbestosRoofKnown: optionalBoolean,
  energyCertificateAvailable: optionalBoolean,
  energyCertificateType: optionalString,
  energyClass: optionalString,
  visualConditionRating: z.enum(["very_bad", "bad", "moderate", "medium", "good", "very_good"]).optional(),
  leaseholdOrMonument: optionalBoolean.default(false),
  leasehold: optionalBoolean.default(false),
  monumentProtection: optionalBoolean.default(false),
  knownDefects: optionalString,
  remainingDebtKnown: optionalBoolean.default(false),
  remainingDebtAmount: optionalNumber,
  modernization: z.record(z.unknown()).optional(),
  buildingCondition: z.record(z.unknown()).optional(),
  generalPropertyNotes: optionalString,
  notes: optionalString
});

export const documentCreateSchema = z.object({
  fileName: z.string().trim().min(1).default("upload-placeholder.pdf"),
  displayName: optionalString,
  fileType: z.string().trim().min(1).default("application/pdf"),
  storageUrl: optionalString,
  category: z.enum([
    "photos",
    "land_register",
    "floorplan",
    "section",
    "living_area_calculation",
    "energy_certificate",
    "declaration_of_division",
    "service_charge_statement",
    "owners_meeting_minutes",
    "maintenance_reserve",
    "power_of_attorney",
    "repair_offer",
    "other"
  ]).default("other"),
  requirementLevel: z.enum(["required", "optional", "recommended"]).default("optional"),
  status: z.enum(["pending", "ok", "missing", "review_required", "rejected"]).default("pending"),
  missingReason: optionalString
});

export const reminderCreateSchema = z.object({
  reason: z.string().trim().min(1, "Rückfragegrund ist erforderlich"),
  dueAt: optionalString,
  assignedToUserId: optionalString
});

export const activityCreateSchema = z.object({
  propertyId: z.string().trim().min(1),
  type: z.string().trim().min(1).default("note"),
  message: z.string().trim().min(1),
  entityType: z.enum(["property", "customer", "document", "valuation", "offer", "reminder", "lead"]).optional(),
  entityId: optionalString,
  metadata: z.record(z.unknown()).optional()
});

export const leadCreateSchema = z.object({
  source: z.enum(["homepage", "admin", "partner", "other"]).default("homepage"),
  firstName: optionalString,
  lastName: optionalString,
  name: optionalString,
  email: optionalString,
  phone: optionalString,
  postalCode: optionalString,
  city: optionalString,
  propertyType: z.enum(["house", "single_family", "semi_detached", "row_house", "apartment"]).optional(),
  estimatedPropertyValueRange: optionalString,
  youngestOwnerAgeRange: optionalString,
  message: optionalString,
  productInterest: z.enum(["fixed_residential_right", "sale_and_leaseback", "other"]).optional()
});

export const leadAssignSchema = z.object({
  partnerId: z.string().trim().min(1, "Partner ist erforderlich")
});

export const leadStatusSchema = z.object({
  status: z.enum(["NEW", "QUALIFIED", "ASSIGNED", "CONTACTED", "CONVERTED", "REJECTED"])
});

export const acquisitionWorkflowSchema = z.object({
  action: z.enum([
    "indicative_offer_sent",
    "offer_accepted",
    "expert_opinion_ordered",
    "expert_opinion_received",
    "binding_offer_sent",
    "binding_offer_accepted",
    "notary_appointment_ordered",
    "contract_signed",
    "purchase_started",
    "notary_appointment",
    "purchased",
    "enter_portfolio"
  ]),
  expertOpinionOrderedAt: optionalString,
  expertOpinionReceivedAt: optionalString,
  expertOpinionCompany: optionalString,
  notaryAppointmentAt: optionalString
});

export const propertyRejectSchema = z.object({
  reasonCode: z.enum(["location", "condition", "age", "documents", "valuation", "legal", "occupancy", "other"]),
  reasonLabel: optionalString,
  note: optionalString
});
