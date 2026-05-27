import { z } from "zod";

const emptyToUndefined = (value: unknown) => value === "" || value === null ? undefined : value;
const optionalString = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());
const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().finite().optional());
const optionalBoolean = z.preprocess((value) => value === "on" ? true : value === "yes" ? true : value === "no" ? false : value, z.boolean().optional());
const optionalEnum = <T extends [string, ...string[]]>(values: T) => z.preprocess(emptyToUndefined, z.enum(values).optional());

export const customerCreateSchema = z.object({
  partnerId: optionalString,
  assignedAdvisorUserId: optionalString,
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

const propertyBaseSchema = z.object({
  customerId: z.string().trim().min(1, "Kunde ist erforderlich"),
  caseNumber: optionalString,
  objectTitle: optionalString,
  caseSource: z.enum(["PARTNER", "INTERNAL"]).default("PARTNER"),
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

function requireModernizationYears(
  value: { modernization?: Record<string, unknown> },
  ctx: z.RefinementCtx
) {
  if (!value.modernization) return;
  for (const [key, raw] of Object.entries(value.modernization)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { scope?: unknown; year?: unknown };
    const scope = typeof item.scope === "string" ? item.scope : undefined;
    const year = item.year === undefined || item.year === null ? "" : String(item.year).trim();
    if (scope && scope !== "none" && !year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modernization", key, "year"],
        message: "Jahr ist erforderlich, wenn eine Modernisierung ausgewählt wurde"
      });
    }
  }
}

export const propertyCreateSchema = propertyBaseSchema.superRefine(requireModernizationYears);
export const propertyUpdateSchema = propertyBaseSchema.partial().superRefine(requireModernizationYears);

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
  scanStatus: z.enum(["pending", "clean", "suspicious", "failed"]).default("pending"),
  scanNote: optionalString,
  missingReason: optionalString
});

export const documentReviewSchema = z.object({
  status: z.enum(["pending", "ok", "missing", "review_required", "rejected"]).optional(),
  requirementLevel: z.enum(["required", "optional", "recommended"]).optional(),
  missingReason: optionalString,
  scanStatus: z.enum(["pending", "clean", "suspicious", "failed"]).optional(),
  scanNote: optionalString
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
  entityType: z.enum(["property", "customer", "document", "valuation", "offer", "reminder", "lead", "chat"]).optional(),
  entityId: optionalString,
  metadata: z.record(z.unknown()).optional()
});

export const chatMessageCreateSchema = z.object({
  message: z.string().trim().min(1, "Nachricht ist erforderlich").max(4000, "Nachricht ist zu lang"),
  visibility: z.enum(["shared", "internal"]).default("shared"),
  attachments: z.array(z.object({
    fileName: z.string().trim().min(1),
    fileType: z.string().trim().min(1).default("application/octet-stream"),
    storageUrl: z.string().trim().min(1)
  })).max(5).optional()
});

export const notificationReadSchema = z.object({
  notificationId: optionalString,
  notificationIds: z.array(z.string().trim().min(1)).optional(),
  propertyId: optionalString,
  kind: z.enum(["all", "chat", "process"]).default("all")
});

export const leadCreateSchema = z.object({
  source: z.enum(["homepage", "admin", "internal", "partner", "other"]).default("homepage"),
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
  partnerId: optionalString,
  advisorUserId: optionalString
}).refine((value) => Boolean(value.partnerId || value.advisorUserId), {
  message: "Partner oder Kundenberater ist erforderlich"
});

export const leadStatusSchema = z.object({
  status: z.enum(["NEW", "QUALIFIED", "ASSIGNED", "CONTACTED", "CONVERTED", "REJECTED"])
});

export const staffCreateSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich"),
  email: z.string().trim().email("E-Mail ist ungültig").toLowerCase(),
  password: z.string().trim().min(6, "Passwort muss mindestens 6 Zeichen haben").default("demo1234"),
  internalRole: z.enum(["employee", "advisor", "admin", "super_admin"]).default("employee")
});

export const staffUpdateSchema = z.object({
  name: optionalString,
  email: z.string().trim().email("E-Mail ist ungültig").toLowerCase().optional(),
  password: optionalString,
  internalRole: z.enum(["employee", "advisor", "admin", "super_admin"]).optional()
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
  indicativeOfferSentAt: optionalString,
  offerAcceptedAt: optionalString,
  expertOpinionOrderedAt: optionalString,
  expertOpinionReceivedAt: optionalString,
  expertOpinionCompany: optionalString,
  bindingOfferSentAt: optionalString,
  bindingOfferAcceptedAt: optionalString,
  notaryAppointmentAt: optionalString,
  notaryOffice: optionalString
});

export const acquisitionWorkflowResetSchema = z.object({
  targetStatus: z.enum([
    "SUBMITTED",
    "INDICATIVE_OFFER_SENT",
    "OFFER_ACCEPTED",
    "EXPERT_OPINION_ORDERED",
    "EXPERT_OPINION_RECEIVED",
    "BINDING_OFFER_SENT",
    "BINDING_OFFER_ACCEPTED",
    "NOTARY_APPOINTMENT"
  ]),
  reason: z.string().trim().min(1, "Grund der Rücksetzung ist erforderlich"),
  note: optionalString
});

export const propertyRejectSchema = z.object({
  reasonCode: z.enum(["location", "condition", "age", "documents", "valuation", "legal", "occupancy", "other"]),
  reasonLabel: optionalString,
  note: z.string().trim().min(8, "Hinweis an den Makler ist erforderlich")
});

export const portfolioUpdateSchema = z.object({
  purchaseContractNumber: optionalString,
  purchaseContractSignedAt: optionalString,
  portfolioEnteredAt: optionalString,
  purchasePrice: optionalNumber,
  payoutPaidAt: optionalString,
  ownershipTransferAt: optionalString,
  landRegisterEntryAt: optionalString,
  monthlyRent: optionalNumber,
  rentStartAt: optionalString,
  rentDeposit: optionalNumber,
  residentialRightStartAt: optionalString,
  residentialRightEndAt: optionalString,
  residentialRightNotes: optionalString,
  notaryAppointmentRequestedAt: optionalString,
  purchaseContractDraftReceivedAt: optionalString,
  purchaseContractDraftReviewedAt: optionalString,
  priorityNoticeRegisteredAt: optionalString,
  purchasePriceDueAt: optionalString,
  purchasePricePaidAt: optionalString,
  residentialRightRegisteredAt: optionalString,
  benefitsAndBurdensTransferAt: optionalString,
  buildingInsuranceClarified: z.boolean().optional(),
  propertyManagerInformed: z.boolean().optional(),
  serviceChargeInfoRequested: z.boolean().optional(),
  propertyTaxInfoAvailable: z.boolean().optional(),
  propertyFileComplete: z.boolean().optional(),
  residentStaysInProperty: z.boolean().optional(),
  residentName: optionalString,
  usageModel: z.enum(["fixed_residential_right", "lifelong_residential_right", "usufruct", "sale_and_leaseback", "other"]).optional(),
  usageRightStartsAt: optionalString,
  usageRightEndsAt: optionalString,
  monthlyUsageFee: optionalNumber,
  residentContactName: optionalString,
  residentEmergencyContact: optionalString,
  propertyManagerName: optionalString,
  buildingInsurance: optionalString,
  serviceChargeStatus: optionalString,
  repairReportingChannelClarified: z.boolean().optional(),
  conditionDocumentationAvailable: z.boolean().optional(),
  nextPortfolioReviewAt: optionalString,
  maintenancePlan: z.record(z.unknown()).optional(),
  portfolioTasks: z.record(z.unknown()).optional(),
  portfolioNotes: optionalString
});

export const propertyExitProcessUpdateSchema = z.object({
  usageRightEndedAt: optionalString,
  terminationReason: z.enum(["move_out", "resident_death", "fixed_term_expired", "waiver_agreement", "other"]).optional(),
  terminationProofAvailable: z.boolean().optional(),
  relativesOrEstateContact: optionalString,
  relativesContactedAt: optionalString,
  propertyAccessClarified: z.boolean().optional(),
  keyHandoverPlannedAt: optionalString,
  keysReceivedAt: optionalString,
  inspectionPlannedAt: optionalString,
  inspectionCompletedAt: optionalString,
  postMoveOutConditionReportAvailable: z.boolean().optional(),
  clearanceRequired: z.boolean().optional(),
  clearanceOrderedAt: optionalString,
  clearanceCompletedAt: optionalString,
  safetyInspectionCompleted: z.boolean().optional(),
  insuranceCoverageChecked: z.boolean().optional(),
  repairNeedCaptured: z.boolean().optional(),
  salesPreparationStartedAt: optionalString,
  brokerMandatedAt: optionalString,
  marketingStartedAt: optionalString,
  salePriceIndication: optionalNumber,
  salePriceFinal: optionalNumber,
  salesStatus: z.enum(["under_review", "access_pending", "inspection_scheduled", "clearance_pending", "repairs_pending", "sales_preparation", "marketing", "sold", "completed"]).optional(),
  saleNotarizedAt: optionalString,
  salePriceReceivedAt: optionalString,
  exitCompletedAt: optionalString,
  internalNote: optionalString,
  responsibleUserId: optionalString,
  followUpAt: optionalString
});
