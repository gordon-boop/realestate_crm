import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CaseProcessActions } from "@/components/CaseProcessActions";
import { DocumentPreviewList } from "@/components/DocumentPreviewList";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { Money } from "@/components/Money";
import { StatusBadge } from "@/components/StatusBadge";
import { canSeeProperty } from "@/lib/access-control";
import { getCurrentUser } from "@/lib/auth";
import { getRequiredDocumentsForPropertyType } from "@/lib/document-requirements";
import { getDbCaseByPropertyId } from "@/lib/persistence";
import { formatHeatingLabel } from "@/lib/property-labels";

export default async function PartnerCasePage({ params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  const caseView = await getDbCaseByPropertyId(params.id);
  if (!caseView || !canSeeProperty(user, caseView.property)) redirect("/partner");
  const requiredDocumentRows = getRequiredDocumentsForPropertyType(caseView.property.propertyType).map((requirement) => {
    const document = caseView.documents.find((item) => item.category === requirement.category);
    return { requirement, document };
  });

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
          {caseView.customer.spouseFirstName || caseView.customer.spouseLastName ? (
            <p className="muted">Kunde 2: {caseView.customer.spouseFirstName ?? ""} {caseView.customer.spouseLastName ?? ""} | Eigentümer: {caseView.customer.propertyOwnership ?? "-"}</p>
          ) : null}
          <p className="muted">Einwilligung: {caseView.customer.consentDataProcessing ? "ja" : "nein"}</p>
        </section>
        <section className="panel panel-pad">
          <h2>Objektdaten</h2>
          <p>{caseView.property.propertyType} | Optik {caseView.property.visualConditionRating ?? "-"} | {caseView.property.livingAreaSqm} qm Wfl | {caseView.property.plotAreaSqm ?? "-"} qm Grundstück</p>
          <p className="muted">Modell: {caseView.property.desiredModel === "sale_and_leaseback" ? "Rückmiete" : "Befristetes Wohnrecht"} | Wohnrecht: {caseView.property.desiredResidentialRightYears ?? "-"} Jahre</p>
          <p className="muted">Heizung: {formatHeatingLabel(caseView.property)}</p>
          <p className="muted">{caseView.property.generalPropertyNotes ?? caseView.property.notes ?? "Keine Notizen"}</p>
        </section>
      </div>

      <div style={{ marginTop: 16 }}>
        <CaseProcessActions propertyId={caseView.property.id} offer={caseView.offer} />
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="panel panel-pad">
          <h2>Objektunterlagen</h2>
          <h3>Pflichtdokumente</h3>
          <DocumentUploadForm propertyId={caseView.property.id} propertyType={caseView.property.propertyType} />
          {requiredDocumentRows.map(({ requirement, document }) => (
            <p key={requirement.category}>
              <strong>{requirement.label}</strong><br />
              <span className="muted">
                {document ? `${document.status} | ${document.displayName ?? document.fileName}` : "fehlt"}
                {requirement.note ? ` | ${requirement.note}` : ""}
                {document?.missingReason ? ` | ${document.missingReason}` : ""}
              </span>
            </p>
          ))}
          <h3>Hochgeladene Unterlagen</h3>
          <DocumentPreviewList propertyId={caseView.property.id} documents={caseView.documents} />
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
