# MVP-Pflichtenheft: WohnKapital Partnerportal und Angebots-CRM

Stand: 19.05.2026

## 1. Zielbild

WohnKapital soll als webbasiertes Partnerportal und internes Angebots-CRM für Immobilienverwertung umgesetzt werden. Externe Vertriebspartner erfassen Kunden, Immobilien, Dokumente und Rückfragen. Intern werden Bewertungen, Angebotskalkulation, KI-Textentwurf, Freigabe, PDF-Erstellung und Versandstatus gesteuert.

Der MVP konzentriert sich auf den Kernprozess: Fall erfassen, Unterlagen strukturieren, Rückfragen verwalten, Bewertung auslösen, Angebot in der Applikation berechnen, Angebotsentwurf erstellen, intern prüfen, freigeben und Versand dokumentieren.

## 2. Rollen

### Admin

Interne WohnKapital-Mitarbeiter.

Rechte:

- Alle Partner, Kunden, Objekte, Bewertungen, Angebote und Aktivitäten sehen
- Pipeline und offene Rückfragen sehen
- Bewertungen auslösen
- Angebote berechnen, prüfen, freigeben oder ablehnen
- Rückfragen anfordern
- Kundenrückmeldung als eingegangen markieren
- PDF-Stub erzeugen
- Versandstatus dokumentieren

### Partner / Makler

Externe Vertriebspartner.

Rechte:

- Eigene Kunden und Objekte erfassen
- Eigene Fälle sehen
- Dokumente und Bilder als Upload-Platzhalter erfassen
- Status eigener Fälle sehen
- Offene Rückfragen sehen
- Kundenrückmeldung als eingegangen markieren
- Angebotsstatus sehen
- Keine Fälle anderer Partner sehen

## 3. Navigation und Startseiten

Die Oberfläche orientiert sich an der WohnKapital-Struktur aus der Präsentation:

- Home
- Verrentung
- Leads, nur intern
- Zwischengespeichert
- In Bearbeitung
- Bestand
- Verkauft, nur intern
- Sonstiges
- Broschüre
- Postbank Atlas
- Leitfaden
- FAQs

Interne Startseite:

- Suche
- Chatfunktion / Nachrichtenbox
- Karte mit Verortung der Objekte in Bearbeitung
- Umschaltlogik zu Objekten im Bestand
- Pipeline-Kennzahlen
- Offene Rückfragen

Vertriebspartner-Startseite:

- Eigene Objekte in Bearbeitung
- Suche
- Chat / Nachrichten
- Newsfeed
- Eigene offene Rückfragen
- Kundenrückmeldungen

## 4. Kernprozess

1. Partner loggt sich ein.
2. Partner legt einen neuen Fall an.
3. Partner erfasst persönliche Kundendaten.
4. Partner erfasst Wunschmodell und Wohnrechtsdaten.
5. Partner erfasst Immobiliendaten.
6. Partner erfasst Modernisierungen, Bauteilzustand und weitere Angaben.
7. Partner erfasst Dokumente als Upload-Platzhalter.
8. Partner reicht den Fall ein.
9. Admin kann bei fehlenden Angaben Rückfrage anfordern.
10. System erinnert, dass beim Kunden nachgefasst werden muss.
11. Partner oder Admin markiert Kundenrückmeldung als eingegangen.
12. System schließt die offene Rückfrage.
13. System startet Bewertung, im MVP als Sprengnetter-Stub.
14. System speichert Marktwert, Wertspanne und Bewertungsdetails.
15. System berechnet das Angebot in der Applikation.
16. KI-Stub erzeugt Kundenanschreiben, Partner-Zusammenfassung und interne Begründung.
17. Admin prüft Angebot.
18. Admin gibt frei oder lehnt ab.
19. Nach Freigabe wird PDF-Stub erzeugt.
20. Angebot wird als versendet markiert.
21. Status und Aktivitäten werden dokumentiert.

## 5. Statusmodell

- DRAFT: Entwurf
- SUBMITTED: Eingereicht
- DATA_INCOMPLETE: Daten unvollständig / Rückfrage offen
- VALUATION_PENDING: Bewertung läuft
- VALUATED: Bewertung abgeschlossen
- OFFER_CALCULATED: Angebot berechnet
- OFFER_DRAFTED: Angebotsentwurf erstellt
- INTERNAL_REVIEW: Interne Prüfung
- APPROVED: Angebot freigegeben
- SENT: Angebot versendet
- APPOINTMENT_SCHEDULED: Beratungstermin vereinbart
- REJECTED: Abgelehnt
- WON: Gewonnen / Bestand
- SOLD: Verkauft
- LOST: Verloren

## 6. Erfassungsbogen

### Schritt 1: Persönliche Daten

- Name des Kunden
- Geschlecht
- Geburtsdatum
- Automatische Altersanzeige zum Aufrufzeitpunkt
- Familienstand
- Adresse
- Telefon
- Mobil
- E-Mail
- Monatliche Einkünfte: unter 1000, 1000-2000, 2000-3000, über 3000
- Einwilligung zur Datenverarbeitung

### Schritt 2: Wunschmodell

- Wer soll Wohnrecht bekommen: eine Person oder beide
- Dauer des Wohnrechts: 5 bis 15 Jahre
- Zweite Laufzeit gewünscht
- Zweite Laufzeit: 5 bis 15 Jahre
- Grund der Befristung
- Spätere Anmietoption abwählen
- Hinweis: Abwahl kann zu höherer Auszahlung führen, aber nach Ablauf des Wohnrechts muss ausgezogen werden

### Schritt 3: Immobiliendaten

- Immobilientyp
- Baujahr
- Wohnfläche
- Grundstücksfläche
- Nutzfläche
- Bei Wohnungen: Miteigentumsanteile
- Parkplatz vorhanden
- Parkplatztyp: Garage, Carport, Stellplatz, Doppelparker
- Anzahl Parkplätze
- Keller: nein, teilunterkellert, vollunterkellert
- Heizungsart
- Baujahr oder letztes Modernisierungsjahr der Heizung
- Sonstige Energieträger: Photovoltaik, Solarthermie, Batteriespeicher
- Fenstermaterial: Holz, Aluminium, Kunststoff
- Installationsjahr Fenster
- Asbest im Dach bekannt
- Energieausweis vorhanden
- Typ Energieausweis: Bedarf oder Verbrauch
- Energieklasse
- Optik: sehr schlecht, schlecht, mäßig, mittel, gut, sehr gut
- Erbbaurecht oder Denkmalschutz
- Bekannte Mängel, Reparaturen oder Sanierungsdiskussionen

Wichtig: Erbbaurecht oder Denkmalschutz ist im MVP als Ausschlusskriterium umgesetzt und blockiert das Einreichen.

### Schritt 4: Modernisierungen und Bauteile

Modernisierungen:

- Heizung
- Dach
- Fassade
- Fenster
- Leitungen
- Bäder

Jeweils:

- keine
- teilweise
- vollständig
- Jahr / Maßnahme

Bauteilzustand:

- Dach
- Fassade
- Mauerwerk
- Bäder / Sanitär
- Fenster
- Elektro
- Außenanlage

Bewertung je Bauteil:

- marode / sehr schlecht
- schlecht
- mäßig
- mittel
- gut
- sehr gut

### Schritt 5: Weitere Angaben und Dokumente

- Bestehende Restschulden
- Weitere Mitteilungen, Wünsche, Fragen, Anregungen

Dokumente:

- Aktueller Grundbuchauszug, Pflicht
- Vollmacht für Grundbuchbeantragung, falls Grundbuchauszug nicht vorhanden
- Aussagekräftige Fotos innen und außen
- Garten, Keller, Heizung und wertrelevante Besonderheiten
- Bemaßte Grundrisse, Pflicht
- Schnitte, sofern vorhanden
- Wohnflächenberechnung
- Energieausweis oder Ersatzdaten

Nur bei Wohnungen:

- Teilungserklärung, Pflicht
- Hausgeldabrechnungen der letzten 2 Jahre, Pflicht
- Eigentümerversammlungsprotokolle der letzten 2 Jahre, Pflicht
- Nachweis Instandhaltungsrücklage, falls nicht aus Hausgeldabrechnung ersichtlich

## 7. Objektansichten

### Objekt in Bearbeitung, interne Sicht

Reiter:

- Kunde
- Objekt
- Ind. AG
- Verb. AG
- Doks
- Aufgaben

Anzeigen:

- Status farblich hervorgehoben
- Kunde
- Objektadresse
- Wohnfläche
- Grundstücksfläche
- Objektnummer
- Gesellschaft, später zu ergänzen

### Objekt im Bestand, interne Sicht

Reiter:

- Kunde
- Objekt
- Konditionen / Vertragsdaten
- Doks
- Aufgaben
- NK
- Instandh.
- Notizen

Notizen:

- Neue Notiz anlegen
- Autor
- Zeitpunkt
- Text
- chronologisch sortiert

Instandhaltung:

- Gewerk
- ausgeführte Arbeiten
- Handwerker
- Kosten
- Rechnung

## 8. Bewertung

Die Bewertung wird im MVP als Stub umgesetzt. Der bevorzugte Provider ist Sprengnetter.

Gespeichert werden:

- Provider
- Marktwert
- Wertuntergrenze
- Wertobergrenze
- Confidence Score
- Rohantwort als JSON

Die externe Bewertungslogik liefert nur Bewertungsdaten. Die Angebotsentscheidung bleibt in der eigenen Applikation.

## 9. Angebotskalkulation

Die Angebotskalkulation erfolgt explizit in der Applikation.

MVP-Formel:

1. Marktwert aus Bewertung
2. Zustandsabschlag:
   - sehr gut: 0 Prozent
   - gut: 2 Prozent
   - durchschnittlich: 5 Prozent
   - renovierungsbedürftig: 10 Prozent
3. Adjusted Market Value = Marktwert minus Zustandsabschlag
4. Wohnrechtswert:
   - 5 Jahre: 15 Prozent
   - 10 Jahre: 28 Prozent
   - 15 Jahre: 40 Prozent
5. Risikoabschlag: 5 Prozent
6. Zielmarge: 7 Prozent
7. Auszahlung = Adjusted Market Value minus Wohnrechtswert minus Risikoabschlag minus Zielmarge

Alle Angebotsversionen werden als Snapshots gespeichert.

## 10. KI-Modul

Das KI-Modul ist im MVP ein Stub. Es erzeugt:

- Kundenanschreiben
- Partner-Zusammenfassung
- interne Angebotsbegründung

Regeln:

- KI verändert keine Zahlen.
- KI entscheidet keine Preise.
- Texte bleiben Entwurf bis Admin-Freigabe.
- Zahlen kommen ausschließlich aus Bewertungs- und Angebotsdatensatz.

## 11. Prozess Rückfragen

Admin kann eine Rückfrage anfordern.

Auswirkungen:

- `followUpRequired = true`
- `followUpReason` wird gesetzt
- `followUpDueAt` wird gesetzt
- Status wird `DATA_INCOMPLETE`
- Aktivität wird protokolliert

Wenn eine Kundenrückmeldung kommt:

- Partner oder Admin markiert Rückmeldung als eingegangen
- `followUpRequired = false`
- `customerFeedbackReceivedAt` wird gesetzt
- offene Erinnerung wird geschlossen
- falls Status `DATA_INCOMPLETE` war, geht der Fall zurück auf `SUBMITTED`

## 12. Datenmodell, fachlich

Zentrale Entitäten:

- Partner
- User
- Customer
- Property
- Document
- Valuation
- Offer
- OfferVersion
- Activity

Erweiterungen aus den Präsentationen:

- Kundengeschlecht
- Familienstand
- monatliches Einkommensband
- Mobilnummer
- Wohnrechtsberechtigte
- zweite Wohnrechtslaufzeit
- Befristungsgrund
- Abwahl spätere Anmietoption
- technische Immobilienmerkmale
- Modernisierungen
- Bauteilzustand
- Restschulden
- Sprengnetter als bevorzugter Provider
- Rückfrage-/Wiedervorlagefelder
- Kalkulationsquelle

## 13. UI-Design

Das Frontend verwendet ein seriöses Immobilien-/Finance-Design:

- Marke: WohnKapital
- Logo: Vektorlogo aus `WohnKapital_Teaser_final en_V4.pptx`
- Primärfarbe: WohnKapital-Violett `#44005C`
- Akzentfarbe: WohnKapital-Gold `#FFAC00`
- Weitere Präsentationsfarbe: Olivgold `#A8A443`
- Flächen: Weiß, warmes Off-White und helle Violettabstufungen
- Überschriften: Aptos Display
- Normaler Text: Aptos
- Dichte, aber ruhige Arbeitsoberfläche
- Keine Marketingseite als Hauptprodukt, sondern nutzbares Portal
- Logout-Kästchen in der Kopfzeile zum Beenden der Sitzung

## 14. Technischer Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL-Zielmodell
- In-Memory-MVP-Store für aktuellen Prototyp
- Node Test Runner
- Mock/Sprengnetter-Stub für Bewertung
- Mock-KI für Angebotstexte
- PDF-Stub

## 15. Nicht Teil des MVP

- Echtes Kundenportal
- Echte Sprengnetter-API-Anbindung
- Vollautomatisierter Versand ohne Admin-Freigabe
- Notarworkflow
- Provisionsabrechnung
- DATEV/Buchhaltung
- Vollständige Dokumentenprüfung per KI
- Vollständige Bestandsverwaltung für NK, Instandhaltung und Vertragsdaten

## 16. Aktueller Implementierungsstand

Umgesetzt im Prototyp:

- Rollenbasierter Login
- Admin- und Partner-Dashboard
- Erweiterter Erfassungsbogen
- Upload-Platzhalter
- Sprengnetter-Bewertungsstub
- Angebotsberechnung in der Applikation
- KI-Textstub
- Rückfrageprozess mit Wiedervorlage
- Kundenrückmeldung schließt Erinnerung
- Admin-Freigabe, Ablehnung, PDF-Stub und Versandstatus
- Offer-Versionierung
- Activity-Log
- Tests für Rechte, Angebot, Rückfrage und Bewertung
