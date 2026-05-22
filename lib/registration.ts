export type PartnerRegistrationInput = {
  companyName?: unknown;
  contactName?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  password?: unknown;
  consentAccepted?: unknown;
};

export type ValidPartnerRegistrationInput = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
};

export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function validatePartnerRegistrationInput(input: PartnerRegistrationInput): ValidPartnerRegistrationInput {
  const companyName = String(input.companyName ?? "").trim();
  const contactName = String(input.contactName ?? "").trim();
  const email = normalizeEmail(input.email);
  const phone = String(input.phone ?? "").trim();
  const address = String(input.address ?? "").trim();
  const password = String(input.password ?? "");

  if (!companyName) throw new Error("Firmenname ist erforderlich.");
  if (!contactName) throw new Error("Ansprechpartner ist erforderlich.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Bitte eine gültige E-Mail-Adresse eingeben.");
  if (password.length < 8) throw new Error("Das Passwort muss mindestens 8 Zeichen lang sein.");
  if (input.consentAccepted !== true) throw new Error("Bitte Datenschutz- und Nutzungsbedingungen bestätigen.");

  return {
    companyName,
    contactName,
    email,
    phone: phone || undefined,
    address: address || undefined,
    password
  };
}

export function buildRegistrationConfirmationUrl(origin: string, token: string): string {
  const baseUrl = origin.replace(/\/$/, "");
  return `${baseUrl}/register/confirm?token=${encodeURIComponent(token)}`;
}
