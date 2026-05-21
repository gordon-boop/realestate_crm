import { handleApiError, json, requireRole } from "@/lib/api";
import type { Customer } from "@/lib/domain";
import { store } from "@/lib/store";
import { makeId, nowIso } from "@/lib/id";
import { customerCreateSchema } from "@/lib/validation";

export function GET(): Response {
  try {
    const user = requireRole("admin", "partner");
    const customers = user.role === "admin" ? store.customers : store.customers.filter((item) => item.partnerId === user.partnerId);
    return json({ customers });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = customerCreateSchema.parse(await request.json());
    const now = nowIso();
    const partnerId = user.role === "admin" ? String(body.partnerId ?? "") : user.partnerId;
    if (!partnerId) throw new Error("Partner id required");

    const customer: Customer = {
      id: makeId("cus"),
      partnerId,
      displayName: body.displayName ?? `${body.firstName} ${body.lastName}`,
      firstName: body.firstName,
      lastName: body.lastName,
      ageAtSubmission: body.ageAtSubmission,
      gender: body.gender,
      email: body.email,
      phone: body.phone,
      mobile: body.mobile,
      dateOfBirth: body.dateOfBirth,
      maritalStatus: body.maritalStatus,
      monthlyIncomeRange: body.monthlyIncomeRange,
      street: body.street,
      postalCode: body.postalCode,
      city: body.city,
      addressText: body.addressText,
      consentDataProcessing: body.consentDataProcessing,
      createdAt: now,
      updatedAt: now
    };
    store.customers.push(customer);
    return json({ customer }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
