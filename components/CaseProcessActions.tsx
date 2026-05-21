"use client";

import { useState } from "react";
import type { Offer } from "@/lib/domain";

async function post(url: string, body?: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Aktion fehlgeschlagen");
  }
  return payload;
}

export function CaseProcessActions({ propertyId, offer, admin = false }: { propertyId: string; offer?: Offer; admin?: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  async function run(label: string, url: string, body?: Record<string, unknown>) {
    setBusy(label);
    setMessage("");
    try {
      await post(url, body);
      window.location.reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="panel panel-pad grid">
      <h2 style={{ margin: 0 }}>Prozess</h2>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn" disabled={Boolean(busy)} onClick={() => run("submit", `/api/properties/${propertyId}/submit`)}>Einreichen</button>
        {admin ? (
          <>
            <button className="btn" disabled={Boolean(busy)} onClick={() => run("valuation", `/api/properties/${propertyId}/valuation`, { provider: "sprengnetter" })}>Sprengnetter-Bewertung</button>
            <button className="btn" disabled={Boolean(busy)} onClick={() => run("offer-fixed", `/api/properties/${propertyId}/offer/calculate`, { model: "fixed_residential_right" })}>Verrentung kalkulieren</button>
            <button className="btn" disabled={Boolean(busy)} onClick={() => run("offer-leaseback", `/api/properties/${propertyId}/offer/calculate`, { model: "sale_and_leaseback" })}>Rückmiete kalkulieren</button>
            <button className="btn" disabled={Boolean(busy)} onClick={() => run("ai", `/api/properties/${propertyId}/offer/generate-ai-text`)}>KI-Entwurf</button>
          </>
        ) : null}
        <button className="btn" disabled={Boolean(busy)} onClick={() => run("feedback", `/api/properties/${propertyId}/feedback-received`)}>Kundenrückmeldung erhalten</button>
        {offer && admin ? (
          <>
            <button className="btn" disabled={Boolean(busy)} onClick={() => run("request-feedback", `/api/properties/${propertyId}/request-feedback`, { reason: "Benutzer muss beim Kunden nachfassen." })}>Rückfrage anfordern</button>
            <button className="btn btn-primary" disabled={Boolean(busy)} onClick={() => run("approve", `/api/offers/${offer.id}/approve`)}>Freigeben</button>
            <button className="btn btn-danger" disabled={Boolean(busy)} onClick={() => run("reject", `/api/offers/${offer.id}/reject`)}>Ablehnen</button>
            <button className="btn" disabled={Boolean(busy)} onClick={() => run("pdf", `/api/offers/${offer.id}/generate-pdf`)}>PDF-Stub</button>
            <button className="btn" disabled={Boolean(busy)} onClick={() => run("sent", `/api/offers/${offer.id}/mark-sent`)}>Versendet markieren</button>
          </>
        ) : null}
      </div>
      {busy ? <p className="muted" style={{ margin: 0 }}>Aktion läuft: {busy}</p> : null}
      {message ? <p className="btn-danger" style={{ margin: 0 }}>{message}</p> : null}
    </div>
  );
}
