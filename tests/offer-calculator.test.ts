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

test("calculates Rückmietverkauf demo payout and rent for 500000 market value", () => {
  const result = calculateOffer({
    valuation: { marketValue: 500000 },
    condition: "good",
    model: "sale_and_leaseback"
  });

  assert.equal(result.marketValue, 500000);
  assert.equal(result.payoutRate, 0.7);
  assert.equal(result.payoutAmount, 350000);
  assert.equal(result.annualRentRate, 0.05);
  assert.equal(result.annualRent, 17500);
  assert.equal(result.monthlyRent, 1458.33);
  assert.equal(result.riskDiscount, 150000);
  assert.equal(result.calculationMode, "DEMO_FIXED_RATE");
  assert.equal(result.assumptions.productModel, "sale_and_leaseback");
  assert.equal(result.assumptions.calculationMode, "DEMO_FIXED_RATE");
  assert.equal(result.assumptions.components?.payoutRate, 0.7);
  assert.equal(result.assumptions.components?.annualRentRate, 0.05);
  assert.equal(result.assumptions.components?.annualRent, 17500);
  assert.equal(result.assumptions.components?.monthlyRent, 1458.33);
});

test("calculates Rückmietverkauf demo payout and rent for 800000 market value", () => {
  const result = calculateOffer({
    valuation: { marketValue: 800000 },
    condition: "good",
    model: "sale_and_leaseback"
  });

  assert.equal(result.marketValue, 800000);
  assert.equal(result.payoutAmount, 560000);
  assert.equal(result.annualRent, 28000);
  assert.equal(result.monthlyRent, 2333.33);
  assert.equal(result.assumptions.components?.monthlyRent, 2333.33);
});

test("calculates Rückmietverkauf demo payout and rent for 544276 market value", () => {
  const result = calculateOffer({
    valuation: { marketValue: 544276 },
    condition: "good",
    model: "sale_and_leaseback"
  });

  assert.equal(result.marketValue, 544276);
  assert.equal(result.payoutRate, 0.7);
  assert.equal(result.payoutAmount, 380993.2);
  assert.equal(result.annualRentRate, 0.05);
  assert.equal(result.annualRent, 19049.66);
  assert.equal(result.monthlyRent, 1587.47);
  assert.equal(result.assumptions.components?.payoutAmount, 380993.2);
  assert.equal(result.assumptions.components?.annualRent, 19049.66);
  assert.equal(result.assumptions.components?.monthlyRent, 1587.47);
});

test("falls back to 10 year residential right rate for unsupported MVP duration", () => {
  assert.equal(getResidentialRightRate(7), 0.28);
});
