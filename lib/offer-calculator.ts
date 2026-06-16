import type { DesiredModel, Gender, OfferAssumptions, PropertyCondition, PropertyType, ResidentialRightRecipients, UsageModel, Valuation } from "./domain.ts";
import {
  calculateFixedResidentialRightOffer as calculateFixedResidentialRightCore,
  type FixedResidentialRightIndexationScenario
} from "./calculations/fixedResidentialRight.ts";
import { calculateLifetimeResidentialRightOffer as calculateLifetimeResidentialRightCore } from "./calculations/lifetimeResidentialRight.ts";

export type OfferCalculationInput = {
  valuation: Pick<Valuation, "marketValue">;
  condition: PropertyCondition;
  model: DesiredModel;
  usageModel?: UsageModel;
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
  primaryDateOfBirth?: Date | string;
  primaryGender?: Gender;
  secondDateOfBirth?: Date | string;
  secondGender?: Gender;
  customerAge?: number;
  customerGender?: Gender;
  spouseAge?: number;
  spouseGender?: Gender;
  residentialRightRecipients?: ResidentialRightRecipients;
  residentialRightPerson?: string;
  calculationDate?: Date | string;
  acquisitionCostRate?: number;
  salesCostRate?: number;
  selectedIndexationScenario?: FixedResidentialRightIndexationScenario;
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

export function getResidentialRightRate(years?: number): number {
  if (!years) {
    return 0;
  }

  return residentialRightDiscounts[years] ?? residentialRightDiscounts[10];
}

export function calculateOffer(input: OfferCalculationInput): OfferCalculationResult {
  if (input.model === "fixed_residential_right") {
    if (input.usageModel === "lifelong_residential_right") {
      return calculateLifetimeResidentialRightOffer(input);
    }
    return calculateFixedResidentialRightOffer(input);
  }

  if (input.model === "sale_and_leaseback") {
    return calculateSaleAndLeasebackOffer(input);
  }

  return calculateLegacyMvpOffer(input);
}

function calculateLifetimeResidentialRightOffer(input: OfferCalculationInput): OfferCalculationResult {
  const marketValue = money(input.valuation.marketValue);
  const calculationDate = input.calculationDate ?? new Date();
  const livingAreaSqm = input.livingAreaSqm ?? 0;
  const monthlyRentPerSqm = input.monthlyRentPerSqm
    ?? (input.residentialMonthlyRent !== undefined && livingAreaSqm > 0 ? input.residentialMonthlyRent / livingAreaSqm : 0);
  const garageCount = input.garageCount ?? 0;
  const garageRentMonthly = input.garageMonthlyRent ?? input.garageRentMonthly ?? 0;
  const acquisitionCostRate = rate(input.acquisitionCostRate, 0.09);
  const salesCostRate = rate(input.salesCostRate, 0.015);
  const targetIrr = rate(input.targetReturn, 0.08);
  const baseIndexationScenario = input.selectedIndexationScenario ?? rate(input.exitValueGrowthRate, 0.02);

  const core = calculateLifetimeResidentialRightCore({
    calculationDate,
    marketValue,
    livingAreaSqm,
    internalRentProxyPerSqmPerMonth: monthlyRentPerSqm,
    garageCount,
    garageRentPerMonth: garageRentMonthly,
    propertyType: input.propertyType ?? "house",
    energyEfficiencyClass: input.energyClass,
    acquisitionCostRate,
    salesCommissionRate: salesCostRate,
    targetIrr,
    baseIndexationScenario,
    terminalAge: 100,
    disposalPeriodYears: 1,
    primaryOccupantDateOfBirth: input.primaryDateOfBirth,
    primaryOccupantGender: input.primaryGender ?? input.customerGender,
    primaryOccupantAge: input.customerAge,
    secondOccupantDateOfBirth: input.secondDateOfBirth,
    secondOccupantGender: input.secondGender ?? input.spouseGender,
    secondOccupantAge: input.spouseAge
  });

  const components: Record<string, number> = {
    lifetimeRightValue: core.lifetimeRightValue,
    residentialRightValue: core.lifetimeRightValue,
    maintenanceReserve: core.maintenanceReserve,
    maintenanceCost: core.maintenanceReserve,
    targetIrrAdjustment: core.targetIrrAdjustment,
    riskDiscount: core.targetIrrAdjustment,
    transactionCosts: core.transactionCosts,
    acquisitionCost: core.transactionCosts,
    totalInvestorCommitment: core.totalInvestorCommitment,
    payoutRatio: precision(core.payoutRatio),
    weightedAnnualIrr: precision(core.weightedIrr),
    weightedIrr: precision(core.weightedIrr),
    expectedSaleYear: precision(core.expectedSaleYear),
    presentValueFutureExitCashFlows: core.presentValueFutureExitCashFlows,
    npvCheck: precision(core.npvCheck),
    relevantLifeExpectancy: core.relevantLifeExpectancy,
    relevantAge: core.relevantAge ?? 0,
    maintenanceRate: core.maintenanceRate,
    targetIrr,
    baseIndexationScenario,
    salesCostRate,
    acquisitionCostRate
  };

  return {
    marketValue,
    adjustedMarketValue: marketValue,
    residentialRightValue: core.lifetimeRightValue,
    riskDiscount: core.targetIrrAdjustment,
    companyMargin: core.maintenanceReserve,
    payoutAmount: core.maximumCustomerPayout,
    payoutRate: core.payoutRatio,
    calculationMode: "RATING_TARGET_RETURN_IRR",
    assumptions: {
      productModel: "fixed_residential_right",
      formula: "maximum_customer_payout = pv_future_exit_cash_flows - transaction_costs - maintenance_reserve",
      note:
        "Lebenslanges Wohnrecht. Berechnung nach dem Excel-Master Lifetime Cockpit: interner Wohnrechtswert, Sterbetafel-Exit-Engine und Zielrendite werden deterministisch nachgebildet.",
      sourceWorkbook: "Calculation_Investor_Cockpit_eng_fix_term_and_lifetime_model_final.xlsx",
      sourceCells: {
        maximumCustomerPayout: "Lifetime Cockpit!C37",
        payoutRatio: "Lifetime Cockpit!D8",
        weightedIrr: "Lifetime Cockpit!E112",
        expectedSaleYear: "Lifetime Cockpit!E75/M75",
        lifetimeRightValue: "Lifetime Cockpit!C34",
        maintenanceReserve: "Lifetime Cockpit!C35",
        targetIrrAdjustment: "Lifetime Cockpit!C36",
        transactionCosts: "Lifetime Cockpit!C38",
        totalInvestorCommitment: "Lifetime Cockpit!C39"
      },
      inputs: {
        livingAreaSqm,
        monthlyRentPerSqm,
        garageCount,
        garageRentMonthly,
        targetIrr,
        baseIndexationScenario,
        acquisitionCostRate,
        salesCostRate,
        terminalAge: 100,
        disposalPeriodYears: 1,
        calculationDate: calculationDate instanceof Date ? calculationDate.toISOString() : calculationDate,
        mortalityTableVersion: "DE_PERIOD_LIFE_TABLE_2021_2023",
        propertyType: input.propertyType ?? "house",
        energyClass: input.energyClass ?? null,
        relevantLifeExpectancy: core.relevantLifeExpectancy,
        mortalityAge: core.relevantAge ?? null,
        mortalityGender: core.relevantGender ?? null
      },
      components,
      calculationDetails: {
        mortalityWeightedExitRows: core.mortalityWeightedExitRows
      }
    }
  };
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
        "MVP placeholder. Will be replaced by the residential-right Excel calculation for the active product models."
    }
  };
}

function calculateFixedResidentialRightOffer(input: OfferCalculationInput): OfferCalculationResult {
  const marketValue = money(input.valuation.marketValue);
  const durationYears = input.residentialRightYears ?? 10;
  const livingAreaSqm = input.livingAreaSqm ?? 0;
  const monthlyRentPerSqm = input.monthlyRentPerSqm
    ?? (input.residentialMonthlyRent !== undefined && livingAreaSqm > 0 ? input.residentialMonthlyRent / livingAreaSqm : 0);
  const garageCount = input.garageCount ?? 0;
  const garageRentMonthly = input.garageMonthlyRent ?? input.garageRentMonthly ?? 0;
  const interestRate = rate(input.interestRate, 0.032);
  const targetReturn = input.targetReturn === undefined ? undefined : rate(input.targetReturn, 0);
  const acquisitionCostRate = rate(input.acquisitionCostRate, 0.09);
  const salesCostRate = rate(input.salesCostRate, 0.015);
  const core = calculateFixedResidentialRightCore({
    calculationDate: input.calculationDate,
    marketValue,
    livingAreaSqm,
    monthlyRentPerSqm,
    garageCount,
    monthlyGarageRent: garageRentMonthly,
    propertyType: input.propertyType ?? "house",
    energyClass: input.energyClass,
    fixedTermYears: durationYears,
    primaryDateOfBirth: input.primaryDateOfBirth,
    primaryGender: input.primaryGender ?? input.customerGender,
    secondDateOfBirth: input.secondDateOfBirth,
    secondGender: input.secondGender ?? input.spouseGender,
    primaryAge: input.customerAge,
    secondAge: input.spouseAge,
    internalInterestRate: interestRate,
    acquisitionCostRate,
    salesCommissionRate: salesCostRate,
    selectedIndexationScenario: input.selectedIndexationScenario
  });

  const components: Record<string, number> = {
    residentialRightValue: core.residentialRightValue,
    maintenanceCost: core.maintenanceReserve,
    maintenanceReserve: core.maintenanceReserve,
    interestDiscount: core.steeringParameter,
    steeringParameter: core.steeringParameter,
    riskDiscount: core.steeringParameter,
    acquisitionCost: core.transactionCosts,
    transactionCosts: core.transactionCosts,
    salesCostRate,
    totalInvestorCommitment: core.totalInvestorCommitment,
    maintenanceCashflowShare: core.maintenanceCashflowShare,
    payoutRatio: precision(core.payoutRatio),
    weightedAnnualIrr: precision(core.weightedIrr2Percent),
    weightedIrr1Percent: precision(core.weightedIrr1Percent),
    weightedIrr2Percent: precision(core.weightedIrr2Percent),
    weightedIrr3Percent: precision(core.weightedIrr3Percent),
    selectedWeightedIrr: precision(core.selectedWeightedIrr),
    selectedIndexationScenario: core.selectedIndexationScenario,
    relevantAge: core.relevantAge ?? 0,
    relevantLifeExpectancy: core.relevantLifeExpectancy ?? 0
  };

  if (targetReturn !== undefined) {
    components.ratingTargetReturn = precision(targetReturn);
  }

  return {
    marketValue,
    adjustedMarketValue: marketValue,
    residentialRightValue: core.residentialRightValue,
    riskDiscount: core.steeringParameter,
    companyMargin: core.maintenanceReserve,
    payoutAmount: core.payoutAmount,
    assumptions: {
      productModel: "fixed_residential_right",
      formula: "payout = market_value - residential_right_value - maintenance_reserve - steering_parameter",
      note:
        "Wohnrecht. Berechnung nach dem Excel-Master: Wohnrechtswert, Instandhaltung, interne Verzinsung und Auszahlung werden deterministisch berechnet; der sterbequoten-gewichtete IRR wird aus AG-AI als Ergebniskennzahl ausgewiesen.",
      sourceWorkbook: "Calculation_Investor_Cockpit_eng_wohnkapital_final_vers_2026.xlsx",
      sourceCells: {
        marketValue: "Auszahlungstool_Master!P10/C29",
        residentialRightValue: "Auszahlungstool_Master!Q10",
        maintenanceReserve: "Auszahlungstool_Master!R10",
        steeringParameter: "Auszahlungstool_Master!S10",
        payoutAmount: "Auszahlungstool_Master!T10",
        durationYears: "Auszahlungstool_Master!U10/C19",
        mortalityWeightedIrr: "Auszahlungstool_Master!AG:AI/S13:U13"
      },
      inputs: {
        durationYears,
        livingAreaSqm,
        monthlyRentPerSqm,
        garageCount,
        garageRentMonthly,
        interestRate,
        ratingTargetReturn: targetReturn ?? null,
        mortalityAge: core.relevantAge ?? null,
        mortalityGender: core.relevantGender ?? null,
        relevantLifeExpectancy: core.relevantLifeExpectancy ?? null,
        acquisitionCostRate,
        salesCostRate,
        selectedIndexationScenario: core.selectedIndexationScenario,
        propertyType: core.propertyType,
        energyClass: input.energyClass ?? null
      },
      termStatus: core.termStatus,
      termWarning: core.termWarning,
      components
    }
  };
}

function calculateSaleAndLeasebackOffer(input: OfferCalculationInput): OfferCalculationResult {
  const marketValue = money(input.valuation.marketValue);
  if (marketValue <= 0) {
    throw new Error("marketValue must be greater than 0 for Rueckmietverkauf calculation");
  }

  const payoutRate = 0.7;
  const annualRentRate = 0.05;
  const payoutAmount = money(marketValue * payoutRate);
  const annualRent = money(payoutAmount * annualRentRate);
  const monthlyRent = money(annualRent / 12);

  if (payoutAmount <= 0 || annualRent <= 0 || monthlyRent <= 0) {
    throw new Error("Rueckmietverkauf calculation produced invalid non-positive values");
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
        "Demo-Kalkulation: Die Auszahlung betraegt pauschal 70 % des Verkehrswerts. Die jaehrliche Miete betraegt 5 % des Auszahlungsbetrags. Rating-Tool folgt.",
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
