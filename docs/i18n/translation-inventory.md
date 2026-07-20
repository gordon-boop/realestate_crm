# WohnKapital CRM: Übersetzungsinventar Deutsch → Englisch

Stand: 20.07.2026

## Erfassungsmethode und Umfang

Durchsucht wurden `app/`, `components/`, `lib/`, `prisma/` und `scripts/` einschließlich API-Meldungen, Validierung, Seed-/Bootstrap-Inhalten, Rating-Konfiguration, Activity Logs, PDF-/E-Mail-Texten, Dialogen, Tooltips, Dropdownwerten und leeren Zuständen.

Die statische Quelltextanalyse hat **1.727 eindeutige deutschsprachige Textkandidaten in 97 Dateien** ermittelt. Das Inventar führt wiederkehrende Labels, grammatische Varianten und dynamische Texte als kanonische Übersetzungseinheiten zusammen. Platzhalter werden als `{…}` dargestellt. Technische Routen, Enum-Werte, CSS, Dateinamen und reine Test-Assertions zählen nicht als sichtbare Texte.

Die größte Textkonzentration liegt in:

1. `components/prototype/FrontendPrototype.tsx`
2. `prisma/seed.ts`
3. `components/NewCaseForm.tsx`
4. `lib/object-rating.ts`
5. `lib/site-content.ts`
6. `lib/validation.ts`
7. `lib/acquisition-precheck.ts`
8. `lib/persistence.ts`
9. `lib/case-submission-validation.ts`
10. `lib/pdf-generator.ts`

## Navigation, Rollen und globale UI

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Intern · CRM | Internal · CRM | Kopfzeile | `components/prototype/FrontendPrototype.tsx` | nein |
| Zur Makleransicht | Switch to Broker View | Kopfzeile | `components/prototype/FrontendPrototype.tsx` | nein |
| Zur Adminansicht | Switch to Admin View | Kopfzeile | `components/prototype/FrontendPrototype.tsx` | nein |
| Fall, Kunde oder Adresse suchen... | Search by case, customer or address... | Globale Suche | `components/prototype/FrontendPrototype.tsx` | nein |
| Suche… | Searching… | Globale Suche | `components/prototype/FrontendPrototype.tsx` | nein |
| Keine Treffer gefunden | No Results Found | Globale Suche | `components/prototype/FrontendPrototype.tsx` | nein |
| Home | Home | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Leads | Leads | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Entwürfe | Drafts | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| In Bearbeitung | In Progress | Navigation/Status | `components/prototype/FrontendPrototype.tsx`, `lib/property-labels.ts` | nein |
| Bestand | Portfolio | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Verkauft | Sold | Navigation/Status | `components/prototype/FrontendPrototype.tsx`, `lib/property-labels.ts` | nein |
| Abgelehnt | Rejected | Navigation/Status | `components/prototype/FrontendPrototype.tsx`, `lib/property-labels.ts` | nein |
| Partner | Partners | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Mitarbeiter | Staff | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Sonstiges | Other | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Wissen | Resources | Navigation | `components/prototype/FrontendPrototype.tsx` | ja |
| Broschüre | Brochure | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Postbank Wohnatlas | Postbank Housing Atlas | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| FAQs | FAQs | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Schnellfunktionen | Quick Actions | Navigation | `components/prototype/FrontendPrototype.tsx` | nein |
| Neuer Lead | New Lead | Schnellfunktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Neukunde erfassen | Add New Customer | Schnellfunktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Wiedervorlage anlegen | Create Follow-Up | Schnellfunktion | `components/prototype/FrontendPrototype.tsx` | ja |
| Reparatur erfassen | Record Repair | Schnellfunktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Abrechnung erfassen | Record Statement | Schnellfunktion | `components/prototype/FrontendPrototype.tsx` | ja |
| Bewohneranfrage erfassen | Record Resident Request | Schnellfunktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Noch nicht verfügbar | Not Yet Available | Deaktivierte Aktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Logout | Log Out | Kopfzeile | `components/LogoutBox.tsx`, `components/prototype/FrontendPrototype.tsx` | nein |

## Dashboard und Arbeitskörbe

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Ankaufsübersicht | Acquisition Overview | Dashboardtitel | `components/prototype/FrontendPrototype.tsx` | nein |
| Leads, Einreichungen und laufende Ankäufe nach Handlungsbedarf. | Leads, submissions and active acquisitions by required action. | Dashboarduntertitel | `components/prototype/FrontendPrototype.tsx` | nein |
| Neue Leads | New Leads | Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | nein |
| Leads prüfen | Review Leads | Arbeitskorbaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Neue Einreichungen | New Submissions | Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | nein |
| Einreichungen prüfen | Review Submissions | Arbeitskorbaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Im Ankaufsprozess | In Acquisition Process | Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | nein |
| Ankäufe bearbeiten | Process Acquisitions | Arbeitskorbaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Themen öffnen | Open Items | Arbeitskorbaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Neueste Einreichungen | Latest Submissions | Listenüberschrift | `components/prototype/FrontendPrototype.tsx` | nein |
| Alle Vorgänge | All Cases | Listenüberschrift | `components/prototype/FrontendPrototype.tsx` | nein |
| Keine Vorgänge in diesem Arbeitskorb. | No Cases in This Work Queue. | Leerer Zustand | `components/prototype/FrontendPrototype.tsx` | nein |
| Arbeitsliste nach Handlungsbedarf sortiert. Erst hier öffnest du konkrete Vorgänge. | Worklist sorted by required action. Open individual cases from this list. | Hilfetext | `components/prototype/FrontendPrototype.tsx` | nein |
| Fall / Lead | Case / Lead | Tabellenspalte | `components/prototype/FrontendPrototype.tsx` | nein |
| Kunde | Customer | Tabellenspalte | `components/prototype/FrontendPrototype.tsx` | nein |
| Herkunft | Source | Tabellenspalte | `components/prototype/FrontendPrototype.tsx` | nein |
| Objekt | Property | Tabellenspalte | `components/prototype/FrontendPrototype.tsx` | nein |
| Nächster Schritt | Next Step | Tabellenspalte | `components/prototype/FrontendPrototype.tsx` | nein |
| Status | Status | Tabellenspalte | mehrere Komponenten | nein |
| Öffnen | Open | Tabellenaktion | mehrere Komponenten | nein |
| Dringende Aufgaben | Urgent Tasks | Dashboard | `components/prototype/FrontendPrototype.tsx` | nein |
| Nächste Fristen | Upcoming Due Dates | Dashboard | `components/prototype/FrontendPrototype.tsx` | nein |
| Eingereichte Objekte | Submitted Properties | Kartenbereich | `components/dashboard/PropertyMapWidget.tsx` | nein |
| Objekte sichtbar | Properties Visible | Kartenbereich | `components/dashboard/PropertyMapWidget.tsx` | nein |
| Position: ungefähr (PLZ-Region) | Approximate location (postal-code area) | Karten-Tooltip | `components/dashboard/PropertyMapWidget.tsx` | nein |
| Kaufvertragsabwicklung | Purchase Agreement & Closing | Bestand-Dashboard | `components/prototype/FrontendPrototype.tsx` | ja |
| Von angenommenem Angebot bis Bestandsübernahme. | From accepted offer to transfer to portfolio. | Arbeitskorbbeschreibung | `components/prototype/FrontendPrototype.tsx` | nein |
| Abwicklung prüfen | Review Closing | Arbeitskorbaktion | `components/prototype/FrontendPrototype.tsx` | ja |
| Bestandsverwaltung | Portfolio Management | Arbeitskorb/Reiter | `components/prototype/FrontendPrototype.tsx` | nein |
| Bewohner, Reparaturen, Abrechnungen und laufende Verwaltung. | Residents, repairs, statements and ongoing management. | Arbeitskorbbeschreibung | `components/prototype/FrontendPrototype.tsx` | ja |
| Bestand prüfen | Review Portfolio | Arbeitskorbaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Verkaufsprozess | Sales Process | Arbeitskorb/Reiter | `components/prototype/FrontendPrototype.tsx` | nein |
| Nach Wohnrechtsende oder Ende des Rückmietverkaufs: Zugang, Vorbereitung, Vermarktung und Verkauf. | After the Right of Residence or Sale and Rent-Back ends: access, preparation, marketing for sale and disposal. | Arbeitskorbbeschreibung | `components/prototype/FrontendPrototype.tsx` | ja |
| Verkauf prüfen | Review Sales Process | Arbeitskorbaktion | `components/prototype/FrontendPrototype.tsx` | nein |

## Lead-, Partner- und Kundenstrecke

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Lead erfassen | Add Lead | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Dieser Interessent ist noch kein Kundenfall. Nach Prüfung kann der Lead einem Makler zugewiesen oder in einen Kundenfall umgewandelt werden. | This prospect is not yet a customer case. After review, the lead can be assigned to a broker or converted into a customer case. | Leadformular-Hinweis | `components/prototype/FrontendPrototype.tsx` | nein |
| Interessent | Prospect | Formularabschnitt | `components/prototype/FrontendPrototype.tsx` | nein |
| Vorname | First Name | Formular | mehrere Komponenten | nein |
| Nachname | Last Name | Formular | mehrere Komponenten | nein |
| Telefon | Phone | Formular | mehrere Komponenten | nein |
| Mobil | Mobile Phone | Formular | mehrere Komponenten | nein |
| E-Mail | Email | Formular | mehrere Komponenten | nein |
| Straße | Street | Formular | mehrere Komponenten | nein |
| Hausnummer | House Number | Formular | mehrere Komponenten | nein |
| PLZ | Postal Code | Formular | mehrere Komponenten | nein |
| Ort | City | Formular | mehrere Komponenten | nein |
| Bundesland | Federal State | Formular | `components/prototype/FrontendPrototype.tsx` | nein |
| Bevorzugte Kontaktart | Preferred Contact Method | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Einwilligung zur Kontaktaufnahme | Consent to Be Contacted | Leadformular | `components/prototype/FrontendPrototype.tsx` | ja |
| Notiz zum Gespräch | Call Notes | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Objekt, soweit bekannt | Property, if Known | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Lead-Quelle | Lead Source | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Telefonisch | Phone | Leadquelle | `components/prototype/FrontendPrototype.tsx` | nein |
| Website | Website | Leadquelle | `components/prototype/FrontendPrototype.tsx` | nein |
| Empfehlung | Referral | Leadquelle | `components/prototype/FrontendPrototype.tsx` | nein |
| Routing | Routing | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Region / Tätigkeitsgebiet | Region / Territory | Partner-/Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Zuständiger Partner / Makler | Responsible Partner / Broker | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Routing-Grund | Reason for Assignment | Leadformular | `components/prototype/FrontendPrototype.tsx` | nein |
| An Makler weiterleiten | Assign to Broker | Leadaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Als kontaktiert markieren | Mark as Contacted | Leadaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| In Kundenfall umwandeln | Convert to Customer Case | Leadaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Neu | New | Leadstatus | `components/prototype/FrontendPrototype.tsx`, `lib/domain.ts` | nein |
| In Prüfung | Under Review | Leadstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| An Makler weitergeleitet | Assigned to Broker | Leadstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| Kontakt durch Makler offen | Broker Contact Pending | Leadstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| In Kundenfall umgewandelt | Converted to Customer Case | Leadstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| Geschlossen | Closed | Leadstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| Hallo {…} | Hello {…} | Maklerdashboard | `components/prototype/FrontendPrototype.tsx` | nein |
| Neue Anfragen prüfen und bei Interesse als Kundenfall übernehmen. | Review new enquiries and convert suitable leads into customer cases. | Makler-Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | nein |
| Rückfragen / fehlende Unterlagen | Queries / Missing Documents | Makler-Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | nein |
| Offene Rückfragen, fehlende Pflichtunterlagen oder Wiedervorlagen bearbeiten. | Resolve open queries, missing required documents or follow-ups. | Makler-Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | ja |
| Angebote nachfassen | Follow Up on Offers | Makler-Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | nein |
| Freigegebene oder versendete Angebote beim Kunden nachhalten. | Follow up with customers on approved or sent offers. | Makler-Arbeitskorb | `components/prototype/FrontendPrototype.tsx` | nein |
| Aktive Fälle | Active Cases | Maklerliste | `components/prototype/FrontendPrototype.tsx` | nein |
| Fall oder Kunde suchen | Search by Case or Customer | Maklersuche | `components/prototype/FrontendPrototype.tsx` | nein |
| Alle Fälle anzeigen | View All Cases | Maklerliste | `components/prototype/FrontendPrototype.tsx` | nein |
| Partner anlegen | Add Partner | Partnerverwaltung | `components/prototype/FrontendPrototype.tsx` | nein |
| Partner bearbeiten | Edit Partner | Partnerverwaltung | `components/prototype/FrontendPrototype.tsx` | nein |
| Partner wurde angelegt. | Partner Created. | Erfolgsmeldung | `components/prototype/FrontendPrototype.tsx` | nein |
| Partner wurde aktualisiert. | Partner Updated. | Erfolgsmeldung | `components/prototype/FrontendPrototype.tsx` | nein |
| Für diesen Partner ist noch kein Login-Nutzer angelegt. | No Login User Has Been Created for This Partner Yet. | Partnerdetail | `components/prototype/FrontendPrototype.tsx` | nein |
| Keine Leads zugewiesen. | No Leads Assigned. | Partnerdetail | `components/prototype/FrontendPrototype.tsx` | nein |
| Keine Fälle vorhanden. | No Cases Available. | Partnerdetail | `components/prototype/FrontendPrototype.tsx` | nein |

## Kundenerfassung, Entwurf und Dokumente

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Persönliche Daten | Personal Details | Erfassungsbogen | `components/prototype/FrontendPrototype.tsx`, `components/NewCaseForm.tsx` | nein |
| Wunschmodell | Preferred Model | Erfassungsbogen | `components/prototype/FrontendPrototype.tsx` | nein |
| Immobiliendaten | Property Details | Erfassungsbogen | `components/prototype/FrontendPrototype.tsx` | nein |
| Modernisierungen | Modernisations | Erfassungsbogen | `components/prototype/FrontendPrototype.tsx` | nein |
| Dokumente | Documents | Erfassungsbogen | mehrere Komponenten | nein |
| Erfassung ergänzen | Complete Intake | Erfassungsbogen | `components/prototype/FrontendPrototype.tsx` | nein |
| Änderungen speichern | Save Changes | Formularfooter | mehrere Komponenten | nein |
| Entwurf speichern | Save Draft | Erfassungsbogen | `components/prototype/FrontendPrototype.tsx` | nein |
| Noch nicht gespeichert | Not Yet Saved | Speicherstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| Änderungen werden gespeichert … | Saving Changes… | Speicherstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| Entwurf gespeichert um {…} Uhr | Draft Saved at {…} | Speicherstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| Speichern fehlgeschlagen | Save Failed | Speicherstatus | `components/prototype/FrontendPrototype.tsx` | nein |
| Ungespeicherte Änderungen | Unsaved Changes | Verlassen-Dialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Sie haben Änderungen vorgenommen, die noch nicht gespeichert wurden. Möchten Sie den Entwurf speichern, bevor Sie die Seite verlassen? | You have unsaved changes. Would you like to save the draft before leaving this page? | Verlassen-Dialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Auf Seite bleiben | Stay on Page | Verlassen-Dialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Ohne Speichern verlassen | Leave Without Saving | Verlassen-Dialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Entwurf speichern und verlassen | Save Draft and Leave | Verlassen-Dialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Erfassung fortsetzen | Continue Intake | Entwurfsliste | `components/prototype/FrontendPrototype.tsx` | nein |
| Vollständigkeit | Completeness | Entwurfsliste | `components/prototype/FrontendPrototype.tsx` | nein |
| Zuletzt bearbeitet | Last Edited | Entwurfsliste | `components/prototype/FrontendPrototype.tsx` | nein |
| Pflichtfelder | Required Fields | Erfassungsbogen | `components/prototype/FrontendPrototype.tsx` | nein |
| Bitte ergänzen Sie folgende Pflichtfelder: | Please Complete the Following Required Fields: | Einreichvalidierung | `components/prototype/FrontendPrototype.tsx`, `lib/case-submission-validation.ts` | nein |
| Zurück | Back | Navigation | mehrere Komponenten | nein |
| Weiter | Continue | Navigation | mehrere Komponenten | nein |
| Einreichen | Submit | Formularaktion | mehrere Komponenten | nein |
| Titel | Title | Kundendaten | mehrere Komponenten | nein |
| Geschlecht | Gender | Kundendaten | mehrere Komponenten | nein |
| weiblich | Female | Dropdown | mehrere Komponenten | nein |
| männlich | Male | Dropdown | mehrere Komponenten | nein |
| divers | Non-Binary | Dropdown | mehrere Komponenten | ja |
| Geburtsdatum | Date of Birth | Kundendaten | mehrere Komponenten | nein |
| Alter | Age | Kundendaten | mehrere Komponenten | nein |
| Familienstand | Marital Status | Kundendaten | mehrere Komponenten | nein |
| ledig | Single | Dropdown | mehrere Komponenten | nein |
| verheiratet | Married | Dropdown | mehrere Komponenten | nein |
| verwitwet | Widowed | Dropdown | mehrere Komponenten | nein |
| geschieden | Divorced | Dropdown | mehrere Komponenten | nein |
| Monatliche Einkünfte | Monthly Income | Kundendaten | `components/prototype/FrontendPrototype.tsx` | ja |
| Einwilligung zur Datenverarbeitung | Consent to Data Processing | Kundendaten | mehrere Komponenten | ja |
| Immobilientyp | Property Type | Objektdaten | mehrere Komponenten | nein |
| Einfamilienhaus | Detached House | Dropdown | mehrere Komponenten | ja |
| Doppelhaushälfte | Semi-Detached House | Dropdown | mehrere Komponenten | nein |
| Reihenhaus | Terraced House | Dropdown | mehrere Komponenten | ja |
| Eigentumswohnung | Condominium | Dropdown | mehrere Komponenten | ja |
| Baujahr | Year Built | Objektdaten | mehrere Komponenten | nein |
| Wohnfläche | Living Area | Objektdaten | mehrere Komponenten | nein |
| Grundstück | Plot Area | Objektdaten | mehrere Komponenten | nein |
| Nutzfläche | Usable Area | Objektdaten | mehrere Komponenten | nein |
| Technik und Energie | Building Systems and Energy | Objektdaten | `components/prototype/FrontendPrototype.tsx` | nein |
| Heizungsart | Heating System | Objektdaten | mehrere Komponenten | nein |
| Energieträger / Wärmeerzeuger | Energy Source / Heat Generator | Objektdaten | `components/prototype/FrontendPrototype.tsx` | ja |
| Energieausweis vorhanden | Energy Performance Certificate Available | Objektdaten | mehrere Komponenten | nein |
| Energieklasse | Energy Efficiency Class | Objektdaten | mehrere Komponenten | nein |
| Barrierefrei | Barrier-Free | Objektdaten | mehrere Komponenten | nein |
| Teilweise eingeschränkt | Partially Restricted | Zugänglichkeit | mehrere Komponenten | ja |
| Stark eingeschränkt | Severely Restricted | Zugänglichkeit | mehrere Komponenten | ja |
| Sind größere Instandhaltungen oder Sonderumlagen bekannt? | Are Any Major Maintenance Measures or Special Assessments Known? | Zustandsformular | mehrere Komponenten | ja |
| Sind Feuchtigkeit, Schimmel oder Wasserschäden bekannt? | Is Any Moisture, Mould or Water Damage Known? | Zustandsformular | mehrere Komponenten | nein |
| Aufzug vorhanden | Lift Available | Wohnungsdaten | mehrere Komponenten | ja |
| Objektunterlagen | Property Documents | Dokumente | `components/prototype/FrontendPrototype.tsx` | nein |
| Dokument hochladen | Upload Document | Dokumente | mehrere Komponenten | nein |
| Keine Dokumente vorhanden. | No Documents Available. | Leerer Zustand | mehrere Komponenten | nein |
| Grundbuchauszug | Land Register Extract | Dokumentkategorie | `lib/document-requirements.ts`, `lib/pdf-generator.ts` | ja |
| Energieausweis | Energy Performance Certificate | Dokumentkategorie | `lib/document-requirements.ts` | nein |
| Bemaßter Grundriss | Dimensioned Floor Plan | Dokumentkategorie | `lib/document-requirements.ts` | nein |
| Aussagekräftige Objektfotos | Representative Property Photos | Dokumentkategorie | `lib/document-requirements.ts` | nein |
| Teilungserklärung | Declaration of Division | Dokumentkategorie | `lib/document-requirements.ts` | ja |
| Vollmacht Grundbuch | Land Register Authorisation | Dokumentkategorie | `lib/document-requirements.ts` | ja |

## Vorprüfung und Objektrating

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Ankaufsfähigkeit | Acquisition Eligibility | Vorprüfung | `lib/acquisition-precheck.ts`, `components/prototype/FrontendPrototype.tsx` | nein |
| Vorprüfung | Acquisition Pre-Check | Reiter/Bereich | mehrere Dateien | nein |
| Vorläufiger Verkehrswert | Preliminary Market Value | Vorprüfung | `lib/acquisition-precheck.ts` | nein |
| Aktueller Wert | Current Value | Vorprüfung | `lib/acquisition-precheck.ts` | nein |
| Bestanden | Passed | Vorprüfung | `lib/acquisition-precheck.ts` | nein |
| Nicht bestanden | Failed | Vorprüfung | `lib/acquisition-precheck.ts` | nein |
| Nicht erfasst | Not Recorded | Vorprüfung | `lib/acquisition-precheck.ts` | nein |
| Noch nicht bewertet | Not Yet Rated | Vorprüfung/Rating | `lib/acquisition-precheck.ts` | nein |
| Ausschlusskriterien | Knock-Out Criteria | Vorprüfung | `lib/acquisition-precheck.ts` | ja |
| Erbbaurecht | Heritable Building Right | Vorprüfung | mehrere Dateien | ja |
| Denkmalschutz | Listed Building Status | Vorprüfung | mehrere Dateien | ja |
| Bodenrichtwert | Standard Land Value | Vorprüfung | `lib/acquisition-precheck.ts` | ja |
| Restnutzungsdauer | Remaining Useful Life | Vorprüfung | `lib/acquisition-precheck.ts` | nein |
| Ankaufsfähig | Eligible for Acquisition | Ergebnis | `lib/acquisition-precheck.ts` | nein |
| Nicht ankaufsfähig | Not Eligible for Acquisition | Ergebnis | `lib/acquisition-precheck.ts` | nein |
| Ausnahmeprüfung erforderlich | Exception Review Required | Ergebnis | `lib/acquisition-precheck.ts` | nein |
| Alle erfassten Ankaufskriterien sind erfüllt. | All Recorded Acquisition Criteria Are Met. | Ergebnistext | `lib/acquisition-precheck.ts` | nein |
| Objektrating | Property Rating | Reiter/Modul | `lib/object-rating.ts`, `components/prototype/FrontendPrototype.tsx` | nein |
| Objektrating wird nach Objekteinreichung automatisch erstellt. | The Property Rating Is Created Automatically after Property Submission. | Platzhalter/Hinweis | `components/prototype/FrontendPrototype.tsx` | nein |
| Wirtschaftliche Faktoren | Economic Factors | Ratingkategorie | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Mikrolage | Micro-Location | Ratingkategorie | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Instandhaltungsaufwand | Maintenance Requirement | Ratingkategorie | `lib/object-rating.ts`, `prisma/bootstrap.ts` | ja |
| Immobilie | Property | Ratingkategorie | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Energieausweis | Energy Performance Certificate | Ratingkategorie | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Kaufkraft | Purchasing Power | Ratingkriterium | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Arbeitslosenquote | Unemployment Rate | Ratingkriterium | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Entwicklung der Arbeitslosenquote letzte 5 Jahre | Change in Unemployment Rate over the Last 5 Years | Ratingkriterium | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Wanderungssaldo | Net Migration | Ratingkriterium | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Bevölkerungsentwicklung | Population Trend | Ratingkriterium | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| Dach | Pitched Roof | Ratingkriterium | `lib/object-rating.ts`, `prisma/bootstrap.ts` | ja |
| Flachdach | Flat Roof | Ratingkriterium | `lib/object-rating.ts`, `prisma/bootstrap.ts` | nein |
| ausgegraut, wird nicht mitgerechnet | Disabled and Excluded from the Calculation | Ratinghinweis | `components/prototype/FrontendPrototype.tsx` | nein |
| Erklärung anzeigen | Show Explanation | Info-Button | `components/prototype/FrontendPrototype.tsx` | nein |
| Ratingklasse | Rating Class | Ratingergebnis | `lib/object-rating.ts` | nein |
| Gesamtscore | Overall Score | Ratingergebnis | `lib/object-rating.ts` | nein |
| Zielrendite | Target Return | Ratingergebnis | `lib/object-rating.ts` | ja |
| Zielrenditekorridor | Target Return Range | Ratingergebnis | `lib/object-rating.ts` | ja |
| Investment-Behandlung | Investment Treatment | Ratingergebnis | `lib/object-rating.ts` | ja |
| Standardfreigabe | Standard Approval | Ratingergebnis | `lib/object-rating.ts` | nein |
| Zusätzliche Prüfung | Additional Review | Ratingergebnis | `lib/object-rating.ts` | nein |
| Analystenprüfung | Analyst Review | Ratingstatus | `lib/object-rating.ts` | nein |
| Freigeben | Approve | Ratingaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Alle aktiven Kriterien benötigen einen finalen Score. | All Active Criteria Require a Final Score. | Ratingvalidierung | `lib/object-rating.ts` | nein |
| Analysten dürfen die finale Zielrendite nur innerhalb des Rating-Korridors setzen. | Analysts May Set the Final Target Return Only within the Rating Range. | Ratingvalidierung | `lib/object-rating.ts` | ja |

## Angebotsberechnung und Modelle

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Unverbindliches Angebot | Indicative Offer | Reiter/Dokument | mehrere Dateien | nein |
| Verbindliches Angebot | Binding Offer | Reiter/Dokument | mehrere Dateien | nein |
| UVA | Indicative Offer | Alttext/Status; Kürzel in EN verboten | mehrere Dateien | nein |
| VA | Binding Offer | Alttext/Status; Kürzel in EN verboten | mehrere Dateien | nein |
| Hauptmodell | Primary Model | Angebotsreiter | `components/prototype/FrontendPrototype.tsx` | ja |
| Befristetes Wohnrecht | Fixed-Term Model | Produktauswahl | mehrere Dateien | nein |
| Lebenslanges Wohnrecht | Lifetime Model | Produktauswahl | mehrere Dateien | nein |
| Rückmietverkauf | Sale and Rent-Back | Produktauswahl | mehrere Dateien | ja |
| Kostenfreie Wohnphase mit fester Laufzeit | Fixed-Term Rent-Free Occupancy | Produktkarte | `components/prototype/FrontendPrototype.tsx` | ja |
| Lebenslang kostenfrei wohnen bleiben | Remain in the Property Rent-Free for Life | Produktkarte | `components/prototype/FrontendPrototype.tsx` | ja |
| Für Kunden ab ca. 65 Jahren geeignet | Suitable for Customers Aged Approximately 65 and Over | Produktkarte | `components/prototype/FrontendPrototype.tsx` | ja |
| Ab 75 Jahren; bei zwei Personen ist die jüngere Person maßgeblich | From Age 75; for Two Persons, the Younger Person Determines Eligibility | Produktkarte | `components/prototype/FrontendPrototype.tsx` | nein |
| Das lebenslange Wohnrecht ist erst ab 75 Jahren möglich. Bei zwei Personen ist die jüngere Person maßgeblich. | The Lifetime Model Is Available from Age 75. For Two Persons, the Younger Person Determines Eligibility. | Eligibility-Hinweis | `lib/residential-right-eligibility.ts`, `components/prototype/FrontendPrototype.tsx` | nein |
| Die jüngere Person erreicht innerhalb von 3 Monaten das Mindestalter von 75 Jahren. | The Younger Person Will Reach the Minimum Age of 75 within the Next 3 Months. | Eligibility-Hinweis | `lib/residential-right-eligibility.ts` | nein |
| Verkehrswert | Market Value | Berechnung | mehrere Dateien | nein |
| Gutachtenwert | Appraised Market Value | Berechnung | mehrere Dateien | nein |
| Wohnfläche | Living Area | Berechnung | mehrere Dateien | nein |
| Mietansatz (€/m²) | Assumed Monthly Rent (€/m²) | Lifetime-Eingabe | `components/prototype/FrontendPrototype.tsx` | ja |
| Interner monatlicher Mietansatz pro Quadratmeter. | Internal Assumed Monthly Rent per Square Metre. | Tooltip | `components/prototype/FrontendPrototype.tsx` | ja |
| Ziel-IRR | Target IRR | Berechnung | mehrere Dateien | nein |
| Ankaufskosten | Acquisition Costs | Berechnung | mehrere Dateien | nein |
| Verkaufskosten | Disposal Costs | Berechnung | mehrere Dateien | nein |
| Indexierung | Indexation | Berechnung | mehrere Dateien | ja |
| Laufzeit | Term | Fix-Term-Eingabe | mehrere Dateien | nein |
| Beim lebenslangen Wohnrecht wird keine feste Laufzeit verwendet. Die Berechnung basiert auf der Sterbetafel und der Joint-Life-Logik bei zwei Personen. | The Lifetime Model Has No Fixed Term. The Calculation Is Based on the Mortality Table and Joint-Life Methodology for Two Persons. | Lifetime-Hinweis | `components/prototype/FrontendPrototype.tsx` | ja |
| Neu berechnen | Recalculate | Berechnungsaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Unverbindliches Angebot berechnen | Calculate Indicative Offer | Berechnungsaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Verbindliches Angebot berechnen | Calculate Binding Offer | Berechnungsaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Berechnung aktualisiert | Calculation Updated | Erfolgsfeedback | `components/prototype/FrontendPrototype.tsx` | nein |
| zuletzt berechnet | Last Calculated | Metatext | `components/prototype/FrontendPrototype.tsx` | nein |
| Verbindliche Auszahlung | Binding Customer Payout | Ergebnis | `components/prototype/FrontendPrototype.tsx` | ja |
| Unverbindliche Auszahlung | Indicative Customer Payout | Ergebnis | `components/prototype/FrontendPrototype.tsx` | ja |
| Wert des Wohnrechts | Right-of-Residence Value | Ergebnis | mehrere Dateien | nein |
| Interner Wohnrechtswert | Internal Right-of-Residence Value | Lifetime-Ergebnis | mehrere Dateien | ja |
| Instandhaltungsrücklage | Maintenance Reserve | Ergebnis | mehrere Dateien | nein |
| Maximaler Auszahlungsbetrag | Maximum Customer Payout | Ergebnis | mehrere Dateien | nein |
| Auszahlungsbetrag | Customer Payout | Ergebnis | mehrere Dateien | nein |
| Auszahlungsquote | Payout Ratio | Ergebnis | mehrere Dateien | nein |
| Gesamtankaufskosten | Total Acquisition Costs | Ergebnis | mehrere Dateien | nein |
| Gewichteter IRR | Weighted IRR | Ergebnis | mehrere Dateien | ja |
| Erwartetes Verkaufsjahr | Expected Sale Year | Ergebnis | mehrere Dateien | nein |
| Mietfaktor p.a. | Annual Rent Factor | Rückmietverkauf | mehrere Dateien | ja |
| Jahresmiete | Annual Rent | Rückmietverkauf | mehrere Dateien | nein |
| Monatliche Miete | Monthly Rent | Rückmietverkauf | mehrere Dateien | nein |
| Demo-Kalkulation: Die Auszahlung beträgt pauschal 70 % des Verkehrswerts. Die jährliche Miete beträgt 5 % des Auszahlungsbetrags. Rating-Tool folgt. | Demo Calculation: The Customer Payout Is Set at 70% of Market Value. Annual Rent Is 5% of the Customer Payout. Property-Rating Integration Will Follow. | Rückmietverkauf-Hinweis | mehrere Dateien | ja |
| Angebotsdaten | Offer Details | Angebotsreiter | `components/prototype/FrontendPrototype.tsx` | nein |
| Unverbindliches Angebot abgegeben am | Indicative Offer Submitted On | Angebotsdatum | `components/prototype/FrontendPrototype.tsx` | nein |
| Unverbindliches Angebot angenommen am | Indicative Offer Accepted On | Angebotsdatum | `components/prototype/FrontendPrototype.tsx` | nein |
| Verbindliches Angebot abgegeben am | Binding Offer Submitted On | Angebotsdatum | `components/prototype/FrontendPrototype.tsx` | nein |
| Verbindliches Angebot angenommen am | Binding Offer Accepted On | Angebotsdatum | `components/prototype/FrontendPrototype.tsx` | nein |
| Angenommenes Modell | Accepted Model | Angebotsstatus | `components/prototype/FrontendPrototype.tsx` | ja |
| Angenommenes Angebotsmodell auswählen | Select Accepted Offer Model | Dialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Der Kunde hat mehrere Angebotsmodelle erhalten. Bitte wählen Sie aus, welches Modell angenommen wurde. | The Customer Received Multiple Offer Models. Please Select the Model That Was Accepted. | Dialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Angebot abgegeben | Offer Submitted | Statusaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Angebot angenommen | Offer Accepted | Statusaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| PDF-Angebot erstellen | Create Offer PDF | Angebotsaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Bitte zuerst das unverbindliche Angebot berechnen. | Please Calculate the Indicative Offer First. | Deaktivierter PDF-Button | `components/prototype/FrontendPrototype.tsx` | nein |
| Indikatives Angebot als PDF erstellt. | Indicative Offer PDF Created. | Activity Log | `app/api/properties/[id]/offer/generate-pdf/route.ts` | nein |

## Gutachten, Prozessleiste und KV-Abwicklung

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Gutachtenbeauftragung | Appraisal Commissioning | Bereich | `components/prototype/FrontendPrototype.tsx` | nein |
| Sobald der Kunde das unverbindliche Angebot angenommen hat, kann ein Gutachter beauftragt werden. Nach Eingang des Gutachtens kann das verbindliche Angebot vorbereitet werden. | Once the Customer Has Accepted the Indicative Offer, an Appraiser Can Be Commissioned. The Binding Offer Can Be Prepared after the Appraisal Is Received. | Erklärungstext | `components/prototype/FrontendPrototype.tsx` | nein |
| Beauftragt am | Commissioned On | Gutachtenformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachter / Gutachterfirma | Appraiser / Appraisal Firm | Gutachtenformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachtenbeauftragung speichern | Save Appraisal Commission | Gutachtenaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachten beauftragt | Appraisal Commissioned | Status | mehrere Dateien | nein |
| Eingang des Gutachtens | Receipt of Appraisal | Bereich | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachten eingegangen am | Appraisal Received On | Gutachtenformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachten als eingegangen markieren | Mark Appraisal as Received | Gutachtenaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachten eingegangen | Appraisal Received | Status | mehrere Dateien | nein |
| Bitte geben Sie das Beauftragungsdatum an. | Please Enter the Commissioning Date. | Validierung | `components/prototype/FrontendPrototype.tsx` | nein |
| Bitte geben Sie den Gutachter oder die Gutachterfirma an. | Please Enter the Appraiser or Appraisal Firm. | Validierung | `components/prototype/FrontendPrototype.tsx` | nein |
| Bitte geben Sie das Eingangsdatum des Gutachtens an. | Please Enter the Appraisal Receipt Date. | Validierung | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachtenbeauftragung gespeichert. | Appraisal Commission Saved. | Activity Log | `components/prototype/FrontendPrototype.tsx`, `lib/persistence.ts` | nein |
| Ankaufsprozess | Acquisition Process | Stepper | `components/prototype/FrontendPrototype.tsx` | nein |
| Sie sind hier · Schritt {…} von 8 | You Are Here · Step {…} of 8 | Stepper-Badge | `components/prototype/FrontendPrototype.tsx` | nein |
| Eingereicht | Submitted | Prozessschritt | mehrere Dateien | nein |
| Unverbindliches Angebot abgegeben | Indicative Offer Submitted | Prozessschritt | mehrere Dateien | nein |
| Unverbindliches Angebot angenommen | Indicative Offer Accepted | Prozessschritt | mehrere Dateien | nein |
| Verbindliches Angebot abgegeben | Binding Offer Submitted | Prozessschritt | mehrere Dateien | nein |
| Verbindliches Angebot angenommen | Binding Offer Accepted | Prozessschritt | mehrere Dateien | nein |
| Notar & Kaufvertrag | Notary & Purchase Agreement | Prozessschritt | `components/prototype/FrontendPrototype.tsx` | ja |
| heute | Today | Datumsanzeige | `components/prototype/FrontendPrototype.tsx` | nein |
| Ankaufsprozess abgeschlossen | Acquisition Process Completed | Bestandsfall-Stepper | `components/prototype/FrontendPrototype.tsx` | nein |
| Objekt befindet sich im Bestand | Property Is in Portfolio | Bestandsfall-Stepper | `components/prototype/FrontendPrototype.tsx` | nein |
| Im Bestand seit {…} | In Portfolio since {…} | Bestandsfall-Stepper | `components/prototype/FrontendPrototype.tsx` | nein |
| Details anzeigen | Show Details | Stepperaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Details ausblenden | Hide Details | Stepperaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| KV-Abwicklung | Purchase Agreement & Closing | Reiter | `components/prototype/FrontendPrototype.tsx` | ja |
| Notar und Kaufvertrag | Notary and Purchase Agreement | Bereich | `components/prototype/FrontendPrototype.tsx` | ja |
| Gutachten beauftragt am | Appraisal Commissioned On | Readonly-Feld | `components/prototype/FrontendPrototype.tsx` | nein |
| Gutachterfirma | Appraisal Firm | Readonly-Feld | `components/prototype/FrontendPrototype.tsx` | nein |
| Diese Angaben werden aus der Gutachtenbeauftragung übernommen. | These Details Are Taken from the Appraisal Commission. | Readonly-Hinweis | `components/prototype/FrontendPrototype.tsx` | nein |
| Kaufvertragsentwurf | Draft Purchase Agreement | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | nein |
| Kaufvertragsdatum | Purchase Agreement Date | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | nein |
| Fälligkeitsvoraussetzungen | Conditions Precedent to Payment | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | ja |
| Kaufpreiszahlung | Purchase Price Payment | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | nein |
| Grundbuch / Eintragung | Land Register / Registration | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | ja |
| Vollzugsmeldung | Closing Notification | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | ja |
| Offene Punkte | Open Items | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | nein |
| Interne Kommentare | Internal Comments | KV-Abwicklung | `components/prototype/FrontendPrototype.tsx` | nein |

## Bestandsverwaltung und Verkaufsprozess

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Abgeschlossenes Modell | Concluded Model | Bestandszusammenfassung | `components/prototype/FrontendPrototype.tsx` | ja |
| Noch kein abgeschlossenes Modell hinterlegt | No Concluded Model Has Been Recorded Yet | Leerer Wert | `components/prototype/FrontendPrototype.tsx` | ja |
| Das Modell kann bei Bestandskunden nicht mehr geändert werden. | The Model Can No Longer Be Changed for Portfolio Customers. | Validierung/API | mehrere Dateien | ja |
| Bestandsübernahme & Bewohnerverwaltung | Transfer to Portfolio & Resident Management | Bereich | `components/prototype/FrontendPrototype.tsx` | nein |
| Objekt in Bestand übernommen am | Transferred to Portfolio On | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Bewohner bleibt im Objekt | Resident Remains in the Property | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Bewohnername | Resident Name | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Wohnrecht aktiv ab | Right of Residence Effective From | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | ja |
| Wohnrecht befristet bis | Right of Residence Fixed Until | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | ja |
| Monatliches Nutzungsentgelt / Miete | Monthly Occupancy Fee / Rent | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | ja |
| Ansprechpartner Bewohner | Resident Contact | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Notfallkontakt / Angehöriger | Emergency Contact / Relative | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | ja |
| Verwalter / WEG-Verwaltung | Property Manager / Condominium Manager | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | ja |
| Gebäudeversicherung | Building Insurance | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | nein |
| Hausgeld / Nebenkostenstatus | Service Charge / Ancillary Cost Status | Bestandsformular | `components/prototype/FrontendPrototype.tsx` | ja |
| Bewohnerstatus | Resident Status | Kunden-/Bestandsbereich | `components/prototype/FrontendPrototype.tsx` | nein |
| Bewohnerstatus wird nach Bestandsübernahme verfügbar. | Resident Status Becomes Available after Transfer to Portfolio. | Hinweis | `components/prototype/FrontendPrototype.tsx` | nein |
| Bewohner zieht aus | Resident Is Moving Out | Aktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Bewohner verstorben melden | Report Resident as Deceased | Aktion | `components/prototype/FrontendPrototype.tsx` | ja |
| Diese Änderung startet den Verkaufsprozess. Bitte bestätigen Sie erneut. | This Change Starts the Sales Process. Please Confirm Again. | Bestätigungsdialog | `components/prototype/FrontendPrototype.tsx` | nein |
| Bewohnerstatus kann erst nach Bestandsübernahme geändert werden. | Resident Status Can Only Be Changed after Transfer to Portfolio. | API-Fehler | `app/api/properties/[id]/resident-status/route.ts` | nein |
| Der Verkaufsprozess beginnt erst nach Ende des Wohnrechts oder Rückmietverkaufs. | The Sales Process Starts Only after the Right of Residence or Sale and Rent-Back Has Ended. | Reiterhinweis | `components/prototype/FrontendPrototype.tsx` | ja |
| Verkaufsvorbereitung | Sale Preparation | Verkaufsprozess | `components/prototype/FrontendPrototype.tsx` | nein |
| Objektzugang | Property Access | Verkaufsprozess | `components/prototype/FrontendPrototype.tsx` | nein |
| Schlüssel erhalten | Keys Received | Verkaufsprozess | `components/prototype/FrontendPrototype.tsx` | nein |
| Räumung ausstehend | Clearance Pending | Verkaufsprozess | `components/prototype/FrontendPrototype.tsx` | ja |
| In Vermarktung | Being Marketed for Sale | Verkaufsprozess | `components/prototype/FrontendPrototype.tsx` | nein |
| Verwertung abgeschlossen | Disposal Completed | Verkaufsprozess | `components/prototype/FrontendPrototype.tsx` | ja |
| Weiterverkaufte oder final abgeschlossene Objekte. | Resold or Finally Closed Properties. | Verkauft-Ansicht | `components/prototype/FrontendPrototype.tsx` | ja |

## Aufgaben, Kommunikation und Systemmeldungen

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Aufgaben | Tasks | Reiter | `components/prototype/FrontendPrototype.tsx` | nein |
| Offene Aufgaben | Open Tasks | Seitenleiste | `components/prototype/FrontendPrototype.tsx` | nein |
| Neue Aufgabe | New Task | Aktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Keine offenen Aufgaben. | No Open Tasks. | Leerer Zustand | `components/prototype/FrontendPrototype.tsx` | nein |
| Kommunikation | Communications | Reiter | `components/prototype/FrontendPrototype.tsx` | nein |
| Nachricht schreiben | Write Message | Kommunikation | `components/prototype/FrontendPrototype.tsx` | nein |
| Keine Nachrichten vorhanden. | No Messages Available. | Leerer Zustand | `components/prototype/FrontendPrototype.tsx` | nein |
| Aktivität | Activity | Seitenleiste | `components/prototype/FrontendPrototype.tsx` | nein |
| Alle anzeigen | View All | Link | mehrere Komponenten | nein |
| Keine Aktivitäten vorhanden. | No Activities Available. | Leerer Zustand | `components/prototype/FrontendPrototype.tsx` | nein |
| Daten speichern | Save Details | Formularaktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Änderungen wurden gespeichert. | Changes Saved. | Toast | mehrere Dateien | nein |
| Vorgang öffnen | Open Case | Aktion | `components/prototype/FrontendPrototype.tsx` | nein |
| Vorgang nicht gefunden | Case Not Found | Fehler | mehrere Dateien | nein |
| Partner nicht gefunden | Partner Not Found | Fehler | `components/prototype/FrontendPrototype.tsx`, `app/api/partners/[id]/route.ts` | nein |
| Bitte versuchen Sie es erneut. | Please Try Again. | Fehler | mehrere Dateien | nein |
| Sie sind nicht berechtigt, diese Aktion auszuführen. | You Are Not Authorised to Perform This Action. | Berechtigung | mehrere API-Routen | nein |
| Dieser Entwurf wurde zwischenzeitlich geändert. Bitte laden Sie den aktuellen Stand neu. | This Draft Was Modified in the Meantime. Please Reload the Latest Version. | Konfliktmeldung | `lib/intake-draft.ts` | nein |
| Bitte wählen Sie aus. | Please Make a Selection. | Validierung | `lib/validation.ts`, Komponenten | nein |
| Bitte geben Sie eine gültige E-Mail-Adresse ein. | Please Enter a Valid Email Address. | Validierung | mehrere Dateien | nein |
| Bitte geben Sie Telefon oder Mobilnummer an. | Please Enter a Phone or Mobile Number. | Validierung | mehrere Dateien | nein |
| Dieses Feld ist erforderlich. | This Field Is Required. | Validierung | mehrere Dateien | nein |
| Das PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut. | The PDF Could Not Be Created. Please Try Again. | PDF-Fehler | PDF-API/Komponente | nein |
| Für die PDF-Erstellung fehlen Kundendaten. | Customer Data Is Missing for PDF Creation. | PDF-Fehler | PDF-API | nein |
| Für die PDF-Erstellung fehlen Objektdaten. | Property Data Is Missing for PDF Creation. | PDF-Fehler | PDF-API | nein |

## Authentifizierung, E-Mail, PDF und öffentliche Inhalte

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Anmelden | Sign In | Login | `components/LoginForm.tsx` | nein |
| E-Mail-Adresse | Email Address | Login/Registrierung | mehrere Komponenten | nein |
| Passwort | Password | Login/Registrierung | mehrere Komponenten | nein |
| E-Mail-Adresse bestätigen | Confirm Email Address | Registrierung/E-Mail | `components/ConfirmRegistration.tsx`, `lib/email.ts` | nein |
| Bitte bestätigen Sie Ihre E-Mail-Adresse für das WohnKapital Maklerportal. | Please Confirm Your Email Address for the WohnKapital Broker Portal. | E-Mail | `lib/email.ts` | nein |
| Registrierung erfolgreich | Registration Successful | Registrierung | `components/RegisterForm.tsx` | nein |
| Als Partner registrieren | Register as a Partner | Registrierung | `components/RegisterForm.tsx` | nein |
| Indikatives Angebot | Indicative Offer | PDF-Titel | `lib/pdf-generator.ts` | nein |
| Angebotsdatum | Offer Date | PDF | `lib/pdf-generator.ts` | nein |
| Gültig bis | Valid Until | PDF | `lib/pdf-generator.ts` | nein |
| Ansprechpartner | Contact Person | PDF | `lib/pdf-generator.ts` | nein |
| Rechtlicher Hinweis | Legal Notice | PDF/Website | `lib/pdf-generator.ts`, öffentliche Seiten | ja |
| Dieses Angebot ist unverbindlich und ersetzt keine rechtliche oder notarielle Prüfung. | This Offer Is Non-Binding and Does Not Replace Legal or Notarial Review. | PDF-Hinweis | `lib/pdf-generator.ts` | ja |
| Postbank Wohnatlas 2026 | Postbank Housing Atlas 2026 | Wissensseite | `components/prototype/FrontendPrototype.tsx` | nein |
| Preisentwicklung und regionale Einordnung auf Basis des Postbank Wohnatlas. | Price Trends and Regional Classification Based on the Postbank Housing Atlas. | Wissensseite | `components/prototype/FrontendPrototype.tsx` | nein |
| Quelle: Postbank Wohnatlas 2026 | Source: Postbank Housing Atlas 2026 | Quellenhinweis | `components/prototype/FrontendPrototype.tsx` | nein |
| Original öffnen | Open Original | Link | `components/prototype/FrontendPrototype.tsx` | nein |
| Diese Darstellung dient der internen Marktinformation. Nutzungsrechte für externe Veröffentlichungen sind gesondert zu prüfen. | This Content Is Provided for Internal Market Information. Usage Rights for External Publication Must Be Reviewed Separately. | Rechtshinweis | `components/prototype/FrontendPrototype.tsx` | ja |
| Haus verkaufen. Zuhause bleiben. | Sell Your Home. Stay Where You Belong. | Öffentliche Website | `app/page.tsx`, `lib/site-content.ts` | ja |
| So funktioniert es | How It Works | Öffentliche Navigation | `lib/site-content.ts`, öffentliche Seiten | nein |
| Über uns | About Us | Öffentliche Navigation | `lib/site-content.ts`, öffentliche Seiten | nein |
| Sicherheit | Security | Öffentliche Navigation | `lib/site-content.ts`, öffentliche Seiten | nein |
| Datenschutz | Privacy Policy | Öffentliche Navigation | `app/datenschutz/page.tsx` | nein |
| Impressum | Legal Notice | Öffentliche Navigation | `app/impressum/page.tsx` | ja |
| Angaben gemäß § 5 TMG | Information Pursuant to Section 5 TMG | Impressum | `app/impressum/page.tsx` | ja |
| Alternative zum Teilverkauf | Alternative to Partial Sale | Öffentliche Seite | `app/alternative-zum-teilverkauf/page.tsx` | ja |
| Haus verkaufen und wohnen bleiben | Sell Your Home and Continue Living There | Öffentliche Seite | `app/haus-verkaufen-wohnen-bleiben/page.tsx` | nein |
| Wohnrecht auf Zeit | Fixed-Term Right of Residence | Öffentliche Seite/SEO | `app/wohnrecht-auf-zeit/page.tsx` | ja |

## Activity-Log- und dynamische Textmuster

| Deutscher Text | Vorgeschlagene englische Übersetzung | Kontext | Datei | Fachlich zu prüfen |
|---|---|---|---|---:|
| Entwurf wurde angelegt. | Draft Created. | Activity Log | `app/api/properties/draft/route.ts` | nein |
| Lead wurde an Makler {…} weitergeleitet. Grund: {…}. | Lead Assigned to Broker {…}. Reason: {…}. | Activity Log | Lead-API/Komponente | nein |
| Kunde hat das unverbindliche Angebot für {…} angenommen. | Customer Accepted the Indicative Offer for {…}. | Activity Log | Angebotslogik | nein |
| Kunde hat das verbindliche Angebot für {…} angenommen. | Customer Accepted the Binding Offer for {…}. | Activity Log | Angebotslogik | nein |
| Angenommenes Modell wurde von {…} auf {…} geändert. | Accepted Model Changed from {…} to {…}. | Activity Log | Angebotslogik | ja |
| {…} für {…} wurde berechnet: Auszahlungsbetrag {…} €. | {…} for {…} Calculated: Customer Payout {…} €. | Activity Log | `app/api/properties/[id]/offer/calculate/route.ts` | nein |
| Gutachtenwert gespeichert: {…} €. | Appraised Market Value Saved: {…} €. | Activity Log | Angebots-API | nein |
| Gutachten wurde als beauftragt markiert. | Appraisal Marked as Commissioned. | Activity Log | Gutachtenlogik | nein |
| Gutachten wurde als eingegangen markiert. | Appraisal Marked as Received. | Activity Log | Gutachtenlogik | nein |
| Bewohnerstatus geändert: Bewohner zieht aus. Verkaufsprozess gestartet. | Resident Status Changed: Resident Is Moving Out. Sales Process Started. | Activity Log | Bewohnerstatus-API | nein |
| Bewohnerstatus geändert: Bewohner verstorben. Verkaufsprozess gestartet. | Resident Status Changed: Resident Deceased. Sales Process Started. | Activity Log | Bewohnerstatus-API | ja |
| Objektrating freigegeben. Rating: {…}. Behandlung: {…}. | Property Rating Approved. Rating: {…}. Treatment: {…}. | Activity Log | `lib/object-rating.ts` | ja |
| {…} wurde auf {…} zurückgesetzt. Grund: {…}. | {…} Was Reset to {…}. Reason: {…}. | Activity Log | Workflow-API | nein |
| Indikatives Angebot als PDF erstellt. | Indicative Offer PDF Created. | Activity Log | PDF-API | nein |

## Technische i18n-Empfehlung

### Bibliothek

Empfohlen wird **`next-intl`** für Next.js 14 mit App Router.

Begründung:

- native Unterstützung für App Router, Server Components und Client Components,
- ICU Message Syntax für Pluralisierung, Variablen und Datums-/Zahlenformate,
- typsichere Message-Keys sind mit TypeScript Declaration Merging möglich,
- Locale-Routing kann später ergänzt werden, ohne es im ersten Umsetzungsschritt zu erzwingen,
- serverseitige API-, E-Mail- und PDF-Texte können dieselben Message-Kataloge verwenden.

### Empfohlene Struktur

```text
i18n/
  config.ts                 # de/en, defaultLocale=de
  request.ts                # next-intl RequestConfig
  navigation.ts             # locale-aware Navigation, erst bei Bedarf
  formats.ts                # Geld, Prozent, Datum, Fläche
  types.d.ts                # typsichere Message-Keys
messages/
  de/
    common.json
    navigation.json
    dashboard.json
    leads.json
    intake.json
    precheck.json
    rating.json
    offers.json
    appraisal.json
    closing.json
    portfolio.json
    sales.json
    documents.json
    validation.json
    activity.json
    emails.json
    pdf.json
  en/
    ... identische Dateien und Keys
lib/i18n/
  labels.ts                 # Enum-/Status-Key-Mapping, keine sichtbaren Texte
  server-messages.ts        # API, Activity Log, E-Mail, PDF
  locale.ts                 # Locale aus User/Request, Default de
```

### Key-Konvention

```json
{
  "offers": {
    "indicative": {
      "title": "Unverbindliches Angebot",
      "actions": {
        "calculate": "Unverbindliches Angebot berechnen"
      }
    }
  }
}
```

Keys beschreiben Bedeutung, nicht deutschen Wortlaut. Nicht verwenden: `t("Unverbindliches Angebot")`.

### Migrationsreihenfolge für einen späteren Umsetzungsschritt

1. `next-intl`, Locale-Konfiguration und Formatter ohne UI-Änderung einführen.
2. Zentrale Status-, Enum-, Dokument- und Rollenlabels migrieren.
3. Validierungs- und API-Meldungen auf stabile Message-Codes umstellen.
4. Navigation, Dashboard und globale Komponenten übersetzen.
5. Lead- und Kundenerfassung übersetzen.
6. Vorprüfung, Rating und Angebotsstrecke übersetzen.
7. KV-Abwicklung, Bestandsverwaltung und Verkaufsprozess übersetzen.
8. E-Mails und PDF-Templates zuletzt separat fachlich/juristisch abnehmen.

### Wichtige Architekturregeln

- API-Antworten sollten zukünftig stabile `code`-Werte plus optionale Parameter liefern; das Frontend übersetzt den Code. Kein Parsen deutscher Fehlermeldungen.
- Persistierte Activity-Logs benötigen `messageKey`, `messageParams` und optional einen unveränderlichen deutschen Snapshot für historische Nachvollziehbarkeit.
- Technische Enums bleiben sprachneutral. Eine zentrale Mapping-Funktion liefert Message-Keys statt fertiger Labels.
- Geld, Prozent, Datum und Fläche werden ausschließlich über locale-aware Formatter ausgegeben (`de-DE` bzw. `en-GB` oder nach Investorenentscheidung `en-US`).
- PDF- und E-Mail-Templates erhalten explizite Locale-Versionen; keine bedingten deutschen/englischen Textblöcke in derselben DOCX-Datei.
- Ein CI-Check sollte fehlende Keys, unbenutzte Keys und sichtbare Stringliterale in migrierten Bereichen melden.
- Die Zielsprache für Rechtstexte, Verträge und Investorendokumente benötigt eine separate fachliche Freigabe.

