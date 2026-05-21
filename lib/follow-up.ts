import type { Property } from "./domain.ts";

export function hasOpenFollowUp(property: Pick<Property, "followUpRequired" | "customerFeedbackReceivedAt">): boolean {
  return Boolean(property.followUpRequired && !property.customerFeedbackReceivedAt);
}

export function createFollowUpDueAt(baseDate = new Date()): string {
  return new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
}
