import assert from "node:assert/strict";
import test from "node:test";
import { formatHeatingLabel, getCaseSourceLabel, getHeatingTypeLabel } from "../lib/property-labels.ts";

test("heating labels are rendered in German", () => {
  assert.equal(getHeatingTypeLabel("GAS"), "Gasheizung");
  assert.equal(getHeatingTypeLabel("OIL"), "Ölheizung");
  assert.equal(getHeatingTypeLabel("DISTRICT_HEATING"), "Fernwärme");
  assert.equal(getHeatingTypeLabel("HEAT_PUMP"), "Wärmepumpe");
  assert.equal(getHeatingTypeLabel("ELECTRIC"), "Elektroheizung");
  assert.equal(getHeatingTypeLabel("PELLET"), "Pelletheizung");
  assert.equal(getHeatingTypeLabel("OTHER"), "Sonstige");
});

test("heating summary and case source labels are centralized", () => {
  assert.equal(formatHeatingLabel({
    heatingType: "central",
    heatingEnergySource: "gas",
    heatingYear: 2015
  }), "Zentralheizung · Gas · 2015");
  assert.equal(getCaseSourceLabel("INTERNAL"), "Intern");
  assert.equal(getCaseSourceLabel("PARTNER"), "Partner");
});
