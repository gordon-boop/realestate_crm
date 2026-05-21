"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { DocumentCategory, DocumentRequirementLevel, PropertyType } from "@/lib/domain";
import { getRequiredDocumentsForPropertyType } from "@/lib/document-requirements";

export function DocumentUploadForm({ propertyId, propertyType }: { propertyId: string; propertyType?: PropertyType | string | null }) {
  const router = useRouter();
  const requiredDocuments = getRequiredDocumentsForPropertyType(propertyType);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>(requiredDocuments[0]?.category ?? "other");
  const [requirementLevel, setRequirementLevel] = useState<DocumentRequirementLevel>("required");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.name) {
      setBusy(false);
      setMessage("Bitte eine Datei auswählen.");
      return;
    }

    form.set("category", category);
    form.set("requirementLevel", requirementLevel);
    form.set("status", "pending");

    try {
      const response = await fetch(`/api/properties/${propertyId}/documents`, {
        method: "POST",
        body: form
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Upload fehlgeschlagen");
      event.currentTarget.reset();
      setMessage("Upload gespeichert. Die Unterlage wartet auf Prüfung.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 12, marginBottom: 18 }}>
      <div className="grid two">
        <label className="field">
          <span>Datei hochladen</span>
          <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx" />
        </label>
        <label className="field">
          <span>Dokumententyp</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory)}>
            {requiredDocuments.map((document) => (
              <option key={document.category} value={document.category}>{document.label}</option>
            ))}
            <option value="section">Schnitt</option>
            <option value="power_of_attorney">Vollmacht Grundbuch</option>
            <option value="repair_offer">Reparaturangebot</option>
            <option value="other">Sonstiges</option>
          </select>
        </label>
      </div>
      <div className="grid two">
        <label className="field">
          <span>Pflichtstatus</span>
          <select value={requirementLevel} onChange={(event) => setRequirementLevel(event.target.value as DocumentRequirementLevel)}>
            <option value="required">Pflicht</option>
            <option value="recommended">Empfohlen</option>
            <option value="optional">Optional</option>
          </select>
        </label>
        <label className="field">
          <span>Anmerkung</span>
          <input name="missingReason" placeholder="Optionaler Hinweis zur Unterlage" />
        </label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Lädt hoch..." : "Unterlage hochladen"}</button>
        {message ? <span className="muted">{message}</span> : null}
      </div>
    </form>
  );
}
