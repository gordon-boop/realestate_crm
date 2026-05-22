"use client";

import { useEffect, useState } from "react";

export function ConfirmRegistration({ token }: { token?: string }) {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("E-Mail-Adresse wird bestätigt...");

  useEffect(() => {
    async function confirm() {
      if (!token) {
        setState("error");
        setMessage("Der Bestätigungslink ist unvollständig.");
        return;
      }

      try {
        const response = await fetch("/api/auth/register/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token })
        });
        const payload = await response.json();
        setState(response.ok ? "success" : "error");
        setMessage(payload.message ?? payload.error ?? "Bestätigung fehlgeschlagen.");
      } catch {
        setState("error");
        setMessage("Bestätigung fehlgeschlagen.");
      }
    }

    confirm();
  }, [token]);

  return (
    <div className="panel panel-pad register-card">
      <span className="section-label">{state === "success" ? "Bestätigt" : state === "error" ? "Hinweis" : "Prüfung"}</span>
      <h1>{state === "success" ? "E-Mail bestätigt" : "Maklerregistrierung"}</h1>
      <p className="muted">{message}</p>
      {state === "success" ? (
        <p className="muted">Sobald ein Admin den Zugang freischaltet, können Sie sich mit Ihren Zugangsdaten anmelden.</p>
      ) : null}
      <a className="btn btn-primary" href="/login">Zur Anmeldung</a>
    </div>
  );
}
