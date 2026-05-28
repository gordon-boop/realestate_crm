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
      description: "Objektrating-Konfiguration gemaess Excel-Master: Auswertung, wirtschaftliche Faktoren, Mikrolage, Instandhaltung, Energieausweis und Immobilie."
    },
    create: {
      id: "rating_version_1",
      versionNumber: 1,
      active: true,
      description: "Objektrating-Konfiguration gemaess Excel-Master: Auswertung, wirtschaftliche Faktoren, Mikrolage, Instandhaltung, Energieausweis und Immobilie.",
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
    { id: "rating_cat_energy_v1", name: "Energieausweis", weight: 0.1 },
    { id: "rating_cat_property_v1", name: "Immobilie", weight: 0.2 }
  ];

  for (const category of categories) {
    await prisma.ratingCategory.upsert({
      where: { id: category.id },
      update: { versionId: version.id, name: category.name, weight: category.weight, active: true },
      create: { ...category, versionId: version.id, active: true }
    });
  }

  const genericScoreDefinitions = {
    1: "stark negativ",
    2: "negativ",
    3: "unterdurchschnittlich",
    4: "solide",
    5: "gut",
    6: "sehr gut"
  };
  const locationScoreDefinitions = {
    1: "sehr schlecht",
    2: "schlecht",
    3: "maessig",
    4: "mittel",
    5: "gut",
    6: "sehr gut"
  };
  const analystMapping = { type: "presence", presentScore: 4, missingScore: 2 };
  const analystConfidence = { default: 0.45, missing: 0.2 };

  type SeedCriterion = {
    id: string;
    categoryId: string;
    name: string;
    description: string;
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
      name: "Arbeitslosenquote aktuell",
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
      name: "Entwicklung der Arbeitslosenquote",
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
      name: "Bevoelkerungsentwicklung",
      description: "Bevoelkerungsentwicklung ueber 10 Jahre.",
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
      name: "Anbindung oeffentlicher Nahverkehr",
      description: "Qualitaet der OePNV-Anbindung in der Mikrolage.",
      weight: 0.23,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: { ...locationScoreDefinitions, 6: "exzellent" }
    },
    {
      id: "rating_crit_micro_individual_transport_v1",
      categoryId: "rating_cat_microlocation_v1",
      name: "Individualverkehr",
      description: "Anbindung fuer den Individualverkehr.",
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
      name: "Infrastruktur des Viertels",
      description: "Restaurants, Einkauf, Schulen, Apotheken und Arztpraxen.",
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
      name: "Haeuserzustand der Nachbarschaft / Umgebung",
      description: "Strassenbild und Zustand der direkten Umgebung.",
      weight: 0.15,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "sichtbarer Leerstand, starker Sanierungsstau",
        2: "mehrere ungepflegte Objekte",
        3: "gemischtes Strassenbild",
        4: "ueberwiegend gepflegte Bebauung",
        5: "hochwertige Wohnbebauung",
        6: "Premiumumfeld mit sehr hoher Wohnqualitaet"
      }
    },
    {
      id: "rating_crit_micro_noise_emissions_v1",
      categoryId: "rating_cat_microlocation_v1",
      name: "Laermbelastung / Emissionen",
      description: "Laerm- und Emissionsbelastung der Mikrolage.",
      weight: 0.2,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.postalCode",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: {
        1: "Einflugschneise, Autobahn, Hauptstrasse oder Bahnlinie",
        2: "staerker befahrene Strasse, Autobahnabfahrt oder Gewerbe-/Industriegebiet",
        3: "innerstaedtische Hauptstrasse, Bus- oder Strassenbahnlinien",
        4: "ruhige Nebenstrasse nahe Hauptverkehrsader",
        5: "ruhiges Wohngebiet mit Gruenflaechen in der Naehe",
        6: "Vorort oder laendliche Gegend mit vielen Gruenflaechen"
      }
    },
    {
      id: "rating_crit_maintenance_heating_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Heizung / Waermeversorgung",
      description: "Zustand und Modernitaet der Waermeversorgung.",
      weight: 0.25,
      weightOverrides: { house: 0.25, apartment: 0.2 },
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.heatingType",
      mappingRule: { type: "presence", presentScore: 4, missingScore: 2 },
      confidenceRule: { default: 0.45, missing: 0.2 },
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_maintenance_roof_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Dach",
      description: "Zustand und Instandhaltungsbedarf des Dachs.",
      weight: 0.15,
      weightOverrides: { house: 0.15, apartment: 0.1 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_maintenance_flat_roof_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Flachdach",
      description: "Zustand und Risiko bei Flachdachanteilen.",
      weight: 0.15,
      weightOverrides: { house: 0.15, apartment: 0.1 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
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
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_maintenance_masonry_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Mauerwerk / Bauausfuehrung",
      description: "Baukonstruktion, Mauerwerk und Ausfuehrungsqualitaet.",
      weight: 0.1,
      weightOverrides: { house: 0.1, apartment: 0.05 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_maintenance_bathrooms_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Sanitaer / Baeder",
      description: "Zustand und Modernitaet von Sanitaer und Baedern.",
      weight: 0.12,
      weightOverrides: { house: 0.12, apartment: 0.2 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_maintenance_electrical_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Elektro",
      description: "Zustand und Modernitaet der Elektroinstallation.",
      weight: 0.13,
      weightOverrides: { house: 0.13, apartment: 0.2 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_maintenance_windows_v1",
      categoryId: "rating_cat_maintenance_v1",
      name: "Fenster",
      description: "Zustand und Modernitaet der Fenster.",
      weight: 0.15,
      weightOverrides: { house: 0.15, apartment: 0.15 },
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
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
      name: "Grundriss / Funktionalitaet",
      description: "Funktionalitaet und Marktgaengigkeit des Grundrisses.",
      weight: 0.35,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_property_living_quality_v1",
      categoryId: "rating_cat_property_v1",
      name: "Wohngefuehl / Attraktivitaet",
      description: "Subjektive Attraktivitaet und Wohngefuehl des Objekts.",
      weight: 0.25,
      sourceType: RatingSourceType.questionnaire,
      sourceField: "property.visualConditionRating",
      mappingRule: { type: "enum", scores: { very_bad: 1, bad: 2, medium: 3, moderate: 4, good: 5, very_good: 6 }, defaultScore: 4 },
      confidenceRule: { default: 0.7, missing: 0.35 },
      scoreDefinitions: genericScoreDefinitions
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
      scoreDefinitions: genericScoreDefinitions
    },
    {
      id: "rating_crit_property_outdoor_area_v1",
      categoryId: "rating_cat_property_v1",
      name: "Aussenbereich",
      description: "Qualitaet und Nutzbarkeit von Balkon, Terrasse, Garten oder Aussenflaechen.",
      weight: 0.2,
      sourceType: RatingSourceType.analyst,
      sourceField: "property.id",
      mappingRule: analystMapping,
      confidenceRule: analystConfidence,
      scoreDefinitions: genericScoreDefinitions
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
