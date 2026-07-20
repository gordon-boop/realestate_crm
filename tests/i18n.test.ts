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
    for (const name of ["common", "navigation", "dashboard", "leads"]) {
      const values = leafValues(catalog(locale, name));
      assert.ok(values.length > 0);
      for (const value of values) {
        assert.doesNotMatch(value, /^(?:common|navigation|dashboard|leads)\.[a-zA-Z0-9_.-]+$/);
      }
    }
  }
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
