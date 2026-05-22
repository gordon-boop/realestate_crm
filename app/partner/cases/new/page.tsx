import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { NewCaseForm } from "@/components/NewCaseForm";
import { getCurrentUser } from "@/lib/auth";

export default function NewPartnerCasePage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "partner") redirect("/admin");

  return (
    <AppShell user={user}>
      <div className="toolbar">
        <div>
          <h1 style={{ margin: 0 }}>Neuer Fall</h1>
          <p className="muted">Kunde, Immobilie, Wunschmodell und erste Objektunterlagen erfassen.</p>
        </div>
      </div>
      <NewCaseForm />
    </AppShell>
  );
}
