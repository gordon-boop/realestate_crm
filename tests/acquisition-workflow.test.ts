import assert from "node:assert/strict";
import test from "node:test";
import { advanceAcquisitionWorkflow, getCaseByPropertyId } from "../lib/store.ts";
import { acquisitionWorkflowSchema, propertyRejectSchema } from "../lib/validation.ts";

test("acquisition workflow advances a case into portfolio", () => {
  assert.equal(acquisitionWorkflowSchema.parse({ action: "offer_accepted" }).action, "offer_accepted");

  advanceAcquisitionWorkflow("property_berlin_1", "indicative_offer_sent", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "offer_accepted", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "expert_opinion_ordered", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "expert_opinion_received", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "binding_offer_sent", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "binding_offer_accepted", "user_admin");
  advanceAcquisitionWorkflow("property_berlin_1", "notary_appointment_ordered", "user_admin", { notaryAppointmentAt: "2026-06-15T10:00" });
  const property = advanceAcquisitionWorkflow("property_berlin_1", "contract_signed", "user_admin");
  const caseView = getCaseByPropertyId("property_berlin_1");

  assert.equal(property.status, "IN_PORTFOLIO");
  assert.ok(property.portfolioEnteredAt);
  assert.equal(property.notaryAppointmentAt, "2026-06-15T10:00");
  assert.equal(caseView?.activities.some((activity) => activity.type === "contract_signed"), true);
});

test("case rejection requires a structured reason", () => {
  const parsed = propertyRejectSchema.parse({
    reasonCode: "condition",
    note: "Objektzustand passt aktuell nicht zum Ankaufsprofil."
  });

  assert.equal(parsed.reasonCode, "condition");
  assert.equal(parsed.note, "Objektzustand passt aktuell nicht zum Ankaufsprofil.");
  assert.throws(() => propertyRejectSchema.parse({ reasonCode: "unknown" }));
  assert.throws(() => propertyRejectSchema.parse({ reasonCode: "condition" }));
});
