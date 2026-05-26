import { canAcceptCustomerOffer, canAdvanceAcquisition, canEditAcquisitionDates, canSeeProperty } from "@/lib/access-control";
import { isAcquisitionActionReached, validateAcquisitionOfferDates, validateAcquisitionTransition, type AcquisitionWorkflowAction } from "@/lib/acquisition-workflow";
import { handleApiError, json, requireRole } from "@/lib/api";
import { advanceDbAcquisitionWorkflow, getDbCaseByPropertyId, updateDbAcquisitionWorkflowDate } from "@/lib/persistence";
import { acquisitionWorkflowSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    const body = acquisitionWorkflowSchema.parse(await request.json());
    const customerAcceptanceActions = ["offer_accepted", "binding_offer_accepted"];
    const offerDateActions = ["indicative_offer_sent", "offer_accepted", "binding_offer_sent", "binding_offer_accepted"];
    const action = body.action as AcquisitionWorkflowAction;
    if (user.role === "partner") {
      if (!canSeeProperty(user, caseView.property) || !customerAcceptanceActions.includes(body.action) || !canAcceptCustomerOffer(user, caseView.property)) {
        throw new Error("Forbidden");
      }
    } else if (offerDateActions.includes(body.action) ? !canEditAcquisitionDates(user, caseView.property) : !canAdvanceAcquisition(user, caseView.property)) {
      throw new Error("Forbidden");
    }
    const workflowOptions = {
      hasBindingOffer: caseView.offers.some((offer) => offer.kind === "binding"),
      indicativeOfferSentAt: body.indicativeOfferSentAt,
      offerAcceptedAt: body.offerAcceptedAt,
      expertOpinionOrderedAt: body.expertOpinionOrderedAt,
      expertOpinionReceivedAt: body.expertOpinionReceivedAt,
      expertOpinionCompany: body.expertOpinionCompany,
      bindingOfferSentAt: body.bindingOfferSentAt,
      bindingOfferAcceptedAt: body.bindingOfferAcceptedAt,
      notaryAppointmentAt: body.notaryAppointmentAt,
      notaryOffice: body.notaryOffice
    };
    const completedDateUpdate = offerDateActions.includes(body.action) && isAcquisitionActionReached(caseView.property, action);
    if (completedDateUpdate) {
      validateAcquisitionOfferDates(caseView.property, workflowOptions);
      const property = await updateDbAcquisitionWorkflowDate(params.id, body.action as never, user.id, {
        indicativeOfferSentAt: body.indicativeOfferSentAt,
        offerAcceptedAt: body.offerAcceptedAt,
        bindingOfferSentAt: body.bindingOfferSentAt,
        bindingOfferAcceptedAt: body.bindingOfferAcceptedAt,
        source: user.role
      });
      return json({ property });
    }
    validateAcquisitionTransition(caseView.property, action, workflowOptions);
    const property = await advanceDbAcquisitionWorkflow(params.id, body.action, user.id, {
      indicativeOfferSentAt: body.indicativeOfferSentAt,
      offerAcceptedAt: body.offerAcceptedAt,
      expertOpinionOrderedAt: body.expertOpinionOrderedAt,
      expertOpinionReceivedAt: body.expertOpinionReceivedAt,
      expertOpinionCompany: body.expertOpinionCompany,
      bindingOfferSentAt: body.bindingOfferSentAt,
      bindingOfferAcceptedAt: body.bindingOfferAcceptedAt,
      notaryAppointmentAt: body.notaryAppointmentAt,
      notaryOffice: body.notaryOffice,
      source: user.role
    });
    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
