import {
  ActivityEntityType,
  ActivitySource,
  CaseSource,
  ChatMessageVisibility,
  DesiredModel,
  DocumentCategory,
  DocumentRequirementLevel,
  DocumentScanStatus,
  DocumentStatus,
  Gender,
  LeadSource,
  LeadStatus,
  ObjectRatingStatus,
  OfferKind,
  OfferStatus,
  Prisma,
  PrismaClient,
  PropertyCondition,
  PropertyStatus,
  PropertyType,
  RatingSourceType,
  ReminderStatus,
  ResidentialRightRecipients,
  UsageModel,
  ValuationProvider,
  ValuationStatus
} from "@prisma/client";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { calculateOffer, type OfferCalculationResult } from "../lib/offer-calculator.ts";
import {
  assertInvestorDemoEnvironment,
  INVESTOR_DEMO_IDS,
  INVESTOR_DEMO_REQUIRED_USERS,
  investorDemoExpectedCounts
} from "../lib/investor-demo-seed.ts";

const prisma = new PrismaClient();
const DEMO_MARKER = "DEMO DOCUMENT - NOT A REAL CUSTOMER DOCUMENT";
const BASE_DATE = new Date("2026-07-20T10:00:00.000Z");

type BootstrapUsers = {
  admin: Awaited<ReturnType<typeof requireUser>>;
  employee: Awaited<ReturnType<typeof requireUser>>;
  advisor: Awaited<ReturnType<typeof requireUser>>;
  broker: Awaited<ReturnType<typeof requireUser>>;
};

type RatingConfiguration = Prisma.RatingVersionGetPayload<{
  include: {
    criteria: { where: { active: true }; orderBy: { id: "asc" } };
    returnCurves: true;
  };
}>;

type DemoCaseSpec = {
  sequence: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: Date;
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseGender?: Gender;
  spouseDateOfBirth?: Date;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  propertyType: PropertyType;
  livingAreaSqm: number;
  plotAreaSqm?: number;
  yearBuilt: number;
  energyClass: string;
  marketValue: number;
  usageModel: UsageModel;
  status: PropertyStatus;
  caseSource: CaseSource;
  brokerOwned?: boolean;
  precheck?: boolean;
  rating?: "review" | "approved";
  indicativeOffer?: boolean;
  portfolio?: boolean;
};

const caseSpecs: DemoCaseSpec[] = [
  {
    sequence: 3,
    firstName: "Martin",
    lastName: "Weller",
    gender: Gender.male,
    dateOfBirth: new Date("1957-02-14T00:00:00.000Z"),
    street: "Birkenweg",
    houseNumber: "18",
    postalCode: "70565",
    city: "Stuttgart",
    propertyType: PropertyType.single_family,
    livingAreaSqm: 142,
    plotAreaSqm: 487,
    yearBuilt: 1988,
    energyClass: "D",
    marketValue: 505000,
    usageModel: UsageModel.fixed_residential_right,
    status: PropertyStatus.SUBMITTED,
    caseSource: CaseSource.PARTNER,
    brokerOwned: true
  },
  {
    sequence: 4,
    firstName: "Helen",
    lastName: "Carver",
    gender: Gender.female,
    dateOfBirth: new Date("1948-09-03T00:00:00.000Z"),
    street: "Am Stadtpark",
    houseNumber: "7",
    postalCode: "81667",
    city: "Munich",
    propertyType: PropertyType.apartment,
    livingAreaSqm: 118,
    yearBuilt: 1996,
    energyClass: "C",
    marketValue: 610000,
    usageModel: UsageModel.lifelong_residential_right,
    status: PropertyStatus.INTERNAL_REVIEW,
    caseSource: CaseSource.INTERNAL,
    precheck: true,
    rating: "review"
  },
  {
    sequence: 5,
    firstName: "Peter",
    lastName: "Langford",
    gender: Gender.male,
    dateOfBirth: new Date("1956-04-27T00:00:00.000Z"),
    street: "Rebenstrasse",
    houseNumber: "24",
    postalCode: "79104",
    city: "Freiburg",
    propertyType: PropertyType.single_family,
    livingAreaSqm: 138,
    plotAreaSqm: 440,
    yearBuilt: 1991,
    energyClass: "D",
    marketValue: 500000,
    usageModel: UsageModel.fixed_residential_right,
    status: PropertyStatus.INDICATIVE_OFFER_SENT,
    caseSource: CaseSource.INTERNAL,
    precheck: true,
    rating: "approved",
    indicativeOffer: true
  },
  {
    sequence: 6,
    firstName: "Margaret",
    lastName: "Hughes",
    gender: Gender.female,
    dateOfBirth: new Date("1946-11-18T00:00:00.000Z"),
    spouseFirstName: "William",
    spouseLastName: "Hughes",
    spouseGender: Gender.male,
    spouseDateOfBirth: new Date("1949-01-22T00:00:00.000Z"),
    street: "Elbchaussee",
    houseNumber: "112",
    postalCode: "22763",
    city: "Hamburg",
    propertyType: PropertyType.apartment,
    livingAreaSqm: 126,
    yearBuilt: 1994,
    energyClass: "C",
    marketValue: 625000,
    usageModel: UsageModel.lifelong_residential_right,
    status: PropertyStatus.INDICATIVE_OFFER_SENT,
    caseSource: CaseSource.INTERNAL,
    precheck: true,
    rating: "approved",
    indicativeOffer: true
  },
  {
    sequence: 7,
    firstName: "David",
    lastName: "Foster",
    gender: Gender.male,
    dateOfBirth: new Date("1954-06-09T00:00:00.000Z"),
    street: "Lindenallee",
    houseNumber: "31",
    postalCode: "72074",
    city: "Tuebingen",
    propertyType: PropertyType.single_family,
    livingAreaSqm: 151,
    plotAreaSqm: 520,
    yearBuilt: 1985,
    energyClass: "E",
    marketValue: 540000,
    usageModel: UsageModel.fixed_residential_right,
    status: PropertyStatus.IN_PORTFOLIO,
    caseSource: CaseSource.INTERNAL,
    precheck: true,
    rating: "approved",
    indicativeOffer: true,
    portfolio: true
  },
  {
    sequence: 8,
    firstName: "Susan",
    lastName: "Bennett",
    gender: Gender.female,
    dateOfBirth: new Date("1945-08-26T00:00:00.000Z"),
    street: "Rheinblick",
    houseNumber: "9",
    postalCode: "50678",
    city: "Cologne",
    propertyType: PropertyType.apartment,
    livingAreaSqm: 112,
    yearBuilt: 1998,
    energyClass: "B",
    marketValue: 590000,
    usageModel: UsageModel.lifelong_residential_right,
    status: PropertyStatus.IN_PORTFOLIO,
    caseSource: CaseSource.INTERNAL,
    precheck: true,
    rating: "approved",
    indicativeOffer: true,
    portfolio: true
  }
];

function date(dayOffset: number): Date {
  return new Date(BASE_DATE.getTime() + dayOffset * 86_400_000);
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

function caseId(sequence: number): string {
  return `investor_demo_property_${String(sequence).padStart(3, "0")}`;
}

function customerId(sequence: number): string {
  return `investor_demo_customer_${String(sequence).padStart(3, "0")}`;
}

function caseNumber(sequence: number): string {
  return `INV-DEMO-CASE-${String(sequence).padStart(3, "0")}`;
}

async function requireUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true, internalRole: true, partnerId: true } });
  if (!user) {
    throw new Error(`Required bootstrap user is missing: ${email}. Run db:bootstrap first.`);
  }
  return user;
}

async function loadBootstrapUsers(): Promise<BootstrapUsers> {
  const [admin, employee, advisor, broker] = await Promise.all(INVESTOR_DEMO_REQUIRED_USERS.map(requireUser));
  if (!broker.partnerId) {
    throw new Error("The bootstrap broker makler@demo.local has no partner assignment.");
  }
  return { admin, employee, advisor, broker };
}

async function loadRatingConfiguration(): Promise<RatingConfiguration> {
  const configuration = await prisma.ratingVersion.findFirst({
    where: { active: true },
    include: {
      criteria: { where: { active: true }, orderBy: { id: "asc" } },
      returnCurves: true
    },
    orderBy: { versionNumber: "desc" }
  });
  if (!configuration || configuration.criteria.length === 0 || configuration.returnCurves.length === 0) {
    throw new Error("No complete active property-rating configuration exists. Run db:bootstrap first.");
  }
  return configuration;
}

function buildPrecheck(spec: DemoCaseSpec) {
  return {
    preliminaryMarketValue: spec.marketValue,
    source: "Investor demo valuation",
    date: "2026-07-15",
    postbankRegionCategory: "green",
    landValuePerSqm: spec.propertyType === PropertyType.apartment ? 850 : 620,
    remainingUsefulLifeYears: 48,
    apartmentManagementAvailable: spec.propertyType === PropertyType.apartment ? true : null,
    renovationPlanAvailable: false,
    result: "PASSED",
    checkedAt: "2026-07-16T10:00:00.000Z",
    note: "Acquisition Pre-Check passed for the synthetic investor demo case."
  };
}

function buildPropertyData(spec: DemoCaseSpec, users: BootstrapUsers) {
  const partnerId = spec.brokerOwned ? users.broker.partnerId : null;
  const portfolioStart = spec.portfolio ? date(-60) : null;
  const fixedTermEnd = spec.portfolio && spec.usageModel === UsageModel.fixed_residential_right ? date(3592) : null;
  return {
    caseNumber: caseNumber(spec.sequence),
    objectTitle: `${spec.propertyType === PropertyType.apartment ? "Apartment" : "Detached House"} in ${spec.city}`,
    customerId: customerId(spec.sequence),
    partnerId,
    assignedAdvisorUserId: users.advisor.id,
    caseSource: spec.caseSource,
    propertyType: spec.propertyType,
    street: spec.street,
    postalCode: spec.postalCode,
    city: spec.city,
    livingAreaSqm: spec.livingAreaSqm,
    plotAreaSqm: spec.plotAreaSqm,
    yearBuilt: spec.yearBuilt,
    condition: PropertyCondition.good,
    occupancyStatus: "Owner-occupied",
    desiredModel: DesiredModel.fixed_residential_right,
    residentialRightRecipients: spec.spouseDateOfBirth ? ResidentialRightRecipients.both : ResidentialRightRecipients.one_person,
    residentialRightPerson: spec.spouseDateOfBirth ? "both" : "customer_1",
    desiredResidentialRightYears: spec.usageModel === UsageModel.fixed_residential_right ? 10 : null,
    fixedTermReason: spec.usageModel === UsageModel.fixed_residential_right ? "Predictable ten-year occupancy period" : null,
    modelReason: spec.usageModel === UsageModel.lifelong_residential_right
      ? "Lifetime occupancy is appropriate for the customer's age and objectives."
      : "A defined occupancy term supports the customer's planned move.",
    usableAreaSqm: spec.propertyType === PropertyType.apartment ? 12 : 35,
    parkingAvailable: true,
    parkingCount: 1,
    heatingType: "Central heating",
    heatingEnergySource: "gas",
    heatingYear: 2018,
    windowMaterial: "Double-glazed PVC",
    windowInstallationYear: 2016,
    asbestosRoofKnown: false,
    energyCertificateAvailable: true,
    energyCertificateType: "Consumption certificate",
    energyClass: spec.energyClass,
    knownDefects: "No material defects disclosed. Minor cosmetic wear consistent with age.",
    knownMajorMaintenanceOrSpecialAssessments: false,
    moistureDamageStatus: "NONE" as const,
    accessibilityAssessment: spec.propertyType === PropertyType.apartment ? "LOW_BARRIER" as const : "PARTIALLY_RESTRICTED" as const,
    hasElevator: spec.propertyType === PropertyType.apartment ? true : null,
    remainingDebtKnown: false,
    modernizationJson: json({
      roof: { year: 2014, scope: "partial" },
      windows: { year: 2016, scope: "complete" },
      heating: { year: 2018, scope: "complete" },
      note: "Synthetic modernization history for investor demonstration."
    }),
    buildingConditionJson: json({ facade: "good", roof: "good", interior: "maintained", demo: true }),
    acquisitionPrecheckJson: spec.precheck ? json(buildPrecheck(spec)) : Prisma.JsonNull,
    intakeDraftJson: json({ submitted: true, locale: "en-GB", investorDemo: true }),
    draftIntakeStep: 8,
    generalPropertyNotes: "Synthetic property created exclusively for the English investor demonstration.",
    offerCalculationSource: spec.indicativeOffer ? "investor_demo_existing_calculation_service" : null,
    usageModel: spec.usageModel,
    indicativeOfferSentAt: spec.indicativeOffer ? date(-105) : null,
    offerAcceptedAt: spec.portfolio ? date(-98) : null,
    expertOpinionOrderedAt: spec.portfolio ? date(-94) : null,
    expertOpinionCompany: spec.portfolio ? "Demo Appraisal Partners" : null,
    expertOpinionReceivedAt: spec.portfolio ? date(-84) : null,
    bindingOfferSentAt: spec.portfolio ? date(-79) : null,
    bindingOfferAcceptedAt: spec.portfolio ? date(-74) : null,
    purchaseStartedAt: spec.portfolio ? date(-72) : null,
    notaryAppointmentAt: spec.portfolio ? date(-68) : null,
    notaryOffice: spec.portfolio ? "Demo Notary Office" : null,
    purchasedAt: portfolioStart,
    portfolioEnteredAt: portfolioStart,
    purchaseContractNumber: spec.portfolio ? `INV-DEMO-PA-${spec.sequence}` : null,
    purchaseContractSignedAt: spec.portfolio ? date(-68) : null,
    payoutPaidAt: spec.portfolio ? date(-64) : null,
    ownershipTransferAt: spec.portfolio ? date(-61) : null,
    landRegisterEntryAt: spec.portfolio ? date(-60) : null,
    notaryAppointmentRequestedAt: spec.portfolio ? date(-75) : null,
    purchaseContractDraftReceivedAt: spec.portfolio ? date(-73) : null,
    purchaseContractDraftReviewedAt: spec.portfolio ? date(-71) : null,
    priorityNoticeRegisteredAt: spec.portfolio ? date(-66) : null,
    purchasePriceDueAt: spec.portfolio ? date(-65) : null,
    purchasePricePaidAt: spec.portfolio ? date(-64) : null,
    residentialRightRegisteredAt: spec.portfolio ? date(-60) : null,
    benefitsAndBurdensTransferAt: portfolioStart,
    buildingInsuranceClarified: Boolean(spec.portfolio),
    propertyManagerInformed: Boolean(spec.portfolio),
    serviceChargeInfoRequested: Boolean(spec.portfolio),
    propertyTaxInfoAvailable: Boolean(spec.portfolio),
    propertyFileComplete: Boolean(spec.portfolio),
    residentStaysInProperty: true,
    residentName: spec.portfolio ? `${spec.firstName} ${spec.lastName}` : null,
    usageRightStartsAt: portfolioStart,
    usageRightEndsAt: fixedTermEnd,
    residentialRightStartAt: portfolioStart,
    residentialRightEndAt: fixedTermEnd,
    residentContactName: spec.portfolio ? `${spec.firstName} ${spec.lastName}` : null,
    residentEmergencyContact: spec.portfolio ? "Emma Demo, +49 170 0000000" : null,
    propertyManagerName: spec.portfolio ? "Demo Property Management GmbH" : null,
    buildingInsurance: spec.portfolio ? "Demo Building Cover 2026" : null,
    serviceChargeStatus: spec.portfolio ? "Current" : null,
    repairReportingChannelClarified: Boolean(spec.portfolio),
    conditionDocumentationAvailable: Boolean(spec.portfolio),
    nextPortfolioReviewAt: spec.portfolio ? date(30) : null,
    maintenancePlanJson: spec.portfolio ? json({
      repairs: [{
        id: `investor_demo_repair_${spec.sequence}`,
        title: spec.sequence === 7 ? "Inspect roof drainage" : "Check balcony door seal",
        status: "open",
        dueAt: date(21).toISOString(),
        note: "Synthetic repair item for investor demonstration."
      }]
    }) : Prisma.JsonNull,
    portfolioTasksJson: spec.portfolio ? json({
      source: "reminders",
      note: "Operational tasks are also represented as linked reminders."
    }) : Prisma.JsonNull,
    portfolioNotes: spec.sequence === 8 ? "Resident communication is positive. Annual portfolio review scheduled." : null,
    lastActivityLabel: spec.portfolio ? "Portfolio onboarding completed" : spec.indicativeOffer ? "Indicative Offer submitted" : "Submission received",
    lastActivityAt: spec.portfolio ? portfolioStart : spec.indicativeOffer ? date(-105) : date(-2),
    notes: "Investor demo data. Not a real customer or property.",
    status: spec.status,
    createdAt: date(-130 + spec.sequence)
  };
}

async function upsertCustomer(spec: DemoCaseSpec, users: BootstrapUsers) {
  const data = {
    partnerId: spec.brokerOwned ? users.broker.partnerId : null,
    assignedAdvisorUserId: users.advisor.id,
    displayName: `${spec.firstName} ${spec.lastName}`,
    title: spec.gender === Gender.female ? "Ms" : "Mr",
    firstName: spec.firstName,
    lastName: spec.lastName,
    ageAtSubmission: BASE_DATE.getUTCFullYear() - spec.dateOfBirth.getUTCFullYear(),
    gender: spec.gender,
    email: `${spec.firstName}.${spec.lastName}.${spec.sequence}@investor-demo.invalid`.toLowerCase(),
    phone: `+49 711 5550${spec.sequence}0`,
    mobile: `+49 170 5550${spec.sequence}0`,
    dateOfBirth: spec.dateOfBirth,
    spouseFirstName: spec.spouseFirstName,
    spouseLastName: spec.spouseLastName,
    spouseGender: spec.spouseGender,
    spouseDateOfBirth: spec.spouseDateOfBirth,
    street: spec.street,
    houseNumber: spec.houseNumber,
    postalCode: spec.postalCode,
    city: spec.city,
    addressText: `${spec.street} ${spec.houseNumber}, ${spec.postalCode} ${spec.city}`,
    consentDataProcessing: true,
    createdAt: date(-130 + spec.sequence)
  };
  return prisma.customer.upsert({ where: { id: customerId(spec.sequence) }, update: data, create: { id: customerId(spec.sequence), ...data } });
}

async function upsertProperty(spec: DemoCaseSpec, users: BootstrapUsers) {
  const data = buildPropertyData(spec, users);
  return prisma.property.upsert({ where: { id: caseId(spec.sequence) }, update: data, create: { id: caseId(spec.sequence), ...data } });
}

async function assertNoIdentifierCollisions() {
  const [leadCollisions, caseCollisions, offerCollisions] = await Promise.all([
    prisma.lead.findMany({ where: { leadNumber: { in: [...INVESTOR_DEMO_IDS.leadNumbers] } }, select: { id: true, leadNumber: true } }),
    prisma.property.findMany({ where: { caseNumber: { in: [...INVESTOR_DEMO_IDS.caseNumbers] } }, select: { id: true, caseNumber: true } }),
    prisma.offer.findMany({ where: { offerNumber: { in: [...INVESTOR_DEMO_IDS.offerNumbers] } }, select: { id: true, offerNumber: true } })
  ]);
  const invalid = [
    ...leadCollisions.filter((item) => !INVESTOR_DEMO_IDS.leads.includes(item.id as never)),
    ...caseCollisions.filter((item) => !INVESTOR_DEMO_IDS.properties.includes(item.id as never)),
    ...offerCollisions.filter((item) => !INVESTOR_DEMO_IDS.offers.includes(item.id as never))
  ];
  if (invalid.length > 0) {
    throw new Error(`Investor demo identifier collision: ${invalid.map((item) => item.id).join(", ")}. No data was changed.`);
  }
}

async function upsertActivity(input: {
  id: string;
  propertyId?: string | null;
  userId: string;
  type: string;
  message: string;
  entityType?: ActivityEntityType;
  entityId?: string;
  createdAt: Date;
  metadata?: unknown;
  source?: ActivitySource;
}) {
  const data = {
    propertyId: input.propertyId ?? null,
    userId: input.userId,
    type: input.type,
    message: input.message,
    source: input.source ?? ActivitySource.admin,
    entityType: input.entityType,
    entityId: input.entityId,
    metadataJson: input.metadata === undefined ? Prisma.JsonNull : json(input.metadata),
    createdAt: input.createdAt
  };
  return prisma.activity.upsert({ where: { id: input.id }, update: data, create: { id: input.id, ...data } });
}

async function seedLeads(users: BootstrapUsers) {
  const directData = {
    leadNumber: INVESTOR_DEMO_IDS.leadNumbers[0],
    source: LeadSource.website,
    status: LeadStatus.NEW,
    assignedAdvisorUserId: users.advisor.id,
    assignedPartnerId: null,
    assignedByUserId: users.admin.id,
    assignedAt: date(-2),
    firstName: "Laura",
    lastName: "Harrison",
    name: "Laura Harrison",
    email: "laura.harrison@investor-demo.invalid",
    phone: "+49 711 555010",
    postalCode: "70184",
    city: "Stuttgart",
    federalState: "Baden-Wuerttemberg",
    preferredContactMethod: "Telephone",
    contactConsent: true,
    propertyPostalCode: "70184",
    propertyCity: "Stuttgart",
    propertyType: PropertyType.single_family,
    livingAreaSqm: 135,
    plotAreaSqm: 420,
    yearBuilt: 1990,
    propertyNote: "Detached house in an established residential area.",
    productInterest: DesiredModel.fixed_residential_right,
    region: "Stuttgart",
    routingReason: "Direct website enquiry assigned to the Customer Advisor.",
    internalNote: "Synthetic direct lead. Customer requested a first call in the afternoon.",
    createdByUserId: users.admin.id,
    createdAt: date(-2)
  };
  const brokerData = {
    leadNumber: INVESTOR_DEMO_IDS.leadNumbers[1],
    source: LeadSource.partner,
    status: LeadStatus.IN_REVIEW,
    assignedPartnerId: users.broker.partnerId,
    assignedAdvisorUserId: users.advisor.id,
    assignedByUserId: users.employee.id,
    assignedAt: date(-7),
    firstName: "Thomas",
    lastName: "Reed",
    name: "Thomas Reed",
    email: "thomas.reed@investor-demo.invalid",
    phone: "+49 40 555020",
    postalCode: "22301",
    city: "Hamburg",
    federalState: "Hamburg",
    preferredContactMethod: "Email",
    contactConsent: true,
    propertyPostalCode: "22301",
    propertyCity: "Hamburg",
    propertyType: PropertyType.apartment,
    livingAreaSqm: 104,
    yearBuilt: 2001,
    propertyNote: "Broker-referred apartment; ownership documents are being checked.",
    productInterest: DesiredModel.fixed_residential_right,
    region: "Hamburg",
    routingReason: "Assigned to the existing demo broker for qualification.",
    internalNote: "Synthetic broker lead. Follow up on the missing land register extract.",
    createdByUserId: users.employee.id,
    createdAt: date(-7)
  };
  await prisma.lead.upsert({ where: { id: INVESTOR_DEMO_IDS.leads[0] }, update: directData, create: { id: INVESTOR_DEMO_IDS.leads[0], ...directData } });
  await prisma.lead.upsert({ where: { id: INVESTOR_DEMO_IDS.leads[1] }, update: brokerData, create: { id: INVESTOR_DEMO_IDS.leads[1], ...brokerData } });
  await upsertActivity({
    id: "investor_demo_activity_lead_001_created",
    userId: users.admin.id,
    type: "lead_created",
    message: "New direct investor demo lead recorded and assigned to the Customer Advisor.",
    entityType: ActivityEntityType.lead,
    entityId: INVESTOR_DEMO_IDS.leads[0],
    createdAt: date(-2)
  });
  await upsertActivity({
    id: "investor_demo_activity_lead_002_follow_up",
    userId: users.employee.id,
    type: "lead_follow_up",
    message: "Broker lead is under review. Follow up on the current land register extract.",
    entityType: ActivityEntityType.lead,
    entityId: INVESTOR_DEMO_IDS.leads[1],
    createdAt: date(-5),
    metadata: { followUpAt: date(3).toISOString(), assignedPartnerId: users.broker.partnerId }
  });
}

function ratingCurve(configuration: RatingConfiguration, score: number) {
  const curve = configuration.returnCurves.find((candidate) => score >= Number(candidate.minScore) && score <= Number(candidate.maxScore))
    ?? configuration.returnCurves.slice().sort((a, b) => Number(a.minScore) - Number(b.minScore))[0];
  if (!curve) throw new Error("The active property-rating configuration has no usable return curve.");
  return curve;
}

async function upsertRating(spec: DemoCaseSpec, users: BootstrapUsers, configuration: RatingConfiguration) {
  if (!spec.rating) return null;
  const ratingId = `investor_demo_rating_${String(spec.sequence).padStart(3, "0")}`;
  const totalScore = spec.rating === "approved" ? (spec.usageModel === UsageModel.lifelong_residential_right ? 4.6 : 4.35) : 4.1;
  const curve = ratingCurve(configuration, totalScore);
  const approved = spec.rating === "approved";
  const ratingData = {
    objectId: caseId(spec.sequence),
    configVersionId: configuration.id,
    totalScore,
    ratingClass: curve.ratingClass,
    baseTargetReturn: curve.baseTargetReturn,
    lowerReturnBound: curve.lowerReturnBound,
    upperReturnBound: curve.upperReturnBound,
    finalTargetReturn: curve.baseTargetReturn,
    status: approved ? ObjectRatingStatus.approved : ObjectRatingStatus.analyst_review,
    approvedAt: approved ? date(-112) : null,
    approvedByUserId: approved ? users.admin.id : null,
    createdAt: date(-116)
  };
  await prisma.objectRating.upsert({ where: { id: ratingId }, update: ratingData, create: { id: ratingId, ...ratingData } });
  for (const [index, criterion] of configuration.criteria.entries()) {
    const open = !approved && index === 0;
    const score = open ? null : (index % 4 === 0 ? 5 : 4);
    await prisma.objectRatingScore.upsert({
      where: { objectRatingId_criterionId: { objectRatingId: ratingId, criterionId: criterion.id } },
      update: {
        prefilledScore: score,
        analystScore: score,
        finalScore: score,
        source: index % 3 === 0 ? RatingSourceType.document : RatingSourceType.analyst,
        confidence: open ? 0.45 : 0.9,
        comment: open ? "Open item: verify the latest local market evidence." : "Reviewed for the synthetic investor demo.",
        changedByUserId: users.advisor.id,
        changedAt: date(-113)
      },
      create: {
        objectRatingId: ratingId,
        criterionId: criterion.id,
        prefilledScore: score,
        analystScore: score,
        finalScore: score,
        source: index % 3 === 0 ? RatingSourceType.document : RatingSourceType.analyst,
        confidence: open ? 0.45 : 0.9,
        comment: open ? "Open item: verify the latest local market evidence." : "Reviewed for the synthetic investor demo.",
        changedByUserId: users.advisor.id,
        changedAt: date(-113)
      }
    });
  }
  await prisma.ratingAuditLog.upsert({
    where: { id: `${ratingId}_audit_initialised` },
    update: {
      action: approved ? "rating_approved" : "rating_review_started",
      newValue: json({ totalScore, ratingClass: curve.ratingClass, investorDemo: true }),
      comment: approved ? "Property Rating approved for investor demonstration." : "Property Rating initialised with one open review item.",
      userId: approved ? users.admin.id : users.advisor.id,
      timestamp: date(-112)
    },
    create: {
      id: `${ratingId}_audit_initialised`,
      objectRatingId: ratingId,
      entityType: "rating",
      entityId: ratingId,
      action: approved ? "rating_approved" : "rating_review_started",
      newValue: json({ totalScore, ratingClass: curve.ratingClass, investorDemo: true }),
      comment: approved ? "Property Rating approved for investor demonstration." : "Property Rating initialised with one open review item.",
      userId: approved ? users.admin.id : users.advisor.id,
      timestamp: date(-112)
    }
  });
  return { id: ratingId, targetReturn: Number(curve.baseTargetReturn) };
}

function calculateDemoOffer(spec: DemoCaseSpec, marketValue: number, targetReturn: number): OfferCalculationResult {
  return calculateOffer({
    valuation: { marketValue },
    condition: "good",
    model: "fixed_residential_right",
    usageModel: spec.usageModel,
    residentialRightYears: spec.usageModel === UsageModel.fixed_residential_right ? 10 : undefined,
    livingAreaSqm: spec.livingAreaSqm,
    propertyType: spec.propertyType,
    energyClass: spec.energyClass,
    monthlyRentPerSqm: spec.city === "Munich" || spec.city === "Hamburg" ? 15.5 : 11.5,
    garageCount: 1,
    garageMonthlyRent: 70,
    interestRate: 0.032,
    targetReturn,
    acquisitionCostRate: 0.09,
    salesCostRate: 0.015,
    primaryDateOfBirth: spec.dateOfBirth,
    primaryGender: spec.gender,
    secondDateOfBirth: spec.spouseDateOfBirth,
    secondGender: spec.spouseGender,
    residentialRightRecipients: spec.spouseDateOfBirth ? "both" : "one_person",
    residentialRightPerson: spec.spouseDateOfBirth ? "both" : "customer_1",
    calculationDate: BASE_DATE,
    selectedIndexationScenario: 0.02
  });
}

function offerIdentity(sequence: number, kind: OfferKind) {
  const suffix = kind === OfferKind.indicative ? "indicative" : "binding";
  const shortKind = kind === OfferKind.indicative ? "UVA" : "VA";
  return {
    id: `investor_demo_offer_${String(sequence).padStart(3, "0")}_${suffix}`,
    valuationId: `investor_demo_valuation_${String(sequence).padStart(3, "0")}_${suffix}`,
    number: `INV-DEMO-OFFER-${String(sequence).padStart(3, "0")}-${shortKind}`
  };
}

async function upsertOffer(
  spec: DemoCaseSpec,
  users: BootstrapUsers,
  kind: OfferKind,
  targetReturn: number
) {
  const identity = offerIdentity(spec.sequence, kind);
  const marketValue = kind === OfferKind.binding ? money(spec.marketValue * 1.015) : spec.marketValue;
  const result = calculateDemoOffer(spec, marketValue, targetReturn);
  const sentAt = kind === OfferKind.indicative ? date(-105) : date(-79);
  await prisma.valuation.upsert({
    where: { id: identity.valuationId },
    update: {
      propertyId: caseId(spec.sequence),
      provider: kind === OfferKind.binding ? ValuationProvider.sprengnetter : ValuationProvider.mock,
      status: ValuationStatus.completed,
      sourceLabel: kind === OfferKind.binding ? "Synthetic final appraisal" : "Synthetic preliminary market value",
      marketValue,
      valueMin: money(marketValue * 0.95),
      valueMax: money(marketValue * 1.05),
      confidenceScore: kind === OfferKind.binding ? 0.92 : 0.82,
      rawResponseJson: json({ investorDemo: true, marker: DEMO_MARKER, marketValue }),
      startedAt: date(-118),
      completedAt: date(-117)
    },
    create: {
      id: identity.valuationId,
      propertyId: caseId(spec.sequence),
      provider: kind === OfferKind.binding ? ValuationProvider.sprengnetter : ValuationProvider.mock,
      status: ValuationStatus.completed,
      sourceLabel: kind === OfferKind.binding ? "Synthetic final appraisal" : "Synthetic preliminary market value",
      marketValue,
      valueMin: money(marketValue * 0.95),
      valueMax: money(marketValue * 1.05),
      confidenceScore: kind === OfferKind.binding ? 0.92 : 0.82,
      rawResponseJson: json({ investorDemo: true, marker: DEMO_MARKER, marketValue }),
      startedAt: date(-118),
      completedAt: date(-117),
      createdAt: date(-118)
    }
  });
  const assumptions = {
    ...result.assumptions,
    investorDemo: true,
    marker: DEMO_MARKER,
    modelVariant: spec.usageModel,
    calculationDate: BASE_DATE.toISOString(),
    displayMetrics: {
      maintenanceReserve: result.companyMargin,
      rightOfResidenceValue: result.residentialRightValue,
      maximumCustomerPayout: result.payoutAmount,
      payoutRatio: result.payoutRate,
      acquisitionIrr: result.assumptions.components?.weightedAnnualIrr ?? targetReturn,
      totalAcquisitionCosts: result.assumptions.components?.totalInvestorCommitment,
      expectedSaleYear: result.assumptions.components?.expectedSaleYear
    }
  };
  const offerData = {
    propertyId: caseId(spec.sequence),
    valuationId: identity.valuationId,
    offerNumber: identity.number,
    kind,
    currentVersion: 1,
    marketValue: result.marketValue,
    adjustedMarketValue: result.adjustedMarketValue,
    residentialRightValue: result.residentialRightValue,
    riskDiscount: result.riskDiscount,
    companyMargin: result.companyMargin,
    payoutAmount: result.payoutAmount,
    model: DesiredModel.fixed_residential_right,
    residentialRightYears: spec.usageModel === UsageModel.fixed_residential_right ? 10 : null,
    assumptionsJson: json(assumptions),
    aiCustomerText: `Synthetic ${spec.usageModel === UsageModel.lifelong_residential_right ? "Lifetime" : "Fixed-Term"} Model ${kind === OfferKind.indicative ? "Indicative Offer" : "Binding Offer"}.`,
    aiPartnerSummary: "Investor demo offer generated using the existing CRM calculation service.",
    aiInternalRationale: `Target return derived from approved Property Rating: ${(targetReturn * 100).toFixed(2)}%.`,
    bindingOfferText: kind === OfferKind.binding ? "Synthetic Binding Offer for investor demonstration only." : null,
    validUntil: date(-77),
    status: OfferStatus.sent,
    approvedByUserId: users.admin.id,
    approvedAt: new Date(sentAt.getTime() - 86_400_000),
    sentAt,
    createdAt: new Date(sentAt.getTime() - 2 * 86_400_000)
  };
  await prisma.offer.upsert({ where: { id: identity.id }, update: offerData, create: { id: identity.id, ...offerData } });
  await prisma.offerVersion.upsert({
    where: { offerId_version: { offerId: identity.id, version: 1 } },
    update: { snapshotJson: json({ ...offerData, result, marker: DEMO_MARKER }), createdByUserId: users.advisor.id },
    create: {
      id: `${identity.id}_version_1`,
      offerId: identity.id,
      version: 1,
      snapshotJson: json({ ...offerData, result, marker: DEMO_MARKER }),
      createdByUserId: users.advisor.id,
      createdAt: offerData.createdAt
    }
  });
  await upsertActivity({
    id: `${identity.id}_activity_calculated`,
    propertyId: caseId(spec.sequence),
    userId: users.advisor.id,
    type: kind === OfferKind.indicative ? "indicative_offer_calculated" : "binding_offer_calculated",
    message: `${kind === OfferKind.indicative ? "Indicative" : "Binding"} Offer calculated using the ${spec.usageModel === UsageModel.lifelong_residential_right ? "Lifetime" : "Fixed-Term"} Model. Maximum Customer Payout: EUR ${result.payoutAmount.toFixed(2)}.`,
    entityType: ActivityEntityType.offer,
    entityId: identity.id,
    createdAt: offerData.createdAt,
    metadata: { payoutAmount: result.payoutAmount, targetReturn, usageModel: spec.usageModel }
  });
  return { id: identity.id, result };
}

function escapePdfText(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createDemoPdf(title: string, caseReference: string): Buffer {
  const lines = [DEMO_MARKER, title, `Reference: ${caseReference}`, "Synthetic content created for the English investor demonstration."];
  const stream = ["BT", "/F1 16 Tf", "72 760 Td"];
  lines.forEach((line, index) => {
    if (index > 0) stream.push("0 -34 Td");
    stream.push(`(${escapePdfText(line)}) Tj`);
  });
  stream.push("ET");
  const content = stream.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

type DemoDocumentSpec = {
  suffix: string;
  fileName: string;
  displayName: string;
  category: DocumentCategory;
  fileType: string;
  required?: boolean;
};

const commonDocumentSpecs: DemoDocumentSpec[] = [
  { suffix: "land_register", fileName: "current-land-register-extract-demo.pdf", displayName: "Current Land Register Extract", category: DocumentCategory.land_register, fileType: "application/pdf", required: true },
  { suffix: "energy", fileName: "energy-performance-certificate-demo.pdf", displayName: "Energy Performance Certificate", category: DocumentCategory.energy_certificate, fileType: "application/pdf", required: true },
  { suffix: "floorplan", fileName: "dimensioned-floor-plan-demo.pdf", displayName: "Dimensioned Floor Plan", category: DocumentCategory.floorplan, fileType: "application/pdf", required: true },
  { suffix: "living_area", fileName: "living-area-calculation-demo.pdf", displayName: "Living Area Calculation", category: DocumentCategory.living_area_calculation, fileType: "application/pdf", required: true },
  { suffix: "photo_front", fileName: "property-photo-front-demo.jpg", displayName: "Property Photo - Front", category: DocumentCategory.photos, fileType: "image/jpeg" },
  { suffix: "photo_interior", fileName: "property-photo-interior-demo.jpg", displayName: "Property Photo - Interior", category: DocumentCategory.photos, fileType: "image/jpeg" }
];

async function writeDocumentAsset(documentId: string, documentSpec: DemoDocumentSpec, reference: string) {
  const target = join(process.cwd(), "public", "mock-storage", `${documentId}-${documentSpec.fileName}`);
  await mkdir(dirname(target), { recursive: true });
  if (documentSpec.fileType === "application/pdf") {
    await writeFile(target, createDemoPdf(documentSpec.displayName, reference));
    return;
  }
  const template = join(process.cwd(), "prisma", "demo-assets", documentSpec.fileName);
  await writeFile(target, await readFile(template));
}

async function upsertDocument(spec: DemoCaseSpec, users: BootstrapUsers, documentSpec: DemoDocumentSpec) {
  const documentId = `investor_demo_document_${String(spec.sequence).padStart(3, "0")}_${documentSpec.suffix}`;
  const storageUrl = `/api/properties/${caseId(spec.sequence)}/documents/${documentId}`;
  const data = {
    propertyId: caseId(spec.sequence),
    customerId: customerId(spec.sequence),
    uploadedByUserId: users.admin.id,
    fileName: documentSpec.fileName,
    displayName: documentSpec.displayName,
    fileType: documentSpec.fileType,
    storageUrl,
    category: documentSpec.category,
    requirementLevel: documentSpec.required ? DocumentRequirementLevel.required : DocumentRequirementLevel.optional,
    status: DocumentStatus.ok,
    scanStatus: DocumentScanStatus.clean,
    scanNote: DEMO_MARKER,
    scannedAt: date(-119),
    currentVersion: 1,
    reviewedByUserId: users.admin.id,
    reviewedAt: date(-118),
    createdAt: date(-120)
  };
  await prisma.document.upsert({ where: { id: documentId }, update: data, create: { id: documentId, ...data } });
  await prisma.documentVersion.upsert({
    where: { documentId_version: { documentId, version: 1 } },
    update: { snapshotJson: json({ ...data, marker: DEMO_MARKER }), createdByUserId: users.admin.id },
    create: { id: `${documentId}_version_1`, documentId, version: 1, snapshotJson: json({ ...data, marker: DEMO_MARKER }), createdByUserId: users.admin.id, createdAt: data.createdAt }
  });
  await writeDocumentAsset(documentId, documentSpec, caseNumber(spec.sequence));
  return { id: documentId, storageUrl };
}

async function seedCommonDocuments(spec: DemoCaseSpec, users: BootstrapUsers) {
  for (const documentSpec of commonDocumentSpecs) {
    await upsertDocument(spec, users, documentSpec);
  }
}

async function seedOfferPdf(spec: DemoCaseSpec, users: BootstrapUsers, offerId: string) {
  const documentSpec: DemoDocumentSpec = {
    suffix: "indicative_offer",
    fileName: `indicative-offer-${caseNumber(spec.sequence).toLowerCase()}-demo.pdf`,
    displayName: "Indicative Offer",
    category: DocumentCategory.other,
    fileType: "application/pdf",
    required: true
  };
  const document = await upsertDocument(spec, users, documentSpec);
  await prisma.offer.update({ where: { id: offerId }, data: { pdfUrl: document.storageUrl } });
  await upsertActivity({
    id: `${offerId}_activity_pdf_created`,
    propertyId: caseId(spec.sequence),
    userId: users.admin.id,
    type: "indicative_offer_pdf_created",
    message: "Indicative Offer PDF created and stored in Documents.",
    entityType: ActivityEntityType.document,
    entityId: document.id,
    createdAt: date(-104),
    metadata: { documentId: document.id, offerId }
  });
}

async function seedCaseActivity(spec: DemoCaseSpec, users: BootstrapUsers) {
  await upsertActivity({
    id: `investor_demo_activity_case_${spec.sequence}_submitted`,
    propertyId: caseId(spec.sequence),
    userId: spec.brokerOwned ? users.broker.id : users.advisor.id,
    type: "property_submitted",
    message: "Customer Case submitted with complete synthetic customer and property details.",
    entityType: ActivityEntityType.property,
    entityId: caseId(spec.sequence),
    createdAt: date(-125 + spec.sequence),
    source: spec.brokerOwned ? ActivitySource.partner : ActivitySource.admin
  });
  if (spec.precheck) {
    await upsertActivity({
      id: `investor_demo_activity_case_${spec.sequence}_precheck`,
      propertyId: caseId(spec.sequence),
      userId: users.advisor.id,
      type: "acquisition_precheck_completed",
      message: "Acquisition Pre-Check completed: eligible for acquisition.",
      entityType: ActivityEntityType.property,
      entityId: caseId(spec.sequence),
      createdAt: date(-117),
      metadata: { result: "PASSED", investorDemo: true }
    });
  }
  if (spec.rating) {
    await upsertActivity({
      id: `investor_demo_activity_case_${spec.sequence}_rating`,
      propertyId: caseId(spec.sequence),
      userId: spec.rating === "approved" ? users.admin.id : users.advisor.id,
      type: spec.rating === "approved" ? "property_rating_approved" : "property_rating_review_started",
      message: spec.rating === "approved"
        ? "Property Rating approved and target return released for the offer calculation."
        : "Property Rating is under analyst review; one criterion remains open.",
      entityType: ActivityEntityType.rating,
      entityId: `investor_demo_rating_${String(spec.sequence).padStart(3, "0")}`,
      createdAt: date(-112)
    });
  }
}

async function seedPortfolioCase(
  spec: DemoCaseSpec,
  users: BootstrapUsers,
  indicativeOfferId: string,
  bindingOfferId: string,
  bindingResult: OfferCalculationResult
) {
  const enteredAt = date(-60);
  await prisma.property.update({
    where: { id: caseId(spec.sequence) },
    data: {
      indicativeAcceptedOfferModel: DesiredModel.fixed_residential_right,
      indicativeAcceptedOfferId: indicativeOfferId,
      indicativeAcceptedOfferModelAt: date(-98),
      indicativeAcceptedOfferModelByUserId: users.admin.id,
      bindingAcceptedOfferModel: DesiredModel.fixed_residential_right,
      bindingAcceptedOfferId: bindingOfferId,
      bindingAcceptedOfferModelAt: date(-74),
      bindingAcceptedOfferModelByUserId: users.admin.id,
      purchasePrice: bindingResult.payoutAmount,
      portfolioEnteredAt: enteredAt,
      purchasedAt: enteredAt,
      status: PropertyStatus.IN_PORTFOLIO
    }
  });
  const history = [
    ["indicative_submitted", "Indicative Offer submitted.", -105],
    ["indicative_accepted", `Indicative Offer accepted for the ${spec.usageModel === UsageModel.lifelong_residential_right ? "Lifetime" : "Fixed-Term"} Model.`, -98],
    ["appraisal_commissioned", "Appraisal commissioned with Demo Appraisal Partners.", -94],
    ["appraisal_received", "Appraisal received and reviewed.", -84],
    ["binding_submitted", "Binding Offer submitted.", -79],
    ["binding_accepted", "Binding Offer accepted.", -74],
    ["purchase_agreement_signed", "Purchase Agreement signed.", -68],
    ["purchase_price_paid", "Purchase Price paid.", -64],
    ["land_register_completed", "Land Register Entry completed.", -60],
    ["portfolio_onboarding", "Portfolio onboarding completed; resident remains in the property.", -60]
  ] as const;
  for (const [suffix, message, dayOffset] of history) {
    await upsertActivity({
      id: `investor_demo_activity_case_${spec.sequence}_${suffix}`,
      propertyId: caseId(spec.sequence),
      userId: users.admin.id,
      type: suffix,
      message,
      entityType: ActivityEntityType.property,
      entityId: caseId(spec.sequence),
      createdAt: date(dayOffset),
      metadata: { investorDemo: true, usageModel: spec.usageModel }
    });
  }
  const openReminderId = `investor_demo_reminder_case_${spec.sequence}_open`;
  await prisma.reminder.upsert({
    where: { id: openReminderId },
    update: {
      propertyId: caseId(spec.sequence),
      assignedToUserId: users.employee.id,
      createdByUserId: users.admin.id,
      reason: spec.sequence === 7 ? "Review roof drainage inspection report" : "Complete annual resident service call",
      status: ReminderStatus.open,
      dueAt: date(14),
      completedAt: null,
      completedByUserId: null
    },
    create: {
      id: openReminderId,
      propertyId: caseId(spec.sequence),
      assignedToUserId: users.employee.id,
      createdByUserId: users.admin.id,
      reason: spec.sequence === 7 ? "Review roof drainage inspection report" : "Complete annual resident service call",
      status: ReminderStatus.open,
      dueAt: date(14),
      createdAt: date(-3)
    }
  });
  if (spec.sequence === 8) {
    const completedReminderId = "investor_demo_reminder_case_8_done";
    await prisma.reminder.upsert({
      where: { id: completedReminderId },
      update: {
        propertyId: caseId(spec.sequence),
        assignedToUserId: users.employee.id,
        createdByUserId: users.admin.id,
        completedByUserId: users.employee.id,
        reason: "Confirm annual service-charge statement",
        status: ReminderStatus.done,
        dueAt: date(-8),
        completedAt: date(-9)
      },
      create: {
        id: completedReminderId,
        propertyId: caseId(spec.sequence),
        assignedToUserId: users.employee.id,
        createdByUserId: users.admin.id,
        completedByUserId: users.employee.id,
        reason: "Confirm annual service-charge statement",
        status: ReminderStatus.done,
        dueAt: date(-8),
        completedAt: date(-9),
        createdAt: date(-16)
      }
    });
    await prisma.chatMessage.upsert({
      where: { id: "investor_demo_chat_case_8_resident_enquiry" },
      update: {
        propertyId: caseId(spec.sequence),
        userId: users.employee.id,
        message: "Resident enquiry recorded: please confirm the timing of the annual heating inspection.",
        source: ActivitySource.admin,
        visibility: ChatMessageVisibility.internal,
        createdAt: date(-4)
      },
      create: {
        id: "investor_demo_chat_case_8_resident_enquiry",
        propertyId: caseId(spec.sequence),
        userId: users.employee.id,
        message: "Resident enquiry recorded: please confirm the timing of the annual heating inspection.",
        source: ActivitySource.admin,
        visibility: ChatMessageVisibility.internal,
        createdAt: date(-4)
      }
    });
  }
  await upsertActivity({
    id: `investor_demo_activity_case_${spec.sequence}_repair`,
    propertyId: caseId(spec.sequence),
    userId: users.employee.id,
    type: "repair_recorded",
    message: spec.sequence === 7 ? "Repair recorded: roof drainage inspection." : "Repair recorded: balcony door seal inspection.",
    entityType: ActivityEntityType.property,
    entityId: caseId(spec.sequence),
    createdAt: date(-6)
  });
  await upsertDocument(spec, users, {
    suffix: "purchase_agreement",
    fileName: `purchase-agreement-${caseNumber(spec.sequence).toLowerCase()}-demo.pdf`,
    displayName: "Purchase Agreement",
    category: DocumentCategory.other,
    fileType: "application/pdf",
    required: true
  });
}

async function verifyInvestorDemoData(users: BootstrapUsers) {
  const expected = investorDemoExpectedCounts();
  const [leads, properties, customers, offers, offerDocuments, portfolioProperties, partnerLeads, partnerProperties] = await Promise.all([
    prisma.lead.count({ where: { id: { in: [...INVESTOR_DEMO_IDS.leads] } } }),
    prisma.property.count({ where: { id: { in: [...INVESTOR_DEMO_IDS.properties] } } }),
    prisma.customer.count({ where: { id: { in: [...INVESTOR_DEMO_IDS.customers] } } }),
    prisma.offer.count({ where: { id: { in: [...INVESTOR_DEMO_IDS.offers] } } }),
    prisma.document.count({ where: { id: { in: [
      "investor_demo_document_005_indicative_offer",
      "investor_demo_document_006_indicative_offer",
      "investor_demo_document_007_indicative_offer",
      "investor_demo_document_008_indicative_offer"
    ] } } }),
    prisma.property.count({ where: { id: { in: [caseId(7), caseId(8)] }, status: PropertyStatus.IN_PORTFOLIO, portfolioEnteredAt: { not: null }, purchaseContractSignedAt: { not: null }, purchasePricePaidAt: { not: null }, landRegisterEntryAt: { not: null } } }),
    prisma.lead.count({ where: { id: INVESTOR_DEMO_IDS.leads[1], assignedPartnerId: users.broker.partnerId } }),
    prisma.property.count({ where: { id: caseId(3), partnerId: users.broker.partnerId } })
  ]);
  const actual = { leads, customers, properties, offers };
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Investor demo verification failed. Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
  }
  if (offerDocuments !== 4 || portfolioProperties !== 2 || partnerLeads !== 1 || partnerProperties !== 1) {
    throw new Error("Investor demo relationship verification failed.");
  }
  return { ...actual, demoRecords: leads + properties, offerDocuments, portfolioProperties };
}

export async function seedInvestorDemo() {
  assertInvestorDemoEnvironment();
  const users = await loadBootstrapUsers();
  const ratingConfiguration = await loadRatingConfiguration();
  await assertNoIdentifierCollisions();
  await seedLeads(users);
  for (const spec of caseSpecs) {
    await upsertCustomer(spec, users);
    await upsertProperty(spec, users);
    await seedCommonDocuments(spec, users);
    await seedCaseActivity(spec, users);
    const rating = await upsertRating(spec, users, ratingConfiguration);
    if (spec.indicativeOffer) {
      if (!rating) throw new Error(`Case ${caseNumber(spec.sequence)} requires an approved Property Rating before offer calculation.`);
      const indicative = await upsertOffer(spec, users, OfferKind.indicative, rating.targetReturn);
      await seedOfferPdf(spec, users, indicative.id);
      if (spec.portfolio) {
        const binding = await upsertOffer(spec, users, OfferKind.binding, rating.targetReturn);
        await seedPortfolioCase(spec, users, indicative.id, binding.id, binding.result);
      }
    }
  }
  return verifyInvestorDemoData(users);
}

async function main() {
  const result = await seedInvestorDemo();
  console.log("Investor demo seed completed successfully.");
  console.table(result);
}

const invokedAsScript = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) {
  main()
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(async () => prisma.$disconnect());
}
