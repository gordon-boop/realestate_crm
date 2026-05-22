import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId, getDbCases } from "@/lib/persistence";
import { activityCreateSchema } from "@/lib/validation";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const url = new URL(request.url);
    const propertyId = url.searchParams.get("propertyId");
    if (!propertyId) {
      const cases = await getDbCases(user);
      return json({ activities: cases.flatMap((item) => item.activities) });
    }
    const caseView = await getDbCaseByPropertyId(propertyId);
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
    const caseView = await getDbCaseByPropertyId(body.propertyId);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    const activity = await addDbActivity(caseView.property.id, user.id, body.type, body.message, {
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
