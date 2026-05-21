import { handleApiError, json, requireRole } from "@/lib/api";
import { nowIso } from "@/lib/id";
import { addActivity, saveOfferVersion, store, updatePropertyStatus } from "@/lib/store";

export function POST(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin");
    const offer = store.offers.find((item) => item.id === params.id);
    if (!offer) throw new Error("Offer not found");
    Object.assign(offer, {
      status: "approved",
      approvedByUserId: user.id,
      approvedAt: nowIso(),
      currentVersion: offer.currentVersion + 1,
      updatedAt: nowIso()
    });
    saveOfferVersion(offer, user.id);
    updatePropertyStatus(offer.propertyId, "APPROVED");
    addActivity(offer.propertyId, user.id, "offer_approved", "Angebot wurde intern freigegeben.");
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
