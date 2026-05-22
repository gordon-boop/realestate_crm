import type { DocumentCategory, PropertyType } from "@/lib/domain";

export type RequiredDocumentDefinition = {
  category: DocumentCategory;
  label: string;
  note?: string;
};

const baseRequiredDocuments: RequiredDocumentDefinition[] = [
  { category: "land_register", label: "Aktueller Grundbuchauszug", note: "Pflicht. Falls keiner vorhanden ist, bitte Vollmacht Grundbuch ausstellen lassen." },
  { category: "power_of_attorney", label: "Vollmacht Grundbuch", note: "Pflicht, wenn der Grundbuchauszug nicht direkt vorliegt." },
  { category: "photos", label: "Aussagekräftige Objektfotos", note: "Innen, außen, Garten falls vorhanden, jeder Raum, Keller, Heizung und wertrelevante Besonderheiten." },
  { category: "floorplan", label: "Bemaßter Grundriss", note: "Pflicht für Haus und Wohnung." },
  { category: "section", label: "Schnitte / Ansichten", note: "Sofern vorhanden, besonders bei komplexen Grundrissen oder Anbauten." },
  { category: "living_area_calculation", label: "Wohnflächenberechnung", note: "Pflicht, wenn vorhanden; sonst später nach Gutachtenbeauftragung nachreichen." },
  { category: "energy_certificate", label: "Energieausweis", note: "Wenn vorhanden bitte hochladen, sonst später aus Verwaltung oder externer Quelle ergänzen." },
  { category: "repair_offer", label: "Reparatur- oder Sanierungsangebote", note: "Falls größere Mängel, Dach, Heizung, Feuchtigkeit oder Modernisierungen bekannt sind." },
  { category: "other", label: "Weitere objektbezogene Unterlagen", note: "Zum Beispiel Lageplan, Bauakte, Versicherungsunterlagen, Mietvertrag, Belastungen oder Sondervereinbarungen." }
];

const apartmentRequiredDocuments: RequiredDocumentDefinition[] = [
  { category: "declaration_of_division", label: "Teilungserklärung", note: "Pflicht bei Eigentumswohnungen inklusive Nachträgen." },
  { category: "service_charge_statement", label: "Hausgeldabrechnungen", note: "Pflicht, möglichst die letzten 2 Jahre." },
  { category: "owners_meeting_minutes", label: "Eigentümerversammlungsprotokolle", note: "Pflicht, möglichst die letzten 2 Jahre inklusive Beschlusssammlung." },
  { category: "maintenance_reserve", label: "Nachweis Instandhaltungsrücklage", note: "Pflicht, falls nicht eindeutig aus der Hausgeldabrechnung ersichtlich." }
];

export function getRequiredDocumentsForPropertyType(propertyType?: PropertyType | string | null) {
  if (propertyType === "apartment") {
    return [...baseRequiredDocuments, ...apartmentRequiredDocuments];
  }

  return baseRequiredDocuments;
}
