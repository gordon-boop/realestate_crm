import assert from "node:assert/strict";
import test from "node:test";
import { createMockValuation } from "../lib/valuation-service.ts";
import type { Property } from "../lib/domain.ts";

const property: Property = {
  id: "property_test",
  customerId: "customer_test",
  partnerId: "partner_test",
  propertyType: "house",
  street: "Musterstrasse 1",
  postalCode: "70173",
  city: "Stuttgart",
  livingAreaSqm: 100,
  condition: "good",
  desiredModel: "fixed_residential_right",
  status: "SUBMITTED",
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z"
};

test("valuation can be marked as sprengnetter stub", () => {
  const valuation = createMockValuation(property, "sprengnetter");
  assert.equal(valuation.provider, "sprengnetter");
  assert.equal(valuation.rawResponseJson.source, "sprengnetter_stub");
  assert.equal(typeof valuation.marketValue, "number");
});
