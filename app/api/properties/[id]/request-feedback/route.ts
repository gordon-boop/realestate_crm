import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { createFollowUpDueAt } from "@/lib/follow-up";
import { addDbActivity, getDbCaseByPropertyId, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { reminderCreateSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = reminderCreateSchema.partial().parse(await request.json().catch(() => ({})));
    const reason = body.reason ?? "Rückfrage beim Kunden erforderlich.";
    const dueAt = body.dueAt ?? createFollowUpDueAt();

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        followUpRequired: true,
        followUpReason: reason,
        followUpDueAt: new Date(dueAt),
        customerFeedbackReceivedAt: null
      }
    });
    await updateDbPropertyStatus(params.id, "DATA_INCOMPLETE");
    const reminder = await prisma.reminder.create({
      data: {
        propertyId: params.id,
        createdByUserId: user.id,
        assignedToUserId: body.assignedToUserId,
        reason,
        status: "open",
        dueAt: new Date(dueAt),
        lastReminderAt: new Date()
      }
    });
    await addDbActivity(params.id, user.id, "reminder_created", reason, { source: "admin", entityType: "reminder", entityId: reminder.id });

    return json({ property, reminder });
  } catch (err) {
    return handleApiError(err);
  }
}
