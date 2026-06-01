import type { DesiredModel, Gender, OfferAssumptions, PropertyCondition, PropertyType, ResidentialRightRecipients, Valuation } from "./domain.ts";
import { solvePayoutForTargetWeightedIrr, type MortalityGender } from "./residential-right-irr.ts";

export type OfferCalculationInput = {
  valuation: Pick<Valuation, "marketValue">;
  condition: PropertyCondition;
  model: DesiredModel;
  residentialRightYears?: number;
  livingAreaSqm?: number;
  propertyType?: PropertyType;
  energyClass?: string;
  monthlyRentPerSqm?: number;
  residentialMonthlyRent?: number;
  garageCount?: number;
  garageRentMonthly?: number;
  garageMonthlyRent?: number;
  interestRate?: number;
  safetyDiscountRate?: number;
  targetReturn?: number;
  customerAge?: number;
  customerGender?: Gender;
  spouseAge?: number;
  spouseGender?: Gender;
  residentialRightRecipients?: ResidentialRightRecipients;
  residentialRightPerson?: string;
  calculationDate?: Date | string;
  acquisitionCostRate?: number;
  salesCostRate?: number;
  exitValueGrowthRate?: number;
  maintenanceUsageRate?: number;
  saleAndLeasebackPayoutRate?: number;
  maintenancePledge?: number;
  bankDisbursementRate?: number;
  brokerageFeeRate?: number;
  transferTaxNotaryRate?: number;
  sellingCostRate?: number;
  serviceChargeMonthly?: number;
  insuranceAnnual?: number;
  propertyTaxAnnual?: number;
  landChargeCost?: number;
  annualRentIncome?: number;
};

export type OfferCalculationResult = {
  marketValue: number;
  adjustedMarketValue: number;
  residentialRightValue: number;
  riskDiscount: number;
  companyMargin: number;
  payoutAmount: number;
  payoutRate?: number;
  annualRentRate?: number;
  annualRent?: number;
  monthlyRent?: number;
  calculationMode?: "DEMO_FIXED_RATE" | "RATING_TARGET_RETURN_IRR";
  assumptions: OfferAssumptions;
};

const conditionDiscounts: Record<PropertyCondition, number> = {
  very_good: 0,
  good: 0.02,
  average: 0.05,
  renovation_needed: 0.1
};

const residentialRightDiscounts: Record<number, number> = {
  5: 0.15,
  10: 0.28,
  15: 0.4
};

const riskDiscountRate = 0.05;
const companyMarginRate = 0.07;

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

function precision(value: number, digits = 6): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function rate(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  if (value > 1 && value <= 100) {
    return value / 100;
  }

  if (value < 0 || value > 1) {
    return fallback;
  }

  return value;
}

function normalizeMortalityGender(gender: Gender | undefined): MortalityGender | undefined {
  if (gender === "female") return "female";
  if (gender === "male") return "male";
  return undefined;
}

function selectMortalityBasis(input: OfferCalculationInput): { age: number; gender: MortalityGender } | undefined {
  const customerGender = normalizeMortalityGender(input.customerGender);
  const spouseGender = normalizeMortalityGender(input.spouseGender);
  const candidates = [
    input.customerAge !== undefined && customerGender ? { person: "customer_1", age: input.customerAge, gender: customerGender } : undefined,
    input.spouseAge !== undefined && spouseGender ? { person: "customer_2", age: input.spouseAge, gender: spouseGender } : undefined
  ].filter((candidate): candidate is { person: string; age: number; gender: MortalityGender } =>
    Boolean(candidate && Number.isFinite(candidate.age) && candidate.age >= 0)
  );

  if (!candidates.length) return undefined;

  if (input.residentialRightRecipients === "one_person" && input.residentialRightPerson) {
    const selected = candidates.find((candidate) => candidate.person === input.residentialRightPerson);
    if (selected) return { age: Math.trunc(selected.age), gender: selected.gender };
  }

  // The Excel master bases the joint-case horizon on the person with the longer expected occupancy.
  const selected = candidates.reduce((current, candidate) => candidate.age < current.age ? candidate : current, candidates[0]);
  return { age: Math.trunc(selected.age), gender: selected.gender };
}

export function getResidentialRightRate(years?: number): number {
  if (!years) {
    return 0;
  }

  return residentialRightDiscounts[years] ?? residentialRightDiscounts[10];
}

export function calculateOffer(input: OfferCalculationInput): OfferCalculationResult {
  if (input.model === "fixed_residential_right") {
    return calculateFixedResidentialRightOffer(input);
  }

  if (input.model === "sale_and_leaseback") {
    return calculateSaleAndLeasebackOffer(input);
  }

  return calculateLegacyMvpOffer(input);
}

function calculateLegacyMvpOffer(input: OfferCalculationInput): OfferCalculationResult {
  const conditionDiscountRate = conditionDiscounts[input.condition];
  const residentialRightRate = getResidentialRightRate(input.residentialRightYears);
  const marketValue = money(input.valuation.marketValue);
  const adjustedMarketValue = money(marketValue * (1 - conditionDiscountRate));
  const residentialRightValue = money(adjustedMarketValue * residentialRightRate);
  const riskDiscount = money(adjustedMarketValue * riskDiscountRate);
  const companyMargin = money(adjustedMarketValue * companyMarginRate);
  const payoutAmount = money(adjustedMarketValue - residentialRightValue - riskDiscount - companyMargin);

  return {
    marketValue,
    adjustedMarketValue,
    residentialRightValue,
    riskDiscount,
    companyMargin,
    payoutAmount,
    assumptions: {
      conditionDiscountRate,
      residentialRightRate,
      riskDiscountRate,
      companyMarginRate,
      formula:
        "payout = adjusted_market_value - residential_right_value - risk_discount - company_margin",
      note:
        "MVP-Platzhalter. Später durch versicherungsmathematisches und immobilienspezifisches Bewertungsmodell ersetzen."
    }
  };
}

function calculateFixedResidentialRightOffer(input: OfferCalculationInput): OfferCalculationResult {
  const marketValue = money(input.valuation.marketValue);
  const durationYears = input.residentialRightYears ?? 10;
  const livingAreaSqm = input.livingAreaSqm ?? 0;
  const monthlyRentPerSqm = input.monthlyRentPerSqm ?? 6.2;
  const residentialMonthlyRent = input.residentialMonthlyRent !== undefined
    ? Math.max(0, input.residentialMonthlyRent)
    : money(monthlyRentPerSqm * livingAreaSqm);
  const garageCount = input.garageCount ?? 0;
  const garageRentMonthly = input.garageMonthlyRent !== undefined
    ? Math.max(0, input.garageMonthlyRent)
    : input.garageRentMonthly ?? 30;
  const interestRate = rate(input.interestRate, 0.032);
  const safetyDiscountRate = rate(input.safetyDiscountRate, 0);
  const targetReturn = input.targetReturn === undefined ? undefined : rate(input.targetReturn, 0);
  const acquisitionCostRate = rate(input.acquisitionCostRate, 0.08);
  const salesCostRate = rate(input.salesCostRate, 0.015);
  const exitValueGrowthRate = rate(input.exitValueGrowthRate, 0.02);
  const maintenanceUsageRate = rate(input.maintenanceUsageRate, 0.7);
  const propertyType = input.propertyType ?? "house";
  const energyClass = (input.energyClass ?? "").trim().toUpperCase();
  const isApartment = propertyType === "apartment";
  const maintenanceRatePerSqmYear = isApartment
    ? energyClass === "F"
      ? 22
      : 17
    : energyClass === "F"
      ? 15
      : 10;

  const residentialRightValue = money(residentialMonthlyRent * 12 * durationYears + durationYears * garageCount * garageRentMonthly * 12);
  const maintenanceCost = money(livingAreaSqm * Math.round(durationYears + 1) * maintenanceRatePerSqmYear);
  const safetyDiscount = money(marketValue * safetyDiscountRate);
  const mortalityBasis = selectMortalityBasis(input);
  const baseAfterUsageAndMaintenance = marketValue - residentialRightValue - maintenanceCost - safetyDiscount;
  const interestDiscount = money(baseAfterUsageAndMaintenance * (Math.pow(1 + interestRate, durationYears) - 1));
  const legacyPayoutAmount = money(Math.max(0, marketValue - residentialRightValue - maintenanceCost - safetyDiscount - interestDiscount));
  const targetIrrCalculation = targetReturn && targetReturn > 0 && mortalityBasis
    ? solvePayoutForTargetWeightedIrr({
        marketValue,
        maintenanceCost,
        durationYears,
        mortalityAge: mortalityBasis.age,
        mortalityGender: mortalityBasis.gender,
        targetReturn,
        acquisitionCostRate,
        salesCostRate,
        exitValueGrowthRate,
        maintenanceUsageRate,
        calculationDate: input.calculationDate
      })
    : undefined;
  const payoutAmount = targetIrrCalculation ? money(Math.max(0, targetIrrCalculation.payoutAmount)) : legacyPayoutAmount;
  const riskDiscount = targetIrrCalculation
    ? money(marketValue - residentialRightValue - maintenanceCost - payoutAmount)
    : money(interestDiscount + safetyDiscount);
  const acquisitionCost = money(marketValue * acquisitionCostRate);
  const salesCost = money(marketValue * salesCostRate);
  const profitNoIndex = money(marketValue - payoutAmount - maintenanceCost - acquisitionCost - salesCost);
  const capitalEmployed = payoutAmount + maintenanceCost + acquisitionCost + salesCost;
  const annualYieldNoIndex = capitalEmployed > 0 ? money((profitNoIndex / capitalEmployed / durationYears) * 100) / 100 : 0;
  const components: Record<string, number> = {
    residentialRightValue,
    maintenanceCost,
    interestDiscount,
    safetyDiscountRate,
    safetyDiscount,
    riskDiscount,
    acquisitionCost,
    salesCost,
    profitNoIndex,
    annualYieldNoIndex,
    payoutRatio: money(payoutAmount / marketValue)
  };

  if (targetIrrCalculation) {
    components.weightedAnnualIrr = precision(targetIrrCalculation.weightedIrr);
    components.survivalProbability = precision(targetIrrCalculation.survivalProbability);
    components.initialOutflow = money(targetIrrCalculation.initialOutflow);
    components.maintenanceReserve = money(targetIrrCalculation.maintenanceReserve);
  }

  if (targetReturn !== undefined) {
    components.targetReturn = precision(targetReturn);
  }

  return {
    marketValue,
    adjustedMarketValue: marketValue,
    residentialRightValue,
    riskDiscount,
    companyMargin: maintenanceCost,
    payoutAmount,
    calculationMode: targetIrrCalculation ? "RATING_TARGET_RETURN_IRR" : undefined,
    assumptions: {
      productModel: "fixed_residential_right",
      formula: targetIrrCalculation
        ? "payout is solved backwards until mortality_weighted_annual_irr equals the object_rating_target_return"
        : "payout = market_value - residential_right_value - maintenance_cost - interest_discount",
      note:
        targetIrrCalculation
          ? "Wohnrecht. Die Zielrendite aus dem Objektrating wird als sterbequoten-gewichteter jährlicher IRR verwendet; die Auszahlung wird aus den Excel-Nebenrechnungen AG-AI rückwärts gelöst."
          : "Wohnrecht. MVP-Implementierung nach den Kernzellen aus dem Excel-Auszahlungstool.",
      sourceWorkbook: "Kalkulationstool_befristetes WR_Master - Sterbetafel 2022-2024.xlsx",
      sourceCells: {
        marketValue: "Auszahlungstool_Master!P10/C29",
        residentialRightValue: "Auszahlungstool_Master!Q10",
        maintenanceCost: "Auszahlungstool_Master!R10",
        interestDiscount: "Auszahlungstool_Master!S10",
        payoutAmount: "Auszahlungstool_Master!T10",
        durationYears: "Auszahlungstool_Master!U10/C19",
        mortalityWeightedIrr: "Auszahlungstool_Master!AG:AI/T13"
      },
      inputs: {
        durationYears,
        livingAreaSqm,
        monthlyRentPerSqm,
        residentialMonthlyRent,
        garageCount,
        garageRentMonthly,
        interestRate,
        safetyDiscountRate,
        targetReturn: targetReturn ?? null,
        mortalityAge: mortalityBasis?.age ?? null,
        mortalityGender: mortalityBasis?.gender ?? null,
        acquisitionCostRate,
        salesCostRate,
        exitValueGrowthRate,
        maintenanceUsageRate,
        propertyType,
        energyClass: input.energyClass ?? null
      },
      components
    }
  };
}

function calculateSaleAndLeasebackOffer(input: OfferCalculationInput): OfferCalculationResult {
  const marketValue = money(input.valuation.marketValue);
  if (marketValue <= 0) {
    throw new Error("marketValue must be greater than 0 for Rückmietverkauf calculation");
  }

  const payoutRate = 0.7;
  const annualRentRate = 0.05;
  const payoutAmount = money(marketValue * payoutRate);
  const annualRent = money(payoutAmount * annualRentRate);
  const monthlyRent = money(annualRent / 12);

  if (payoutAmount <= 0 || annualRent <= 0 || monthlyRent <= 0) {
    throw new Error("Rückmietverkauf calculation produced invalid non-positive values");
  }

  return {
    marketValue,
    adjustedMarketValue: marketValue,
    residentialRightValue: 0,
    riskDiscount: money(marketValue - payoutAmount),
    companyMargin: 0,
    payoutAmount,
    payoutRate,
    annualRentRate,
    annualRent,
    monthlyRent,
    calculationMode: "DEMO_FIXED_RATE",
    assumptions: {
      productModel: "sale_and_leaseback",
      formula: "payout = market_value * payout_rate; annual_rent = payout * annual_rent_rate; monthly_rent = annual_rent / 12",
      note:
        "Demo-Kalkulation: Die Auszahlung beträgt pauschal 70 % des Verkehrswerts. Die jährliche Miete beträgt 5 % des Auszahlungsbetrags. Rating-Tool folgt.",
      calculationMode: "DEMO_FIXED_RATE",
      inputs: {
        marketValue
      },
      components: {
        payoutRate,
        payoutAmount,
        annualRentRate,
        annualRent,
        monthlyRent
      }
    }
  };
}
