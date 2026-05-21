import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { DocumentRequirementLevel, DocumentStatus } from "@/lib/domain";
import { nowIso } from "@/lib/id";
import { addActivity, getCaseByPropertyId, store } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: { id: string; documentId: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const document = store.documents.find((item) => item.id === params.documentId && item.propertyId === params.id);
    if (!document) throw new Error("Document not found");

    const body = await request.json().catch(() => ({}));
    if (body.status) {
      document.status = String(body.status) as DocumentStatus;
    }
    if (body.requirementLevel) {
      document.requirementLevel = String(body.requirementLevel) as DocumentRequirementLevel;
    }
    if (body.missingReason !== undefined) {
      document.missingReason = body.missingReason ? String(body.missingReason) : undefined;
    }
    if (user.role === "admin") {
      document.reviewedByUserId = user.id;
      document.reviewedAt = nowIso();
    }

    addActivity(params.id, user.id, "document_status_changed", `Dokumentstatus für ${document.displayName ?? document.fileName} wurde aktualisiert.`, {
      source: user.role,
      entityType: "document",
      entityId: document.id,
      metadata: { status: document.status, requirementLevel: document.requirementLevel }
    });

    return json({ document });
  } catch (err) {
    return handleApiError(err);
  }
}
