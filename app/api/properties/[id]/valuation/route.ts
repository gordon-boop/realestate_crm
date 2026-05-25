import { canCalculateOffer, canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import type { ValuationProvider } from "@/lib/domain";
import { addDbActivity, getDbCaseByPropertyId, toPrismaJson, updateDbPropertyStatus } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { createMockValuation } from "@/lib/valuation-service";

export async function GET(_request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canCalculateOffer(user, caseView.property)) throw new Error("Forbidden");
    return json({ valuation: caseView.valuation ?? null });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const body = await request.json().catch(() => ({}));
    const provider = String(body.provider ?? caseView.property.preferredValuationProvider ?? "sprengnetter") as ValuationProvider;
    await updateDbPropertyStatus(params.id, "VALUATION_PENDING");
    const result = createMockValuation(caseView.property, provider);
    const valuation = await prisma.valuation.create({
      data: {
        propertyId: params.id,
        provider: result.provider as never,
        status: result.status as never,
        sourceLabel: result.sourceLabel,
        marketValue: result.marketValue,
        valueMin: result.valueMin,
        valueMax: result.valueMax,
        confidenceScore: result.confidenceScore,
        rawResponseJson: toPrismaJson(result.rawResponseJson),
        startedAt: result.startedAt ? new Date(result.startedAt) : undefined,
        completedAt: result.completedAt ? new Date(result.completedAt) : undefined
      }
    });
    await updateDbPropertyStatus(params.id, "VALUATED");
    await addDbActivity(params.id, user.id, "valuation_created", `${provider}-Bewertung wurde über die Applikation erzeugt.`);
    return json({ valuation }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
