import assert from "node:assert/strict";
import test from "node:test";
import { evaluateAcquisitionPrecheck } from "../lib/acquisition-precheck.ts";

function caseView(overrides: any = {}) {
  return {
    property: {
      id: "property_1",
      propertyType: "single_family",
      livingAreaSqm: 140,
      energyClass: "C",
      leasehold: false,
      monumentProtection: false,
      acquisitionPrecheck: {
        preliminaryMarketValue: 500000,
        postbankRegionCategory: "green",
        landValuePerSqm: 420,
        remainingUsefulLifeYears: 55,
        ...overrides.acquisitionPrecheck
      },
      ...overrides.property
    },
    valuation: overrides.valuation,
    offers: overrides.offers ?? [],
    objectRatings: overrides.objectRatings ?? [{
      totalScore: 4.2,
      status: "approved",
      scores: [{ criterionId: "crit", finalScore: 4 }],
      auditLogs: []
    }]
  } as any;
}

test("acquisition precheck passes with green region and complete core data", () => {
  const result = evaluateAcquisitionPrecheck(caseView());

  assert.equal(result.result, "acquirable");
  assert.equal(result.blocksOffer, false);
});

test("acquisition precheck blocks market values below and above thresholds", () => {
  const tooLow = evaluateAcquisitionPrecheck(caseView({ acquisitionPrecheck: { preliminaryMarketValue: 240000 } }));
  const tooHigh = evaluateAcquisitionPrecheck(caseView({ acquisitionPrecheck: { preliminaryMarketValue: 1100000 } }));

  assert.equal(tooLow.result, "not_acquirable");
  assert.match(tooLow.blockReason ?? "", /250\.000/);
  assert.equal(tooHigh.result, "not_acquirable");
});

test("acquisition precheck is incomplete without preliminary market value", () => {
  const result = evaluateAcquisitionPrecheck(caseView({
    acquisitionPrecheck: { preliminaryMarketValue: undefined }
  }));

  assert.equal(result.result, "incomplete");
  assert.equal(result.blocksOffer, true);
  assert.equal(result.criteria.find((item) => item.key === "market_value")?.status, "unknown");
});

test("acquisition precheck blocks leasehold and monument protection", () => {
  const leasehold = evaluateAcquisitionPrecheck(caseView({ property: { leasehold: true } }));
  const monument = evaluateAcquisitionPrecheck(caseView({ property: { monumentProtection: true } }));

  assert.equal(leasehold.result, "not_acquirable");
  assert.equal(monument.result, "not_acquirable");
});

test("yellow Postbank region requires exception approval before offer flow", () => {
  const pending = evaluateAcquisitionPrecheck(caseView({
    acquisitionPrecheck: { postbankRegionCategory: "yellow", exceptionRequested: true }
  }));
  const approved = evaluateAcquisitionPrecheck(caseView({
    acquisitionPrecheck: { postbankRegionCategory: "yellow", exceptionApprovedAt: "2026-06-10T10:00:00.000Z" }
  }));

  assert.equal(pending.result, "exception_required");
  assert.equal(pending.blocksOffer, true);
  assert.equal(approved.blocksOffer, false);
});

test("rating below 2.5 becomes a hard KO once rating exists", () => {
  const result = evaluateAcquisitionPrecheck(caseView({
    objectRatings: [{
      totalScore: 2.3,
      status: "approved",
      scores: [{ criterionId: "crit", finalScore: 2 }],
      auditLogs: []
    }]
  }));

  assert.equal(result.result, "not_acquirable");
  assert.equal(result.criteria.find((item) => item.key === "rating_threshold")?.status, "failed");
});
