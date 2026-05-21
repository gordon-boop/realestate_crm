import {
  DesiredModel,
  DocumentCategory,
  DocumentRequirementLevel,
  DocumentStatus,
  OfferKind,
  OfferStatus,
  PartnerStatus,
  PrismaClient,
  PropertyCondition,
  PropertyStatus,
  PropertyType,
  ReminderStatus,
  UserRole,
  ValuationProvider,
  ValuationStatus
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const partner = await prisma.partner.upsert({
    where: { email: "kontakt@heimwert.local" },
    update: {},
    create: {
      companyName: "Heimwert Makler GmbH",
      contactName: "Mara Seidel",
      email: "kontakt@heimwert.local",
      phone: "+49 30 123456",
      address: "Friedrichstrasse 12, 10117 Berlin",
      status: PartnerStatus.active
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    update: {},
    create: {
      name: "Admin Demo",
      email: "admin@demo.local",
      passwordHash: "demo1234",
      role: UserRole.admin
    }
  });

  const partnerUser = await prisma.user.upsert({
    where: { email: "makler@demo.local" },
    update: {},
    create: {
      partnerId: partner.id,
      name: "Mara Seidel",
      email: "makler@demo.local",
      passwordHash: "demo1234",
      role: UserRole.partner
    }
  });

  const customer = await prisma.customer.upsert({
    where: { id: "seed_customer_schmidt" },
    update: {},
    create: {
      id: "seed_customer_schmidt",
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
    where: { id: "seed_property_stuttgart_1" },
    update: {},
    create: {
      id: "seed_property_stuttgart_1",
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
