export type AddressInput = {
  street?: string | null;
  houseNumber?: string | null;
  postalCode?: string | null;
  city?: string | null;
};

export type StreetAddressParts = {
  street: string;
  houseNumber: string;
  wasSplit: boolean;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Splits only a plausible house number at the end of a legacy street value.
 * Ambiguous values stay untouched so existing addresses cannot be damaged.
 */
export function splitStreetAndHouseNumber(streetValue: unknown, houseNumberValue?: unknown): StreetAddressParts {
  const street = clean(streetValue);
  const houseNumber = clean(houseNumberValue);
  if (houseNumber || !street) return { street, houseNumber, wasSplit: false };

  const match = street.match(/^(.+\p{L}[\p{L}\d.'’()\-\s]*?)\s+(\d+[A-Za-z]?(?:\s*[\/\-–]\s*\d+[A-Za-z]?)?(?:\s+[A-Za-z])?)$/u);
  if (!match) return { street, houseNumber: "", wasSplit: false };

  return {
    street: clean(match[1]),
    houseNumber: clean(match[2]),
    wasSplit: true
  };
}

export function formatStreetAddress(input: Pick<AddressInput, "street" | "houseNumber">): string {
  const parts = splitStreetAndHouseNumber(input.street, input.houseNumber);
  return [parts.street, parts.houseNumber].filter(Boolean).join(" ");
}

export function formatAddress(input: AddressInput, options: { multiline?: boolean } = {}): string {
  const streetLine = formatStreetAddress(input);
  const cityLine = [clean(input.postalCode), clean(input.city)].filter(Boolean).join(" ");
  return [streetLine, cityLine].filter(Boolean).join(options.multiline ? "\n" : ", ");
}
