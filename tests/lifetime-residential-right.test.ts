import assert from "node:assert/strict";
import test from "node:test";
import { calculateLifetimeResidentialRightOffer } from "../lib/calculations/lifetimeResidentialRight.ts";
import { calculateOffer } from "../lib/offer-calculator.ts";

function assertApprox(actual: number, expected: number, tolerance: number) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

const excelLifetimeInput = {
  calculationDate: "2026-06-05",
  primaryOccupantDateOfBirth: "1951-01-01",
  primaryOccupantGender: "Male" as const,
  marketValue: 500000,
  livingAreaSqm: 100,
  internalRentProxyPerSqmPerMonth: 9,
  garageCount: 1,
  garageRentPerMonth: 50,
  energyEfficiencyClass: "D",
  propertyType: "House" as const,
  acquisitionCostRate: 0.09,
  salesCommissionRate: 0.015,
  targetIrr: 0.08,
  baseIndexationScenario: 0.02,
  terminalAge: 100,
  disposalPeriodYears: 1
};

test("matches the Excel Lifetime Cockpit for the single-person lifetime residential-right calculation", () => {
  const result = calculateLifetimeResidentialRightOffer(excelLifetimeInput);

  assertApprox(result.maximumCustomerPayout, 196456.34, 1);
  assertApprox(result.payoutRatio, 0.3929, 0.0001);
  assertApprox(result.weightedIrr, 0.08, 0.0001);
  assertApprox(result.expectedSaleYear, 12.4326, 0.01);
  assertApprox(result.lifetimeRightValue, 124716, 1);
  assertApprox(result.maintenanceReserve, 14919.09, 1);
  assertApprox(result.totalInvestorCommitment, 256375.43, 1);
  assertApprox(result.npvCheck, 0, 0.01);
  assert.equal(result.relevantAge, 75);
  assert.equal(result.relevantGender, "male");
  assert.equal(result.maintenanceRate, 12);
  assertApprox(result.mortalityWeightedExitRows.reduce((sum, row) => sum + row.exitProbability, 0), 1, 0.000001);
});

test("uses joint-life occupancy for two-person lifetime residential-right calculations", () => {
  const single = calculateLifetimeResidentialRightOffer(excelLifetimeInput);
  const joint = calculateLifetimeResidentialRightOffer({
    ...excelLifetimeInput,
    primaryOccupantDateOfBirth: "1946-01-01",
    primaryOccupantGender: "Male",
    secondOccupantDateOfBirth: "1951-01-01",
    secondOccupantGender: "Female"
  });

  assert.ok(joint.expectedSaleYear > single.expectedSaleYear);
  assert.ok(joint.maximumCustomerPayout < single.maximumCustomerPayout);
  assert.ok(joint.lifetimeRightValue > single.lifetimeRightValue);
  assert.equal(joint.relevantGender, "female");
  assert.ok(joint.mortalityWeightedExitRows.some((row) => row.ageSecond !== undefined));
  assertApprox(joint.mortalityWeightedExitRows.reduce((sum, row) => sum + row.exitProbability, 0), 1, 0.000001);
  assertApprox(joint.weightedIrr, 0.08, 0.0001);
});

test("maps the lifetime residential-right core result into the CRM offer shape", () => {
  const result = calculateOffer({
    valuation: { marketValue: 500000 },
    condition: "good",
    model: "fixed_residential_right",
    usageModel: "lifelong_residential_right",
    livingAreaSqm: 100,
    propertyType: "house",
    energyClass: "D",
    monthlyRentPerSqm: 9,
    garageCount: 1,
    garageMonthlyRent: 50,
    acquisitionCostRate: 0.09,
    salesCostRate: 0.015,
    targetReturn: 0.08,
    selectedIndexationScenario: 0.02,
    primaryDateOfBirth: "1951-01-01",
    primaryGender: "male",
    calculationDate: "2026-06-05"
  });

  assert.equal(result.marketValue, 500000);
  assert.equal(result.adjustedMarketValue, 500000);
  assertApprox(result.payoutAmount, 196456.34, 1);
  assertApprox(result.payoutRate ?? 0, 0.3929, 0.0001);
  assertApprox(result.residentialRightValue, 124716, 1);
  assertApprox(result.companyMargin, 14919.09, 1);
  assert.equal(result.calculationMode, "RATING_TARGET_RETURN_IRR");
  assert.equal(result.assumptions.productModel, "fixed_residential_right");
  assert.equal(result.assumptions.sourceWorkbook, "Calculation_Investor_Cockpit_eng_fix_term_and_lifetime_model_final.xlsx");
  assertApprox(result.assumptions.components?.weightedIrr ?? 0, 0.08, 0.0001);
});
