import { canCalculateOffer } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import {
  buildBindingOfferPdfData,
  createBindingOfferDocx,
  getBindingOfferTemplateFileName,
  getFallbackBindingOfferTemplateFileName,
  sanitizePdfFileName
} from "@/lib/pdf-generator";
import { addDbActivity, getDbCaseByPropertyId, toJsonSnapshot } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  let tempDirectory = "";
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("FÃ¼r die PDF-Erstellung fehlen Objektdaten.");
    if (!canCalculateOffer(user, caseView.property)) throw new Error("Forbidden");
    if (!caseView.customer?.id) throw new Error("FÃ¼r die PDF-Erstellung fehlen Kundendaten.");

    const body = await request.json().catch(() => ({}));
    const requestedModel = typeof body?.model === "string" ? body.model : undefined;
    const offer = caseView.offers
      .filter((item) => item.kind === "binding" && (!requestedModel || item.model === requestedModel))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0];
    if (!offer) throw new Error("Bitte berechnen Sie zuerst das verbindliche Angebot.");

    const advisor = caseView.property.assignedAdvisorUserId
      ? await prisma.user.findUnique({
          where: { id: caseView.property.assignedAdvisorUserId },
          select: { name: true, email: true }
        })
      : { name: user.name, email: user.email };

    const pdfData = buildBindingOfferPdfData(caseView, offer, advisor ?? { name: user.name, email: user.email });
    const requestedTemplatePath = join(process.cwd(), "templates", getBindingOfferTemplateFileName(offer.model));
    const fallbackTemplatePath = join(process.cwd(), "templates", getFallbackBindingOfferTemplateFileName());
    const template = await readFile(existsSync(requestedTemplatePath) ? requestedTemplatePath : fallbackTemplatePath);
    const docxBuffer = createBindingOfferDocx(template, pdfData);
    const fileName = sanitizePdfFileName(`Verbindliches_Angebot_${pdfData.caseNumber}_${caseView.customer.lastName || "Kunde"}.pdf`);
    const documentId = randomUUID();
    const storageName = `${documentId}-${fileName}`;
    tempDirectory = join(process.cwd(), ".tmp", "generated-offers", documentId);
    await mkdir(tempDirectory, { recursive: true });
    const docxPath = join(tempDirectory, fileName.replace(/\.pdf$/i, ".docx"));
    const pdfPath = join(tempDirectory, fileName);
    await writeFile(docxPath, docxBuffer);
    await convertDocxToPdf(docxPath, tempDirectory);
    const pdfBuffer = await readFile(pdfPath);
    const storageDirectory = join(process.cwd(), "public", "mock-storage");
    await mkdir(storageDirectory, { recursive: true });
    await writeFile(join(storageDirectory, storageName), pdfBuffer);
    const storageUrl = `/api/properties/${params.id}/documents/${documentId}`;

    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.document.create({
        data: {
          id: documentId,
          propertyId: params.id,
          customerId: caseView.customer.id,
          uploadedByUserId: user.id,
          fileName,
          displayName: "Verbindliches Angebot",
          fileType: "application/pdf",
          storageUrl,
          category: "other",
          requirementLevel: "optional",
          status: "ok",
          scanStatus: "clean",
          scanNote: "Systemseitig aus dem verbindlichen Angebot erzeugt."
        }
      });
      await tx.documentVersion.create({
        data: {
          documentId: created.id,
          version: created.currentVersion,
          snapshotJson: toJsonSnapshot(created),
          createdByUserId: user.id
        }
      });
      await tx.offer.update({
        where: { id: offer.id },
        data: { pdfUrl: storageUrl }
      });
      return created;
    });

    await addDbActivity(params.id, user.id, "binding_offer_pdf_created", "Verbindliches Angebot als PDF erstellt.", {
      source: "admin",
      entityType: "document",
      entityId: document.id,
      metadata: { offerId: offer.id, documentId: document.id, storageUrl }
    });

    return json({ document: { ...document, createdAt: document.createdAt.toISOString() }, pdfUrl: storageUrl, downloadUrl: storageUrl }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  } finally {
    if (tempDirectory) {
      await rm(tempDirectory, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}

async function convertDocxToPdf(docxPath: string, outputDirectory: string): Promise<void> {
  const binary = process.env.LIBREOFFICE_PATH || "soffice";
  try {
    await execFileAsync(binary, [
      "--headless",
      "--nologo",
      "--nofirststartwizard",
      "--nodefault",
      "--nolockcheck",
      "--convert-to",
      "pdf",
      "--outdir",
      outputDirectory,
      docxPath
    ], {
      env: {
        ...process.env,
        HOME: process.env.HOME || "/tmp",
        TMPDIR: process.env.TMPDIR || "/tmp"
      },
      timeout: 60000
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LibreOffice conversion failed";
    throw new Error(`Das PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut. (${message})`);
  }
}
