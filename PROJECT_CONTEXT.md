# WohnKapital CRM - Projektkontext

Stand: 21.07.2026. Diese Datei beschreibt den tatsächlichen Codezustand und dient als Einstieg für neue Codex-Threads. Bei Abweichungen sind `prisma/schema.prisma`, die API-Routen und die Tests maßgeblich.

## 1. Ziel und Zweck

Das CRM bildet den Prozess von einem Interessenten/Lead bis zum angekauften und später wieder verkauften Objekt ab. Es unterstützt zwei Nutzerwelten:

- interne Mitarbeiter, Berater, Admins und Super Admins mit Zugriff auf Lead-Routing, Vorprüfung, Rating, Angebote, Kaufvertragsabwicklung, Bestand und Verkaufsprozess;
- Makler/Partner mit Zugriff ausschließlich auf eigene Leads und Fälle sowie auf die Kundeneinreichung.

Fachliche Kernprodukte sind Wohnrecht (befristet oder lebenslang) und Rückmietverkauf. Sichtbare UI-Begriffe sollen ausschließlich `Wohnrecht`, `Rückmietverkauf` und bei mehreren Modellen `Nutzungsmodell` verwenden.

## 2. Technologien und Projektstruktur

### Stack

- Next.js 14 mit App Router, React 18 und TypeScript
- Prisma 5 mit PostgreSQL 16
- Zod für Request- und Formularvalidierung
- `jose` für Sessions/Auth, `bcryptjs` für Passwort-Hashes
- `next-intl` für `de-DE` und `en-GB`
- Docxtemplater/PizZip und LibreOffice headless für DOCX/PDF-Angebote
- Leaflet/MarkerCluster für Objektkarten
- Node-Test-Runner (`node --test`) für Unit- und Integrationslogik
- Docker Compose mit App, PostgreSQL und Caddy

### Verzeichnisse

- `app/`: Seiten, App-Router und API-Routen
- `components/`: Formulare, Layout, Tabellen und UI; große Teile des CRM stecken noch in `components/prototype/FrontendPrototype.tsx`
- `lib/`: Fachlogik, Rechte, Persistenz, Berechnungen, Rating, PDF, OpenPLZ und Hilfsfunktionen
- `prisma/`: Schema, Migrationen, Bootstrap und Demo-Seed
- `messages/de`, `messages/en`: Übersetzungskataloge
- `templates/`: DOCX-Vorlagen für indikative und verbindliche Angebote
- `data/`: lokaler OpenPLZ-Datensatz
- `tests/`: fachliche und technische Tests
- `docs/`: Pflichtenheft, Backlogs, i18n-Glossar und Datenquellen

### Lokaler Betrieb

- `http://localhost:3000`: deutsches Docker-Image (`de-DE`)
- `http://localhost:3001`: englisches Docker-Image (`en-GB`)
- beide App-Container verwenden dieselbe lokale PostgreSQL-Datenbank
- Caddy veröffentlicht aktuell den deutschen Service auf Port 80/443
- Health-Check: `/api/health`

Wichtige Befehle:

```bash
npm run build
npm test
npm run db:bootstrap
ALLOW_DEMO_SEED=true npm run db:seed:demo
npm run db:clear-test-cases
docker compose up -d --build
```

`db:clear-test-cases` besitzt eine Testumgebungs-Sperre. Der Demo-Seed läuft nur mit `ALLOW_DEMO_SEED=true`. Beim normalen Containerstart werden nur Migrationen ausgeführt, keine Seeds.

## 3. Bestehende Funktionen und Module

### Nutzer, Rollen und Partner

- Login/Logout und sessionbasierte Authentifizierung
- interne Rollen: `employee`, `advisor`, `admin`, `super_admin`
- externe Rolle: `partner`
- Partnerregistrierung, Partnerübersicht, Detailansicht und Bearbeitung
- Mitarbeiterverwaltung mit Soft Delete
- serverseitige Sichtbarkeits- und Mutationsprüfung für Partnerfälle

### Leads und Kundenerfassung

- manuelle und Homepage-Lead-Erfassung
- Lead-Zuweisung an Partner oder interne Berater
- Statusführung, Notizen, Ablehnung und Umwandlung in Customer + Property/Fall
- lokale PLZ-, Ort-, Bundesland- und Kreisermittlung über OpenPLZ/ODbL
- mehrstufige Neukundenerfassung mit Entwurf, Autosave, Optimistic Locking und finaler Einreichungsvalidierung
- getrennte Kundenanschrift mit Straße und Hausnummer

### Fall- und Ankaufsprozess

- Dashboard-Arbeitskörbe für Admin/Mitarbeiter und Partner
- globale Suche nach Fall, Kunde, Adresse und Lead
- horizontale Ankaufsprozessanzeige
- Statusfolge von Einreichung über UVA, Gutachten, VA und KV-Abwicklung bis Portfolio
- strukturierte Ablehnung und Workflow-Reset mit Rollenprüfung
- Vorprüfung/Ankaufsfähigkeit mit KO-Kriterien, Ausnahmeprüfung und Postbank-Wohnatlas-Region

### Objektrating

- versionierte Ratingkonfiguration mit Kategorien, Kriterien, Gewichtungen, Scoredefinitionen, Feld-Mappings und Renditekurven
- automatische Vorbefüllung, Confidence, Analystenscore, Pflichtkommentar bei Überschreibung
- Freigabe/Wiederöffnung, Zielrenditekorridor und vollständiger Audit-Trail
- Excel-orientierte Kategorien und Kriterien; Dach/Flachdach werden gegenseitig ausgeschlossen

### Angebotsberechnung

- indikatives und verbindliches Angebot
- befristetes Wohnrecht mit Excel-basiertem Rechenkern
- lebenslanges Wohnrecht mit Altersberechtigung, deutscher Sterbetafel und Joint-Life-Logik
- Rückmietverkauf als Demo-Kalkulation: 70 % Auszahlung, 5 % Jahresmiete auf den Auszahlungsbetrag
- deutsches Zahlenparsing für Geld, Prozent und Dezimalwerte
- Auswahl und Persistenz des angenommenen Angebotsmodells
- Ratingfreigabe und Gutachtenstatus als Gates für nachgelagerte Schritte

### Dokumente und PDF

- Upload, Kategorien, Pflichtgrade, Status, Versionen und Dokumentprüfung
- UVA-PDF für Wohnrecht und Rückmietverkauf
- VA-PDF-Vorlage für Wohnrecht
- Speicherung der erzeugten PDF als Falldokument und Activity-Log-Eintrag
- lokale Kundenbroschüre, Makler-FAQ und Postbank-Wohnatlas-Grafik

### Betrieb nach Ankauf

- zusammengeführte KV-Abwicklung mit Gutachten-, Notar-, Zahlungs- und Grundbuchdaten
- Bestandsverwaltung mit abgeschlossenem Modell, Bewohner- und Verwaltungsdaten
- Bewohnerstatus und geschützter Wechsel in den Verkaufsprozess
- Verkaufsprozess/Exit-Akte mit Zugang, Räumung, Reparatur, Vermarktung, Verkauf und Abschluss
- Wiedervorlagen/Aufgaben, Aktivitäten, Benachrichtigungen und Fallkommunikation

### Internationalisierung

- gemeinsame Komponentenbasis für Deutsch und Englisch
- deutsche Kataloge sind Fallback für fehlende englische Keys
- Login, Navigation, Dashboards, Leads, Kundenerfassung, Vorprüfung und Rating sind weitgehend angebunden
- Locale ist derzeit Build-Konfiguration, kein dynamischer Sprachschalter

## 4. Datenbankstruktur

Wichtig: Es gibt kein separates `Case`-Modell. `Property` ist zugleich Objekt und Kundenfall; `caseNumber` ist die sichtbare Fallnummer.

Zentrale Modelle:

- `Partner`, `User`, `BrokerRegistration`: Organisationen, Nutzer, Rollen und Registrierungsprozess
- `Lead`: Interessent vor der Kundenumwandlung, inklusive Routing und Konvertierungsreferenzen
- `Customer`: Personen-, Kontakt-, Partner- und Beraterdaten
- `Property`: Objekt-, Erfassungs-, Prozess-, Angebotsannahme-, KV-, Bestands- und Bewohnerdaten
- `PropertyExitProcess`: separater Verkaufs-/Exit-Prozess
- `Document`, `DocumentVersion`: Falldokumente und Snapshots
- `Valuation`: Verkehrswertermittlungen und Providerstatus
- `Offer`, `OfferVersion`: indikative/verbindliche Angebote, Kalkulationsannahmen, PDF-Link und Versionen
- `Reminder`: Aufgaben und Wiedervorlagen
- `Activity`, `ActivityVersion`: Ereignisse und versionierte Aktivitätsdaten
- `ChatMessage`, `ChatAttachment`, `ChatMessageRead`: Fallkommunikation
- `CaseNotification`, `CaseNotificationRead`: Benachrichtigungen und Lesestände
- `RatingVersion`, `RatingCategory`, `RatingCriterion`, `RatingScoreDefinition`, `RatingFieldMapping`, `RatingReturnCurve`: versionierte Ratingkonfiguration
- `ObjectRating`, `ObjectRatingScore`, `RatingAuditLog`: konkrete Objektbewertung und Audit-Trail
- `NumberSequence`: Nummernkreise für Leads/Fälle

Teilweise strukturierte, aber flexibel erweiterbare Daten liegen als JSON in `Property`, insbesondere Erfassungsentwurf, Vorprüfung, Modernisierung, Gebäudestatus, Instandhaltungsplan und Portfolioaufgaben.

## 5. Wichtige technische und fachliche Entscheidungen

- Technische Enum-Werte bleiben aus Gründen der Datenkompatibilität stabil. Deshalb existieren intern weiterhin Werte wie `sale_and_leaseback` und `usufruct`; sichtbare Labels müssen korrekt gemappt werden.
- Ein angenommenes UVA-/VA-Modell wird separat persistiert und ist für den weiteren Prozess führend. In Bestandsfällen ist es nicht mehr änderbar.
- Partnerzugriff wird serverseitig über `partnerId` eingeschränkt; interne Berater dürfen nur zugewiesene Fälle bearbeiten, Admin/Super Admin besitzen breitere Rechte.
- Entwürfe dürfen unvollständig sein. Die vollständige fachliche Validierung erfolgt bei Einreichung beziehungsweise Angebotsberechnung.
- Geld- und Prozentwerte dürfen nicht mit `parseFloat` auf deutschen Formateingaben verarbeitet werden; zentrale Parser liegen in `lib/utils/numberParsing.ts`.
- Ratingkonfigurationen sind versioniert. Historische Ratings referenzieren die verwendete Konfigurationsversion und bleiben reproduzierbar.
- Wohnrechtskalkulationen sind in eigene Services unter `lib/calculations/` ausgelagert. Änderungen müssen gegen die Excel-Testfälle geprüft werden.
- PDF-Vorlagen liegen im Repository; die PDF-Konvertierung benötigt LibreOffice im Container.
- OpenPLZ wird lokal importiert, nicht zur Laufzeit extern abgefragt. Quelle/Lizenz stehen in `docs/data-sources.md`.
- Seeds sind vom App-Start getrennt. `db:bootstrap` erzeugt Grunddaten, Demo-Accounts und Ratingkonfiguration; Demo-Fälle werden nur bewusst über `db:seed:demo` erzeugt.
- `app.wohn-kapital.de` und `test.wohn-kapital.de` gelten in der Middleware als CRM-Hosts und leiten `/` auf `/login` um.

Lokale Bootstrap-Accounts sind ausschließlich für Entwicklung/Demo gedacht: `admin@demo.local`, `mitarbeiter@demo.local`, `berater@demo.local`, `makler@demo.local`; das Seed-Passwort lautet `demo1234`. Diese Zugangsdaten dürfen nicht produktiv verwendet werden.

## 6. Bekannte Fehler und offene Punkte

### Aktueller Teststand

`npm test` am 21.07.2026: 110 von 114 Tests erfolgreich. Vier Tests schlagen fehl:

1. `acquisition workflow advances a case into portfolio`: Test verwendet den deaktivierten In-Memory-Runtime-Store (`WK_ENABLE_RUNTIME_STORE=false`).
2. `chat messages are case linked and validated`: veraltete Erwartung `internal === true`, tatsächlich ist das Feld nicht gesetzt.
3. `reminders are persisted and can be completed`: ebenfalls deaktivierter Runtime-Store.
4. `assigned lead can be converted into a draft customer case`: erwartete Runtime-Store-Testfixture fehlt.

Die produktiven API-Pfade verwenden Prisma; die Tests müssen auf Prisma-freie isolierte Fixtures umgestellt oder mit explizit aktiviertem Test-Store ausgeführt werden.

### Technische Schulden und Produktivlücken

- `FrontendPrototype.tsx` ist eine sehr große monolithische Komponente mit Mock-Fallbacks und sollte fachlich zerlegt werden.
- Bewertung/Sprengnetter, KI-Angebotstexte und E-Mail-Versand sind noch Stubs.
- Uploads und erzeugte PDFs liegen in lokalem `public/mock-storage`; das ist nicht dauerhaft oder horizontal skalierbar.
- Ein echter Virenscan, produktiver Object Storage und signierte Download-URLs fehlen.
- Die englische Oberfläche ist noch nicht in allen Prozessbereichen vollständig; deutsche Katalogwerte greifen als Fallback.
- Sprache kann nicht zur Laufzeit gewechselt werden. Deutsch und Englisch werden aktuell als getrennte Docker-Images gebaut.
- Caddy routet aktuell nur den deutschen `app`-Service; der englische Service ist lokal direkt auf Port 3001 verfügbar.
- Einige technische Enum-Namen entsprechen nicht mehr der sichtbaren Produktterminologie.
- Rollen- und Fehlerbehandlung sind historisch über mehrere Helper verteilt (`access-control.ts`, `permissions.ts`, API-Routen) und sollten konsolidiert werden.
- Passwort-Reset, produktive E-Mail-Bestätigung, Session-Härtung und DSGVO-Export/-Löschung fehlen.
- Angebots-PDFs und Excel-Rechenkerne benötigen weiterhin fachliche Regressionstests mit repräsentativen Fällen.

Aktueller Worktree-Hinweis: Die Zwei-Locale-Docker-Konfiguration in `docker-compose.yml` und `.dockerignore` sind noch nicht committed. Bestehende Änderungen nicht ungeprüft zurücksetzen.

## 7. Sinnvolle nächste Entwicklungsschritte

1. Die vier fehlschlagenden Tests reparieren und Runtime-Store-Tests klar von Prisma-Tests trennen.
2. `FrontendPrototype.tsx` schrittweise in Prozess-, Dashboard-, Angebots-, Rating- und Bestandskomponenten zerlegen.
3. i18n für Angebote, Gutachten, KV-Abwicklung, Bestandsverwaltung, Verkaufsprozess, Dialoge und API-Fehler vervollständigen.
4. Produktionsanbindungen umsetzen: Bewertungsanbieter, E-Mail, Object Storage, Virenscan und optional KI-Service.
5. Rollen-/Permission-Logik zentralisieren und API-Endpunkte systematisch mit Admin-, Mitarbeiter- und Partnerfällen testen.
6. End-to-End-Smoke-Tests für Lead -> Kundenfall -> Vorprüfung -> Rating -> UVA -> Gutachten -> VA -> KV -> Bestand ergänzen.
7. Rechenkerne und Zielrenditeableitung gegen freigegebene Excel-Master versioniert absichern.
8. PDF-Erzeugung für beide Modelle mit echten Beispieldaten und dauerhafter Dokumentenablage härten.
9. Deploymentkonzept für deutsche und englische Hosts festlegen, statt dauerhaft zwei lokale Portvarianten zu pflegen.
10. Security-/Production-Readiness abschließen: Secrets, sichere Cookies, Passwort-Reset, Audit, DSGVO und Backup/Restore.

## Übergaberegeln für neue Codex-Threads

- Zuerst `git status`, diese Datei, `prisma/schema.prisma` und die betroffenen Tests lesen.
- Keine bestehenden Daten oder technischen Enum-Werte ohne Migrationsplan löschen.
- Fachbegriffe in der UI: Wohnrecht, Rückmietverkauf, Nutzungsmodell; keine sichtbaren Altbegriffe.
- Nach Codeänderungen gezielte Tests und `npm run build` ausführen.
- Nach jeder Änderung die lokalen Docker-Images aktualisieren und beide Locales prüfen.
- Test- oder Live-Deployments nur auf ausdrückliche Anweisung ausführen.
