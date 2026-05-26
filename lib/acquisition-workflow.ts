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
  notaryOffice?: string | null;
  portfolioEnteredAt?: string | Date | null;
};

type WorkflowOptions = {
  hasBindingOffer?: boolean;
  indicativeOfferSentAt?: string;
  offerAcceptedAt?: string;
  expertOpinionOrderedAt?: string;
  expertOpinionReceivedAt?: string;
  expertOpinionCompany?: string;
  bindingOfferSentAt?: string;
  bindingOfferAcceptedAt?: string;
  notaryAppointmentAt?: string;
  notaryOffice?: string;
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

const finalWorkflowStatuses = new Set<PropertyStatus>(["PURCHASED", "IN_PORTFOLIO", "WON", "SOLD"]);

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

export const acquisitionResetTargets = workflowSteps.map((step) => ({
  status: step.status,
  label: step.action ? actionLabels[step.action] : "Eingereicht"
}));

export function acquisitionStatusLabel(status: PropertyStatus | string): string {
  const workflowStatus = statusAliases[status as PropertyStatus] || status;
  const step = workflowSteps.find((item) => item.status === workflowStatus);
  if (step?.action) return actionLabels[step.action];
  if (step) return "Eingereicht";
  const labels: Partial<Record<PropertyStatus, string>> = {
    DATA_INCOMPLETE: "Daten unvollständig",
    VALUATION_PENDING: "Bewertung läuft",
    VALUATED: "Bewertung fertig",
    OFFER_CALCULATED: "Angebot berechnet",
    OFFER_DRAFTED: "Angebotsentwurf",
    INTERNAL_REVIEW: "Interne Prüfung",
    APPROVED: "Freigegeben",
    SENT: "Versendet",
    PURCHASE_STARTED: "Ankauf gestartet",
    PURCHASED: "Kaufvertrag abgeschlossen",
    IN_PORTFOLIO: "Im Bestand",
    REJECTED: "Abgelehnt",
    LOST: "Verloren",
    WON: "Gewonnen",
    SOLD: "Verkauft"
  };
  return labels[status as PropertyStatus] ?? String(status);
}

export function acquisitionWorkflowIndex(property: WorkflowPropertyLike): number {
  const workflowStatus = statusAliases[property.status] || property.status;
  const statusIndex = workflowSteps.findIndex((step) => step.status === workflowStatus);
  const dateIndex = workflowSteps.reduce((highest, step, index) => {
    const key = step.dateKey as keyof WorkflowPropertyLike;
    return property[key] ? Math.max(highest, index) : highest;
  }, -1);
  return Math.max(statusIndex, dateIndex);
}

export function isAcquisitionActionReached(property: WorkflowPropertyLike, action: AcquisitionWorkflowAction): boolean {
  const targetIndex = workflowSteps.findIndex((step) => step.action === action);
  if (targetIndex < 0) return false;
  return acquisitionWorkflowIndex(property) >= targetIndex;
}

export function validateAcquisitionOfferDates(property: WorkflowPropertyLike, options: WorkflowOptions = {}): void {
  assertAcceptedDateOrder({
    submittedAt: options.indicativeOfferSentAt ?? property.indicativeOfferSentAt,
    acceptedAt: options.offerAcceptedAt,
    missingSubmittedMessage: "Unverbindliches Angebot abgegeben am required before acceptance date",
    invalidOrderMessage: "Unverbindliches Angebot angenommen am darf nicht vor Abgabedatum liegen"
  });
  assertAcceptedDateOrder({
    submittedAt: options.bindingOfferSentAt ?? property.bindingOfferSentAt,
    acceptedAt: options.bindingOfferAcceptedAt,
    missingSubmittedMessage: "Verbindliches Angebot abgegeben am required before acceptance date",
    invalidOrderMessage: "Verbindliches Angebot angenommen am darf nicht vor Abgabedatum liegen"
  });
}

function assertAcceptedDateOrder(input: {
  submittedAt?: string | Date | null;
  acceptedAt?: string | Date | null;
  missingSubmittedMessage: string;
  invalidOrderMessage: string;
}): void {
  if (!input.acceptedAt) return;
  if (!input.submittedAt) throw new Error(input.missingSubmittedMessage);
  const submittedAt = new Date(input.submittedAt);
  const acceptedAt = new Date(input.acceptedAt);
  if (Number.isNaN(submittedAt.getTime()) || Number.isNaN(acceptedAt.getTime())) return;
  if (acceptedAt < submittedAt) throw new Error(input.invalidOrderMessage);
}

export function validateAcquisitionTransition(
  property: WorkflowPropertyLike,
  action: AcquisitionWorkflowAction,
  options: WorkflowOptions = {}
): void {
  validateAcquisitionOfferDates(property, options);

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
  if (action === "notary_appointment_ordered") {
    if (!options.notaryAppointmentAt?.trim()) throw new Error("Notary appointment date required");
    if (!options.notaryOffice?.trim()) throw new Error("Notary office required");
  }
}

export function validateAcquisitionReset(
  property: WorkflowPropertyLike,
  targetStatus: PropertyStatus,
  reason: string,
  options: { allowFinalReset?: boolean } = {}
): void {
  if (!reason.trim()) {
    throw new Error("Reset reason required");
  }
  if (property.status === "REJECTED" || property.status === "LOST") {
    throw new Error("Rejected or lost cases cannot be reset in the acquisition workflow");
  }
  if (finalWorkflowStatuses.has(property.status) && !options.allowFinalReset) {
    throw new Error("Final acquisition cases can only be reset by admin users");
  }

  const currentIndex = acquisitionWorkflowIndex(property);
  const targetWorkflowStatus = statusAliases[targetStatus] || targetStatus;
  const targetIndex = workflowSteps.findIndex((step) => step.status === targetWorkflowStatus);
  if (targetIndex < 0) {
    throw new Error("Unsupported acquisition reset target");
  }
  if (currentIndex < 0) {
    throw new Error("Case has no acquisition workflow step to reset");
  }
  if (targetIndex >= currentIndex) {
    throw new Error("Reset target must be an earlier process step");
  }
}
