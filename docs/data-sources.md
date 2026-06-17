# Datenquellen

## OpenPLZ

Die lokale PLZ-Erkennung für Deutschland basiert auf OpenPLZ/Open-Data-Rohdaten.

- Quelle: OpenPLZ / OpenStreetMap-basierte Daten
- Lizenz: ODbL
- Verwendung im CRM: lokale Lookup-Datei `data/openplz-de-postal-codes.json`
- Laufzeitverhalten: keine externe API-Abfrage; die Anwendung nutzt ausschließlich die lokale Lookup-Datei.
- API für Formulare: `GET /api/geo/postal-code?postalCode=70173`
- Fallback-Kompatibilitätsroute: `GET /api/postal-codes/lookup?postalCode=70173`

Die Lookup-Datei enthält aktuell die für Demo-, Test- und vorhandene Seed-Daten relevanten deutschen PLZ-Ort-Bundesland-Zuordnungen. Für einen vollständigen Datenbestand kann eine OpenPLZ-CSV lokal importiert werden:

```bash
npx tsx scripts/import-openplz.ts data/openplz-de.csv data/openplz-de-postal-codes.json
```

Importierte Felder:

- `postalCode`
- `city`
- `federalState`
- `countyName`
- `countyCode`
