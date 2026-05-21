import { handleApiError, json, requireRole } from "@/lib/api";
import { nowIso } from "@/lib/id";
import { addActivity, saveOfferVersion, store, updatePropertyStatus } from "@/lib/store";

export function POST(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin");
    const offer = store.offers.find((item) => item.id === params.id);
    if (!offer) throw new Error("Offer not found");
    if (offer.status !== "approved" && offer.status !== "sent") throw new Error("Offer must be approved before sending");
    Object.assign(offer, {
      status: "sent",
      sentAt: nowIso(),
      currentVersion: offer.currentVersion + 1,
      updatedAt: nowIso()
    });
    saveOfferVersion(offer, user.id);
    updatePropertyStatus(offer.propertyId, "SENT");
    addActivity(offer.propertyId, user.id, "offer_sent", "Angebot wurde als versendet markiert.");
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
