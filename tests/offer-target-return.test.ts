import assert from "node:assert/strict";
import test from "node:test";
import { calculateFixedResidentialRightOffer } from "../lib/calculations/fixedResidentialRight.ts";
import { buildOfferRatingSnapshot, resolveOfferTargetReturn } from "../lib/offer-target-return.ts";

const rating = {
  id: "rating-1",
  configVersionId: "rating-version-1",
  ratingClass: "A",
  baseTargetReturn: 0.08,
  lowerReturnBound: 0.075,
  upperReturnBound: 0.085,
  finalTargetReturn: 0.08
};

const fixedInput = {
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
  primaryGender: "male" as const,
  selectedIndexationScenario: 0.02 as const
};

test("uses the final Rating return by default and accepts values inside the corridor", () => {
  assert.equal(resolveOfferTargetReturn(rating), 0.08);
  assert.equal(resolveOfferTargetReturn(rating, 0.075), 0.075);
  assert.equal(resolveOfferTargetReturn(rating, 0.085), 0.085);
});

test("rejects Offer Target IRRs outside the approved Rating corridor", () => {
  assert.throws(() => resolveOfferTargetReturn(rating, 0.0749), /unterhalb/);
  assert.throws(() => resolveOfferTargetReturn(rating, 0.0851), /oberhalb/);
});

test("stores the selected return together with the reproducible Rating context", () => {
  assert.deepEqual(buildOfferRatingSnapshot(rating, 0.0825), {
    ratingId: "rating-1",
    configVersionId: "rating-version-1",
    ratingClass: "A",
    baseTargetReturn: 0.08,
    lowerReturnBound: 0.075,
    upperReturnBound: 0.085,
    finalTargetReturn: 0.08,
    selectedTargetReturn: 0.0825
  });
});

test("solves the fixed-term payout backwards to the selected mortality-weighted Target IRR", () => {
  const lowerReturn = calculateFixedResidentialRightOffer({ ...fixedInput, targetReturn: 0.075 });
  const upperReturn = calculateFixedResidentialRightOffer({ ...fixedInput, targetReturn: 0.085 });

  assert.ok(Math.abs(lowerReturn.selectedWeightedIrr - 0.075) < 0.000001);
  assert.ok(Math.abs(upperReturn.selectedWeightedIrr - 0.085) < 0.000001);
  assert.ok(lowerReturn.payoutAmount > upperReturn.payoutAmount);
});
