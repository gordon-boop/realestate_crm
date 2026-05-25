import { canAdvanceAcquisition } from "@/lib/access-control";
import { validateAcquisitionTransition, type AcquisitionWorkflowAction } from "@/lib/acquisition-workflow";
import { handleApiError, json, requireRole } from "@/lib/api";
import { advanceDbAcquisitionWorkflow, getDbCaseByPropertyId } from "@/lib/persistence";
import { acquisitionWorkflowSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canAdvanceAcquisition(user, caseView.property)) throw new Error("Forbidden");

    const body = acquisitionWorkflowSchema.parse(await request.json());
    validateAcquisitionTransition(caseView.property, body.action as AcquisitionWorkflowAction, {
      hasBindingOffer: caseView.offers.some((offer) => offer.kind === "binding"),
      expertOpinionOrderedAt: body.expertOpinionOrderedAt,
      expertOpinionReceivedAt: body.expertOpinionReceivedAt,
      expertOpinionCompany: body.expertOpinionCompany,
      notaryAppointmentAt: body.notaryAppointmentAt
    });
    const property = await advanceDbAcquisitionWorkflow(params.id, body.action, user.id, {
      expertOpinionOrderedAt: body.expertOpinionOrderedAt,
      expertOpinionReceivedAt: body.expertOpinionReceivedAt,
      expertOpinionCompany: body.expertOpinionCompany,
      notaryAppointmentAt: body.notaryAppointmentAt
    });
    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
