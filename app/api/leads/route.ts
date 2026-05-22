import { getCurrentUser } from "@/lib/auth";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { Lead } from "@/lib/domain";
import { makeId, nowIso } from "@/lib/id";
import { nextLeadNumber, store } from "@/lib/store";
import { leadCreateSchema } from "@/lib/validation";

export function GET(): Response {
  try {
    const user = requireRole("admin", "partner");
    const leads = user.role === "admin"
      ? store.leads
      : store.leads.filter((item) => item.assignedPartnerId === user.partnerId);
    return json({ leads });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = getCurrentUser();
    const body = leadCreateSchema.parse(await request.json());
    const now = nowIso();
    const lead: Lead = {
      id: makeId("lea"),
      leadNumber: nextLeadNumber(),
      source: user?.role === "partner" ? "partner" : user?.role === "admin" ? body.source : "homepage",
      status: user?.role === "partner" && user.partnerId ? "ASSIGNED" : "NEW",
      assignedPartnerId: user?.role === "partner" ? user.partnerId : undefined,
      assignedByUserId: user?.role === "partner" ? user.id : undefined,
      assignedAt: user?.role === "partner" ? now : undefined,
      firstName: body.firstName,
      lastName: body.lastName,
      name: body.name,
      email: body.email,
      phone: body.phone,
      postalCode: body.postalCode,
      city: body.city,
      propertyType: body.propertyType,
      estimatedPropertyValueRange: body.estimatedPropertyValueRange,
      youngestOwnerAgeRange: body.youngestOwnerAgeRange,
      message: body.message,
      productInterest: body.productInterest,
      createdAt: now,
      updatedAt: now
    };

    store.leads.unshift(lead);
    return json({ lead }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
