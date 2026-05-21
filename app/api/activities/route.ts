import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addActivity, getCaseByPropertyId, store } from "@/lib/store";
import { activityCreateSchema } from "@/lib/validation";

export function GET(request: Request): Response {
  try {
    const user = requireRole("admin", "partner");
    const url = new URL(request.url);
    const propertyId = url.searchParams.get("propertyId");
    if (!propertyId) {
      const visiblePropertyIds = store.properties.filter((property) => canSeeProperty(user, property)).map((property) => property.id);
      return json({ activities: store.activities.filter((activity) => visiblePropertyIds.includes(activity.propertyId)) });
    }
    const caseView = getCaseByPropertyId(propertyId);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ activities: caseView.activities });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = activityCreateSchema.parse(await request.json());
    const caseView = getCaseByPropertyId(body.propertyId);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    const activity = addActivity(caseView.property.id, user.id, body.type, body.message, {
      source: user.role,
      entityType: body.entityType,
      entityId: body.entityId,
      metadata: body.metadata
    });
    return json({ activity }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
