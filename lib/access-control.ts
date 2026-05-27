import type { CaseView, Property, User } from "./domain.ts";

export function isInternalAdmin(user: User): boolean {
  return user.role === "admin" && ["admin", "super_admin"].includes(user.internalRole ?? "employee");
}

export function isInternalAdvisor(user: User): boolean {
  return user.role === "admin" && user.internalRole === "advisor";
}

export function isAssignedInternalUser(user: User, property: Property): boolean {
  return user.role === "admin" && property.assignedAdvisorUserId === user.id;
}

export function internalRoleCanAdvance(internalRole: User["internalRole"]): boolean {
  return ["advisor", "admin", "super_admin"].includes(internalRole ?? "employee");
}

export function internalRoleCanReset(internalRole: User["internalRole"]): boolean {
  return internalRoleCanAdvance(internalRole);
}

export function canSeeProperty(user: User, property: Property): boolean {
  if (isInternalAdmin(user)) return true;
  if (user.role === "admin") return isAssignedInternalUser(user, property);
  return Boolean(property.partnerId && property.partnerId === user.partnerId);
}

export function canMutateProperty(user: User, property: Property): boolean {
  if (isInternalAdmin(user) || isAssignedInternalUser(user, property)) {
    return true;
  }

  return Boolean(property.partnerId && property.partnerId === user.partnerId) && property.status === "DRAFT";
}

export function filterVisibleCases(user: User, cases: CaseView[]): CaseView[] {
  return cases.filter((item) => canSeeProperty(user, item.property));
}

export function canCalculateOffer(user: User, property: Property): boolean {
  if (user.role !== "admin" || !internalRoleCanAdvance(user.internalRole)) return false;
  return isInternalAdmin(user) || (isInternalAdvisor(user) && isAssignedInternalUser(user, property));
}

export function canAdvanceAcquisition(user: User, property: Property): boolean {
  return canCalculateOffer(user, property);
}

export function canEditAcquisitionDates(user: User, property: Property): boolean {
  return canAdvanceAcquisition(user, property);
}

export function canResetAcquisition(user: User, property: Property): boolean {
  if (user.role !== "admin" || !internalRoleCanReset(user.internalRole)) return false;
  return isInternalAdmin(user) || (isInternalAdvisor(user) && isAssignedInternalUser(user, property));
}

export function canAcceptCustomerOffer(user: User, property: Property): boolean {
  return Boolean(user.role === "partner" && property.partnerId && property.partnerId === user.partnerId);
}

export function assertAdmin(user: User): void {
  if (user.role !== "admin") {
    throw new Error("Admin role required");
  }
}
