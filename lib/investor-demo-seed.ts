export const INVESTOR_DEMO_ABORT_MESSAGE =
  "Abbruch: Investor-Demo-Seed darf nur in der englischen Investor-Umgebung ausgeführt werden.";

export const INVESTOR_DEMO_REQUIRED_USERS = [
  "admin@demo.local",
  "mitarbeiter@demo.local",
  "berater@demo.local",
  "makler@demo.local"
] as const;

export const INVESTOR_DEMO_IDS = {
  leads: ["investor_demo_lead_001", "investor_demo_lead_002"],
  leadNumbers: ["INV-DEMO-LEAD-001", "INV-DEMO-LEAD-002"],
  customers: Array.from({ length: 6 }, (_, index) => `investor_demo_customer_${String(index + 3).padStart(3, "0")}`),
  properties: Array.from({ length: 6 }, (_, index) => `investor_demo_property_${String(index + 3).padStart(3, "0")}`),
  caseNumbers: Array.from({ length: 6 }, (_, index) => `INV-DEMO-CASE-${String(index + 3).padStart(3, "0")}`),
  offers: [
    "investor_demo_offer_005_indicative",
    "investor_demo_offer_006_indicative",
    "investor_demo_offer_007_indicative",
    "investor_demo_offer_007_binding",
    "investor_demo_offer_008_indicative",
    "investor_demo_offer_008_binding"
  ],
  offerNumbers: [
    "INV-DEMO-OFFER-005-UVA",
    "INV-DEMO-OFFER-006-UVA",
    "INV-DEMO-OFFER-007-UVA",
    "INV-DEMO-OFFER-007-VA",
    "INV-DEMO-OFFER-008-UVA",
    "INV-DEMO-OFFER-008-VA"
  ]
} as const;

export type InvestorDemoEnvironment = Pick<NodeJS.ProcessEnv, "APP_ENV" | "DATABASE_URL" | "ALLOW_INVESTOR_DEMO_SEED">;

export function isInvestorDemoEnvironmentAllowed(environment: InvestorDemoEnvironment): boolean {
  return environment.APP_ENV === "english"
    && environment.DATABASE_URL?.includes("wohnkapital_english") === true
    && environment.ALLOW_INVESTOR_DEMO_SEED === "true";
}

export function assertInvestorDemoEnvironment(environment: InvestorDemoEnvironment = {
  APP_ENV: process.env.APP_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  ALLOW_INVESTOR_DEMO_SEED: process.env.ALLOW_INVESTOR_DEMO_SEED
}): void {
  if (!isInvestorDemoEnvironmentAllowed(environment)) {
    throw new Error(INVESTOR_DEMO_ABORT_MESSAGE);
  }
}

export function investorDemoExpectedCounts() {
  return {
    leads: INVESTOR_DEMO_IDS.leads.length,
    customers: INVESTOR_DEMO_IDS.customers.length,
    properties: INVESTOR_DEMO_IDS.properties.length,
    offers: INVESTOR_DEMO_IDS.offers.length
  };
}
