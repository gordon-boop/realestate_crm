import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId, toJsonSnapshot } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { documentReviewSchema } from "@/lib/validation";
import { unlink } from "node:fs/promises";
import { basename, join } from "node:path";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string; documentId: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    if (user.role !== "admin") throw new Error("Internal document review required");

    const current = await prisma.document.findFirst({ where: { id: params.documentId, propertyId: params.id } });
    if (!current) throw new Error("Document not found");

    const body = documentReviewSchema.parse(await request.json().catch(() => ({})));
    const document = await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: { id: params.documentId },
        data: {
          currentVersion: { increment: 1 },
          status: body.status as never,
          requirementLevel: body.requirementLevel as never,
          missingReason: body.missingReason !== undefined ? body.missingReason || null : undefined,
          scanStatus: body.scanStatus as never,
          scanNote: body.scanNote !== undefined ? body.scanNote || null : undefined,
          scannedAt: body.scanStatus && body.scanStatus !== current.scanStatus ? new Date() : undefined,
          reviewedByUserId: user.id,
          reviewedAt: new Date(),
        },
      });

      await tx.documentVersion.create({
        data: {
          documentId: updated.id,
          version: updated.currentVersion,
          snapshotJson: toJsonSnapshot(updated),
          createdByUserId: user.id,
        },
      });

      return updated;
    });

    await addDbActivity(params.id, user.id, "document_status_changed", `Dokumentstatus für ${document.displayName ?? document.fileName} wurde aktualisiert.`, {
      source: user.role,
      entityType: "document",
      entityId: document.id,
      metadata: { status: document.status, requirementLevel: document.requirementLevel, scanStatus: document.scanStatus, version: document.currentVersion },
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
    if (user.role === "partner" && caseView.property.status !== "DRAFT") {
      throw new Error("Submitted cases cannot have documents deleted by partners");
    }

    const document = await prisma.document.findFirst({ where: { id: params.documentId, propertyId: params.id } });
    if (!document) throw new Error("Document not found");
    await prisma.document.delete({ where: { id: document.id } });
    await deleteStoredFile(document.storageUrl);

    await addDbActivity(params.id, user.id, "document_deleted", `Dokument ${document.displayName ?? document.fileName} wurde gelöscht.`, {
      source: user.role,
      entityType: "document",
      entityId: document.id,
      metadata: { fileName: document.fileName, category: document.category, status: document.status, version: document.currentVersion },
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
