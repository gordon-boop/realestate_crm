import type { Prisma } from "@prisma/client";
import { nextPropertyCaseNumber } from "./case-number.ts";
import { canSeeProperty, isInternalAdmin } from "./access-control.ts";
import { acquisitionStatusLabel } from "./acquisition-workflow.ts";
import type { CaseNotification, CaseView, DesiredModel, Lead, OfferAssumptions, PropertyStatus, User } from "./domain.ts";
import { sendCaseNotificationEmailStub } from "./email.ts";
import { prisma } from "./prisma.ts";
import { nextSequenceValue } from "./sequence.ts";

const caseInclude = {
  partner: true,
  customer: true,
  documents: {
    orderBy: { createdAt: "desc" as const },
    include: { versions: { orderBy: { version: "desc" as const } } }
  },
  valuations: { orderBy: { createdAt: "desc" as const } },
  offers: {
    orderBy: { updatedAt: "desc" as const },
    include: { versions: { orderBy: { version: "desc" as const } } }
  },
  activities: { orderBy: { createdAt: "desc" as const } },
  objectRatings: {
    orderBy: { createdAt: "desc" as const },
    include: {
      configVersion: true,
      scores: {
        orderBy: { id: "asc" as const },
        include: { criterion: { include: { category: true, scoreDefinitions: { orderBy: { scoreValue: "asc" as const } } } } }
      },
      auditLogs: { orderBy: { timestamp: "desc" as const } }
    }
  },
  chatMessages: {
    orderBy: { createdAt: "asc" as const },
    include: {
      user: { select: { id: true, name: true, role: true } },
      attachments: { orderBy: { createdAt: "asc" as const } },
      reads: true
    }
  },
  reminders: { orderBy: { createdAt: "desc" as const } },
  exitProcess: true
};

type PrismaCase = Awaited<ReturnType<typeof prisma.property.findFirst<{ include: typeof caseInclude }>>>;

const notificationInclude = {
  actorUser: { select: { id: true, name: true } },
  property: {
    select: {
      id: true,
      caseNumber: true,
      partnerId: true,
      assignedAdvisorUserId: true,
      customer: { select: { displayName: true, firstName: true, lastName: true } }
    }
  },
  reads: true
};

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
  if (!partner) return undefined;
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
    indicativeAcceptedOfferModel: property.indicativeAcceptedOfferModel ?? undefined,
    indicativeAcceptedOfferId: property.indicativeAcceptedOfferId ?? undefined,
    indicativeAcceptedOfferModelAt: iso(property.indicativeAcceptedOfferModelAt),
    indicativeAcceptedOfferModelByUserId: property.indicativeAcceptedOfferModelByUserId ?? undefined,
    bindingAcceptedOfferModel: property.bindingAcceptedOfferModel ?? undefined,
    bindingAcceptedOfferId: property.bindingAcceptedOfferId ?? undefined,
    bindingAcceptedOfferModelAt: iso(property.bindingAcceptedOfferModelAt),
    bindingAcceptedOfferModelByUserId: property.bindingAcceptedOfferModelByUserId ?? undefined,
    offerAcceptedAt: iso(property.offerAcceptedAt),
    purchaseStartedAt: iso(property.purchaseStartedAt),
    notaryAppointmentAt: iso(property.notaryAppointmentAt),
    notaryOffice: property.notaryOffice ?? undefined,
    purchasedAt: iso(property.purchasedAt),
    portfolioEnteredAt: iso(property.portfolioEnteredAt),
    purchaseContractNumber: property.purchaseContractNumber ?? undefined,
    purchaseContractSignedAt: iso(property.purchaseContractSignedAt),
    purchasePrice: number(property.purchasePrice),
    payoutPaidAt: iso(property.payoutPaidAt),
    ownershipTransferAt: iso(property.ownershipTransferAt),
    landRegisterEntryAt: iso(property.landRegisterEntryAt),
    monthlyRent: number(property.monthlyRent),
    rentStartAt: iso(property.rentStartAt),
    rentDeposit: number(property.rentDeposit),
    residentialRightStartAt: iso(property.residentialRightStartAt),
    residentialRightEndAt: iso(property.residentialRightEndAt),
    residentialRightNotes: property.residentialRightNotes ?? undefined,
    notaryAppointmentRequestedAt: iso(property.notaryAppointmentRequestedAt),
    purchaseContractDraftReceivedAt: iso(property.purchaseContractDraftReceivedAt),
    purchaseContractDraftReviewedAt: iso(property.purchaseContractDraftReviewedAt),
    priorityNoticeRegisteredAt: iso(property.priorityNoticeRegisteredAt),
    purchasePriceDueAt: iso(property.purchasePriceDueAt),
    purchasePricePaidAt: iso(property.purchasePricePaidAt),
    residentialRightRegisteredAt: iso(property.residentialRightRegisteredAt),
    benefitsAndBurdensTransferAt: iso(property.benefitsAndBurdensTransferAt),
    buildingInsuranceClarified: property.buildingInsuranceClarified,
    propertyManagerInformed: property.propertyManagerInformed,
    serviceChargeInfoRequested: property.serviceChargeInfoRequested,
    propertyTaxInfoAvailable: property.propertyTaxInfoAvailable,
    propertyFileComplete: property.propertyFileComplete,
    residentStaysInProperty: property.residentStaysInProperty,
    residentName: property.residentName ?? undefined,
    residentStatus: property.residentStatus ?? undefined,
    residentMoveOutDate: iso(property.residentMoveOutDate),
    residentDeathDate: iso(property.residentDeathDate),
    residentStatusChangedAt: iso(property.residentStatusChangedAt),
    residentStatusChangedByUserId: property.residentStatusChangedByUserId ?? undefined,
    residentStatusNote: property.residentStatusNote ?? undefined,
    usageModel: property.usageModel ?? undefined,
    usageRightStartsAt: iso(property.usageRightStartsAt),
    usageRightEndsAt: iso(property.usageRightEndsAt),
    monthlyUsageFee: number(property.monthlyUsageFee),
    residentContactName: property.residentContactName ?? undefined,
    residentEmergencyContact: property.residentEmergencyContact ?? undefined,
    propertyManagerName: property.propertyManagerName ?? undefined,
    buildingInsurance: property.buildingInsurance ?? undefined,
    serviceChargeStatus: property.serviceChargeStatus ?? undefined,
    repairReportingChannelClarified: property.repairReportingChannelClarified,
    conditionDocumentationAvailable: property.conditionDocumentationAvailable,
    nextPortfolioReviewAt: iso(property.nextPortfolioReviewAt),
    maintenancePlan: property.maintenancePlanJson as Record<string, unknown> | undefined,
    portfolioTasks: property.portfolioTasksJson as Record<string, unknown> | undefined,
    portfolioNotes: property.portfolioNotes ?? undefined,
    knownMajorMaintenanceOrSpecialAssessments: property.knownMajorMaintenanceOrSpecialAssessments ?? undefined,
    knownMajorMaintenanceOrSpecialAssessmentsDescription: property.knownMajorMaintenanceOrSpecialAssessmentsDescription ?? undefined,
    moistureDamageStatus: property.moistureDamageStatus ?? undefined,
    moistureDamageDescription: property.moistureDamageDescription ?? undefined,
    accessibilityAssessment: property.accessibilityAssessment ?? undefined,
    hasElevator: property.hasElevator ?? undefined,
    exitProcess: property.exitProcess ? {
      ...property.exitProcess,
      usageRightEndedAt: iso(property.exitProcess.usageRightEndedAt),
      relativesContactedAt: iso(property.exitProcess.relativesContactedAt),
      keyHandoverPlannedAt: iso(property.exitProcess.keyHandoverPlannedAt),
      keysReceivedAt: iso(property.exitProcess.keysReceivedAt),
      inspectionPlannedAt: iso(property.exitProcess.inspectionPlannedAt),
      inspectionCompletedAt: iso(property.exitProcess.inspectionCompletedAt),
      clearanceOrderedAt: iso(property.exitProcess.clearanceOrderedAt),
      clearanceCompletedAt: iso(property.exitProcess.clearanceCompletedAt),
      salesPreparationStartedAt: iso(property.exitProcess.salesPreparationStartedAt),
      brokerMandatedAt: iso(property.exitProcess.brokerMandatedAt),
      marketingStartedAt: iso(property.exitProcess.marketingStartedAt),
      salePriceIndication: number(property.exitProcess.salePriceIndication),
      salePriceFinal: number(property.exitProcess.salePriceFinal),
      saleNotarizedAt: iso(property.exitProcess.saleNotarizedAt),
      salePriceReceivedAt: iso(property.exitProcess.salePriceReceivedAt),
      exitCompletedAt: iso(property.exitProcess.exitCompletedAt),
      followUpAt: iso(property.exitProcess.followUpAt),
      createdAt: iso(property.exitProcess.createdAt)!,
      updatedAt: iso(property.exitProcess.updatedAt)!
    } : undefined,
    lastActivityAt: iso(property.lastActivityAt),
    createdAt: iso(property.createdAt)!,
    updatedAt: iso(property.updatedAt)!
  };
}

function mapDocument(document: NonNullable<PrismaCase>["documents"][number]) {
  return {
    ...document,
    scannedAt: iso(document.scannedAt),
    reviewedAt: iso(document.reviewedAt),
    versions: document.versions?.map((version) => ({
      id: version.id,
      documentId: version.documentId,
      version: version.version,
      snapshot: version.snapshotJson as unknown,
      createdByUserId: version.createdByUserId ?? undefined,
      createdAt: iso(version.createdAt)!
    })),
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
    assumptions: offer.assumptionsJson as unknown as OfferAssumptions,
    approvedAt: iso(offer.approvedAt),
    sentAt: iso(offer.sentAt),
    validUntil: iso(offer.validUntil),
    pdfUrl: offer.pdfUrl ?? undefined,
    versions: offer.versions?.map((version) => ({
      id: version.id,
      offerId: version.offerId,
      version: version.version,
      snapshot: version.snapshotJson as unknown,
      createdByUserId: version.createdByUserId ?? undefined,
      createdAt: iso(version.createdAt)!
    })),
    createdAt: iso(offer.createdAt)!,
    updatedAt: iso(offer.updatedAt)!
  };
}

export function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export function toOptionalPrismaJson(value: unknown): Prisma.InputJsonValue | undefined {
  return value === undefined ? undefined : toPrismaJson(value);
}

export function toJsonSnapshot<T>(value: T): Prisma.InputJsonValue {
  return toPrismaJson(value);
}

function mapActivity(activity: NonNullable<PrismaCase>["activities"][number]) {
  return {
    ...activity,
    metadata: activity.metadataJson as Record<string, unknown> | undefined,
    createdAt: iso(activity.createdAt)!
  };
}

function mapObjectRating(rating: NonNullable<PrismaCase>["objectRatings"][number]) {
  return {
    id: rating.id,
    objectId: rating.objectId,
    configVersionId: rating.configVersionId,
    totalScore: number(rating.totalScore),
    ratingClass: rating.ratingClass ?? undefined,
    baseTargetReturn: number(rating.baseTargetReturn),
    lowerReturnBound: number(rating.lowerReturnBound),
    upperReturnBound: number(rating.upperReturnBound),
    finalTargetReturn: number(rating.finalTargetReturn),
    status: rating.status,
    createdAt: iso(rating.createdAt)!,
    approvedAt: iso(rating.approvedAt),
    approvedByUserId: rating.approvedByUserId ?? undefined,
    scores: rating.scores.map((score) => ({
      id: score.id,
      objectRatingId: score.objectRatingId,
      criterionId: score.criterionId,
      prefilledScore: score.prefilledScore ?? undefined,
      analystScore: score.analystScore ?? undefined,
      finalScore: score.finalScore ?? undefined,
      source: score.source ?? undefined,
      confidence: number(score.confidence),
      comment: score.comment ?? undefined,
      changedByUserId: score.changedByUserId ?? undefined,
      changedAt: iso(score.changedAt),
      criterion: {
        id: score.criterion.id,
        versionId: score.criterion.versionId,
        categoryId: score.criterion.categoryId,
        name: score.criterion.name,
        description: score.criterion.description ?? undefined,
        weight: number(score.criterion.weight) ?? 0,
        weightOverrides: score.criterion.weightOverrides as Record<string, number> | undefined,
        sourceType: score.criterion.sourceType,
        required: score.criterion.required,
        active: score.criterion.active,
        scoreDefinitions: score.criterion.scoreDefinitions.map((definition) => ({
          id: definition.id,
          versionId: definition.versionId,
          criterionId: definition.criterionId,
          scoreValue: definition.scoreValue,
          label: definition.label,
          description: definition.description ?? undefined
        })),
        category: {
          id: score.criterion.category.id,
          versionId: score.criterion.category.versionId,
          name: score.criterion.category.name,
          weight: number(score.criterion.category.weight) ?? 0,
          active: score.criterion.category.active
        }
      }
    })),
    auditLogs: rating.auditLogs.map((entry) => ({
      id: entry.id,
      objectRatingId: entry.objectRatingId,
      entityType: entry.entityType,
      entityId: entry.entityId ?? undefined,
      action: entry.action,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      comment: entry.comment ?? undefined,
      userId: entry.userId ?? undefined,
      timestamp: iso(entry.timestamp)!
    }))
  };
}

function mapChatMessage(message: NonNullable<PrismaCase>["chatMessages"][number]) {
  return {
    id: message.id,
    propertyId: message.propertyId,
    userId: message.userId,
    userName: message.user?.name,
    userRole: message.user?.role,
    message: message.message,
    source: message.source,
    visibility: message.visibility,
    attachments: message.attachments?.map((attachment) => ({
      id: attachment.id,
      chatMessageId: attachment.chatMessageId,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      storageUrl: attachment.storageUrl,
      createdAt: iso(attachment.createdAt)!
    })),
    readByCurrentUser: false,
    createdAt: iso(message.createdAt)!
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

function mapCaseNotification(notification: any, currentUserId?: string): CaseNotification {
  const customer = notification.property?.customer;
  const customerName = customer?.displayName || [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim() || "Kunde";
  return {
    id: notification.id,
    propertyId: notification.propertyId,
    actorUserId: notification.actorUserId ?? undefined,
    actorName: notification.actorUser?.name ?? undefined,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    processStep: notification.processStep ?? undefined,
    source: notification.source,
    visibility: notification.visibility,
    entityType: notification.entityType ?? undefined,
    entityId: notification.entityId ?? undefined,
    caseNumber: notification.property?.caseNumber ?? undefined,
    customerName,
    readByCurrentUser: currentUserId ? notification.reads?.some((read: { userId: string }) => read.userId === currentUserId) ?? false : false,
    emailQueuedAt: iso(notification.emailQueuedAt),
    emailStubMessageId: notification.emailStubMessageId ?? undefined,
    createdAt: iso(notification.createdAt)!
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
    objectRatings: property.objectRatings.map(mapObjectRating),
    chatMessages: property.chatMessages.map(mapChatMessage),
    reminders: property.reminders.map(mapReminder)
  } as CaseView;
}

export function filterCaseViewForUser(caseView: CaseView, user: User): CaseView {
  if (user.role === "admin") return caseView;
  return {
    ...caseView,
    chatMessages: caseView.chatMessages.filter((message) => message.visibility === "shared")
  };
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
    internalRole: user.internalRole ?? undefined,
    deletedAt: iso(user.deletedAt),
    createdAt: iso(user.createdAt)!,
    updatedAt: iso(user.updatedAt)!
  };
}

export async function getDbCases(user: User): Promise<CaseView[]> {
  const cases = await prisma.property.findMany({
    where: user.role === "partner"
      ? { partnerId: user.partnerId }
      : isInternalAdmin(user)
        ? undefined
        : { assignedAdvisorUserId: user.id },
    include: caseInclude,
    orderBy: { updatedAt: "desc" }
  });
  return cases.map(mapCaseView).map((caseView) => filterCaseViewForUser(caseView, user));
}

export async function getDbCaseNotifications(user: User): Promise<CaseNotification[]> {
  const notifications = await prisma.caseNotification.findMany({
    where: user.role === "partner"
      ? { visibility: "shared", property: { partnerId: user.partnerId } }
      : isInternalAdmin(user)
        ? undefined
        : { property: { assignedAdvisorUserId: user.id } },
    include: notificationInclude,
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return notifications.map((notification) => mapCaseNotification(notification, user.id));
}

export async function markDbNotificationsRead(
  user: User,
  input: { notificationId?: string; notificationIds?: string[]; propertyId?: string; kind?: "all" | "chat" | "process" }
): Promise<{ count: number }> {
  const notifications = await getDbCaseNotifications(user);
  const requestedIds = new Set([
    ...(input.notificationId ? [input.notificationId] : []),
    ...(input.notificationIds ?? [])
  ]);
  const filtered = notifications.filter((notification) => {
    if (requestedIds.size && !requestedIds.has(notification.id)) return false;
    if (input.propertyId && notification.propertyId !== input.propertyId) return false;
    if (input.kind === "chat" && notification.entityType !== "chat") return false;
    if (input.kind === "process" && notification.entityType === "chat") return false;
    return true;
  });

  await Promise.all(filtered.map((notification) => prisma.caseNotificationRead.upsert({
    where: { notificationId_userId: { notificationId: notification.id, userId: user.id } },
    create: { notificationId: notification.id, userId: user.id, readAt: new Date() },
    update: { readAt: new Date() }
  })));

  return { count: filtered.length };
}

export async function markDbChatMessagesRead(propertyId: string, user: User): Promise<{ count: number }> {
  const caseView = await getDbCaseByPropertyId(propertyId);
  if (!caseView) throw new Error("Property not found");
  if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

  const visibleMessages = caseView.chatMessages.filter((message) => (
    message.userId !== user.id && (user.role === "admin" || message.visibility === "shared")
  ));

  await Promise.all(visibleMessages.map((message) => prisma.chatMessageRead.upsert({
    where: { chatMessageId_userId: { chatMessageId: message.id, userId: user.id } },
    create: { chatMessageId: message.id, userId: user.id, readAt: new Date() },
    update: { readAt: new Date() }
  })));

  await markDbNotificationsRead(user, { propertyId, kind: "chat" });
  return { count: visibleMessages.length };
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
      metadataJson: toOptionalPrismaJson(options.metadata),
      version: 1
    }
  });
  await prisma.property.update({
    where: { id: propertyId },
    data: { lastActivityAt: activity.createdAt, lastActivityLabel: "Gerade eben" }
  });
  if (shouldCreateNotification(type)) {
    await addDbCaseNotification({
      propertyId,
      actorUserId: userId,
      type,
      title: notificationTitle(type),
      message,
      processStep: notificationTitle(type),
      source: options.source ?? "user",
      visibility: options.metadata?.visibility === "internal" ? "internal" : "shared",
      entityType: options.entityType as never,
      entityId: options.entityId
    });
  }
  return mapActivity(activity as never);
}

export async function addDbChatMessage(
  propertyId: string,
  userId: string,
  userRole: "admin" | "partner",
  message: string,
  visibility: "shared" | "internal" = "shared",
  attachments: Array<{ fileName: string; fileType: string; storageUrl: string }> = []
) {
  const chatMessage = await prisma.chatMessage.create({
    data: {
      propertyId,
      userId,
      message,
      source: userRole,
      visibility,
      attachments: attachments.length
        ? {
            create: attachments.map((attachment) => ({
              fileName: attachment.fileName,
              fileType: attachment.fileType,
              storageUrl: attachment.storageUrl
            }))
          }
        : undefined
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
      attachments: { orderBy: { createdAt: "asc" } },
      reads: true
    }
  });
  await prisma.chatMessageRead.create({
    data: {
      chatMessageId: chatMessage.id,
      userId,
      readAt: new Date()
    }
  });
  await addDbActivity(propertyId, userId, "chat_message_created", "Neue Chat-Nachricht wurde geschrieben.", {
    source: userRole,
    entityType: "chat",
    entityId: chatMessage.id,
    metadata: { visibility }
  });
  return mapChatMessage(chatMessage as never);
}

function shouldCreateNotification(type: string): boolean {
  return [
    "chat_message_created",
    "indicative_offer_sent",
    "offer_accepted",
    "expert_opinion_ordered",
    "expert_opinion_received",
    "binding_offer_sent",
    "binding_offer_accepted",
    "notary_appointment_ordered",
    "contract_signed",
    "resident_status_changed",
    "workflow_reset",
    "property_rejected",
    "feedback_received"
  ].includes(type);
}

function notificationTitle(type: string): string {
  const labels: Record<string, string> = {
    chat_message_created: "Neue Chat-Nachricht",
    indicative_offer_sent: "Unverbindliches Angebot abgegeben",
    offer_accepted: "UVA angenommen",
    expert_opinion_ordered: "Gutachten beauftragt",
    expert_opinion_received: "Gutachten eingegangen",
    binding_offer_sent: "Verbindliches Angebot abgegeben",
    binding_offer_accepted: "VA angenommen",
    notary_appointment_ordered: "Notartermin vereinbart",
    contract_signed: "Kaufvertrag abgeschlossen",
    resident_status_changed: "Verkaufsprozess gestartet",
    workflow_reset: "Prozessschritt zurückgesetzt",
    property_rejected: "Fall abgelehnt",
    feedback_received: "Kundenrückmeldung eingegangen"
  };
  return labels[type] ?? "Änderung im Kundenfall";
}

export async function addDbCaseNotification(input: {
  propertyId: string;
  actorUserId?: string;
  type: string;
  title: string;
  message: string;
  processStep?: string;
  source?: "system" | "user" | "partner" | "admin";
  visibility?: "shared" | "internal";
  entityType?: "property" | "customer" | "document" | "valuation" | "offer" | "reminder" | "lead" | "chat";
  entityId?: string;
}): Promise<CaseNotification> {
  const notification = await prisma.caseNotification.create({
    data: {
      propertyId: input.propertyId,
      actorUserId: input.actorUserId,
      type: input.type,
      title: input.title,
      message: input.message,
      processStep: input.processStep,
      source: input.source ?? "system",
      visibility: input.visibility ?? "shared",
      entityType: input.entityType,
      entityId: input.entityId
    },
    include: notificationInclude
  });

  const email = await sendCaseNotificationEmailStub({
    to: "crm-notifications@wohnkapital.local",
    subject: input.title,
    html: `<p>${input.message}</p>`
  });
  const updated = await prisma.caseNotification.update({
    where: { id: notification.id },
    data: { emailQueuedAt: new Date(), emailStubMessageId: email.messageId },
    include: notificationInclude
  });

  return mapCaseNotification(updated, input.actorUserId);
}

export async function updateDbPropertyStatus(propertyId: string, status: PropertyStatus) {
  return prisma.property.update({
    where: { id: propertyId },
    data: { status }
  });
}

export async function getDbLeads(user: User): Promise<Lead[]> {
  const leads = await prisma.lead.findMany({
    where: user.role === "partner"
      ? { assignedPartnerId: user.partnerId }
      : isInternalAdmin(user)
        ? undefined
        : { assignedAdvisorUserId: user.id },
    orderBy: { createdAt: "desc" }
  });
  return leads.map(mapLead);
}

export async function createDbLead(input: Partial<Lead>, user?: User): Promise<Lead> {
  const now = new Date();
  const leadNumber = `LEAD-${String(await nextSequenceValue("lead")).padStart(3, "0")}`;
  const assignedPartnerId = user?.role === "partner" ? user.partnerId : user?.role === "admin" ? input.assignedPartnerId : undefined;
  const assignedAdvisorUserId = user?.role === "admin" && !isInternalAdmin(user) ? user.id : user?.role === "admin" ? input.assignedAdvisorUserId : undefined;
  const assigned = Boolean(assignedPartnerId || assignedAdvisorUserId);
  if (assignedPartnerId) {
    const partner = await prisma.partner.findFirst({ where: { id: assignedPartnerId, status: "active" } });
    if (!partner) throw new Error("Partner not found");
  }
  const source = user?.role === "partner" ? "partner" : user?.role === "admin" ? (!isInternalAdmin(user) ? "internal" : input.source ?? "phone") : "homepage";
  const lead = await prisma.lead.create({
    data: {
      leadNumber,
      source: source as never,
      status: assigned ? "ASSIGNED_TO_PARTNER" : source === "homepage" ? "NEW" : "IN_REVIEW",
      assignedPartnerId,
      assignedAdvisorUserId,
      assignedByUserId: assigned ? user?.id : undefined,
      assignedAt: assigned ? now : undefined,
      firstName: input.firstName,
      lastName: input.lastName,
      name: input.name,
      email: input.email,
      phone: input.phone,
      mobilePhone: input.mobilePhone,
      street: input.street,
      postalCode: input.postalCode,
      city: input.city,
      federalState: input.federalState,
      preferredContactMethod: input.preferredContactMethod,
      contactConsent: input.contactConsent,
      propertyStreet: input.propertyStreet,
      propertyPostalCode: input.propertyPostalCode,
      propertyCity: input.propertyCity,
      propertyType: input.propertyType as never,
      livingAreaSqm: input.livingAreaSqm,
      plotAreaSqm: input.plotAreaSqm,
      yearBuilt: input.yearBuilt,
      propertyNote: input.propertyNote,
      estimatedPropertyValueRange: input.estimatedPropertyValueRange,
      youngestOwnerAgeRange: input.youngestOwnerAgeRange,
      message: input.message,
      productInterest: input.productInterest as never,
      region: input.region,
      routingReason: input.routingReason,
      internalNote: input.internalNote,
      createdByUserId: user?.id
    }
  });
  if (assigned && user?.id) {
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "lead_assigned",
        message: `Lead ${lead.leadNumber} wurde weitergeleitet.${input.routingReason ? ` Grund: ${input.routingReason}` : ""}`,
        source: user.role === "partner" ? "partner" : "admin",
        entityType: "lead",
        entityId: lead.id
      }
    });
  }
  return mapLead(lead);
}

export async function assignDbLead(leadId: string, assignment: { partnerId?: string; advisorUserId?: string }, userId: string): Promise<Lead> {
  if (assignment.partnerId) {
    const partner = await prisma.partner.findFirst({ where: { id: assignment.partnerId, status: "active" } });
    if (!partner) throw new Error("Partner not found");
  }
  if (assignment.advisorUserId) {
    const advisor = await prisma.user.findFirst({ where: { id: assignment.advisorUserId, role: "admin", internalRole: { in: ["advisor", "admin", "super_admin"] } } });
    if (!advisor) throw new Error("Kundenberater not found");
  }
  const existing = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!existing) throw new Error("Lead not found");
  if (["CONVERTED", "CONVERTED_TO_CASE"].includes(existing.status)) throw new Error("Converted leads cannot be assigned");
  if (existing.status === "REJECTED") throw new Error("Rejected leads must be reactivated before assignment");
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "ASSIGNED_TO_PARTNER",
      assignedPartnerId: assignment.partnerId ?? null,
      assignedAdvisorUserId: assignment.advisorUserId ?? null,
      assignedByUserId: userId,
      assignedAt: new Date()
    }
  });
  const targetLabel = assignment.partnerId
    ? (await prisma.partner.findUnique({ where: { id: assignment.partnerId } }))?.contactName || "Makler"
    : (await prisma.user.findUnique({ where: { id: assignment.advisorUserId || "" } }))?.name || "Kundenberater";
  await prisma.activity.create({
    data: {
      userId,
      type: "lead_assigned",
      message: `Lead wurde an ${targetLabel} weitergeleitet.`,
      source: "admin",
      entityType: "lead",
      entityId: lead.id
    }
  });
  return mapLead(lead);
}

export async function updateDbLeadStatus(leadId: string, status: Lead["status"]): Promise<Lead> {
  const existing = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!existing) throw new Error("Lead not found");
  if (["CONVERTED", "CONVERTED_TO_CASE"].includes(existing.status)) throw new Error("Converted leads cannot be changed");
  if (["CONVERTED", "CONVERTED_TO_CASE"].includes(status)) throw new Error("Use convert endpoint for converted leads");
  if (["ASSIGNED", "ASSIGNED_TO_PARTNER"].includes(status)) throw new Error("Use assign endpoint for lead assignment");

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: status === "NEW"
      ? { status, assignedPartnerId: null, assignedAdvisorUserId: null, assignedByUserId: null, assignedAt: null }
      : { status }
  });
  return mapLead(lead);
}

export async function getDbLeadById(leadId: string): Promise<Lead | undefined> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  return lead ? mapLead(lead) : undefined;
}

export async function convertDbLeadToCase(leadId: string, assignment: { partnerId?: string; advisorUserId?: string }, userId: string, source: "admin" | "partner" = "partner"): Promise<CaseView> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (["CONVERTED", "CONVERTED_TO_CASE"].includes(lead.status)) throw new Error("Lead already converted");
  if (lead.status === "REJECTED") throw new Error("Rejected leads cannot be converted");
  if (assignment.partnerId && lead.assignedPartnerId !== assignment.partnerId) throw new Error("Forbidden");
  if (assignment.advisorUserId && lead.assignedAdvisorUserId !== assignment.advisorUserId) throw new Error("Forbidden");
  if (!assignment.partnerId && !assignment.advisorUserId) throw new Error("Assignment required");

  const displayName = [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() || lead.name || "Lead ohne Namen";
  const parts = displayName.split(/\s+/);
  const firstName = lead.firstName || parts[0] || "Unbekannt";
  const lastName = lead.lastName || parts.slice(1).join(" ") || "Lead";
  const caseNumber = await nextPropertyCaseNumber();
  const isApartment = lead.propertyType === "apartment";

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        partnerId: assignment.partnerId,
        assignedAdvisorUserId: assignment.advisorUserId,
        displayName,
        firstName,
        lastName,
        email: lead.email,
        phone: lead.phone,
        mobile: lead.mobilePhone,
        street: lead.street,
        postalCode: lead.postalCode,
        city: lead.city,
        addressText: [lead.street, lead.postalCode, lead.city].filter(Boolean).join(" "),
        consentDataProcessing: true
      }
    });
    const property = await tx.property.create({
      data: {
        caseNumber,
        objectTitle: `${propertyTypeToTitle(String(lead.propertyType || ""))} ${lead.city || "Ort offen"}`,
        customerId: customer.id,
        partnerId: assignment.partnerId,
        assignedAdvisorUserId: assignment.advisorUserId,
        caseSource: assignment.advisorUserId ? "INTERNAL" : "PARTNER",
        propertyType: (lead.propertyType || "single_family") as never,
        street: lead.propertyStreet || lead.street || "Noch offen",
        postalCode: lead.propertyPostalCode || lead.postalCode || "00000",
        city: lead.propertyCity || lead.city || "Ort offen",
        livingAreaSqm: lead.livingAreaSqm || (isApartment ? 80 : 130),
        plotAreaSqm: lead.plotAreaSqm || (isApartment ? 0 : 350),
        yearBuilt: lead.yearBuilt,
        condition: "average",
        desiredModel: (lead.productInterest || "fixed_residential_right") as DesiredModel,
        preferredValuationProvider: "sprengnetter",
        offerCalculationSource: "application",
        notes: [lead.message && `Gesprächsnotiz: ${lead.message}`, lead.propertyNote && `Objektnotiz: ${lead.propertyNote}`, lead.internalNote && `Interne Lead-Notiz: ${lead.internalNote}`].filter(Boolean).join("\n") || "Aus Lead übernommen.",
        status: "DRAFT"
      }
    });
    await tx.lead.update({
      where: { id: lead.id },
      data: {
        status: "CONVERTED_TO_CASE",
        convertedCustomerId: customer.id,
        convertedPropertyId: property.id,
        convertedCaseId: property.id,
        convertedAt: new Date()
      }
    });
    await tx.activity.create({
      data: {
        propertyId: property.id,
        userId,
        type: "lead_converted",
        message: `Lead ${lead.leadNumber} wurde in einen Kundenfall umgewandelt.`,
        source,
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
  options: { indicativeOfferSentAt?: string; offerAcceptedAt?: string; expertOpinionOrderedAt?: string; expertOpinionReceivedAt?: string; expertOpinionCompany?: string; bindingOfferSentAt?: string; bindingOfferAcceptedAt?: string; acceptedOfferModel?: DesiredModel; acceptedOfferId?: string; acceptedOfferNote?: string; notaryAppointmentAt?: string; notaryOffice?: string; source?: "admin" | "partner" | "system" | "user" } = {}
) {
  const now = new Date();
  const parsedIndicativeSentDate = options.indicativeOfferSentAt ? new Date(options.indicativeOfferSentAt) : now;
  const indicativeSentDate = Number.isNaN(parsedIndicativeSentDate.getTime()) ? now : parsedIndicativeSentDate;
  const parsedOfferAcceptedDate = options.offerAcceptedAt ? new Date(options.offerAcceptedAt) : now;
  const offerAcceptedDate = Number.isNaN(parsedOfferAcceptedDate.getTime()) ? now : parsedOfferAcceptedDate;
  const parsedExpertOrderedDate = options.expertOpinionOrderedAt ? new Date(options.expertOpinionOrderedAt) : now;
  const expertOrderedDate = Number.isNaN(parsedExpertOrderedDate.getTime()) ? now : parsedExpertOrderedDate;
  const parsedExpertReceivedDate = options.expertOpinionReceivedAt ? new Date(options.expertOpinionReceivedAt) : now;
  const expertReceivedDate = Number.isNaN(parsedExpertReceivedDate.getTime()) ? now : parsedExpertReceivedDate;
  const parsedBindingSentDate = options.bindingOfferSentAt ? new Date(options.bindingOfferSentAt) : now;
  const bindingSentDate = Number.isNaN(parsedBindingSentDate.getTime()) ? now : parsedBindingSentDate;
  const parsedBindingAcceptedDate = options.bindingOfferAcceptedAt ? new Date(options.bindingOfferAcceptedAt) : now;
  const bindingAcceptedDate = Number.isNaN(parsedBindingAcceptedDate.getTime()) ? now : parsedBindingAcceptedDate;
  const parsedNotaryDate = options.notaryAppointmentAt ? new Date(options.notaryAppointmentAt) : now;
  const notaryDate = Number.isNaN(parsedNotaryDate.getTime()) ? now : parsedNotaryDate;
  const expertCompany = options.expertOpinionCompany?.trim();
  const notaryOffice = options.notaryOffice?.trim();
  const acceptedModelLabel = options.acceptedOfferModel ? offerModelLabel(options.acceptedOfferModel) : undefined;
  const config = {
    indicative_offer_sent: { status: "INDICATIVE_OFFER_SENT", data: { indicativeOfferSentAt: indicativeSentDate }, type: "indicative_offer_sent", message: `Unverbindliches Angebot abgegeben am ${formatActivityDate(indicativeSentDate)} erfasst.` },
    offer_accepted: {
      status: "OFFER_ACCEPTED",
      data: {
        offerAcceptedAt: offerAcceptedDate,
        indicativeAcceptedOfferModel: options.acceptedOfferModel,
        indicativeAcceptedOfferId: options.acceptedOfferId,
        indicativeAcceptedOfferModelAt: now,
        indicativeAcceptedOfferModelByUserId: userId,
        ...(options.acceptedOfferModel ? { desiredModel: options.acceptedOfferModel } : {})
      },
      type: "offer_accepted",
      message: acceptedModelLabel
        ? `Kunde hat das unverbindliche Angebot für ${acceptedModelLabel} angenommen.`
        : `Kunde hat das unverbindliche Angebot am ${formatActivityDate(offerAcceptedDate)} angenommen.`
    },
    expert_opinion_ordered: {
      status: "EXPERT_OPINION_ORDERED",
      data: { expertOpinionOrderedAt: expertOrderedDate, expertOpinionCompany: expertCompany },
      type: "expert_opinion_ordered",
      message: "Gutachten wurde als beauftragt markiert."
    },
    expert_opinion_received: { status: "EXPERT_OPINION_RECEIVED", data: { expertOpinionReceivedAt: expertReceivedDate }, type: "expert_opinion_received", message: "Gutachten wurde als eingegangen markiert." },
    binding_offer_sent: { status: "BINDING_OFFER_SENT", data: { bindingOfferSentAt: bindingSentDate }, type: "binding_offer_sent", message: `Verbindliches Angebot abgegeben am ${formatActivityDate(bindingSentDate)} erfasst.` },
    binding_offer_accepted: {
      status: "BINDING_OFFER_ACCEPTED",
      data: {
        bindingOfferAcceptedAt: bindingAcceptedDate,
        bindingAcceptedOfferModel: options.acceptedOfferModel,
        bindingAcceptedOfferId: options.acceptedOfferId,
        bindingAcceptedOfferModelAt: now,
        bindingAcceptedOfferModelByUserId: userId,
        ...(options.acceptedOfferModel ? { desiredModel: options.acceptedOfferModel } : {})
      },
      type: "binding_offer_accepted",
      message: acceptedModelLabel
        ? `Kunde hat das verbindliche Angebot für ${acceptedModelLabel} angenommen.`
        : `Kunde hat das verbindliche Angebot am ${formatActivityDate(bindingAcceptedDate)} angenommen.`
    },
    notary_appointment_ordered: { status: "NOTARY_APPOINTMENT", data: { notaryAppointmentAt: notaryDate, notaryOffice }, type: "notary_appointment_ordered", message: `Notartermin wurde vereinbart${notaryOffice ? `: ${notaryOffice}` : "."}` },
    contract_signed: { status: "IN_PORTFOLIO", data: { purchasedAt: now, portfolioEnteredAt: now }, type: "contract_signed", message: "Kaufvertrag wurde unterschrieben. Die interne Bestandsübernahme wurde vorbereitet." },
    purchase_started: { status: "PURCHASE_STARTED", data: { purchaseStartedAt: now }, type: "purchase_started", message: "Ankaufsprozess wurde gestartet." },
    notary_appointment: { status: "NOTARY_APPOINTMENT", data: { notaryAppointmentAt: now }, type: "notary_appointment", message: "Notartermin wurde vereinbart." },
    purchased: { status: "PURCHASED", data: { purchasedAt: now }, type: "property_purchased", message: "Immobilie wurde angekauft." },
    enter_portfolio: { status: "IN_PORTFOLIO", data: { portfolioEnteredAt: now }, type: "portfolio_entered", message: "Objekt wurde in die Bestandsverwaltung übernommen." }
  }[action];

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: { status: config.status as PropertyStatus, ...config.data }
  });
  await addDbActivity(propertyId, userId, config.type, config.message, {
    source: options.source ?? "admin",
    entityType: "property",
    entityId: propertyId,
    metadata: {
      acceptedOfferModel: options.acceptedOfferModel,
      acceptedOfferId: options.acceptedOfferId,
      acceptedOfferNote: options.acceptedOfferNote
    }
  });
  return property;
}

export async function resetDbAcquisitionWorkflow(
  propertyId: string,
  targetStatus: PropertyStatus,
  userId: string,
  input: { reason: string; note?: string; source?: "admin" | "partner" | "system" | "user" }
) {
  const now = new Date();
  const current = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!current) throw new Error("Property not found");

  const workflowDateKeys = [
    { status: "INDICATIVE_OFFER_SENT", keys: ["indicativeOfferSentAt"] },
    { status: "OFFER_ACCEPTED", keys: ["offerAcceptedAt"] },
    { status: "EXPERT_OPINION_ORDERED", keys: ["expertOpinionOrderedAt", "expertOpinionCompany"] },
    { status: "EXPERT_OPINION_RECEIVED", keys: ["expertOpinionReceivedAt"] },
    { status: "BINDING_OFFER_SENT", keys: ["bindingOfferSentAt"] },
    { status: "BINDING_OFFER_ACCEPTED", keys: ["bindingOfferAcceptedAt"] },
    { status: "PURCHASE_STARTED", keys: ["purchaseStartedAt"] },
    { status: "NOTARY_APPOINTMENT", keys: ["notaryAppointmentAt", "notaryOffice"] },
    { status: "IN_PORTFOLIO", keys: ["purchasedAt", "portfolioEnteredAt"] }
  ] as const;

  const targetIndex = workflowDateKeys.findIndex((item) => item.status === targetStatus);
  const clearData = workflowDateKeys.reduce<Record<string, null>>((data, item, index) => {
    if (targetIndex >= 0 && index <= targetIndex) return data;
    for (const key of item.keys) data[key] = null;
    return data;
  }, {});

  const previousSnapshot = {
    status: current.status,
    indicativeOfferSentAt: current.indicativeOfferSentAt,
    offerAcceptedAt: current.offerAcceptedAt,
    expertOpinionOrderedAt: current.expertOpinionOrderedAt,
    expertOpinionCompany: current.expertOpinionCompany,
    expertOpinionReceivedAt: current.expertOpinionReceivedAt,
    bindingOfferSentAt: current.bindingOfferSentAt,
    bindingOfferAcceptedAt: current.bindingOfferAcceptedAt,
    purchaseStartedAt: current.purchaseStartedAt,
    notaryAppointmentAt: current.notaryAppointmentAt,
    notaryOffice: current.notaryOffice,
    purchasedAt: current.purchasedAt,
    portfolioEnteredAt: current.portfolioEnteredAt
  };

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: {
      status: targetStatus,
      ...clearData,
      lastActivityAt: now,
      lastActivityLabel: "Gerade eben"
    }
  });

  await addDbActivity(
    propertyId,
    userId,
    "workflow_reset",
    `${acquisitionStatusLabel(current.status)} wurde auf ${acquisitionStatusLabel(targetStatus)} zurückgesetzt. Grund: ${input.reason}.`,
    {
      source: input.source ?? "admin",
      entityType: "property",
      entityId: propertyId,
      metadata: {
        previousStatus: current.status,
        targetStatus,
        reason: input.reason,
        note: input.note,
        previousSnapshot,
        resetAt: now.toISOString(),
        visibility: "internal"
      }
    }
  );

  return property;
}

export async function updateDbAcquisitionWorkflowDate(
  propertyId: string,
  action: "indicative_offer_sent" | "offer_accepted" | "expert_opinion_ordered" | "expert_opinion_received" | "binding_offer_sent" | "binding_offer_accepted",
  userId: string,
  options: { indicativeOfferSentAt?: string; offerAcceptedAt?: string; expertOpinionOrderedAt?: string; expertOpinionReceivedAt?: string; expertOpinionCompany?: string; bindingOfferSentAt?: string; bindingOfferAcceptedAt?: string; acceptedOfferModel?: DesiredModel; acceptedOfferId?: string; acceptedOfferNote?: string; source?: "admin" | "partner" | "system" | "user" } = {}
) {
  const now = new Date();
  const dateFrom = (value?: string) => {
    const parsed = value ? new Date(value) : now;
    return Number.isNaN(parsed.getTime()) ? now : parsed;
  };
  const acceptedModelLabel = options.acceptedOfferModel ? offerModelLabel(options.acceptedOfferModel) : undefined;
  const config = {
    indicative_offer_sent: {
      data: { indicativeOfferSentAt: dateFrom(options.indicativeOfferSentAt) },
      type: "indicative_offer_sent",
      message: (date: Date) => `Unverbindliches Angebot abgegeben am ${formatActivityDate(date)} erfasst.`
    },
    offer_accepted: {
      data: {
        offerAcceptedAt: dateFrom(options.offerAcceptedAt),
        indicativeAcceptedOfferModel: options.acceptedOfferModel,
        indicativeAcceptedOfferId: options.acceptedOfferId,
        indicativeAcceptedOfferModelAt: options.acceptedOfferModel ? now : undefined,
        indicativeAcceptedOfferModelByUserId: options.acceptedOfferModel ? userId : undefined,
        ...(options.acceptedOfferModel ? { desiredModel: options.acceptedOfferModel } : {})
      },
      type: "offer_accepted",
      message: (date: Date) => acceptedModelLabel
        ? `Kunde hat das unverbindliche Angebot für ${acceptedModelLabel} angenommen.`
        : `Kunde hat das unverbindliche Angebot am ${formatActivityDate(date)} angenommen.`
    },
    expert_opinion_ordered: {
      data: { expertOpinionOrderedAt: dateFrom(options.expertOpinionOrderedAt), expertOpinionCompany: options.expertOpinionCompany?.trim() },
      type: "expert_opinion_ordered",
      message: () => "Gutachtenbeauftragung gespeichert."
    },
    expert_opinion_received: {
      data: { expertOpinionReceivedAt: dateFrom(options.expertOpinionReceivedAt) },
      type: "expert_opinion_received",
      message: () => "Gutachten wurde als eingegangen markiert."
    },
    binding_offer_sent: {
      data: { bindingOfferSentAt: dateFrom(options.bindingOfferSentAt) },
      type: "binding_offer_sent",
      message: (date: Date) => `Verbindliches Angebot abgegeben am ${formatActivityDate(date)} erfasst.`
    },
    binding_offer_accepted: {
      data: {
        bindingOfferAcceptedAt: dateFrom(options.bindingOfferAcceptedAt),
        bindingAcceptedOfferModel: options.acceptedOfferModel,
        bindingAcceptedOfferId: options.acceptedOfferId,
        bindingAcceptedOfferModelAt: options.acceptedOfferModel ? now : undefined,
        bindingAcceptedOfferModelByUserId: options.acceptedOfferModel ? userId : undefined,
        ...(options.acceptedOfferModel ? { desiredModel: options.acceptedOfferModel } : {})
      },
      type: "binding_offer_accepted",
      message: (date: Date) => acceptedModelLabel
        ? `Kunde hat das verbindliche Angebot für ${acceptedModelLabel} angenommen.`
        : `Kunde hat das verbindliche Angebot am ${formatActivityDate(date)} angenommen.`
    }
  }[action];
  const date = Object.values(config.data).find((value) => value instanceof Date) as Date;
  const property = await prisma.property.update({
    where: { id: propertyId },
    data: config.data
  });
  await addDbActivity(propertyId, userId, config.type, config.message(date), {
    source: options.source ?? "admin",
    entityType: "property",
    entityId: propertyId,
    metadata: {
      action,
      date: date.toISOString(),
      acceptedOfferModel: options.acceptedOfferModel,
      acceptedOfferId: options.acceptedOfferId,
      acceptedOfferNote: options.acceptedOfferNote
    }
  });
  return property;
}

function offerModelLabel(model: DesiredModel): string {
  if (model === "sale_and_leaseback") return "Rückmietverkauf";
  if (model === "fixed_residential_right") return "Wohnrecht";
  return "Nutzungsmodell";
}

function formatActivityDate(value: Date): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

function mapLead(lead: Awaited<ReturnType<typeof prisma.lead.findFirst>>): Lead {
  if (!lead) throw new Error("Lead not found");
  return {
    id: lead.id,
    leadNumber: lead.leadNumber,
    source: lead.source,
    status: lead.status,
    assignedPartnerId: lead.assignedPartnerId ?? undefined,
    assignedAdvisorUserId: lead.assignedAdvisorUserId ?? undefined,
    assignedByUserId: lead.assignedByUserId ?? undefined,
    assignedAt: iso(lead.assignedAt),
    convertedCustomerId: lead.convertedCustomerId ?? undefined,
    convertedPropertyId: lead.convertedPropertyId ?? undefined,
    convertedCaseId: lead.convertedCaseId ?? undefined,
    convertedAt: iso(lead.convertedAt),
    firstName: lead.firstName ?? undefined,
    lastName: lead.lastName ?? undefined,
    name: lead.name ?? undefined,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    mobilePhone: lead.mobilePhone ?? undefined,
    street: lead.street ?? undefined,
    postalCode: lead.postalCode ?? undefined,
    city: lead.city ?? undefined,
    federalState: lead.federalState ?? undefined,
    preferredContactMethod: lead.preferredContactMethod ?? undefined,
    contactConsent: lead.contactConsent ?? undefined,
    propertyStreet: lead.propertyStreet ?? undefined,
    propertyPostalCode: lead.propertyPostalCode ?? undefined,
    propertyCity: lead.propertyCity ?? undefined,
    propertyType: lead.propertyType ?? undefined,
    livingAreaSqm: lead.livingAreaSqm ?? undefined,
    plotAreaSqm: lead.plotAreaSqm ?? undefined,
    yearBuilt: lead.yearBuilt ?? undefined,
    propertyNote: lead.propertyNote ?? undefined,
    estimatedPropertyValueRange: lead.estimatedPropertyValueRange ?? undefined,
    youngestOwnerAgeRange: lead.youngestOwnerAgeRange ?? undefined,
    message: lead.message ?? undefined,
    productInterest: lead.productInterest ?? undefined,
    region: lead.region ?? undefined,
    routingReason: lead.routingReason ?? undefined,
    internalNote: lead.internalNote ?? undefined,
    createdByUserId: lead.createdByUserId ?? undefined,
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
