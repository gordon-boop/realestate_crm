"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Document } from "@/lib/domain";

export function DocumentPreviewList({ propertyId, documents }: { propertyId: string; documents: Document[] }) {
  const router = useRouter();
  const [busyDocumentId, setBusyDocumentId] = useState("");
  const [message, setMessage] = useState("");

  if (documents.length === 0) {
    return <p className="muted">Noch keine Unterlagen hochgeladen.</p>;
  }

  async function deleteDocument(document: Document) {
    const title = document.displayName ?? document.fileName;
    if (!window.confirm(`Unterlage "${title}" wirklich löschen?`)) return;

    setMessage("");
    setBusyDocumentId(document.id);
    try {
      const response = await fetch(`/api/properties/${propertyId}/documents/${document.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Löschen fehlgeschlagen");
      setMessage("Unterlage gelöscht.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    } finally {
      setBusyDocumentId("");
    }
  }

  return (
    <>
      <div className="document-preview-list">
        {documents.map((document) => {
          const title = document.displayName ?? document.fileName;
          const canOpen = Boolean(document.storageUrl);
          const isImage = isImageDocument(document);

          return (
            <article className="document-preview-card" key={document.id}>
              {canOpen ? (
                <a className="document-preview-media" href={document.storageUrl} target="_blank" rel="noreferrer" aria-label={`${title} anzeigen`}>
                  {isImage ? (
                    <img src={document.storageUrl} alt={title} />
                  ) : (
                    <span>{fileExtension(document.fileName)}</span>
                  )}
                </a>
              ) : (
                <div className="document-preview-media document-preview-media-empty">
                  <span>{fileExtension(document.fileName)}</span>
                </div>
              )}
              <div className="document-preview-body">
                <strong>{title}</strong>
                <span className="muted">{document.requirementLevel} | {document.status}{document.missingReason ? ` | ${document.missingReason}` : ""}</span>
                <div className="document-preview-actions">
                  {canOpen ? (
                    <a className="document-preview-link" href={document.storageUrl} target="_blank" rel="noreferrer">Ansehen</a>
                  ) : (
                    <span className="muted">Keine Datei hinterlegt</span>
                  )}
                  <button className="document-delete-button" type="button" disabled={busyDocumentId === document.id} onClick={() => deleteDocument(document)}>
                    {busyDocumentId === document.id ? "Löscht..." : "Löschen"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </>
  );
}

function isImageDocument(document: Document) {
  return document.fileType.startsWith("image/");
}

function fileExtension(fileName: string) {
  const extension = fileName.split(".").pop();
  return extension && extension !== fileName ? extension.toUpperCase().slice(0, 5) : "DATEI";
}
