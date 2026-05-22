import assert from "node:assert/strict";
import test from "node:test";
import { leadCreateSchema } from "../lib/validation.ts";
import { convertLeadToCase, store } from "../lib/store.ts";

test("homepage lead schema stores property interest without customer conversion", () => {
  const lead = leadCreateSchema.parse({
    source: "homepage",
    postalCode: "70563",
    propertyType: "single_family",
    estimatedPropertyValueRange: "500-800",
    youngestOwnerAgeRange: "70-74",
    productInterest: "fixed_residential_right"
  });

  assert.equal(lead.source, "homepage");
  assert.equal(lead.propertyType, "single_family");
});

test("assigned lead can be converted into a draft customer case", () => {
  const lead = store.leads.find((item) => item.id === "lead_assigned_1");
  assert.ok(lead);

  const converted = convertLeadToCase(lead.id, "partner_heimwert", "user_partner");

  assert.equal(converted.property.status, "DRAFT");
  assert.equal(converted.property.partnerId, "partner_heimwert");
  assert.equal(lead.status, "CONVERTED");
  assert.equal(lead.convertedPropertyId, converted.property.id);
});
