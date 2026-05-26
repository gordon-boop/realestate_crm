import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { error, handleApiError } from "@/lib/api";
import { sendRegistrationConfirmationEmailStub } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { buildRegistrationConfirmationUrl, validatePartnerRegistrationInput } from "@/lib/registration";

function appOrigin(request: Request): string {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const input = validatePartnerRegistrationInput(body);

    const existingRegistration = await prisma.brokerRegistration.findUnique({
      where: { email: input.email }
    });
    if (existingRegistration && existingRegistration.status !== "email_pending") {
      return error("Diese Registrierung wurde bereits bestätigt und wartet auf Freischaltung.", 409);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser && !existingRegistration) {
      return error("Für diese E-Mail-Adresse existiert bereits ein Zugang.", 409);
    }

    const existingPartner = await prisma.partner.findUnique({ where: { email: input.email } });
    if (existingPartner && !existingRegistration) {
      return error("Für diese E-Mail-Adresse existiert bereits ein Partnerprofil.", 409);
    }

    const token = randomBytes(32).toString("hex");
    const registration = await prisma.$transaction(async (tx) => {
      const partner = existingRegistration?.partnerId
        ? await tx.partner.update({
            where: { id: existingRegistration.partnerId },
            data: {
              companyName: input.companyName,
              contactName: input.contactName,
              phone: input.phone,
              address: input.address,
              status: "inactive"
            }
          })
        : await tx.partner.create({
            data: {
              companyName: input.companyName,
              contactName: input.contactName,
              email: input.email,
              phone: input.phone,
              address: input.address,
              status: "inactive"
            }
          });

      const user = existingRegistration?.userId
        ? await tx.user.update({
            where: { id: existingRegistration.userId },
            data: {
              partnerId: partner.id,
              name: input.contactName,
              passwordHash: input.password
            }
          })
        : await tx.user.create({
            data: {
              partnerId: partner.id,
              name: input.contactName,
              email: input.email,
              passwordHash: input.password,
              role: "partner"
            }
          });

      return existingRegistration
        ? tx.brokerRegistration.update({
            where: { id: existingRegistration.id },
            data: {
              companyName: input.companyName,
              contactName: input.contactName,
              phone: input.phone,
              address: input.address,
              passwordHash: input.password,
              emailConfirmationToken: token,
              status: "email_pending",
              partnerId: partner.id,
              userId: user.id
            }
          })
        : tx.brokerRegistration.create({
            data: {
              companyName: input.companyName,
              contactName: input.contactName,
              email: input.email,
              phone: input.phone,
              address: input.address,
              passwordHash: input.password,
              emailConfirmationToken: token,
              partnerId: partner.id,
              userId: user.id
            }
          });
    });

    const confirmationUrl = buildRegistrationConfirmationUrl(appOrigin(request), token);
    const emailDraft = {
      to: input.email,
      subject: "WohnKapital Maklerportal: E-Mail-Adresse bestätigen",
      html: `<p>Bitte bestätigen Sie Ihre E-Mail-Adresse für das WohnKapital Maklerportal.</p><p><a href="${confirmationUrl}">E-Mail-Adresse bestätigen</a></p>`
    };
    const emailDelivery = await sendRegistrationConfirmationEmailStub(emailDraft);

    return NextResponse.json(
      {
        registration: {
          id: registration.id,
          email: registration.email,
          status: registration.status,
          partnerId: registration.partnerId,
          userId: registration.userId
        },
        message: "Registrierung angelegt. Bitte bestätigen Sie Ihre E-Mail-Adresse.",
        emailDeliveryProvider: emailDelivery.provider,
        emailPreview:
          emailDelivery.provider === "stub"
            ? {
                to: emailDraft.to,
                subject: emailDraft.subject,
                confirmationUrl
              }
            : undefined
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
