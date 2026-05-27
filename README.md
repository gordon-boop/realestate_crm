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
