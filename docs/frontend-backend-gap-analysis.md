# Frontend/Backend-Abgleich: WohnKapital Prototyp

Quelle: `docs/frontend-source-wohnkapital-prototyp.jsx`

## Neue bzw. fehlende Felder aus dem Frontend

- Fallliste: `caseNumber` (`WK-2026-014`), `objectTitle`, `lastActivityLabel`, `lastActivityAt`, `ageAtSubmission`.
- Kunde: zusammengeführter Anzeigename (`displayName`), freie Adresszeile (`addressText`), berechnetes Alter bei Einreichung.
- Immobilie: feinere Objekttypen `single_family`, `semi_detached`, `row_house`; getrennte Ausschlusskriterien `leasehold` und `monumentProtection`.
- Dokumente: Anzeigename, Pflichtgrad, Dokumentstatus, Fehlgrund, Prüfbenutzer und Prüfzeitpunkt.
- Bewertung: Lifecycle-Status, Quelllabel, Start-/Abschlusszeitpunkt und Fehlermeldung.
- Angebot: Angebotsart `indicative`/`binding`, verbindlicher Angebotstext und Gültigkeit.
- Aktivität: Version, Quelle, bezogene Entität, Metadaten und Snapshot-Historie.

## Neue Status, Dokumenttypen und Workflow-Zustände

- Der Prototyp nutzt zusätzlich zum Pflichtenheft den Case-Status `SOLD` für verkaufte Fälle.
- Dokumentstatus aus dem Prototyp: `ok`, `missing`; ergänzt für Workflow-Fähigkeit: `pending`, `review_required`, `rejected`.
- Dokumentpflichtgrade: `required`, `optional`, `recommended`.
- Wiedervorlagen/Rückfragen sind nicht nur Property-Flags, sondern persistente `Reminder` mit `open`, `done`, `overdue`, `cancelled`.
- Angebotsworkflow unterscheidet fachlich zwischen indikativem Angebot (`Ind. AG`) und verbindlichem Angebot (`Verb. AG`).

## Neue Beziehungen

- `Property -> Reminder[]`
- `Document -> reviewedByUser`
- `Activity -> ActivityVersion[]`
- `Reminder -> Property`, `Reminder -> createdByUser`, `Reminder -> assignedToUser`, `Reminder -> completedByUser`
- `Offer -> Valuation` bleibt erhalten, wird aber über `kind` für indikativ/verbindlich erweitert.

## Umgesetzte Architekturentscheidung

Bestehende Felder bleiben erhalten. Wo der Prototyp präziser ist, wurden additive Felder ergänzt, damit vorhandene API- und UI-Funktionen weiterlaufen. Die alte Property-Follow-up-Struktur bleibt als schneller Status erhalten, die neue persistente Wahrheit für Rückfragen ist aber `Reminder`. Aktivitäten werden auf Erstellung versioniert und können später auch bei Änderungen fortgeschrieben werden.
