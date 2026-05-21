import type { Property, User } from "./domain.ts";
import { canMutateProperty, canSeeProperty } from "./access-control.ts";

type UserLike = Pick<User, "id" | "role" | "partnerId">;
type PropertyLike = Pick<Property, "partnerId">;

export function canViewProperty(user: UserLike, property: PropertyLike): boolean {
  return user.role === "admin" || user.partnerId === property.partnerId;
}

export function canEditProperty(user: UserLike, property: PropertyLike & Partial<Pick<Property, "status">>): boolean {
  if (user.role === "admin") {
    return true;
  }

  if (!("status" in property) || !property.status) {
    return user.partnerId === property.partnerId;
  }

  return canMutateProperty(user as User, property as Property);
}

export function canApproveOffer(user: UserLike): boolean {
  return user.role === "admin";
}

export { canSeeProperty, canMutateProperty };
