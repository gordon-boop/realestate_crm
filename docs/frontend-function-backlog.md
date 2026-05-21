# Frontend-Funktionslücken aus dem Prototyp

Quelle: `components/prototype/FrontendPrototype.tsx`

Status:
- `vorhanden`: Backend/API oder persistentes Modell existiert bereits weitgehend.
- `teilweise`: Datenmodell oder Route existiert, aber UI ist noch Mock oder nicht verdrahtet.
- `fehlt`: Im Frontend sichtbar, aber fachlich/technisch noch nicht angelegt.
- `Rückfrage`: Bedeutung oder gewünschtes Verhalten ist unklar.

## Priorität 1: Kernprozess lauffähig machen

| Funktion im Frontend | Aktueller Stand | Nächster Umsetzungsschritt |
| --- | --- | --- |
| Neuer Fall: 5-Schritt-Erfassung | teilweise | Prototyp-Stepper mit echten Form-State, Validierungen und `POST /customers`, `POST /properties`, Dokumentanlage verbinden. |
| Entwurf speichern | teilweise | Draft-Endpoint oder bestehende Property-Create-Logik so erweitern, dass Zwischenspeichern ohne vollständige Pflichtdaten möglich ist. |
| Fall einreichen | vorhanden, aber nicht im Prototyp verdrahtet | Button an `POST /properties/:id/submit` anschließen und Status/Fehler im UI anzeigen. |
| Bewertung starten | vorhanden, aber nicht im Prototyp verdrahtet | Admin-Button an `POST /properties/:id/valuation` anschließen und anschließend Bewertung/Status aktualisieren. |
| Indikatives Angebot berechnen/anzeigen | teilweise | Ind.-AG-Tab mit echter Valuation/Offer-Berechnung verbinden. |
| Kundenrückmeldung eingegangen | vorhanden, aber nicht im Prototyp verdrahtet | Button an `POST /properties/:id/feedback-received` anschließen und offene Reminder schließen. |
| Dokument hochladen | teilweise | Upload-Button an Dokument-API anbinden, Pflichtgrad/Status speichern und Liste live aktualisieren. |

## Priorität 2: Admin- und Partner-Arbeitsoberfläche

| Funktion im Frontend | Aktueller Stand | Nächster Umsetzungsschritt |
| --- | --- | --- |
| Dashboard-Kennzahlen Partner | fehlt/Mock | Kennzahlen aus echten Fällen berechnen: in Bearbeitung, eingereicht, Angebote offen, abgeschlossen. |
| Dashboard-Kennzahlen Admin | fehlt/Mock | Pipeline-Metriken aus echten Fällen und Statusgruppen berechnen. |
| Aktive Fälle sortiert nach letzter Aktivität | teilweise | `lastActivityAt` nutzen und Tabellen dynamisch sortieren. |
| Statusfilter im Admin-Dashboard | teilweise | Filterbuttons mit Query-State oder Client-State verbinden. |
| Offene Rückfragen-Liste | teilweise | `Reminder`-Daten dynamisch anzeigen, überfällige Wiedervorlagen berechnen. |
| Fall öffnen über Fallnummer `WK-...` | teilweise | Mapping von `caseNumber` auf echte Property-ID ergänzen oder URLs auf echte IDs umstellen. |
| Bearbeiten-Button im Fall | fehlt | Edit-Modus oder separate Bearbeitungsseite definieren. |
| Aktivitätslog im Detail | teilweise | Statt Mock-Liste echte `Activity` aus Store/API anzeigen. |
| Aufgaben-Tab | fehlt | Task-/Aufgabenmodell oder Reminder als Aufgabenoberfläche verwenden. |

## Priorität 3: Navigation und Wissensbereich

| Funktion im Frontend | Aktueller Stand | Nächster Umsetzungsschritt |
| --- | --- | --- |
| Globale Suche | fehlt | Suchindex/Filter für Fälle, Kunden, Objekte, Partner definieren. |
| Benachrichtigungen Glocke | fehlt | Notification-Modell oder aus offenen Remindern/Aktivitäten ableiten. |
| Nachrichten/Chat | fehlt | Message-Modell, Threads und Partner/Admin-Kommunikation definieren. |
| Sidebar: Verrentung | teilweise/Rückfrage | Klären, ob dies eine Fallliste nach Prozessart oder ein Modul ist. |
| Sidebar: Zwischengespeichert | teilweise | Filter auf `DRAFT` verdrahten. |
| Sidebar: In Bearbeitung | teilweise | Statusgruppe definieren und Filter verdrahten. |
| Sidebar: Bestand | Rückfrage | Klären, ob `WON`, `SENT`, `APPROVED` oder eigener Bestandsstatus gemeint ist. |
| Sidebar: Sonstiges | Rückfrage | Zweck/Inhalte unklar. |
| Admin: Leads | Rückfrage | Klären, ob Leads eigene Entität sind oder frühe Properties/Customers. |
| Admin: Partner | teilweise | Partnerliste/-verwaltung als eigene Admin-Seite bauen. |
| Wissen: Broschüre, Postbank Atlas, Leitfaden, FAQs | fehlt | KnowledgeDocument-Modell oder statische Ressourcen mit Download/Link-Liste anlegen. |

## Priorität 4: Angebots- und Dokumentenworkflow vertiefen

| Funktion im Frontend | Aktueller Stand | Nächster Umsetzungsschritt |
| --- | --- | --- |
| Verbindliches Angebot (`Verb. AG`) | teilweise | `Offer.kind = binding` nutzen und Prozess/Status/Freigabe klären. |
| Dokument-Pflichtliste | teilweise | Pflichtdokumente je Immobilientyp/Modell als Requirement-Liste erzeugen. |
| Dokumentstatus `fehlt/ok` | vorhanden, aber UI-Mock | Statusänderung an `PATCH /documents/:documentId` anbinden. |
| Überfällige Rückfragen | teilweise | Reminder `dueAt < now` im UI und ggf. Status `overdue` setzen. |
| Letzte Erinnerung vor X Tagen | teilweise | `lastReminderAt` anzeigen und Reminder-Versand dokumentieren. |
| Karte Objekte in Bearbeitung/Bestand | fehlt | Adresse/Geokoordinatenmodell und Kartenprovider klären. |

## Priorität 5: UX-Details im Erfassungsbogen

| Funktion im Frontend | Aktueller Stand | Nächster Umsetzungsschritt |
| --- | --- | --- |
| Alter automatisch berechnen | teilweise | Date-of-birth-State im Prototyp-Stepper berechnen und speichern (`ageAtSubmission`). |
| Wohnrechtsdauer Range zeigt echten Wert | fehlt | Slider-State einbauen und in Payload speichern. |
| RadioGroup-Auswahl persistiert | fehlt | Formular-State statt nur `defaultValue`. |
| Fortschritt dynamisch | fehlt | Fortschritt aus Schritt/validierten Pflichtfeldern ableiten. |
| Schritt 4 Modernisierungen | teilweise in altem Formular, fehlt im Prototyp | Prototyp-Schritt 4 mit bestehendem Modernisierungs-JSON verbinden. |
| Schritt 5 Dokumente | teilweise | Prototyp-Schritt 5 mit Dokumentanforderungen und Upload verbinden. |

## Rückfragen vor Umsetzung

1. Soll der Rollenwechsel-Button aus dem Prototyp im echten MVP bleiben, oder nur Demo-Funktion sein? Im produktiven Portal wäre Rollenwechsel normalerweise nicht sichtbar.
2. Was genau bedeutet `Bestand`: gewonnene Fälle (`WON`), versendete Angebote (`SENT`), freigegebene Angebote (`APPROVED`) oder tatsächlich angekaufte/verwaltete Immobilien?
3. Sind `Leads` eigene Datensätze vor Kunde/Objekt, oder sollen eingereichte Fälle ohne vollständige Daten als Leads gelten?
4. Soll `Sonstiges` ein Dokument-/Notizbereich sein, oder ein Sammelmodul für Sonderfälle?
5. Soll die Karte echte Geokoordinaten bekommen, oder reicht im MVP eine adressbasierte Listenansicht mit späterem Kartenstub?
