import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = await request.json().catch(() => ({}));
    const completedReminders = await prisma.reminder.updateMany({
      where: { propertyId: params.id, status: "open" },
      data: { status: "done", completedByUserId: user.id, completedAt: new Date() }
    });
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        followUpRequired: false,
        customerFeedbackReceivedAt: new Date(),
        followUpReason: null,
        followUpDueAt: null
      }
    });
    if (caseView.property.status === "DATA_INCOMPLETE") {
      await updateDbPropertyStatus(params.id, "SUBMITTED");
    }
    await addDbActivity(
      params.id,
      user.id,
      "customer_feedback_received",
      String(body.message ?? "Kundenrückmeldung ist eingegangen. Keine weitere Rückmeldung erforderlich."),
      {
        source: user.role,
        entityType: "reminder",
        metadata: { completedReminderCount: completedReminders.count }
      }
    );

    return json({ property, completedReminders });
  } catch (err) {
    return handleApiError(err);
  }
}
