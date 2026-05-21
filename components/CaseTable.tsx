import Link from "next/link";
import type { CaseView } from "@/lib/domain";
import { Money } from "./Money";
import { StatusBadge } from "./StatusBadge";

export function CaseTable({ cases, basePath }: { cases: CaseView[]; basePath: "/partner/cases" | "/admin/cases" }) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>Kunde</th>
            <th>Objekt</th>
            <th>Partner</th>
            <th>Status</th>
            <th>Marktwert</th>
            <th>Auszahlung</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.property.id}>
              <td>
                <strong>{item.customer.firstName} {item.customer.lastName}</strong>
                <div className="muted">{item.property.caseNumber ?? item.property.id} | {item.customer.ageAtSubmission ? `${item.customer.ageAtSubmission} Jahre` : item.customer.email ?? item.customer.phone ?? "Kontakt offen"}</div>
              </td>
              <td>
                <strong>{item.property.objectTitle ?? `${item.property.street}, ${item.property.city}`}</strong>
                <div className="muted">{item.property.livingAreaSqm} qm Wfl | {item.property.propertyType} | {item.property.lastActivityLabel ?? `${item.property.desiredResidentialRightYears ?? "-"} Jahre`}</div>
              </td>
              <td>{item.partner.companyName}</td>
              <td><StatusBadge status={item.property.status} /></td>
              <td><Money value={item.valuation?.marketValue} /></td>
              <td><Money value={item.offer?.payoutAmount} /></td>
              <td><Link className="btn" href={`${basePath}/${item.property.id}`}>Öffnen</Link></td>
            </tr>
          ))}
          {cases.length === 0 ? (
            <tr>
              <td colSpan={7} className="muted">Keine Fälle vorhanden.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
