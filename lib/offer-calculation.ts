import type { PropertyCondition } from "./domain.ts";
import { calculateOffer as calculateDomainOffer } from "./offer-calculator.ts";

export type OfferCalculationInput = {
  marketValue: number;
  condition: PropertyCondition;
  residentialRightYears?: number | null;
};

export type OfferCalculationResult = ReturnType<typeof calculateOffer>;

export function calculateOffer(input: OfferCalculationInput) {
  return calculateDomainOffer({
    valuation: { marketValue: input.marketValue },
    condition: input.condition,
    model: "fixed_residential_right",
    residentialRightYears: input.residentialRightYears ?? undefined
  });
}
