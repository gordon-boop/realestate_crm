import { canAcceptCustomerOffer, canAdvanceAcquisition, canSeeProperty } from "@/lib/access-control";
import { validateAcquisitionTransition, type AcquisitionWorkflowAction } from "@/lib/acquisition-workflow";
import { handleApiError, json, requireRole } from "@/lib/api";
import { advanceDbAcquisitionWorkflow, getDbCaseByPropertyId } from "@/lib/persistence";
import { acquisitionWorkflowSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    const body = acquisitionWorkflowSchema.parse(await request.json());
    const customerAcceptanceActions = ["offer_accepted", "binding_offer_accepted"];
    if (user.role === "partner") {
      if (!canSeeProperty(user, caseView.property) || !customerAcceptanceActions.includes(body.action) || !canAcceptCustomerOffer(user, caseView.property)) {
        throw new Error("Forbidden");
      }
    } else if (!canAdvanceAcquisition(user, caseView.property)) {
      throw new Error("Forbidden");
    }
    validateAcquisitionTransition(caseView.property, body.action as AcquisitionWorkflowAction, {
      hasBindingOffer: caseView.offers.some((offer) => offer.kind === "binding"),
      expertOpinionOrderedAt: body.expertOpinionOrderedAt,
      expertOpinionReceivedAt: body.expertOpinionReceivedAt,
      expertOpinionCompany: body.expertOpinionCompany,
      notaryAppointmentAt: body.notaryAppointmentAt,
      notaryOffice: body.notaryOffice
    });
    const property = await advanceDbAcquisitionWorkflow(params.id, body.action, user.id, {
      expertOpinionOrderedAt: body.expertOpinionOrderedAt,
      expertOpinionReceivedAt: body.expertOpinionReceivedAt,
      expertOpinionCompany: body.expertOpinionCompany,
      notaryAppointmentAt: body.notaryAppointmentAt,
      notaryOffice: body.notaryOffice,
      source: user.role
    });
    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
