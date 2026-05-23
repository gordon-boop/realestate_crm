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
    const hasUvaAccepted = caseView.property.status === "OFFER_ACCEPTED" || Boolean(caseView.property.offerAcceptedAt);
    const hasExpertOpinionOrdered = caseView.property.status === "EXPERT_OPINION_ORDERED" || Boolean(caseView.property.expertOpinionOrderedAt);
    const hasExpertOpinionReceived = caseView.property.status === "EXPERT_OPINION_RECEIVED" || Boolean(caseView.property.expertOpinionReceivedAt);
    const hasBindingOfferSent = caseView.property.status === "BINDING_OFFER_SENT" || Boolean(caseView.property.bindingOfferSentAt);
    const hasBindingOfferAccepted = caseView.property.status === "BINDING_OFFER_ACCEPTED" || Boolean(caseView.property.bindingOfferAcceptedAt);

    if (body.action === "expert_opinion_ordered" && !hasUvaAccepted) {
      throw new Error("UVA angenommen required before ordering expert opinion");
    }
    if (body.action === "expert_opinion_received" && !hasExpertOpinionOrdered) {
      throw new Error("Expert opinion order required before marking opinion received");
    }
    if (body.action === "binding_offer_sent" && !caseView.offers.some((offer) => offer.kind === "binding")) {
      throw new Error("Binding offer calculation required before sending binding offer");
    }
    if (body.action === "binding_offer_sent" && !hasExpertOpinionReceived) {
      throw new Error("Expert opinion received required before sending binding offer");
    }
    if (body.action === "binding_offer_accepted" && !hasBindingOfferSent) {
      throw new Error("Binding offer sent required before accepting binding offer");
    }
    if (body.action === "notary_appointment_ordered" && !hasBindingOfferAccepted) {
      throw new Error("VA angenommen required before scheduling notary appointment");
    }
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
