export type EmailDraft = {
  to: string;
  subject: string;
  html: string;
};

export async function sendOfferEmailStub(email: EmailDraft): Promise<{ provider: "stub"; messageId: string; email: EmailDraft }> {
  return {
    provider: "stub",
    messageId: `stub_${Date.now()}`,
    email
  };
}

export async function sendRegistrationConfirmationEmailStub(email: EmailDraft): Promise<{ provider: "stub"; messageId: string; email: EmailDraft }> {
  return {
    provider: "stub",
    messageId: `registration_stub_${Date.now()}`,
    email
  };
}
