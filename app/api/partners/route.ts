import { handleApiError, json, requireRole } from "@/lib/api";
import { store } from "@/lib/store";
import { makeId, nowIso } from "@/lib/id";

export function GET(): Response {
  try {
    requireRole("admin");
    return json({ partners: store.partners });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    requireRole("admin");
    const body = await request.json();
    const now = nowIso();
    const partner = {
      id: makeId("par"),
      companyName: String(body.companyName ?? ""),
      contactName: String(body.contactName ?? ""),
      email: String(body.email ?? ""),
      phone: body.phone ? String(body.phone) : undefined,
      address: body.address ? String(body.address) : undefined,
      status: "active" as const,
      createdAt: now,
      updatedAt: now
    };
    store.partners.push(partner);
    return json({ partner }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
