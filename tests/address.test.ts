import assert from "node:assert/strict";
import test from "node:test";
import { formatAddress, formatStreetAddress, splitStreetAndHouseNumber } from "../lib/address.ts";
import { validateCaseSubmission } from "../lib/case-submission-validation.ts";
import { customerCreateSchema } from "../lib/validation.ts";

test("splits unambiguous legacy German street addresses", () => {
  assert.deepEqual(splitStreetAndHouseNumber("Danneckerstraße 23"), {
    street: "Danneckerstraße",
    houseNumber: "23",
    wasSplit: true
  });
  assert.equal(splitStreetAndHouseNumber("Hauptstraße 12a").houseNumber, "12a");
  assert.equal(splitStreetAndHouseNumber("Musterweg 12–14").houseNumber, "12–14");
  assert.equal(splitStreetAndHouseNumber("Am Hang 7/1").houseNumber, "7/1");
});

test("keeps ambiguous legacy street values unchanged", () => {
  assert.deepEqual(splitStreetAndHouseNumber("Danneckerstraße"), {
    street: "Danneckerstraße",
    houseNumber: "",
    wasSplit: false
  });
});

test("prefers explicitly separated house number and formats the full address", () => {
  assert.equal(formatStreetAddress({ street: "Danneckerstraße", houseNumber: "23 A" }), "Danneckerstraße 23 A");
  assert.equal(formatAddress({ street: "Danneckerstraße", houseNumber: "23", postalCode: "70182", city: "Stuttgart" }), "Danneckerstraße 23, 70182 Stuttgart");
  assert.equal(formatAddress({ street: "Danneckerstraße 23", postalCode: "70182", city: "Stuttgart" }), "Danneckerstraße 23, 70182 Stuttgart");
});

test("customer drafts accept house number strings without numeric conversion", () => {
  const customer = customerCreateSchema.parse({
    firstName: "Eva",
    lastName: "Schmidt",
    street: "Danneckerstraße",
    houseNumber: "12–14",
    postalCode: "70182",
    city: "Stuttgart",
    consentDataProcessing: true
  });
  assert.equal(customer.houseNumber, "12–14");
});

test("final submission reports a missing house number with the German message", () => {
  const result = validateCaseSubmission({
    customer: { street: "Danneckerstraße", postalCode: "70182", city: "Stuttgart" },
    property: {},
    documents: []
  });
  const houseNumber = result.missingFields.find((item) => item.field === "houseNumber");
  assert.equal(houseNumber?.message, "Bitte geben Sie die Hausnummer an.");
});
