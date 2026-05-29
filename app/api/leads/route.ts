import { getCurrentUser } from "@/lib/auth";
import { handleApiError, json, requireRole } from "@/lib/api";
import { createDbLead, getDbLeads } from "@/lib/persistence";
import { leadCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const leads = await getDbLeads(user);
    return json({ leads });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = getCurrentUser();
    if (user?.role === "partner") {
      throw new Error("Forbidden");
    }
    const rawBody = await request.json();
    const body = leadCreateSchema.parse(user ? rawBody : { ...rawBody, source: "homepage" });
    const lead = await createDbLead(body, user);
    return json({ lead }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
