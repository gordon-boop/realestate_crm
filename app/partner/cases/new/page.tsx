import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/AppShell";
import { NewCaseForm } from "@/components/NewCaseForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewPartnerCasePage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "partner") redirect("/admin");
  const t = await getTranslations("customers.intake");

  return (
    <AppShell user={user}>
      <div className="toolbar">
        <div>
          <h1 style={{ margin: 0 }}>{t("standalone.pageTitle")}</h1>
          <p className="muted">{t("standalone.pageSubtitle")}</p>
        </div>
      </div>
      <NewCaseForm />
    </AppShell>
  );
}
