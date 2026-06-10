import assert from "node:assert/strict";
import test from "node:test";
import { calculateFixedResidentialRightOffer } from "../lib/calculations/fixedResidentialRight.ts";
import { calculateOffer, getResidentialRightRate } from "../lib/offer-calculator.ts";

function assertApprox(actual: number, expected: number, tolerance = 0.00000001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

const excelResidentialRightInput = {
  calculationDate: "2026-06-05",
  marketValue: 500000,
  livingAreaSqm: 100,
  monthlyRentPerSqm: 8,
  garageCount: 1,
  monthlyGarageRent: 50,
  energyClass: "E",
  propertyType: "APARTMENT" as const,
  fixedTermYears: 10,
  internalInterestRate: 0.032,
  acquisitionCostRate: 0.09,
  salesCommissionRate: 0.015,
  primaryDateOfBirth: "18.06.1950",
  primaryGender: "male" as const
};

test("matches the Excel master for the fixed residential-right core calculation", () => {
  const result = calculateFixedResidentialRightOffer(excelResidentialRightInput);

  assert.equal(result.marketValue, 500000);
  assert.equal(result.residentialRightValue, 102000);
  assert.equal(result.maintenanceReserve, 18700);
  assertApprox(result.steeringParameter, 140432.43, 0.01);
  assertApprox(result.payoutAmount, 238867.57, 0.01);
  assertApprox(result.payoutRatio, 0.4777351422, 0.0001);
  assertApprox(result.weightedIrr2Percent, 0.1180407868, 0.0001);
  assert.equal(result.termStatus, "OK");
  assert.equal(result.relevantAge, 75);
  assert.equal(result.relevantGender, "male");
});

test("maps the fixed residential-right core result into the CRM offer shape", () => {
  const result = calculateOffer({
    valuation: { marketValue: 500000 },
    condition: "good",
    model: "fixed_residential_right",
    residentialRightYears: 10,
    livingAreaSqm: 100,
    propertyType: "apartment",
    energyClass: "E",
    monthlyRentPerSqm: 8,
    garageCount: 1,
    garageMonthlyRent: 50,
    interestRate: 0.032,
    acquisitionCostRate: 0.09,
    salesCostRate: 0.015,
    primaryDateOfBirth: "18.06.1950",
    primaryGender: "male",
    calculationDate: "2026-06-05"
  });

  assert.equal(result.marketValue, 500000);
  assert.equal(result.adjustedMarketValue, 500000);
  assert.equal(result.residentialRightValue, 102000);
  assert.equal(result.companyMargin, 18700);
  assertApprox(result.riskDiscount, 140432.43, 0.01);
  assertApprox(result.payoutAmount, 238867.57, 0.01);
  assert.equal(result.calculationMode, undefined);
  assert.equal(result.assumptions.productModel, "fixed_residential_right");
  assert.equal(result.assumptions.sourceWorkbook, "Calculation_Investor_Cockpit_eng_wohnkapital_final_vers_2026.xlsx");
  assert.equal(result.assumptions.components?.maintenanceCost, 18700);
  assertApprox(result.assumptions.components?.weightedAnnualIrr ?? 0, 0.118041, 0.000001);
});

test("treats energy classes F, G and H as higher maintenance risk", () => {
  const houseResult = calculateFixedResidentialRightOffer({
    ...excelResidentialRightInput,
    propertyType: "HOUSE",
    energyClass: "G",
    garageCount: 0,
    monthlyGarageRent: 0
  });
  const apartmentResult = calculateFixedResidentialRightOffer({
    ...excelResidentialRightInput,
    propertyType: "APARTMENT",
    energyClass: "H",
    garageCount: 0,
    monthlyGarageRent: 0
  });

  assert.equal(houseResult.maintenanceReserve, 16500);
  assert.equal(apartmentResult.maintenanceReserve, 24200);
});

test("calculates Rueckmietverkauf demo payout and rent for 500000 market value", () => {
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

test("calculates Rueckmietverkauf demo payout and rent for 800000 market value", () => {
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

test("calculates Rueckmietverkauf demo payout and rent for 544276 market value", () => {
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
