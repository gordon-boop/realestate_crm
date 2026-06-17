import type { CaseView, ObjectRating, Property } from "./domain.ts";
import { parseGermanNumberInput } from "./utils/numberParsing.ts";

export type PostbankRegionCategory = "green" | "yellow" | "orange" | "red";
export type AcquisitionPrecheckCriterionStatus = "passed" | "exception_required" | "failed" | "unknown";
export type AcquisitionPrecheckResult = "acquirable" | "incomplete" | "exception_required" | "not_acquirable";
export type PreliminaryMarketValueSource =
  | "manual_estimate"
  | "broker_statement"
  | "market_data"
  | "internal_initial_estimate"
  | "other";

export type AcquisitionPrecheckData = {
  preliminaryMarketValue?: number;
  preliminaryMarketValueSource?: PreliminaryMarketValueSource;
  preliminaryMarketValueDate?: string;
  preliminaryMarketValueComment?: string;
  postbankRegionCategory?: PostbankRegionCategory;
  landValuePerSqm?: number;
  remainingUsefulLifeYears?: number;
  developmentPotential?: boolean;
  renovationPlanAvailable?: boolean;
  apartmentManagementAvailable?: boolean;
  exceptionRequested?: boolean;
  exceptionReason?: string;
  exceptionApprovedByUserId?: string;
  exceptionApprovedAt?: string;
  exceptionRejectedByUserId?: string;
  exceptionRejectedAt?: string;
  comment?: string;
  updatedAt?: string;
  updatedByUserId?: string;
};

export type AcquisitionPrecheckCriterion = {
  key: string;
  label: string;
  requirement: string;
  currentValue: string;
  status: AcquisitionPrecheckCriterionStatus;
  hardKo: boolean;
  comment?: string;
};

export type AcquisitionPrecheckSummary = {
  result: AcquisitionPrecheckResult;
  resultLabel: string;
  reason: string;
  criteria: AcquisitionPrecheckCriterion[];
  exceptionApproved: boolean;
  hasHardKo: boolean;
  hasExceptionRequired: boolean;
  hasUnknown: boolean;
  blocksOffer: boolean;
  blockReason?: string;
};

const regionLabels: Record<PostbankRegionCategory, string> = {
  green: "Grün",
  yellow: "Gelb",
  orange: "Orange",
  red: "Rot"
};

const propertyTypeLabels: Record<string, string> = {
  house: "Wohngebäude",
  single_family: "Einfamilienhaus",
  semi_detached: "Doppelhaushälfte",
  row_house: "Reihenhaus",
  apartment: "Eigentumswohnung"
};

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = parseGermanNumberInput(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatEuro(value: number | undefined): string {
  if (value === undefined) return "Nicht erfasst";
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;
}

function formatNumber(value: number | undefined, suffix = ""): string {
  if (value === undefined) return "Nicht erfasst";
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 2 })}${suffix}`;
}

function yesNo(value: boolean | undefined): string {
  if (value === true) return "Ja";
  if (value === false) return "Nein";
  return "Nicht erfasst";
}

function normalizeEnergyClass(value: string | undefined): string | undefined {
  const normalized = value?.trim().toUpperCase();
  return normalized || undefined;
}

export function getAcquisitionPrecheckData(property?: Pick<Property, "acquisitionPrecheck">): AcquisitionPrecheckData {
  const raw = property?.acquisitionPrecheck;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? raw as AcquisitionPrecheckData : {};
}

export function getPreliminaryMarketValue(caseView: Pick<CaseView, "property">, override?: number): number | undefined {
  return toNumber(override) ?? toNumber(getAcquisitionPrecheckData(caseView.property).preliminaryMarketValue);
}

export function getAppraisalMarketValue(caseView: Pick<CaseView, "valuation" | "offers">, override?: number): number | undefined {
  const bindingOffer = caseView.offers?.find((offer) => offer.kind === "binding");
  return toNumber(override)
    ?? toNumber(bindingOffer?.marketValue)
    ?? toNumber(caseView.valuation?.marketValue);
}

export function getPrecheckMarketValue(
  caseView: Pick<CaseView, "property" | "valuation" | "offers">,
  override?: number
): number | undefined {
  return getPreliminaryMarketValue(caseView, override);
}

function criterion(input: AcquisitionPrecheckCriterion): AcquisitionPrecheckCriterion {
  return input;
}

export function evaluateAcquisitionPrecheck(
  caseView: Pick<CaseView, "property" | "valuation" | "offers" | "objectRatings">,
  options: { marketValueOverride?: number; marketValueMode?: "preliminary" | "appraisal" } = {}
): AcquisitionPrecheckSummary {
  const property = caseView.property;
  const data = getAcquisitionPrecheckData(property);
  const marketValueMode = options.marketValueMode ?? "preliminary";
  const marketValue = marketValueMode === "appraisal"
    ? getAppraisalMarketValue(caseView, options.marketValueOverride)
    : getPreliminaryMarketValue(caseView, options.marketValueOverride);
  const rating = caseView.objectRatings?.[0] as ObjectRating | undefined;
  const ratingScore = toNumber(rating?.totalScore);
  const energyClass = normalizeEnergyClass(property.energyClass);
  const exceptionApproved = Boolean(data.exceptionApprovedAt);
  const criteria: AcquisitionPrecheckCriterion[] = [];

  const region = data.postbankRegionCategory;
  criteria.push(criterion({
    key: "region",
    label: "Region gemäß Postbank Wohnatlas",
    requirement: "Grüne Regionen zulässig, gelbe Regionen mit Ausnahmeprüfung, orange/rote Regionen ausgeschlossen.",
    currentValue: region ? regionLabels[region] : "Nicht erfasst",
    status: !region ? "unknown" : region === "green" ? "passed" : region === "yellow" ? "exception_required" : "failed",
    hardKo: region === "orange" || region === "red",
    comment: region === "yellow" ? "Gelbe Region: Ausnahmefreigabe erforderlich." : region === "orange" || region === "red" ? "Orange/rote Region ist ausgeschlossen." : undefined
  }));

  criteria.push(criterion({
    key: "market_value",
    label: marketValueMode === "appraisal" ? "Gutachtenwert" : "Vorläufiger Verkehrswert",
    requirement: "Mindestens 250.000 € und maximal 1.000.000 €.",
    currentValue: formatEuro(marketValue),
    status: marketValue === undefined ? "unknown" : marketValue >= 250000 && marketValue <= 1000000 ? "passed" : "failed",
    hardKo: marketValue !== undefined && (marketValue < 250000 || marketValue > 1000000),
    comment: marketValue === undefined
      ? marketValueMode === "appraisal"
        ? "Bitte erfassen Sie zuerst den Gutachtenwert."
        : "Bitte erfassen Sie zuerst einen vorläufigen Verkehrswert."
      : marketValue < 250000
        ? `${marketValueMode === "appraisal" ? "Gutachtenwert" : "Verkehrswert"} liegt unter 250.000 €.`
        : marketValue > 1000000
          ? `${marketValueMode === "appraisal" ? "Gutachtenwert" : "Verkehrswert"} liegt über 1.000.000 €.`
          : "Verkehrswert innerhalb Ankaufskorridor."
  }));

  const landValue = toNumber(data.landValuePerSqm);
  criteria.push(criterion({
    key: "land_value",
    label: "Bodenrichtwert",
    requirement: "Größer als 100 €/m².",
    currentValue: landValue === undefined ? "Nicht erfasst" : `${landValue.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €/m²`,
    status: landValue === undefined ? "unknown" : landValue > 100 ? "passed" : "failed",
    hardKo: landValue !== undefined && landValue <= 100,
    comment: landValue !== undefined && landValue <= 100 ? "Bodenrichtwert liegt bei maximal 100 €/m²." : undefined
  }));

  const propertyType = property.propertyType;
  const apartmentManagementMissing = propertyType === "apartment" && data.apartmentManagementAvailable === false;
  const apartmentManagementUnknown = propertyType === "apartment" && data.apartmentManagementAvailable !== true && data.apartmentManagementAvailable !== false;
  const allowedPropertyType = ["house", "single_family", "semi_detached", "row_house", "apartment"].includes(propertyType);
  criteria.push(criterion({
    key: "property_type",
    label: "Objektart",
    requirement: "Wohngebäude bis 2 Einheiten, EFH, DHH, Reihenhaus oder ETW mit Verwaltung.",
    currentValue: `${propertyTypeLabels[propertyType] ?? propertyType}${propertyType === "apartment" ? ` · Verwaltung: ${yesNo(data.apartmentManagementAvailable)}` : ""}`,
    status: !allowedPropertyType || apartmentManagementMissing ? "failed" : apartmentManagementUnknown ? "unknown" : "passed",
    hardKo: !allowedPropertyType || apartmentManagementMissing,
    comment: apartmentManagementMissing ? "Eigentumswohnung ohne WEG-/Hausverwaltung ist ausgeschlossen." : apartmentManagementUnknown ? "Bei Eigentumswohnungen muss die Verwaltung bestätigt werden." : undefined
  }));

  const usefulLife = toNumber(data.remainingUsefulLifeYears);
  criteria.push(criterion({
    key: "remaining_useful_life",
    label: "Restnutzungsdauer",
    requirement: "Mehr als 35 Jahre; bei Entwicklungspotenzial Ausnahmeprüfung möglich.",
    currentValue: usefulLife === undefined ? "Nicht erfasst" : `${usefulLife.toLocaleString("de-DE", { maximumFractionDigits: 0 })} Jahre`,
    status: usefulLife === undefined ? "unknown" : usefulLife > 35 ? "passed" : data.developmentPotential ? "exception_required" : "failed",
    hardKo: usefulLife !== undefined && usefulLife <= 35 && !data.developmentPotential,
    comment: usefulLife !== undefined && usefulLife <= 35 && data.developmentPotential ? "Kurze Restnutzungsdauer mit Entwicklungspotenzial: Ausnahmefreigabe erforderlich." : usefulLife !== undefined && usefulLife <= 35 ? "Restnutzungsdauer liegt bei maximal 35 Jahren." : undefined
  }));

  const energyStatus = !energyClass
    ? "unknown"
    : ["A", "B", "C", "D", "E", "F"].includes(energyClass)
      ? "passed"
      : ["G", "H"].includes(energyClass)
        ? "exception_required"
        : "unknown";
  criteria.push(criterion({
    key: "energy_class",
    label: "Energieklasse",
    requirement: "A bis F zulässig; G/H nur mit Sanierungs-/Modernisierungsplan oder Ausnahmeprüfung.",
    currentValue: energyClass ? `${energyClass}${["G", "H"].includes(energyClass) ? ` · Sanierungsplan: ${yesNo(data.renovationPlanAvailable)}` : ""}` : "Nicht erfasst",
    status: energyStatus,
    hardKo: false,
    comment: ["G", "H"].includes(energyClass ?? "") ? "Energieklasse G/H: Sanierungsplan oder Ausnahmefreigabe erforderlich." : undefined
  }));

  const livingArea = toNumber(property.livingAreaSqm);
  criteria.push(criterion({
    key: "living_area",
    label: "Wohnfläche je Einheit",
    requirement: "Unter 225 m² je Wohneinheit.",
    currentValue: formatNumber(livingArea, " m²"),
    status: livingArea === undefined ? "unknown" : livingArea < 225 ? "passed" : "exception_required",
    hardKo: false,
    comment: livingArea !== undefined && livingArea >= 225 ? "Wohnfläche ab 225 m²: interne Ausnahmeprüfung erforderlich." : undefined
  }));

  criteria.push(criterion({
    key: "monument_protection",
    label: "Denkmalschutz",
    requirement: "Kein Denkmalschutz.",
    currentValue: yesNo(property.monumentProtection),
    status: property.monumentProtection ? "failed" : "passed",
    hardKo: Boolean(property.monumentProtection),
    comment: property.monumentProtection ? "Denkmalschutz ist ein hartes KO-Kriterium." : undefined
  }));

  criteria.push(criterion({
    key: "leasehold",
    label: "Erbbaurecht",
    requirement: "Kein Erbbaurecht.",
    currentValue: yesNo(property.leasehold),
    status: property.leasehold ? "failed" : "passed",
    hardKo: Boolean(property.leasehold),
    comment: property.leasehold ? "Erbbaurecht ist ein hartes KO-Kriterium." : undefined
  }));

  criteria.push(criterion({
    key: "rating_threshold",
    label: "Interne Rating-Schwelle",
    requirement: "Rating mindestens 2,5 von 6,0.",
    currentValue: ratingScore === undefined ? "Noch nicht bewertet" : ratingScore.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 }),
    status: ratingScore === undefined ? "unknown" : ratingScore >= 2.5 ? "passed" : "failed",
    hardKo: ratingScore !== undefined && ratingScore < 2.5,
    comment: ratingScore === undefined ? "Dieses Kriterium wird nach Ratingberechnung final bewertet." : ratingScore < 2.5 ? "Rating liegt unterhalb der internen Ankaufsschwelle." : undefined
  }));

  const hardKoItems = criteria.filter((item) => item.status === "failed" && item.hardKo);
  const failedItems = criteria.filter((item) => item.status === "failed");
  const exceptionItems = criteria.filter((item) => item.status === "exception_required");
  const unknownItems = criteria.filter((item) => item.status === "unknown" && item.key !== "rating_threshold");
  const hasHardKo = hardKoItems.length > 0 || failedItems.length > 0;
  const hasExceptionRequired = exceptionItems.length > 0;

  if (hasHardKo) {
    const marketFailure = failedItems.find((item) => item.key === "market_value");
    return {
      result: "not_acquirable",
      resultLabel: "Nicht ankaufsfähig",
      reason: hardKoItems[0]?.comment ?? failedItems[0]?.comment ?? "Mindestens ein KO-Kriterium ist nicht erfüllt.",
      criteria,
      exceptionApproved,
      hasHardKo: true,
      hasExceptionRequired,
      hasUnknown: unknownItems.length > 0,
      blocksOffer: true,
      blockReason: marketFailure?.comment ?? "Der Fall erfüllt die Ankaufskriterien nicht."
    };
  }

  if (unknownItems.length > 0) {
    const marketUnknown = unknownItems.find((item) => item.key === "market_value");
    return {
      result: "incomplete",
      resultLabel: "Prüfung unvollständig",
      reason: marketUnknown?.comment ?? "Bitte vervollständigen Sie die Vorprüfung.",
      criteria,
      exceptionApproved,
      hasHardKo: false,
      hasExceptionRequired,
      hasUnknown: true,
      blocksOffer: true,
      blockReason: marketUnknown?.comment ?? "Bitte vervollständigen Sie die Vorprüfung."
    };
  }

  if (hasExceptionRequired && !exceptionApproved) {
    const first = exceptionItems[0] ?? unknownItems[0];
    return {
      result: "exception_required",
      resultLabel: "Ausnahmeprüfung erforderlich",
      reason: first?.comment ?? "Für diesen Fall ist eine Ausnahmefreigabe oder Vervollständigung der Vorprüfung erforderlich.",
      criteria,
      exceptionApproved,
      hasHardKo: false,
      hasExceptionRequired: true,
      hasUnknown: unknownItems.length > 0,
      blocksOffer: true,
      blockReason: "Für diesen Fall ist eine Ausnahmefreigabe erforderlich."
    };
  }

  return {
    result: hasExceptionRequired ? "exception_required" : "acquirable",
    resultLabel: hasExceptionRequired ? "Ausnahmeprüfung freigegeben" : "Ankaufsfähig",
    reason: hasExceptionRequired ? "Ausnahmeprüfung wurde freigegeben." : "Alle erfassten Ankaufskriterien sind erfüllt.",
    criteria,
    exceptionApproved,
    hasHardKo: false,
    hasExceptionRequired,
    hasUnknown: unknownItems.length > 0,
    blocksOffer: false
  };
}

export function assertAcquisitionPrecheckAllowsOffer(
  caseView: Pick<CaseView, "property" | "valuation" | "offers" | "objectRatings">,
  options: { marketValueOverride?: number; marketValueMode?: "preliminary" | "appraisal" } = {}
) {
  const precheck = evaluateAcquisitionPrecheck(caseView, options);
  if (precheck.blocksOffer) throw new Error(precheck.blockReason);
  return precheck;
}

export function koCriteriaMessages(precheck: AcquisitionPrecheckSummary): string[] {
  return precheck.criteria
    .filter((criterion) => criterion.status === "failed" && criterion.hardKo)
    .map((criterion) => `${criterion.label}: ${criterion.comment ?? "nicht bestanden"}`);
}
