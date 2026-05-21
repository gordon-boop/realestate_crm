import { handleApiError, json, requireRole } from "@/lib/api";
import { store } from "@/lib/store";
import { nowIso } from "@/lib/id";

export function GET(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const customer = store.customers.find((item) => item.id === params.id);
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");
    return json({ customer });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const customer = store.customers.find((item) => item.id === params.id);
    if (!customer) throw new Error("Customer not found");
    if (user.role === "partner" && customer.partnerId !== user.partnerId) throw new Error("Forbidden");
    const body = await request.json();
    Object.assign(customer, { ...body, updatedAt: nowIso() });
    return json({ customer });
  } catch (err) {
    return handleApiError(err);
  }
}
