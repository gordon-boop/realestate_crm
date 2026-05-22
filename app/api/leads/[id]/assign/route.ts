import { handleApiError, json, requireRole } from "@/lib/api";
import { assignDbLead } from "@/lib/persistence";
import { leadAssignSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const body = leadAssignSchema.parse(await request.json());
    const lead = await assignDbLead(params.id, body.partnerId, user.id);
    return json({ lead });
  } catch (err) {
    return handleApiError(err);
  }
}
