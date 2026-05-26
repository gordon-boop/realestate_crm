import { canResetAcquisition, isInternalAdmin } from "@/lib/access-control";
import { validateAcquisitionReset } from "@/lib/acquisition-workflow";
import { handleApiError, json, requireRole } from "@/lib/api";
import { getDbCaseByPropertyId, resetDbAcquisitionWorkflow } from "@/lib/persistence";
import { acquisitionWorkflowResetSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canResetAcquisition(user, caseView.property)) throw new Error("Forbidden");

    const body = acquisitionWorkflowResetSchema.parse(await request.json());
    validateAcquisitionReset(caseView.property, body.targetStatus, body.reason, {
      allowFinalReset: isInternalAdmin(user)
    });

    const property = await resetDbAcquisitionWorkflow(params.id, body.targetStatus, user.id, {
      reason: body.reason,
      note: body.note,
      source: user.role
    });

    return json({ property });
  } catch (err) {
    return handleApiError(err);
  }
}
