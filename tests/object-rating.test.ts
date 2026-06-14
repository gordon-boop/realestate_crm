import assert from "node:assert/strict";
import test from "node:test";
import { calculateRating, deriveInvestmentFilter, evaluateRatingGate, ratingReviewAfterAppraisalStatus, scoreFromRule } from "../lib/object-rating.ts";

test("object rating range mapping derives score from configured rule", () => {
  const score = scoreFromRule(1978, {
    type: "range",
    ranges: [
      { min: 2000, score: 5 },
      { min: 1970, max: 1999, score: 3 },
      { max: 1969, score: 2 }
    ]
  });

  assert.equal(score, 3);
});

test("object rating document mapping uses document status without hardcoded criteria", () => {
  const score = scoreFromRule("energy_certificate", {
    type: "document_status",
    category: "energy_certificate",
    scores: { ok: 6, missing: 1 },
    missingScore: 1
  }, {
    documents: [{ category: "energy_certificate", status: "ok" }]
  });

  assert.equal(score, 6);
});

test("object rating target return follows Excel linear curve", () => {
  const config = {
    categories: [{ id: "cat", weight: 1 }],
    criteria: [{ id: "crit", categoryId: "cat", weight: 1, weightOverrides: null }],
    returnCurves: [{
      ratingClass: "A-",
      minScore: 5.01,
      maxScore: 5.5,
      baseTargetReturn: 0.09,
      lowerReturnBound: 0.089,
      upperReturnBound: 0.0925,
      returnRule: {
        type: "linear",
        minScore: 5,
        maxScore: 5.5,
        minReturn: 0.09,
        maxReturn: 0.087,
        adjustmentBounds: { lower: -0.001, upper: 0.0025 }
      }
    }]
  } as any;

  const result = calculateRating(config, [{ criterionId: "crit", finalScore: 5.25 }]);

  assert.equal(result.totalScore, 5.25);
  assert.equal(result.targetReturn, 0.0885);
  assert.equal(result.returnBounds.lower, 0.0875);
  assert.equal(result.returnBounds.upper, 0.091);
});

test("object rating total score rounds mathematically to two decimals", () => {
  const config = {
    categories: [{ id: "cat", weight: 1 }],
    criteria: [{ id: "crit", categoryId: "cat", weight: 1, weightOverrides: null }],
    returnCurves: []
  } as any;

  for (const value of [2.49, 2.5, 3.49, 3.5, 4.49, 4.5]) {
    const result = calculateRating(config, [{ criterionId: "crit", finalScore: value }]);
    assert.equal(result.totalScore, value);
  }
});

test("object rating weighted rounding uses standard half-up behaviour", () => {
  const config = {
    categories: [{ id: "cat", weight: 1 }],
    criteria: [
      { id: "a", categoryId: "cat", weight: 1, weightOverrides: null },
      { id: "b", categoryId: "cat", weight: 1, weightOverrides: null }
    ],
    returnCurves: []
  } as any;

  const result = calculateRating(config, [
    { criterionId: "a", finalScore: 2.49 },
    { criterionId: "b", finalScore: 2.5 }
  ]);

  assert.equal(result.totalScore, 2.5);
});

test("object rating uses apartment-specific maintenance weights", () => {
  const config = {
    categories: [{ id: "maintenance", weight: 1 }],
    criteria: [
      { id: "bath", categoryId: "maintenance", weight: 0.5, weightOverrides: { apartment: 1 } },
      { id: "roof", categoryId: "maintenance", weight: 0.5, weightOverrides: { apartment: 0 } }
    ],
    returnCurves: []
  } as any;

  const result = calculateRating(config, [
    { criterionId: "bath", finalScore: 6 },
    { criterionId: "roof", finalScore: 1 }
  ], { propertyType: "apartment" });

  assert.equal(result.totalScore, 6);
});

test("object rating keeps Excel category order", () => {
  const config = {
    categories: [
      { id: "energy", name: "Energieausweis", weight: 0.1 },
      { id: "property", name: "Immobilie", weight: 0.2 },
      { id: "economics", name: "Wirtschaftliche Faktoren", weight: 0.2 },
      { id: "maintenance", name: "Instandhaltungsaufwand", weight: 0.2 },
      { id: "micro", name: "Mikrolage", weight: 0.3 }
    ],
    criteria: [],
    returnCurves: []
  } as any;

  const result = calculateRating(config, []);

  assert.deepEqual(result.categoryScores.map((item) => item.category.name), [
    "Wirtschaftliche Faktoren",
    "Mikrolage",
    "Instandhaltungsaufwand",
    "Immobilie",
    "Energieausweis"
  ]);
});

test("object rating excludes flat roof when roof is selected", () => {
  const config = {
    categories: [{ id: "maintenance", name: "Instandhaltungsaufwand", weight: 1 }],
    criteria: [
      { id: "rating_crit_maintenance_roof_v1", categoryId: "maintenance", weight: 0.5, weightOverrides: null },
      { id: "rating_crit_maintenance_flat_roof_v1", categoryId: "maintenance", weight: 0.5, weightOverrides: null },
      { id: "facade", categoryId: "maintenance", weight: 0.5, weightOverrides: null }
    ],
    returnCurves: []
  } as any;

  const roofResult = calculateRating(config, [
    { criterionId: "rating_crit_maintenance_roof_v1", finalScore: 6 },
    { criterionId: "facade", finalScore: 4 }
  ]);
  const conflictingResult = calculateRating(config, [
    { criterionId: "rating_crit_maintenance_roof_v1", finalScore: 6 },
    { criterionId: "rating_crit_maintenance_flat_roof_v1", finalScore: 1 },
    { criterionId: "facade", finalScore: 4 }
  ]);

  assert.equal(roofResult.totalScore, 5);
  assert.equal(conflictingResult.totalScore, 4);
});

test("object rating below acquisition threshold blocks offers", () => {
  const rating = {
    totalScore: 2.3,
    status: "approved",
    approvedAt: "2026-06-01T10:00:00.000Z",
    scores: [{ criterionId: "crit", finalScore: 2 }],
    auditLogs: []
  } as any;

  const investment = deriveInvestmentFilter(rating);
  const gate = evaluateRatingGate([rating], { expertOpinionReceivedAt: undefined } as any, "indicative");

  assert.equal(investment.acquisitionThresholdPassed, false);
  assert.equal(investment.treatmentLabel, "Unterhalb der Ankaufsschwelle");
  assert.equal(gate.allowed, false);
  assert.equal(gate.reason, "Objekt liegt unterhalb der Ankaufsschwelle.");
});

test("object rating 3 is a review case but can proceed after approval", () => {
  const rating = {
    totalScore: 3.1,
    status: "approved",
    approvedAt: "2026-06-01T10:00:00.000Z",
    scores: [{ criterionId: "crit", finalScore: 3 }],
    auditLogs: []
  } as any;

  const investment = deriveInvestmentFilter(rating);
  const gate = evaluateRatingGate([rating], { expertOpinionReceivedAt: undefined } as any, "indicative");

  assert.equal(investment.treatmentLabel, "Zusätzliche Prüfung erforderlich");
  assert.equal(investment.acquisitionThresholdPassed, true);
  assert.equal(gate.allowed, true);
});

test("object rating 4 to 6 receives standard approval after rating approval", () => {
  const rating = {
    totalScore: 4.2,
    status: "approved",
    approvedAt: "2026-06-01T10:00:00.000Z",
    scores: [{ criterionId: "crit", finalScore: 4 }],
    auditLogs: []
  } as any;

  const investment = deriveInvestmentFilter(rating);
  const gate = evaluateRatingGate([rating], { expertOpinionReceivedAt: undefined } as any, "indicative");

  assert.equal(investment.treatmentLabel, "Standardfreigabe");
  assert.equal(investment.scoreBandLabel, "4 · Solides Objekt");
  assert.equal(gate.allowed, true);
});

test("binding offer requires rating approval after appraisal receipt", () => {
  const staleRating = {
    totalScore: 4.2,
    status: "approved",
    approvedAt: "2026-06-01T10:00:00.000Z",
    scores: [{ criterionId: "crit", finalScore: 4 }],
    auditLogs: []
  } as any;
  const refreshedRating = {
    ...staleRating,
    approvedAt: "2026-06-03T10:00:00.000Z"
  } as any;
  const property = { expertOpinionReceivedAt: "2026-06-02T10:00:00.000Z" } as any;

  const staleReview = ratingReviewAfterAppraisalStatus(staleRating, property);
  const staleGate = evaluateRatingGate([staleRating], property, "binding");
  const refreshedGate = evaluateRatingGate([refreshedRating], property, "binding");

  assert.equal(staleReview.label, "Erforderlich");
  assert.equal(staleGate.allowed, false);
  assert.equal(staleGate.reason, "Bitte schließen Sie zuerst das Rating-Review nach Gutachten ab.");
  assert.equal(refreshedGate.allowed, true);
});
