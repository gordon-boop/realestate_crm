import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { DocumentCategory } from "@/lib/domain";
import { makeId, nowIso } from "@/lib/id";
import { addActivity, getCaseByPropertyId, store } from "@/lib/store";
import { documentCreateSchema } from "@/lib/validation";

export function GET(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ documents: caseView.documents });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    const body = documentCreateSchema.parse(await request.json());
    const document = {
      id: makeId("doc"),
      propertyId: params.id,
      customerId: caseView.customer.id,
      uploadedByUserId: user.id,
      fileName: body.fileName,
      displayName: body.displayName ?? body.fileName,
      fileType: body.fileType,
      storageUrl: body.storageUrl ?? `/mock-storage/${body.fileName}`,
      category: body.category as DocumentCategory,
      requirementLevel: body.requirementLevel,
      status: body.status,
      missingReason: body.missingReason,
      createdAt: nowIso()
    };
    store.documents.push(document);
    addActivity(params.id, user.id, "document_uploaded", `Dokument ${document.fileName} wurde vermerkt.`, {
      source: user.role,
      entityType: "document",
      entityId: document.id,
      metadata: { status: document.status, requirementLevel: document.requirementLevel }
    });
    return json({ document }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
