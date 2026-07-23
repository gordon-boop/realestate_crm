"use client";

import { NextIntlClientProvider } from "next-intl";
import type { AppLocale } from "@/i18n/config";

export function AppIntlProvider({
  children,
  locale,
  messages
}: {
  children: React.ReactNode;
  locale: AppLocale;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Berlin"
      getMessageFallback={() => locale === "en-GB" ? "Text unavailable" : "Text nicht verfügbar"}
      onError={(error) => {
        if (error.code !== "MISSING_MESSAGE" && process.env.NODE_ENV !== "production") {
          console.error(error);
        }
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
