import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { createFollowUpDueAt } from "@/lib/follow-up";
import { createReminder, getCaseByPropertyId } from "@/lib/store";
import { reminderCreateSchema } from "@/lib/validation";

export function GET(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ reminders: caseView.reminders });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = reminderCreateSchema.parse(await request.json());
    const reminder = createReminder({
      propertyId: params.id,
      createdByUserId: user.id,
      assignedToUserId: body.assignedToUserId,
      reason: body.reason,
      dueAt: body.dueAt ?? createFollowUpDueAt()
    });
    return json({ reminder }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
