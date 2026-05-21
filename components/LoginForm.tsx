"use client";

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("admin@demo.local");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Login fehlgeschlagen");
      return;
    }
    window.location.href = payload.redirectTo;
  }

  return (
    <form className="panel panel-pad grid login-card" onSubmit={submit} style={{ maxWidth: 460 }}>
      <div>
        <span className="section-label">Sicherer MVP-Zugang</span>
        <h1 style={{ margin: 0 }}>WohnKapital Maklerportal</h1>
        <p className="muted">Rollenbasierter MVP-Zugang für Admins und Partner.</p>
      </div>
      <label className="field">
        <span>E-Mail</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label className="field">
        <span>Passwort</span>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
      </label>
      {error ? <p className="btn-danger" style={{ margin: 0 }}>{error}</p> : null}
      <button className="btn btn-primary" type="submit">Einloggen</button>
      <p className="muted" style={{ margin: 0 }}>Admin: admin@demo.local | Partner: makler@demo.local | Passwort: demo1234</p>
    </form>
  );
}
