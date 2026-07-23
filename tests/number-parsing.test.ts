import assert from "node:assert/strict";
import test from "node:test";
import {
  formatLocaleCurrency,
  formatLocaleNumber,
  formatLocalePercent,
  parseGermanNumberInput,
  parseGermanPercentInput,
  parseLocaleCurrencyInput,
  parseLocaleNumberInput,
  parseLocalePercentInput,
} from "../lib/utils/numberParsing.ts";

test("parseLocaleNumberInput keeps German and British separators unambiguous", () => {
  assert.equal(parseLocaleNumberInput("400.000", "de-DE"), 400000);
  assert.equal(parseLocaleNumberInput("400.000,50", "de-DE"), 400000.5);
  assert.equal(parseLocaleNumberInput("400,000", "de-DE"), 400);
  assert.equal(parseLocaleNumberInput("9,50", "de-DE"), 9.5);
  assert.equal(parseLocaleNumberInput("1.234,56", "de-DE"), 1234.56);

  assert.equal(parseLocaleNumberInput("400,000", "en-GB"), 400000);
  assert.equal(parseLocaleNumberInput("400,000.50", "en-GB"), 400000.5);
  assert.equal(parseLocaleNumberInput("400.000", "en-GB"), 400);
  assert.equal(parseLocaleNumberInput("9.50", "en-GB"), 9.5);
  assert.equal(parseLocaleNumberInput("1,234.56", "en-GB"), 1234.56);
  assert.equal(parseLocaleNumberInput("1,23,456", "en-GB"), null);
});

test("locale-aware currency and percent parsers produce numeric API values", () => {
  assert.equal(parseLocaleCurrencyInput("€400,000", "en-GB"), 400000);
  assert.equal(parseLocaleCurrencyInput("400,000 €", "en-GB"), 400000);
  assert.equal(parseLocaleCurrencyInput("€ 400.000", "de-DE"), 400000);
  assert.equal(parseLocaleCurrencyInput("400.000 €", "de-DE"), 400000);
  assert.equal(parseLocalePercentInput("8%", "en-GB"), 0.08);
  assert.equal(parseLocalePercentInput("3.2%", "en-GB"), 0.032);
  assert.equal(parseLocalePercentInput("3,2%", "de-DE"), 0.032);
  assert.equal(parseLocalePercentInput("0.032", "en-GB"), 0.032);
  assert.equal(parseLocalePercentInput("0,032", "de-DE"), 0.032);
});

test("locale-aware formatters use the active separators", () => {
  assert.equal(formatLocaleNumber(9.5, "de-DE"), "9,50");
  assert.equal(formatLocaleNumber(9.5, "en-GB"), "9.50");
  assert.match(formatLocaleCurrency(400000, "de-DE"), /400\.000/);
  assert.equal(formatLocaleCurrency(400000, "en-GB"), "€400,000");
  assert.equal(formatLocalePercent(0.08, "de-DE"), "8,00 %");
  assert.equal(formatLocalePercent(0.08, "en-GB"), "8.00%");
});

test("parseGermanNumberInput parses German currency and number formats", () => {
  assert.equal(parseGermanNumberInput("500.000"), 500000);
  assert.equal(parseGermanNumberInput("500.000,00"), 500000);
  assert.equal(parseGermanNumberInput("500000"), 500000);
  assert.equal(parseGermanNumberInput("1.000.000"), 1000000);
  assert.equal(parseGermanNumberInput("250.000"), 250000);
  assert.equal(parseGermanNumberInput("249.999"), 249999);
  assert.equal(parseGermanNumberInput("500,50"), 500.50);
  assert.equal(parseGermanNumberInput("9,50"), 9.5);
  assert.equal(parseGermanNumberInput("9.50"), 9.5);
  assert.equal(parseGermanNumberInput("1.234,56"), 1234.56);
  assert.equal(parseGermanNumberInput("1 234,56"), 1234.56);
  assert.equal(parseGermanNumberInput("€ 500.000"), 500000);
  assert.equal(parseGermanNumberInput("500.000 €"), 500000);
});

test("parseGermanNumberInput returns null for empty or invalid values", () => {
  assert.equal(parseGermanNumberInput(""), null);
  assert.equal(parseGermanNumberInput("abc"), null);
  assert.equal(parseGermanNumberInput("1.2.3"), null);
});

test("parseGermanPercentInput normalizes percentages to decimal rates", () => {
  assert.equal(parseGermanPercentInput("8%"), 0.08);
  assert.equal(parseGermanPercentInput("8"), 0.08);
  assert.equal(parseGermanPercentInput("3,2%"), 0.032);
  assert.equal(parseGermanPercentInput("0,032"), 0.032);
});
