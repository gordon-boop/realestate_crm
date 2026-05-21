import type { DocumentCategory, PropertyType } from "@/lib/domain";

export type RequiredDocumentDefinition = {
  category: DocumentCategory;
  label: string;
  note?: string;
};

const baseRequiredDocuments: RequiredDocumentDefinition[] = [
  { category: "land_register", label: "Grundbuchauszug" },
  { category: "floorplan", label: "Bemaßter Grundriss" },
  { category: "living_area_calculation", label: "Wohnflächenberechnung" },
  { category: "energy_certificate", label: "Energieausweis" },
  { category: "photos", label: "Objektfotos innen und außen" }
];

const apartmentRequiredDocuments: RequiredDocumentDefinition[] = [
  { category: "declaration_of_division", label: "Teilungserklärung", note: "bei Eigentumswohnungen" },
  { category: "service_charge_statement", label: "Hausgeldabrechnung", note: "letzte 2 Jahre" },
  { category: "owners_meeting_minutes", label: "Eigentümerprotokolle", note: "letzte 2 Jahre" },
  { category: "maintenance_reserve", label: "Nachweis Instandhaltungsrücklage" }
];

export function getRequiredDocumentsForPropertyType(propertyType?: PropertyType | string | null) {
  if (propertyType === "apartment") {
    return [...baseRequiredDocuments, ...apartmentRequiredDocuments];
  }

  return baseRequiredDocuments;
}
