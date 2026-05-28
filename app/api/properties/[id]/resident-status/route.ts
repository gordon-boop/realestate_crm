import { canSeeProperty } from "@/lib/access-control";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { residentStatusUpdateSchema } from "@/lib/validation";

function dateOrNull(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!canSeeProperty(user, caseView.property)) throw new Error("Forbidden");

    const internalRole = user.internalRole ?? "employee";
    if (!["employee", "advisor", "admin", "super_admin"].includes(internalRole)) {
      throw new Error("Forbidden");
    }

    const body = residentStatusUpdateSchema.parse(await request.json());
    const now = new Date();
    const previousResidentStatus = caseView.property.residentStatus ?? "ACTIVE";
    const residentStatus = body.action === "deceased" ? "DECEASED" : "MOVE_OUT_PLANNED";
    const processDate = dateOrNull(body.action === "deceased" ? body.deathDate || body.reportedAt : body.moveOutDate) ?? now;
    const terminationReason = body.action === "deceased" ? "resident_death" : "move_out";
    const message = body.action === "deceased"
      ? "Bewohnerstatus geändert: Bewohner verstorben. Verkaufsprozess gestartet."
      : "Bewohnerstatus geändert: Bewohner zieht aus. Verkaufsprozess gestartet.";

    const [property, exitProcess] = await prisma.$transaction([
      prisma.property.update({
        where: { id: params.id },
        data: {
          residentStatus: residentStatus as never,
          residentStaysInProperty: false,
          residentMoveOutDate: body.action === "move_out" ? dateOrNull(body.moveOutDate) : caseView.property.residentMoveOutDate ? new Date(caseView.property.residentMoveOutDate) : null,
          residentDeathDate: body.action === "deceased" ? dateOrNull(body.deathDate) : null,
          residentStatusChangedAt: now,
          residentStatusChangedByUserId: user.id,
          residentStatusNote: body.note
        }
      }),
      prisma.propertyExitProcess.upsert({
        where: { propertyId: params.id },
        create: {
          propertyId: params.id,
          usageRightEndedAt: processDate,
          terminationReason,
          relativesOrEstateContact: body.relativesOrEstateContact ?? null,
          relativesContactedAt: body.action === "deceased" ? dateOrNull(body.reportedAt) : null,
          salesPreparationStartedAt: now,
          salesStatus: "sales_preparation",
          internalNote: body.note,
          responsibleUserId: user.id
        },
        update: {
          usageRightEndedAt: processDate,
          terminationReason,
          relativesOrEstateContact: body.relativesOrEstateContact ?? undefined,
          relativesContactedAt: body.action === "deceased" ? dateOrNull(body.reportedAt) : undefined,
          salesPreparationStartedAt: now,
          salesStatus: "sales_preparation",
          internalNote: body.note,
          responsibleUserId: user.id
        }
      })
    ]);

    await addDbActivity(params.id, user.id, "resident_status_changed", message, {
      source: "admin",
      entityType: "property",
      entityId: params.id,
      metadata: {
        previousResidentStatus,
        residentStatus,
        processStatus: "sales_preparation",
        note: body.note,
        visibility: "internal"
      }
    });

    return json({ property, exitProcess });
  } catch (err) {
    return handleApiError(err);
  }
}
