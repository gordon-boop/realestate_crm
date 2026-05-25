import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbChatMessage, getDbCaseByPropertyId } from "@/lib/persistence";
import { chatMessageCreateSchema } from "@/lib/validation";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const chatMessages = user.role === "admin"
      ? caseView.chatMessages
      : caseView.chatMessages.filter((message) => message.visibility === "shared");

    return json({ chatMessages });
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

    const body = chatMessageCreateSchema.parse(await readChatBody(request));
    const visibility = user.role === "admin" ? body.visibility : "shared";
    const chatMessage = await addDbChatMessage(caseView.property.id, user.id, user.role, body.message, visibility, body.attachments ?? []);

    return json({ chatMessage }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

async function readChatBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return request.json();
  }

  const form = await request.formData();
  const files = form.getAll("attachments").filter((value): value is File => value instanceof File);
  const attachments = [];

  for (const file of files.slice(0, 5)) {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const storageName = `${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;
    const storageDirectory = join(process.cwd(), "public", "mock-storage");
    await mkdir(storageDirectory, { recursive: true });
    await writeFile(join(storageDirectory, storageName), Buffer.from(await file.arrayBuffer()));
    attachments.push({
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      storageUrl: `/mock-storage/${storageName}`
    });
  }

  return {
    message: stringFromForm(form, "message") || "",
    visibility: stringFromForm(form, "visibility") || "shared",
    attachments
  };
}

function stringFromForm(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
