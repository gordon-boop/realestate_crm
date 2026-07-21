export type NumberInputLocale = "de-DE" | "en-GB";

function resolveNumberInputLocale(locale: string | undefined): NumberInputLocale {
  return locale?.toLowerCase().startsWith("en") ? "en-GB" : "de-DE";
}

function cleanNumberInput(value: unknown): { raw: string; negative: boolean } | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? { raw: String(Math.abs(value)), negative: value < 0 } : null;
  }

  const cleaned = String(value)
    .trim()
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[\u20ac\u00a3$%]/g, "")
    .replace(/[^\d,.\-\s']/g, "")
    .trim();
  if (!cleaned || !/\d/.test(cleaned)) return null;

  const negative = cleaned.startsWith("-");
  if (cleaned.replace(/[^-]/g, "").length > 1 || (cleaned.includes("-") && !negative)) return null;
  return {
    raw: cleaned.replace(/-/g, "").replace(/[\s']/g, ""),
    negative,
  };
}

/**
 * Parses a number according to the active UI locale. Separators are never
 * guessed across locales: 400.000 is 400000 in de-DE and 400 in en-GB.
 */
export function parseLocaleNumberInput(value: unknown, locale: string = "de-DE"): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = cleanNumberInput(value);
  if (!cleaned) return null;

  const resolvedLocale = resolveNumberInputLocale(locale);
  const decimalSeparator = resolvedLocale === "de-DE" ? "," : ".";
  const groupingSeparator = resolvedLocale === "de-DE" ? "." : ",";
  const decimalParts = cleaned.raw.split(decimalSeparator);
  if (decimalParts.length > 2) return null;

  const [groupedInteger, fraction] = decimalParts;
  if (!groupedInteger) return null;
  const integerGroups = groupedInteger.split(groupingSeparator);
  if (integerGroups.some((group) => !/^\d+$/.test(group))) return null;
  if (integerGroups.length > 1) {
    const validGrouping = /^\d{1,3}$/.test(integerGroups[0])
      && integerGroups.slice(1).every((group) => /^\d{3}$/.test(group));
    if (!validGrouping) return null;
  }
  if (fraction !== undefined && !/^\d+$/.test(fraction)) return null;

  const normalized = `${integerGroups.join("")}${fraction === undefined ? "" : `.${fraction}`}`;
  const parsed = Number(`${cleaned.negative ? "-" : ""}${normalized}`);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseLocaleCurrencyInput(value: unknown, locale: string = "de-DE"): number | null {
  return parseLocaleNumberInput(value, locale);
}

export function parseLocalePercentInput(value: unknown, locale: string = "de-DE"): number | null {
  if (value === null || value === undefined || value === "") return null;
  const hasPercentSign = typeof value === "string" && value.includes("%");
  const parsed = parseLocaleNumberInput(value, locale);
  if (parsed === null) return null;
  if (hasPercentSign || Math.abs(parsed) > 1) return parsed / 100;
  return parsed;
}

export function formatLocaleNumber(
  value: unknown,
  locale: string = "de-DE",
  options: Intl.NumberFormatOptions = {},
): string {
  const numericValue = typeof value === "number" ? value : parseLocaleNumberInput(value, locale);
  if (numericValue === null || !Number.isFinite(numericValue)) return "";
  return new Intl.NumberFormat(resolveNumberInputLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(numericValue);
}

export function formatLocaleCurrency(
  value: unknown,
  locale: string = "de-DE",
  currencyOrOptions: string | Intl.NumberFormatOptions = "EUR",
  options: Intl.NumberFormatOptions = {},
): string {
  const numericValue = typeof value === "number" ? value : parseLocaleCurrencyInput(value, locale);
  if (numericValue === null || !Number.isFinite(numericValue)) return "";
  const currency = typeof currencyOrOptions === "string" ? currencyOrOptions : "EUR";
  const resolvedOptions = typeof currencyOrOptions === "string" ? options : currencyOrOptions;
  return new Intl.NumberFormat(resolveNumberInputLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    ...resolvedOptions,
  }).format(numericValue);
}

export function formatLocalePercent(
  value: unknown,
  locale: string = "de-DE",
  options: Intl.NumberFormatOptions = {},
): string {
  const numericValue = typeof value === "number" ? value : parseLocalePercentInput(value, locale);
  if (numericValue === null || !Number.isFinite(numericValue)) return "";
  return new Intl.NumberFormat(resolveNumberInputLocale(locale), {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(numericValue);
}

export function parseGermanNumberInput(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const raw = String(value)
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/[€%]/g, "")
    .replace(/[^\d,.\-\s]/g, "");

  if (!raw.trim()) return null;

  let normalized = raw.replace(/\s+/g, "");
  const negative = normalized.startsWith("-");
  normalized = normalized.replace(/-/g, "");
  if (!normalized) return null;

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  } else if (hasDot) {
    const parts = normalized.split(".");
    const looksLikeThousands =
      parts.length > 1
      && parts[0].length >= 1
      && parts[0].length <= 3
      && parts.slice(1).every((part) => part.length === 3);
    normalized = looksLikeThousands ? parts.join("") : normalized;
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(`${negative ? "-" : ""}${normalized}`);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseGermanCurrencyInput(value: unknown): number | null {
  return parseGermanNumberInput(value);
}

export function parseGermanPercentInput(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const hasPercentSign = typeof value === "string" && value.includes("%");
  const parsed = parseGermanNumberInput(value);
  if (parsed === null) return null;
  if (hasPercentSign) return parsed / 100;
  return Math.abs(parsed) > 1 ? parsed / 100 : parsed;
}

export function formatGermanNumber(value: unknown, options: Intl.NumberFormatOptions = {}): string {
  const numericValue = typeof value === "number" ? value : parseGermanNumberInput(value);
  if (numericValue === null || !Number.isFinite(numericValue)) return "";
  return new Intl.NumberFormat("de-DE", options).format(numericValue);
}

export function formatGermanCurrency(value: unknown, options: Intl.NumberFormatOptions = {}): string {
  const numericValue = typeof value === "number" ? value : parseGermanCurrencyInput(value);
  if (numericValue === null || !Number.isFinite(numericValue)) return "";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    ...options
  }).format(numericValue);
}
