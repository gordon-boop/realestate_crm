import type { AppLocale } from "./config";

import deCommon from "@/messages/de/common.json";
import deNavigation from "@/messages/de/navigation.json";
import deDashboard from "@/messages/de/dashboard.json";
import deLeads from "@/messages/de/leads.json";
import deCustomers from "@/messages/de/customers.json";
import dePrecheck from "@/messages/de/precheck.json";
import deRating from "@/messages/de/rating.json";
import deOffers from "@/messages/de/offers.json";
import deClosing from "@/messages/de/closing.json";
import dePortfolio from "@/messages/de/portfolio.json";
import enCommon from "@/messages/en/common.json";
import enNavigation from "@/messages/en/navigation.json";
import enDashboard from "@/messages/en/dashboard.json";
import enLeads from "@/messages/en/leads.json";
import enCustomers from "@/messages/en/customers.json";
import enPrecheck from "@/messages/en/precheck.json";
import enRating from "@/messages/en/rating.json";
import enOffers from "@/messages/en/offers.json";
import enClosing from "@/messages/en/closing.json";
import enPortfolio from "@/messages/en/portfolio.json";

type Messages = Record<string, unknown>;

const germanMessages = {
  common: deCommon,
  navigation: deNavigation,
  dashboard: deDashboard,
  leads: deLeads,
  customers: deCustomers,
  precheck: dePrecheck,
  rating: deRating,
  offers: deOffers,
  closing: deClosing,
  portfolio: dePortfolio
} satisfies Messages;

const englishMessages = {
  common: enCommon,
  navigation: enNavigation,
  dashboard: enDashboard,
  leads: enLeads,
  customers: enCustomers,
  precheck: enPrecheck,
  rating: enRating,
  offers: enOffers,
  closing: enClosing,
  portfolio: enPortfolio
} satisfies Messages;

function mergeWithGermanFallback(fallback: Messages, translated: Messages): Messages {
  return Object.fromEntries(Object.entries(fallback).map(([key, fallbackValue]) => {
    const translatedValue = translated[key];
    if (
      fallbackValue && translatedValue &&
      typeof fallbackValue === "object" && !Array.isArray(fallbackValue) &&
      typeof translatedValue === "object" && !Array.isArray(translatedValue)
    ) {
      return [key, mergeWithGermanFallback(fallbackValue as Messages, translatedValue as Messages)];
    }
    return [key, translatedValue ?? fallbackValue];
  }));
}

export function getMessagesForLocale(locale: AppLocale): Messages {
  return locale === "en-GB"
    ? mergeWithGermanFallback(germanMessages, englishMessages)
    : germanMessages;
}

export const defaultMessages = germanMessages;

