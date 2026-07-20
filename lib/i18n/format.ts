import { getDefaultLocale, type AppLocale } from "@/i18n/config";

export function formatUiDate(value: Date | string | number, locale: AppLocale = getDefaultLocale()): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function formatUiCurrency(value: number, locale: AppLocale = getDefaultLocale(), maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(value);
}

export function formatUiNumber(value: number, locale: AppLocale = getDefaultLocale(), maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
}

export function formatUiPercent(value: number, locale: AppLocale = getDefaultLocale(), maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits }).format(value);
}

