import type {
  Activity,
  ActivityVersion,
  CaseView,
  Customer,
  Document,
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
    passwordHash: "demo1234",
    role: "admin",
    createdAt: stamp,
    updatedAt: stamp
  },
  {
    id: "user_partner",
    partnerId: "partner_heimwert",
    name: "Mara Seidel",
    email: "makler@demo.local",
    passwordHash: "demo1234",
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
  }
];

const properties: Property[] = [
  {
    id: "property_berlin_1",
    caseNumber: "WK-2026-014",
    objectTitle: "EFH Berlin-Grunewald",
    customerId: "customer_schmidt",
    partnerId: "partner_heimwert",
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
    missingReason: "Energieausweis fehlt noch.",
    createdAt: stamp
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

export const store = {
  partners,
  users,
  customers,
  properties,
  documents,
  valuations,
  offers,
  offerVersions,
  reminders,
  activities,
  activityVersions
};

export function findUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getCases(): CaseView[] {
  return properties.map((property) => {
    const customer = customers.find((item) => item.id === property.customerId);
    const partner = partners.find((item) => item.id === property.partnerId);

    if (!customer || !partner) {
      throw new Error(`Broken case relation for property ${property.id}`);
    }

    return {
      partner,
      customer,
      property,
      documents: documents.filter((item) => item.propertyId === property.id),
      valuation: valuations.find((item) => item.propertyId === property.id),
      offer: offers.find((item) => item.propertyId === property.id),
      activities: activities.filter((item) => item.propertyId === property.id),
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
  const property = properties.find((item) => item.id === propertyId);
  if (!property) {
    throw new Error("Property not found");
  }

  property.status = status;
  property.updatedAt = nowIso();
  return property;
}

export function nextOfferNumber(): string {
  return `ANG-2026-${String(offers.length + 1).padStart(4, "0")}`;
}

export function saveOfferVersion(offer: Offer, createdByUserId?: string): OfferVersion {
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
