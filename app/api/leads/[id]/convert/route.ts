import { handleApiError, json, requireRole } from "@/lib/api";
import { convertDbLeadToCase } from "@/lib/persistence";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const partnerId = user.role === "partner" ? user.partnerId : undefined;
    if (!partnerId) throw new Error("Partner assignment required");

    const convertedCase = await convertDbLeadToCase(params.id, partnerId, user.id);
    return json({ case: convertedCase }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
