import {
  DesiredModel,
  DocumentCategory,
  DocumentRequirementLevel,
  DocumentStatus,
  LeadSource,
  LeadStatus,
  OfferKind,
  OfferStatus,
  PartnerStatus,
  Prisma,
  PrismaClient,
  PropertyCondition,
  PropertyStatus,
  PropertyType,
  RatingSourceType,
  ReminderStatus,
  InternalUserRole,
  UserRole,
  ValuationProvider,
  ValuationStatus
} from "@prisma/client";
import { hashPassword } from "../lib/password.ts";

const prisma = new PrismaClient();

async function main() {
  const demoPasswordHash = await hashPassword("demo1234");

  await prisma.$executeRawUnsafe(`
    UPDATE "partners"
    SET "id" = 'partner_heimwert'
    WHERE "email" = 'kontakt@heimwert.local'
      AND "id" <> 'partner_heimwert'
      AND NOT EXISTS (SELECT 1 FROM "partners" WHERE "id" = 'partner_heimwert')
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "partners"
    SET "id" = 'partner_nord'
    WHERE "email" = 'team@nordlage.local'
      AND "id" <> 'partner_nord'
      AND NOT EXISTS (SELECT 1 FROM "partners" WHERE "id" = 'partner_nord')
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "users"
    SET "id" = 'user_admin'
    WHERE "email" = 'admin@demo.local'
      AND "id" <> 'user_admin'
      AND NOT EXISTS (SELECT 1 FROM "users" WHERE "id" = 'user_admin')
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "users"
    SET "id" = 'user_partner'
    WHERE "email" = 'makler@demo.local'
      AND "id" <> 'user_partner'
      AND NOT EXISTS (SELECT 1 FROM "users" WHERE "id" = 'user_partner')
  `);

  const partner = await prisma.partner.upsert({
    where: { email: "kontakt@heimwert.local" },
    update: {
      companyName: "Heimwert Makler GmbH",
      contactName: "Mara Seidel",
      status: PartnerStatus.active
    },
    create: {
      id: "partner_heimwert",
      companyName: "Heimwert Makler GmbH",
      contactName: "Mara Seidel",
      email: "kontakt@heimwert.local",
      phone: "+49 30 123456",
      address: "Friedrichstrasse 12, 10117 Berlin",
      status: PartnerStatus.active
    }
  });

  await prisma.partner.upsert({
    where: { email: "team@nordlage.local" },
    update: { status: PartnerStatus.active },
    create: {
      id: "partner_nord",
      companyName: "Nordlage Immobilien",
      contactName: "Tobias Brandt",
      email: "team@nordlage.local",
      phone: "+49 40 888888",
      address: "Hafenstrasse 2, 20457 Hamburg",
      status: PartnerStatus.active
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    update: { name: "Admin Demo", passwordHash: demoPasswordHash, role: UserRole.admin, internalRole: InternalUserRole.super_admin },
    create: {
      id: "user_admin",
      name: "Admin Demo",
      email: "admin@demo.local",
      passwordHash: demoPasswordHash,
      role: UserRole.admin,
      internalRole: InternalUserRole.super_admin
    }
  });

  await prisma.user.upsert({
    where: { email: "mitarbeiter@demo.local" },
    update: { name: "Mitarbeiter Demo", passwordHash: demoPasswordHash, role: UserRole.admin, internalRole: InternalUserRole.employee },
    create: {
      id: "user_employee",
      name: "Mitarbeiter Demo",
      email: "mitarbeiter@demo.local",
      passwordHash: demoPasswordHash,
      role: UserRole.admin,
      internalRole: InternalUserRole.employee
    }
  });

  await prisma.user.upsert({
    where: { email: "berater@demo.local" },
    update: { name: "Kundenberater Demo", passwordHash: demoPasswordHash, role: UserRole.admin, internalRole: InternalUserRole.advisor },
    create: {
      id: "user_advisor",
      name: "Kundenberater Demo",
      email: "berater@demo.local",
      passwordHash: demoPasswordHash,
      role: UserRole.admin,
      internalRole: InternalUserRole.advisor
    }
  });

  const partnerUser = await prisma.user.upsert({
    where: { email: "makler@demo.local" },
    update: { partnerId: partner.id, name: "Mara Seidel", passwordHash: demoPasswordHash, role: UserRole.partner },
    create: {
      id: "user_partner",
      partnerId: partner.id,
      name: "Mara Seidel",
      email: "makler@demo.local",
      passwordHash: demoPasswordHash,
      role: UserRole.partner
    }
  });

  const customer = await prisma.customer.upsert({
    where: { id: "customer_schmidt" },
    update: {},
    create: {
      id: "customer_schmidt",
      partnerId: partner.id,
      displayName: "Eva Schmidt",
      firstName: "Eva",
      lastName: "Schmidt",
      ageAtSubmission: 72,
      gender: "female",
      email: "eva.schmidt@example.com",
      phone: "+49 711 234567",
      mobile: "+49 172 1234567",
      dateOfBirth: new Date("1953-03-12"),
      maritalStatus: "widowed",
      monthlyIncomeRange: "from_1000_to_2000",
      street: "Hauptstrasse 14",
      postalCode: "70563",
      city: "Stuttgart",
      addressText: "Hauptstrasse 14, 70563 Stuttgart",
      consentDataProcessing: true
    }
  });

  const property = await prisma.property.upsert({
    where: { caseNumber: "WK-2026-014" },
    update: {},
    create: {
      id: "property_berlin_1",
      caseNumber: "WK-2026-014",
      objectTitle: "EFH Stuttgart-Vaihingen",
      customerId: customer.id,
      partnerId: partner.id,
      propertyType: PropertyType.single_family,
      street: "Hauptstrasse 14",
      postalCode: "70563",
      city: "Stuttgart",
      livingAreaSqm: 142,
      plotAreaSqm: 380,
      yearBuilt: 1978,
      condition: PropertyCondition.good,
      occupancyStatus: "owner_occupied",
      desiredModel: DesiredModel.fixed_residential_right,
      preferredValuationProvider: ValuationProvider.sprengnetter,
      residentialRightRecipients: "one_person",
      desiredResidentialRightYears: 10,
      secondResidentialRightWanted: true,
      secondResidentialRightYears: 5,
      fixedTermReason: "Familienplanung",
      rentalOptionDeselected: false,
      usableAreaSqm: 28,
      parkingAvailable: true,
      parkingType: "garage",
      parkingCount: 1,
      basementType: "full",
      heatingType: "Gas-Brennwert",
      heatingYear: 2015,
      energyCertificateAvailable: false,
      energyClass: "D",
      visualConditionRating: "good",
      knownMajorMaintenanceOrSpecialAssessments: true,
      knownMajorMaintenanceOrSpecialAssessmentsDescription: "Energieausweis und Hausgeldabrechnung 2024 werden noch nachgereicht; keine Sonderumlage bestätigt.",
      moistureDamageStatus: "NONE",
      accessibilityAssessment: "PARTIALLY_RESTRICTED",
      hasElevator: null,
      leaseholdOrMonument: false,
      leasehold: false,
      monumentProtection: false,
      followUpRequired: true,
      followUpReason: "Energieausweis und Hausgeldabrechnung 2024 fehlen.",
      followUpDueAt: new Date("2026-05-21T09:00:00.000Z"),
      lastActivityLabel: "Heute, 09:14",
      lastActivityAt: new Date("2026-05-20T07:14:00.000Z"),
      offerCalculationSource: "application",
      status: PropertyStatus.DATA_INCOMPLETE
    }
  });

  await prisma.document.upsert({
    where: { id: "seed_doc_energy_missing" },
    update: {},
    create: {
      id: "seed_doc_energy_missing",
      propertyId: property.id,
      customerId: customer.id,
      uploadedByUserId: partnerUser.id,
      fileName: "Energieausweis",
      displayName: "Energieausweis",
      fileType: "application/pdf",
      storageUrl: "",
      category: DocumentCategory.energy_certificate,
      requirementLevel: DocumentRequirementLevel.required,
      status: DocumentStatus.missing,
      missingReason: "Dokument fehlt noch."
    }
  });

  const valuation = await prisma.valuation.upsert({
    where: { id: "seed_valuation_stuttgart_1" },
    update: {},
    create: {
      id: "seed_valuation_stuttgart_1",
      propertyId: property.id,
      provider: ValuationProvider.sprengnetter,
      status: ValuationStatus.completed,
      sourceLabel: "Sprengnetter-Stub",
      marketValue: 638000,
      valueMin: 574200,
      valueMax: 701800,
      confidenceScore: 0.72,
      rawResponseJson: { source: "sprengnetter_stub" },
      startedAt: new Date(),
      completedAt: new Date()
    }
  });

  await prisma.offer.upsert({
    where: { offerNumber: "ANG-2026-0001" },
    update: {},
    create: {
      propertyId: property.id,
      valuationId: valuation.id,
      offerNumber: "ANG-2026-0001",
      kind: OfferKind.indicative,
      currentVersion: 1,
      marketValue: 638000,
      adjustedMarketValue: 625240,
      residentialRightValue: 175067.2,
      riskDiscount: 31262,
      companyMargin: 43766.8,
      payoutAmount: 375144,
      model: DesiredModel.fixed_residential_right,
      residentialRightYears: 10,
      assumptionsJson: { formula: "MVP calculation" },
      aiCustomerText: "ENTWURF: Auf Basis der vorliegenden Daten ergibt sich ein indikatives Angebot.",
      aiPartnerSummary: "ENTWURF: Fall ist bereit für interne Prüfung.",
      aiInternalRationale: "ENTWURF: Die KI hat keine Zahlen verändert.",
      bindingOfferText: "Noch kein verbindliches Angebot erstellt.",
      status: OfferStatus.review
    }
  });

  const reminder = await prisma.reminder.upsert({
    where: { id: "seed_reminder_energy_1" },
    update: {},
    create: {
      id: "seed_reminder_energy_1",
      propertyId: property.id,
      assignedToUserId: partnerUser.id,
      createdByUserId: admin.id,
      reason: "Energieausweis und Hausgeldabrechnung 2024 fehlen.",
      status: ReminderStatus.open,
      dueAt: new Date("2026-05-21T09:00:00.000Z"),
      lastReminderAt: new Date("2026-05-19T09:00:00.000Z")
    }
  });

  await prisma.activity.upsert({
    where: { id: "seed_activity_reminder_1" },
    update: {},
    create: {
      id: "seed_activity_reminder_1",
      propertyId: property.id,
      userId: admin.id,
      type: "follow_up_required",
      message: "Rückfrage angefordert: Energieausweis",
      source: "admin",
      entityType: "reminder",
      entityId: reminder.id,
      metadataJson: { dueAt: "2026-05-21" }
    }
  });

  const portfolioCustomer = await prisma.customer.upsert({
    where: { id: "customer_mayer" },
    update: {},
    create: {
      id: "customer_mayer",
      partnerId: partner.id,
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
      consentDataProcessing: true
    }
  });

  await prisma.property.upsert({
    where: { caseNumber: "WK-2026-008" },
    update: {},
    create: {
      id: "property_stuttgart_portfolio_1",
      caseNumber: "WK-2026-008",
      objectTitle: "ETW Stuttgart-Vaihingen",
      customerId: portfolioCustomer.id,
      partnerId: partner.id,
      propertyType: PropertyType.apartment,
      street: "Rosenweg 9",
      postalCode: "70563",
      city: "Stuttgart",
      livingAreaSqm: 86,
      plotAreaSqm: 0,
      yearBuilt: 1992,
      condition: PropertyCondition.good,
      occupancyStatus: "owner_occupied",
      desiredModel: DesiredModel.sale_and_leaseback,
      preferredValuationProvider: ValuationProvider.sprengnetter,
      desiredResidentialRightYears: 10,
      offerAcceptedAt: new Date("2026-05-01T10:00:00.000Z"),
      purchaseStartedAt: new Date("2026-05-03T10:00:00.000Z"),
      notaryAppointmentAt: new Date("2026-05-10T10:00:00.000Z"),
      purchasedAt: new Date("2026-05-14T10:00:00.000Z"),
      portfolioEnteredAt: new Date("2026-05-15T10:00:00.000Z"),
      purchaseContractNumber: "KV-2026-008",
      purchaseContractSignedAt: new Date("2026-05-14T10:00:00.000Z"),
      purchasePrice: 425000,
      payoutPaidAt: new Date("2026-05-17T10:00:00.000Z"),
      ownershipTransferAt: new Date("2026-06-01T10:00:00.000Z"),
      landRegisterEntryAt: new Date("2026-06-12T10:00:00.000Z"),
      monthlyRent: 1650,
      rentStartAt: new Date("2026-06-01T10:00:00.000Z"),
      rentDeposit: 3300,
      maintenancePlanJson: {
        nextReviewDate: "2026-11-15",
        responsible: "Asset Management",
        annualBudget: 2500,
        notes: "Wohnung jährlich prüfen, Hausgeldabrechnung nachreichen."
      },
      portfolioTasksJson: {
        nextAppointmentDate: "2026-11-15",
        nextAppointmentType: "Objektprüfung",
        nextAppointmentNote: "Vor-Ort-Termin mit Bewohnerin abstimmen."
      },
      portfolioNotes: "Mietvertrag und Bestandsübernahme im MVP dokumentiert.",
      offerCalculationSource: "application",
      lastActivityLabel: "Vor 12 Tagen",
      lastActivityAt: new Date("2026-05-15T10:00:00.000Z"),
      notes: "Demo-Bestandsobjekt nach abgeschlossenem Ankauf.",
      status: PropertyStatus.IN_PORTFOLIO
    }
  });

  await prisma.lead.upsert({
    where: { leadNumber: "LD-2026-001" },
    update: {},
    create: {
      id: "lead_homepage_1",
      leadNumber: "LD-2026-001",
      source: LeadSource.homepage,
      status: LeadStatus.NEW,
      name: "Maria Müller",
      email: "maria.mueller@example.com",
      phone: "+49 711 222333",
      postalCode: "70563",
      city: "Stuttgart",
      propertyType: PropertyType.single_family,
      estimatedPropertyValueRange: "500-800",
      youngestOwnerAgeRange: "70-74",
      productInterest: DesiredModel.fixed_residential_right,
      message: "Homepage-Anfrage aus der Ersteinschätzung."
    }
  });

  await prisma.lead.upsert({
    where: { leadNumber: "LD-2026-002" },
    update: {},
    create: {
      id: "lead_assigned_1",
      leadNumber: "LD-2026-002",
      source: LeadSource.homepage,
      status: LeadStatus.ASSIGNED,
      assignedPartnerId: partner.id,
      assignedByUserId: admin.id,
      assignedAt: new Date(),
      name: "Karl Weber",
      phone: "+49 30 555555",
      postalCode: "14193",
      city: "Berlin",
      propertyType: PropertyType.apartment,
      estimatedPropertyValueRange: "300-500",
      youngestOwnerAgeRange: "75-79",
      productInterest: DesiredModel.fixed_residential_right,
      message: "Bitte Kontakt aufnehmen und Beratungsbedarf klären."
    }
  });

  await seedObjectRatingConfig(admin.id);
  await seedPearsDemoData({ partnerId: partner.id, adminId: admin.id, partnerUserId: partnerUser.id });
}

type PearsDemoContext = {
  partnerId: string;
  adminId: string;
  partnerUserId: string;
};

type PearsDemoCase = {
  caseNumber: string;
  customerId: string;
  propertyId: string;
  customer: {
    displayName: string;
    firstName: string;
    lastName: string;
    ageAtSubmission: number;
    email: string;
    phone: string;
    street: string;
    postalCode: string;
    city: string;
  };
  property: {
    objectTitle: string;
    propertyType: PropertyType;
    street: string;
    postalCode: string;
    city: string;
    livingAreaSqm: number;
    plotAreaSqm?: number;
    yearBuilt: number;
    condition: PropertyCondition;
    desiredModel: DesiredModel;
    desiredResidentialRightYears?: number;
    additionalOfferRequested?: boolean;
    additionalOfferModel?: DesiredModel;
    status: PropertyStatus;
    marketValue: number;
    latitude: number;
    longitude: number;
    nextStep: string;
    lastActivityLabel: string;
    lastActivityAt: Date;
  };
  dates?: Partial<{
    indicativeOfferSentAt: Date;
    offerAcceptedAt: Date;
    expertOpinionOrderedAt: Date;
    expertOpinionReceivedAt: Date;
    bindingOfferSentAt: Date;
    bindingOfferAcceptedAt: Date;
    purchaseStartedAt: Date;
    notaryAppointmentAt: Date;
    purchasedAt: Date;
    portfolioEnteredAt: Date;
    purchaseContractSignedAt: Date;
    purchasePriceDueAt: Date;
    purchasePricePaidAt: Date;
    residentialRightRegisteredAt: Date;
    ownershipTransferAt: Date;
    landRegisterEntryAt: Date;
  }>;
  modelAccepted?: DesiredModel;
  reminder?: {
    reason: string;
    dueAt: Date;
  };
};

async function seedPearsDemoData(context: PearsDemoContext) {
  await removeTechnicalDemoResidue();
  await removeLegacyDemoLeads();

  const demoCases: PearsDemoCase[] = [
    {
      caseNumber: "WK-2026-014",
      customerId: "demo_customer_eva_schmidt",
      propertyId: "demo_property_eva_schmidt",
      customer: {
        displayName: "Eva Schmidt",
        firstName: "Eva",
        lastName: "Schmidt",
        ageAtSubmission: 72,
        email: "eva.schmidt@example.com",
        phone: "+49 711 234567",
        street: "Hauptstrasse 14",
        postalCode: "70563",
        city: "Stuttgart"
      },
      property: {
        objectTitle: "EFH Stuttgart-Vaihingen",
        propertyType: PropertyType.single_family,
        street: "Hauptstrasse 14",
        postalCode: "70563",
        city: "Stuttgart",
        livingAreaSqm: 142,
        plotAreaSqm: 380,
        yearBuilt: 1978,
        condition: PropertyCondition.good,
        desiredModel: DesiredModel.fixed_residential_right,
        desiredResidentialRightYears: 10,
        additionalOfferRequested: true,
        additionalOfferModel: DesiredModel.sale_and_leaseback,
        status: PropertyStatus.SUBMITTED,
        marketValue: 638000,
        latitude: 48.7261,
        longitude: 9.1119,
        nextStep: "Erstprüfung abschliessen",
        lastActivityLabel: "Heute, 09:20",
        lastActivityAt: new Date("2026-05-29T07:20:00.000Z")
      },
      reminder: {
        reason: "Neue Einreichung prüfen und Dokumentenliste ergänzen.",
        dueAt: new Date("2026-05-29T13:00:00.000Z")
      }
    },
    {
      caseNumber: "WK-2026-015",
      customerId: "demo_customer_hans_becker",
      propertyId: "demo_property_hans_becker",
      customer: {
        displayName: "Hans Becker",
        firstName: "Hans",
        lastName: "Becker",
        ageAtSubmission: 75,
        email: "hans.becker@example.com",
        phone: "+49 89 445566",
        street: "Bodenseestrasse 88",
        postalCode: "81243",
        city: "München"
      },
      property: {
        objectTitle: "ETW München-Pasing",
        propertyType: PropertyType.apartment,
        street: "Bodenseestrasse 88",
        postalCode: "81243",
        city: "München",
        livingAreaSqm: 91,
        yearBuilt: 1996,
        condition: PropertyCondition.good,
        desiredModel: DesiredModel.sale_and_leaseback,
        status: PropertyStatus.INDICATIVE_OFFER_SENT,
        marketValue: 503194,
        latitude: 48.1469,
        longitude: 11.4616,
        nextStep: "UVA beim Kunden nachfassen",
        lastActivityLabel: "Gestern, 16:45",
        lastActivityAt: new Date("2026-05-28T14:45:00.000Z")
      },
      dates: {
        indicativeOfferSentAt: new Date("2026-05-27T10:00:00.000Z")
      },
      reminder: {
        reason: "Rückmeldung zum unverbindlichen Angebot einholen.",
        dueAt: new Date("2026-05-30T09:00:00.000Z")
      }
    },
    {
      caseNumber: "WK-2026-016",
      customerId: "demo_customer_renate_mayer",
      propertyId: "demo_property_renate_mayer",
      customer: {
        displayName: "Renate Mayer",
        firstName: "Renate",
        lastName: "Mayer",
        ageAtSubmission: 76,
        email: "renate.mayer@example.com",
        phone: "+49 7071 223344",
        street: "Aixer Strasse 21",
        postalCode: "72072",
        city: "Tübingen"
      },
      property: {
        objectTitle: "EFH Tübingen-Südstadt",
        propertyType: PropertyType.single_family,
        street: "Aixer Strasse 21",
        postalCode: "72072",
        city: "Tübingen",
        livingAreaSqm: 156,
        plotAreaSqm: 510,
        yearBuilt: 1982,
        condition: PropertyCondition.average,
        desiredModel: DesiredModel.fixed_residential_right,
        desiredResidentialRightYears: 12,
        status: PropertyStatus.EXPERT_OPINION_RECEIVED,
        marketValue: 650000,
        latitude: 48.5071,
        longitude: 9.0595,
        nextStep: "Gutachten auswerten",
        lastActivityLabel: "Vor 2 Tagen",
        lastActivityAt: new Date("2026-05-27T11:30:00.000Z")
      },
      dates: {
        indicativeOfferSentAt: new Date("2026-05-20T10:00:00.000Z"),
        offerAcceptedAt: new Date("2026-05-22T10:00:00.000Z"),
        expertOpinionOrderedAt: new Date("2026-05-23T09:00:00.000Z"),
        expertOpinionReceivedAt: new Date("2026-05-27T11:00:00.000Z")
      },
      modelAccepted: DesiredModel.fixed_residential_right,
      reminder: {
        reason: "Verbindliches Angebot auf Basis des Gutachtens vorbereiten.",
        dueAt: new Date("2026-05-31T10:00:00.000Z")
      }
    },
    {
      caseNumber: "WK-2026-017",
      customerId: "demo_customer_karl_hoffmann",
      propertyId: "demo_property_karl_hoffmann",
      customer: {
        displayName: "Karl Hoffmann",
        firstName: "Karl",
        lastName: "Hoffmann",
        ageAtSubmission: 79,
        email: "karl.hoffmann@example.com",
        phone: "+49 711 778899",
        street: "Plochinger Strasse 42",
        postalCode: "73730",
        city: "Esslingen"
      },
      property: {
        objectTitle: "ETW Esslingen-Zell",
        propertyType: PropertyType.apartment,
        street: "Plochinger Strasse 42",
        postalCode: "73730",
        city: "Esslingen",
        livingAreaSqm: 84,
        yearBuilt: 2001,
        condition: PropertyCondition.good,
        desiredModel: DesiredModel.fixed_residential_right,
        desiredResidentialRightYears: 10,
        status: PropertyStatus.BINDING_OFFER_ACCEPTED,
        marketValue: 425000,
        latitude: 48.7396,
        longitude: 9.3047,
        nextStep: "Notartermin abstimmen",
        lastActivityLabel: "Vor 3 Tagen",
        lastActivityAt: new Date("2026-05-26T12:20:00.000Z")
      },
      dates: {
        indicativeOfferSentAt: new Date("2026-05-15T10:00:00.000Z"),
        offerAcceptedAt: new Date("2026-05-17T10:00:00.000Z"),
        expertOpinionOrderedAt: new Date("2026-05-18T09:00:00.000Z"),
        expertOpinionReceivedAt: new Date("2026-05-22T11:00:00.000Z"),
        bindingOfferSentAt: new Date("2026-05-24T10:00:00.000Z"),
        bindingOfferAcceptedAt: new Date("2026-05-26T12:00:00.000Z")
      },
      modelAccepted: DesiredModel.fixed_residential_right,
      reminder: {
        reason: "Notartermin und Kaufvertragsentwurf anstossen.",
        dueAt: new Date("2026-06-02T09:00:00.000Z")
      }
    },
    {
      caseNumber: "WK-2026-018",
      customerId: "demo_customer_maria_weber",
      propertyId: "demo_property_maria_weber",
      customer: {
        displayName: "Maria Weber",
        firstName: "Maria",
        lastName: "Weber",
        ageAtSubmission: 74,
        email: "maria.weber@example.com",
        phone: "+49 721 223344",
        street: "Haid-und-Neu-Strasse 63",
        postalCode: "76131",
        city: "Karlsruhe"
      },
      property: {
        objectTitle: "EFH Karlsruhe-Oststadt",
        propertyType: PropertyType.single_family,
        street: "Haid-und-Neu-Strasse 63",
        postalCode: "76131",
        city: "Karlsruhe",
        livingAreaSqm: 138,
        plotAreaSqm: 420,
        yearBuilt: 1988,
        condition: PropertyCondition.good,
        desiredModel: DesiredModel.sale_and_leaseback,
        status: PropertyStatus.NOTARY_APPOINTMENT,
        marketValue: 560000,
        latitude: 49.0105,
        longitude: 8.4245,
        nextStep: "Kaufvertragsentwurf prüfen",
        lastActivityLabel: "Vor 4 Tagen",
        lastActivityAt: new Date("2026-05-25T09:45:00.000Z")
      },
      dates: {
        indicativeOfferSentAt: new Date("2026-05-10T10:00:00.000Z"),
        offerAcceptedAt: new Date("2026-05-12T10:00:00.000Z"),
        expertOpinionOrderedAt: new Date("2026-05-13T09:00:00.000Z"),
        expertOpinionReceivedAt: new Date("2026-05-17T11:00:00.000Z"),
        bindingOfferSentAt: new Date("2026-05-19T10:00:00.000Z"),
        bindingOfferAcceptedAt: new Date("2026-05-21T12:00:00.000Z"),
        purchaseStartedAt: new Date("2026-05-22T09:00:00.000Z"),
        notaryAppointmentAt: new Date("2026-06-04T14:00:00.000Z")
      },
      modelAccepted: DesiredModel.sale_and_leaseback,
      reminder: {
        reason: "Rückmietverkauf im Kaufvertragsentwurf prüfen.",
        dueAt: new Date("2026-06-03T11:00:00.000Z")
      }
    },
    {
      caseNumber: "WK-2026-019",
      customerId: "demo_customer_bernd_fischer",
      propertyId: "demo_property_bernd_fischer",
      customer: {
        displayName: "Bernd Fischer",
        firstName: "Bernd",
        lastName: "Fischer",
        ageAtSubmission: 78,
        email: "bernd.fischer@example.com",
        phone: "+49 761 334455",
        street: "Basler Landstrasse 112",
        postalCode: "79111",
        city: "Freiburg"
      },
      property: {
        objectTitle: "DHH Freiburg-St. Georgen",
        propertyType: PropertyType.semi_detached,
        street: "Basler Landstrasse 112",
        postalCode: "79111",
        city: "Freiburg",
        livingAreaSqm: 128,
        plotAreaSqm: 310,
        yearBuilt: 1976,
        condition: PropertyCondition.average,
        desiredModel: DesiredModel.fixed_residential_right,
        desiredResidentialRightYears: 10,
        status: PropertyStatus.IN_PORTFOLIO,
        marketValue: 540000,
        latitude: 47.9828,
        longitude: 7.7961,
        nextStep: "Bestandsreview terminieren",
        lastActivityLabel: "Vor 7 Tagen",
        lastActivityAt: new Date("2026-05-22T10:00:00.000Z")
      },
      dates: {
        indicativeOfferSentAt: new Date("2026-04-18T10:00:00.000Z"),
        offerAcceptedAt: new Date("2026-04-21T10:00:00.000Z"),
        expertOpinionOrderedAt: new Date("2026-04-22T09:00:00.000Z"),
        expertOpinionReceivedAt: new Date("2026-04-26T11:00:00.000Z"),
        bindingOfferSentAt: new Date("2026-04-29T10:00:00.000Z"),
        bindingOfferAcceptedAt: new Date("2026-05-02T12:00:00.000Z"),
        purchaseStartedAt: new Date("2026-05-03T09:00:00.000Z"),
        notaryAppointmentAt: new Date("2026-05-08T14:00:00.000Z"),
        purchaseContractSignedAt: new Date("2026-05-08T15:00:00.000Z"),
        purchasePriceDueAt: new Date("2026-05-14T10:00:00.000Z"),
        purchasePricePaidAt: new Date("2026-05-16T10:00:00.000Z"),
        residentialRightRegisteredAt: new Date("2026-05-20T10:00:00.000Z"),
        ownershipTransferAt: new Date("2026-05-21T10:00:00.000Z"),
        landRegisterEntryAt: new Date("2026-05-21T11:00:00.000Z"),
        portfolioEnteredAt: new Date("2026-05-22T10:00:00.000Z"),
        purchasedAt: new Date("2026-05-22T10:00:00.000Z")
      },
      modelAccepted: DesiredModel.fixed_residential_right,
      reminder: {
        reason: "Erstes Bestandsreview mit Bewohner abstimmen.",
        dueAt: new Date("2026-06-12T10:00:00.000Z")
      }
    },
    {
      caseNumber: "WK-2026-020",
      customerId: "demo_customer_petra_klein",
      propertyId: "demo_property_petra_klein",
      customer: {
        displayName: "Petra Klein",
        firstName: "Petra",
        lastName: "Klein",
        ageAtSubmission: 73,
        email: "petra.klein@example.com",
        phone: "+49 30 667788",
        street: "Jungfernstieg 5",
        postalCode: "20354",
        city: "Hamburg"
      },
      property: {
        objectTitle: "ETW Hamburg-Neustadt",
        propertyType: PropertyType.apartment,
        street: "Jungfernstieg 5",
        postalCode: "20354",
        city: "Hamburg",
        livingAreaSqm: 88,
        yearBuilt: 2004,
        condition: PropertyCondition.very_good,
        desiredModel: DesiredModel.sale_and_leaseback,
        status: PropertyStatus.SOLD,
        marketValue: 720000,
        latitude: 53.5527,
        longitude: 9.9926,
        nextStep: "Verwertung abgeschlossen dokumentieren",
        lastActivityLabel: "Vor 10 Tagen",
        lastActivityAt: new Date("2026-05-19T10:00:00.000Z")
      },
      dates: {
        indicativeOfferSentAt: new Date("2026-03-18T10:00:00.000Z"),
        offerAcceptedAt: new Date("2026-03-21T10:00:00.000Z"),
        expertOpinionOrderedAt: new Date("2026-03-22T09:00:00.000Z"),
        expertOpinionReceivedAt: new Date("2026-03-26T11:00:00.000Z"),
        bindingOfferSentAt: new Date("2026-03-29T10:00:00.000Z"),
        bindingOfferAcceptedAt: new Date("2026-04-02T12:00:00.000Z"),
        purchaseStartedAt: new Date("2026-04-03T09:00:00.000Z"),
        notaryAppointmentAt: new Date("2026-04-09T14:00:00.000Z"),
        purchaseContractSignedAt: new Date("2026-04-09T15:00:00.000Z"),
        purchasePricePaidAt: new Date("2026-04-18T10:00:00.000Z"),
        portfolioEnteredAt: new Date("2026-04-22T10:00:00.000Z")
      },
      modelAccepted: DesiredModel.sale_and_leaseback
    }
  ];

  for (const demoCase of demoCases) {
    await upsertPearsDemoCase(demoCase, context);
  }

  await seedPearsDemoLeads(context);
  await prisma.numberSequence.upsert({ where: { key: "lead" }, update: { value: 3 }, create: { key: "lead", value: 3 } });
  await prisma.numberSequence.upsert({ where: { key: "case:2026" }, update: { value: 20 }, create: { key: "case:2026", value: 20 } });
}

async function upsertPearsDemoCase(demoCase: PearsDemoCase, context: PearsDemoContext) {
  const customer = await prisma.customer.upsert({
    where: { id: demoCase.customerId },
    update: {
      partnerId: context.partnerId,
      assignedAdvisorUserId: context.adminId,
      displayName: demoCase.customer.displayName,
      firstName: demoCase.customer.firstName,
      lastName: demoCase.customer.lastName,
      ageAtSubmission: demoCase.customer.ageAtSubmission,
      email: demoCase.customer.email,
      phone: demoCase.customer.phone,
      street: demoCase.customer.street,
      postalCode: demoCase.customer.postalCode,
      city: demoCase.customer.city,
      addressText: `${demoCase.customer.street}, ${demoCase.customer.postalCode} ${demoCase.customer.city}`,
      consentDataProcessing: true
    },
    create: {
      id: demoCase.customerId,
      partnerId: context.partnerId,
      assignedAdvisorUserId: context.adminId,
      displayName: demoCase.customer.displayName,
      firstName: demoCase.customer.firstName,
      lastName: demoCase.customer.lastName,
      ageAtSubmission: demoCase.customer.ageAtSubmission,
      email: demoCase.customer.email,
      phone: demoCase.customer.phone,
      street: demoCase.customer.street,
      postalCode: demoCase.customer.postalCode,
      city: demoCase.customer.city,
      addressText: `${demoCase.customer.street}, ${demoCase.customer.postalCode} ${demoCase.customer.city}`,
      consentDataProcessing: true
    }
  });

  const acceptedModel = demoCase.modelAccepted ?? demoCase.property.desiredModel;
  const property = await prisma.property.upsert({
    where: { caseNumber: demoCase.caseNumber },
    update: buildPearsDemoPropertyData(demoCase, customer.id, context.partnerId, context.adminId, acceptedModel),
    create: {
      id: demoCase.propertyId,
      caseNumber: demoCase.caseNumber,
      ...buildPearsDemoPropertyData(demoCase, customer.id, context.partnerId, context.adminId, acceptedModel)
    }
  });

  await clearPropertyDemoRelations(property.id);

  const valuation = await prisma.valuation.create({
    data: {
      propertyId: property.id,
      provider: ValuationProvider.sprengnetter,
      status: ValuationStatus.completed,
      sourceLabel: "Demo-Gutachten",
      marketValue: demoCase.property.marketValue,
      valueMin: Math.round(demoCase.property.marketValue * 0.96),
      valueMax: Math.round(demoCase.property.marketValue * 1.04),
      confidenceScore: 0.86,
      rawResponseJson: { source: "pears-demo", caseNumber: demoCase.caseNumber },
      startedAt: demoCase.dates?.expertOpinionOrderedAt ?? demoCase.property.lastActivityAt,
      completedAt: demoCase.dates?.expertOpinionReceivedAt ?? demoCase.property.lastActivityAt
    }
  });

  if (demoCase.property.status !== PropertyStatus.SUBMITTED) {
    await createDemoOffer(property.id, valuation.id, demoCase.caseNumber, OfferKind.indicative, demoCase.property.desiredModel, demoCase.property.marketValue, demoCase.dates?.indicativeOfferSentAt);
  }
  if ([PropertyStatus.BINDING_OFFER_ACCEPTED, PropertyStatus.NOTARY_APPOINTMENT, PropertyStatus.IN_PORTFOLIO, PropertyStatus.SOLD].includes(demoCase.property.status)) {
    await createDemoOffer(property.id, valuation.id, demoCase.caseNumber, OfferKind.binding, acceptedModel, demoCase.property.marketValue, demoCase.dates?.bindingOfferSentAt);
  }

  await createDemoDocuments(property.id, customer.id, context.adminId, demoCase.caseNumber, demoCase.property.status);
  if (demoCase.reminder) {
    await prisma.reminder.create({
      data: {
        propertyId: property.id,
        assignedToUserId: context.adminId,
        createdByUserId: context.adminId,
        reason: demoCase.reminder.reason,
        status: ReminderStatus.open,
        dueAt: demoCase.reminder.dueAt,
        lastReminderAt: demoCase.property.lastActivityAt
      }
    });
  }
  await prisma.activity.create({
    data: {
      propertyId: property.id,
      userId: context.adminId,
      type: "demo_status",
      message: `${demoCase.customer.displayName}: ${demoCase.property.nextStep}.`,
      source: "admin",
      entityType: "property",
      entityId: property.id,
      createdAt: demoCase.property.lastActivityAt
    }
  });
}

function buildPearsDemoPropertyData(
  demoCase: PearsDemoCase,
  customerId: string,
  partnerId: string,
  adminId: string,
  acceptedModel: DesiredModel
) {
  const dates = demoCase.dates ?? {};
  const isInventory = demoCase.property.status === PropertyStatus.IN_PORTFOLIO;
  return {
    objectTitle: demoCase.property.objectTitle,
    customerId,
    partnerId,
    assignedAdvisorUserId: adminId,
    caseSource: "PARTNER",
    propertyType: demoCase.property.propertyType,
    street: demoCase.property.street,
    postalCode: demoCase.property.postalCode,
    city: demoCase.property.city,
    livingAreaSqm: demoCase.property.livingAreaSqm,
    plotAreaSqm: demoCase.property.plotAreaSqm ?? 0,
    yearBuilt: demoCase.property.yearBuilt,
    condition: demoCase.property.condition,
    occupancyStatus: "owner_occupied",
    desiredModel: demoCase.property.desiredModel,
    preferredValuationProvider: ValuationProvider.sprengnetter,
    desiredResidentialRightYears: demoCase.property.desiredResidentialRightYears,
    additionalOfferRequested: demoCase.property.additionalOfferRequested ?? false,
    additionalOfferModel: demoCase.property.additionalOfferModel,
    rentalModelDisclosureAccepted: demoCase.property.desiredModel === DesiredModel.sale_and_leaseback,
    indicativeOfferSentAt: dates.indicativeOfferSentAt,
    offerAcceptedAt: dates.offerAcceptedAt,
    expertOpinionOrderedAt: dates.expertOpinionOrderedAt,
    expertOpinionCompany: dates.expertOpinionOrderedAt ? "Sprengnetter" : undefined,
    expertOpinionReceivedAt: dates.expertOpinionReceivedAt,
    bindingOfferSentAt: dates.bindingOfferSentAt,
    bindingOfferAcceptedAt: dates.bindingOfferAcceptedAt,
    indicativeAcceptedOfferModel: dates.offerAcceptedAt ? acceptedModel : undefined,
    indicativeAcceptedOfferModelAt: dates.offerAcceptedAt,
    indicativeAcceptedOfferModelByUserId: dates.offerAcceptedAt ? adminId : undefined,
    bindingAcceptedOfferModel: dates.bindingOfferAcceptedAt ? acceptedModel : undefined,
    bindingAcceptedOfferModelAt: dates.bindingOfferAcceptedAt,
    bindingAcceptedOfferModelByUserId: dates.bindingOfferAcceptedAt ? adminId : undefined,
    purchaseStartedAt: dates.purchaseStartedAt,
    notaryAppointmentAt: dates.notaryAppointmentAt,
    purchasedAt: dates.purchasedAt,
    portfolioEnteredAt: dates.portfolioEnteredAt,
    purchaseContractNumber: dates.purchaseContractSignedAt ? `KV-${demoCase.caseNumber.replace("WK-", "")}` : undefined,
    purchaseContractSignedAt: dates.purchaseContractSignedAt,
    purchasePrice: dates.purchaseContractSignedAt ? Math.round(demoCase.property.marketValue * 0.7) : undefined,
    purchasePriceDueAt: dates.purchasePriceDueAt,
    purchasePricePaidAt: dates.purchasePricePaidAt,
    payoutPaidAt: dates.purchasePricePaidAt,
    ownershipTransferAt: dates.ownershipTransferAt,
    landRegisterEntryAt: dates.landRegisterEntryAt,
    residentialRightRegisteredAt: dates.residentialRightRegisteredAt,
    residentStaysInProperty: true,
    residentName: isInventory ? demoCase.customer.displayName : undefined,
    usageModel: isInventory ? acceptedModel : undefined,
    usageRightStartsAt: dates.portfolioEnteredAt,
    usageRightEndsAt: acceptedModel === DesiredModel.fixed_residential_right && dates.portfolioEnteredAt
      ? new Date("2036-05-22T10:00:00.000Z")
      : undefined,
    monthlyRent: acceptedModel === DesiredModel.sale_and_leaseback ? Math.round(demoCase.property.marketValue * 0.7 * 0.05 / 12) : undefined,
    monthlyUsageFee: acceptedModel === DesiredModel.sale_and_leaseback ? Math.round(demoCase.property.marketValue * 0.7 * 0.05 / 12) : undefined,
    residentContactName: isInventory ? demoCase.customer.displayName : undefined,
    residentEmergencyContact: isInventory ? "Angehörige laut Objektakte" : undefined,
    propertyManagerName: isInventory ? "WEG-Verwaltung Südwest GmbH" : undefined,
    buildingInsurance: isInventory ? "Gebäudeversicherung geprüft" : undefined,
    serviceChargeStatus: isInventory ? "Hausgeldabrechnung angefordert" : undefined,
    nextPortfolioReviewAt: isInventory ? new Date("2026-11-22T10:00:00.000Z") : undefined,
    maintenancePlanJson: isInventory ? { nextReviewDate: "2026-11-22", annualBudget: 2800, notes: "Regelmäßige Bestandsprüfung vereinbart." } : undefined,
    portfolioTasksJson: isInventory ? { nextAppointmentDate: "2026-11-22", nextAppointmentType: "Bestandsreview" } : undefined,
    portfolioNotes: isInventory ? "Bestandsobjekt für Demo: Bewohner bleibt im Objekt." : undefined,
    offerCalculationSource: "application",
    lastActivityLabel: demoCase.property.lastActivityLabel,
    lastActivityAt: demoCase.property.lastActivityAt,
    notes: demoCase.property.nextStep,
    latitude: demoCase.property.latitude,
    longitude: demoCase.property.longitude,
    geocodingSource: "demo",
    status: demoCase.property.status
  };
}

async function createDemoOffer(
  propertyId: string,
  valuationId: string,
  caseNumber: string,
  kind: OfferKind,
  model: DesiredModel,
  marketValue: number,
  sentAt?: Date
) {
  const isRentBack = model === DesiredModel.sale_and_leaseback;
  const payoutAmount = Math.round((isRentBack ? marketValue * 0.7 : marketValue * 0.58) * 100) / 100;
  const annualRent = isRentBack ? Math.round(payoutAmount * 0.05 * 100) / 100 : 0;
  await prisma.offer.create({
    data: {
      propertyId,
      valuationId,
      offerNumber: `ANG-${caseNumber.replace("WK-", "")}-${kind === OfferKind.indicative ? "UVA" : "VA"}`,
      kind,
      currentVersion: kind === OfferKind.indicative ? 1 : 2,
      marketValue,
      adjustedMarketValue: marketValue,
      residentialRightValue: isRentBack ? 0 : Math.round(marketValue * 0.24 * 100) / 100,
      riskDiscount: isRentBack ? 0 : Math.round(marketValue * 0.04 * 100) / 100,
      companyMargin: isRentBack ? 0 : Math.round(marketValue * 0.14 * 100) / 100,
      payoutAmount,
      model,
      residentialRightYears: isRentBack ? undefined : 10,
      assumptionsJson: isRentBack
        ? {
            calculationMode: "DEMO_FIXED_RATE",
            payoutRate: 0.7,
            annualRentRate: 0.05,
            annualRent,
            monthlyRent: Math.round((annualRent / 12) * 100) / 100
          }
        : { formula: "Demo Wohnrecht", residentialRightYears: 10 },
      aiCustomerText: "Demo-Angebot für den Pears-Termin.",
      aiPartnerSummary: "Fiktiver, sauberer Demo-Fall.",
      aiInternalRationale: "Demo-Daten ohne technische Testnamen.",
      bindingOfferText: kind === OfferKind.binding ? "Verbindliches Demo-Angebot vorbereitet." : "Noch kein verbindliches Angebot erstellt.",
      validUntil: sentAt ? new Date(sentAt.getTime() + 28 * 24 * 60 * 60 * 1000) : undefined,
      status: sentAt ? OfferStatus.sent : OfferStatus.review,
      sentAt
    }
  });
}

async function createDemoDocuments(propertyId: string, customerId: string, adminId: string, caseNumber: string, status: PropertyStatus) {
  const landRegister = await prisma.document.create({
    data: {
      propertyId,
      customerId,
      uploadedByUserId: adminId,
      fileName: `Grundbuchauszug_${caseNumber}.pdf`,
      displayName: "Grundbuchauszug",
      fileType: "application/pdf",
      storageUrl: `/demo/${caseNumber}/grundbuchauszug.pdf`,
      category: DocumentCategory.land_register,
      requirementLevel: DocumentRequirementLevel.required,
      status: status === PropertyStatus.SUBMITTED ? DocumentStatus.review_required : DocumentStatus.ok,
      scanStatus: "clean"
    }
  });
  await prisma.documentVersion.create({
    data: {
      documentId: landRegister.id,
      version: 1,
      snapshotJson: { source: "pears-demo" },
      createdByUserId: adminId
    }
  });

  await prisma.document.create({
    data: {
      propertyId,
      customerId,
      uploadedByUserId: adminId,
      fileName: `Energieausweis_${caseNumber}.pdf`,
      displayName: "Energieausweis",
      fileType: "application/pdf",
      storageUrl: `/demo/${caseNumber}/energieausweis.pdf`,
      category: DocumentCategory.energy_certificate,
      requirementLevel: DocumentRequirementLevel.required,
      status: [PropertyStatus.SUBMITTED, PropertyStatus.INDICATIVE_OFFER_SENT].includes(status) ? DocumentStatus.missing : DocumentStatus.ok,
      scanStatus: "clean"
    }
  });
}

async function seedPearsDemoLeads(context: PearsDemoContext) {
  const leads = [
    {
      id: "pears_lead_peter_wagner",
      leadNumber: "LEAD-001",
      firstName: "Peter",
      lastName: "Wagner",
      name: "Peter Wagner",
      email: "peter.wagner@example.com",
      phone: "+49 40 778899",
      postalCode: "22301",
      city: "Hamburg",
      federalState: "Hamburg",
      status: LeadStatus.NEW,
      assignedPartnerId: undefined,
      message: "Telefonische Erstanfrage, Objekt in Hamburg-Winterhude.",
      propertyType: PropertyType.single_family,
      propertyCity: "Hamburg",
      propertyPostalCode: "22301",
      region: "Hamburg",
      productInterest: DesiredModel.fixed_residential_right,
      routingReason: undefined
    },
    {
      id: "pears_lead_sabine_keller",
      leadNumber: "LEAD-002",
      firstName: "Sabine",
      lastName: "Keller",
      name: "Sabine Keller",
      email: "sabine.keller@example.com",
      phone: "+49 711 445566",
      postalCode: "70184",
      city: "Stuttgart",
      federalState: "Baden-Württemberg",
      status: LeadStatus.ASSIGNED_TO_PARTNER,
      assignedPartnerId: context.partnerId,
      message: "Lead aus Rückrufwunsch, an Makler zur Erstansprache übergeben.",
      propertyType: PropertyType.apartment,
      propertyCity: "Stuttgart",
      propertyPostalCode: "70184",
      region: "Stuttgart",
      productInterest: DesiredModel.sale_and_leaseback,
      routingReason: "Region Stuttgart"
    },
    {
      id: "pears_lead_thomas_braun",
      leadNumber: "LEAD-003",
      firstName: "Thomas",
      lastName: "Braun",
      name: "Thomas Braun",
      email: "thomas.braun@example.com",
      phone: "+49 89 112233",
      postalCode: "80686",
      city: "München",
      federalState: "Bayern",
      status: LeadStatus.PARTNER_CONTACT_PENDING,
      assignedPartnerId: context.partnerId,
      message: "Makler soll Unterlagen zur Wohnung in München anfordern.",
      propertyType: PropertyType.apartment,
      propertyCity: "München",
      propertyPostalCode: "80686",
      region: "München",
      productInterest: DesiredModel.fixed_residential_right,
      routingReason: "Region München"
    }
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { leadNumber: lead.leadNumber },
      update: {
        source: LeadSource.phone,
        status: lead.status,
        assignedPartnerId: lead.assignedPartnerId,
        assignedByUserId: lead.assignedPartnerId ? context.adminId : undefined,
        assignedAt: lead.assignedPartnerId ? new Date("2026-05-29T08:00:00.000Z") : undefined,
        firstName: lead.firstName,
        lastName: lead.lastName,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        postalCode: lead.postalCode,
        city: lead.city,
        federalState: lead.federalState,
        contactConsent: true,
        propertyType: lead.propertyType,
        propertyCity: lead.propertyCity,
        propertyPostalCode: lead.propertyPostalCode,
        message: lead.message,
        productInterest: lead.productInterest,
        region: lead.region,
        routingReason: lead.routingReason,
        internalNote: "Pears-Demo-Lead"
      },
      create: {
        id: lead.id,
        leadNumber: lead.leadNumber,
        source: LeadSource.phone,
        status: lead.status,
        assignedPartnerId: lead.assignedPartnerId,
        assignedByUserId: lead.assignedPartnerId ? context.adminId : undefined,
        assignedAt: lead.assignedPartnerId ? new Date("2026-05-29T08:00:00.000Z") : undefined,
        firstName: lead.firstName,
        lastName: lead.lastName,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        postalCode: lead.postalCode,
        city: lead.city,
        federalState: lead.federalState,
        contactConsent: true,
        propertyType: lead.propertyType,
        propertyCity: lead.propertyCity,
        propertyPostalCode: lead.propertyPostalCode,
        message: lead.message,
        productInterest: lead.productInterest,
        region: lead.region,
        routingReason: lead.routingReason,
        internalNote: "Pears-Demo-Lead"
      }
    });
  }
}

async function clearPropertyDemoRelations(propertyId: string) {
  const offers = await prisma.offer.findMany({ where: { propertyId }, select: { id: true } });
  const offerIds = offers.map((offer) => offer.id);
  if (offerIds.length) await prisma.offerVersion.deleteMany({ where: { offerId: { in: offerIds } } });
  await prisma.offer.deleteMany({ where: { propertyId } });

  const documents = await prisma.document.findMany({ where: { propertyId }, select: { id: true } });
  const documentIds = documents.map((document) => document.id);
  if (documentIds.length) await prisma.documentVersion.deleteMany({ where: { documentId: { in: documentIds } } });
  await prisma.document.deleteMany({ where: { propertyId } });

  const activities = await prisma.activity.findMany({ where: { propertyId }, select: { id: true } });
  const activityIds = activities.map((activity) => activity.id);
  if (activityIds.length) await prisma.activityVersion.deleteMany({ where: { activityId: { in: activityIds } } });
  await prisma.activity.deleteMany({ where: { propertyId } });

  const chatMessages = await prisma.chatMessage.findMany({ where: { propertyId }, select: { id: true } });
  const chatMessageIds = chatMessages.map((message) => message.id);
  if (chatMessageIds.length) {
    await prisma.chatAttachment.deleteMany({ where: { chatMessageId: { in: chatMessageIds } } });
    await prisma.chatMessageRead.deleteMany({ where: { chatMessageId: { in: chatMessageIds } } });
  }
  await prisma.chatMessage.deleteMany({ where: { propertyId } });

  await prisma.caseNotification.deleteMany({ where: { propertyId } });
  await prisma.reminder.deleteMany({ where: { propertyId } });
  await prisma.valuation.deleteMany({ where: { propertyId } });
}

async function removeLegacyDemoLeads() {
  await prisma.lead.deleteMany({
    where: {
      OR: [
        { leadNumber: { startsWith: "LD-2026-" } },
        { name: { contains: "Test", mode: "insensitive" } },
        { name: { contains: "API", mode: "insensitive" } }
      ]
    }
  });
}

async function removeTechnicalDemoResidue() {
  const technicalProperties = await prisma.property.findMany({
    where: {
      OR: [
        { caseNumber: { in: ["WK-2026-008", "WK-2026-021", "WK-2026-022", "WK-2026-023"] } },
        { objectTitle: { contains: "Test", mode: "insensitive" } },
        { objectTitle: { contains: "API", mode: "insensitive" } },
        { customer: { displayName: { contains: "API", mode: "insensitive" } } },
        { customer: { displayName: { contains: "Test202", mode: "insensitive" } } },
        { customer: { displayName: { contains: "Workflow Test", mode: "insensitive" } } },
        { customer: { displayName: { contains: "Beratungstest", mode: "insensitive" } } },
        { customer: { displayName: { contains: "Endtoend", mode: "insensitive" } } }
      ]
    },
    select: { id: true }
  });

  for (const property of technicalProperties) {
    await clearPropertyDemoRelations(property.id);
    await prisma.property.delete({ where: { id: property.id } }).catch(() => undefined);
  }
}

async function seedObjectRatingConfigLegacy(createdByUserId: string) {
  const version = await prisma.ratingVersion.upsert({
    where: { versionNumber: 1 },
    update: {
      active: true,
      description: "Initiale Objektrating-Konfiguration aus Objektrating-Master."
    },
    create: {
      id: "rating_version_1",
      versionNumber: 1,
      active: true,
      description: "Initiale Objektrating-Konfiguration aus Objektrating-Master.",
      createdByUserId
    }
  });

  const categories = [
    { id: "rating_cat_location_v1", name: "Standort", weight: 0.22 },
    { id: "rating_cat_economics_v1", name: "Wirtschaftliche Faktoren", weight: 0.18 },
    { id: "rating_cat_maintenance_v1", name: "Instandhaltung", weight: 0.22 },
    { id: "rating_cat_property_v1", name: "Immobilie", weight: 0.23 },
    { id: "rating_cat_documents_v1", name: "Dokumente", weight: 0.15 }
  ];

  for (const category of categories) {
    await prisma.ratingCategory.upsert({
      where: { id: category.id },
      update: { versionId: version.id, name: category.name, weight: category.weight, active: true },
      create: { ...category, versionId: version.id, active: true }
    });
  }

  const criteria = [
    {
      id: "rating_crit_location_microlocation_v1",
      categoryId: "rating_cat_location_v1",
      name: "Mikrolage",
      description: "Makro- und Mikrolage, Anbindung und Nachfrage.",
      weight: 0.6,
      sourceType: RatingSourceType.api,
      sourceField: "property.postalCode",
      mappingRule: { type: "presence", presentScore: 4, missingScore: 2 },
      confidenceRule: { default: 0.45, missing: 0.2 }
    },
    {
      id: "rating_crit_economics_purchase_power_v1",
      categoryId: "rating_cat_economics_v1",
      name: "Kaufkraft / Nachfrage",
      description: "Wirtschaftliche Standortqualität als spätere API-Kennzahl.",
      weight: 1,
      sourceType: RatingSourceType.api,
      sourceField: "property.postalCode",
      mappingRule: { type: "presence", presentScore: 4, missingScore: 2 },
      confidenceRule: { default: 0.45, missing: 0.2 }
    },
    {
      id: "rating_crit_maintenance_age_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Objektalter",
      description: "Baujahr als Näherung für altersbedingtes Instandhaltungsrisiko.",
      weight: 0.25,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.yearBuilt",
      mappingRule: {
        type: "range",
        ranges: [
          { min: 2015, score: 6 },
          { min: 2000, max: 2014, score: 5 },
          { min: 1990, max: 1999, score: 4 },
          { min: 1970, max: 1989, score: 3 },
          { min: 1950, max: 1969, score: 2 },
          { max: 1949, score: 1 }
        ]
      },
      confidenceRule: { default: 0.8, missing: 0.2 }
    },
    {
      id: "rating_crit_maintenance_condition_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Objektzustand",
      description: "Optik und sichtbarer Zustand aus dem Fragebogen.",
      weight: 0.25,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.visualConditionRating",
      mappingRule: { type: "enum", scores: { very_good: 6, good: 5, moderate: 4, medium: 3, bad: 2, very_bad: 1 }, defaultScore: 3 },
      confidenceRule: { default: 0.75, missing: 0.25 }
    },
    {
      id: "rating_crit_maintenance_moisture_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Feuchtigkeit / Schimmel / Wasserschäden",
      description: "Bekannte Feuchtigkeit, Schimmel oder Wasserschäden.",
      weight: 0.25,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.moistureDamageStatus",
      mappingRule: { type: "enum", scores: { NONE: 6, MINOR: 3, SIGNIFICANT: 1 }, defaultScore: 3 },
      confidenceRule: { default: 0.8, missing: 0.2 }
    },
    {
      id: "rating_crit_maintenance_special_assessments_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Instandhaltungsrisiko / Sonderumlagen",
      description: "Bekannte größere Instandhaltungen oder Sonderumlagen.",
      weight: 0.25,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.knownMajorMaintenanceOrSpecialAssessments",
      mappingRule: { type: "boolean", trueScore: 2, falseScore: 6 },
      confidenceRule: { default: 0.8, missing: 0.2 }
    },
    {
      id: "rating_crit_property_accessibility_v1",
      categoryId: "rating_cat_property_v1",
      name: "Zugänglichkeit",
      description: "Barrierearmut und komfortable Nutzung.",
      weight: 0.35,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.accessibilityAssessment",
      mappingRule: { type: "enum", scores: { LOW_BARRIER: 6, PARTIALLY_RESTRICTED: 4, STRONGLY_RESTRICTED: 2 }, defaultScore: 3 },
      confidenceRule: { default: 0.8, missing: 0.2 }
    },
    {
      id: "rating_crit_property_elevator_v1",
      categoryId: "rating_cat_property_v1",
      name: "Aufzug / Nutzerkomfort",
      description: "Aufzug als Komfort- und Drittverwendungsfaktor bei Wohnungen.",
      weight: 0.25,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.hasElevator",
      mappingRule: { type: "boolean", trueScore: 6, falseScore: 3 },
      confidenceRule: { default: 0.8, missing: 0.35 }
    },
    {
      id: "rating_crit_property_third_use_v1",
      categoryId: "rating_cat_property_v1",
      name: "Drittverwendbarkeit",
      description: "Breite Nutzbarkeit des Objekts für spätere Vermarktung.",
      weight: 0.4,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.propertyType",
      mappingRule: { type: "enum", scores: { apartment: 5, single_family: 5, semi_detached: 4, row_house: 4, house: 4, multi_family: 3, other: 2 }, defaultScore: 3 },
      confidenceRule: { default: 0.55, missing: 0.25 }
    },
    {
      id: "rating_crit_document_energy_v1",
      categoryId: "rating_cat_documents_v1",
      name: "Energieausweis",
      description: "Vorhandensein und Prüfstatus des Energieausweises.",
      weight: 0.5,
      sourceType: RatingSourceType.document,
      sourceField: "energy_certificate",
      mappingRule: { type: "document_status", category: "energy_certificate", scores: { ok: 6, pending: 4, review_required: 3, missing: 1, rejected: 1 }, defaultScore: 3, missingScore: 1 },
      confidenceRule: { default: 0.85, missing: 0.3 }
    },
    {
      id: "rating_crit_document_core_files_v1",
      categoryId: "rating_cat_documents_v1",
      name: "Objektunterlagen",
      description: "Grundbuch, Grundriss und weitere Pflichtunterlagen.",
      weight: 0.5,
      sourceType: RatingSourceType.document,
      sourceField: "land_register",
      mappingRule: { type: "document_status", category: "land_register", scores: { ok: 6, pending: 4, review_required: 3, missing: 1, rejected: 1 }, defaultScore: 3, missingScore: 1 },
      confidenceRule: { default: 0.85, missing: 0.3 }
    }
  ];

  for (const criterion of criteria) {
    await prisma.ratingCriterion.upsert({
      where: { id: criterion.id },
      update: {
        versionId: version.id,
        categoryId: criterion.categoryId,
        name: criterion.name,
        description: criterion.description,
        weight: criterion.weight,
        sourceType: criterion.sourceType,
        required: true,
        active: true
      },
      create: {
        id: criterion.id,
        versionId: version.id,
        categoryId: criterion.categoryId,
        name: criterion.name,
        description: criterion.description,
        weight: criterion.weight,
        sourceType: criterion.sourceType,
        required: true,
        active: true
      }
    });

    await prisma.ratingFieldMapping.upsert({
      where: { id: `${criterion.id}_mapping` },
      update: {
        versionId: version.id,
        criterionId: criterion.id,
        sourceType: criterion.sourceType,
        sourceField: criterion.sourceField,
        mappingRule: criterion.mappingRule,
        confidenceRule: criterion.confidenceRule,
        active: true
      },
      create: {
        id: `${criterion.id}_mapping`,
        versionId: version.id,
        criterionId: criterion.id,
        sourceType: criterion.sourceType,
        sourceField: criterion.sourceField,
        mappingRule: criterion.mappingRule,
        confidenceRule: criterion.confidenceRule,
        active: true
      }
    });

    for (const scoreValue of [1, 2, 3, 4, 5, 6]) {
      const label = ["kritisch", "schwach", "unterdurchschnittlich", "solide", "gut", "sehr gut"][scoreValue - 1];
      await prisma.ratingScoreDefinition.upsert({
        where: { criterionId_scoreValue: { criterionId: criterion.id, scoreValue } },
        update: { versionId: version.id, label, description: `${criterion.name}: ${label}` },
        create: {
          id: `${criterion.id}_score_${scoreValue}`,
          versionId: version.id,
          criterionId: criterion.id,
          scoreValue,
          label,
          description: `${criterion.name}: ${label}`
        }
      });
    }
  }

  const returnCurves = [
    { id: "rating_curve_a_v1", ratingClass: "A", minScore: 5.5, maxScore: 6, baseTargetReturn: 0.07, lowerReturnBound: 0.065, upperReturnBound: 0.075 },
    { id: "rating_curve_b_v1", ratingClass: "B", minScore: 4.5, maxScore: 5.49, baseTargetReturn: 0.075, lowerReturnBound: 0.07, upperReturnBound: 0.08 },
    { id: "rating_curve_c_v1", ratingClass: "C", minScore: 3.5, maxScore: 4.49, baseTargetReturn: 0.08, lowerReturnBound: 0.075, upperReturnBound: 0.085 },
    { id: "rating_curve_d_v1", ratingClass: "D", minScore: 2.5, maxScore: 3.49, baseTargetReturn: 0.09, lowerReturnBound: 0.085, upperReturnBound: 0.095 },
    { id: "rating_curve_e_v1", ratingClass: "E", minScore: 1, maxScore: 2.49, baseTargetReturn: 0.105, lowerReturnBound: 0.095, upperReturnBound: 0.115 }
  ];

  for (const curve of returnCurves) {
    await prisma.ratingReturnCurve.upsert({
      where: { id: curve.id },
      update: { versionId: version.id, ...curve },
      create: { versionId: version.id, ...curve }
    });
  }
}

async function seedObjectRatingConfig(createdByUserId: string) {
  const version = await prisma.ratingVersion.upsert({
    where: { versionNumber: 1 },
    update: {
      active: true,
      description: "Objektrating-Konfiguration gemäß Excel-Master: Auswertung, wirtschaftliche Faktoren, Mikrolage, Instandhaltungsaufwand, Immobilie und Energieausweis."
    },
    create: {
      id: "rating_version_1",
      versionNumber: 1,
      active: true,
      description: "Objektrating-Konfiguration gemäß Excel-Master: Auswertung, wirtschaftliche Faktoren, Mikrolage, Instandhaltungsaufwand, Immobilie und Energieausweis.",
      createdByUserId
    }
  });

  await prisma.ratingCategory.updateMany({ where: { versionId: version.id }, data: { active: false } });
  await prisma.ratingCriterion.updateMany({ where: { versionId: version.id }, data: { active: false } });
  await prisma.ratingFieldMapping.updateMany({ where: { versionId: version.id }, data: { active: false } });
  await prisma.ratingReturnCurve.deleteMany({ where: { versionId: version.id } });

  const categories = [
    { id: "rating_cat_economics_v1", name: "Wirtschaftliche Faktoren", weight: 0.2 },
    { id: "rating_cat_microlocation_v1", name: "Mikrolage", weight: 0.3 },
    { id: "rating_cat_maintenance_v1", name: "Instandhaltungsaufwand", weight: 0.2 },
    { id: "rating_cat_property_v1", name: "Immobilie", weight: 0.2 },
    { id: "rating_cat_energy_v1", name: "Energieausweis", weight: 0.1 }
  ];

  for (const category of categories) {
    await prisma.ratingCategory.upsert({
      where: { id: category.id },
      update: { versionId: version.id, name: category.name, weight: category.weight, active: true },
      create: { ...category, versionId: version.id, active: true }
    });
  }

  const locationScoreDefinitions = {
    1: "sehr schlecht",
    2: "schlecht",
    3: "mäßig",
    4: "mittel",
    5: "gut",
    6: "sehr gut"
  };
  const analystMapping = { type: "presence", presentScore: 4, missingScore: 2 };
  const analystConfidence = { default: 0.45, missing: 0.2 };
  const manualAnalystMapping = { type: "presence", missingScore: "__manual__" };
  const manualAnalystConfidence = { default: 0.45, missing: 0.2 };
  const publicTransportGuideline = [
    "Guidelines zur Bewertung der Anbindung an den öffentlichen Nahverkehr",
    "Stadt: sehr schlecht = kaum alltagstaugliche ÖPNV-Anbindung, sehr geringe Taktung, zentrale Ziele nur schwer erreichbar, starke PKW-Abhängigkeit.",
    "Stadt: schlecht = eingeschränkte Nutzbarkeit, geringe Flexibilität, zentrale Ziele nur mit deutlichem Zeitaufwand erreichbar.",
    "Stadt: durchschnittlich = grundlegende Alltagstauglichkeit vorhanden, regelmäßige Verbindung, wichtige Ziele erreichbar.",
    "Stadt: gut = gute alltagstaugliche Anbindung, regelmäßige und zuverlässige Verbindung, gute Erreichbarkeit zentraler Einrichtungen.",
    "Stadt: sehr gut = überdurchschnittliche Mobilität ohne PKW möglich, schnelle Verbindung zu wichtigen Knotenpunkten, hohe Flexibilität im Alltag.",
    "Stadt: exzellent = hervorragende Mobilitätsqualität, nahezu vollständige Alltagstauglichkeit ohne PKW, exzellente Erreichbarkeit zentraler Ziele.",
    "Ländliche Lage: sehr schlecht = praktisch keine alltagstaugliche ÖPNV-Anbindung, starke PKW-Abhängigkeit, zentrale Einrichtungen nur schwer erreichbar.",
    "Ländliche Lage: schlecht = eingeschränkte Nutzbarkeit im Alltag, geringe Flexibilität, wichtige Ziele nur mit deutlichem Zeitaufwand erreichbar.",
    "Ländliche Lage: durchschnittlich = grundlegende Alltagstauglichkeit vorhanden, regelmäßige Verbindung vorhanden, regionale Versorgung erreichbar.",
    "Ländliche Lage: gut = gute regionale ÖPNV-Anbindung, regelmäßige und zuverlässige Verbindungen, gute Erreichbarkeit umliegender Zentren.",
    "Ländliche Lage: sehr gut = überdurchschnittliche ÖPNV-Anbindung für ländliche Lage, hohe Alltagstauglichkeit auch ohne PKW.",
    "Ländliche Lage: exzellent = außergewöhnlich gute Mobilitätsqualität für ländliche Region, nahezu vollständige Alltagstauglichkeit ohne PKW."
  ].join("\n");
  const individualTransportGuideline = [
    "Guidelines zur Bewertung des Individualverkehrs",
    "Sehr schlecht: stark eingeschränkte Erreichbarkeit, abgelegene Lage, lange Fahrzeiten zu regionalen Zentren, schlechte Anbindung an Hauptverkehrsachsen.",
    "Schlecht: unterdurchschnittliche Verkehrsanbindung, eingeschränkte regionale Erreichbarkeit, längere Fahrzeiten zu wichtigen Zielen.",
    "Durchschnittlich: durchschnittliche Erreichbarkeit, regionale Zentren grundsätzlich erreichbar, akzeptable Verkehrssituation.",
    "Gut: gute regionale Erreichbarkeit, Hauptverkehrsachsen gut erreichbar, gute Alltagstauglichkeit.",
    "Sehr gut: sehr gute regionale und überregionale Erreichbarkeit, schnelle Verbindung zu wichtigen Zentren, hohe Pendlerattraktivität.",
    "Exzellent: hervorragende regionale und überregionale Verkehrsanbindung, exzellente Erreichbarkeit zentraler Ziele, außergewöhnlich hohe Mobilitätsqualität."
  ].join("\n");
  const infrastructureGuideline = [
    "Guidelines zur Bewertung der Infrastruktur des Viertels",
    "Sehr schlecht: kaum Nahversorgung im Umkreis.",
    "Schlecht: nur eingeschränkte Grundversorgung.",
    "Durchschnittlich: Supermarkt und Basisversorgung vorhanden.",
    "Gut: Supermarkt, Ärzte, Schulen innerhalb 10-15 Minuten.",
    "Sehr gut: mehrere Einkaufsmöglichkeiten, Ärzte und Gastronomie.",
    "Exzellent: nahezu vollständige Infrastruktur fußläufig."
  ].join("\n");

  type SeedCriterion = {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    weight: number;
    weightOverrides?: Prisma.InputJsonObject;
    sourceType: RatingSourceType;
    sourceField: string;
    mappingRule: Prisma.InputJsonObject;
    confidenceRule: Prisma.InputJsonObject;
    scoreDefinitions: Record<number, string>;
  };

  const criteria: SeedCriterion[] = [
    {
      id: "rating_crit_economics_purchase_power_v1",
      categoryId: "rating_cat_economics_v1",
      name: "Kaufkraft",
      description: "Kaufkraftindex am Standort.",
      weight: 0.2,
      sourceType: RatingSourceType.api,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: { 1: "< 85", 2: "85 - 92", 3: "92 - 100", 4: "100 - 108", 5: "108 - 118", 6: "> 118" }
    },
    {
      id: "rating_crit_economics_unemployment_rate_v1",
      categoryId: "rating_cat_economics_v1",
      name: "Arbeitslosenquote",
      description: "Aktuelle Arbeitslosenquote am Standort.",
      weight: 0.2,
      sourceType: RatingSourceType.api,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: { 1: "> 8,5%", 2: "7,0 % bis < 8,5 %", 3: "5,5 % bis < 7,0 %", 4: "4,0 % bis < 5,5 %", 5: "3,0 % bis < 4,0 %", 6: "< 3,0%" }
    },
    {
      id: "rating_crit_economics_unemployment_trend_v1",
      categoryId: "rating_cat_economics_v1",
      name: "Entwicklung der Arbeitslosenquote letzte 5 Jahre",
      description: "Entwicklung der Arbeitslosenquote der letzten 5 Jahre.",
      weight: 0.15,
      sourceType: RatingSourceType.api,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: { 1: "stark steigend (> +1,5%)", 2: "steigend (+0,5 bis +1,5 %)", 3: "leicht steigend (0 bis +0,5 %-Punkte)", 4: "stabil (-0,5 % bis 0%)", 5: "leicht fallend (-0,5 % bis -1,5%)", 6: "stark fallend (< -1,5%)" }
    },
    {
      id: "rating_crit_economics_migration_balance_v1",
      categoryId: "rating_cat_economics_v1",
      name: "Wanderungssaldo",
      description: "Wanderungssaldo am Standort.",
      weight: 0.2,
      sourceType: RatingSourceType.api,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: { 1: "< -5", 2: "-5 bis -2", 3: "-2 bis 0", 4: "0 bis +2", 5: "+2 bis +5", 6: "> +5" }
    },
    {
      id: "rating_crit_economics_population_trend_v1",
      categoryId: "rating_cat_economics_v1",
      name: "Bevölkerungsentwicklung",
      description: "Bevölkerungsentwicklung über 10 Jahre.",
      weight: 0.25,
      sourceType: RatingSourceType.api,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: { 1: "< -10% in 10 Jahren", 2: "-5% bis -10% in 10 Jahren", 3: "-1% bis -5% in 10 Jahren", 4: "-1% bis +2% in 10 Jahren", 5: "+2% bis +6% in 10 Jahren", 6: "> +6% in 10 Jahren" }
    },
    {
      id: "rating_crit_micro_public_transport_v1",
      categoryId: "rating_cat_microlocation_v1",
      name: "Anbindung öffentlicher Nahverkehr",
      description: publicTransportGuideline,
      weight: 0.23,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: { 1: "sehr schlecht", 2: "schlecht", 3: "durchschnittlich", 4: "gut", 5: "sehr gut", 6: "exzellent" }
    },
    {
      id: "rating_crit_micro_individual_transport_v1",
      categoryId: "rating_cat_microlocation_v1",
      name: "Individualverkehr",
      description: individualTransportGuideline,
      weight: 0.15,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: locationScoreDefinitions
    },
    {
      id: "rating_crit_micro_infrastructure_v1",
      categoryId: "rating_cat_microlocation_v1",
      name: "Infrastruktur des Viertels (Restaurant, Einkaufen, Schulen, Apotheken, Arztpraxen)",
      description: infrastructureGuideline,
      weight: 0.27,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: locationScoreDefinitions
    },
    {
      id: "rating_crit_micro_neighborhood_condition_v1",
      categoryId: "rating_cat_microlocation_v1",
      name: "Häuserzustand der Nachbarschaft, Umgebung",
      description: null,
      weight: 0.15,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "sichtbarer Leerstand, starker Sanierungsstau",
        2: "mehrere ungepflegte Objekte",
        3: "gemischtes Straßenbild",
        4: "überwiegend gepflegte Bebauung",
        5: "hochwertige Wohnbebauung",
        6: "Premiumumfeld mit sehr hoher Wohnqualität"
      }
    },
    {
      id: "rating_crit_micro_noise_emissions_v1",
      categoryId: "rating_cat_microlocation_v1",
      name: "Lärmbelastung, Emissionen",
      description: null,
      weight: 0.2,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "Einflugschneise, neben stark befahrener Autobahn / Hauptstraße / Bahnlinie",
        2: "neben stärker befahrener Straße, Autobahnabfahrt, Gewerbe- Industriegebiet",
        3: "neben innerstädtischer Hauptstraße, Bus- oder Straßenbahnlinien",
        4: "ruhige Nebenstraße, nahe Hauptverkehrsader",
        5: "ruhiges Wohngebiet, weit entfernt von Hauptstraßen, Grünflächen in der Nähe",
        6: "Vorort, ländliche Gegend, viele Grünflächen, Felder"
      }
    },
    {
      id: "rating_crit_maintenance_heating_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Heizung / Wärmeversorgung",
      description: "Zustand und Modernität der Wärmeversorgung.",
      weight: 0.25,
      weightOverrides: { house: 0.25, apartment: 0.2 },
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.heatingType",
      mappingRule: { type: "presence", presentScore: 4, missingScore: 2 },
      confidenceRule: { default: 0.45, missing: 0.2 },
      scoreDefinitions: {
        1: "Stark veraltetes oder technisch problematisches Heizsystem; hoher kurzfristiger Austauschbedarf wahrscheinlich.",
        2: "Deutlich veraltetes System; erhöhter Investitionsbedarf mittelfristig wahrscheinlich.",
        3: "Älteres, aber funktionales System; Modernisierung perspektivisch sinnvoll.",
        4: "Ordentlicher und gepflegter Zustand; aktuell kein akuter Investitionsbedarf erkennbar.",
        5: "Modernes und effizientes Heizsystem; niedrige Investitionswahrscheinlichkeit mittelfristig.",
        6: "Neuwertiges oder umfassend modernisiertes Heizsystem; langfristig geringer Investitionsbedarf erwartbar."
      }
    },
    {
      id: "rating_crit_maintenance_roof_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Dach",
      description: "Zustand und Instandhaltungsbedarf des Dachs.",
      weight: 0.15,
      weightOverrides: { house: 0.15, apartment: 0.1 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.__ratingRoofChoice",
      mappingRule: manualAnalystMapping,
      confidenceRule: manualAnalystConfidence,
      scoreDefinitions: {
        1: "Erhebliche sichtbare Schäden oder akuter Sanierungsbedarf.",
        2: "Deutliche Alterserscheinungen; mittelfristig hohe Investitionen wahrscheinlich.",
        3: "Älterer, aber funktionaler Zustand; Modernisierung perspektivisch sinnvoll.",
        4: "Technisch ordentlicher und gepflegter Zustand.",
        5: "Modernisiert oder sehr gepflegt; niedriger Investitionsbedarf.",
        6: "Neuwertig oder umfassend saniert; langfristig geringes CAPEX-Risiko."
      }
    },
    {
      id: "rating_crit_maintenance_flat_roof_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Flachdach",
      description: "Zustand und Risiko bei Flachdachanteilen.",
      weight: 0.15,
      weightOverrides: { house: 0.15, apartment: 0.1 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.__ratingFlatRoofChoice",
      mappingRule: manualAnalystMapping,
      confidenceRule: manualAnalystConfidence,
      scoreDefinitions: {
        1: "Erhebliche Schäden oder Undichtigkeiten; akuter Sanierungsbedarf.",
        2: "Deutliche Alterserscheinungen; mittelfristige Sanierung wahrscheinlich.",
        3: "Funktionaler älterer Zustand; perspektivischer Modernisierungsbedarf.",
        4: "Ordentlicher technischer Zustand; keine wesentlichen Mängel erkennbar.",
        5: "Moderne oder sanierte Abdichtung; gepflegter Zustand.",
        6: "Neuwertiges oder umfassend erneuertes Flachdachsystem."
      }
    },
    {
      id: "rating_crit_maintenance_facade_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Fassade",
      description: "Zustand der Fassade.",
      weight: 0.1,
      weightOverrides: { house: 0.1, apartment: 0.1 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "Erhebliche sichtbare Schäden; hoher kurzfristiger Investitionsbedarf.",
        2: "Deutliche Alterserscheinungen; Modernisierungsbedarf erkennbar.",
        3: "Funktionaler älterer Zustand; perspektivischer Modernisierungsbedarf.",
        4: "Gepflegter und ordentlicher Zustand.",
        5: "Modernisierte oder sehr gepflegte Fassade.",
        6: "Neuwertige oder umfassend sanierte Gebäudehülle."
      }
    },
    {
      id: "rating_crit_maintenance_masonry_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Mauerwerk/Bauausführung",
      description: "Baukonstruktion, Mauerwerk und Ausführungsqualität.",
      weight: 0.1,
      weightOverrides: { house: 0.1, apartment: 0.05 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "Erhebliche bauliche Mängel oder Feuchtigkeitsschäden.",
        2: "Deutliche bauliche Schwächen; erhöhter Sanierungsbedarf.",
        3: "Durchschnittliche ältere Bauausführung.",
        4: "Ordentliche und solide Bauausführung.",
        5: "Hochwertige oder modernisierte Bauausführung.",
        6: "Sehr hochwertige oder neuwertige Bauausführung."
      }
    },
    {
      id: "rating_crit_maintenance_bathrooms_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Sanitär / Bäder",
      description: "Zustand und Modernität von Sanitär und Bädern.",
      weight: 0.12,
      weightOverrides: { house: 0.12, apartment: 0.2 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "Stark veraltete Ausstattung; erheblicher Modernisierungsbedarf.",
        2: "Ältere Ausstattung mit deutlichen Gebrauchsspuren.",
        3: "Funktionaler älterer Zustand.",
        4: "Gepflegte und ordentliche Ausstattung.",
        5: "Modernisierte Sanitärbereiche.",
        6: "Neuwertige oder hochwertig modernisierte Sanitärbereiche."
      }
    },
    {
      id: "rating_crit_maintenance_electrical_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Elektro",
      description: "Zustand und Modernität der Elektroinstallation.",
      weight: 0.13,
      weightOverrides: { house: 0.13, apartment: 0.2 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "Stark veraltete Installation oder erkennbare Sicherheitsrisiken.",
        2: "Ältere Installation mit deutlichem Erneuerungsbedarf.",
        3: "Ältere, aber funktionale Installation.",
        4: "Ordentlicher technischer Zustand.",
        5: "Modernisierte Elektroinstallation.",
        6: "Neuwertige oder umfassend erneuerte Elektroinstallation."
      }
    },
    {
      id: "rating_crit_maintenance_windows_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Fenster",
      description: "Zustand und Modernität der Fenster.",
      weight: 0.15,
      weightOverrides: { house: 0.15, apartment: 0.15 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "Stark veraltete oder beschädigte Fenster.",
        2: "Ältere Fenster mit erkennbarem Modernisierungsbedarf.",
        3: "Funktionale ältere Fenster.",
        4: "Gepflegte und ordentliche Fenster.",
        5: "Modernisierte Fenster mit gutem energetischem Standard.",
        6: "Neuwertige energieeffiziente Fenster."
      }
    },
    {
      id: "rating_crit_energy_certificate_class_v1",
      categoryId: "rating_cat_energy_v1",
      name: "Energieausweis",
      description: "Energieeffizienzklasse aus dem Energieausweis.",
      weight: 1,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.energyClass",
      mappingRule: { type: "enum", scores: { "A+": 6, A: 6, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1, H: 1 }, defaultScore: 3 },
      confidenceRule: { default: 0.8, missing: 0.25 },
      scoreDefinitions: { 1: "G/H", 2: "F", 3: "E", 4: "D", 5: "C", 6: "A/B" }
    },
    {
      id: "rating_crit_property_layout_v1",
      categoryId: "rating_cat_property_v1",
      name: "Grundriss / Funktionalität",
      description: "Funktionalität und Marktgängigkeit des Grundrisses.",
      weight: 0.35,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "stark unpraktischer oder schwer nutzbarer Grundriss",
        2: "deutliche funktionale Einschränkungen",
        3: "durchschnittliche Nutzbarkeit",
        4: "funktionaler und marktgängiger Grundriss",
        5: "sehr guter und flexibler Grundriss",
        6: "außergewöhnlich gut nutzbarer, flexibler und sehr marktgängiger Grundriss"
      }
    },
    {
      id: "rating_crit_property_living_quality_v1",
      categoryId: "rating_cat_property_v1",
      name: "Wohngefühl / Attraktivität",
      description: "Subjektive Attraktivität und Wohngefühl des Objekts.",
      weight: 0.25,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.visualConditionRating",
      mappingRule: { type: "enum", scores: { very_bad: 1, bad: 2, medium: 3, moderate: 4, good: 5, very_good: 6 }, defaultScore: 4 },
      confidenceRule: { default: 0.7, missing: 0.35 },
      scoreDefinitions: {
        1: "stark unattraktiver oder veralteter Gesamteindruck",
        2: "einfacher, veralteter oder wenig ansprechender Gesamteindruck",
        3: "durchschnittliche Wohnqualität",
        4: "gepflegte und ansprechende Wohnqualität",
        5: "hochwertiger und moderner Gesamteindruck",
        6: "außergewöhnlich hochwertige und emotional sehr attraktive Wohnqualität"
      }
    },
    {
      id: "rating_crit_property_light_v1",
      categoryId: "rating_cat_property_v1",
      name: "Belichtung",
      description: "Belichtung und Helligkeit des Objekts.",
      weight: 0.2,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "sehr dunkle Wohnsituation",
        2: "eingeschränkte natürliche Belichtung",
        3: "durchschnittliche Lichtverhältnisse, ausreichende natürliche Belichtung",
        4: "gute natürliche Belichtung, angenehme Lichtverhältnisse",
        5: "sehr helle Wohnsituation mit hoher Aufenthaltsqualität",
        6: "außergewöhnlich helle und hochwertige Wohnsituation"
      }
    },
    {
      id: "rating_crit_property_outdoor_area_v1",
      categoryId: "rating_cat_property_v1",
      name: "Außenbereich",
      description: "Qualität und Nutzbarkeit von Balkon, Terrasse, Garten oder Außenflächen.",
      weight: 0.2,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "kein sinnvoll nutzbarer Außenbereich",
        2: "stark eingeschränkter Außenbereich",
        3: "grundlegender Außenbereich vorhanden, durchschnittliche Nutzbarkeit",
        4: "gut nutzbarer Außenbereich",
        5: "hochwertiger und gut nutzbarer Außenbereich",
        6: "außergewöhnlich attraktiver und hochwertig nutzbarer Außenbereich mit hohem Wohnwert"
      }
    }
  ];

  for (const criterion of criteria) {
    await prisma.ratingCriterion.upsert({
      where: { id: criterion.id },
      update: {
        versionId: version.id,
        categoryId: criterion.categoryId,
        name: criterion.name,
        description: criterion.description,
        weight: criterion.weight,
        weightOverrides: criterion.weightOverrides ?? undefined,
        sourceType: criterion.sourceType,
        required: true,
        active: true
      },
      create: {
        id: criterion.id,
        versionId: version.id,
        categoryId: criterion.categoryId,
        name: criterion.name,
        description: criterion.description,
        weight: criterion.weight,
        weightOverrides: criterion.weightOverrides ?? undefined,
        sourceType: criterion.sourceType,
        required: true,
        active: true
      }
    });

    await prisma.ratingFieldMapping.upsert({
      where: { id: `${criterion.id}_mapping` },
      update: {
        versionId: version.id,
        criterionId: criterion.id,
        sourceType: criterion.sourceType,
        sourceField: criterion.sourceField,
        mappingRule: criterion.mappingRule,
        confidenceRule: criterion.confidenceRule,
        active: true
      },
      create: {
        id: `${criterion.id}_mapping`,
        versionId: version.id,
        criterionId: criterion.id,
        sourceType: criterion.sourceType,
        sourceField: criterion.sourceField,
        mappingRule: criterion.mappingRule,
        confidenceRule: criterion.confidenceRule,
        active: true
      }
    });

    for (const scoreValue of [1, 2, 3, 4, 5, 6]) {
      const label = criterion.scoreDefinitions[scoreValue];
      await prisma.ratingScoreDefinition.upsert({
        where: { criterionId_scoreValue: { criterionId: criterion.id, scoreValue } },
        update: { versionId: version.id, label, description: `${criterion.name}: ${label}` },
        create: {
          id: `${criterion.id}_score_${scoreValue}`,
          versionId: version.id,
          criterionId: criterion.id,
          scoreValue,
          label,
          description: `${criterion.name}: ${label}`
        }
      });
    }
  }

  const adjustmentBounds = { lower: -0.001, upper: 0.0025 };
  const returnCurves: Array<{
    id: string;
    ratingClass: string;
    minScore: number;
    maxScore: number;
    baseTargetReturn: number;
    lowerReturnBound: number;
    upperReturnBound: number;
    returnRule: Prisma.InputJsonObject;
  }> = [
    { id: "rating_curve_no_regular_purchase_v1", ratingClass: "Kein Regelankauf", minScore: 0, maxScore: 2.49, baseTargetReturn: 0.1125, lowerReturnBound: 0.1125, upperReturnBound: 0.1125, returnRule: { type: "fixed", value: 0.1125 } },
    { id: "rating_curve_e_v1", ratingClass: "E", minScore: 2.5, maxScore: 3, baseTargetReturn: 0.1125, lowerReturnBound: 0.1115, upperReturnBound: 0.115, returnRule: { type: "linear", minScore: 2.5, maxScore: 3, minReturn: 0.1125, maxReturn: 0.109, adjustmentBounds } },
    { id: "rating_curve_d_v1", ratingClass: "D", minScore: 3.01, maxScore: 3.5, baseTargetReturn: 0.109, lowerReturnBound: 0.108, upperReturnBound: 0.1115, returnRule: { type: "linear", minScore: 3, maxScore: 3.5, minReturn: 0.109, maxReturn: 0.104, adjustmentBounds } },
    { id: "rating_curve_c_v1", ratingClass: "C", minScore: 3.51, maxScore: 4, baseTargetReturn: 0.104, lowerReturnBound: 0.103, upperReturnBound: 0.1065, returnRule: { type: "linear", minScore: 3.5, maxScore: 4, minReturn: 0.104, maxReturn: 0.099, adjustmentBounds } },
    { id: "rating_curve_b_minus_v1", ratingClass: "B-", minScore: 4.01, maxScore: 4.5, baseTargetReturn: 0.099, lowerReturnBound: 0.098, upperReturnBound: 0.1015, returnRule: { type: "linear", minScore: 4, maxScore: 4.5, minReturn: 0.099, maxReturn: 0.094, adjustmentBounds } },
    { id: "rating_curve_b_v1", ratingClass: "B", minScore: 4.51, maxScore: 5, baseTargetReturn: 0.094, lowerReturnBound: 0.093, upperReturnBound: 0.0965, returnRule: { type: "linear", minScore: 4.5, maxScore: 5, minReturn: 0.094, maxReturn: 0.09, adjustmentBounds } },
    { id: "rating_curve_a_minus_v1", ratingClass: "A-", minScore: 5.01, maxScore: 5.5, baseTargetReturn: 0.09, lowerReturnBound: 0.089, upperReturnBound: 0.0925, returnRule: { type: "linear", minScore: 5, maxScore: 5.5, minReturn: 0.09, maxReturn: 0.087, adjustmentBounds } },
    { id: "rating_curve_a_v1", ratingClass: "A", minScore: 5.51, maxScore: 6, baseTargetReturn: 0.087, lowerReturnBound: 0.086, upperReturnBound: 0.0895, returnRule: { type: "linear", minScore: 5.5, maxScore: 6, minReturn: 0.087, maxReturn: 0.084, adjustmentBounds } }
  ];

  for (const curve of returnCurves) {
    await prisma.ratingReturnCurve.upsert({
      where: { id: curve.id },
      update: { versionId: version.id, ...curve },
      create: { versionId: version.id, ...curve }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
