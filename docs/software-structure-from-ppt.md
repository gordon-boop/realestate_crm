# Software-Struktur aus `Software.pptx`

Die PowerPoint beschreibt die Zielstruktur für WohnKapital. Die aktuelle MVP-Implementierung bildet daraus die für den ersten Durchstich relevanten Flächen ab.

## Navigation

- Home
- Verrentung
- Leads, nur interne Sicht
- Zwischengespeichert
- In Bearbeitung
- Bestand
- Verkauft, nur interne Sicht
- Sonstiges
- Broschüre
- Postbank Atlas
- Leitfaden
- FAQs
- Suche
- Chat / Nachrichten

## Erfassungsbogen

1. Persönliche Daten: Name, Geschlecht, Geburtsdatum mit Alter, Familienstand, Adresse, Telefon, Mobil, E-Mail, Einkommensband.
2. Wunschmodell: Wohnrechtsberechtigte, Laufzeit 5 bis 15 Jahre, optionale zweite Laufzeit, Grund der Befristung, Abwahl der späteren Anmietoption.
3. Immobiliendaten: Typ, Baujahr, Wohnfläche, Grundstücksfläche, Nutzfläche, Miteigentumsanteile, Parkplatz, Keller, Heizung, Energieträger, Fenster, Asbest, Energieausweis, Optik, Ausschlusskriterium Erbbaurecht/Denkmalschutz, bekannte Mängel.
4. Weitere Angaben und Dokumente: Restschulden, Freitext, Grundbuch, Fotos, Grundrisse, Schnitte, Wohnflächenberechnung, Energieausweis, wohnungsspezifische WEG-Unterlagen.

## Interne Objektansicht

Für Objekte in Bearbeitung:

- Kunde
- Objekt
- Ind. AG
- Verb. AG
- Doks
- Aufgaben

Für Bestand:

- Kunde
- Objekt
- Konditionen / Vertragsdaten
- Doks
- Aufgaben
- NK
- Instandh.
- Notizen

## MVP-Abbildung

- Die Navigation ist im AppShell sichtbar.
- Startseiten haben Suche, Nachrichten-/Newsfeed-Platzhalter und Kartenplatzhalter.
- Das Prisma-Schema und die Domain-Typen enthalten die zusätzlichen Erfassungsfelder.
- Der Erfassungsbogen ist nach den vier PPT-Schritten gegliedert.
- Erbbaurecht/Denkmalschutz blockiert das Speichern als Ausschlusskriterium.
- Objektansichten zeigen die wichtigsten Objekt- und Kundeninformationen plus Reiterstruktur.
