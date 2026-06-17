import { readFileSync } from "node:fs";
import path from "node:path";

export type OpenPlzPostalCodeEntry = {
  postalCode: string;
  city: string;
  federalState: string;
  countyName?: string | null;
  countyCode?: string | null;
};

export type FederalStateLookupResult =
  | (OpenPlzPostalCodeEntry & { source: "local"; status: "FOUND" })
  | { postalCode: string; federalState: null; source: "local"; status: "NOT_FOUND" };

const entries = JSON.parse(
  readFileSync(path.join(process.cwd(), "data", "openplz-de-postal-codes.json"), "utf8")
) as OpenPlzPostalCodeEntry[];

export const GERMAN_FEDERAL_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen"
] as const;

function cleanPostalCodeInput(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, "");
}

export function normalizeGermanPostalCode(value: unknown): string | undefined {
  const normalized = cleanPostalCodeInput(value).replace(/\D/g, "");
  return normalized.length === 5 ? normalized : undefined;
}

export function findOpenPlzPostalCode(postalCode: unknown, city?: unknown): OpenPlzPostalCodeEntry | undefined {
  const normalizedPostalCode = normalizeGermanPostalCode(postalCode);
  if (!normalizedPostalCode) return undefined;

  const matches = entries.filter((entry) => entry.postalCode === normalizedPostalCode);
  if (!matches.length) return undefined;

  const normalizedCity = String(city ?? "").trim().toLocaleLowerCase("de-DE");
  if (normalizedCity) {
    const exactCity = matches.find((entry) => entry.city.toLocaleLowerCase("de-DE") === normalizedCity);
    if (exactCity) return exactCity;
  }

  return matches[0];
}

export function getFederalStateByPostalCode(postalCode: unknown, city?: unknown): FederalStateLookupResult {
  const normalizedPostalCode = normalizeGermanPostalCode(postalCode);
  if (!normalizedPostalCode) {
    return {
      postalCode: cleanPostalCodeInput(postalCode),
      federalState: null,
      source: "local",
      status: "NOT_FOUND"
    };
  }

  const entry = findOpenPlzPostalCode(normalizedPostalCode, city);
  if (!entry) {
    return {
      postalCode: normalizedPostalCode,
      federalState: null,
      source: "local",
      status: "NOT_FOUND"
    };
  }

  return {
    ...entry,
    source: "local",
    status: "FOUND"
  };
}

export function enrichGermanPostalLocation<T extends {
  postalCode?: string | null;
  city?: string | null;
  federalState?: string | null;
}>(input: T): T {
  const match = getFederalStateByPostalCode(input.postalCode, input.city);
  if (match.status !== "FOUND") return input;

  return {
    ...input,
    postalCode: normalizeGermanPostalCode(input.postalCode) ?? input.postalCode,
    city: input.city || match.city,
    federalState: input.federalState || match.federalState
  };
}

export const OPENPLZ_POSTAL_CODE_COUNT = entries.length;
