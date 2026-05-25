import type { PropertyStatus } from "./domain.ts";

export type AcquisitionWorkflowAction =
  | "indicative_offer_sent"
  | "offer_accepted"
  | "expert_opinion_ordered"
  | "expert_opinion_received"
  | "binding_offer_sent"
  | "binding_offer_accepted"
  | "notary_appointment_ordered"
  | "contract_signed";

type WorkflowPropertyLike = {
  status: PropertyStatus;
  indicativeOfferSentAt?: string | Date | null;
  offerAcceptedAt?: string | Date | null;
  expertOpinionOrderedAt?: string | Date | null;
  expertOpinionReceivedAt?: string | Date | null;
  bindingOfferSentAt?: string | Date | null;
  bindingOfferAcceptedAt?: string | Date | null;
  notaryAppointmentAt?: string | Date | null;
  portfolioEnteredAt?: string | Date | null;
};

type WorkflowOptions = {
  hasBindingOffer?: boolean;
  expertOpinionOrderedAt?: string;
  expertOpinionReceivedAt?: string;
  expertOpinionCompany?: string;
  notaryAppointmentAt?: string;
};

const workflowSteps = [
  { status: "SUBMITTED", action: null, dateKey: "createdAt" },
  { status: "INDICATIVE_OFFER_SENT", action: "indicative_offer_sent", dateKey: "indicativeOfferSentAt" },
  { status: "OFFER_ACCEPTED", action: "offer_accepted", dateKey: "offerAcceptedAt" },
  { status: "EXPERT_OPINION_ORDERED", action: "expert_opinion_ordered", dateKey: "expertOpinionOrderedAt" },
  { status: "EXPERT_OPINION_RECEIVED", action: "expert_opinion_received", dateKey: "expertOpinionReceivedAt" },
  { status: "BINDING_OFFER_SENT", action: "binding_offer_sent", dateKey: "bindingOfferSentAt" },
  { status: "BINDING_OFFER_ACCEPTED", action: "binding_offer_accepted", dateKey: "bindingOfferAcceptedAt" },
  { status: "NOTARY_APPOINTMENT", action: "notary_appointment_ordered", dateKey: "notaryAppointmentAt" },
  { status: "IN_PORTFOLIO", action: "contract_signed", dateKey: "portfolioEnteredAt" },
] as const;

const statusAliases: Partial<Record<PropertyStatus, string>> = {
  DATA_INCOMPLETE: "SUBMITTED",
  VALUATION_PENDING: "SUBMITTED",
  VALUATED: "SUBMITTED",
  OFFER_CALCULATED: "SUBMITTED",
  OFFER_DRAFTED: "SUBMITTED",
  INTERNAL_REVIEW: "SUBMITTED",
  APPROVED: "SUBMITTED",
  SENT: "SUBMITTED",
  PURCHASED: "IN_PORTFOLIO",
  WON: "IN_PORTFOLIO",
};

const actionLabels: Record<AcquisitionWorkflowAction, string> = {
  indicative_offer_sent: "UVA abgegeben",
  offer_accepted: "UVA angenommen",
  expert_opinion_ordered: "Gutachten beauftragt",
  expert_opinion_received: "Gutachten eingegangen",
  binding_offer_sent: "VA abgegeben",
  binding_offer_accepted: "VA angenommen",
  notary_appointment_ordered: "Notartermin vereinbart",
  contract_signed: "Kaufvertrag abgeschlossen",
};

export function acquisitionWorkflowIndex(property: WorkflowPropertyLike): number {
  const workflowStatus = statusAliases[property.status] || property.status;
  const statusIndex = workflowSteps.findIndex((step) => step.status === workflowStatus);
  const dateIndex = workflowSteps.reduce((highest, step, index) => {
    const key = step.dateKey as keyof WorkflowPropertyLike;
    return property[key] ? Math.max(highest, index) : highest;
  }, -1);
  return Math.max(statusIndex, dateIndex);
}

export function validateAcquisitionTransition(
  property: WorkflowPropertyLike,
  action: AcquisitionWorkflowAction,
  options: WorkflowOptions = {}
): void {
  if (property.status === "REJECTED" || property.status === "LOST") {
    throw new Error("Rejected or lost cases cannot advance in the acquisition workflow");
  }

  const targetIndex = workflowSteps.findIndex((step) => step.action === action);
  if (targetIndex < 0) throw new Error("Unsupported acquisition workflow action");

  const currentIndex = acquisitionWorkflowIndex(property);
  if (currentIndex < 0) {
    throw new Error("Case must be submitted before starting the acquisition workflow");
  }
  if (targetIndex <= currentIndex) {
    throw new Error(`${actionLabels[action]} is already completed`);
  }
  if (targetIndex !== currentIndex + 1) {
    const previous = workflowSteps[targetIndex - 1];
    const previousLabel = previous.action ? actionLabels[previous.action] : "Eingereicht";
    throw new Error(`${previousLabel} required before ${actionLabels[action]}`);
  }

  if (action === "expert_opinion_ordered") {
    if (!options.expertOpinionOrderedAt?.trim()) throw new Error("Expert opinion order date required");
    if (!options.expertOpinionCompany?.trim()) throw new Error("Expert opinion company required");
  }
  if (action === "expert_opinion_received" && !options.expertOpinionReceivedAt?.trim()) {
    throw new Error("Expert opinion received date required");
  }
  if (action === "binding_offer_sent" && !options.hasBindingOffer) {
    throw new Error("Binding offer calculation required before sending binding offer");
  }
  if (action === "notary_appointment_ordered" && !options.notaryAppointmentAt?.trim()) {
    throw new Error("Notary appointment date required");
  }
}
