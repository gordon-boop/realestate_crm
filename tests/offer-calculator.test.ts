import assert from "node:assert/strict";
import test from "node:test";
import { calculateOffer, getResidentialRightRate } from "../lib/offer-calculator.ts";

test("calculates MVP offer with condition, residential right, risk and margin discounts", () => {
  const result = calculateOffer({
    valuation: { marketValue: 500000 },
    condition: "good",
    model: "fixed_residential_right",
    residentialRightYears: 10
  });

  assert.equal(result.marketValue, 500000);
  assert.equal(result.adjustedMarketValue, 490000);
  assert.equal(result.residentialRightValue, 137200);
  assert.equal(result.riskDiscount, 24500);
  assert.equal(result.companyMargin, 34300);
  assert.equal(result.payoutAmount, 294000);
  assert.equal(result.assumptions.conditionDiscountRate, 0.02);
});

test("falls back to 10 year residential right rate for unsupported MVP duration", () => {
  assert.equal(getResidentialRightRate(7), 0.28);
});
