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
    const body = leadCreateSchema.parse(await request.json());
    const lead = await createDbLead(body, user);
    return json({ lead }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
