"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import type { User } from "@/lib/domain";
import { hausVorteilDesignTokens } from "@/lib/design/tokens";

type FrontendPrototypeProps = {
  initialRole?: "partner" | "admin";
  initialUser?: User;
  initialCaseId?: string | null;
  initialTab?: string;
  initialReturnTab?: string;
  initialReturnUrl?: string;
  initialScreen?: string;
  initialLeadCreate?: boolean;
  initialPartnerId?: string | null;
};

const FrontendPrototype = dynamic(
  () => import("./FrontendPrototype") as Promise<{ default: ComponentType<FrontendPrototypeProps> }>,
  {
  ssr: false,
  loading: () => <PrototypeLoading />
});

function PrototypeLoading() {
  const t = useTranslations("common.feedback");
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: hausVorteilDesignTokens.color.background, color: hausVorteilDesignTokens.color.primary, fontFamily: "Inter, Aptos, Segoe UI, system-ui, sans-serif" }}>
      {t("crmLoading")}
    </div>
  );
}

export function FrontendPrototypeClient({
  initialRole = "partner",
  initialUser,
  initialCaseId,
  initialTab,
  initialReturnTab,
  initialReturnUrl,
  initialScreen,
  initialLeadCreate,
  initialPartnerId
}: FrontendPrototypeProps) {
  return (
    <FrontendPrototype
      initialRole={initialRole}
      initialUser={initialUser}
      initialCaseId={initialCaseId}
      initialTab={initialTab}
      initialReturnTab={initialReturnTab}
      initialReturnUrl={initialReturnUrl}
      initialScreen={initialScreen}
      initialLeadCreate={initialLeadCreate}
      initialPartnerId={initialPartnerId}
    />
  );
}
