import test from "node:test";
import assert from "node:assert/strict";
import { buildRegistrationConfirmationUrl, normalizeEmail, validatePartnerRegistrationInput } from "../lib/registration.ts";

test("normalizes registration email addresses", () => {
  assert.equal(normalizeEmail("  Makler@Beispiel.DE "), "makler@beispiel.de");
});

test("validates a complete broker registration", () => {
  const input = validatePartnerRegistrationInput({
    companyName: "Muster Immobilien",
    contactName: "Max Muster",
    email: "max@muster.de",
    password: "demo1234",
    consentAccepted: true
  });

  assert.equal(input.companyName, "Muster Immobilien");
  assert.equal(input.email, "max@muster.de");
});

test("rejects registration without consent", () => {
  assert.throws(
    () => validatePartnerRegistrationInput({
      companyName: "Muster Immobilien",
      contactName: "Max Muster",
      email: "max@muster.de",
      password: "demo1234",
      consentAccepted: false
    }),
    /Datenschutz/
  );
});

test("builds encoded registration confirmation url", () => {
  assert.equal(
    buildRegistrationConfirmationUrl("https://app.wohn-kapital.de/", "abc 123"),
    "https://app.wohn-kapital.de/register/confirm?token=abc%20123"
  );
});
