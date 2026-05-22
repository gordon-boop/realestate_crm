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
    <form className="panel panel-pad grid login-card" onSubmit={submit}>
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
      <p className="login-demo-note">
        Demo: admin@demo.local / demo1234<br />
        Partner: makler@demo.local / demo1234
      </p>
    </form>
  );
}
