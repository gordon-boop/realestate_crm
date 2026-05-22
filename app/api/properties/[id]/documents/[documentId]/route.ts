import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { unlink } from "node:fs/promises";
import { basename, join } from "node:path";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string; documentId: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const current = await prisma.document.findFirst({ where: { id: params.documentId, propertyId: params.id } });
    if (!current) throw new Error("Document not found");

    const body = await request.json().catch(() => ({}));
    const document = await prisma.document.update({
      where: { id: params.documentId },
      data: {
        status: body.status ? String(body.status) as never : undefined,
        requirementLevel: body.requirementLevel ? String(body.requirementLevel) as never : undefined,
        missingReason: body.missingReason !== undefined ? body.missingReason ? String(body.missingReason) : null : undefined,
        reviewedByUserId: user.role === "admin" ? user.id : undefined,
        reviewedAt: user.role === "admin" ? new Date() : undefined
      }
    });

    await addDbActivity(params.id, user.id, "document_status_changed", `Dokumentstatus für ${document.displayName ?? document.fileName} wurde aktualisiert.`, {
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

export async function DELETE(_request: Request, { params }: { params: { id: string; documentId: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const document = await prisma.document.findFirst({ where: { id: params.documentId, propertyId: params.id } });
    if (!document) throw new Error("Document not found");
    await prisma.document.delete({ where: { id: document.id } });
    await deleteStoredFile(document.storageUrl);

    await addDbActivity(params.id, user.id, "document_deleted", `Dokument ${document.displayName ?? document.fileName} wurde gelöscht.`, {
      source: user.role,
      entityType: "document",
      entityId: document.id,
      metadata: { fileName: document.fileName, category: document.category, status: document.status }
    });

    return json({ deleted: true, documentId: document.id });
  } catch (err) {
    return handleApiError(err);
  }
}

async function deleteStoredFile(storageUrl?: string) {
  if (!storageUrl?.startsWith("/mock-storage/")) return;
  const safeName = basename(storageUrl);
  if (!safeName) return;

  try {
    await unlink(join(process.cwd(), "public", "mock-storage", safeName));
  } catch {
    // Missing local files should not block metadata deletion.
  }
}
