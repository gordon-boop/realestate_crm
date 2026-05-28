import { handleApiError, json, requireRole } from "@/lib/api";
import { getLatestObjectRating, updateObjectRatingReturn } from "@/lib/object-rating";
import { getDbCaseByPropertyId } from "@/lib/persistence";
import { objectRatingReturnUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    const rating = await getLatestObjectRating(params.id);
    if (!rating) throw new Error("Rating not found");

    const input = objectRatingReturnUpdateSchema.parse(await request.json().catch(() => ({})));
    const updated = await updateObjectRatingReturn(rating.id, user.id, input.finalTargetReturn);
    return json({ rating: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
