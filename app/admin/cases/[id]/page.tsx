import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ActivityNoteForm } from "@/components/ActivityNoteForm";
import { CaseProcessActions } from "@/components/CaseProcessActions";
import { Money } from "@/components/Money";
import { StatusBadge } from "@/components/StatusBadge";
import { getCurrentUser } from "@/lib/auth";
import { getCaseByPropertyId, store } from "@/lib/store";

export default function AdminCasePage({ params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") redirect("/partner");
  const caseView = getCaseByPropertyId(params.id);
  if (!caseView) redirect("/admin");
  const versions = caseView.offer ? store.offerVersions.filter((item) => item.offerId === caseView.offer?.id) : [];

  return (
    <AppShell user={user}>
      <div className="toolbar">
        <div>
          <h1 style={{ margin: 0 }}>Admin-Fallansicht</h1>
          <p className="muted">{caseView.property.caseNumber ?? caseView.property.id} | {caseView.partner.companyName} | {caseView.customer.firstName} {caseView.customer.lastName}</p>
        </div>
        <Link className="btn" href="/admin">Zurück</Link>
      </div>

      <div className="grid three">
        <div className="panel panel-pad metric"><span>Status</span><strong><StatusBadge status={caseView.property.status} /></strong></div>
        <div className="panel panel-pad metric"><span>Marktwert</span><strong><Money value={caseView.valuation?.marketValue} /></strong></div>
        <div className="panel panel-pad metric"><span>Auszahlung</span><strong><Money value={caseView.offer?.payoutAmount} /></strong></div>
      </div>

      {caseView.property.followUpRequired ? (
        <section className="panel panel-pad" style={{ marginTop: 16, borderColor: "var(--accent)" }}>
          <h2 style={{ marginTop: 0 }}>Rückfrage offen</h2>
          <p>{caseView.property.followUpReason}</p>
          <p className="muted">Fällig bis: {caseView.property.followUpDueAt ? new Date(caseView.property.followUpDueAt).toLocaleDateString("de-DE") : "-"} | {caseView.reminders.filter((item) => item.status === "open").length} Wiedervorlage(n) offen</p>
        </section>
      ) : caseView.property.customerFeedbackReceivedAt ? (
        <section className="panel panel-pad" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Kundenrückmeldung eingegangen</h2>
          <p className="muted">Keine weitere Rückmeldung erforderlich.</p>
        </section>
      ) : null}

      <div className="panel panel-pad" style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Kunde", "Objekt", "Ind. AG", "Verb. AG", "Doks", "Aufgaben", "Konditionen / Vertragsdaten", "NK", "Instandh.", "Notizen"].map((tab) => (
          <span className="badge" key={tab}>{tab}</span>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <CaseProcessActions propertyId={caseView.property.id} offer={caseView.offer} admin />
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel panel-pad">
          <h2>Kunde</h2>
          <p>{caseView.customer.displayName ?? `${caseView.customer.firstName} ${caseView.customer.lastName}`}</p>
          <p className="muted">{caseView.customer.gender ?? "Geschlecht offen"} | {caseView.customer.maritalStatus ?? "Familienstand offen"} | {caseView.customer.monthlyIncomeRange ?? "Einkommen offen"}</p>
        </section>
        <section className="panel panel-pad">
          <h2>Objekt</h2>
          <p>{caseView.property.objectTitle ?? caseView.property.propertyType} | {caseView.property.livingAreaSqm} qm Wfl | {caseView.property.plotAreaSqm ?? "-"} qm Grundstück</p>
          <p className="muted">Objektnummer {caseView.property.caseNumber ?? caseView.property.id} | Erbbaurecht: {caseView.property.leasehold ? "ja" : "nein"} | Denkmalschutz: {caseView.property.monumentProtection ? "ja" : "nein"}</p>
        </section>
        <section className="panel panel-pad">
          <h2>Bewertung</h2>
          {caseView.valuation ? (
            <>
              <p>Wertspanne: <Money value={caseView.valuation.valueMin} /> bis <Money value={caseView.valuation.valueMax} /></p>
              <p className="muted">Provider: {caseView.valuation.provider} | Status: {caseView.valuation.status} | Confidence: {caseView.valuation.confidenceScore}</p>
            </>
          ) : <p className="muted">Noch keine Bewertung.</p>}
        </section>
        <section className="panel panel-pad">
          <h2>Angebotsrechnung</h2>
          {caseView.offer ? (
            <>
              <p>Adjusted Market Value: <Money value={caseView.offer.adjustedMarketValue} /></p>
              <p>Wohnrechtswert: <Money value={caseView.offer.residentialRightValue} /></p>
              <p>Risikoabschlag: <Money value={caseView.offer.riskDiscount} /></p>
              <p>Zielmarge: <Money value={caseView.offer.companyMargin} /></p>
              <p className="muted">Version {caseView.offer.currentVersion} | {versions.length} gespeicherte Snapshots</p>
              <p className="muted">Kalkulation: {caseView.property.offerCalculationSource ?? "application"}</p>
            </>
          ) : <p className="muted">Noch kein Angebot.</p>}
        </section>
      </div>

      <section className="panel panel-pad" style={{ marginTop: 16 }}>
        <h2>Dokumente und Wiedervorlagen</h2>
        <div className="grid two">
          <div>
            {caseView.documents.map((document) => (
              <p key={document.id}>
                <strong>{document.displayName ?? document.fileName}</strong><br />
                <span className="muted">{document.requirementLevel} | {document.status}{document.missingReason ? ` | ${document.missingReason}` : ""}</span>
              </p>
            ))}
            {caseView.documents.length === 0 ? <p className="muted">Noch keine Dokumente.</p> : null}
          </div>
          <div>
            {caseView.reminders.map((reminder) => (
              <p key={reminder.id}>
                <strong>{reminder.status}</strong>: {reminder.reason}<br />
                <span className="muted">Fällig {new Date(reminder.dueAt).toLocaleDateString("de-DE")}</span>
              </p>
            ))}
            {caseView.reminders.length === 0 ? <p className="muted">Keine Wiedervorlagen.</p> : null}
          </div>
        </div>
      </section>

      <section className="panel panel-pad" style={{ marginTop: 16 }}>
        <h2>KI-Text</h2>
        <p>{caseView.offer?.aiCustomerText ?? "Noch kein Kundenanschreiben."}</p>
        <p className="muted">{caseView.offer?.aiInternalRationale ?? "Noch keine interne Begründung."}</p>
      </section>

      <section className="panel panel-pad" style={{ marginTop: 16 }}>
        <h2>Aktivitäten</h2>
        <ActivityNoteForm propertyId={caseView.property.id} />
        {caseView.activities.map((activity) => (
          <p key={activity.id}><strong>{activity.type}</strong>: {activity.message}<br /><span className="muted">Version {activity.version} | Quelle {activity.source}</span></p>
        ))}
      </section>
    </AppShell>
  );
}
