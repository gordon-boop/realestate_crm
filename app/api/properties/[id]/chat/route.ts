import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbChatMessage, getDbCaseByPropertyId } from "@/lib/persistence";
import { chatMessageCreateSchema } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const chatMessages = user.role === "admin"
      ? caseView.chatMessages
      : caseView.chatMessages.filter((message) => message.visibility === "shared");

    return json({ chatMessages });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = chatMessageCreateSchema.parse(await request.json());
    const visibility = user.role === "admin" ? body.visibility : "shared";
    const chatMessage = await addDbChatMessage(caseView.property.id, user.id, user.role, body.message, visibility);

    return json({ chatMessage }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
