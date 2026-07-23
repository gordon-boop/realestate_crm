import { getRequestConfig } from "next-intl/server";
import { getDefaultLocale } from "./config";
import { getMessagesForLocale } from "./messages";

export default getRequestConfig(async () => {
  const locale = getDefaultLocale();
  return {
    locale,
    messages: getMessagesForLocale(locale),
    timeZone: "Europe/Berlin",
    now: new Date()
  };
});

