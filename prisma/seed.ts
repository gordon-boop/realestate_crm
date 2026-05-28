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

async function seedObjectRatingConfig(createdByUserId: string) {
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

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
