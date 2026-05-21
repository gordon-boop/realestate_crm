"use client";

import { useState } from "react";

export function ActivityNoteForm({ propertyId }: { propertyId: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ propertyId, type: "question", message })
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Rückfrage konnte nicht gespeichert werden");
      return;
    }
    window.location.reload();
  }

  return (
    <form className="grid" onSubmit={submit}>
      <label className="field">
        <span>Rückfrage / Notiz</span>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} required />
      </label>
      {error ? <p className="btn-danger" style={{ margin: 0 }}>{error}</p> : null}
      <div><button className="btn" type="submit">Rückfrage speichern</button></div>
    </form>
  );
}
