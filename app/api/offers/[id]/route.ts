import { assertAdmin } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { toJsonSnapshot } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    assertAdmin(user);
    const body = await request.json();
    const current = await prisma.offer.findUnique({ where: { id: params.id } });
    if (!current) throw new Error("Offer not found");
    const offer = await prisma.offer.update({
      where: { id: params.id },
      data: {
        aiCustomerText: body.aiCustomerText ?? current.aiCustomerText,
        aiPartnerSummary: body.aiPartnerSummary ?? current.aiPartnerSummary,
        aiInternalRationale: body.aiInternalRationale ?? current.aiInternalRationale,
        status: body.status ?? current.status,
        currentVersion: { increment: 1 }
      }
    });
    await prisma.offerVersion.create({ data: { offerId: offer.id, version: offer.currentVersion, snapshotJson: toJsonSnapshot(offer), createdByUserId: user.id } });
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
