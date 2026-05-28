import { handleApiError, json, requireRole } from "@/lib/api";
import { approveObjectRating, getLatestObjectRating } from "@/lib/object-rating";
import { getDbCaseByPropertyId } from "@/lib/persistence";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    const rating = await getLatestObjectRating(params.id);
    if (!rating) throw new Error("Rating not found");

    const updated = await approveObjectRating(rating.id, user.id);
    return json({ rating: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
