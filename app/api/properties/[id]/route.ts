import { canMutateProperty, canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { getCaseByPropertyId } from "@/lib/store";
import { nowIso } from "@/lib/id";
import { propertyCreateSchema } from "@/lib/validation";

export function GET(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ case: caseView });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canMutateProperty(user, caseView.property)) throw new Error("Forbidden");
    const body = propertyCreateSchema.partial().parse(await request.json());
    if (body.leasehold !== undefined || body.monumentProtection !== undefined || body.leaseholdOrMonument !== undefined) {
      body.leaseholdOrMonument = Boolean(body.leaseholdOrMonument || body.leasehold || body.monumentProtection);
    }
    Object.assign(caseView.property, { ...body, updatedAt: nowIso() });
    return json({ property: caseView.property });
  } catch (err) {
    return handleApiError(err);
  }
}
