import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { nowIso } from "@/lib/id";
import { addActivity, completeOpenReminders, getCaseByPropertyId, updatePropertyStatus } from "@/lib/store";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = await request.json().catch(() => ({}));
    const completedReminders = completeOpenReminders(params.id, user.id);
    caseView.property.followUpRequired = false;
    caseView.property.customerFeedbackReceivedAt = nowIso();
    caseView.property.followUpReason = undefined;
    caseView.property.followUpDueAt = undefined;
    if (caseView.property.status === "DATA_INCOMPLETE") {
      updatePropertyStatus(params.id, "SUBMITTED");
    }
    addActivity(
      params.id,
      user.id,
      "customer_feedback_received",
      String(body.message ?? "Kundenrückmeldung ist eingegangen. Keine weitere Rückmeldung erforderlich."),
      {
        source: user.role,
        entityType: "reminder",
        metadata: { completedReminderIds: completedReminders.map((item) => item.id) }
      }
    );

    return json({ property: caseView.property, completedReminders });
  } catch (err) {
    return handleApiError(err);
  }
}
