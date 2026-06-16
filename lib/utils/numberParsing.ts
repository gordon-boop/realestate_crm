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
