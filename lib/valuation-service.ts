import type { Property, Valuation, ValuationProvider } from "./domain.ts";
import { makeId, nowIso } from "./id.ts";

export function createMockValuation(property: Property, provider: ValuationProvider = property.preferredValuationProvider ?? "mock"): Valuation {
  const typeFactor = {
    house: 1.08,
    single_family: 1.08,
    semi_detached: 1.04,
    row_house: 1.02,
    apartment: 1,
    multi_family: 1.18,
    other: 0.92
  }[property.propertyType];
  const conditionFactor = {
    very_good: 1.08,
    good: 1.02,
    average: 0.96,
    renovation_needed: 0.86
  }[property.condition];
  const ageFactor = property.yearBuilt ? Math.max(0.78, 1 - Math.max(0, 2026 - property.yearBuilt) * 0.003) : 0.95;
  const normalizedCity = property.city.toLowerCase();
  const cityFactor = normalizedCity.includes("münchen") || normalizedCity.includes("muenchen") ? 1.35 : normalizedCity.includes("berlin") ? 1.18 : 1;
  const basePerSqm = 4200;
  const marketValue = Math.round(property.livingAreaSqm * basePerSqm * typeFactor * conditionFactor * ageFactor * cityFactor);

  return {
    id: makeId("val"),
    propertyId: property.id,
    provider,
    status: "completed",
    sourceLabel: provider === "sprengnetter" ? "Sprengnetter-Stub" : "Mock",
    marketValue,
    valueMin: Math.round(marketValue * 0.9),
    valueMax: Math.round(marketValue * 1.1),
    confidenceScore: 0.72,
    rawResponseJson: {
      source: provider === "sprengnetter" ? "sprengnetter_stub" : "mock",
      note: provider === "sprengnetter" ? "Sprengnetter-Anbindung als MVP-Stub simuliert." : "Mock valuation. Replace with professional valuation API.",
      basePerSqm,
      typeFactor,
      conditionFactor,
      ageFactor,
      cityFactor
    },
    startedAt: nowIso(),
    completedAt: nowIso(),
    createdAt: nowIso()
  };
}
