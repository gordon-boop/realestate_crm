export const siteUrl = "https://www.wohn-kapital.de";

export const mainNavigation = [
  {
    label: "Lösungen",
    href: "/haus-verkaufen-wohnen-bleiben",
    items: [
      { label: "Haus verkaufen & wohnen bleiben", href: "/haus-verkaufen-wohnen-bleiben" },
      { label: "Wohnrecht auf Zeit", href: "/wohnrecht-auf-zeit" },
      { label: "Rückmietverkauf", href: "/sale-leaseback" },
      { label: "Alternative zum Teilverkauf", href: "/alternative-zum-teilverkauf" },
    ],
  },
  { label: "Sicherheit", href: "/sicherheit" },
  { label: "Ablauf", href: "/so-funktioniert-es" },
  { label: "FAQ", href: "/faq" },
  { label: "Partner", href: "/partner" },
] as const;

export const footerLinks = [
  { label: "Startseite", href: "/" },
  { label: "Haus verkaufen & wohnen bleiben", href: "/haus-verkaufen-wohnen-bleiben" },
  { label: "Wohnrecht auf Zeit", href: "/wohnrecht-auf-zeit" },
  { label: "Rückmietverkauf", href: "/sale-leaseback" },
  { label: "Alternative zum Teilverkauf", href: "/alternative-zum-teilverkauf" },
  { label: "Sicherheit", href: "/sicherheit" },
  { label: "Ablauf", href: "/so-funktioniert-es" },
  { label: "FAQ", href: "/faq" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Partner", href: "/partner" },
] as const;

export const productTeasers = [
  {
    title: "Haus verkaufen & wohnen bleiben",
    href: "/haus-verkaufen-wohnen-bleiben",
    text: "Kapital freisetzen, ohne das vertraute Zuhause sofort aufgeben zu müssen.",
  },
  {
    title: "Wohnrecht auf Zeit",
    href: "/wohnrecht-auf-zeit",
    text: "Befristetes, notariell geregeltes Wohnrecht mit klarer Laufzeit.",
  },
  {
    title: "Rückmietverkauf",
    href: "/sale-leaseback",
    text: "Immobilie verkaufen und als Mieter weiter darin wohnen.",
  },
  {
    title: "Alternative zum Teilverkauf",
    href: "/alternative-zum-teilverkauf",
    text: "Eine klare Alternative, wenn Sie keine Miteigentümerstruktur möchten.",
  },
] as const;

export const homeFaqs = [
  {
    q: "Kann ich wirklich in meinem Zuhause bleiben?",
    a: "Ja. Genau darauf sind die WohnKapital-Modelle ausgerichtet: Sie setzen Kapital frei und sichern die weitere Nutzung Ihres Zuhauses vertraglich ab.",
  },
  {
    q: "Wie wird der Immobilienwert ermittelt?",
    a: "Zunächst erfolgt eine erste Einschätzung auf Basis der Objekt- und Marktdaten. Für ein verbindliches Angebot wird ein unabhängiges Gutachten herangezogen.",
  },
  {
    q: "Wann erhalte ich mein Geld?",
    a: "Die Auszahlung erfolgt nach der vertraglich geregelten Abwicklung, in der Regel im Zusammenhang mit Notartermin und Grundbuchvollzug.",
  },
  {
    q: "Was passiert mit meinen Erben?",
    a: "Nach einem Verkauf gehört die Immobilie nicht mehr oder nicht mehr vollständig zum Nachlass. Deshalb ist es sinnvoll, Familie oder Vertrauenspersonen frühzeitig einzubeziehen.",
  },
  {
    q: "Ist das rechtlich abgesichert?",
    a: "Der Immobilienverkauf wird notariell beurkundet. Wohnrecht, Mietvertrag oder weitere Regelungen werden vor Abschluss transparent besprochen und rechtlich strukturiert.",
  },
] as const;

export const faqGroups = [
  {
    group: "Allgemein",
    items: [
      {
        q: "Was bedeutet Immobilienverrentung?",
        a: "Immobilienverrentung beschreibt Modelle, mit denen Eigentümer Kapital aus ihrer Immobilie freisetzen und trotzdem wohnen bleiben können.",
      },
      {
        q: "Für wen ist WohnKapital gedacht?",
        a: "WohnKapital richtet sich an Eigentümer, die ihre Immobilie verkaufen möchten, aber nicht sofort ausziehen wollen.",
      },
      {
        q: "Welche Modelle bietet WohnKapital an?",
        a: "Im Mittelpunkt stehen das Wohnrecht auf Zeit und der Rückmietverkauf. Welches Modell passt, hängt von Immobilie, Alter, Laufzeitwunsch und Liquiditätsbedarf ab.",
      },
    ],
  },
  {
    group: "Bewertung",
    items: [
      {
        q: "Wie wird der Wert meiner Immobilie ermittelt?",
        a: "Die Einschätzung berücksichtigt Lage, Zustand, Größe und Marktdaten. Für ein verbindliches Angebot wird ein unabhängiges Gutachten herangezogen.",
      },
      {
        q: "Ist die Ersteinschätzung kostenlos?",
        a: "Die erste Einschätzung ist unverbindlich und kostenfrei. Sie ersetzt kein Verkehrswertgutachten.",
      },
    ],
  },
  {
    group: "Wohnrecht",
    items: [
      {
        q: "Was ist ein Wohnrecht auf Zeit?",
        a: "Ein Wohnrecht auf Zeit erlaubt Ihnen, für eine vorher vereinbarte Dauer in der Immobilie wohnen zu bleiben. Die konkrete Ausgestaltung wird vertraglich und notariell geregelt.",
      },
      {
        q: "Wird das Wohnrecht im Grundbuch abgesichert?",
        a: "Beim Wohnrecht-Modell ist die grundbuchliche Absicherung ein zentraler Baustein. Die konkrete Rangstelle und Vertragsstruktur werden vor Abschluss transparent erläutert.",
      },
    ],
  },
  {
    group: "Auszahlung",
    items: [
      {
        q: "Wann erfolgt die Auszahlung?",
        a: "Die Auszahlung erfolgt nach der vertraglich vereinbarten Abwicklung, in der Regel im Zusammenhang mit Notartermin und Grundbuchvollzug.",
      },
      {
        q: "Kann ich die Auszahlung frei verwenden?",
        a: "Grundsätzlich ja. Viele Eigentümer nutzen sie für mehr finanziellen Spielraum, Familie, Umbauten, Pflege oder Rücklagen.",
      },
    ],
  },
  {
    group: "Notar & Grundbuch",
    items: [
      {
        q: "Warum ist ein Notartermin nötig?",
        a: "Der Verkauf einer Immobilie muss notariell beurkundet werden. Der Notar sorgt für eine rechtssichere Abwicklung.",
      },
      {
        q: "Kann ich den Vertrag vorher prüfen lassen?",
        a: "Ja. Wir empfehlen ausdrücklich, Unterlagen in Ruhe zu prüfen und bei Bedarf unabhängigen rechtlichen Rat einzuholen.",
      },
    ],
  },
  {
    group: "Kosten",
    items: [
      {
        q: "Gibt es versteckte Kosten?",
        a: "Kosten und Annahmen werden vor einer Entscheidung transparent dargestellt. Es werden keine Garantien oder versteckten Zusagen behauptet.",
      },
      {
        q: "Wer trägt Gutachten- und Notarkosten?",
        a: "Die Kostenstruktur wird im Angebot offen dargestellt. Je nach Modell und Ablauf kann WohnKapital bestimmte Kosten übernehmen.",
      },
    ],
  },
  {
    group: "Erben",
    items: [
      {
        q: "Sollte ich meine Familie einbeziehen?",
        a: "Ja. Gerade bei Immobilienentscheidungen ist es sinnvoll, Kinder oder Vertrauenspersonen frühzeitig einzubeziehen.",
      },
      {
        q: "Was bleibt für Erben?",
        a: "Nach Verkauf gehört die Immobilie nicht mehr zum Nachlass. Vererbbar bleibt das, was von der Auszahlung übrig ist.",
      },
    ],
  },
  {
    group: "Ablauf",
    items: [
      {
        q: "Wie lange dauert der Prozess?",
        a: "Das hängt von Unterlagen, Gutachten, Entscheidungszeit und Notartermin ab. WohnKapital strukturiert den Prozess in klare Schritte.",
      },
      {
        q: "Kann ich jederzeit Nein sagen?",
        a: "Bis zur Vertragsunterzeichnung beim Notar können Sie das Angebot prüfen und entscheiden, ob Sie weitergehen möchten.",
      },
    ],
  },
] as const;

export const processSteps = [
  {
    title: "Unverbindliches Beratungsgespräch",
    text: "Wir klären Ihre Situation, Ihre Immobilie und Ihre Ziele. Auf Wunsch beziehen wir Familie oder Vertrauenspersonen ein.",
  },
  {
    title: "Interne Marktwertermittlung",
    text: "WohnKapital erstellt eine erste Einschätzung und prüft, welches Modell grundsätzlich passen könnte.",
  },
  {
    title: "Unabhängiges Gutachten",
    text: "Ein Gutachten schafft eine nachvollziehbare Grundlage für das verbindliche Angebot.",
  },
  {
    title: "Verbindliches Angebot",
    text: "Sie erhalten Konditionen, Annahmen und Vertragsstruktur transparent aufbereitet.",
  },
  {
    title: "Notartermin",
    text: "Der Vertrag wird notariell beurkundet. Wohnrecht, Mietvertrag oder weitere Regelungen werden rechtssicher fixiert.",
  },
  {
    title: "Auszahlung nach Grundbucheintragung",
    text: "Die Auszahlung erfolgt nach den vertraglich geregelten Voraussetzungen.",
  },
] as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
