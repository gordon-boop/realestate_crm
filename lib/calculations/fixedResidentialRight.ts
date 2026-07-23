import type { Gender, PropertyType } from "../domain.ts";
import { getLifeExpectancy, getMortalityRate, type MortalityGender } from "./mortalityTableGermany2021_2023.ts";

export type FixedResidentialRightIndexationScenario = 0.01 | 0.02 | 0.03;

export type FixedResidentialRightInput = {
  calculationDate?: Date | string;
  marketValue: number;
  livingAreaSqm: number;
  monthlyRentPerSqm: number;
  garageCount?: number;
  monthlyGarageRent?: number;
  propertyType: PropertyType | "HOUSE" | "APARTMENT";
  energyClass?: string;
  fixedTermYears: number;
  primaryDateOfBirth?: Date | string;
  primaryGender?: Gender | MortalityGender;
  secondDateOfBirth?: Date | string;
  secondGender?: Gender | MortalityGender;
  primaryAge?: number;
  secondAge?: number;
  internalInterestRate: number;
  targetReturn?: number;
  acquisitionCostRate: number;
  salesCommissionRate: number;
  selectedIndexationScenario?: FixedResidentialRightIndexationScenario;
};

export type WeightedIrrScenarioResult = {
  indexationRate: FixedResidentialRightIndexationScenario;
  yearlyIrrs: number[];
  weightedIrr: number;
};

export type FixedResidentialRightResult = {
  marketValue: number;
  livingAreaSqm: number;
  monthlyRentPerSqm: number;
  garageCount: number;
  monthlyGarageRent: number;
  propertyType: "HOUSE" | "APARTMENT";
  energyClass?: string;
  fixedTermYears: number;
  residentialRightValue: number;
  maintenanceReserve: number;
  steeringParameter: number;
  payoutAmount: number;
  payoutRatio: number;
  transactionCosts: number;
  totalInvestorCommitment: number;
  maintenanceCashflowShare: number;
  relevantAge?: number;
  relevantGender?: MortalityGender;
  relevantLifeExpectancy?: number;
  termStatus: "OK" | "TERM_EXCEEDS_LIFE_EXPECTANCY";
  termWarning?: string;
  mortalityWeights: number[];
  weightedIrr1Percent: number;
  weightedIrr2Percent: number;
  weightedIrr3Percent: number;
  selectedIndexationScenario: FixedResidentialRightIndexationScenario;
  selectedWeightedIrr: number;
  scenarios: Record<"1" | "2" | "3", WeightedIrrScenarioResult>;
};

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const indexationScenarios: FixedResidentialRightIndexationScenario[] = [0.01, 0.02, 0.03];

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeRate(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  if (value > 1 && value <= 100) return value / 100;
  if (value < 0 || value > 1) return fallback;
  return value;
}

function normalizeDate(value?: Date | string): Date {
  if (!value) return new Date();
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }

  const trimmed = String(value).trim();
  const germanDate = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (germanDate) {
    const [, day, month, year] = germanDate;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }

  return new Date();
}

function completedAge(dateOfBirth: Date | string | undefined, calculationDate: Date): number | undefined {
  if (!dateOfBirth) return undefined;
  const birthDate = normalizeDate(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return undefined;

  let age = calculationDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayReached = calculationDate.getUTCMonth() > birthDate.getUTCMonth()
    || (calculationDate.getUTCMonth() === birthDate.getUTCMonth() && calculationDate.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayReached) age -= 1;
  return age >= 0 ? age : undefined;
}

function normalizeGender(gender: Gender | MortalityGender | undefined): MortalityGender | undefined {
  if (gender === "male" || gender === "female") return gender;
  return undefined;
}

function normalizePropertyType(propertyType: FixedResidentialRightInput["propertyType"]): "HOUSE" | "APARTMENT" {
  const normalized = String(propertyType ?? "").toLowerCase();
  if (normalized === "apartment" || normalized === "etw" || normalized.includes("wohnung")) return "APARTMENT";
  return "HOUSE";
}

function isPoorEnergyClass(energyClass: string | undefined): boolean {
  return ["F", "G", "H"].includes(String(energyClass ?? "").trim().toUpperCase());
}

function maintenanceRatePerSqmYear(propertyType: "HOUSE" | "APARTMENT", energyClass: string | undefined): number {
  const poorEnergyClass = isPoorEnergyClass(energyClass);
  if (propertyType === "APARTMENT") return poorEnergyClass ? 22 : 17;
  return poorEnergyClass ? 15 : 10;
}

function addYears(date: Date, years: number): Date {
  const target = new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate()));
  if (target.getUTCMonth() !== date.getUTCMonth()) {
    return new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth() + 1, 0));
  }
  return target;
}

function yearsBetween(start: Date, end: Date): number {
  return Math.max(1 / 365, (end.getTime() - start.getTime()) / millisecondsPerDay / 365);
}

function annualIrr(initialOutflow: number, exitCashflow: number, start: Date, year: number): number {
  if (initialOutflow <= 0 || exitCashflow <= 0) return 0;
  const end = addYears(start, year);
  return Math.pow(exitCashflow / initialOutflow, 1 / yearsBetween(start, end)) - 1;
}

function buildMortalityCandidate(
  dateOfBirth: Date | string | undefined,
  fallbackAge: number | undefined,
  genderInput: Gender | MortalityGender | undefined,
  calculationDate: Date
) {
  const gender = normalizeGender(genderInput);
  const age = completedAge(dateOfBirth, calculationDate) ?? fallbackAge;
  if (!gender || age === undefined || !Number.isFinite(age) || age < 0) return undefined;

  const normalizedAge = Math.trunc(age);
  return {
    age: normalizedAge,
    gender,
    lifeExpectancy: getLifeExpectancy(normalizedAge, gender)
  };
}

function selectMortalityBasis(input: FixedResidentialRightInput, calculationDate: Date) {
  const candidates = [
    buildMortalityCandidate(input.primaryDateOfBirth, input.primaryAge, input.primaryGender, calculationDate),
    buildMortalityCandidate(input.secondDateOfBirth, input.secondAge, input.secondGender, calculationDate)
  ].filter((candidate): candidate is { age: number; gender: MortalityGender; lifeExpectancy: number } => Boolean(candidate));

  if (!candidates.length) return undefined;
  return candidates.reduce((selected, candidate) => candidate.lifeExpectancy > selected.lifeExpectancy ? candidate : selected, candidates[0]);
}

function buildMortalityWeights(age: number | undefined, gender: MortalityGender | undefined, fixedTermYears: number): number[] {
  const durationYears = Math.max(1, Math.trunc(fixedTermYears));
  const weights: number[] = [];

  if (age === undefined || !gender) {
    return Array.from({ length: 15 }, (_, index) => index + 1 === Math.min(durationYears, 15) ? 1 : 0);
  }

  const preFinalDeathProbability = Array.from({ length: Math.max(0, durationYears - 1) }, (_, index) =>
    getMortalityRate(age + index, gender)
  ).reduce((sum, qx) => sum + qx, 0);
  const remainingProbability = Math.max(0, 1 - preFinalDeathProbability);

  for (let year = 1; year <= 15; year += 1) {
    if (year > durationYears) {
      weights.push(0);
    } else if (year === durationYears) {
      weights.push(remainingProbability);
    } else {
      weights.push(getMortalityRate(age + year - 1, gender));
    }
  }

  return weights;
}

function calculateWeightedIrrScenario(
  indexationRate: FixedResidentialRightIndexationScenario,
  marketValue: number,
  initialOutflow: number,
  salesCommissionRate: number,
  mortalityWeights: number[],
  calculationDate: Date
): WeightedIrrScenarioResult {
  const yearlyIrrs = Array.from({ length: 15 }, (_, index) => {
    const year = index + 1;
    const exitValue = marketValue * Math.pow(1 + indexationRate, year);
    const salesCosts = exitValue * salesCommissionRate;
    return annualIrr(initialOutflow, exitValue - salesCosts, calculationDate, year);
  });

  const weightedIrr = yearlyIrrs.reduce((sum, irr, index) => sum + irr * (mortalityWeights[index] ?? 0), 0);
  return { indexationRate, yearlyIrrs, weightedIrr };
}

function payoutForTargetWeightedIrr(
  targetReturn: number,
  maximumPayout: number,
  transactionCosts: number,
  maintenanceCashflowShare: number,
  indexationRate: FixedResidentialRightIndexationScenario,
  marketValue: number,
  salesCommissionRate: number,
  mortalityWeights: number[],
  calculationDate: Date
): number {
  const weightedIrrForPayout = (payout: number) => calculateWeightedIrrScenario(
    indexationRate,
    marketValue,
    Math.max(0.01, payout + transactionCosts + maintenanceCashflowShare),
    salesCommissionRate,
    mortalityWeights,
    calculationDate
  ).weightedIrr;

  const lowerPayout = 0;
  const upperPayout = Math.max(0, maximumPayout);
  if (targetReturn >= weightedIrrForPayout(lowerPayout)) return lowerPayout;
  if (targetReturn <= weightedIrrForPayout(upperPayout)) return upperPayout;

  let low = lowerPayout;
  let high = upperPayout;
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const midpoint = (low + high) / 2;
    if (weightedIrrForPayout(midpoint) > targetReturn) {
      low = midpoint;
    } else {
      high = midpoint;
    }
  }
  return (low + high) / 2;
}

export function calculateFixedResidentialRightOffer(input: FixedResidentialRightInput): FixedResidentialRightResult {
  const calculationDate = normalizeDate(input.calculationDate);
  const marketValue = Math.max(0, input.marketValue);
  const fixedTermYears = Math.max(1, Math.trunc(input.fixedTermYears || 1));
  const livingAreaSqm = Math.max(0, input.livingAreaSqm || 0);
  const monthlyRentPerSqm = Math.max(0, input.monthlyRentPerSqm || 0);
  const garageCount = Math.max(0, Math.trunc(input.garageCount ?? 0));
  const monthlyGarageRent = Math.max(0, input.monthlyGarageRent ?? 0);
  const propertyType = normalizePropertyType(input.propertyType);
  const internalInterestRate = normalizeRate(input.internalInterestRate, 0.032);
  const targetReturn = input.targetReturn === undefined ? undefined : normalizeRate(input.targetReturn, 0);
  const acquisitionCostRate = normalizeRate(input.acquisitionCostRate, 0.09);
  const salesCommissionRate = normalizeRate(input.salesCommissionRate, 0.015);
  const selectedIndexationScenario = input.selectedIndexationScenario && indexationScenarios.includes(input.selectedIndexationScenario)
    ? input.selectedIndexationScenario
    : 0.02;

  const residentialRightValueRaw = monthlyRentPerSqm * livingAreaSqm * 12 * fixedTermYears
    + garageCount * monthlyGarageRent * 12 * fixedTermYears;
  const maintenanceReserveRaw = livingAreaSqm * Math.round(fixedTermYears + 1) * maintenanceRatePerSqmYear(propertyType, input.energyClass);
  const transactionCostsRaw = marketValue * acquisitionCostRate;
  const maintenanceCashflowShareRaw = maintenanceReserveRaw * (propertyType === "HOUSE" ? 0.7 : 1);
  const maximumPayoutBeforeReturn = Math.max(0, marketValue - residentialRightValueRaw - maintenanceReserveRaw);
  const mortalityBasis = selectMortalityBasis(input, calculationDate);
  const mortalityWeights = buildMortalityWeights(mortalityBasis?.age, mortalityBasis?.gender, fixedTermYears);
  const payoutAmountRaw = targetReturn === undefined
    ? maximumPayoutBeforeReturn - maximumPayoutBeforeReturn * (Math.pow(1 + internalInterestRate, fixedTermYears) - 1)
    : payoutForTargetWeightedIrr(
        targetReturn,
        maximumPayoutBeforeReturn,
        transactionCostsRaw,
        maintenanceCashflowShareRaw,
        selectedIndexationScenario,
        marketValue,
        salesCommissionRate,
        mortalityWeights,
        calculationDate
      );
  const steeringParameterRaw = marketValue - residentialRightValueRaw - maintenanceReserveRaw - payoutAmountRaw;
  const totalInvestorCommitmentRaw = payoutAmountRaw + transactionCostsRaw;
  const initialOutflow = payoutAmountRaw + transactionCostsRaw + maintenanceCashflowShareRaw;

  const scenarioResults = indexationScenarios.map((scenario) =>
    calculateWeightedIrrScenario(scenario, marketValue, initialOutflow, salesCommissionRate, mortalityWeights, calculationDate)
  );
  const scenarios = {
    "1": scenarioResults[0],
    "2": scenarioResults[1],
    "3": scenarioResults[2]
  };
  const selectedScenarioKey = selectedIndexationScenario === 0.01 ? "1" : selectedIndexationScenario === 0.03 ? "3" : "2";
  const termExceeded = mortalityBasis ? fixedTermYears > mortalityBasis.lifeExpectancy : false;

  return {
    marketValue: money(marketValue),
    livingAreaSqm,
    monthlyRentPerSqm,
    garageCount,
    monthlyGarageRent,
    propertyType,
    energyClass: input.energyClass,
    fixedTermYears,
    residentialRightValue: money(residentialRightValueRaw),
    maintenanceReserve: money(maintenanceReserveRaw),
    steeringParameter: money(steeringParameterRaw),
    payoutAmount: money(payoutAmountRaw),
    payoutRatio: marketValue > 0 ? payoutAmountRaw / marketValue : 0,
    transactionCosts: money(transactionCostsRaw),
    totalInvestorCommitment: money(totalInvestorCommitmentRaw),
    maintenanceCashflowShare: money(maintenanceCashflowShareRaw),
    relevantAge: mortalityBasis?.age,
    relevantGender: mortalityBasis?.gender,
    relevantLifeExpectancy: mortalityBasis?.lifeExpectancy,
    termStatus: termExceeded ? "TERM_EXCEEDS_LIFE_EXPECTANCY" : "OK",
    termWarning: termExceeded ? "Die gewählte Laufzeit überschreitet die relevante Restlebenserwartung." : undefined,
    mortalityWeights,
    weightedIrr1Percent: scenarios["1"].weightedIrr,
    weightedIrr2Percent: scenarios["2"].weightedIrr,
    weightedIrr3Percent: scenarios["3"].weightedIrr,
    selectedIndexationScenario,
    selectedWeightedIrr: scenarios[selectedScenarioKey].weightedIrr,
    scenarios
  };
}
