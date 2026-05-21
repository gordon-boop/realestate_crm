import assert from "node:assert/strict";
import test from "node:test";
import { calculateOffer, getResidentialRightRate } from "../lib/offer-calculator.ts";

test("calculates fixed residential right payout from the Excel core formula", () => {
  const result = calculateOffer({
    valuation: { marketValue: 500000 },
    condition: "good",
    model: "fixed_residential_right",
    residentialRightYears: 7,
    livingAreaSqm: 160,
    propertyType: "house",
    energyClass: "E",
    monthlyRentPerSqm: 6.2,
    garageCount: 1,
    garageRentMonthly: 30,
    interestRate: 0.032
  });

  assert.equal(result.marketValue, 500000);
  assert.equal(result.adjustedMarketValue, 500000);
  assert.equal(result.residentialRightValue, 85848);
  assert.equal(result.companyMargin, 12800);
  assert.equal(result.riskDiscount, 99008.84);
  assert.equal(result.payoutAmount, 302343.16);
  assert.equal(result.assumptions.productModel, "fixed_residential_right");
  assert.equal(result.assumptions.sourceCells?.payoutAmount, "Auszahlungstool_Master!T10");
});

test("calculates sale and leaseback payout from the Excel waterfall assumptions", () => {
  const result = calculateOffer({
    valuation: { marketValue: 500000 },
    condition: "good",
    model: "sale_and_leaseback"
  });

  assert.equal(result.marketValue, 500000);
  assert.equal(result.payoutAmount, 230000);
  assert.equal(result.riskDiscount, 270000);
  assert.equal(result.assumptions.productModel, "sale_and_leaseback");
  assert.equal(result.assumptions.components?.maintenancePledge, 12320);
  assert.equal(result.assumptions.components?.brokerageFee, 12500);
});

test("falls back to 10 year residential right rate for unsupported MVP duration", () => {
  assert.equal(getResidentialRightRate(7), 0.28);
});
