import type { Property, PropertyCondition, PropertyType } from "./domain.ts";
import { createMockValuation } from "./valuation-service.ts";

export type ValuationInput = {
  postalCode: string;
  city: string;
  propertyType: PropertyType | string;
  livingAreaSqm: number;
  yearBuilt?: number | null;
  condition: PropertyCondition | string;
};

export async function getMockValuation(input: ValuationInput) {
  const property: Property = {
    id: "valuation_preview",
    customerId: "preview",
    partnerId: "preview",
    caseSource: "PARTNER",
    propertyType: input.propertyType as PropertyType,
    street: "",
    postalCode: input.postalCode,
    city: input.city,
    livingAreaSqm: input.livingAreaSqm,
    yearBuilt: input.yearBuilt ?? undefined,
    condition: input.condition as PropertyCondition,
    desiredModel: "fixed_residential_right",
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const valuation = createMockValuation(property);
  return {
    provider: valuation.provider,
    marketValue: valuation.marketValue,
    valueMin: valuation.valueMin,
    valueMax: valuation.valueMax,
    confidenceScore: valuation.confidenceScore,
    rawResponse: valuation.rawResponseJson
  };
}

export { createMockValuation };
