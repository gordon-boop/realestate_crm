# Technische i18n-Grundlage

Das CRM verwendet `next-intl` mit einer gemeinsamen Komponentenbasis. Die aktive Sprache wird global über `DEFAULT_LOCALE` (Server) und `NEXT_PUBLIC_DEFAULT_LOCALE` (Browser-Bundle) gesteuert.

Unterstützte Locales:

- `de-DE` (vollständiger Fallback)
- `en-GB`

Die Kataloge liegen fachlich getrennt unter `messages/de` und `messages/en`. Beim Laden der englischen Kataloge werden fehlende Einträge rekursiv mit den deutschen Einträgen ergänzt. Der UI-Provider gibt bei einem vollständig unbekannten Schlüssel einen lesbaren Fallback aus und zeigt niemals den technischen Schlüssel an.

Für einen Sprachwechsel muss die Anwendung neu gebaut werden, weil `NEXT_PUBLIC_DEFAULT_LOCALE` beim Next.js-Build in das Browser-Bundle übernommen wird.

```env
DEFAULT_LOCALE=de-DE
NEXT_PUBLIC_DEFAULT_LOCALE=de-DE
```

Für die englische Umgebung:

```env
DEFAULT_LOCALE=en-GB
NEXT_PUBLIC_DEFAULT_LOCALE=en-GB
```
