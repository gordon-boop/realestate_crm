import type { CaseView, DesiredModel, Lead, PropertyStatus, User } from "./domain.ts";
import { prisma } from "./prisma.ts";

const caseInclude = {
  partner: true,
  customer: true,
  documents: { orderBy: { createdAt: "desc" as const } },
  valuations: { orderBy: { createdAt: "desc" as const } },
  offers: { orderBy: { updatedAt: "desc" as const } },
  activities: { orderBy: { createdAt: "desc" as const } },
  reminders: { orderBy: { createdAt: "desc" as const } }
};

type PrismaCase = Awaited<ReturnType<typeof prisma.property.findFirst<{ include: typeof caseInclude }>>>;

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function number(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function jsonArray(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.map(String) : undefined;
}

function mapPartner(partner: NonNullable<PrismaCase>["partner"]) {
  return {
    ...partner,
    createdAt: iso(partner.createdAt)!,
    updatedAt: iso(partner.updatedAt)!
  };
}

function mapCustomer(customer: NonNullable<PrismaCase>["customer"]) {
  return {
    ...customer,
    dateOfBirth: iso(customer.dateOfBirth),
    spouseDateOfBirth: iso(customer.spouseDateOfBirth),
    createdAt: iso(customer.createdAt)!,
    updatedAt: iso(customer.updatedAt)!
  };
}

function mapProperty(property: NonNullable<PrismaCase>) {
  return {
    ...property,
    remainingDebtAmount: number(property.remainingDebtAmount),
    energyCarriers: jsonArray(property.energyCarriersJson),
    modernization: property.modernizationJson as Record<string, unknown> | undefined,
    buildingCondition: property.buildingConditionJson as Record<string, unknown> | undefined,
    followUpDueAt: iso(property.followUpDueAt),
    customerFeedbackReceivedAt: iso(property.customerFeedbackReceivedAt),
    rejectedAt: iso(property.rejectedAt),
    indicativeOfferSentAt: iso(property.indicativeOfferSentAt),
    expertOpinionOrderedAt: iso(property.expertOpinionOrderedAt),
    expertOpinionCompany: property.expertOpinionCompany ?? undefined,
    expertOpinionReceivedAt: iso(property.expertOpinionReceivedAt),
    bindingOfferSentAt: iso(property.bindingOfferSentAt),
    bindingOfferAcceptedAt: iso(property.bindingOfferAcceptedAt),
    offerAcceptedAt: iso(property.offerAcceptedAt),
    purchaseStartedAt: iso(property.purchaseStartedAt),
    notaryAppointmentAt: iso(property.notaryAppointmentAt),
    purchasedAt: iso(property.purchasedAt),
    portfolioEnteredAt: iso(property.portfolioEnteredAt),
    lastActivityAt: iso(property.lastActivityAt),
    createdAt: iso(property.createdAt)!,
    updatedAt: iso(property.updatedAt)!
  };
}

function mapDocument(document: NonNullable<PrismaCase>["documents"][number]) {
  return {
    ...document,
    reviewedAt: iso(document.reviewedAt),
    createdAt: iso(document.createdAt)!
  };
}

function mapValuation(valuation: NonNullable<PrismaCase>["valuations"][number]) {
  return {
    ...valuation,
    marketValue: Number(valuation.marketValue),
    valueMin: Number(valuation.valueMin),
    valueMax: Number(valuation.valueMax),
    confidenceScore: Number(valuation.confidenceScore),
    rawResponseJson: valuation.rawResponseJson as Record<string, unknown>,
    startedAt: iso(valuation.startedAt),
    completedAt: iso(valuation.completedAt),
    createdAt: iso(valuation.createdAt)!
  };
}

function mapOffer(offer: NonNullable<PrismaCase>["offers"][number]) {
  return {
    ...offer,
    marketValue: Number(offer.marketValue),
    adjustedMarketValue: Number(offer.adjustedMarketValue),
    residentialRightValue: Number(offer.residentialRightValue),
    riskDiscount: Number(offer.riskDiscount),
    companyMargin: Number(offer.companyMargin),
    payoutAmount: Number(offer.payoutAmount),
    assumptions: offer.assumptionsJson as Record<string, unknown>,
    approvedAt: iso(offer.approvedAt),
    sentAt: iso(offer.sentAt),
    validUntil: iso(offer.validUntil),
    pdfUrl: offer.pdfUrl ?? undefined,
    createdAt: iso(offer.createdAt)!,
    updatedAt: iso(offer.updatedAt)!
  };
}

export function toJsonSnapshot<T>(value: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function mapActivity(activity: NonNullable<PrismaCase>["activities"][number]) {
  return {
    ...activity,
    metadata: activity.metadataJson as Record<string, unknown> | undefined,
    createdAt: iso(activity.createdAt)!
  };
}

function mapReminder(reminder: NonNullable<PrismaCase>["reminders"][number]) {
  return {
    ...reminder,
    dueAt: iso(reminder.dueAt)!,
    completedAt: iso(reminder.completedAt),
    lastReminderAt: iso(reminder.lastReminderAt),
    createdAt: iso(reminder.createdAt)!,
    updatedAt: iso(reminder.updatedAt)!
  };
}

export function mapCaseView(property: NonNullable<PrismaCase>): CaseView {
  const offers = property.offers.map(mapOffer);
  return {
    partner: mapPartner(property.partner),
    customer: mapCustomer(property.customer),
    property: mapProperty(property),
    documents: property.documents.map(mapDocument),
    valuation: property.valuations[0] ? mapValuation(property.valuations[0]) : undefined,
    offer: offers[0],
    offers,
    activities: property.activities.map(mapActivity),
    reminders: property.reminders.map(mapReminder)
  } as CaseView;
}

export async function findDbUserByEmail(email: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({ where: { email } });
  return user ? mapDbUser(user) : undefined;
}

export async function findDbUserById(id: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? mapDbUser(user) : undefined;
}

function mapDbUser(user: Awaited<ReturnType<typeof prisma.user.findUnique>>): User {
  if (!user) throw new Error("User not found");
  return {
    id: user.id,
    partnerId: user.partnerId ?? undefined,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    createdAt: iso(user.createdAt)!,
    updatedAt: iso(user.updatedAt)!
  };
}

export async function getDbCases(user: User): Promise<CaseView[]> {
  const cases = await prisma.property.findMany({
    where: user.role === "admin" ? undefined : { partnerId: user.partnerId },
    include: caseInclude,
    orderBy: { updatedAt: "desc" }
  });
  return cases.map(mapCaseView);
}

export async function getDbCaseByPropertyId(propertyId: string): Promise<CaseView | undefined> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: caseInclude
  });
  return property ? mapCaseView(property) : undefined;
}

export async function getDbPartners() {
  return prisma.partner.findMany({ orderBy: { companyName: "asc" } });
}

export async function addDbActivity(
  propertyId: string,
  userId: string,
  type: string,
  message: string,
  options: { source?: "system" | "user" | "partner" | "admin"; entityType?: string; entityId?: string; metadata?: Record<string, unknown> } = {}
) {
  const activity = await prisma.activity.create({
    data: {
      propertyId,
      userId,
      type,
      message,
      source: options.source ?? "user",
      entityType: options.entityType as never,
      entityId: options.entityId,
      metadataJson: options.metadata,
      version: 1
    }
  });
  await prisma.property.update({
    where: { id: propertyId },
    data: { lastActivityAt: activity.createdAt, lastActivityLabel: "Gerade eben" }
  });
  return mapActivity(activity as never);
}

export async function updateDbPropertyStatus(propertyId: string, status: PropertyStatus) {
  return prisma.property.update({
    where: { id: propertyId },
    data: { status }
  });
}

export async function getDbLeads(user: User): Promise<Lead[]> {
  const leads = await prisma.lead.findMany({
    where: user.role === "admin" ? undefined : { assignedPartnerId: user.partnerId },
    orderBy: { createdAt: "desc" }
  });
  return leads.map(mapLead);
}

export async function createDbLead(input: Partial<Lead>, user?: User): Promise<Lead> {
  const count = await prisma.lead.count();
  const now = new Date();
  const lead = await prisma.lead.create({
    data: {
      leadNumber: `LD-2026-${String(count + 1).padStart(3, "0")}`,
      source: user?.role === "partner" ? "partner" : user?.role === "admin" ? input.source ?? "admin" : "homepage",
      status: user?.role === "partner" && user.partnerId ? "ASSIGNED" : "NEW",
      assignedPartnerId: user?.role === "partner" ? user.partnerId : undefined,
      assignedByUserId: user?.role === "partner" ? user.id : undefined,
      assignedAt: user?.role === "partner" ? now : undefined,
      firstName: input.firstName,
      lastName: input.lastName,
      name: input.name,
      email: input.email,
      phone: input.phone,
      postalCode: input.postalCode,
      city: input.city,
      propertyType: input.propertyType as never,
      estimatedPropertyValueRange: input.estimatedPropertyValueRange,
      youngestOwnerAgeRange: input.youngestOwnerAgeRange,
      message: input.message,
      productInterest: input.productInterest as never
    }
  });
  return mapLead(lead);
}

export async function assignDbLead(leadId: string, partnerId: string, userId: string): Promise<Lead> {
  const partner = await prisma.partner.findFirst({ where: { id: partnerId, status: "active" } });
  if (!partner) throw new Error("Partner not found");
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { status: "ASSIGNED", assignedPartnerId: partnerId, assignedByUserId: userId, assignedAt: new Date() }
  });
  return mapLead(lead);
}

export async function updateDbLeadStatus(leadId: string, status: Lead["status"]): Promise<Lead> {
  const lead = await prisma.lead.update({ where: { id: leadId }, data: { status } });
  return mapLead(lead);
}

export async function getDbLeadById(leadId: string): Promise<Lead | undefined> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  return lead ? mapLead(lead) : undefined;
}

export async function convertDbLeadToCase(leadId: string, partnerId: string, userId: string): Promise<CaseView> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (lead.status === "CONVERTED") throw new Error("Lead already converted");
  if (lead.assignedPartnerId !== partnerId) throw new Error("Forbidden");

  const displayName = [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() || lead.name || "Lead ohne Namen";
  const parts = displayName.split(/\s+/);
  const firstName = lead.firstName || parts[0] || "Unbekannt";
  const lastName = lead.lastName || parts.slice(1).join(" ") || "Lead";
  const count = await prisma.property.count();
  const isApartment = lead.propertyType === "apartment";

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        partnerId,
        displayName,
        firstName,
        lastName,
        email: lead.email,
        phone: lead.phone,
        postalCode: lead.postalCode,
        city: lead.city,
        addressText: [lead.postalCode, lead.city].filter(Boolean).join(" "),
        consentDataProcessing: true
      }
    });
    const property = await tx.property.create({
      data: {
        caseNumber: `WK-2026-${String(count + 15).padStart(3, "0")}`,
        objectTitle: `${propertyTypeToTitle(String(lead.propertyType || ""))} ${lead.city || "Ort offen"}`,
        customerId: customer.id,
        partnerId,
        propertyType: (lead.propertyType || "single_family") as never,
        street: "Noch offen",
        postalCode: lead.postalCode || "00000",
        city: lead.city || "Ort offen",
        livingAreaSqm: isApartment ? 80 : 130,
        plotAreaSqm: isApartment ? 0 : 350,
        condition: "average",
        occupancyStatus: "owner_occupied",
        desiredModel: (lead.productInterest || "fixed_residential_right") as DesiredModel,
        preferredValuationProvider: "sprengnetter",
        offerCalculationSource: "application",
        notes: lead.message ? `Aus Homepage-Lead übernommen: ${lead.message}` : "Aus Homepage-Lead übernommen.",
        status: "DRAFT"
      }
    });
    await tx.lead.update({
      where: { id: lead.id },
      data: {
        status: "CONVERTED",
        convertedCustomerId: customer.id,
        convertedPropertyId: property.id,
        convertedAt: new Date()
      }
    });
    await tx.activity.create({
      data: {
        propertyId: property.id,
        userId,
        type: "lead_converted",
        message: `Lead ${lead.leadNumber} wurde in einen Kundenfall umgewandelt.`,
        source: "partner",
        entityType: "lead",
        entityId: lead.id
      }
    });
    return property.id;
  });

  const convertedCase = await getDbCaseByPropertyId(result);
  if (!convertedCase) throw new Error("Converted case not found");
  return convertedCase;
}

export async function advanceDbAcquisitionWorkflow(
  propertyId: string,
  action: "indicative_offer_sent" | "offer_accepted" | "expert_opinion_ordered" | "expert_opinion_received" | "binding_offer_sent" | "binding_offer_accepted" | "notary_appointment_ordered" | "contract_signed" | "purchase_started" | "notary_appointment" | "purchased" | "enter_portfolio",
  userId: string,
  options: { expertOpinionOrderedAt?: string; expertOpinionReceivedAt?: string; expertOpinionCompany?: string; notaryAppointmentAt?: string } = {}
) {
  const now = new Date();
  const parsedExpertOrderedDate = options.expertOpinionOrderedAt ? new Date(options.expertOpinionOrderedAt) : now;
  const expertOrderedDate = Number.isNaN(parsedExpertOrderedDate.getTime()) ? now : parsedExpertOrderedDate;
  const parsedExpertReceivedDate = options.expertOpinionReceivedAt ? new Date(options.expertOpinionReceivedAt) : now;
  const expertReceivedDate = Number.isNaN(parsedExpertReceivedDate.getTime()) ? now : parsedExpertReceivedDate;
  const parsedNotaryDate = options.notaryAppointmentAt ? new Date(options.notaryAppointmentAt) : now;
  const notaryDate = Number.isNaN(parsedNotaryDate.getTime()) ? now : parsedNotaryDate;
  const expertCompany = options.expertOpinionCompany?.trim();
  const config = {
    indicative_offer_sent: { status: "INDICATIVE_OFFER_SENT", data: { indicativeOfferSentAt: now }, type: "indicative_offer_sent", message: "Unverbindliches Angebot (UVA) wurde abgegeben." },
    offer_accepted: { status: "OFFER_ACCEPTED", data: { offerAcceptedAt: now }, type: "offer_accepted", message: "Unverbindliches Angebot (UVA) wurde angenommen." },
    expert_opinion_ordered: {
      status: "EXPERT_OPINION_ORDERED",
      data: { expertOpinionOrderedAt: expertOrderedDate, expertOpinionCompany: expertCompany },
      type: "expert_opinion_ordered",
      message: `Gutachten wurde beauftragt${expertCompany ? `: ${expertCompany}` : "."}`
    },
    expert_opinion_received: { status: "EXPERT_OPINION_RECEIVED", data: { expertOpinionReceivedAt: expertReceivedDate }, type: "expert_opinion_received", message: "Gutachten ist eingegangen." },
    binding_offer_sent: { status: "BINDING_OFFER_SENT", data: { bindingOfferSentAt: now }, type: "binding_offer_sent", message: "Verbindliches Angebot (VA) wurde abgegeben." },
    binding_offer_accepted: { status: "BINDING_OFFER_ACCEPTED", data: { bindingOfferAcceptedAt: now }, type: "binding_offer_accepted", message: "Verbindliches Angebot (VA) wurde angenommen." },
    notary_appointment_ordered: { status: "NOTARY_APPOINTMENT", data: { notaryAppointmentAt: notaryDate }, type: "notary_appointment_ordered", message: "Notartermin wurde vereinbart." },
    contract_signed: { status: "IN_PORTFOLIO", data: { purchasedAt: now, portfolioEnteredAt: now }, type: "contract_signed", message: "Kaufvertrag wurde abgeschlossen. Der Fall ist in den Bestand gewechselt." },
    purchase_started: { status: "PURCHASE_STARTED", data: { purchaseStartedAt: now }, type: "purchase_started", message: "Ankaufsprozess wurde gestartet." },
    notary_appointment: { status: "NOTARY_APPOINTMENT", data: { notaryAppointmentAt: now }, type: "notary_appointment", message: "Notartermin wurde vereinbart." },
    purchased: { status: "PURCHASED", data: { purchasedAt: now }, type: "property_purchased", message: "Immobilie wurde angekauft." },
    enter_portfolio: { status: "IN_PORTFOLIO", field: "portfolioEnteredAt", type: "portfolio_entered", message: "Immobilie wurde in den Bestand übernommen." }
  }[action];

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: { status: config.status as PropertyStatus, ...(config.data || { [config.field]: now }) }
  });
  await addDbActivity(propertyId, userId, config.type, config.message, { source: "admin", entityType: "property", entityId: propertyId });
  return property;
}

function mapLead(lead: Awaited<ReturnType<typeof prisma.lead.findFirst>>): Lead {
  if (!lead) throw new Error("Lead not found");
  return {
    id: lead.id,
    leadNumber: lead.leadNumber,
    source: lead.source,
    status: lead.status,
    assignedPartnerId: lead.assignedPartnerId ?? undefined,
    assignedByUserId: lead.assignedByUserId ?? undefined,
    assignedAt: iso(lead.assignedAt),
    convertedCustomerId: lead.convertedCustomerId ?? undefined,
    convertedPropertyId: lead.convertedPropertyId ?? undefined,
    convertedAt: iso(lead.convertedAt),
    firstName: lead.firstName ?? undefined,
    lastName: lead.lastName ?? undefined,
    name: lead.name ?? undefined,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    postalCode: lead.postalCode ?? undefined,
    city: lead.city ?? undefined,
    propertyType: lead.propertyType ?? undefined,
    estimatedPropertyValueRange: lead.estimatedPropertyValueRange ?? undefined,
    youngestOwnerAgeRange: lead.youngestOwnerAgeRange ?? undefined,
    message: lead.message ?? undefined,
    productInterest: lead.productInterest ?? undefined,
    createdAt: iso(lead.createdAt)!,
    updatedAt: iso(lead.updatedAt)!
  };
}

function propertyTypeToTitle(type: string): string {
  switch (type) {
    case "apartment":
      return "ETW";
    case "semi_detached":
      return "Doppelhaushälfte";
    case "row_house":
      return "Reihenhaus";
    case "house":
    case "single_family":
      return "EFH";
    default:
      return "Objekt";
  }
}
