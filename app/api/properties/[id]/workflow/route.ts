import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { advanceDbAcquisitionWorkflow, getDbCaseByPropertyId } from "@/lib/persistence";
import { acquisitionWorkflowSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = acquisitionWorkflowSchema.parse(await request.json());
    if (body.action === "binding_offer_sent" && !caseView.offers.some((offer) => offer.kind === "binding")) {
      throw new Error("Binding offer calculation required before sending binding offer");
    }
    const property = await advanceDbAcquisitionWorkflow(params.id, body.action, user.id, {
      notaryAppointmentAt: body.notaryAppointmentAt
    });
    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
