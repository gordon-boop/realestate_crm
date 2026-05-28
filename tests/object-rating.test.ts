import assert from "node:assert/strict";
import test from "node:test";
import { calculateRating, scoreFromRule } from "../lib/object-rating.ts";

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
