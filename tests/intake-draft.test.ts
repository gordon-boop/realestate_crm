import assert from "node:assert/strict";
import test from "node:test";
import { assertCurrentDraftVersion, draftSummary, hasMeaningfulDraftData, intakeDraftRequestSchema } from "../lib/intake-draft.ts";

test("unvollständige Entwürfe erhalten sichere technische Platzhalter", () => {
  const summary = draftSummary({ firstName: "Renate", city: "Tübingen", livingAreaSqm: "142" });
  assert.equal(summary.firstName, "Renate");
  assert.equal(summary.lastName, "Neukunde");
  assert.equal(summary.city, "Tübingen");
  assert.equal(summary.livingAreaSqm, 142);
  assert.equal(summary.desiredModel, "other");
});

test("Draft-Request erlaubt fehlende fachliche Pflichtfelder", () => {
  const result = intakeDraftRequestSchema.parse({ draft: { email: "" }, currentStep: 4 });
  assert.equal(result.currentStep, 4);
  assert.deepEqual(result.draft, { email: "" });
});

test("Autosave erkennt sinnvolle Eingaben, aber keine leere Upload-Struktur", () => {
  assert.equal(hasMeaningfulDraftData({ documentUploads: {}, existingDocumentCategories: [] }), false);
  assert.equal(hasMeaningfulDraftData({ firstName: "Eva" }), true);
});

test("Optimistic Locking akzeptiert nur den aktuellen updatedAt-Stand", () => {
  const current = new Date("2026-07-20T12:00:00.000Z");
  assert.doesNotThrow(() => assertCurrentDraftVersion(current, "2026-07-20T12:00:00.000Z"));
  assert.throws(
    () => assertCurrentDraftVersion(current, "2026-07-20T11:59:59.000Z"),
    /zwischenzeitlich geändert/
  );
});
