import { getRequiredDocumentsForPropertyType } from "./document-requirements.ts";
import { getLifetimeResidentialRightEligibility } from "./residential-right-eligibility.ts";

type MissingSubmissionItem = {
  section: string;
  field: string;
  label: string;
  message: string;
};

type CaseViewLike = {
  customer?: Record<string, unknown>;
  property?: Record<string, unknown>;
  documents?: Array<Record<string, unknown>>;
};

const hasValue = (value: unknown) => value !== undefined && value !== null && String(value).trim() !== "";
const hasBoolean = (value: unknown) => value === true || value === false;

function add(missing: MissingSubmissionItem[], section: string, field: string, label: string, valid: boolean, message?: string) {
  if (valid) return;
  missing.push({
    section,
    field,
    label,
    message: message || `${label} fehlt.`
  });
}

function hasDocument(caseView: CaseViewLike, category: string) {
  return (caseView.documents || []).some((document) => document.category === category);
}

export function validateCaseSubmission(caseView: CaseViewLike) {
  const customer = caseView.customer || {};
  const property = caseView.property || {};
  const missingFields: MissingSubmissionItem[] = [];

  add(missingFields, "Persönliche Daten", "firstName", "Vorname", hasValue(customer.firstName));
  add(missingFields, "Persönliche Daten", "lastName", "Nachname", hasValue(customer.lastName));
  add(missingFields, "Persönliche Daten", "gender", "Geschlecht", hasValue(customer.gender));
  add(missingFields, "Persönliche Daten", "dateOfBirth", "Geburtsdatum", hasValue(customer.dateOfBirth));
  add(missingFields, "Persönliche Daten", "maritalStatus", "Familienstand", hasValue(customer.maritalStatus));
  add(missingFields, "Persönliche Daten", "monthlyIncomeRange", "Monatliche Einkünfte", hasValue(customer.monthlyIncomeRange));
  add(missingFields, "Persönliche Daten", "email", "E-Mail", hasValue(customer.email));
  add(missingFields, "Persönliche Daten", "phone", "Telefon", hasValue(customer.phone));
  add(missingFields, "Persönliche Daten", "street", "Straße", hasValue(customer.street));
  add(missingFields, "Persönliche Daten", "houseNumber", "Hausnummer", hasValue(customer.houseNumber), "Bitte geben Sie die Hausnummer an.");
  add(missingFields, "Persönliche Daten", "postalCode", "PLZ", hasValue(customer.postalCode));
  add(missingFields, "Persönliche Daten", "city", "Ort", hasValue(customer.city));
  add(missingFields, "Persönliche Daten", "consentDataProcessing", "Einwilligung zur Datenverarbeitung", customer.consentDataProcessing === true);

  if (customer.maritalStatus === "married") {
    add(missingFields, "Persönliche Daten", "spouseFirstName", "Vorname Kunde 2", hasValue(customer.spouseFirstName));
    add(missingFields, "Persönliche Daten", "spouseLastName", "Nachname Kunde 2", hasValue(customer.spouseLastName));
    add(missingFields, "Persönliche Daten", "spouseGender", "Geschlecht Kunde 2", hasValue(customer.spouseGender));
    add(missingFields, "Persönliche Daten", "spouseDateOfBirth", "Geburtsdatum Kunde 2", hasValue(customer.spouseDateOfBirth));
    add(missingFields, "Persönliche Daten", "propertyOwnership", "Eigentümer-Auswahl", hasValue(customer.propertyOwnership));
  }

  add(
    missingFields,
    "Wunschmodell",
    "desiredModel",
    "Wunschmodell",
    property.desiredModel === "fixed_residential_right" || property.desiredModel === "sale_and_leaseback",
    "Bitte wählen Sie ein Wunschmodell aus."
  );
  if (property.desiredModel === "fixed_residential_right") {
    add(missingFields, "Wunschmodell", "residentialRightRecipients", "Wohnrechtsberechtigte", hasValue(property.residentialRightRecipients));
    if (property.usageModel === "lifelong_residential_right") {
      const eligibility = getLifetimeResidentialRightEligibility(customer, new Date(), {
        recipients: String(property.residentialRightRecipients || ""),
        residentialRightPerson: String(property.residentialRightPerson || "")
      });
      add(missingFields, "Wunschmodell", "usageModel", "Lebenslanges Wohnrecht", eligibility.eligible, eligibility.message);
    } else {
      add(missingFields, "Wunschmodell", "desiredResidentialRightYears", "Dauer Wohnrecht", hasValue(property.desiredResidentialRightYears));
      add(missingFields, "Wunschmodell", "fixedTermReason", "Grund der Befristung", hasValue(property.fixedTermReason));
    }
  }
  if (property.desiredModel === "sale_and_leaseback") {
    add(missingFields, "Wunschmodell", "rentalModelDisclosureAccepted", "Belehrung Rückmietverkauf", property.rentalModelDisclosureAccepted === true);
  }

  add(missingFields, "Immobiliendaten", "propertyType", "Immobilientyp", hasValue(property.propertyType));
  add(missingFields, "Immobiliendaten", "yearBuilt", "Baujahr", hasValue(property.yearBuilt));
  add(missingFields, "Immobiliendaten", "livingAreaSqm", "Wohnfläche", Number(property.livingAreaSqm) > 0);
  add(missingFields, "Immobiliendaten", "plotAreaSqm", "Grundstück", property.plotAreaSqm !== undefined && property.plotAreaSqm !== null);
  add(missingFields, "Immobiliendaten", "visualConditionRating", "Optischer Zustand", hasValue(property.visualConditionRating));
  if (property.propertyType === "apartment") {
    add(missingFields, "Immobiliendaten", "coOwnershipShares", "Miteigentumsanteile", hasValue(property.coOwnershipShares));
    add(missingFields, "Immobiliendaten", "hasElevator", "Aufzug vorhanden", hasBoolean(property.hasElevator));
  }
  add(missingFields, "Immobiliendaten", "heatingType", "Heizungsart", hasValue(property.heatingType));
  add(missingFields, "Immobiliendaten", "heatingEnergySource", "Energieträger", hasValue(property.heatingEnergySource));
  add(missingFields, "Immobiliendaten", "heatingYear", "Heizungsjahr", hasValue(property.heatingYear));
  add(missingFields, "Immobiliendaten", "energyCertificateAvailable", "Energieausweis", hasBoolean(property.energyCertificateAvailable));
  if (property.energyCertificateAvailable === true) {
    add(missingFields, "Immobiliendaten", "energyCertificateType", "Typ Energieausweis", hasValue(property.energyCertificateType));
    add(missingFields, "Immobiliendaten", "energyClass", "Energieklasse", hasValue(property.energyClass));
  }

  add(missingFields, "Ausschlusskriterien", "knownMajorMaintenanceOrSpecialAssessments", "Instandhaltungen, Sanierungsmaßnahmen oder Sonderumlagen", hasBoolean(property.knownMajorMaintenanceOrSpecialAssessments));
  if (property.knownMajorMaintenanceOrSpecialAssessments === true) {
    add(missingFields, "Ausschlusskriterien", "knownMajorMaintenanceOrSpecialAssessmentsDescription", "Erläuterung Instandhaltungen / Sonderumlagen", hasValue(property.knownMajorMaintenanceOrSpecialAssessmentsDescription));
  }

  add(missingFields, "Modernisierungen / Zustand", "moistureDamageStatus", "Feuchtigkeit, Schimmel oder Wasserschäden", hasValue(property.moistureDamageStatus));
  if (property.moistureDamageStatus === "MINOR" || property.moistureDamageStatus === "SIGNIFICANT") {
    add(missingFields, "Modernisierungen / Zustand", "moistureDamageDescription", "Beschreibung Feuchtigkeit, Schimmel oder Wasserschäden", hasValue(property.moistureDamageDescription));
  }
  add(missingFields, "Modernisierungen / Zustand", "accessibilityAssessment", "Zugänglichkeit", hasValue(property.accessibilityAssessment));

  const missingDocuments: MissingSubmissionItem[] = [];
  for (const document of getRequiredDocumentsForPropertyType(String(property.propertyType || ""))) {
    if (document.category === "land_register") {
      add(
        missingDocuments,
        "Dokumente",
        "document:land_register_or_power",
        "Grundbuchauszug",
        hasDocument(caseView, "land_register") || hasDocument(caseView, "power_of_attorney"),
        "Grundbuchauszug fehlt."
      );
      continue;
    }
    add(
      missingDocuments,
      "Dokumente",
      `document:${document.category}`,
      document.label,
      hasDocument(caseView, document.category),
      `${document.label} fehlt.`
    );
  }

  const missing = [...missingFields, ...missingDocuments];
  return {
    isValid: missing.length === 0,
    missingFields,
    missingDocuments,
    missing,
    warnings: []
  };
}
