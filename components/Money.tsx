import { getDefaultLocale } from "@/i18n/config";
import { formatLocaleCurrency } from "@/lib/utils/numberParsing";

export function formatEuro(value?: number): string {
  if (typeof value !== "number") {
    return "-";
  }
  return formatLocaleCurrency(value, getDefaultLocale());
}

export function Money({ value }: { value?: number }) {
  return <>{formatEuro(value)}</>;
}
