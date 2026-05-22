"use client";

import { useState } from "react";

export function LogoutBox() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      window.location.replace(payload.redirectTo ?? "/login");
    } catch {
      window.location.replace("/login");
    }
  }

  return (
    <button className="logout-box" disabled={busy} onClick={logout} type="button">
      {busy ? "Abmelden ..." : "Logout"}
    </button>
  );
}
