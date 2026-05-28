import { handleApiError, json, requireRole } from "@/lib/api";
import { getLatestObjectRating, updateObjectRatingScore } from "@/lib/object-rating";
import { getDbCaseByPropertyId } from "@/lib/persistence";
import { objectRatingScoreUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string; scoreId: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    const rating = await getLatestObjectRating(params.id);
    if (!rating || !rating.scores.some((score) => score.id === params.scoreId)) throw new Error("Rating score not found");

    const input = objectRatingScoreUpdateSchema.parse(await request.json().catch(() => ({})));
    const score = await updateObjectRatingScore(rating.id, params.scoreId, user.id, input);
    return json({ score });
  } catch (err) {
    return handleApiError(err);
  }
}
