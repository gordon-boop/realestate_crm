import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CaseProcessActions } from "@/components/CaseProcessActions";
import { Money } from "@/components/Money";
import { StatusBadge } from "@/components/StatusBadge";
import { canSeeProperty } from "@/lib/access-control";
import { getCurrentUser } from "@/lib/auth";
import { getCaseByPropertyId } from "@/lib/store";

export default function PartnerCasePage({ params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) redirect("/");
  const caseView = getCaseByPropertyId(params.id);
  if (!caseView || !canSeeProperty(user, caseView.property)) redirect("/partner");

  return (
    <AppShell user={user}>
      <div className="toolbar">
        <div>
          <h1 style={{ margin: 0 }}>{caseView.customer.firstName} {caseView.customer.lastName}</h1>
          <p className="muted">{caseView.property.caseNumber ?? caseView.property.id} | {caseView.property.objectTitle ?? `${caseView.property.street}, ${caseView.property.postalCode} ${caseView.property.city}`}</p>
        </div>
        <Link className="btn" href="/partner">Zurück</Link>
      </div>

      <div className="grid three">
        <div className="panel panel-pad metric"><span>Status</span><strong><StatusBadge status={caseView.property.status} /></strong></div>
        <div className="panel panel-pad metric"><span>Marktwert</span><strong><Money value={caseView.valuation?.marketValue} /></strong></div>
        <div className="panel panel-pad metric"><span>Indikative Auszahlung</span><strong><Money value={caseView.offer?.payoutAmount} /></strong></div>
      </div>

      {caseView.property.followUpRequired ? (
        <section className="panel panel-pad" style={{ marginTop: 16, borderColor: "var(--accent)" }}>
          <h2 style={{ marginTop: 0 }}>Rückfrage offen</h2>
          <p>{caseView.property.followUpReason}</p>
          <p className="muted">Wiedervorlagen: {caseView.reminders.filter((item) => item.status === "open").length} offen. Bitte Kundenrückmeldung einholen und danach als erhalten markieren.</p>
        </section>
      ) : caseView.property.customerFeedbackReceivedAt ? (
        <section className="panel panel-pad" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Kundenrückmeldung eingegangen</h2>
          <p className="muted">Keine weitere Rückmeldung erforderlich.</p>
        </section>
      ) : null}

      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel panel-pad">
          <h2>Kundendaten</h2>
          <p>{caseView.customer.email ?? "-"}<br />{caseView.customer.phone ?? "-"}<br />{caseView.customer.mobile ?? "-"}</p>
          <p className="muted">{caseView.customer.maritalStatus ?? "Familienstand offen"} | {caseView.customer.monthlyIncomeRange ?? "Einkommen offen"}</p>
          <p className="muted">Einwilligung: {caseView.customer.consentDataProcessing ? "ja" : "nein"}</p>
        </section>
        <section className="panel panel-pad">
          <h2>Objektdaten</h2>
          <p>{caseView.property.propertyType} | {caseView.property.condition} | {caseView.property.livingAreaSqm} qm Wfl | {caseView.property.plotAreaSqm ?? "-"} qm Grundstück</p>
          <p className="muted">Wohnrecht: {caseView.property.residentialRightRecipients ?? "-"} | {caseView.property.desiredResidentialRightYears ?? "-"} Jahre</p>
          <p className="muted">{caseView.property.notes ?? "Keine Notizen"}</p>
        </section>
      </div>

      <div style={{ marginTop: 16 }}>
        <CaseProcessActions propertyId={caseView.property.id} offer={caseView.offer} />
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel panel-pad">
          <h2>Uploads</h2>
          {caseView.documents.map((document) => (
            <p key={document.id}>
              <strong>{document.displayName ?? document.fileName}</strong><br />
              <span className="muted">{document.requirementLevel} | {document.status}{document.missingReason ? ` | ${document.missingReason}` : ""}</span>
            </p>
          ))}
          {caseView.documents.length === 0 ? <p className="muted">Noch keine Uploads.</p> : null}
        </section>
        <section className="panel panel-pad">
          <h2>Angebotsstatus</h2>
          <p>Status: {caseView.offer?.status ?? "noch kein Angebot"}</p>
          <p className="muted">{caseView.offer?.aiPartnerSummary ?? "Noch kein KI-Entwurf."}</p>
        </section>
      </div>
    </AppShell>
  );
}
