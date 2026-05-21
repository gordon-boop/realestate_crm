import type { OfferAssumptions, PropertyCondition, Valuation, DesiredModel } from "./domain.ts";

export type OfferCalculationInput = {
  valuation: Pick<Valuation, "marketValue">;
  condition: PropertyCondition;
  model: DesiredModel;
  residentialRightYears?: number;
};

export type OfferCalculationResult = {
  marketValue: number;
  adjustedMarketValue: number;
  residentialRightValue: number;
  riskDiscount: number;
  companyMargin: number;
  payoutAmount: number;
  assumptions: OfferAssumptions;
};

const conditionDiscounts: Record<PropertyCondition, number> = {
  very_good: 0,
  good: 0.02,
  average: 0.05,
  renovation_needed: 0.1
};

const residentialRightDiscounts: Record<number, number> = {
  5: 0.15,
  10: 0.28,
  15: 0.4
};

const riskDiscountRate = 0.05;
const companyMarginRate = 0.07;

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getResidentialRightRate(years?: number): number {
  if (!years) {
    return 0;
  }

  return residentialRightDiscounts[years] ?? residentialRightDiscounts[10];
}

export function calculateOffer(input: OfferCalculationInput): OfferCalculationResult {
  const conditionDiscountRate = conditionDiscounts[input.condition];
  const residentialRightRate = getResidentialRightRate(input.residentialRightYears);
  const marketValue = money(input.valuation.marketValue);
  const adjustedMarketValue = money(marketValue * (1 - conditionDiscountRate));
  const residentialRightValue = money(adjustedMarketValue * residentialRightRate);
  const riskDiscount = money(adjustedMarketValue * riskDiscountRate);
  const companyMargin = money(adjustedMarketValue * companyMarginRate);
  const payoutAmount = money(adjustedMarketValue - residentialRightValue - riskDiscount - companyMargin);

  return {
    marketValue,
    adjustedMarketValue,
    residentialRightValue,
    riskDiscount,
    companyMargin,
    payoutAmount,
    assumptions: {
      conditionDiscountRate,
      residentialRightRate,
      riskDiscountRate,
      companyMarginRate,
      formula:
        "payout = adjusted_market_value - residential_right_value - risk_discount - company_margin",
      note:
        "MVP-Platzhalter. Später durch versicherungsmathematisches und immobilienspezifisches Bewertungsmodell ersetzen."
    }
  };
}
