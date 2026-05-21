"use client";

import { useState } from "react";

export function LogoutBox() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button className="logout-box" disabled={busy} onClick={logout} type="button">
      {busy ? "Abmelden ..." : "Logout"}
    </button>
  );
}
