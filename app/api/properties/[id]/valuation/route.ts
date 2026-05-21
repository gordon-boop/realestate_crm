import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { ValuationProvider } from "@/lib/domain";
import { createMockValuation } from "@/lib/valuation-service";
import { addActivity, getCaseByPropertyId, store, updatePropertyStatus } from "@/lib/store";

export function GET(_request: Request, { params }: { params: { id: string } }): Response {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");
    return json({ valuation: caseView.valuation ?? null });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = getCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = await request.json().catch(() => ({}));
    const provider = String(body.provider ?? caseView.property.preferredValuationProvider ?? "sprengnetter") as ValuationProvider;
    updatePropertyStatus(params.id, "VALUATION_PENDING");
    const valuation = createMockValuation(caseView.property, provider);
    store.valuations.push(valuation);
    updatePropertyStatus(params.id, "VALUATED");
    addActivity(params.id, user.id, "valuation_created", `${provider}-Bewertung wurde über die Applikation erzeugt.`);
    return json({ valuation }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
