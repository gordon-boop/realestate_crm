import { canAcceptCustomerOffer, canAdvanceAcquisition, canEditAcquisitionDates, canSeeProperty } from "@/lib/access-control";
import { assertAcquisitionPrecheckAllowsOffer } from "@/lib/acquisition-precheck";
import { isAcquisitionActionReached, validateAcquisitionOfferDates, validateAcquisitionTransition, type AcquisitionWorkflowAction } from "@/lib/acquisition-workflow";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { CaseView, DesiredModel, OfferKind, User } from "@/lib/domain";
import { assertRatingAllowsOffer } from "@/lib/object-rating";
import { advanceDbAcquisitionWorkflow, getDbCaseByPropertyId, updateDbAcquisitionWorkflowDate } from "@/lib/persistence";
import { acquisitionWorkflowSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    const body = acquisitionWorkflowSchema.parse(await request.json());
    const customerAcceptanceActions = ["offer_accepted", "binding_offer_accepted"];
    const workflowDataActions = ["indicative_offer_sent", "offer_accepted", "expert_opinion_ordered", "expert_opinion_received", "binding_offer_sent", "binding_offer_accepted"];
    const action = body.action as AcquisitionWorkflowAction;
    if (user.role === "partner") {
      if (!canSeeProperty(user, caseView.property) || !customerAcceptanceActions.includes(body.action) || !canAcceptCustomerOffer(user, caseView.property)) {
        throw new Error("Forbidden");
      }
    } else if (workflowDataActions.includes(body.action) ? !canEditAcquisitionDates(user, caseView.property) : !canAdvanceAcquisition(user, caseView.property)) {
      throw new Error("Forbidden");
    }
    if (body.action === "indicative_offer_sent" || body.action === "offer_accepted") {
      assertAcquisitionPrecheckAllowsOffer(caseView);
      assertRatingAllowsOffer(caseView.objectRatings, caseView.property, "indicative");
    }
    if (body.action === "binding_offer_sent" || body.action === "binding_offer_accepted") {
      assertAcquisitionPrecheckAllowsOffer(caseView);
      assertRatingAllowsOffer(caseView.objectRatings, caseView.property, "binding");
    }
    const acceptedOfferSelection = resolveAcceptedOfferSelection(caseView, body.action, body.acceptedOfferModel, body.acceptedOfferId, body.acceptedOfferNote, user);
    const workflowOptions = {
      hasBindingOffer: caseView.offers.some((offer) => offer.kind === "binding"),
      indicativeOfferSentAt: body.indicativeOfferSentAt,
      offerAcceptedAt: body.offerAcceptedAt,
      expertOpinionOrderedAt: body.expertOpinionOrderedAt,
      expertOpinionReceivedAt: body.expertOpinionReceivedAt,
      expertOpinionCompany: body.expertOpinionCompany,
      bindingOfferSentAt: body.bindingOfferSentAt,
      bindingOfferAcceptedAt: body.bindingOfferAcceptedAt,
      acceptedOfferModel: acceptedOfferSelection?.model,
      acceptedOfferId: acceptedOfferSelection?.offerId,
      acceptedOfferNote: acceptedOfferSelection?.note,
      notaryAppointmentAt: body.notaryAppointmentAt,
      notaryOffice: body.notaryOffice
    };
    const completedDateUpdate = workflowDataActions.includes(body.action) && isAcquisitionActionReached(caseView.property, action);
    if (completedDateUpdate) {
      validateAcquisitionOfferDates(caseView.property, workflowOptions);
      const property = await updateDbAcquisitionWorkflowDate(params.id, body.action as never, user.id, {
        indicativeOfferSentAt: body.indicativeOfferSentAt,
        offerAcceptedAt: body.offerAcceptedAt,
        expertOpinionOrderedAt: body.expertOpinionOrderedAt,
        expertOpinionReceivedAt: body.expertOpinionReceivedAt,
        expertOpinionCompany: body.expertOpinionCompany,
        bindingOfferSentAt: body.bindingOfferSentAt,
        bindingOfferAcceptedAt: body.bindingOfferAcceptedAt,
        acceptedOfferModel: acceptedOfferSelection?.model,
        acceptedOfferId: acceptedOfferSelection?.offerId,
        acceptedOfferNote: acceptedOfferSelection?.note,
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
      acceptedOfferModel: acceptedOfferSelection?.model,
      acceptedOfferId: acceptedOfferSelection?.offerId,
      acceptedOfferNote: acceptedOfferSelection?.note,
      notaryAppointmentAt: body.notaryAppointmentAt,
      notaryOffice: body.notaryOffice,
      source: user.role
    });
    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}

function resolveAcceptedOfferSelection(
  caseView: CaseView,
  action: string,
  requestedModel: DesiredModel | undefined,
  requestedOfferId: string | undefined,
  note: string | undefined,
  user: User
): { model: DesiredModel; offerId?: string; note?: string } | undefined {
  if (action !== "offer_accepted" && action !== "binding_offer_accepted") return undefined;

  const targetKind: OfferKind = action === "offer_accepted" ? "indicative" : "binding";
  const existingModel = action === "offer_accepted"
    ? caseView.property.indicativeAcceptedOfferModel
    : caseView.property.bindingAcceptedOfferModel;

  if (user.role !== "admin") {
    if (requestedModel || !existingModel) throw new Error("Forbidden");
    return { model: existingModel, note };
  }

  const offersForKind = caseView.offers.filter((offer) => offer.kind === targetKind);
  const fallbackModels = [
    caseView.property.desiredModel,
    caseView.property.additionalOfferRequested ? caseView.property.additionalOfferModel : undefined
  ].filter(Boolean) as DesiredModel[];
  const offeredModels = Array.from(new Set((offersForKind.length ? offersForKind.map((offer) => offer.model) : fallbackModels).filter((model) => model !== "other")));

  if (!offeredModels.length) throw new Error("Bitte berechnen Sie zuerst das Angebot.");
  if (offeredModels.length > 1 && !requestedModel) throw new Error("Bitte wählen Sie das angenommene Modell aus.");

  const model = requestedModel || offeredModels[0];
  if (!offeredModels.includes(model)) throw new Error("Das ausgewählte Modell wurde nicht angeboten.");

  const matchingOffer = requestedOfferId
    ? offersForKind.find((offer) => offer.id === requestedOfferId && offer.model === model)
    : offersForKind.find((offer) => offer.model === model);
  if (requestedOfferId && !matchingOffer) throw new Error("Das ausgewählte Angebot passt nicht zum angenommenen Modell.");

  return { model, offerId: matchingOffer?.id, note };
}
