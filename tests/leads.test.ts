import assert from "node:assert/strict";
import test from "node:test";
import { leadCreateSchema, leadUpdateSchema } from "../lib/validation.ts";
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

test("direct internal lead schema accepts advisor assignment without partner", () => {
  const lead = leadCreateSchema.parse({
    source: "internal",
    firstName: "Eva",
    lastName: "Schmidt",
    phone: "0711123456",
    postalCode: "70563",
    assignedAdvisorUserId: "user_employee"
  });

  assert.equal(lead.source, "internal");
  assert.equal(lead.assignedAdvisorUserId, "user_employee");
  assert.equal(lead.assignedPartnerId, undefined);
});

test("broker lead schema requires partner assignment", () => {
  assert.throws(() => leadCreateSchema.parse({
    source: "partner",
    firstName: "Eva",
    lastName: "Schmidt",
    phone: "0711123456",
    postalCode: "70563",
    routingReason: "Region Stuttgart"
  }), /Makler oder Partner/);
});

test("lead update schema allows incomplete qualification drafts", () => {
  const lead = leadUpdateSchema.parse({
    source: "internal",
    internalNote: "Telefonische Qualifizierung läuft.",
    city: "Stuttgart"
  });

  assert.equal(lead.source, "internal");
  assert.equal(lead.internalNote, "Telefonische Qualifizierung läuft.");
  assert.equal(lead.city, "Stuttgart");
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
