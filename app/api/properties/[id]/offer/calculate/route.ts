import { canCalculateOffer } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { DesiredModel } from "@/lib/domain";
import { calculateOffer } from "@/lib/offer-calculator";
import { addDbActivity, getDbCaseByPropertyId, toJsonSnapshot, toPrismaJson, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { nextSequenceValue } from "@/lib/sequence";

type CalculateOfferBody = {
  model?: DesiredModel;
  kind?: "indicative" | "binding";
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
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canCalculateOffer(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.valuation) throw new Error("Valuation required before offer calculation");

    const body = (await request.json().catch(() => ({}))) as CalculateOfferBody;
    const model = body.model ?? caseView.property.desiredModel;
    const kind = body.kind ?? "indicative";
    const residentialRightYears = readNumber(body.inputs, "residentialRightYears") ?? caseView.property.desiredResidentialRightYears;
    const expertOpinionValue = readNumber(body.inputs, "expertOpinionValue");

    if (kind === "binding" && !caseView.property.expertOpinionReceivedAt) {
      throw new Error("Gutachteneingang required before binding offer calculation");
    }
    if (kind === "binding" && !expertOpinionValue) {
      throw new Error("Gutachtenwert required before binding offer calculation");
    }

    const calculationValuation = kind === "binding" && expertOpinionValue
      ? await prisma.valuation.create({
          data: {
            propertyId: params.id,
            provider: "sprengnetter",
            status: "completed",
            sourceLabel: "Gutachtenwert",
            marketValue: expertOpinionValue,
            valueMin: expertOpinionValue,
            valueMax: expertOpinionValue,
            confidenceScore: 1,
            rawResponseJson: toPrismaJson({
              source: "manual_expert_opinion",
              expertOpinionValue,
              note: "Gutachtenwert wurde manuell für die VA-Kalkulation hinterlegt."
            }),
            completedAt: new Date()
          }
        })
      : caseView.valuation;

    const calculation = calculateOffer({
      valuation: {
        marketValue: Number(calculationValuation.marketValue)
      },
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
      saleAndLeasebackPayoutRate: kind === "binding" ? undefined : readNumber(body.inputs, "saleAndLeasebackPayoutRate"),
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
    const indicativeReference = kind === "binding"
      ? caseView.offers.find((offer) => offer.kind === "indicative" && offer.model === model)
      : undefined;
    const assumptions = kind === "binding"
      ? {
          ...calculation.assumptions,
          valuationBasis: "expert_opinion",
          expertOpinionValue,
          indicativeReference: indicativeReference ? {
            offerId: indicativeReference.id,
            offerNumber: indicativeReference.offerNumber,
            marketValue: indicativeReference.marketValue,
            payoutAmount: indicativeReference.payoutAmount,
            version: indicativeReference.currentVersion
          } : undefined,
          deltaToIndicative: indicativeReference ? {
            marketValue: calculation.marketValue - indicativeReference.marketValue,
            payoutAmount: calculation.payoutAmount - indicativeReference.payoutAmount
          } : undefined
        }
      : calculation.assumptions;

    const year = new Date().getFullYear();
    const offerNumber = `ANG-${year}-${String(await nextSequenceValue(`offer:${year}`)).padStart(4, "0")}`;
    const offer = await prisma.offer.create({
      data: {
        propertyId: params.id,
        valuationId: calculationValuation.id,
        offerNumber,
        kind,
        currentVersion: 1,
        marketValue: calculation.marketValue,
        adjustedMarketValue: calculation.adjustedMarketValue,
        residentialRightValue: calculation.residentialRightValue,
        riskDiscount: calculation.riskDiscount,
        companyMargin: calculation.companyMargin,
        payoutAmount: calculation.payoutAmount,
        model: model as never,
        residentialRightYears,
        assumptionsJson: toPrismaJson(assumptions),
        status: kind === "binding" ? "review" : "draft"
      }
    });

    await prisma.offerVersion.create({
      data: {
        offerId: offer.id,
        version: offer.currentVersion,
        snapshotJson: toJsonSnapshot(offer),
        createdByUserId: user.id
      }
    });
    await prisma.property.update({
      where: { id: params.id },
      data: { offerCalculationSource: calculation.assumptions.sourceWorkbook ?? "application" }
    });
    if (kind === "indicative") {
      await updateDbPropertyStatus(params.id, "OFFER_CALCULATED");
    }
    await addDbActivity(
      params.id,
      user.id,
      kind === "binding" ? "binding_offer_calculated" : "offer_calculated",
      `${kind === "binding" ? "Verbindliches Angebot" : "Unverbindliches Angebot"} für ${model === "sale_and_leaseback" ? "Rückmietverkauf" : "Wohnrecht"} wurde berechnet.`,
      { source: "admin", entityType: "offer", entityId: offer.id, metadata: { model, kind, expertOpinionValue } }
    );
    return json({ offer }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
