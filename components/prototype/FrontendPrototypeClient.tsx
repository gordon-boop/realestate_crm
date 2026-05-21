"use client";

import dynamic from "next/dynamic";

const FrontendPrototype = dynamic(() => import("./FrontendPrototype"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#E8F5E0", color: "#44005C", fontFamily: "Aptos, Segoe UI, system-ui, sans-serif" }}>
      WohnKapital wird geladen...
    </div>
  )
});

export function FrontendPrototypeClient({ initialRole = "partner" }: { initialRole?: "partner" | "admin" }) {
  return <FrontendPrototype initialRole={initialRole} />;
}
