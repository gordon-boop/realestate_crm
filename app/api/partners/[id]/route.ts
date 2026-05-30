import { error, handleApiError, json, requireInternalRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { partnerUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

function stripPrefix(value: string, prefix: string): string {
  return value.slice(prefix.length).trim();
}

function parsePartnerAddress(address?: string | null) {
  const details = {
    rawAddress: address ?? "",
    street: "",
    postalCode: "",
    city: "",
    federalState: "",
    region: "",
    website: "",
    note: "",
    contactRole: "",
    commissionModel: ""
  };
  if (!address) return details;

  const parts = address.split(" · ").map((part) => part.trim()).filter(Boolean);
  const firstAddressPart = parts.find((part) => !part.includes(":"));
  if (firstAddressPart) {
    const [streetPart, cityPart] = firstAddressPart.split(",").map((part) => part.trim());
    details.street = streetPart || "";
    const postalCity = cityPart?.match(/^(\d{5})\s+(.+)$/);
    if (postalCity) {
      details.postalCode = postalCity[1];
      details.city = postalCity[2];
    } else if (cityPart) {
      details.city = cityPart;
    }
  }

  for (const part of parts) {
    if (part.startsWith("Bundesland:")) details.federalState = stripPrefix(part, "Bundesland:");
    if (part.startsWith("Region:")) details.region = stripPrefix(part, "Region:");
    if (part.startsWith("Website:")) details.website = stripPrefix(part, "Website:");
    if (part.startsWith("Funktion:")) details.contactRole = stripPrefix(part, "Funktion:");
    if (part.startsWith("Provisionsmodell:")) details.commissionModel = stripPrefix(part, "Provisionsmodell:");
    if (part.startsWith("Notiz:")) details.note = stripPrefix(part, "Notiz:");
  }

  return details;
}

function buildPartnerAddress(input: {
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  federalState?: string | null;
  region?: string | null;
  website?: string | null;
  contactRole?: string | null;
  commissionModel?: string | null;
  note?: string | null;
}) {
  return [
    [input.street, [input.postalCode, input.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    input.federalState ? `Bundesland: ${input.federalState}` : "",
    input.region ? `Region: ${input.region}` : "",
    input.website ? `Website: ${input.website}` : "",
    input.contactRole ? `Funktion: ${input.contactRole}` : "",
    input.commissionModel ? `Provisionsmodell: ${input.commissionModel}` : "",
    input.note ? `Notiz: ${input.note}` : ""
  ].filter(Boolean).join(" · ");
}

function isDetailUpdate(body: Record<string, unknown>) {
  return [
    "companyName",
    "contactFirstName",
    "contactLastName",
    "email",
    "phone",
    "mobilePhone",
    "region",
    "street",
    "postalCode",
    "city",
    "federalState",
    "website",
    "note",
    "commissionModel",
    "contactRole"
  ].some((key) => Object.prototype.hasOwnProperty.call(body, key));
}

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireInternalRole("employee", "advisor", "admin", "super_admin");
    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!partner) throw new Error("Partner not found");

    const [users, leads, cases] = await Promise.all([
      prisma.user.findMany({
        where: { partnerId: params.id },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          internalRole: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.lead.findMany({
        where: { assignedPartnerId: params.id },
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          id: true,
          leadNumber: true,
          firstName: true,
          lastName: true,
          name: true,
          city: true,
          propertyCity: true,
          status: true,
          updatedAt: true,
          createdAt: true
        }
      }),
      prisma.property.findMany({
        where: { partnerId: params.id },
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          id: true,
          caseNumber: true,
          objectTitle: true,
          street: true,
          postalCode: true,
          city: true,
          status: true,
          lastActivityAt: true,
          updatedAt: true,
          customer: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    return json({
      partner: {
        ...partner,
        details: parsePartnerAddress(partner.address)
      },
      users,
      leads,
      cases
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const body = await request.json();
    const detailsUpdate = isDetailUpdate(body);
    const currentUser = detailsUpdate
      ? requireInternalRole("employee", "admin", "super_admin")
      : requireInternalRole("admin", "super_admin");
    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) throw new Error("Partner not found");

    if (detailsUpdate) {
      const input = partnerUpdateSchema.parse(body);
      const currentInternalRole = currentUser.internalRole ?? "employee";
      if (input.status !== partner.status && !["admin", "super_admin"].includes(currentInternalRole)) {
        return error("Nur Admins oder Super Admins dürfen den Partnerstatus ändern.", 403);
      }
      const [existingPartner, existingUser] = await Promise.all([
        prisma.partner.findFirst({ where: { email: input.email, NOT: { id: params.id } } }),
        prisma.user.findFirst({ where: { email: input.email, NOT: { partnerId: params.id } } })
      ]);
      if (existingPartner || existingUser) {
        return error("Diese E-Mail-Adresse wird bereits verwendet.", 409);
      }
      const nextStatus = input.status;
      if (nextStatus === "active") {
        const registration = await prisma.brokerRegistration.findFirst({ where: { partnerId: params.id } });
        if (registration && registration.status === "email_pending") {
          return error("Der Partner kann erst freigeschaltet werden, wenn die E-Mail-Adresse bestÃƒÂ¤tigt wurde.", 409);
        }
      }
      const contactName = `${input.contactFirstName} ${input.contactLastName}`.trim();
      const updated = await prisma.partner.update({
        where: { id: params.id },
        data: {
          companyName: input.companyName,
          contactName,
          email: input.email,
          phone: input.phone || input.mobilePhone,
          address: buildPartnerAddress(input) || undefined,
          status: nextStatus
        }
      });
      if (nextStatus === "active") {
        await prisma.brokerRegistration.updateMany({
          where: { partnerId: params.id },
          data: { status: "approved" }
        });
      }
      await prisma.activity.create({
        data: {
          userId: currentUser.id,
          type: "partner_updated",
          message: `Partner wurde aktualisiert: ${input.companyName}.`,
          source: "admin",
          metadataJson: { partnerId: params.id }
        }
      });
      return json({ partner: { ...updated, details: parsePartnerAddress(updated.address) } });
    }

    const nextStatus = body.status === "active" || body.status === "inactive" ? body.status : partner.status;
    if (nextStatus === "active") {
      const registration = await prisma.brokerRegistration.findFirst({ where: { partnerId: params.id } });
      if (registration && registration.status === "email_pending") {
        return error("Der Partner kann erst freigeschaltet werden, wenn die E-Mail-Adresse bestÃ¤tigt wurde.", 409);
      }
    }
    const updated = await prisma.partner.update({
      where: { id: params.id },
      data: {
        companyName: body.companyName ?? partner.companyName,
        contactName: body.contactName ?? partner.contactName,
        email: body.email ?? partner.email,
        phone: body.phone ?? partner.phone,
        address: body.address ?? partner.address,
        status: nextStatus
      }
    });
    if (body.status === "active") {
      await prisma.brokerRegistration.updateMany({
        where: { partnerId: params.id },
        data: { status: "approved" }
      });
    }
    return json({ partner: updated });
  } catch (err) {
    if (err instanceof ZodError) {
      return json({ error: err.issues[0]?.message || "Bitte prüfen Sie die Partnerdaten." }, { status: 400 });
    }
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireInternalRole("admin", "super_admin");
    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) throw new Error("Partner not found");

    const partnerUsers = await prisma.user.findMany({
      where: { partnerId: params.id },
      select: { id: true }
    });
    const userIds = partnerUsers.map((user) => user.id);
    const [customerCount, propertyCount, assignedLeadCount, activityCount, documentCount, reminderCount] = await Promise.all([
      prisma.customer.count({ where: { partnerId: params.id } }),
      prisma.property.count({ where: { partnerId: params.id } }),
      prisma.lead.count({ where: { assignedPartnerId: params.id, status: { not: "CONVERTED" } } }),
      userIds.length ? prisma.activity.count({ where: { userId: { in: userIds } } }) : Promise.resolve(0),
      userIds.length ? prisma.document.count({ where: { uploadedByUserId: { in: userIds } } }) : Promise.resolve(0),
      userIds.length ? prisma.reminder.count({
        where: {
          OR: [
            { assignedToUserId: { in: userIds } },
            { createdByUserId: { in: userIds } },
            { completedByUserId: { in: userIds } }
          ]
        }
      }) : Promise.resolve(0)
    ]);

    const hasOperationalData = customerCount + propertyCount + assignedLeadCount + activityCount + documentCount + reminderCount > 0;
    if (hasOperationalData) {
      return error("Partner kann nicht gelöscht werden, weil bereits Fälle, Kunden, Leads oder Aktivitäten verknüpft sind. Bitte den Partner stattdessen sperren.", 409);
    }

    await prisma.$transaction([
      prisma.brokerRegistration.deleteMany({ where: { partnerId: params.id } }),
      prisma.user.deleteMany({ where: { partnerId: params.id } }),
      prisma.partner.delete({ where: { id: params.id } })
    ]);

    return json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
