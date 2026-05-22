import { NextResponse } from "next/server";
import { error, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    if (!token) return error("Bestätigungstoken fehlt.", 400);

    const registration = await prisma.brokerRegistration.findUnique({
      where: { emailConfirmationToken: token }
    });

    if (!registration) return error("Der Bestätigungslink ist ungültig oder abgelaufen.", 404);

    if (registration.status === "approved") {
      return NextResponse.json({ status: registration.status, message: "Der Maklerzugang ist bereits freigeschaltet." });
    }

    if (registration.emailConfirmedAt && registration.partnerId && registration.userId) {
      return NextResponse.json({
        status: registration.status,
        message: "Die E-Mail-Adresse wurde bereits bestätigt. Der Zugang wartet auf interne Freischaltung."
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          companyName: registration.companyName,
          contactName: registration.contactName,
          email: registration.email,
          phone: registration.phone,
          address: registration.address,
          status: "inactive"
        }
      });

      const user = await tx.user.create({
        data: {
          partnerId: partner.id,
          name: registration.contactName,
          email: registration.email,
          passwordHash: registration.passwordHash,
          role: "partner"
        }
      });

      const updated = await tx.brokerRegistration.update({
        where: { id: registration.id },
        data: {
          status: "pending_approval",
          emailConfirmedAt: new Date(),
          partnerId: partner.id,
          userId: user.id
        }
      });

      return updated;
    });

    return NextResponse.json({
      status: result.status,
      message: "E-Mail-Adresse bestätigt. Der Maklerzugang wartet jetzt auf interne Freischaltung."
    });
  } catch (err) {
    return handleApiError(err);
  }
}
