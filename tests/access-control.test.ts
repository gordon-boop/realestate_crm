import assert from "node:assert/strict";
import test from "node:test";
import { canMutateProperty, canSeeProperty } from "../lib/access-control.ts";
import type { Property, User } from "../lib/domain.ts";

const partnerUser: User = {
  id: "user_partner",
  partnerId: "partner_a",
  name: "Partner",
  email: "partner@example.com",
  passwordHash: "x",
  role: "partner",
  createdAt: "2026-05-13T00:00:00.000Z",
  updatedAt: "2026-05-13T00:00:00.000Z"
};

const adminUser: User = { ...partnerUser, id: "user_admin", role: "admin", partnerId: undefined };

const property: Property = {
  id: "property_a",
  customerId: "customer_a",
  partnerId: "partner_a",
  propertyType: "house",
  street: "Teststrasse 1",
  postalCode: "10115",
  city: "Berlin",
  livingAreaSqm: 120,
  condition: "average",
  desiredModel: "fixed_residential_right",
  desiredResidentialRightYears: 10,
  status: "DRAFT",
  createdAt: "2026-05-13T00:00:00.000Z",
  updatedAt: "2026-05-13T00:00:00.000Z"
};

test("partner can see and mutate own open property", () => {
  assert.equal(canSeeProperty(partnerUser, property), true);
  assert.equal(canMutateProperty(partnerUser, property), true);
});

test("partner cannot see foreign property", () => {
  assert.equal(canSeeProperty({ ...partnerUser, partnerId: "partner_b" }, property), false);
});

test("admin can see every property and partner cannot mutate approved property", () => {
  assert.equal(canSeeProperty(adminUser, { ...property, partnerId: "partner_b" }), true);
  assert.equal(canMutateProperty(partnerUser, { ...property, status: "APPROVED" }), false);
});
