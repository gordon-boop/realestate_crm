import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { Offer } from "@/lib/domain";
import { makeId, nowIso } from "@/lib/id";
import { calculateOffer } from "@/lib/offer-calculator";
import { addActivity, getCaseByPropertyId, nextOfferNumber, saveOfferVersion, store, updatePropertyStatus } from "@/lib/store";

export function POST(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.valuation) throw new Error("Valuation required before offer calculation");

    const calculation = calculateOffer({
      valuation: caseView.valuation,
      condition: caseView.property.condition,
      model: caseView.property.desiredModel,
      residentialRightYears: caseView.property.desiredResidentialRightYears
    });

    const existing = store.offers.find((item) => item.propertyId === params.id);
    const now = nowIso();
    const offer: Offer =
      existing ??
      {
        id: makeId("off"),
        propertyId: params.id,
        valuationId: caseView.valuation.id,
        offerNumber: nextOfferNumber(),
        kind: "indicative",
        currentVersion: 0,
        marketValue: calculation.marketValue,
        adjustedMarketValue: calculation.adjustedMarketValue,
        residentialRightValue: calculation.residentialRightValue,
        riskDiscount: calculation.riskDiscount,
        companyMargin: calculation.companyMargin,
        payoutAmount: calculation.payoutAmount,
        model: caseView.property.desiredModel,
        residentialRightYears: caseView.property.desiredResidentialRightYears,
        assumptions: calculation.assumptions,
        status: "draft",
        createdAt: now,
        updatedAt: now
      };

    Object.assign(offer, {
      currentVersion: offer.currentVersion + 1,
      valuationId: caseView.valuation.id,
      marketValue: calculation.marketValue,
      adjustedMarketValue: calculation.adjustedMarketValue,
      residentialRightValue: calculation.residentialRightValue,
      riskDiscount: calculation.riskDiscount,
      companyMargin: calculation.companyMargin,
      payoutAmount: calculation.payoutAmount,
      model: caseView.property.desiredModel,
      residentialRightYears: caseView.property.desiredResidentialRightYears,
      assumptions: calculation.assumptions,
      status: "draft",
      updatedAt: now
    });

    if (!existing) {
      store.offers.push(offer);
    }

    saveOfferVersion(offer, user.id);
    caseView.property.offerCalculationSource = "application";
    updatePropertyStatus(params.id, "OFFER_CALCULATED");
    addActivity(params.id, user.id, "offer_calculated", "Indikatives Angebot wurde in der Applikation berechnet.");
    return json({ offer }, { status: existing ? 200 : 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
