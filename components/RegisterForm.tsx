"use client";

import { useState } from "react";

type RegistrationSuccess = {
  message: string;
  emailPreview?: {
    confirmationUrl?: string;
  };
};

export function RegisterForm() {
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    passwordRepeat: "",
    consentAccepted: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RegistrationSuccess | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (form.password !== form.passwordRepeat) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Registrierung fehlgeschlagen.");
        return;
      }
      setSuccess(payload);
    } catch {
      setError("Registrierung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="panel panel-pad register-card">
        <span className="section-label">E-Mail bestätigen</span>
        <h1>Registrierung vorgemerkt</h1>
        <p className="muted">{success.message}</p>
        <p className="muted">
          Nach der Bestätigung prüft WohnKapital den Maklerzugang intern und schaltet ihn frei.
        </p>
        {success.emailPreview?.confirmationUrl ? (
          <div className="registration-preview">
            <strong>MVP-Bestätigungslink</strong>
            <a href={success.emailPreview.confirmationUrl}>{success.emailPreview.confirmationUrl}</a>
          </div>
        ) : null}
        <a className="btn btn-primary" href="/login">Zur Anmeldung</a>
      </div>
    );
  }

  return (
    <form className="panel panel-pad register-card" onSubmit={submit}>
      <span className="section-label">Maklerregistrierung</span>
      <h1>Maklerzugang anfragen</h1>
      <p className="muted">
        Erstellen Sie einen Zugang für das WohnKapital Maklerportal. Die Freischaltung erfolgt nach E-Mail-Bestätigung und interner Prüfung.
      </p>

      <label className="field">
        <span>Firma</span>
        <input value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} required />
      </label>
      <label className="field">
        <span>Ansprechpartner</span>
        <input value={form.contactName} onChange={(event) => updateField("contactName", event.target.value)} required />
      </label>
      <label className="field">
        <span>E-Mail</span>
        <input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" autoComplete="email" required />
      </label>
      <label className="field">
        <span>Telefon</span>
        <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} autoComplete="tel" />
      </label>
      <label className="field">
        <span>Adresse</span>
        <input value={form.address} onChange={(event) => updateField("address", event.target.value)} autoComplete="street-address" />
      </label>
      <div className="register-two">
        <label className="field">
          <span>Passwort</span>
          <input value={form.password} onChange={(event) => updateField("password", event.target.value)} type="password" autoComplete="new-password" required />
        </label>
        <label className="field">
          <span>Passwort wiederholen</span>
          <input value={form.passwordRepeat} onChange={(event) => updateField("passwordRepeat", event.target.value)} type="password" autoComplete="new-password" required />
        </label>
      </div>
      <label className="registration-consent">
        <input checked={form.consentAccepted} onChange={(event) => updateField("consentAccepted", event.target.checked)} type="checkbox" />
        <span>Ich bestätige, dass meine Angaben zur Prüfung und Freischaltung des Maklerzugangs verarbeitet werden dürfen.</span>
      </label>
      {error ? <p className="btn-danger" style={{ margin: 0 }}>{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Registrierung wird gesendet..." : "Registrierung absenden"}
      </button>
    </form>
  );
}
