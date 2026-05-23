import type { CaseView, Property, User } from "./domain.ts";

export function canSeeProperty(user: User, property: Property): boolean {
  return user.role === "admin" || property.partnerId === user.partnerId;
}

export function canMutateProperty(user: User, property: Property): boolean {
  if (user.role === "admin") {
    return true;
  }

  return property.partnerId === user.partnerId && ![
    "APPROVED",
    "SENT",
    "OFFER_ACCEPTED",
    "EXPERT_OPINION_ORDERED",
    "EXPERT_OPINION_RECEIVED",
    "BINDING_OFFER_SENT",
    "BINDING_OFFER_ACCEPTED",
    "PURCHASE_STARTED",
    "NOTARY_APPOINTMENT",
    "PURCHASED",
    "IN_PORTFOLIO",
    "WON",
    "SOLD",
    "LOST"
  ].includes(property.status);
}

export function filterVisibleCases(user: User, cases: CaseView[]): CaseView[] {
  return user.role === "admin" ? cases : cases.filter((item) => item.property.partnerId === user.partnerId);
}

export function assertAdmin(user: User): void {
  if (user.role !== "admin") {
    throw new Error("Admin role required");
  }
}
