# Partnerportal und Angebots-CRM MVP

Webbasiertes MVP für eine Immobilienverwertungsfirma. Externe Partner erfassen Kunden und Objekte, das System simuliert eine Bewertung, berechnet ein indikatives Angebot und erzeugt Mock-KI-Texte. Admins prüfen, geben frei und dokumentieren PDF/Versandstatus.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Prisma Schema für PostgreSQL
- MVP-Auth mit Rollen `admin` und `partner`
- Mock-Repository, Mock-Bewertung, Mock-KI und PDF-Stub
- Node-Test für zentrale Angebotslogik und Zugriffsschutz

## Start

```bash
npm install
npm run dev
```

## Google Maps

Die Admin-Karte nutzt Google Maps, wenn `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` gesetzt ist. Ohne Key wird automatisch eine interne Deutschlandkarte als Fallback angezeigt.

Für Docker muss der Key vor dem Build in `.env` stehen:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="dein-google-maps-key"
docker compose up --build -d
```

Demo-Logins:

- Admin: `admin@demo.local` / `demo1234`
- Partner: `makler@demo.local` / `demo1234`

Die Demo-User sind nur für lokale Entwicklung und Tests gedacht. In produktionsnahen Umgebungen sollten Demo-Passwörter nicht verwendet werden.

## Echten Admin-Zugang anlegen

Für Server- oder Testumgebungen sollte ein echter Admin-Zugang angelegt werden:

```bash
ADMIN_EMAIL="meine-email@example.com" ADMIN_NAME="Gordon Sauer" ADMIN_PASSWORD="SicheresPasswort123!" npm run admin:create
```

Wenn Docker verwendet wird:

```bash
docker compose exec app sh -c 'ADMIN_EMAIL="meine-email@example.com" ADMIN_NAME="Gordon Sauer" ADMIN_PASSWORD="SicheresPasswort123!" npm run admin:create'
```

Der Befehl legt den Admin an oder aktualisiert ihn. Das Passwort wird mit bcrypt gehasht; Klartext-Passwörter werden nicht gespeichert. Der User erhält `role=admin` und `internalRole=super_admin`.

## Passwort-Migration

Die Migration `20260601_password_migration` invalidiert einmalig bestehende Klartext-Passwörter und setzt sie auf `NEEDS_RESET`. Bestehende Nutzer müssen danach einen Passwort-Reset durchlaufen oder ein neues gehashtes Passwort erhalten. Das Seed-Script vergibt für die Demo-User neue bcrypt-Hashes für `demo1234`.

## Wichtige Pfade

- Prisma Schema: `prisma/schema.prisma`
- Angebotslogik: `lib/offer-calculator.ts`
- Mock-Bewertung: `lib/valuation-service.ts`
- Mock-KI: `lib/ai-service.ts`
- Rechteprüfung: `lib/access-control.ts`
- API-Routen: `app/api/**/route.ts`
- UI: `app/partner/**`, `app/admin/**`
- Struktur aus PowerPoint: `docs/software-structure-from-ppt.md`
- Prozess aus PowerPoint: `docs/software-process-from-ppt.md`
- Konsolidiertes Pflichtenheft: `docs/pflichtenheft.md`
"# realestate_crm" 
