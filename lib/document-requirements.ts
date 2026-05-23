import type { DocumentCategory, PropertyType } from "@/lib/domain";

export type RequiredDocumentDefinition = {
  category: DocumentCategory;
  label: string;
  note?: string;
};

const baseRequiredDocuments: RequiredDocumentDefinition[] = [
  {
    category: "land_register",
    label: "Aktueller Grundbuchauszug",
    note: "Alternativ kann eine Vollmacht Grundbuch hochgeladen werden, wenn der Auszug noch nicht vorliegt."
  },
  {
    category: "photos",
    label: "Aussagekräftige Objektfotos",
    note: "Innen, außen, Garten falls vorhanden, jeder Raum, Keller, Heizung und wertrelevante Besonderheiten."
  },
  {
    category: "floorplan",
    label: "Bemaßter Grundriss",
    note: "Pflicht für Haus und Wohnung."
  },
  {
    category: "living_area_calculation",
    label: "Wohnflächenberechnung",
    note: "Pflichtunterlage für die erste Prüfung."
  }
];

const apartmentRequiredDocuments: RequiredDocumentDefinition[] = [
  {
    category: "declaration_of_division",
    label: "Teilungserklärung",
    note: "Pflicht bei Eigentumswohnungen inklusive Nachträgen."
  },
  {
    category: "service_charge_statement",
    label: "Hausgeldabrechnungen",
    note: "Pflicht, möglichst die letzten 2 Jahre."
  },
  {
    category: "owners_meeting_minutes",
    label: "Eigentümerversammlungsprotokolle",
    note: "Pflicht, möglichst die letzten 2 Jahre inklusive Beschlusssammlung."
  },
  {
    category: "maintenance_reserve",
    label: "Nachweis Instandhaltungsrücklage",
    note: "Pflicht, falls nicht eindeutig aus der Hausgeldabrechnung ersichtlich."
  }
];

const optionalObjectDocuments: RequiredDocumentDefinition[] = [
  {
    category: "power_of_attorney",
    label: "Vollmacht Grundbuch",
    note: "Nur erforderlich, wenn kein aktueller Grundbuchauszug hochgeladen wird."
  },
  {
    category: "section",
    label: "Schnitte / Ansichten",
    note: "Optional, sofern vorhanden."
  },
  {
    category: "energy_certificate",
    label: "Energieausweis",
    note: "Optional. Wenn vorhanden bitte hochladen."
  },
  {
    category: "repair_offer",
    label: "Reparatur- oder Sanierungsangebote",
    note: "Optional bei bekannten Mängeln oder geplanten Maßnahmen."
  },
  {
    category: "other",
    label: "Weitere objektbezogene Unterlagen",
    note: "Zum Beispiel Lageplan, Bauakte, Versicherungsunterlagen, Mietvertrag, Belastungen oder Sondervereinbarungen."
  }
];

export function getRequiredDocumentsForPropertyType(propertyType?: PropertyType | string | null) {
  if (propertyType === "apartment") {
    return [...baseRequiredDocuments, ...apartmentRequiredDocuments];
  }

  return baseRequiredDocuments;
}

export function getOptionalDocumentsForPropertyType(_propertyType?: PropertyType | string | null) {
  return optionalObjectDocuments;
}
