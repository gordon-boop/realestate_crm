import { handleApiError, json, requireInternalRole } from "@/lib/api";
import { getDbPartners } from "@/lib/persistence";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { buildRegistrationConfirmationUrl } from "@/lib/registration";
import { partnerCreateSchema } from "@/lib/validation";
import { ZodError } from "zod";

function appOrigin(request: Request): string {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

export async function GET(request: Request): Promise<Response> {
  try {
    requireInternalRole("employee", "advisor", "admin", "super_admin");
    const [partners, registrations] = await Promise.all([
      getDbPartners(),
      prisma.brokerRegistration.findMany({ orderBy: { createdAt: "desc" } })
    ]);
    const origin = appOrigin(request);
    const registrationsWithLinks = registrations.map((registration) => ({
      id: registration.id,
      companyName: registration.companyName,
      contactName: registration.contactName,
      email: registration.email,
      phone: registration.phone,
      address: registration.address,
      status: registration.status,
      emailConfirmedAt: registration.emailConfirmedAt,
      partnerId: registration.partnerId,
      userId: registration.userId,
      confirmationUrl: buildRegistrationConfirmationUrl(origin, registration.emailConfirmationToken),
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt
    }));
    const registrationByPartnerId = new Map(registrationsWithLinks.filter((item) => item.partnerId).map((item) => [item.partnerId, item]));
    const partnersWithRegistration = partners.map((partner) => ({
      ...partner,
      registration: registrationByPartnerId.get(partner.id)
    }));
    return json({ partners: partnersWithRegistration, registrations: registrationsWithLinks });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireInternalRole("employee", "admin", "super_admin");
    const input = partnerCreateSchema.parse(await request.json());
    const contactName = `${input.contactFirstName} ${input.contactLastName}`.trim();
    const loginEmail = input.loginEmail || input.email;
    const loginName = input.loginName || contactName;
    const address = [
      [input.street, [input.postalCode, input.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
      input.federalState ? `Bundesland: ${input.federalState}` : "",
      `Region: ${input.region}`,
      input.website ? `Website: ${input.website}` : "",
      input.contactRole ? `Funktion: ${input.contactRole}` : "",
      input.commissionModel ? `Provisionsmodell: ${input.commissionModel}` : "",
      input.note ? `Notiz: ${input.note}` : ""
    ].filter(Boolean).join(" · ");

    const [existingPartner, existingUser] = await Promise.all([
      prisma.partner.findUnique({ where: { email: input.email } }),
      prisma.user.findFirst({ where: { email: { in: [input.email, loginEmail] } } })
    ]);
    if (existingPartner || existingUser) {
      return json({ error: "Diese E-Mail-Adresse wird bereits verwendet." }, { status: 409 });
    }

    const passwordHash = await hashPassword(input.initialPassword || "demo1234");
    const result = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          companyName: input.companyName,
          contactName,
          email: input.email,
          phone: input.phone || input.mobilePhone,
          address: address || undefined,
          status: input.status
        }
      });
      const partnerUser = await tx.user.create({
        data: {
          partnerId: partner.id,
          name: loginName,
          email: loginEmail,
          passwordHash,
          role: "partner"
        }
      });
      await tx.activity.create({
        data: {
          userId: user.id,
          type: "partner_created",
          message: `Partner wurde manuell angelegt: ${input.companyName}.`,
          source: "admin",
          metadataJson: { partnerId: partner.id, partnerUserId: partnerUser.id, region: input.region }
        }
      });
      return { partner, partnerUser };
    });
    return json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return json({ error: err.issues[0]?.message || "Bitte prüfen Sie die Partnerdaten." }, { status: 400 });
    }
    return handleApiError(err);
  }
}
