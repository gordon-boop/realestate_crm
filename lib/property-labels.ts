import type { Property } from "./domain.ts";

export const caseSourceLabels = {
  PARTNER: "Partner",
  INTERNAL: "Intern"
} as const;

export const heatingTypeLabels: Record<string, string> = {
  GAS: "Gasheizung",
  OIL: "Ölheizung",
  DISTRICT_HEATING: "Fernwärme",
  HEAT_PUMP: "Wärmepumpe",
  ELECTRIC: "Elektroheizung",
  PELLET: "Pelletheizung",
  OTHER: "Sonstige",
  CENTRAL: "Zentralheizung",
  FLOOR: "Etagenheizung",
  SINGLE_STOVE: "Einzelofen",
  NONE: "Keine Heizung",
  gas: "Gasheizung",
  oil: "Ölheizung",
  district_heating: "Fernwärme",
  heat_pump: "Wärmepumpe",
  electric: "Elektroheizung",
  pellet: "Pelletheizung",
  central: "Zentralheizung",
  floor: "Etagenheizung",
  single_stove: "Einzelofen",
  none: "Keine Heizung",
  other: "Sonstige"
};

export const heatingEnergySourceLabels: Record<string, string> = {
  GAS: "Gas",
  OIL: "Öl",
  DISTRICT_HEATING: "Fernwärme",
  HEAT_PUMP: "Wärmepumpe",
  ELECTRIC: "Strom",
  PELLET: "Pellets",
  OTHER: "Sonstige",
  gas: "Gas",
  oil: "Öl",
  district: "Fernwärme",
  district_heating: "Fernwärme",
  heat_pump: "Wärmepumpe",
  electricity: "Strom",
  electric: "Strom",
  wood_pellets: "Holz/Pellets",
  pellet: "Pellets",
  hybrid: "Hybrid",
  other: "Sonstige"
};

export const modernizationScopeLabels: Record<string, string> = {
  none: "keine",
  partial: "teilweise",
  complete: "vollständig",
  unknown: "unbekannt"
};

export const conditionRatingLabels: Record<string, string> = {
  very_good: "sehr gut",
  good: "gut",
  medium: "mittel",
  moderate: "mäßig",
  bad: "schlecht",
  very_bad: "sehr schlecht",
  unknown: "unbekannt"
};

export const modernizationComponentLabels: Record<string, string> = {
  heating: "Heizung",
  roof: "Dach",
  facade: "Fassade",
  windows: "Fenster",
  lines: "Leitungen",
  bathrooms: "Bad/Sanitär",
  sanitary: "Sanitär",
  electric: "Elektrik",
  interior: "Innenausbau",
  outdoor: "Außenanlagen",
  other: "Sonstiges"
};

export const buildingConditionComponentLabels: Record<string, string> = {
  roof: "Dach",
  facade: "Fassade",
  masonry: "Mauerwerk",
  windows: "Fenster",
  basement: "Keller",
  electric: "Elektrik",
  sanitary: "Sanitär",
  bathrooms: "Sanitär",
  interior: "Innenausbau",
  outdoor: "Außenanlagen",
  other: "Sonstiges"
};

export function labelFromMap(map: Record<string, string>, value?: string | null, fallback = "-"): string {
  if (!value) return fallback;
  return map[value] ?? map[value.toUpperCase()] ?? map[value.toLowerCase()] ?? value;
}

export function getCaseSourceLabel(value?: string | null): string {
  return labelFromMap(caseSourceLabels, value, "Partner");
}

export function getHeatingTypeLabel(value?: string | null): string {
  return labelFromMap(heatingTypeLabels, value);
}

export function getHeatingEnergySourceLabel(value?: string | null, otherValue?: string | null): string {
  if (value === "other" || value === "OTHER") return otherValue || "Sonstige";
  return labelFromMap(heatingEnergySourceLabels, value);
}

export function formatHeatingLabel(property?: Pick<Property, "heatingType" | "heatingEnergySource" | "heatingEnergySourceOther" | "heatingYear"> | null): string {
  if (!property?.heatingType && !property?.heatingEnergySource) return "-";
  const parts = [
    getHeatingTypeLabel(property.heatingType),
    property.heatingEnergySource ? getHeatingEnergySourceLabel(property.heatingEnergySource, property.heatingEnergySourceOther) : undefined,
    property.heatingYear ? String(property.heatingYear) : undefined
  ].filter((part) => part && part !== "-");
  return parts.length ? parts.join(" · ") : "-";
}
