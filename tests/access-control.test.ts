import assert from "node:assert/strict";
import test from "node:test";
import { canCalculateOffer, canEditAcquisitionDates, canMutateProperty, canResetAcquisition, canSeeProperty } from "../lib/access-control.ts";
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

const adminUser: User = { ...partnerUser, id: "user_admin", role: "admin", partnerId: undefined, internalRole: "super_admin" };
const advisorUser: User = { ...partnerUser, id: "user_advisor", role: "admin", partnerId: undefined, internalRole: "advisor" };
const employeeUser: User = { ...partnerUser, id: "user_employee", role: "admin", partnerId: undefined, internalRole: "employee" };

const property: Property = {
  id: "property_a",
  customerId: "customer_a",
  partnerId: "partner_a",
  caseSource: "PARTNER",
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

test("partner can see and mutate own draft property only", () => {
  assert.equal(canSeeProperty(partnerUser, property), true);
  assert.equal(canMutateProperty(partnerUser, property), true);
  assert.equal(canMutateProperty(partnerUser, { ...property, status: "SUBMITTED" }), false);
});

test("partner cannot see foreign property", () => {
  assert.equal(canSeeProperty({ ...partnerUser, partnerId: "partner_b" }, property), false);
});

test("admin can see every property and partner cannot mutate approved property", () => {
  assert.equal(canSeeProperty(adminUser, { ...property, partnerId: "partner_b" }), true);
  assert.equal(canMutateProperty(partnerUser, { ...property, status: "APPROVED" }), false);
});

test("internal advisor can calculate own assigned cases only", () => {
  const assignedProperty = { ...property, partnerId: undefined, assignedAdvisorUserId: advisorUser.id };
  assert.equal(canSeeProperty(advisorUser, assignedProperty), true);
  assert.equal(canCalculateOffer(advisorUser, assignedProperty), true);
  assert.equal(canSeeProperty(advisorUser, { ...assignedProperty, assignedAdvisorUserId: "other_user" }), false);
  assert.equal(canCalculateOffer(employeeUser, { ...assignedProperty, assignedAdvisorUserId: employeeUser.id }), false);
});

test("internal employees and admins can reset assigned acquisition workflow, partners cannot", () => {
  const assignedProperty = { ...property, status: "BINDING_OFFER_SENT" as const, assignedAdvisorUserId: employeeUser.id };

  assert.equal(canResetAcquisition(employeeUser, assignedProperty), true);
  assert.equal(canEditAcquisitionDates(employeeUser, assignedProperty), true);
  assert.equal(canResetAcquisition(adminUser, { ...assignedProperty, assignedAdvisorUserId: "other_user" }), true);
  assert.equal(canResetAcquisition(partnerUser, assignedProperty), false);
  assert.equal(canEditAcquisitionDates(partnerUser, assignedProperty), false);
  assert.equal(canResetAcquisition(employeeUser, { ...assignedProperty, assignedAdvisorUserId: "other_user" }), false);
});
