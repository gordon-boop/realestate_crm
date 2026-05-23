export type PartnerStatus = "active" | "inactive";
export type BrokerRegistrationStatus = "email_pending" | "pending_approval" | "approved" | "rejected";
export type UserRole = "admin" | "partner";
export type PropertyType = "house" | "single_family" | "semi_detached" | "row_house" | "apartment" | "multi_family" | "other";
export type PropertyCondition = "very_good" | "good" | "average" | "renovation_needed";
export type DesiredModel = "fixed_residential_right" | "sale_and_leaseback" | "other";
export type Gender = "male" | "female" | "diverse" | "not_specified";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "other";
export type IncomeRange = "under_1000" | "from_1000_to_2000" | "from_2000_to_3000" | "over_3000";
export type PropertyOwnership = "customer_1" | "customer_2" | "both";
export type ResidentialRightRecipients = "one_person" | "both";
export type RatingSix = "very_bad" | "bad" | "moderate" | "medium" | "good" | "very_good";
export type BasementType = "none" | "partial" | "full";
export type ParkingType = "garage" | "carport" | "outdoor_space" | "duplex";
export type ValuationProvider = "mock" | "pricehubble" | "sprengnetter" | "other";
export type ValuationStatus = "not_started" | "pending" | "completed" | "failed";
export type PropertyStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DATA_INCOMPLETE"
  | "VALUATION_PENDING"
  | "VALUATED"
  | "OFFER_CALCULATED"
  | "OFFER_DRAFTED"
  | "INTERNAL_REVIEW"
  | "APPROVED"
  | "SENT"
  | "INDICATIVE_OFFER_SENT"
  | "OFFER_ACCEPTED"
  | "PURCHASE_STARTED"
  | "NOTARY_APPOINTMENT"
  | "PURCHASED"
  | "IN_PORTFOLIO"
  | "APPOINTMENT_SCHEDULED"
  | "REJECTED"
  | "WON"
  | "SOLD"
  | "LOST";
export type DocumentCategory =
  | "photos"
  | "land_register"
  | "floorplan"
  | "section"
  | "living_area_calculation"
  | "energy_certificate"
  | "declaration_of_division"
  | "service_charge_statement"
  | "owners_meeting_minutes"
  | "maintenance_reserve"
  | "power_of_attorney"
  | "repair_offer"
  | "other";
export type DocumentStatus = "pending" | "ok" | "missing" | "review_required" | "rejected";
export type DocumentRequirementLevel = "required" | "optional" | "recommended";
export type OfferKind = "indicative" | "binding";
export type OfferStatus = "draft" | "review" | "approved" | "sent" | "rejected";
export type ReminderStatus = "open" | "done" | "overdue" | "cancelled";
export type LeadStatus = "NEW" | "QUALIFIED" | "ASSIGNED" | "CONTACTED" | "CONVERTED" | "REJECTED";
export type ActivitySource = "system" | "user" | "partner" | "admin";
export type ActivityEntityType = "property" | "customer" | "document" | "valuation" | "offer" | "reminder" | "lead";

export type Partner = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  status: PartnerStatus;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  partnerId?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type BrokerRegistration = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  status: BrokerRegistrationStatus;
  emailConfirmedAt?: string;
  partnerId?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  partnerId: string;
  displayName?: string;
  title?: string;
  firstName: string;
  lastName: string;
  ageAtSubmission?: number;
  gender?: Gender;
  email?: string;
  phone?: string;
  mobile?: string;
  dateOfBirth?: string;
  maritalStatus?: MaritalStatus;
  spouseTitle?: string;
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseGender?: Gender;
  spouseDateOfBirth?: string;
  propertyOwnership?: PropertyOwnership;
  monthlyIncomeRange?: IncomeRange;
  street?: string;
  postalCode?: string;
  city?: string;
  addressText?: string;
  consentDataProcessing: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Property = {
  id: string;
  caseNumber?: string;
  objectTitle?: string;
  customerId: string;
  partnerId: string;
  propertyType: PropertyType;
  street: string;
  postalCode: string;
  city: string;
  livingAreaSqm: number;
  plotAreaSqm?: number;
  yearBuilt?: number;
  condition: PropertyCondition;
  occupancyStatus?: string;
  desiredModel: DesiredModel;
  preferredValuationProvider?: ValuationProvider;
  residentialRightRecipients?: ResidentialRightRecipients;
  desiredResidentialRightYears?: number;
  secondResidentialRightWanted?: boolean;
  secondResidentialRightYears?: number;
  fixedTermReason?: string;
  modelReason?: string;
  rentalModelDisclosureAccepted?: boolean;
  additionalOfferRequested?: boolean;
  additionalOfferModel?: DesiredModel;
  additionalOfferResidentialRightYears?: number;
  additionalOfferReason?: string;
  rentalOptionDeselected?: boolean;
  usableAreaSqm?: number;
  coOwnershipShares?: string;
  parkingAvailable?: boolean;
  parkingType?: ParkingType;
  parkingCount?: number;
  basementType?: BasementType;
  heatingType?: string;
  heatingEnergySource?: string;
  heatingEnergySourceOther?: string;
  heatingYear?: number;
  energyCarriers?: string[];
  windowMaterial?: string;
  windowInstallationYear?: number;
  asbestosRoofKnown?: boolean;
  energyCertificateAvailable?: boolean;
  energyCertificateType?: string;
  energyClass?: string;
  visualConditionRating?: RatingSix;
  leaseholdOrMonument?: boolean;
  leasehold?: boolean;
  monumentProtection?: boolean;
  knownDefects?: string;
  remainingDebtKnown?: boolean;
  remainingDebtAmount?: number;
  modernization?: Record<string, unknown>;
  buildingCondition?: Record<string, RatingSix>;
  generalPropertyNotes?: string;
  followUpRequired?: boolean;
  followUpReason?: string;
  followUpDueAt?: string;
  customerFeedbackReceivedAt?: string;
  offerCalculationSource?: string;
  offerAcceptedAt?: string;
  purchaseStartedAt?: string;
  notaryAppointmentAt?: string;
  purchasedAt?: string;
  portfolioEnteredAt?: string;
  lastActivityLabel?: string;
  lastActivityAt?: string;
  notes?: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
};

export type Document = {
  id: string;
  propertyId: string;
  customerId?: string;
  uploadedByUserId: string;
  fileName: string;
  displayName?: string;
  fileType: string;
  storageUrl: string;
  category: DocumentCategory;
  requirementLevel: DocumentRequirementLevel;
  status: DocumentStatus;
  missingReason?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdAt: string;
};

export type Valuation = {
  id: string;
  propertyId: string;
  provider: ValuationProvider;
  status: ValuationStatus;
  sourceLabel?: string;
  marketValue: number;
  valueMin: number;
  valueMax: number;
  confidenceScore: number;
  rawResponseJson: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
};

export type OfferAssumptions = {
  conditionDiscountRate?: number;
  residentialRightRate?: number;
  riskDiscountRate?: number;
  companyMarginRate?: number;
  formula: string;
  note: string;
  productModel?: DesiredModel;
  sourceWorkbook?: string;
  sourceCells?: Record<string, string>;
  inputs?: Record<string, unknown>;
  components?: Record<string, number>;
};

export type Offer = {
  id: string;
  propertyId: string;
  valuationId: string;
  offerNumber: string;
  kind: OfferKind;
  currentVersion: number;
  marketValue: number;
  adjustedMarketValue: number;
  residentialRightValue: number;
  riskDiscount: number;
  companyMargin: number;
  payoutAmount: number;
  model: DesiredModel;
  residentialRightYears?: number;
  assumptions: OfferAssumptions;
  aiCustomerText?: string;
  aiPartnerSummary?: string;
  aiInternalRationale?: string;
  bindingOfferText?: string;
  validUntil?: string;
  status: OfferStatus;
  approvedByUserId?: string;
  approvedAt?: string;
  sentAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type OfferVersion = {
  id: string;
  offerId: string;
  version: number;
  snapshot: Offer;
  createdByUserId?: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  propertyId: string;
  userId: string;
  type: string;
  message: string;
  version: number;
  source: ActivitySource;
  entityType?: ActivityEntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
  previousActivityId?: string;
  createdAt: string;
};

export type ActivityVersion = {
  id: string;
  activityId: string;
  version: number;
  snapshot: Activity;
  createdByUserId?: string;
  createdAt: string;
};

export type Reminder = {
  id: string;
  propertyId: string;
  assignedToUserId?: string;
  createdByUserId: string;
  completedByUserId?: string;
  reason: string;
  status: ReminderStatus;
  dueAt: string;
  completedAt?: string;
  lastReminderAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  leadNumber: string;
  source: "homepage" | "admin" | "partner" | "other";
  status: LeadStatus;
  assignedPartnerId?: string;
  assignedByUserId?: string;
  assignedAt?: string;
  convertedCustomerId?: string;
  convertedPropertyId?: string;
  convertedAt?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  city?: string;
  propertyType?: PropertyType;
  estimatedPropertyValueRange?: string;
  youngestOwnerAgeRange?: string;
  message?: string;
  productInterest?: DesiredModel;
  createdAt: string;
  updatedAt: string;
};

export type CaseView = {
  partner: Partner;
  customer: Customer;
  property: Property;
  documents: Document[];
  valuation?: Valuation;
  offer?: Offer;
  offers: Offer[];
  activities: Activity[];
  reminders: Reminder[];
};
