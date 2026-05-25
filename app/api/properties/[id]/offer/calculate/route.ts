import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { DesiredModel } from "@/lib/domain";
import { calculateOffer } from "@/lib/offer-calculator";
import { addDbActivity, getDbCaseByPropertyId, toJsonSnapshot, toPrismaJson, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

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
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.valuation) throw new Error("Valuation required before offer calculation");

    const body = (await request.json().catch(() => ({}))) as CalculateOfferBody;
    const model = body.model ?? caseView.property.desiredModel;
    const kind = body.kind ?? "indicative";
    const residentialRightYears = readNumber(body.inputs, "residentialRightYears") ?? caseView.property.desiredResidentialRightYears;
    const expertOpinionValue = readNumber(body.inputs, "expertOpinionValue");

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

    const existing = await prisma.offer.findFirst({ where: { propertyId: params.id, model: model as never, kind } });
    const offerNumber = existing?.offerNumber ?? `ANG-2026-${String((await prisma.offer.count()) + 1).padStart(4, "0")}`;
    const offer = existing
      ? await prisma.offer.update({
          where: { id: existing.id },
          data: {
            currentVersion: { increment: 1 },
            valuationId: calculationValuation.id,
            marketValue: calculation.marketValue,
            adjustedMarketValue: calculation.adjustedMarketValue,
            residentialRightValue: calculation.residentialRightValue,
            riskDiscount: calculation.riskDiscount,
            companyMargin: calculation.companyMargin,
            payoutAmount: calculation.payoutAmount,
            model: model as never,
            residentialRightYears,
            assumptionsJson: toPrismaJson(calculation.assumptions),
            status: kind === "binding" ? "review" : "draft"
          }
        })
      : await prisma.offer.create({
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
            assumptionsJson: toPrismaJson(calculation.assumptions),
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
      `${kind === "binding" ? "Verbindliches Angebot" : "Unverbindliches Angebot"} für ${model === "sale_and_leaseback" ? "Rückmietmodell" : "Verrentungsmodell"} wurde berechnet.`,
      { source: "admin", entityType: "offer", entityId: offer.id, metadata: { model, kind, expertOpinionValue } }
    );
    return json({ offer }, { status: existing ? 200 : 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
