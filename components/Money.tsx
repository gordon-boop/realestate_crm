export function formatEuro(value?: number): string {
  if (typeof value !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

export function Money({ value }: { value?: number }) {
  return <>{formatEuro(value)}</>;
}
