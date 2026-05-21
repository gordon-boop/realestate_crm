import { handleApiError, json, requireRole } from "@/lib/api";
import { nowIso } from "@/lib/id";
import { addActivity, saveOfferVersion, store, updatePropertyStatus } from "@/lib/store";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const offer = store.offers.find((item) => item.id === params.id);
    if (!offer) throw new Error("Offer not found");
    const body = await request.json().catch(() => ({}));
    Object.assign(offer, {
      status: "rejected",
      currentVersion: offer.currentVersion + 1,
      updatedAt: nowIso()
    });
    saveOfferVersion(offer, user.id);
    updatePropertyStatus(offer.propertyId, "REJECTED");
    addActivity(offer.propertyId, user.id, "offer_rejected", String(body.reason ?? "Angebot wurde abgelehnt."));
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
