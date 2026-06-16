import type { Gender, PropertyType } from "../domain.ts";
import {
  getLifeExpectancy,
  getMortalityRate,
  type MortalityGender
} from "./mortality/dePeriodLifeTable2021_2023.ts";

export type LifetimeResidentialRightGender = Gender | MortalityGender | "Male" | "Female" | "MALE" | "FEMALE";
export type LifetimeResidentialRightPropertyType = PropertyType | "House" | "Flat" | "HOUSE" | "FLAT" | "APARTMENT";

export type LifetimeResidentialRightInput = {
  calculationDate: Date | string;
  marketValue: number;
  livingAreaSqm: number;
  internalRentProxyPerSqmPerMonth: number;
  garageCount?: number;
  garageRentPerMonth?: number;
  energyEfficiencyClass?: string;
  propertyType: LifetimeResidentialRightPropertyType;
  acquisitionCostRate: number;
  salesCommissionRate: number;
  targetIrr: number;
  baseIndexationScenario: number;
  terminalAge: number;
  disposalPeriodYears: number;
  primaryOccupantDateOfBirth?: Date | string;
  primaryOccupantGender?: LifetimeResidentialRightGender;
  primaryOccupantAge?: number;
  secondOccupantDateOfBirth?: Date | string;
  secondOccupantGender?: LifetimeResidentialRightGender;
  secondOccupantAge?: number;
};

export type MortalityWeightedExitRow = {
  year: number;
  agePrimary: number;
  ageSecond?: number;
  mortalityRatePrimary: number;
  mortalityRateSecond?: number;
  survivalProbabilityStartPrimary: number;
  survivalProbabilityStartSecond?: number;
  occupancyStartProbability: number;
  occupancyEndProbability: number;
  exitProbability: number;
  saleYear: number;
  grossExitValue: number;
  netExitProceeds: number;
  probabilityWeightedCashFlow: number;
  presentValueAtTargetIrr: number;
};

export type LifetimeResidentialRightResult = {
  maximumCustomerPayout: number;
  payoutRatio: number;
  weightedIrr: number;
  expectedSaleYear: number;
  lifetimeRightValue: number;
  maintenanceReserve: number;
  targetIrrAdjustment: number;
  transactionCosts: number;
  totalInvestorCommitment: number;
  npvCheck: number;
  presentValueFutureExitCashFlows: number;
  relevantLifeExpectancy: number;
  relevantAge?: number;
  relevantGender?: MortalityGender;
  maintenanceRate: number;
  mortalityWeightedExitRows: MortalityWeightedExitRow[];
};

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const defaultProjectionYears = 30;

const maintenanceRates: Record<"HOUSE" | "FLAT", Record<string, number>> = {
  FLAT: { A: 12, B: 14, C: 16, D: 17, E: 18, F: 20, G: 22 },
  HOUSE: { A: 8, B: 9, C: 10, D: 12, E: 14, F: 16, G: 18 }
};

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeRate(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  if (value > 1 && value <= 100) return value / 100;
  if (value < 0 || value > 1) return fallback;
  return value;
}

function normalizeDate(value?: Date | string): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  const trimmed = String(value).trim();
  const germanDate = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (germanDate) {
    const [, day, month, year] = germanDate;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function excelAge(dateOfBirth: Date | string | undefined, calculationDate: Date): number | undefined {
  const birthDate = normalizeDate(dateOfBirth);
  if (!birthDate) return undefined;
  const age = Math.floor((calculationDate.getTime() - birthDate.getTime()) / millisecondsPerDay / 365.25);
  return age >= 0 && Number.isFinite(age) ? age : undefined;
}

function normalizeGender(gender: LifetimeResidentialRightGender | undefined): MortalityGender | undefined {
  const value = String(gender ?? "").trim().toLowerCase();
  if (value === "male") return "male";
  if (value === "female") return "female";
  return undefined;
}

function normalizePropertyType(propertyType: LifetimeResidentialRightPropertyType): "HOUSE" | "FLAT" {
  const value = String(propertyType ?? "").trim().toLowerCase();
  if (value === "flat" || value === "apartment" || value === "etw" || value.includes("wohnung")) return "FLAT";
  return "HOUSE";
}

function normalizeEnergyClass(energyClass: string | undefined): string {
  const normalized = String(energyClass ?? "D").trim().toUpperCase().replace(/\+.*/, "");
  if (["A", "B", "C", "D", "E", "F", "G"].includes(normalized)) return normalized;
  if (normalized === "H") return "G";
  return "D";
}

function maintenanceRatePerSqmYear(propertyType: "HOUSE" | "FLAT", energyClass: string | undefined): number {
  return maintenanceRates[propertyType][normalizeEnergyClass(energyClass)] ?? maintenanceRates[propertyType].D;
}

function buildOccupant(
  dateOfBirth: Date | string | undefined,
  fallbackAge: number | undefined,
  genderInput: LifetimeResidentialRightGender | undefined,
  calculationDate: Date
) {
  const gender = normalizeGender(genderInput);
  const age = excelAge(dateOfBirth, calculationDate) ?? fallbackAge;
  if (!gender || age === undefined || !Number.isFinite(age) || age < 0) return undefined;

  const normalizedAge = Math.trunc(age);
  return {
    age: normalizedAge,
    gender,
    remainingLifeExpectancy: getLifeExpectancy(normalizedAge, gender)
  };
}

function solveIrr(cashFlows: number[]): number {
  function npv(rate: number): number {
    return cashFlows.reduce((sum, cashFlow, index) => sum + cashFlow / Math.pow(1 + rate, index), 0);
  }

  let low = -0.99;
  let high = 1;
  let lowValue = npv(low);
  let highValue = npv(high);

  while (lowValue * highValue > 0 && high < 100) {
    high *= 2;
    highValue = npv(high);
  }

  if (lowValue * highValue > 0) return 0;

  for (let iteration = 0; iteration < 120; iteration += 1) {
    const midpoint = (low + high) / 2;
    const midpointValue = npv(midpoint);
    if (Math.abs(midpointValue) < 1e-10) return midpoint;
    if (lowValue * midpointValue <= 0) {
      high = midpoint;
      highValue = midpointValue;
    } else {
      low = midpoint;
      lowValue = midpointValue;
    }
  }

  return (low + high) / 2;
}

export function calculateLifetimeResidentialRightOffer(input: LifetimeResidentialRightInput): LifetimeResidentialRightResult {
  const calculationDate = normalizeDate(input.calculationDate) ?? new Date();
  const marketValue = Math.max(0, input.marketValue || 0);
  const livingAreaSqm = Math.max(0, input.livingAreaSqm || 0);
  const internalRentProxyPerSqmPerMonth = Math.max(0, input.internalRentProxyPerSqmPerMonth || 0);
  const garageCount = Math.max(0, Math.trunc(input.garageCount ?? 0));
  const garageRentPerMonth = Math.max(0, input.garageRentPerMonth ?? 0);
  const acquisitionCostRate = normalizeRate(input.acquisitionCostRate, 0.09);
  const salesCommissionRate = normalizeRate(input.salesCommissionRate, 0.015);
  const targetIrr = normalizeRate(input.targetIrr, 0.08);
  const baseIndexationScenario = normalizeRate(input.baseIndexationScenario, 0.02);
  const terminalAge = Math.max(1, Math.trunc(input.terminalAge || 100));
  const disposalPeriodYears = Math.max(0, input.disposalPeriodYears || 0);
  const propertyType = normalizePropertyType(input.propertyType);
  const maintenanceRate = maintenanceRatePerSqmYear(propertyType, input.energyEfficiencyClass);

  const primary = buildOccupant(
    input.primaryOccupantDateOfBirth,
    input.primaryOccupantAge,
    input.primaryOccupantGender,
    calculationDate
  );
  if (!primary) {
    throw new Error("primary occupant date of birth and gender are required for lifetime residential-right calculation");
  }

  const second = buildOccupant(
    input.secondOccupantDateOfBirth,
    input.secondOccupantAge,
    input.secondOccupantGender,
    calculationDate
  );
  const relevantOccupant = second && second.remainingLifeExpectancy > primary.remainingLifeExpectancy ? second : primary;
  const relevantLifeExpectancy = relevantOccupant.remainingLifeExpectancy;
  const hasSecondOccupant = Boolean(second);
  const projectionYears = Math.max(defaultProjectionYears, terminalAge - primary.age + 1);

  let survivalPrimaryStart = 1;
  let survivalSecondStart = 1;
  let previousPrimaryMortalityRate = 0;
  let previousSecondMortalityRate = 0;
  const rows: MortalityWeightedExitRow[] = [];

  for (let year = 1; year <= projectionYears; year += 1) {
    const agePrimary = primary.age + year - 1;
    const ageSecond = second ? second.age + year - 1 : undefined;

    if (year > 1) {
      survivalPrimaryStart = agePrimary > terminalAge ? 0 : survivalPrimaryStart * (1 - previousPrimaryMortalityRate);
      if (second && ageSecond !== undefined) {
        survivalSecondStart = ageSecond > terminalAge ? 0 : survivalSecondStart * (1 - previousSecondMortalityRate);
      }
    }

    const mortalityRatePrimary = agePrimary > terminalAge ? 0 : getMortalityRate(agePrimary, primary.gender);
    const mortalityRateSecond = second && ageSecond !== undefined && ageSecond <= terminalAge
      ? getMortalityRate(ageSecond, second.gender)
      : undefined;

    const occupancyStartProbability = agePrimary > terminalAge
      ? 0
      : hasSecondOccupant && second
        ? 1 - (1 - survivalPrimaryStart) * (1 - survivalSecondStart)
        : survivalPrimaryStart;
    const occupancyEndProbability = agePrimary >= terminalAge
      ? 0
      : hasSecondOccupant && second
        ? 1 - (1 - survivalPrimaryStart * (1 - mortalityRatePrimary))
          * (1 - survivalSecondStart * (1 - (mortalityRateSecond ?? 0)))
        : survivalPrimaryStart * (1 - mortalityRatePrimary);
    const exitProbability = agePrimary >= terminalAge
      ? occupancyStartProbability
      : Math.max(0, occupancyStartProbability - occupancyEndProbability);
    const saleYear = year + disposalPeriodYears;
    const grossExitValue = marketValue * Math.pow(1 + baseIndexationScenario, saleYear);
    const netExitProceeds = grossExitValue * (1 - salesCommissionRate);
    const probabilityWeightedCashFlow = exitProbability * netExitProceeds;
    const presentValueAtTargetIrr = probabilityWeightedCashFlow / Math.pow(1 + targetIrr, saleYear);

    rows.push({
      year,
      agePrimary,
      ageSecond,
      mortalityRatePrimary,
      mortalityRateSecond,
      survivalProbabilityStartPrimary: survivalPrimaryStart,
      survivalProbabilityStartSecond: second ? survivalSecondStart : undefined,
      occupancyStartProbability,
      occupancyEndProbability,
      exitProbability,
      saleYear,
      grossExitValue,
      netExitProceeds,
      probabilityWeightedCashFlow,
      presentValueAtTargetIrr
    });

    previousPrimaryMortalityRate = mortalityRatePrimary;
    previousSecondMortalityRate = mortalityRateSecond ?? 0;
  }

  const expectedSaleYear = rows.reduce((sum, row) => sum + row.exitProbability * row.saleYear, 0);
  const presentValueFutureExitCashFlows = rows.reduce((sum, row) => sum + row.presentValueAtTargetIrr, 0);
  const annualInternalRentProxy = internalRentProxyPerSqmPerMonth * livingAreaSqm * 12
    + garageCount * garageRentPerMonth * 12;
  const lifetimeRightValueRaw = annualInternalRentProxy * relevantLifeExpectancy;
  const maintenanceReserveRaw = livingAreaSqm * expectedSaleYear * maintenanceRate;
  const transactionCostsRaw = acquisitionCostRate * marketValue;
  const maximumCustomerPayoutRaw = Math.max(0, presentValueFutureExitCashFlows - transactionCostsRaw - maintenanceReserveRaw);
  const targetIrrAdjustmentRaw = marketValue - lifetimeRightValueRaw - maintenanceReserveRaw - maximumCustomerPayoutRaw;
  const totalInvestorCommitmentRaw = maximumCustomerPayoutRaw + transactionCostsRaw + maintenanceReserveRaw;

  const maxCashFlowYear = Math.max(...rows.map((row) => Math.ceil(row.saleYear)), 0);
  const cashFlows = Array.from({ length: maxCashFlowYear + 1 }, () => 0);
  cashFlows[0] = -totalInvestorCommitmentRaw;
  for (const row of rows) {
    cashFlows[Math.trunc(row.saleYear)] += row.probabilityWeightedCashFlow;
  }
  const weightedIrr = solveIrr(cashFlows);
  const npvCheck = rows.reduce((sum, row) => sum + row.probabilityWeightedCashFlow / Math.pow(1 + targetIrr, row.saleYear), 0)
    - totalInvestorCommitmentRaw;

  return {
    maximumCustomerPayout: money(maximumCustomerPayoutRaw),
    payoutRatio: marketValue > 0 ? maximumCustomerPayoutRaw / marketValue : 0,
    weightedIrr,
    expectedSaleYear,
    lifetimeRightValue: money(lifetimeRightValueRaw),
    maintenanceReserve: money(maintenanceReserveRaw),
    targetIrrAdjustment: money(targetIrrAdjustmentRaw),
    transactionCosts: money(transactionCostsRaw),
    totalInvestorCommitment: money(totalInvestorCommitmentRaw),
    npvCheck,
    presentValueFutureExitCashFlows: presentValueFutureExitCashFlows,
    relevantLifeExpectancy,
    relevantAge: relevantOccupant.age,
    relevantGender: relevantOccupant.gender,
    maintenanceRate,
    mortalityWeightedExitRows: rows
  };
}
