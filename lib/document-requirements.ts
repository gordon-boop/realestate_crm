import type { DocumentCategory, PropertyType } from "@/lib/domain";

export type RequiredDocumentDefinition = {
  category: DocumentCategory;
  label: string;
  note?: string;
};

const baseRequiredDocuments: RequiredDocumentDefinition[] = [
  { category: "land_register", label: "Aktueller Grundbuchauszug", note: "Pflicht. Falls keiner vorhanden ist, bitte Vollmacht Grundbuch ausstellen lassen." },
  { category: "photos", label: "Aussagekräftige Fotos", note: "Innen, außen, Garten falls vorhanden, jeder Raum, Keller, Heizung und wertrelevante Besonderheiten." },
  { category: "floorplan", label: "Bemaßter Grundriss", note: "Pflicht." },
  { category: "section", label: "Schnitte", note: "Sofern vorhanden." },
  { category: "living_area_calculation", label: "Wohnflächenberechnung", note: "Für das indikative Angebot optional, später nach Gutachtenbeauftragung relevant." },
  { category: "energy_certificate", label: "Energieausweis", note: "Wenn vorhanden bitte hochladen, sonst später aus Vreed, Verwaltung oder externer Quelle ergänzen." }
];

const apartmentRequiredDocuments: RequiredDocumentDefinition[] = [
  { category: "declaration_of_division", label: "Teilungserklärung", note: "Pflicht bei Eigentumswohnungen." },
  { category: "service_charge_statement", label: "Hausgeldabrechnungen", note: "Pflicht, letzte 2 Jahre." },
  { category: "owners_meeting_minutes", label: "Eigentümerversammlungsprotokolle", note: "Pflicht, letzte 2 Jahre." },
  { category: "maintenance_reserve", label: "Nachweis Instandhaltungsrücklage", note: "Falls nicht aus der Hausgeldabrechnung ersichtlich." }
];

export function getRequiredDocumentsForPropertyType(propertyType?: PropertyType | string | null) {
  if (propertyType === "apartment") {
    return [...baseRequiredDocuments, ...apartmentRequiredDocuments];
  }

  return baseRequiredDocuments;
}
