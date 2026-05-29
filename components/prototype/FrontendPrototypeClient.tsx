"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { User } from "@/lib/domain";

type FrontendPrototypeProps = {
  initialRole?: "partner" | "admin";
  initialUser?: User;
  initialCaseId?: string | null;
  initialTab?: string;
  initialReturnTab?: string;
  initialScreen?: string;
  initialLeadCreate?: boolean;
};

const FrontendPrototype = dynamic(
  () => import("./FrontendPrototype") as Promise<{ default: ComponentType<FrontendPrototypeProps> }>,
  {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#E8F5E0", color: "#44005C", fontFamily: "Aptos, Segoe UI, system-ui, sans-serif" }}>
      WohnKapital wird geladen...
    </div>
  )
});

export function FrontendPrototypeClient({
  initialRole = "partner",
  initialUser,
  initialCaseId,
  initialTab,
  initialReturnTab,
  initialScreen,
  initialLeadCreate
}: FrontendPrototypeProps) {
  return (
    <FrontendPrototype
      initialRole={initialRole}
      initialUser={initialUser}
      initialCaseId={initialCaseId}
      initialTab={initialTab}
      initialReturnTab={initialReturnTab}
      initialScreen={initialScreen}
      initialLeadCreate={initialLeadCreate}
    />
  );
}
