import { canCalculateOffer } from "@/lib/access-control";
import { assertAcquisitionPrecheckAllowsOffer, getAcquisitionPrecheckData } from "@/lib/acquisition-precheck";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { FixedResidentialRightIndexationScenario } from "@/lib/calculations/fixedResidentialRight";
import type { DesiredModel } from "@/lib/domain";
import { assertRatingAllowsOffer } from "@/lib/object-rating";
import { calculateOffer } from "@/lib/offer-calculator";
import { addDbActivity, getDbCaseByPropertyId, toJsonSnapshot, toPrismaJson, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { getLifetimeResidentialRightEligibility } from "@/lib/residential-right-eligibility";
import { nextSequenceValue } from "@/lib/sequence";

type CalculateOfferBody = {
  model?: DesiredModel;
  kind?: "indicative" | "binding";
  inputs?: Record<string, number | string | null | undefined>;
};

function hasInput(input: Record<string, number | string | null | undefined> | undefined, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input ?? {}, key);
}

function readNumber(input: Record<string, number | string | null | undefined> | undefined, key: string): number | undefined {
  const value = input?.[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const normalized = String(value).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readIndexationScenario(input: Record<string, number | string | null | undefined> | undefined): FixedResidentialRightIndexationScenario | undefined {
  const value = readNumber(input, "selectedIndexationScenario");
  const normalized = value && value > 1 ? value / 100 : value;
  if (normalized === 0.01 || normalized === 0.02 || normalized === 0.03) return normalized;
  return undefined;
}

function completedAge(dateOfBirth: string | undefined, at: Date): number | undefined {
  if (!dateOfBirth) return undefined;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return undefined;
  let age = at.getFullYear() - birthDate.getFullYear();
  const birthdayReached = at.getMonth() > birthDate.getMonth()
    || (at.getMonth() === birthDate.getMonth() && at.getDate() >= birthDate.getDate());
  if (!birthdayReached) age -= 1;
  return age >= 0 ? age : undefined;
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canCalculateOffer(user, caseView.property)) throw new Error("Forbidden");

    const body = (await request.json().catch(() => ({}))) as CalculateOfferBody;
    const model = body.model ?? caseView.property.desiredModel;
    const kind = body.kind ?? "indicative";
    const residentialRightYears = readNumber(body.inputs, "residentialRightYears") ?? caseView.property.desiredResidentialRightYears;
    const manualMarketValue = readNumber(body.inputs, "manualMarketValue") ?? readNumber(body.inputs, "marketValue");
    const expertOpinionValue = readNumber(body.inputs, "expertOpinionValue");
    const preliminaryMarketValue = readNumber(getAcquisitionPrecheckData(caseView.property) as Record<string, number | string | null | undefined>, "preliminaryMarketValue");
    const leadingMarketValue = kind === "binding" ? expertOpinionValue : preliminaryMarketValue;
    if (kind === "indicative" && !preliminaryMarketValue) {
      throw new Error("Bitte erfassen Sie zuerst einen vorläufigen Verkehrswert in der Vorabprüfung oder im Objektbereich.");
    }
    if (kind === "binding" && !caseView.property.expertOpinionReceivedAt) {
      throw new Error("Gutachteneingang required before binding offer calculation");
    }
    if (kind === "binding" && !expertOpinionValue) {
      throw new Error("Bitte erfassen Sie zuerst den Gutachtenwert.");
    }
    assertAcquisitionPrecheckAllowsOffer(caseView, { marketValueOverride: leadingMarketValue, marketValueMode: kind === "binding" ? "appraisal" : "preliminary" });
    const ratingGate = assertRatingAllowsOffer(caseView.objectRatings, caseView.property, kind === "binding" ? "binding" : "indicative");
    const approvedRating = ratingGate.rating;
    const ratingTargetReturn = readNumber(body.inputs, "targetReturn")
      ?? approvedRating?.finalTargetReturn;
    const calculationDate = new Date();
    const residentialRightVariant = model === "fixed_residential_right" && caseView.property.usageModel === "lifelong_residential_right"
      ? "lifelong_residential_right"
      : model === "fixed_residential_right"
        ? "fixed_residential_right"
        : undefined;
    if (residentialRightVariant === "lifelong_residential_right") {
      const eligibility = getLifetimeResidentialRightEligibility(caseView.customer, calculationDate, {
        recipients: caseView.property.residentialRightRecipients,
        residentialRightPerson: caseView.property.residentialRightPerson
      });
      if (!eligibility.eligible) {
        throw new Error(eligibility.message);
      }
    }

    if (!leadingMarketValue && !caseView.valuation) {
      throw new Error("Bitte geben Sie einen Verkehrswert ein.");
    }

    const calculationValuation = leadingMarketValue
      ? await prisma.valuation.create({
          data: {
            propertyId: params.id,
            provider: "other",
            status: "completed",
            sourceLabel: kind === "binding" ? "Gutachtenwert" : "Vorläufiger Verkehrswert",
            marketValue: leadingMarketValue,
            valueMin: leadingMarketValue,
            valueMax: leadingMarketValue,
            confidenceScore: 1,
            rawResponseJson: toPrismaJson({
              source: kind === "binding" ? "manual_expert_opinion" : "preliminary_market_value",
              preliminaryMarketValue: kind === "indicative" ? leadingMarketValue : undefined,
              expertOpinionValue: kind === "binding" ? leadingMarketValue : undefined,
              note: kind === "binding"
                ? "Gutachtenwert wurde manuell für die VA-Kalkulation hinterlegt."
                : "Vorläufiger Verkehrswert wurde für die UVA-Kalkulation verwendet."
            }),
            completedAt: new Date()
          }
        })
      : caseView.valuation;
    if (!calculationValuation) {
      throw new Error("Bitte geben Sie einen Verkehrswert ein.");
    }
    const residentialMonthlyRent = hasInput(body.inputs, "residentialMonthlyRent")
      ? readNumber(body.inputs, "residentialMonthlyRent") ?? 0
      : undefined;
    const garageMonthlyRent = hasInput(body.inputs, "garageMonthlyRent")
      ? readNumber(body.inputs, "garageMonthlyRent") ?? 0
      : undefined;

    const calculation = calculateOffer({
      valuation: {
        marketValue: Number(calculationValuation.marketValue)
      },
      condition: caseView.property.condition,
      model,
      usageModel: caseView.property.usageModel,
      residentialRightYears,
      livingAreaSqm: readNumber(body.inputs, "livingAreaSqm") ?? caseView.property.livingAreaSqm,
      propertyType: caseView.property.propertyType,
      energyClass: caseView.property.energyClass,
      garageCount: readNumber(body.inputs, "garageCount") ?? (caseView.property.parkingAvailable ? caseView.property.parkingCount : 0),
      monthlyRentPerSqm: readNumber(body.inputs, "monthlyRentPerSqm"),
      garageRentMonthly: readNumber(body.inputs, "garageRentMonthly"),
      residentialMonthlyRent,
      garageMonthlyRent,
      interestRate: readNumber(body.inputs, "interestRate"),
      safetyDiscountRate: readNumber(body.inputs, "safetyDiscountRate") ?? readNumber(body.inputs, "safetyDiscount"),
      targetReturn: ratingTargetReturn,
      primaryDateOfBirth: caseView.customer.dateOfBirth,
      primaryGender: caseView.customer.gender,
      secondDateOfBirth: caseView.customer.spouseDateOfBirth,
      secondGender: caseView.customer.spouseGender,
      customerAge: completedAge(caseView.customer.dateOfBirth, calculationDate) ?? caseView.customer.ageAtSubmission,
      customerGender: caseView.customer.gender,
      spouseAge: completedAge(caseView.customer.spouseDateOfBirth, calculationDate),
      spouseGender: caseView.customer.spouseGender,
      residentialRightRecipients: caseView.property.residentialRightRecipients,
      residentialRightPerson: caseView.property.residentialRightPerson,
      calculationDate,
      acquisitionCostRate: readNumber(body.inputs, "acquisitionCostRate"),
      salesCostRate: readNumber(body.inputs, "salesCostRate"),
      selectedIndexationScenario: readIndexationScenario(body.inputs),
      exitValueGrowthRate: readNumber(body.inputs, "exitValueGrowthRate"),
      maintenanceUsageRate: readNumber(body.inputs, "maintenanceUsageRate"),
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
      ? caseView.offers.find((offer) => {
          const assumptions = offer.assumptions as { residentialRightVariant?: string } | undefined;
          return offer.kind === "indicative"
            && offer.model === model
            && (model !== "fixed_residential_right" || assumptions?.residentialRightVariant === residentialRightVariant);
        })
      : undefined;
    const baseAssumptions = residentialRightVariant
      ? {
          ...calculation.assumptions,
          residentialRightVariant,
          residentialRightVariantLabel: residentialRightVariant === "lifelong_residential_right" ? "Lebenslanges Wohnrecht" : "Befristetes Wohnrecht"
        }
      : calculation.assumptions;
    const assumptions = kind === "binding"
      ? {
          ...baseAssumptions,
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
      : baseAssumptions;

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
    const productLabel = model === "sale_and_leaseback"
      ? "Rückmietverkauf"
      : residentialRightVariant === "lifelong_residential_right"
        ? "Lebenslanges Wohnrecht"
        : residentialRightVariant === "fixed_residential_right"
          ? "Befristetes Wohnrecht"
          : "Wohnrecht";
    await addDbActivity(
      params.id,
      user.id,
      kind === "binding" ? "binding_offer_calculated" : "offer_calculated",
      `${kind === "binding" ? "Verbindliches Angebot" : "Unverbindliches Angebot"} für ${productLabel} wurde berechnet: Auszahlungsbetrag ${calculation.payoutAmount.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €.`,
      { source: "admin", entityType: "offer", entityId: offer.id, metadata: { model, residentialRightVariant, kind, manualMarketValue, preliminaryMarketValue, expertOpinionValue } }
    );
    if (kind === "binding" && expertOpinionValue) {
      await addDbActivity(
        params.id,
        user.id,
        "appraisal_value_saved",
        `Gutachtenwert gespeichert: ${expertOpinionValue.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €.`,
        { source: "admin", entityType: "valuation", entityId: calculationValuation.id, metadata: { visibility: "internal", preliminaryMarketValue, expertOpinionValue } }
      );
      if (preliminaryMarketValue && Math.abs(expertOpinionValue - preliminaryMarketValue) / preliminaryMarketValue >= 0.1) {
        await addDbActivity(
          params.id,
          user.id,
          "appraisal_value_deviation",
          "Gutachtenwert weicht deutlich vom vorläufigen Verkehrswert ab. Bitte Rating-Review durchführen.",
          { source: "admin", entityType: "valuation", entityId: calculationValuation.id, metadata: { visibility: "internal", preliminaryMarketValue, expertOpinionValue } }
        );
      }
    }
    return json({ offer }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
