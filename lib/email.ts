export type EmailDraft = {
  to: string;
  subject: string;
  html: string;
};

export type EmailDeliveryResult = {
  provider: "stub" | "sendgrid";
  messageId: string;
  email: EmailDraft;
};

async function sendTransactionalEmail(email: EmailDraft, fallbackPrefix: string): Promise<EmailDeliveryResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (apiKey && from) {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: email.to }] }],
        from: { email: from, name: process.env.EMAIL_FROM_NAME || "WohnKapital" },
        subject: email.subject,
        content: [{ type: "text/html", value: email.html }]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid delivery failed with status ${response.status}`);
    }

    return {
      provider: "sendgrid",
      messageId: response.headers.get("x-message-id") || `sendgrid_${Date.now()}`,
      email
    };
  }

  return {
    provider: "stub",
    messageId: `${fallbackPrefix}_${Date.now()}`,
    email
  };
}

export async function sendOfferEmailStub(email: EmailDraft): Promise<EmailDeliveryResult> {
  return sendTransactionalEmail(email, "stub");
}

export async function sendRegistrationConfirmationEmailStub(email: EmailDraft): Promise<EmailDeliveryResult> {
  return sendTransactionalEmail(email, "registration_stub");
}

export async function sendCaseNotificationEmailStub(email: EmailDraft): Promise<EmailDeliveryResult> {
  return sendTransactionalEmail(email, "case_notification_stub");
}
