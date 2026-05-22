import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { error, handleApiError } from "@/lib/api";
import { sendRegistrationConfirmationEmailStub } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { buildRegistrationConfirmationUrl, validatePartnerRegistrationInput } from "@/lib/registration";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const input = validatePartnerRegistrationInput(body);

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      return error("Für diese E-Mail-Adresse existiert bereits ein Zugang.", 409);
    }

    const existingPartner = await prisma.partner.findUnique({ where: { email: input.email } });
    if (existingPartner) {
      return error("Für diese E-Mail-Adresse existiert bereits ein Partnerprofil.", 409);
    }

    const existingRegistration = await prisma.brokerRegistration.findUnique({ where: { email: input.email } });
    if (existingRegistration && existingRegistration.status !== "email_pending") {
      return error("Diese Registrierung wurde bereits bestätigt und wartet auf Freischaltung.", 409);
    }

    const token = randomBytes(32).toString("hex");
    const registration = existingRegistration
      ? await prisma.brokerRegistration.update({
          where: { id: existingRegistration.id },
          data: {
            companyName: input.companyName,
            contactName: input.contactName,
            phone: input.phone,
            address: input.address,
            passwordHash: input.password,
            emailConfirmationToken: token,
            status: "email_pending"
          }
        })
      : await prisma.brokerRegistration.create({
          data: {
            companyName: input.companyName,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            passwordHash: input.password,
            emailConfirmationToken: token
          }
        });

    const confirmationUrl = buildRegistrationConfirmationUrl(new URL(request.url).origin, token);
    const emailDraft = {
      to: input.email,
      subject: "WohnKapital Maklerportal: E-Mail-Adresse bestätigen",
      html: `<p>Bitte bestätigen Sie Ihre E-Mail-Adresse für das WohnKapital Maklerportal.</p><p><a href="${confirmationUrl}">E-Mail-Adresse bestätigen</a></p>`
    };
    await sendRegistrationConfirmationEmailStub(emailDraft);

    return NextResponse.json(
      {
        registration: {
          id: registration.id,
          email: registration.email,
          status: registration.status
        },
        message: "Registrierung angelegt. Bitte bestätigen Sie Ihre E-Mail-Adresse.",
        emailPreview: {
          to: emailDraft.to,
          subject: emailDraft.subject,
          confirmationUrl
        }
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
