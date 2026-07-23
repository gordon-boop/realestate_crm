export type PartnerStatus = "active" | "inactive";
export type BrokerRegistrationStatus = "email_pending" | "pending_approval" | "approved" | "rejected";
export type UserRole = "admin" | "partner";
export type InternalUserRole = "employee" | "advisor" | "admin" | "super_admin";
export type PropertyType = "house" | "single_family" | "semi_detached" | "row_house" | "apartment" | "multi_family" | "other";
export type PropertyCondition = "very_good" | "good" | "average" | "renovation_needed";
export type CaseSource = "PARTNER" | "INTERNAL";
export type DesiredModel = "fixed_residential_right" | "sale_and_leaseback" | "other";
export type UsageModel = "fixed_residential_right" | "lifelong_residential_right" | "usufruct" | "sale_and_leaseback" | "other";
export type ExitTerminationReason = "move_out" | "resident_death" | "fixed_term_expired" | "waiver_agreement" | "other";
export type ResidentStatus = "ACTIVE" | "MOVE_OUT_PLANNED" | "MOVED_OUT" | "DECEASED";
export type RatingSourceType = "questionnaire" | "api" | "analyst" | "document";
export type ObjectRatingStatus = "draft" | "analyst_review" | "approved";
export type ExitSalesStatus = "under_review" | "access_pending" | "inspection_scheduled" | "clearance_pending" | "repairs_pending" | "sales_preparation" | "marketing" | "sold" | "completed";
export type Gender = "male" | "female" | "diverse" | "not_specified";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "other";
export type IncomeRange = "under_1000" | "from_1000_to_2000" | "from_2000_to_3000" | "over_3000";
export type PropertyOwnership = "customer_1" | "customer_2" | "both";
export type ResidentialRightRecipients = "one_person" | "both";
export type RatingSix = "very_bad" | "bad" | "moderate" | "medium" | "good" | "very_good";
export type MoistureDamageStatus = "NONE" | "MINOR" | "SIGNIFICANT";
export type AccessibilityAssessment = "LOW_BARRIER" | "PARTIALLY_RESTRICTED" | "STRONGLY_RESTRICTED";
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
  | "EXPERT_OPINION_ORDERED"
  | "EXPERT_OPINION_RECEIVED"
  | "BINDING_OFFER_SENT"
  | "BINDING_OFFER_ACCEPTED"
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
export type DocumentScanStatus = "pending" | "clean" | "suspicious" | "failed";
export type OfferKind = "indicative" | "binding";
export type OfferStatus = "draft" | "review" | "approved" | "sent" | "rejected";
export type ReminderStatus = "open" | "done" | "overdue" | "cancelled";
export type LeadStatus =
  | "NEW"
  | "QUALIFIED"
  | "ASSIGNED"
  | "CONTACTED"
  | "CONVERTED"
  | "IN_REVIEW"
  | "ASSIGNED_TO_PARTNER"
  | "PARTNER_CONTACT_PENDING"
  | "CONVERTED_TO_CASE"
  | "CLOSED"
  | "REJECTED";
export type ActivitySource = "system" | "user" | "partner" | "admin";
export type ActivityEntityType = "property" | "customer" | "document" | "valuation" | "offer" | "reminder" | "lead" | "chat" | "rating" | "precheck";
export type ChatMessageVisibility = "shared" | "internal";

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
  internalRole?: InternalUserRole;
  deletedAt?: string;
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
  partnerId?: string;
  assignedAdvisorUserId?: string;
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
  houseNumber?: string;
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
  partnerId?: string;
  assignedAdvisorUserId?: string;
  caseSource: CaseSource;
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
  residentialRightPerson?: string;
  desiredResidentialRightYears?: number;
  secondResidentialRightWanted?: boolean;
  secondResidentialRightYears?: number;
  fixedTermReason?: string;
  modelReason?: string;
  rentalModelDisclosureAccepted?: boolean;
  additionalOfferRequested?: boolean;
  additionalOfferModel?: DesiredModel;
  additionalOfferResidentialRightRecipients?: ResidentialRightRecipients;
  additionalOfferResidentialRightPerson?: string;
  additionalOfferResidentialRightYears?: number;
  additionalOfferReason?: string;
  additionalOfferRentalModelDisclosureAccepted?: boolean;
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
  knownMajorMaintenanceOrSpecialAssessments?: boolean;
  knownMajorMaintenanceOrSpecialAssessmentsDescription?: string;
  moistureDamageStatus?: MoistureDamageStatus;
  moistureDamageDescription?: string;
  accessibilityAssessment?: AccessibilityAssessment;
  hasElevator?: boolean;
  remainingDebtKnown?: boolean;
  remainingDebtAmount?: number;
  modernization?: Record<string, unknown>;
  buildingCondition?: Record<string, unknown>;
  acquisitionPrecheck?: Record<string, unknown>;
  intakeDraft?: Record<string, unknown>;
  draftIntakeStep?: number;
  generalPropertyNotes?: string;
  followUpRequired?: boolean;
  followUpReason?: string;
  followUpDueAt?: string;
  customerFeedbackReceivedAt?: string;
  rejectionReasonCode?: string;
  rejectionReasonLabel?: string;
  rejectionNote?: string;
  rejectedAt?: string;
  rejectedByUserId?: string;
  indicativeOfferSentAt?: string;
  expertOpinionOrderedAt?: string;
  expertOpinionCompany?: string;
  expertOpinionReceivedAt?: string;
  bindingOfferSentAt?: string;
  bindingOfferAcceptedAt?: string;
  indicativeAcceptedOfferModel?: DesiredModel;
  indicativeAcceptedOfferId?: string;
  indicativeAcceptedOfferModelAt?: string;
  indicativeAcceptedOfferModelByUserId?: string;
  bindingAcceptedOfferModel?: DesiredModel;
  bindingAcceptedOfferId?: string;
  bindingAcceptedOfferModelAt?: string;
  bindingAcceptedOfferModelByUserId?: string;
  offerCalculationSource?: string;
  offerAcceptedAt?: string;
  purchaseStartedAt?: string;
  notaryAppointmentAt?: string;
  notaryOffice?: string;
  purchasedAt?: string;
  portfolioEnteredAt?: string;
  purchaseContractNumber?: string;
  purchaseContractSignedAt?: string;
  purchasePrice?: number;
  payoutPaidAt?: string;
  ownershipTransferAt?: string;
  landRegisterEntryAt?: string;
  monthlyRent?: number;
  rentStartAt?: string;
  rentDeposit?: number;
  residentialRightStartAt?: string;
  residentialRightEndAt?: string;
  residentialRightNotes?: string;
  notaryAppointmentRequestedAt?: string;
  purchaseContractDraftReceivedAt?: string;
  purchaseContractDraftReviewedAt?: string;
  priorityNoticeRegisteredAt?: string;
  purchasePriceDueAt?: string;
  purchasePricePaidAt?: string;
  residentialRightRegisteredAt?: string;
  benefitsAndBurdensTransferAt?: string;
  buildingInsuranceClarified?: boolean;
  propertyManagerInformed?: boolean;
  serviceChargeInfoRequested?: boolean;
  propertyTaxInfoAvailable?: boolean;
  propertyFileComplete?: boolean;
  residentStaysInProperty?: boolean;
  residentName?: string;
  residentStatus?: ResidentStatus;
  residentMoveOutDate?: string;
  residentDeathDate?: string;
  residentStatusChangedAt?: string;
  residentStatusChangedByUserId?: string;
  residentStatusNote?: string;
  usageModel?: UsageModel;
  usageRightStartsAt?: string;
  usageRightEndsAt?: string;
  monthlyUsageFee?: number;
  residentContactName?: string;
  residentEmergencyContact?: string;
  propertyManagerName?: string;
  buildingInsurance?: string;
  serviceChargeStatus?: string;
  repairReportingChannelClarified?: boolean;
  conditionDocumentationAvailable?: boolean;
  nextPortfolioReviewAt?: string;
  maintenancePlan?: Record<string, unknown>;
  portfolioTasks?: Record<string, unknown>;
  portfolioNotes?: string;
  exitProcess?: PropertyExitProcess;
  lastActivityLabel?: string;
  lastActivityAt?: string;
  notes?: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
};

export type PropertyExitProcess = {
  id: string;
  propertyId: string;
  usageRightEndedAt?: string;
  terminationReason?: ExitTerminationReason;
  terminationProofAvailable: boolean;
  relativesOrEstateContact?: string;
  relativesContactedAt?: string;
  propertyAccessClarified: boolean;
  keyHandoverPlannedAt?: string;
  keysReceivedAt?: string;
  inspectionPlannedAt?: string;
  inspectionCompletedAt?: string;
  postMoveOutConditionReportAvailable: boolean;
  clearanceRequired: boolean;
  clearanceOrderedAt?: string;
  clearanceCompletedAt?: string;
  safetyInspectionCompleted: boolean;
  insuranceCoverageChecked: boolean;
  repairNeedCaptured: boolean;
  salesPreparationStartedAt?: string;
  brokerMandatedAt?: string;
  marketingStartedAt?: string;
  salePriceIndication?: number;
  salePriceFinal?: number;
  salesStatus: ExitSalesStatus;
  saleNotarizedAt?: string;
  salePriceReceivedAt?: string;
  exitCompletedAt?: string;
  internalNote?: string;
  responsibleUserId?: string;
  followUpAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RatingCategory = {
  id: string;
  versionId: string;
  name: string;
  weight: number;
  active: boolean;
};

export type RatingCriterion = {
  id: string;
  versionId: string;
  categoryId: string;
  name: string;
  description?: string;
  weight: number;
  weightOverrides?: Record<string, number>;
  sourceType: RatingSourceType;
  required: boolean;
  active: boolean;
  category?: RatingCategory;
  scoreDefinitions?: RatingScoreDefinition[];
};

export type RatingScoreDefinition = {
  id: string;
  versionId: string;
  criterionId: string;
  scoreValue: number;
  label: string;
  description?: string;
};

export type ObjectRatingScore = {
  id: string;
  objectRatingId: string;
  criterionId: string;
  criterion?: RatingCriterion;
  prefilledScore?: number;
  analystScore?: number;
  finalScore?: number;
  source?: RatingSourceType;
  confidence?: number;
  comment?: string;
  changedByUserId?: string;
  changedAt?: string;
};

export type RatingAuditLog = {
  id: string;
  objectRatingId: string;
  entityType: string;
  entityId?: string;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
  comment?: string;
  userId?: string;
  timestamp: string;
};

export type ObjectRating = {
  id: string;
  objectId: string;
  configVersionId: string;
  totalScore?: number;
  ratingClass?: string;
  baseTargetReturn?: number;
  lowerReturnBound?: number;
  upperReturnBound?: number;
  finalTargetReturn?: number;
  status: ObjectRatingStatus;
  scores: ObjectRatingScore[];
  auditLogs: RatingAuditLog[];
  createdAt: string;
  approvedAt?: string;
  approvedByUserId?: string;
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
  scanStatus: DocumentScanStatus;
  scanNote?: string;
  scannedAt?: string;
  currentVersion: number;
  missingReason?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  versions?: DocumentVersion[];
  createdAt: string;
};

export type DocumentVersion = {
  id: string;
  documentId: string;
  version: number;
  snapshot: Document;
  createdByUserId?: string;
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
  calculationMode?: string;
  sourceWorkbook?: string;
  sourceCells?: Record<string, string>;
  inputs?: Record<string, unknown>;
  components?: Record<string, number>;
  calculationDetails?: Record<string, unknown>;
  residentialRightVariant?: string;
  ratingSnapshot?: {
    ratingId?: string;
    configVersionId?: string;
    ratingClass?: string;
    baseTargetReturn?: number;
    lowerReturnBound?: number;
    upperReturnBound?: number;
    finalTargetReturn?: number;
    selectedTargetReturn?: number;
  };
  residentialRightVariantLabel?: string;
  termStatus?: string;
  termWarning?: string;
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
  versions?: OfferVersion[];
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

export type ChatMessage = {
  id: string;
  propertyId: string;
  userId: string;
  userName?: string;
  userRole?: UserRole;
  message: string;
  source: ActivitySource;
  visibility: ChatMessageVisibility;
  attachments?: ChatAttachment[];
  readByCurrentUser?: boolean;
  createdAt: string;
};

export type ChatAttachment = {
  id: string;
  chatMessageId: string;
  fileName: string;
  fileType: string;
  storageUrl: string;
  createdAt: string;
};

export type CaseNotification = {
  id: string;
  propertyId: string;
  actorUserId?: string;
  actorName?: string;
  type: string;
  title: string;
  message: string;
  processStep?: string;
  source: ActivitySource;
  visibility: ChatMessageVisibility;
  entityType?: ActivityEntityType;
  entityId?: string;
  caseNumber?: string;
  customerName?: string;
  readByCurrentUser?: boolean;
  emailQueuedAt?: string;
  emailStubMessageId?: string;
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
  source: "homepage" | "admin" | "internal" | "partner" | "phone" | "website" | "referral" | "other";
  status: LeadStatus;
  assignedPartnerId?: string;
  assignedAdvisorUserId?: string;
  assignedByUserId?: string;
  assignedAt?: string;
  convertedCustomerId?: string;
  convertedPropertyId?: string;
  convertedCaseId?: string;
  convertedAt?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  federalState?: string;
  preferredContactMethod?: string;
  contactConsent?: boolean;
  propertyStreet?: string;
  propertyPostalCode?: string;
  propertyCity?: string;
  propertyType?: PropertyType;
  livingAreaSqm?: number;
  plotAreaSqm?: number;
  yearBuilt?: number;
  propertyNote?: string;
  estimatedPropertyValueRange?: string;
  youngestOwnerAgeRange?: string;
  message?: string;
  productInterest?: DesiredModel;
  region?: string;
  routingReason?: string;
  internalNote?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CaseView = {
  partner?: Partner;
  customer: Customer;
  property: Property;
  documents: Document[];
  valuation?: Valuation;
  offer?: Offer;
  offers: Offer[];
  activities: Activity[];
  objectRatings: ObjectRating[];
  chatMessages: ChatMessage[];
  reminders: Reminder[];
};
