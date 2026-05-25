import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { getDbCaseByPropertyId, markDbChatMessagesRead } from "@/lib/persistence";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const result = await markDbChatMessagesRead(params.id, user);
    return json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
