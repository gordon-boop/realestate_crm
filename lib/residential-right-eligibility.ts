import type { ResidentialRightRecipients } from "./domain.ts";

export type ResidentialRightVariant = "fixed_term" | "lifetime";

type CustomerLike = {
  dateOfBirth?: string | Date | null;
  spouseDateOfBirth?: string | Date | null;
};

type EligibilityOptions = {
  recipients?: ResidentialRightRecipients | string | null;
  residentialRightPerson?: string | null;
};

export type LifetimeResidentialRightEligibility = {
  eligible: boolean;
  eligibleSoon: boolean;
  reason: "eligible" | "eligible_soon" | "too_young" | "missing_birth_date";
  message: string;
  relevantDateOfBirth?: string;
  relevantAge?: number;
  turns75At?: string;
};

function parseDate(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function toDateOnlyIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

export function completedAgeAt(dateOfBirth: string | Date | null | undefined, calculationDate: string | Date = new Date()): number | undefined {
  const birthDate = parseDate(dateOfBirth);
  const at = parseDate(calculationDate);
  if (!birthDate || !at) return undefined;
  let age = at.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayReached = at.getUTCMonth() > birthDate.getUTCMonth()
    || (at.getUTCMonth() === birthDate.getUTCMonth() && at.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayReached) age -= 1;
  return age >= 0 ? age : undefined;
}

function seventyFifthBirthday(dateOfBirth: Date): Date {
  return new Date(Date.UTC(dateOfBirth.getUTCFullYear() + 75, dateOfBirth.getUTCMonth(), dateOfBirth.getUTCDate()));
}

function relevantBirthDates(customer: CustomerLike, options: EligibilityOptions): Date[] {
  const primary = parseDate(customer.dateOfBirth);
  const spouse = parseDate(customer.spouseDateOfBirth);
  if (options.recipients === "both") {
    return [primary, spouse].filter(Boolean) as Date[];
  }
  if (options.residentialRightPerson === "customer_2") {
    return [spouse].filter(Boolean) as Date[];
  }
  return [primary].filter(Boolean) as Date[];
}

export function getLifetimeResidentialRightEligibility(
  customer: CustomerLike,
  calculationDate: string | Date = new Date(),
  options: EligibilityOptions = {}
): LifetimeResidentialRightEligibility {
  const at = parseDate(calculationDate) ?? new Date();
  const dates = relevantBirthDates(customer, options);
  if (!dates.length || (options.recipients === "both" && dates.length < 2)) {
    return {
      eligible: false,
      eligibleSoon: false,
      reason: "missing_birth_date",
      message: "Das lebenslange Wohnrecht ist erst ab 75 Jahren möglich. Bitte erfassen Sie alle relevanten Geburtsdaten."
    };
  }

  const relevantDateOfBirth = dates.reduce((youngest, date) => date > youngest ? date : youngest, dates[0]);
  const relevantAge = completedAgeAt(relevantDateOfBirth, at);
  const turns75At = seventyFifthBirthday(relevantDateOfBirth);

  if (relevantAge !== undefined && relevantAge >= 75) {
    return {
      eligible: true,
      eligibleSoon: false,
      reason: "eligible",
      message: "Das lebenslange Wohnrecht ist für die maßgebliche Person auswählbar.",
      relevantDateOfBirth: toDateOnlyIso(relevantDateOfBirth),
      relevantAge,
      turns75At: toDateOnlyIso(turns75At)
    };
  }

  const reaches75WithinThreeMonths = options.recipients === "both"
    && turns75At > at
    && turns75At <= addMonths(at, 3);
  if (reaches75WithinThreeMonths) {
    return {
      eligible: true,
      eligibleSoon: true,
      reason: "eligible_soon",
      message: "Die jüngere Person erreicht innerhalb von 3 Monaten das Mindestalter von 75 Jahren.",
      relevantDateOfBirth: toDateOnlyIso(relevantDateOfBirth),
      relevantAge,
      turns75At: toDateOnlyIso(turns75At)
    };
  }

  return {
    eligible: false,
    eligibleSoon: false,
    reason: "too_young",
    message: "Das lebenslange Wohnrecht ist erst ab 75 Jahren möglich. Bei zwei Personen ist die jüngere Person maßgeblich.",
    relevantDateOfBirth: toDateOnlyIso(relevantDateOfBirth),
    relevantAge,
    turns75At: toDateOnlyIso(turns75At)
  };
}

export function isEligibleForLifetimeResidentialRight(
  customer: CustomerLike,
  calculationDate: string | Date = new Date(),
  options: EligibilityOptions = {}
): boolean {
  return getLifetimeResidentialRightEligibility(customer, calculationDate, options).eligible;
}

