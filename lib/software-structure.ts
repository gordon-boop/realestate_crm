export const wohnkapitalSoftwareStructure = {
  brand: "WohnKapital",
  mainNavigation: [
    "Home",
    "Verrentung",
    "Leads",
    "Zwischengespeichert",
    "In Bearbeitung",
    "Bestand",
    "Verkauft",
    "Sonstiges",
    "Broschüre",
    "Postbank Atlas",
    "Leitfaden",
    "FAQs"
  ],
  intakeSteps: [
    "1. Schritt - persönliche Daten",
    "2. Schritt - Wunschmodell",
    "3. Schritt - Immobiliendaten",
    "4. Schritt - weitere Angaben und benötigte Dokumente"
  ],
  internalObjectTabsInProgress: ["Kunde", "Objekt", "Unverbindliches Angebot", "Verbindliches Angebot", "Objektunterlagen", "Aufgaben"],
  internalObjectTabsPortfolio: ["Kunde", "Objekt", "Konditionen / Vertragsdaten", "Objektunterlagen", "Aufgaben", "NK", "Instandh.", "Notizen"],
  documentChecklist: {
    house: ["Grundbuchauszug", "Fotos", "Bemaßte Grundrisse", "Energieausweis oder Vreed-Daten"],
    apartment: [
      "Grundbuchauszug",
      "Fotos",
      "Bemaßte Grundrisse",
      "Teilungserklärung",
      "Hausgeldabrechnungen der letzten 2 Jahre",
      "Eigentümerprotokolle der letzten 2 Jahre",
      "Nachweis Instandhaltungsrücklage"
    ]
  },
  exclusionCriteria: ["Erbbaurecht", "Denkmalschutz"]
} as const;

export const wohnkapitalProcessNotes = {
  valuationProvider: "sprengnetter",
  followUpReminder: "Benutzer muss beim Kunden nachfassen.",
  customerFeedbackClosesReminder: true,
  offerCalculationSource: "application"
} as const;
