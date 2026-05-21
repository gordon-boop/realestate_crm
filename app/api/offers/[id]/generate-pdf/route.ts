import { handleApiError, json, requireRole } from "@/lib/api";
import { addActivity, store } from "@/lib/store";

export function POST(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin");
    const offer = store.offers.find((item) => item.id === params.id);
    if (!offer) throw new Error("Offer not found");
    if (offer.status !== "approved" && offer.status !== "sent") throw new Error("Offer must be approved before PDF generation");
    offer.pdfUrl = `/pdf-stub/${offer.offerNumber}.pdf`;
    addActivity(offer.propertyId, user.id, "pdf_generated", `PDF-Stub ${offer.pdfUrl} wurde erzeugt.`);
    return json({ pdfUrl: offer.pdfUrl });
  } catch (err) {
    return handleApiError(err);
  }
}
