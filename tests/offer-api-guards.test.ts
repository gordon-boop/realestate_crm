import assert from "node:assert/strict";
import test from "node:test";

function canCalculateBindingOffer(property: { expertOpinionReceivedAt?: string }, expertOpinionValue?: number): void {
  if (!property.expertOpinionReceivedAt) throw new Error("Gutachteneingang required before binding offer calculation");
  if (!expertOpinionValue) throw new Error("Gutachtenwert required before binding offer calculation");
}

test("binding offer calculation requires expert opinion receipt and value", () => {
  assert.throws(() => canCalculateBindingOffer({}, 520000), /Gutachteneingang required/);
  assert.throws(() => canCalculateBindingOffer({ expertOpinionReceivedAt: "2026-05-28" }), /Gutachtenwert required/);
  assert.doesNotThrow(() => canCalculateBindingOffer({ expertOpinionReceivedAt: "2026-05-28" }, 520000));
});
