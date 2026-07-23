"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function LogoutBox() {
  const t = useTranslations("common.buttons");
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
      {busy ? t("loggingOut") : t("logout")}
    </button>
  );
}
