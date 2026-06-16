import assert from "node:assert/strict";
import test from "node:test";
import { parseGermanNumberInput, parseGermanPercentInput } from "../lib/utils/numberParsing.ts";

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
