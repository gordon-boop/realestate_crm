import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { createFollowUpDueAt } from "@/lib/follow-up";
import { createReminder, getCaseByPropertyId, updatePropertyStatus } from "@/lib/store";
import { reminderCreateSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = reminderCreateSchema.partial().parse(await request.json().catch(() => ({})));
    const reason = body.reason ?? "Rückfrage beim Kunden erforderlich.";
    const dueAt = body.dueAt ?? createFollowUpDueAt();

    caseView.property.followUpRequired = true;
    caseView.property.followUpReason = reason;
    caseView.property.followUpDueAt = dueAt;
    caseView.property.customerFeedbackReceivedAt = undefined;
    updatePropertyStatus(params.id, "DATA_INCOMPLETE");
    const reminder = createReminder({
      propertyId: params.id,
      createdByUserId: user.id,
      assignedToUserId: body.assignedToUserId,
      reason,
      dueAt
    });

    return json({ property: caseView.property, reminder });
  } catch (err) {
    return handleApiError(err);
  }
}
