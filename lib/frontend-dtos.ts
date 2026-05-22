import type {
  ActivitySource,
  BasementType,
  DocumentCategory,
  DocumentRequirementLevel,
  DocumentStatus,
  Gender,
  IncomeRange,
  MaritalStatus,
  ParkingType,
  PropertyOwnership,
  PropertyCondition,
  PropertyStatus,
  PropertyType,
  RatingSix,
  ReminderStatus,
  ResidentialRightRecipients
} from "./domain.ts";

export type FrontendStatusConfigDto = {
  status: PropertyStatus;
  label: string;
  color: string;
};

export type FrontendCaseListItemDto = {
  id: string;
  caseNumber: string;
  customerName: string;
  customerAge?: number;
  objectTitle: string;
  address: string;
  livingAreaSqm: number;
  plotAreaSqm?: number;
  status: PropertyStatus;
  lastActivityLabel?: string;
  followUpOpen: boolean;
  followUpReason?: string;
};

export type FrontendDocumentDto = {
  id: string;
  propertyId: string;
  name: string;
  category: DocumentCategory;
  requirementLevel: DocumentRequirementLevel;
  status: DocumentStatus;
  uploadedAt?: string;
  missingReason?: string;
};

export type FrontendReminderDto = {
  id: string;
  propertyId: string;
  reason: string;
  status: ReminderStatus;
  dueAt: string;
  lastReminderAt?: string;
};

export type FrontendActivityDto = {
  id: string;
  propertyId: string;
  time: string;
  actor: string;
  text: string;
  source: ActivitySource;
  version: number;
};

export type CaseIntakeStep = "customer" | "model" | "property" | "modernization" | "documents";

export type CaseIntakeDraftDto = {
  currentStep: CaseIntakeStep;
  customer: {
    title?: string;
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    dateOfBirth?: string;
    ageAtSubmission?: number;
    maritalStatus?: MaritalStatus;
    spouseTitle?: string;
    spouseFirstName?: string;
    spouseLastName?: string;
    spouseGender?: Gender;
    spouseDateOfBirth?: string;
    propertyOwnership?: PropertyOwnership;
    street?: string;
    postalCode?: string;
    city?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    monthlyIncomeRange?: IncomeRange;
    consentDataProcessing?: boolean;
  };
  model: {
    residentialRightRecipients?: ResidentialRightRecipients;
    desiredResidentialRightYears?: number;
    secondResidentialRightWanted?: boolean;
    secondResidentialRightYears?: number;
    fixedTermReason?: string;
    modelReason?: string;
    rentalModelDisclosureAccepted?: boolean;
    additionalOfferRequested?: boolean;
    additionalOfferModel?: "fixed_residential_right" | "sale_and_leaseback" | "other";
    additionalOfferResidentialRightYears?: number;
    additionalOfferReason?: string;
    rentalOptionDeselected?: boolean;
  };
  property: {
    propertyType?: PropertyType;
    condition?: PropertyCondition;
    objectTitle?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    occupancyStatus?: string;
    livingAreaSqm?: number;
    plotAreaSqm?: number;
    usableAreaSqm?: number;
    coOwnershipShares?: string;
    yearBuilt?: number;
    heatingType?: string;
    heatingEnergySource?: string;
    heatingEnergySourceOther?: string;
    heatingYear?: number;
    energyCertificateAvailable?: boolean;
    energyCertificateType?: string;
    energyClass?: string;
    parkingAvailable?: boolean;
    parkingType?: ParkingType;
    parkingCount?: number;
    basementType?: BasementType;
    windowMaterial?: string;
    windowInstallationYear?: number;
    asbestosRoofKnown?: boolean;
    visualConditionRating?: RatingSix;
    energyCarriers?: string[];
    knownDefects?: string;
    remainingDebtKnown?: boolean;
    remainingDebtAmount?: number;
    modernization?: Record<string, unknown>;
    buildingCondition?: Record<string, unknown>;
    leasehold?: boolean;
    monumentProtection?: boolean;
    generalPropertyNotes?: string;
  };
  document?: {
    fileName?: string;
    category?: DocumentCategory;
    requirementLevel?: DocumentRequirementLevel;
    status?: DocumentStatus;
    missingReason?: string;
  };
};

export const frontendStatusConfig: FrontendStatusConfigDto[] = [
  { status: "DRAFT", label: "Entwurf", color: "#7A6B5C" },
  { status: "SUBMITTED", label: "Eingereicht", color: "#5C1077" },
  { status: "DATA_INCOMPLETE", label: "Daten unvollständig", color: "#FFAC00" },
  { status: "VALUATION_PENDING", label: "Bewertung läuft", color: "#7B61C7" },
  { status: "VALUATED", label: "Bewertung fertig", color: "#7B61C7" },
  { status: "OFFER_CALCULATED", label: "Angebot berechnet", color: "#5B8C2B" },
  { status: "OFFER_DRAFTED", label: "Angebotsentwurf", color: "#5B8C2B" },
  { status: "INTERNAL_REVIEW", label: "Interne Prüfung", color: "#A8A443" },
  { status: "APPROVED", label: "Freigegeben", color: "#5B8C2B" },
  { status: "SENT", label: "Versendet", color: "#5B8C2B" },
  { status: "OFFER_ACCEPTED", label: "Angebot angenommen", color: "#5B8C2B" },
  { status: "PURCHASE_STARTED", label: "Ankauf gestartet", color: "#5C1077" },
  { status: "NOTARY_APPOINTMENT", label: "Notartermin", color: "#A8A443" },
  { status: "PURCHASED", label: "Angekauft", color: "#3D6B1F" },
  { status: "IN_PORTFOLIO", label: "Im Bestand", color: "#3D6B1F" },
  { status: "APPOINTMENT_SCHEDULED", label: "Termin vereinbart", color: "#5B8C2B" },
  { status: "WON", label: "Gewonnen", color: "#3D6B1F" },
  { status: "SOLD", label: "Verkauft", color: "#3D6B1F" },
  { status: "REJECTED", label: "Abgelehnt", color: "#9B2C2C" },
  { status: "LOST", label: "Verloren", color: "#9B2C2C" }
];
