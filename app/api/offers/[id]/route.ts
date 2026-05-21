import { assertAdmin } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { nowIso } from "@/lib/id";
import { saveOfferVersion, store } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    assertAdmin(user);
    const offer = store.offers.find((item) => item.id === params.id);
    if (!offer) throw new Error("Offer not found");
    const body = await request.json();
    Object.assign(offer, {
      aiCustomerText: body.aiCustomerText ?? offer.aiCustomerText,
      aiPartnerSummary: body.aiPartnerSummary ?? offer.aiPartnerSummary,
      aiInternalRationale: body.aiInternalRationale ?? offer.aiInternalRationale,
      status: body.status ?? offer.status,
      currentVersion: offer.currentVersion + 1,
      updatedAt: nowIso()
    });
    saveOfferVersion(offer, user.id);
    return json({ offer });
  } catch (err) {
    return handleApiError(err);
  }
}
