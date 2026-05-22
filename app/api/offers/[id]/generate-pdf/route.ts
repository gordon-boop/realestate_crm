import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const offer = await prisma.offer.findUnique({ where: { id: params.id } });
    if (!offer) throw new Error("Offer not found");
    if (offer.status !== "approved" && offer.status !== "sent") throw new Error("Offer must be approved before PDF generation");
    const pdfUrl = `/pdf-stub/${offer.offerNumber}.pdf`;
    const updated = await prisma.offer.update({ where: { id: offer.id }, data: { pdfUrl } });
    await addDbActivity(updated.propertyId, user.id, "pdf_generated", `PDF-Stub ${pdfUrl} wurde erzeugt.`, {
      source: "admin",
      entityType: "offer",
      entityId: updated.id
    });
    return json({ pdfUrl });
  } catch (err) {
    return handleApiError(err);
  }
}
