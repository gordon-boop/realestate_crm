import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { normalizeLocale } from "../i18n/config.ts";

function catalog(locale: "de" | "en", name: string): Record<string, any> {
  return JSON.parse(readFileSync(new URL(`../messages/${locale}/${name}.json`, import.meta.url), "utf8"));
}

function leafValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(leafValues);
}

test("de-DE exposes the German navigation", () => {
  const navigation = catalog("de", "navigation");
  assert.equal(navigation.drafts, "Entwürfe");
  assert.equal(navigation.portfolio, "Bestand");
  assert.equal(navigation.quickActions, "Schnellfunktionen");
});

test("en-GB exposes the English navigation without offer abbreviations", () => {
  const navigation = catalog("en", "navigation");
  const statuses = catalog("en", "common").status;
  assert.equal(navigation.drafts, "Drafts");
  assert.equal(navigation.portfolio, "Portfolio");
  assert.equal(statuses.OFFER_ACCEPTED, "Indicative Offer accepted");
  assert.equal(statuses.BINDING_OFFER_ACCEPTED, "Binding Offer accepted");
  assert.doesNotMatch(leafValues(statuses).join(" "), /\b(?:UVA|VA)\b/);
});

test("catalogs contain display text and no raw translation keys", () => {
  for (const locale of ["de", "en"] as const) {
    for (const name of ["common", "navigation", "dashboard", "leads", "customers", "precheck", "rating"]) {
      const values = leafValues(catalog(locale, name));
      assert.ok(values.length > 0);
      for (const value of values) {
        assert.doesNotMatch(value, /^(?:common|navigation|dashboard|leads)\.[a-zA-Z0-9_.-]+$/);
      }
    }
  }
});

test("lead management and customer intake expose the agreed English terminology", () => {
  const leads = catalog("en", "leads");
  const customers = catalog("en", "customers").intake;
  assert.equal(leads.create, "Create Lead");
  assert.equal(leads.sources.website, "Direct Enquiry");
  assert.equal(customers.model.fixedTerm, "Fixed-Term Model");
  assert.equal(customers.model.lifetime, "Lifetime Model");
  assert.equal(customers.model.rentBackSale, "Sale and Rent-Back");
  assert.equal(customers.unsaved.title, "Unsaved Changes");
  assert.doesNotMatch(leafValues({leads, customers}).join(" "), /Sale-and-Leaseback|\bUVA\b|\bVA\b/);
});

test("customer intake covers both the prototype flow and the standalone partner form", () => {
  const german = catalog("de", "customers").intake;
  const english = catalog("en", "customers").intake;
  const standaloneForm = readFileSync(new URL("../components/NewCaseForm.tsx", import.meta.url), "utf8");
  const standalonePage = readFileSync(new URL("../app/partner/cases/new/page.tsx", import.meta.url), "utf8");

  assert.equal(english.standalone.pageTitle, "New Case");
  assert.equal(english.standalone.createCase, "Create Case");
  assert.equal(english.standalone.additionalDetailsDocuments, "Additional Details and Documents");
  assert.equal(german.standalone.pageTitle, "Neuer Fall");
  assert.deepEqual(Object.keys(english.standalone).sort(), Object.keys(german.standalone).sort());
  assert.match(standaloneForm, /useTranslations\("customers\.intake"\)/);
  assert.match(standalonePage, /getTranslations\("customers\.intake"\)/);
  assert.doesNotMatch(standaloneForm, />\s*(?:Bitte|Kunde|Immobilie|Dokumente|Wunschmodell|Zurück|Weiter|Einreichen)[^<{]*</);
});

test("customer intake catalog contains the required property, document and validation copy", () => {
  const customers = catalog("en", "customers").intake;
  assert.equal(customers.personal.spouse, "Spouse / Second Eligible Occupant");
  assert.equal(customers.property.energyCertificate, "Energy Performance Certificate");
  assert.equal(customers.modernisations.barrierFree, "Barrier-Free");
  assert.equal(customers.documents.categories.land_register, "Land Register Extract");
  assert.equal(customers.validation.submitBlocked, "Submission is not yet possible. Please complete the following information:");
  assert.equal(customers.messages.customerCreateFailed, "The customer could not be created.");
  assert.equal(customers.messages.propertyCreateFailed, "The property could not be created.");
  assert.equal(customers.saveStatus.conflict, "Draft Conflict");
  assert.equal(customers.conflict.loadLatest, "Load Latest Version");
});

test("lead and intake components use shared translation namespaces", () => {
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");
  assert.match(prototype, /useTranslations\('leads'\)/);
  assert.match(prototype, /useTranslations\('customers\.intake'\)/);
  assert.match(prototype, /t\('unsaved\.title'\)/);
  assert.match(prototype, /t\('model\.rentBackSale'\)/);
});

test("case detail receives its translated back label from the app scope", () => {
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");
  assert.match(prototype, /const FallDetail = \(\{[^}]*backLabel/);
  assert.match(prototype, /<ArrowLeft size=\{15\} \/> \{backLabel\}/);
  assert.match(prototype, /backLabel=\{tButtons\('back'\)\}/);
});

test("case detail uses the shared bilingual case-view catalog", () => {
  const german = catalog("de", "customers").caseView;
  const english = catalog("en", "customers").caseView;
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");

  assert.deepEqual(Object.keys(english).sort(), Object.keys(german).sort());
  assert.equal(english.stepper.title, "Acquisition Process");
  assert.equal(english.tabs.indicativeOffer, "Indicative Offer");
  assert.equal(english.sections.personal, "Personal Details");
  assert.equal(english.activity.title, "Activity Log");
  assert.doesNotMatch(leafValues(english).join(" "), /\b(?:UVA|VA)\b/);
  assert.match(prototype, /useTranslations\('customers\.caseView'\)/);
});

test("acquisition pre-check catalogs are complete and use the agreed terminology", () => {
  const german = catalog("de", "precheck");
  const english = catalog("en", "precheck");
  assert.deepEqual(Object.keys(english).sort(), Object.keys(german).sort());
  assert.equal(english.eligibilityTitle, "Acquisition Eligibility / Pre-Check");
  assert.equal(english.criteria.market_value.preliminaryLabel, "Preliminary Market Value");
  assert.equal(english.criteria.land_value.label, "Standard Land Value");
  assert.equal(english.results.not_acquirable, "Not Eligible for Acquisition");
  assert.equal(english.actions.save, "Save Pre-Check");
});

test("property rating catalogs cover every configured category and criterion id", () => {
  const german = catalog("de", "rating");
  const english = catalog("en", "rating");
  const prototype = readFileSync(new URL("../components/prototype/FrontendPrototype.tsx", import.meta.url), "utf8");
  assert.deepEqual(Object.keys(english).sort(), Object.keys(german).sort());
  assert.deepEqual(Object.keys(english.criteria).sort(), Object.keys(german.criteria).sort());
  assert.equal(Object.keys(english.criteria).length, 23);
  assert.equal(english.categories.economics, "Economic Factors");
  assert.equal(english.categories.microlocation, "Micro-Location");
  assert.equal(english.categories.maintenance, "Maintenance Requirements");
  assert.equal(english.categories.property, "Property");
  assert.equal(english.categories.energy, "Energy Performance");
  assert.equal(english.criteria.publicTransport.scores[1], "Very Poor");
  assert.equal(english.criteria.publicTransport.scores[6], "Excellent");
  assert.equal(english.messages.reasonRequired, "A reason is required because an automatically generated value has been overridden.");
  assert.match(prototype, /useTranslations\('precheck'\)/);
  assert.match(prototype, /useTranslations\('rating'\)/);
  assert.match(prototype, /objectRatingCriterionTranslationKeys/);
  assert.match(prototype, /criterion\?\.category\?\.id === 'rating_cat_microlocation_v1'/);
});

test("locale aliases normalise to the supported locales", () => {
  assert.equal(normalizeLocale("de-DE"), "de-DE");
  assert.equal(normalizeLocale("en"), "en-GB");
  assert.equal(normalizeLocale("en-GB"), "en-GB");
  assert.equal(normalizeLocale("fr-FR"), "de-DE");
});

test("British locale formats dates and EUR values correctly", () => {
  const date = new Date(Date.UTC(2026, 4, 25, 12));
  assert.equal(new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(date), "25/05/2026");
  const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(1234.5);
  assert.match(currency, /€1,234\.50/);
});
