import assert from "node:assert/strict";
import test from "node:test";
import { scoreFromRule } from "../lib/object-rating.ts";

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
