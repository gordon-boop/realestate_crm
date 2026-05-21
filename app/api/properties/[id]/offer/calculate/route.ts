import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { DesiredModel, Offer } from "@/lib/domain";
import { makeId, nowIso } from "@/lib/id";
import { calculateOffer } from "@/lib/offer-calculator";
import { addActivity, getCaseByPropertyId, nextOfferNumber, saveOfferVersion, store, updatePropertyStatus } from "@/lib/store";

type CalculateOfferBody = {
  model?: DesiredModel;
  inputs?: Record<string, number | string | undefined>;
};

function readNumber(input: Record<string, number | string | undefined> | undefined, key: string): number | undefined {
  const value = input?.[key];
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.valuation) throw new Error("Valuation required before offer calculation");
    const body = (await request.json().catch(() => ({}))) as CalculateOfferBody;
    const model = body.model ?? caseView.property.desiredModel;
    const residentialRightYears = readNumber(body.inputs, "residentialRightYears") ?? caseView.property.desiredResidentialRightYears;

    const calculation = calculateOffer({
      valuation: caseView.valuation,
      condition: caseView.property.condition,
      model,
      residentialRightYears,
      livingAreaSqm: readNumber(body.inputs, "livingAreaSqm") ?? caseView.property.livingAreaSqm,
      propertyType: caseView.property.propertyType,
      energyClass: caseView.property.energyClass,
      garageCount: readNumber(body.inputs, "garageCount") ?? (caseView.property.parkingAvailable ? caseView.property.parkingCount : 0),
      monthlyRentPerSqm: readNumber(body.inputs, "monthlyRentPerSqm"),
      garageRentMonthly: readNumber(body.inputs, "garageRentMonthly"),
      interestRate: readNumber(body.inputs, "interestRate"),
      acquisitionCostRate: readNumber(body.inputs, "acquisitionCostRate"),
      salesCostRate: readNumber(body.inputs, "salesCostRate"),
      saleAndLeasebackPayoutRate: readNumber(body.inputs, "saleAndLeasebackPayoutRate"),
      maintenancePledge: readNumber(body.inputs, "maintenancePledge"),
      bankDisbursementRate: readNumber(body.inputs, "bankDisbursementRate"),
      brokerageFeeRate: readNumber(body.inputs, "brokerageFeeRate"),
      transferTaxNotaryRate: readNumber(body.inputs, "transferTaxNotaryRate"),
      sellingCostRate: readNumber(body.inputs, "sellingCostRate"),
      serviceChargeMonthly: readNumber(body.inputs, "serviceChargeMonthly"),
      insuranceAnnual: readNumber(body.inputs, "insuranceAnnual"),
      propertyTaxAnnual: readNumber(body.inputs, "propertyTaxAnnual"),
      landChargeCost: readNumber(body.inputs, "landChargeCost"),
      annualRentIncome: readNumber(body.inputs, "annualRentIncome")
    });

    const existing = store.offers.find((item) => item.propertyId === params.id && item.model === model);
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
        model,
        residentialRightYears,
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
      model,
      residentialRightYears,
      assumptions: calculation.assumptions,
      status: "draft",
      updatedAt: now
    });

    if (!existing) {
      store.offers.push(offer);
    }

    saveOfferVersion(offer, user.id);
    caseView.property.offerCalculationSource = calculation.assumptions.sourceWorkbook ?? "application";
    updatePropertyStatus(params.id, "OFFER_CALCULATED");
    addActivity(
      params.id,
      user.id,
      "offer_calculated",
      `Indikatives Angebot für ${model === "sale_and_leaseback" ? "Rückmietmodell" : "Verrentungsmodell"} wurde berechnet.`,
      { source: "admin", entityType: "offer", entityId: offer.id, metadata: { model } }
    );
    return json({ offer }, { status: existing ? 200 : 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
