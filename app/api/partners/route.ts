import { handleApiError, json, requireInternalRole } from "@/lib/api";
import { getDbPartners } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { buildRegistrationConfirmationUrl } from "@/lib/registration";

function appOrigin(request: Request): string {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

export async function GET(request: Request): Promise<Response> {
  try {
    requireInternalRole("admin", "super_admin");
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
    requireInternalRole("admin", "super_admin");
    const body = await request.json();
    const partner = await prisma.partner.create({
      data: {
        companyName: String(body.companyName ?? ""),
        contactName: String(body.contactName ?? ""),
        email: String(body.email ?? ""),
        phone: body.phone ? String(body.phone) : undefined,
        address: body.address ? String(body.address) : undefined,
        status: "active"
      }
    });
    return json({ partner }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
