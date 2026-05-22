import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { documentCreateSchema } from "@/lib/validation";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
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
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    const body = documentCreateSchema.parse(await readDocumentBody(request));
    const document = await prisma.document.create({
      data: {
        propertyId: params.id,
        customerId: caseView.customer.id,
        uploadedByUserId: user.id,
        fileName: body.fileName,
        displayName: body.displayName ?? body.fileName,
        fileType: body.fileType,
        storageUrl: body.storageUrl ?? `/mock-storage/${body.fileName}`,
        category: body.category as never,
        requirementLevel: body.requirementLevel as never,
        status: body.status as never,
        missingReason: body.missingReason
      }
    });
    await addDbActivity(params.id, user.id, `document_uploaded`, `Dokument ${document.fileName} wurde vermerkt.`, {
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

async function readDocumentBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return request.json();
  }

  const form = await request.formData();
  const file = form.get("file");
  const uploadedFile = file instanceof File ? file : null;
  const fileName = uploadedFile?.name || stringFromForm(form, "fileName") || "upload-placeholder.pdf";
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
  let storageUrl = stringFromForm(form, "storageUrl");

  if (uploadedFile && !storageUrl) {
    const storageName = `${Date.now()}-${safeFileName}`;
    const storageDirectory = join(process.cwd(), "public", "mock-storage");
    await mkdir(storageDirectory, { recursive: true });
    await writeFile(join(storageDirectory, storageName), Buffer.from(await uploadedFile.arrayBuffer()));
    storageUrl = `/mock-storage/${storageName}`;
  }

  return {
    fileName,
    displayName: stringFromForm(form, "displayName") || fileName,
    fileType: uploadedFile?.type || stringFromForm(form, "fileType") || "application/octet-stream",
    storageUrl: storageUrl || `/mock-storage/${Date.now()}-${safeFileName}`,
    category: stringFromForm(form, "category") || "other",
    requirementLevel: stringFromForm(form, "requirementLevel") || "optional",
    status: stringFromForm(form, "status") || "pending",
    missingReason: stringFromForm(form, "missingReason")
  };
}

function stringFromForm(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
