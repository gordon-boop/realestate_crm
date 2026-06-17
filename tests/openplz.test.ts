import assert from "node:assert/strict";
import test from "node:test";

import { enrichGermanPostalLocation, findOpenPlzPostalCode, getFederalStateByPostalCode, normalizeGermanPostalCode } from "../lib/openplz.ts";

test("normalizes German postal codes", () => {
  assert.equal(normalizeGermanPostalCode(" 70563 "), "70563");
  assert.equal(normalizeGermanPostalCode("DE-22301"), "22301");
  assert.equal(normalizeGermanPostalCode("1234"), undefined);
});

test("finds OpenPLZ location by postal code", () => {
  const entry = findOpenPlzPostalCode("22301");
  assert.equal(entry?.city, "Hamburg");
  assert.equal(entry?.federalState, "Hamburg");
});

test("maps German postal codes to federal states from local lookup", () => {
  const examples = [
    ["70173", "Baden-Württemberg"],
    ["80331", "Bayern"],
    ["10115", "Berlin"],
    ["20095", "Hamburg"],
    ["01067", "Sachsen"]
  ] as const;

  for (const [postalCode, federalState] of examples) {
    const result = getFederalStateByPostalCode(postalCode);
    assert.equal(result.status, "FOUND");
    assert.equal(result.postalCode, postalCode);
    assert.equal(result.federalState, federalState);
    assert.equal(result.source, "local");
  }
});

test("returns NOT_FOUND for unknown or invalid postal codes", () => {
  assert.deepEqual(getFederalStateByPostalCode("99999"), {
    postalCode: "99999",
    federalState: null,
    source: "local",
    status: "NOT_FOUND"
  });
  assert.deepEqual(getFederalStateByPostalCode("1234"), {
    postalCode: "1234",
    federalState: null,
    source: "local",
    status: "NOT_FOUND"
  });
});

test("enriches lead location with federal state without overwriting manual city", () => {
  const enriched = enrichGermanPostalLocation({
    postalCode: "70563",
    city: "Stuttgart-Vaihingen",
    federalState: ""
  });

  assert.equal(enriched.postalCode, "70563");
  assert.equal(enriched.city, "Stuttgart-Vaihingen");
  assert.equal(enriched.federalState, "Baden-Württemberg");
});
