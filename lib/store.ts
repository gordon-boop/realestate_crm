import type {
  Activity,
  ActivityVersion,
  CaseView,
  ChatMessage,
  Customer,
  Document,
  Lead,
  Offer,
  OfferVersion,
  Partner,
  Property,
  PropertyStatus,
  Reminder,
  User,
  Valuation
} from "./domain.ts";
import { makeId, nowIso } from "./id.ts";
import { formatAddress, formatStreetAddress, splitStreetAndHouseNumber } from "./address.ts";

const runtimeStoreEnabled = process.env.WK_ENABLE_RUNTIME_STORE === "true";
const demoPasswordHash = "$2b$12$idQ09RAGiZUr50i8zRONNuJf27hemp7bMUNmH2rJsKbme1JTImMH6";
const runtimeStoreDisabledMessage = "Runtime store disabled in production. Set WK_ENABLE_RUNTIME_STORE=true to enable.";

function assertRuntimeStoreEnabled(): void {
  if (!runtimeStoreEnabled) {
    throw new Error(runtimeStoreDisabledMessage);
  }
}

const stamp = nowIso();

const partners: Partner[] = [
  {
    id: "partner_heimwert",
    companyName: "Heimwert Makler GmbH",
    contactName: "Mara Seidel",
    email: "kontakt@heimwert.local",
    phone: "+49 30 123456",
    address: "Friedrichstraße 12, 10117 Berlin",
    status: "active",
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    id: "partner_nord",
    companyName: "Nordlage Immobilien",
    contactName: "Tobias Brandt",
    email: "team@nordlage.local",
    phone: "+49 40 888888",
    address: "Hafenstraße 2, 20457 Hamburg",
    status: "active",
    createdAt: stamp,
    updatedAt: stamp
  }
];

const users: User[] = [
  {
    id: "user_admin",
    name: "Admin Demo",
    email: "admin@demo.local",
    passwordHash: demoPasswordHash,
    role: "admin",
    internalRole: "super_admin",
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    id: "user_partner",
    partnerId: "partner_heimwert",
    name: "Mara Seidel",
    email: "makler@demo.local",
    passwordHash: demoPasswordHash,
    role: "partner",
    createdAt: stamp,
    updatedAt: stamp
  }
];

const customers: Customer[] = [
  {
    id: "customer_schmidt",
    partnerId: "partner_heimwert",
    displayName: "Helga Schmidt",
    firstName: "Helga",
    lastName: "Schmidt",
    ageAtSubmission: 72,
    email: "helga.schmidt@example.com",
    phone: "+49 30 111111",
    street: "Akazienweg 4",
    postalCode: "14193",
    city: "Berlin",
    addressText: "Akazienweg 4, 14193 Berlin",
    consentDataProcessing: true,
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    id: "customer_mayer",
    partnerId: "partner_heimwert",
    displayName: "Renate Mayer",
    firstName: "Renate",
    lastName: "Mayer",
    ageAtSubmission: 76,
    email: "renate.mayer@example.com",
    phone: "+49 711 444555",
    street: "Rosenweg 9",
    postalCode: "70563",
    city: "Stuttgart",
    addressText: "Rosenweg 9, 70563 Stuttgart",
    consentDataProcessing: true,
    createdAt: stamp,
    updatedAt: stamp
  }
];

const properties: Property[] = [
  {
    id: "property_berlin_1",
    caseNumber: "WK-2026-014",
    objectTitle: "EFH Berlin-Grunewald",
    customerId: "customer_schmidt",
    partnerId: "partner_heimwert",
    caseSource: "PARTNER",
    propertyType: "house",
    street: "Akazienweg 4",
    postalCode: "14193",
    city: "Berlin",
    livingAreaSqm: 148,
    plotAreaSqm: 520,
    yearBuilt: 1984,
    condition: "good",
    occupancyStatus: "owner_occupied",
    desiredModel: "fixed_residential_right",
    preferredValuationProvider: "sprengnetter",
    desiredResidentialRightYears: 10,
    leasehold: false,
    monumentProtection: false,
    followUpRequired: true,
    followUpReason: "Kunde soll fehlende Rückmeldung zu Grundbuch und Befristungsgrund liefern.",
    followUpDueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityLabel: "Heute, 09:14",
    lastActivityAt: stamp,
    notes: "Eigentümerin wünscht schnelle indikative Rückmeldung.",
    status: "INTERNAL_REVIEW",
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    id: "property_stuttgart_portfolio_1",
    caseNumber: "WK-2026-008",
    objectTitle: "ETW Stuttgart-Vaihingen",
    customerId: "customer_mayer",
    partnerId: "partner_heimwert",
    caseSource: "PARTNER",
    propertyType: "apartment",
    street: "Rosenweg 9",
    postalCode: "70563",
    city: "Stuttgart",
    livingAreaSqm: 86,
    plotAreaSqm: 0,
    yearBuilt: 1992,
    condition: "good",
    occupancyStatus: "owner_occupied",
    desiredModel: "sale_and_leaseback",
    preferredValuationProvider: "sprengnetter",
    desiredResidentialRightYears: 10,
    offerAcceptedAt: stamp,
    purchaseStartedAt: stamp,
    notaryAppointmentAt: stamp,
    purchasedAt: stamp,
    portfolioEnteredAt: stamp,
    offerCalculationSource: "application",
    lastActivityLabel: "Vor 12 Tagen",
    lastActivityAt: stamp,
    notes: "Demo-Bestandsobjekt nach abgeschlossenem Ankauf.",
    status: "IN_PORTFOLIO",
    createdAt: stamp,
    updatedAt: stamp
  }
];

const documents: Document[] = [
  {
    id: "doc_photo_1",
    propertyId: "property_berlin_1",
    customerId: "customer_schmidt",
    uploadedByUserId: "user_partner",
    fileName: "außenansicht.jpg",
    displayName: "Fotos außen (1)",
    fileType: "image/jpeg",
    storageUrl: "/mock-storage/außenansicht.jpg",
    category: "photos",
    requirementLevel: "recommended",
    status: "ok",
    scanStatus: "clean",
    currentVersion: 1,
    createdAt: stamp
  },
  {
    id: "doc_energy_missing",
    propertyId: "property_berlin_1",
    customerId: "customer_schmidt",
    uploadedByUserId: "user_partner",
    fileName: "Energieausweis",
    displayName: "Energieausweis",
    fileType: "application/pdf",
    storageUrl: "",
    category: "energy_certificate",
    requirementLevel: "required",
    status: "missing",
    scanStatus: "pending",
    currentVersion: 1,
    missingReason: "Energieausweis fehlt noch.",
    createdAt: stamp
  }
];

const leads: Lead[] = [
  {
    id: "lead_homepage_1",
    leadNumber: "LD-2026-001",
    source: "homepage",
    status: "NEW",
    name: "Maria Müller",
    email: "maria.mueller@example.com",
    phone: "+49 711 222333",
    postalCode: "70563",
    city: "Stuttgart",
    propertyType: "single_family",
    estimatedPropertyValueRange: "500-800",
    youngestOwnerAgeRange: "70-74",
    productInterest: "fixed_residential_right",
    message: "Homepage-Anfrage aus der Ersteinschätzung.",
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    id: "lead_assigned_1",
    leadNumber: "LD-2026-002",
    source: "homepage",
    status: "ASSIGNED",
    assignedPartnerId: "partner_heimwert",
    assignedByUserId: "user_admin",
    assignedAt: stamp,
    name: "Karl Weber",
    phone: "+49 30 555555",
    postalCode: "14193",
    city: "Berlin",
    propertyType: "apartment",
    estimatedPropertyValueRange: "300-500",
    youngestOwnerAgeRange: "75-79",
    productInterest: "fixed_residential_right",
    message: "Bitte Kontakt aufnehmen und Beratungsbedarf klären.",
    createdAt: stamp,
    updatedAt: stamp
  }
];

const valuations: Valuation[] = [
  {
    id: "valuation_berlin_1",
    propertyId: "property_berlin_1",
    provider: "sprengnetter",
    status: "completed",
    sourceLabel: "Sprengnetter-Stub",
    marketValue: 638000,
    valueMin: 574200,
    valueMax: 701800,
    confidenceScore: 0.72,
    rawResponseJson: { source: "sprengnetter_stub", basePerSqm: 4200 },
    startedAt: stamp,
    completedAt: stamp,
    createdAt: stamp
  }
];

const offers: Offer[] = [
  {
    id: "offer_berlin_1",
    propertyId: "property_berlin_1",
    valuationId: "valuation_berlin_1",
    offerNumber: "ANG-2026-0001",
    kind: "indicative",
    currentVersion: 1,
    marketValue: 638000,
    adjustedMarketValue: 625240,
    residentialRightValue: 175067.2,
    riskDiscount: 31262,
    companyMargin: 43766.8,
    payoutAmount: 375144,
    model: "fixed_residential_right",
    residentialRightYears: 10,
    assumptions: {
      conditionDiscountRate: 0.02,
      residentialRightRate: 0.28,
      riskDiscountRate: 0.05,
      companyMarginRate: 0.07,
      formula: "payout = adjusted_market_value - residential_right_value - risk_discount - company_margin",
      note: "MVP-Platzhalter."
    },
    aiCustomerText: "ENTWURF: Auf Basis der vorliegenden Daten ergibt sich ein indikatives Angebot.",
    aiPartnerSummary: "ENTWURF: Fall ist bereit für interne Prüfung.",
    aiInternalRationale: "ENTWURF: Berechnung folgt der MVP-Formel.",
    bindingOfferText: "Noch kein verbindliches Angebot erstellt.",
    status: "review",
    createdAt: stamp,
    updatedAt: stamp
  }
];

const offerVersions: OfferVersion[] = [
  {
    id: "offerversion_berlin_1_1",
    offerId: "offer_berlin_1",
    version: 1,
    snapshot: offers[0],
    createdAt: stamp
  }
];

const reminders: Reminder[] = [
  {
    id: "reminder_energy_1",
    propertyId: "property_berlin_1",
    assignedToUserId: "user_partner",
    createdByUserId: "user_admin",
    reason: "Energieausweis und Hausgeldabrechnung 2024 fehlen.",
    status: "open",
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    lastReminderAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: stamp,
    updatedAt: stamp
  }
];

const activities: Activity[] = [
  {
    id: "activity_seed_1",
    propertyId: "property_berlin_1",
    userId: "user_partner",
    type: "case_created",
    message: "Fall wurde durch Partner angelegt.",
    version: 1,
    source: "partner",
    entityType: "property",
    entityId: "property_berlin_1",
    createdAt: stamp
  },
  {
    id: "activity_seed_2",
    propertyId: "property_berlin_1",
    userId: "user_admin",
    type: "follow_up_required",
    message: "Rückfrage an Benutzer: fehlende Kundenrückmeldung einholen.",
    version: 1,
    source: "admin",
    entityType: "reminder",
    entityId: "reminder_energy_1",
    createdAt: stamp
  }
];

const activityVersions: ActivityVersion[] = activities.map((activity) => ({
  id: makeId("acv"),
  activityId: activity.id,
  version: activity.version,
  snapshot: structuredClone(activity),
  createdByUserId: activity.userId,
  createdAt: activity.createdAt
}));

const chatMessages: ChatMessage[] = [
  {
    id: "chat_seed_1",
    propertyId: "property_berlin_1",
    userId: "user_admin",
    userName: "Anna Klein",
    userRole: "admin",
    message: "Bitte beim Kunden noch den Energieausweis anfordern.",
    source: "admin",
    visibility: "shared",
    createdAt: stamp
  },
  {
    id: "chat_seed_2",
    propertyId: "property_berlin_1",
    userId: "user_partner",
    userName: "Markus Krüger",
    userRole: "partner",
    message: "Ich frage heute nach und lade die Unterlage nach.",
    source: "partner",
    visibility: "shared",
    createdAt: stamp
  }
];

export const store = {
  partners: runtimeStoreEnabled ? partners : [],
  users: runtimeStoreEnabled ? users : [],
  customers: runtimeStoreEnabled ? customers : [],
  properties: runtimeStoreEnabled ? properties : [],
  documents: runtimeStoreEnabled ? documents : [],
  leads: runtimeStoreEnabled ? leads : [],
  valuations: runtimeStoreEnabled ? valuations : [],
  offers: runtimeStoreEnabled ? offers : [],
  offerVersions: runtimeStoreEnabled ? offerVersions : [],
  reminders: runtimeStoreEnabled ? reminders : [],
  activities: runtimeStoreEnabled ? activities : [],
  activityVersions: runtimeStoreEnabled ? activityVersions : [],
  chatMessages: runtimeStoreEnabled ? chatMessages : []
};

export function findUserByEmail(email: string): User | undefined {
  if (!runtimeStoreEnabled) return undefined;
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  if (!runtimeStoreEnabled) return undefined;
  return users.find((user) => user.id === id);
}

export function upsertRuntimeUser(user: User): User {
  assertRuntimeStoreEnabled();
  const existingIndex = users.findIndex((item) => item.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
    return users[existingIndex];
  }
  users.push(user);
  return user;
}

export function getCases(): CaseView[] {
  if (!runtimeStoreEnabled) return [];
  return properties.map((property) => {
    const customer = customers.find((item) => item.id === property.customerId);
    const partner = partners.find((item) => item.id === property.partnerId);

    if (!customer || !partner) {
      throw new Error(`Broken case relation for property ${property.id}`);
    }

    const propertyOffers = offers
      .filter((item) => item.propertyId === property.id)
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

    return {
      partner,
      customer,
      property,
      documents: documents.filter((item) => item.propertyId === property.id),
      valuation: valuations.find((item) => item.propertyId === property.id),
      offer: propertyOffers[0],
      offers: propertyOffers,
      activities: activities.filter((item) => item.propertyId === property.id),
      objectRatings: [],
      chatMessages: chatMessages.filter((item) => item.propertyId === property.id),
      reminders: reminders.filter((item) => item.propertyId === property.id)
    };
  });
}

export function getCaseByPropertyId(propertyId: string): CaseView | undefined {
  return getCases().find((item) => item.property.id === propertyId);
}

export function addActivity(
  propertyId: string,
  userId: string,
  type: string,
  message: string,
  options: Partial<Pick<Activity, "source" | "entityType" | "entityId" | "metadata" | "previousActivityId">> = {}
): Activity {
  assertRuntimeStoreEnabled();
  const activity: Activity = {
    id: makeId("act"),
    propertyId,
    userId,
    type,
    message,
    version: 1,
    source: options.source ?? "user",
    entityType: options.entityType,
    entityId: options.entityId,
    metadata: options.metadata,
    previousActivityId: options.previousActivityId,
    createdAt: nowIso()
  };
  activities.unshift(activity);
  saveActivityVersion(activity, userId);
  const property = properties.find((item) => item.id === propertyId);
  if (property) {
    property.lastActivityAt = activity.createdAt;
    property.lastActivityLabel = "Gerade eben";
  }
  return activity;
}

export function updatePropertyStatus(propertyId: string, status: PropertyStatus): Property {
  assertRuntimeStoreEnabled();
  const property = properties.find((item) => item.id === propertyId);
  if (!property) {
    throw new Error("Property not found");
  }

  property.status = status;
  property.updatedAt = nowIso();
  return property;
}

export function advanceAcquisitionWorkflow(
  propertyId: string,
  action: "indicative_offer_sent" | "offer_accepted" | "expert_opinion_ordered" | "expert_opinion_received" | "binding_offer_sent" | "binding_offer_accepted" | "notary_appointment_ordered" | "contract_signed" | "purchase_started" | "notary_appointment" | "purchased" | "enter_portfolio",
  userId: string,
  options: { expertOpinionOrderedAt?: string; expertOpinionReceivedAt?: string; expertOpinionCompany?: string; notaryAppointmentAt?: string; notaryOffice?: string } = {}
): Property {
  assertRuntimeStoreEnabled();
  const property = properties.find((item) => item.id === propertyId);
  if (!property) {
    throw new Error("Property not found");
  }

  const now = nowIso();
  const expertOrderedAt = options.expertOpinionOrderedAt || now;
  const expertReceivedAt = options.expertOpinionReceivedAt || now;
  const notaryAt = options.notaryAppointmentAt || now;
  const expertCompany = options.expertOpinionCompany?.trim();
  const notaryOffice = options.notaryOffice?.trim();
  const config = {
    indicative_offer_sent: {
      status: "INDICATIVE_OFFER_SENT" as const,
      data: { indicativeOfferSentAt: now },
      type: "indicative_offer_sent",
      message: "Unverbindliches Angebot (UVA) wurde abgegeben."
    },
    offer_accepted: {
      status: "OFFER_ACCEPTED" as const,
      data: { offerAcceptedAt: now },
      type: "offer_accepted",
      message: "Unverbindliches Angebot (UVA) wurde angenommen."
    },
    expert_opinion_ordered: {
      status: "EXPERT_OPINION_ORDERED" as const,
      data: { expertOpinionOrderedAt: expertOrderedAt, expertOpinionCompany: expertCompany },
      type: "expert_opinion_ordered",
      message: `Gutachten wurde beauftragt${expertCompany ? `: ${expertCompany}` : "."}`
    },
    expert_opinion_received: {
      status: "EXPERT_OPINION_RECEIVED" as const,
      data: { expertOpinionReceivedAt: expertReceivedAt },
      type: "expert_opinion_received",
      message: "Gutachten ist eingegangen."
    },
    binding_offer_sent: {
      status: "BINDING_OFFER_SENT" as const,
      data: { bindingOfferSentAt: now },
      type: "binding_offer_sent",
      message: "Verbindliches Angebot (VA) wurde abgegeben."
    },
    binding_offer_accepted: {
      status: "BINDING_OFFER_ACCEPTED" as const,
      data: { bindingOfferAcceptedAt: now },
      type: "binding_offer_accepted",
      message: "Verbindliches Angebot (VA) wurde angenommen."
    },
    notary_appointment_ordered: {
      status: "NOTARY_APPOINTMENT" as const,
      data: { notaryAppointmentAt: notaryAt, notaryOffice },
      type: "notary_appointment_ordered",
      message: `Notartermin wurde vereinbart${notaryOffice ? `: ${notaryOffice}` : "."}`
    },
    contract_signed: {
      status: "IN_PORTFOLIO" as const,
      data: { purchasedAt: now, portfolioEnteredAt: now },
      type: "contract_signed",
      message: "Kaufvertrag wurde unterschrieben. Die interne Bestandsübernahme wurde vorbereitet."
    },
    purchase_started: {
      status: "PURCHASE_STARTED" as const,
      data: { purchaseStartedAt: now },
      type: "purchase_started",
      message: "Ankaufsprozess wurde gestartet."
    },
    notary_appointment: {
      status: "NOTARY_APPOINTMENT" as const,
      data: { notaryAppointmentAt: now },
      type: "notary_appointment",
      message: "Notartermin wurde vereinbart."
    },
    purchased: {
      status: "PURCHASED" as const,
      data: { purchasedAt: now },
      type: "property_purchased",
      message: "Immobilie wurde angekauft."
    },
    enter_portfolio: {
      status: "IN_PORTFOLIO" as const,
      data: { portfolioEnteredAt: now },
      type: "portfolio_entered",
      message: "Objekt wurde in die Bestandsverwaltung übernommen."
    }
  }[action];

  property.status = config.status;
  Object.assign(property, config.data);
  property.updatedAt = now;
  addActivity(property.id, userId, config.type, config.message, {
    source: "admin",
    entityType: "property",
    entityId: property.id
  });
  return property;
}

export function nextOfferNumber(): string {
  assertRuntimeStoreEnabled();
  return `ANG-2026-${String(offers.length + 1).padStart(4, "0")}`;
}

export function nextLeadNumber(): string {
  assertRuntimeStoreEnabled();
  return `LD-2026-${String(leads.length + 1).padStart(3, "0")}`;
}

export function nextCaseNumber(): string {
  assertRuntimeStoreEnabled();
  return `WK-2026-${String(properties.length + 15).padStart(3, "0")}`;
}

function splitLeadName(lead: Lead): { firstName: string; lastName: string; displayName: string } {
  const displayName = [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() || lead.name?.trim() || "Lead ohne Namen";
  if (lead.firstName || lead.lastName) {
    return {
      firstName: lead.firstName || "Unbekannt",
      lastName: lead.lastName || "Lead",
      displayName
    };
  }

  const parts = displayName.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Unbekannt",
    lastName: parts.slice(1).join(" ") || "Lead",
    displayName
  };
}

export function convertLeadToCase(leadId: string, partnerId: string, userId: string): CaseView {
  assertRuntimeStoreEnabled();
  const lead = leads.find((item) => item.id === leadId);
  if (!lead) throw new Error("Lead not found");
  if (lead.status === "CONVERTED") throw new Error("Lead already converted");
  if (lead.assignedPartnerId !== partnerId) throw new Error("Forbidden");

  const now = nowIso();
  const name = splitLeadName(lead);
  const customerAddress = splitStreetAndHouseNumber(lead.street, lead.houseNumber);
  const customer: Customer = {
    id: makeId("cus"),
    partnerId,
    displayName: name.displayName,
    firstName: name.firstName,
    lastName: name.lastName,
    email: lead.email,
    phone: lead.phone,
    street: customerAddress.street || undefined,
    houseNumber: customerAddress.houseNumber || undefined,
    postalCode: lead.postalCode,
    city: lead.city,
    addressText: formatAddress({ ...customerAddress, postalCode: lead.postalCode, city: lead.city }),
    consentDataProcessing: true,
    createdAt: now,
    updatedAt: now
  };

  const property: Property = {
    id: makeId("pro"),
    caseNumber: nextCaseNumber(),
    objectTitle: `${propertyTypeToTitle(lead.propertyType)} ${lead.city || "Ort offen"}`,
    customerId: customer.id,
    partnerId,
    caseSource: "PARTNER",
    propertyType: lead.propertyType || "single_family",
    street: lead.propertyStreet || formatStreetAddress(customerAddress) || "Noch offen",
    postalCode: lead.postalCode || "00000",
    city: lead.city || "Ort offen",
    livingAreaSqm: 1,
    plotAreaSqm: 0,
    condition: "average",
    desiredModel: lead.productInterest || "fixed_residential_right",
    preferredValuationProvider: "sprengnetter",
    offerCalculationSource: "application",
    notes: lead.message ? `Aus Homepage-Lead übernommen: ${lead.message}` : "Aus Homepage-Lead übernommen.",
    status: "DRAFT",
    createdAt: now,
    updatedAt: now
  };

  customers.push(customer);
  properties.push(property);

  lead.status = "CONVERTED";
  lead.assignedPartnerId = partnerId;
  lead.convertedCustomerId = customer.id;
  lead.convertedPropertyId = property.id;
  lead.convertedAt = now;
  lead.updatedAt = now;

  addActivity(property.id, userId, "lead_converted", `Lead ${lead.leadNumber} wurde in einen Kundenfall umgewandelt.`, {
    source: "partner",
    entityType: "lead",
    entityId: lead.id
  });

  const convertedCase = getCaseByPropertyId(property.id);
  if (!convertedCase) throw new Error("Converted case not found");
  return convertedCase;
}

function propertyTypeToTitle(type?: Lead["propertyType"]): string {
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

export function saveOfferVersion(offer: Offer, createdByUserId?: string): OfferVersion {
  assertRuntimeStoreEnabled();
  const version: OfferVersion = {
    id: makeId("ofv"),
    offerId: offer.id,
    version: offer.currentVersion,
    snapshot: structuredClone(offer),
    createdByUserId,
    createdAt: nowIso()
  };
  offerVersions.push(version);
  return version;
}

export function saveActivityVersion(activity: Activity, createdByUserId?: string): ActivityVersion {
  assertRuntimeStoreEnabled();
  const version: ActivityVersion = {
    id: makeId("acv"),
    activityId: activity.id,
    version: activity.version,
    snapshot: structuredClone(activity),
    createdByUserId,
    createdAt: nowIso()
  };
  activityVersions.push(version);
  return version;
}

export function createReminder(input: {
  propertyId: string;
  createdByUserId: string;
  assignedToUserId?: string;
  reason: string;
  dueAt: string;
}): Reminder {
  assertRuntimeStoreEnabled();
  const now = nowIso();
  const reminder: Reminder = {
    id: makeId("rem"),
    propertyId: input.propertyId,
    assignedToUserId: input.assignedToUserId,
    createdByUserId: input.createdByUserId,
    reason: input.reason,
    status: "open",
    dueAt: input.dueAt,
    lastReminderAt: now,
    createdAt: now,
    updatedAt: now
  };
  reminders.unshift(reminder);
  addActivity(input.propertyId, input.createdByUserId, "reminder_created", input.reason, {
    source: "admin",
    entityType: "reminder",
    entityId: reminder.id
  });
  return reminder;
}

export function completeOpenReminders(propertyId: string, completedByUserId: string): Reminder[] {
  assertRuntimeStoreEnabled();
  const now = nowIso();
  const completed = reminders.filter((item) => item.propertyId === propertyId && item.status === "open");
  completed.forEach((reminder) => {
    reminder.status = "done";
    reminder.completedByUserId = completedByUserId;
    reminder.completedAt = now;
    reminder.updatedAt = now;
  });
  return completed;
}
