export const locales = ["de-DE", "en-GB"] as const;

export type AppLocale = (typeof locales)[number];

export const fallbackLocale: AppLocale = "de-DE";

export function normalizeLocale(value?: string | null): AppLocale {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "en" || normalized === "en-gb" || normalized.startsWith("en_")) return "en-GB";
  return fallbackLocale;
}

export function getDefaultLocale(): AppLocale {
  const configured = typeof window === "undefined"
    ? process.env.DEFAULT_LOCALE || process.env.NEXT_PUBLIC_DEFAULT_LOCALE
    : process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
  return normalizeLocale(configured);
}

export function localeLanguage(locale: AppLocale): "de" | "en" {
  return locale === "en-GB" ? "en" : "de";
}

