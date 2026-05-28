import { handleApiError, json, requireRole } from "@/lib/api";
import { createDraftObjectRating, getLatestObjectRating, summarizeObjectRating } from "@/lib/object-rating";
import { getDbCaseByPropertyId } from "@/lib/persistence";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");

    const rating = await getLatestObjectRating(params.id);
    const summary = rating ? await summarizeObjectRating(rating.id) : undefined;
    return json({ rating, summary });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");

    const rating = await createDraftObjectRating(params.id, user.id);
    const summary = rating ? await summarizeObjectRating(rating.id) : undefined;
    return json({ rating, summary });
  } catch (err) {
    return handleApiError(err);
  }
}
