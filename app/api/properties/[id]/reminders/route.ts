import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { createFollowUpDueAt } from "@/lib/follow-up";
import { addDbActivity, getDbCaseByPropertyId } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { reminderCreateSchema } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
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
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = reminderCreateSchema.parse(await request.json());
    const reminder = await prisma.reminder.create({
      data: {
        propertyId: params.id,
        createdByUserId: user.id,
        assignedToUserId: body.assignedToUserId,
        reason: body.reason,
        dueAt: body.dueAt ? new Date(body.dueAt) : new Date(createFollowUpDueAt())
      }
    });
    await addDbActivity(params.id, user.id, "reminder_created", `Wiedervorlage erstellt: ${body.reason}`, {
      source: "admin",
      entityType: "reminder",
      entityId: reminder.id
    });
    return json({ reminder }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
