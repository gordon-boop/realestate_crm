import assert from "node:assert/strict";
import test from "node:test";
import { getLifetimeResidentialRightEligibility, isEligibleForLifetimeResidentialRight } from "../lib/residential-right-eligibility.ts";

const calculationDate = "2026-06-16";

test("one person 74 years and 11 months is not eligible for lifetime residential right", () => {
  const result = getLifetimeResidentialRightEligibility({ dateOfBirth: "1951-07-16" }, calculationDate, {
    recipients: "one_person"
  });

  assert.equal(result.eligible, false);
  assert.equal(result.reason, "too_young");
});

test("one person aged 75 is eligible for lifetime residential right", () => {
  assert.equal(isEligibleForLifetimeResidentialRight({ dateOfBirth: "1951-06-16" }, calculationDate, {
    recipients: "one_person"
  }), true);
});

test("two people aged 78 and 74 years 8 months are not eligible", () => {
  const result = getLifetimeResidentialRightEligibility({
    dateOfBirth: "1948-06-16",
    spouseDateOfBirth: "1951-10-16"
  }, calculationDate, {
    recipients: "both"
  });

  assert.equal(result.eligible, false);
  assert.equal(result.reason, "too_young");
});

test("two people aged 78 and 74 years 10 months are eligible with soon hint", () => {
  const result = getLifetimeResidentialRightEligibility({
    dateOfBirth: "1948-06-16",
    spouseDateOfBirth: "1951-08-16"
  }, calculationDate, {
    recipients: "both"
  });

  assert.equal(result.eligible, true);
  assert.equal(result.eligibleSoon, true);
  assert.equal(result.reason, "eligible_soon");
});

test("two people aged 82 and 74 years 10 months are eligible with soon hint", () => {
  const result = getLifetimeResidentialRightEligibility({
    dateOfBirth: "1944-06-16",
    spouseDateOfBirth: "1951-08-16"
  }, calculationDate, {
    recipients: "both"
  });

  assert.equal(result.eligible, true);
  assert.equal(result.eligibleSoon, true);
  assert.equal(result.reason, "eligible_soon");
});

test("two people aged 82 and 74 years 6 months are not eligible", () => {
  const result = getLifetimeResidentialRightEligibility({
    dateOfBirth: "1944-06-16",
    spouseDateOfBirth: "1951-12-16"
  }, calculationDate, {
    recipients: "both"
  });

  assert.equal(result.eligible, false);
  assert.equal(result.reason, "too_young");
});

test("two people aged 80 and 75 are eligible", () => {
  const result = getLifetimeResidentialRightEligibility({
    dateOfBirth: "1946-06-16",
    spouseDateOfBirth: "1951-06-16"
  }, calculationDate, {
    recipients: "both"
  });

  assert.equal(result.eligible, true);
  assert.equal(result.eligibleSoon, false);
  assert.equal(result.reason, "eligible");
});
