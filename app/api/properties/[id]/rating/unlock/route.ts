import { handleApiError, json, requireInternalRole } from "@/lib/api";
import { getLatestObjectRating, unlockObjectRating } from "@/lib/object-rating";
import { getDbCaseByPropertyId } from "@/lib/persistence";
import { objectRatingUnlockSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireInternalRole("admin", "super_admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    const rating = await getLatestObjectRating(params.id);
    if (!rating) throw new Error("Rating not found");

    const input = objectRatingUnlockSchema.parse(await request.json().catch(() => ({})));
    const updated = await unlockObjectRating(rating.id, user.id, input.reason);
    return json({ rating: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
