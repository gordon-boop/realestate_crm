import { z } from "zod";
import { parseGermanNumberInput } from "./utils/numberParsing.ts";

export const intakeDraftRequestSchema = z.object({
  draft: z.record(z.unknown()),
  currentStep: z.number().int().min(1).max(5),
  internalIntakeSource: z.string().trim().max(100).optional(),
  expectedUpdatedAt: z.string().datetime().optional()
});

export type IntakeDraftRequest = z.infer<typeof intakeDraftRequestSchema>;

export class DraftVersionConflictError extends Error {
  readonly code = "DRAFT_VERSION_CONFLICT";
  readonly currentUpdatedAt: string;

  constructor(currentUpdatedAt: Date) {
    super("Dieser Entwurf wurde zwischenzeitlich geändert. Bitte laden Sie den aktuellen Stand neu.");
    this.name = "DraftVersionConflictError";
    this.currentUpdatedAt = currentUpdatedAt.toISOString();
  }
}

const propertyTypes = new Set(["house", "single_family", "semi_detached", "row_house", "apartment"]);
const desiredModels = new Set(["fixed_residential_right", "sale_and_leaseback", "other"]);
const conditions = new Set(["very_good", "good", "average", "renovation_needed"]);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function draftSummary(draft: Record<string, unknown>) {
  const firstName = text(draft.firstName);
  const lastName = text(draft.lastName);
  const city = text(draft.city);
  const propertyType = text(draft.propertyType);
  const desiredModel = text(draft.desiredModel);
  const condition = text(draft.condition);
  return {
    firstName: firstName || "Entwurf",
    lastName: lastName || "Neukunde",
    displayName: [firstName, lastName].filter(Boolean).join(" ") || "Unvollständiger Entwurf",
    street: text(draft.street) || "Noch offen",
    postalCode: text(draft.postalCode) || "00000",
    city: city || "Ort offen",
    propertyType: propertyTypes.has(propertyType) ? propertyType : "single_family",
    desiredModel: desiredModels.has(desiredModel) ? desiredModel : "other",
    condition: conditions.has(condition) ? condition : "average",
    livingAreaSqm: Math.max(1, Math.round(parseGermanNumberInput(draft.livingAreaSqm) || 1)),
    plotAreaSqm: Math.max(0, Math.round(parseGermanNumberInput(draft.plotAreaSqm) || 0)),
    objectTitle: [propertyTypes.has(propertyType) ? propertyType : "Objekt", city || "Entwurf"].join(" ")
  };
}

export function hasMeaningfulDraftData(draft: Record<string, unknown>): boolean {
  const ignored = new Set(["documentUploads", "existingDocumentCategories"]);
  return Object.entries(draft).some(([key, value]) => {
    if (ignored.has(key) || value === undefined || value === null || value === "" || value === false) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
    return true;
  });
}

export function assertCurrentDraftVersion(actualUpdatedAt: Date, expectedUpdatedAt?: string): void {
  if (!expectedUpdatedAt) return;
  const expected = new Date(expectedUpdatedAt).getTime();
  if (!Number.isFinite(expected) || actualUpdatedAt.getTime() !== expected) {
    throw new DraftVersionConflictError(actualUpdatedAt);
  }
}
