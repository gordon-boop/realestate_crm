import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".heic": "image/heic",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

export async function GET(_request: Request, { params }: { params: { fileName: string } }) {
  const safeName = basename(params.fileName);
  if (!safeName || safeName !== params.fileName) {
    return new Response("Invalid file name", { status: 400 });
  }

  try {
    const file = await readFile(join(process.cwd(), "public", "mock-storage", safeName));
    return new Response(file, {
      headers: {
        "content-type": contentTypes[extname(safeName).toLowerCase()] || "application/octet-stream",
        "content-disposition": `inline; filename="${safeName}"`
      }
    });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}
