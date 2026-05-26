import assert from "node:assert/strict";
import test from "node:test";
import { validateAcquisitionOfferDates, validateAcquisitionReset, validateAcquisitionTransition } from "../lib/acquisition-workflow.ts";
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
  advanceAcquisitionWorkflow("property_berlin_1", "notary_appointment_ordered", "user_admin", { notaryAppointmentAt: "2026-06-15T10:00", notaryOffice: "Notariat Stuttgart Mitte" });
  const property = advanceAcquisitionWorkflow("property_berlin_1", "contract_signed", "user_admin");
  const caseView = getCaseByPropertyId("property_berlin_1");

  assert.equal(property.status, "IN_PORTFOLIO");
  assert.ok(property.portfolioEnteredAt);
  assert.equal(property.notaryAppointmentAt, "2026-06-15T10:00");
  assert.equal(property.notaryOffice, "Notariat Stuttgart Mitte");
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

test("acquisition workflow enforces the full process order", () => {
  const submitted = { status: "SUBMITTED" as const };
  assert.doesNotThrow(() => validateAcquisitionTransition(submitted, "indicative_offer_sent"));
  assert.throws(() => validateAcquisitionTransition(submitted, "offer_accepted"), /UVA abgegeben required/);

  const uvaSent = { status: "INDICATIVE_OFFER_SENT" as const, indicativeOfferSentAt: "2026-05-25T10:00:00.000Z" };
  assert.doesNotThrow(() => validateAcquisitionTransition(uvaSent, "offer_accepted"));
  assert.throws(() => validateAcquisitionTransition(uvaSent, "expert_opinion_ordered"), /UVA angenommen required/);

  const uvaAccepted = { ...uvaSent, status: "OFFER_ACCEPTED" as const, offerAcceptedAt: "2026-05-25T11:00:00.000Z" };
  assert.throws(() => validateAcquisitionTransition(uvaAccepted, "expert_opinion_ordered"), /order date required/);
  assert.doesNotThrow(() => validateAcquisitionTransition(uvaAccepted, "expert_opinion_ordered", {
    expertOpinionOrderedAt: "2026-05-26",
    expertOpinionCompany: "Sprengnetter"
  }));

  const opinionReceived = {
    ...uvaAccepted,
    status: "EXPERT_OPINION_RECEIVED" as const,
    expertOpinionOrderedAt: "2026-05-26",
    expertOpinionReceivedAt: "2026-05-28"
  };
  assert.throws(() => validateAcquisitionTransition(opinionReceived, "binding_offer_sent"), /Binding offer calculation required/);
  assert.doesNotThrow(() => validateAcquisitionTransition(opinionReceived, "binding_offer_sent", { hasBindingOffer: true }));

  const vaAccepted = {
    ...opinionReceived,
    status: "BINDING_OFFER_ACCEPTED" as const,
    bindingOfferSentAt: "2026-05-29",
    bindingOfferAcceptedAt: "2026-05-30"
  };
  assert.throws(() => validateAcquisitionTransition(vaAccepted, "notary_appointment_ordered"), /Notary appointment date required/);
  assert.throws(() => validateAcquisitionTransition(vaAccepted, "notary_appointment_ordered", { notaryAppointmentAt: "2026-06-10T10:00" }), /Notary office required/);
  assert.doesNotThrow(() => validateAcquisitionTransition(vaAccepted, "notary_appointment_ordered", { notaryAppointmentAt: "2026-06-10T10:00", notaryOffice: "Notariat Stuttgart Mitte" }));
});

test("acquisition workflow reset requires earlier step and reason", () => {
  const bindingOfferSent = {
    status: "BINDING_OFFER_SENT" as const,
    indicativeOfferSentAt: "2026-05-25T10:00:00.000Z",
    offerAcceptedAt: "2026-05-25T11:00:00.000Z",
    expertOpinionOrderedAt: "2026-05-26T10:00:00.000Z",
    expertOpinionReceivedAt: "2026-05-27T10:00:00.000Z",
    bindingOfferSentAt: "2026-05-28T10:00:00.000Z"
  };

  assert.doesNotThrow(() => validateAcquisitionReset(bindingOfferSent, "EXPERT_OPINION_RECEIVED", "Bewertung muss angepasst werden"));
  assert.throws(() => validateAcquisitionReset(bindingOfferSent, "BINDING_OFFER_SENT", "Bewertung muss angepasst werden"), /earlier process step/);
  assert.throws(() => validateAcquisitionReset(bindingOfferSent, "EXPERT_OPINION_RECEIVED", ""), /Reset reason required/);
});

test("final acquisition workflow reset is protected for non-admin reset users", () => {
  const finalCase = { status: "IN_PORTFOLIO" as const, portfolioEnteredAt: "2026-06-01T10:00:00.000Z" };

  assert.throws(() => validateAcquisitionReset(finalCase, "BINDING_OFFER_ACCEPTED", "Notartermin muss neu geplant werden"), /Final acquisition cases/);
  assert.doesNotThrow(() => validateAcquisitionReset(finalCase, "BINDING_OFFER_ACCEPTED", "Notartermin muss neu geplant werden", { allowFinalReset: true }));
});

test("offer date validation blocks acceptance before submission", () => {
  const property = { status: "INDICATIVE_OFFER_SENT" as const, indicativeOfferSentAt: "2026-05-24" };

  assert.doesNotThrow(() => validateAcquisitionOfferDates(property, { offerAcceptedAt: "2026-05-25" }));
  assert.throws(() => validateAcquisitionOfferDates(property, { offerAcceptedAt: "2026-05-23" }), /nicht vor Abgabedatum/);
  assert.throws(() => validateAcquisitionOfferDates({ status: "SUBMITTED" as const }, { offerAcceptedAt: "2026-05-25" }), /required before acceptance date/);
});
