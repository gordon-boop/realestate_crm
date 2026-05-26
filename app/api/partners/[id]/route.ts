import { error, handleApiError, json, requireInternalRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireInternalRole("admin", "super_admin");
    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) throw new Error("Partner not found");
    return json({ partner });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireInternalRole("admin", "super_admin");
    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) throw new Error("Partner not found");
    const body = await request.json();
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
