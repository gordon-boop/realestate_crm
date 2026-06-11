import { evaluateAcquisitionPrecheck, getAcquisitionPrecheckData, koCriteriaMessages } from "@/lib/acquisition-precheck";
import { handleApiError, json, requireRole } from "@/lib/api";
import { addDbActivity, getDbCaseByPropertyId, toPrismaJson } from "@/lib/persistence";
import { prisma } from "@/lib/prisma";
import { acquisitionPrecheckUpdateSchema } from "@/lib/validation";

function formatEuro(value: number | undefined): string {
  if (value === undefined) return "nicht erfasst";
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const user = requireRole("admin");
    const caseView = await getDbCaseByPropertyId(params.id);
    if (!caseView) throw new Error("Property not found");
    if (!["employee", "advisor", "admin", "super_admin"].includes(user.internalRole ?? "employee")) throw new Error("Forbidden");

    const input = acquisitionPrecheckUpdateSchema.parse(await request.json().catch(() => ({})));
    const canApproveException = ["admin", "super_admin"].includes(user.internalRole ?? "");
    if ((input.action === "approve_exception" || input.action === "reject_exception") && !canApproveException) {
      throw new Error("Forbidden");
    }

    const current = getAcquisitionPrecheckData(caseView.property);
    const next = {
      ...current,
      preliminaryMarketValue: input.preliminaryMarketValue ?? current.preliminaryMarketValue,
      preliminaryMarketValueSource: input.preliminaryMarketValueSource ?? current.preliminaryMarketValueSource,
      preliminaryMarketValueDate: input.preliminaryMarketValueDate ?? current.preliminaryMarketValueDate,
      preliminaryMarketValueComment: input.preliminaryMarketValueComment ?? current.preliminaryMarketValueComment,
      postbankRegionCategory: input.postbankRegionCategory ?? current.postbankRegionCategory,
      landValuePerSqm: input.landValuePerSqm ?? current.landValuePerSqm,
      remainingUsefulLifeYears: input.remainingUsefulLifeYears ?? current.remainingUsefulLifeYears,
      developmentPotential: input.developmentPotential ?? current.developmentPotential,
      renovationPlanAvailable: input.renovationPlanAvailable ?? current.renovationPlanAvailable,
      apartmentManagementAvailable: input.apartmentManagementAvailable ?? current.apartmentManagementAvailable,
      exceptionRequested: input.exceptionRequested ?? current.exceptionRequested,
      exceptionReason: input.exceptionReason ?? current.exceptionReason,
      comment: input.comment ?? current.comment,
      updatedAt: new Date().toISOString(),
      updatedByUserId: user.id
    };

    if (input.action === "request_exception") {
      next.exceptionRequested = true;
      next.exceptionApprovedAt = undefined;
      next.exceptionApprovedByUserId = undefined;
      next.exceptionRejectedAt = undefined;
      next.exceptionRejectedByUserId = undefined;
    }
    if (input.action === "approve_exception") {
      next.exceptionRequested = true;
      next.exceptionApprovedAt = new Date().toISOString();
      next.exceptionApprovedByUserId = user.id;
      next.exceptionRejectedAt = undefined;
      next.exceptionRejectedByUserId = undefined;
    }
    if (input.action === "reject_exception") {
      next.exceptionRequested = true;
      next.exceptionApprovedAt = undefined;
      next.exceptionApprovedByUserId = undefined;
      next.exceptionRejectedAt = new Date().toISOString();
      next.exceptionRejectedByUserId = user.id;
    }

    await prisma.property.update({
      where: { id: params.id },
      data: { acquisitionPrecheckJson: toPrismaJson(next) }
    });
    const updatedCaseView = await getDbCaseByPropertyId(params.id);
    if (!updatedCaseView) throw new Error("Property not found");
    const precheck = evaluateAcquisitionPrecheck(updatedCaseView);

    const activityMessage =
      input.action === "approve_exception"
        ? "Ausnahmeprüfung freigegeben."
        : input.action === "reject_exception"
          ? "Ausnahmeprüfung abgelehnt."
          : input.action === "request_exception"
            ? "Ausnahmeprüfung beantragt."
            : `Vorprüfung gespeichert: ${precheck.resultLabel}.`;

    await addDbActivity(params.id, user.id, "acquisition_precheck_saved", activityMessage, {
      source: "admin",
      entityType: "precheck",
      metadata: { visibility: "internal", result: precheck.result, action: input.action }
    });

    if (input.preliminaryMarketValue !== undefined && input.preliminaryMarketValue !== current.preliminaryMarketValue) {
      await addDbActivity(
        params.id,
        user.id,
        "preliminary_market_value_saved",
        current.preliminaryMarketValue === undefined
          ? `Vorläufiger Verkehrswert gespeichert: ${formatEuro(input.preliminaryMarketValue)}.`
          : `Vorläufiger Verkehrswert geändert: ${formatEuro(current.preliminaryMarketValue)} auf ${formatEuro(input.preliminaryMarketValue)}.`,
        { source: "admin", entityType: "precheck", metadata: { visibility: "internal" } }
      );
    }

    for (const message of koCriteriaMessages(precheck)) {
      await addDbActivity(params.id, user.id, "acquisition_precheck_ko", `KO-Kriterium festgestellt: ${message}`, {
        source: "admin",
        entityType: "precheck",
        metadata: { visibility: "internal", result: precheck.result }
      });
    }

    return json({ property: updatedCaseView.property, precheck, acquisitionPrecheck: next });
  } catch (err) {
    return handleApiError(err);
  }
}
