import assert from "node:assert/strict";
import test from "node:test";
import { advanceAcquisitionWorkflow, getCaseByPropertyId } from "../lib/store.ts";
import { acquisitionWorkflowSchema, propertyRejectSchema } from "../lib/validation.ts";

test("acquisition workflow advances a case into portfolio", () => {
  assert.equal(acquisitionWorkflowSchema.parse({ action: "offer_accepted" }).action, "offer_accepted");

  advanceAcquisitionWorkflow("property_berlin_1", "offer_accepted", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "purchase_started", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "notary_appointment", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "purchased", "user_admin");
  const property = advanceAcquisitionWorkflow("property_berlin_1", "enter_portfolio", "user_admin");
  const caseView = getCaseByPropertyId("property_berlin_1");

  assert.equal(property.status, "IN_PORTFOLIO");
  assert.ok(property.portfolioEnteredAt);
  assert.equal(caseView?.activities.some((activity) => activity.type === "portfolio_entered"), true);
});

test("case rejection requires a structured reason", () => {
  const parsed = propertyRejectSchema.parse({
    reasonCode: "condition",
    note: "Objektzustand passt aktuell nicht zum Ankaufsprofil."
  });

  assert.equal(parsed.reasonCode, "condition");
  assert.equal(parsed.note, "Objektzustand passt aktuell nicht zum Ankaufsprofil.");
  assert.throws(() => propertyRejectSchema.parse({ reasonCode: "unknown" }));
});
