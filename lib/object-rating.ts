import type { ObjectRating, Property } from "./domain.ts";
import { addDbActivity } from "./persistence.ts";
import { prisma } from "./prisma.ts";

const ratingConfigInclude = {
  categories: { where: { active: true } },
  criteria: {
    where: { active: true },
    include: {
      category: true,
      fieldMappings: { where: { active: true } },
      scoreDefinitions: true
    }
  },
  returnCurves: true
};

const ratingInclude = {
  configVersion: true,
  scores: {
    include: { criterion: { include: { category: true, scoreDefinitions: { orderBy: { scoreValue: "asc" as const } } } } }
  },
  auditLogs: { orderBy: { timestamp: "desc" as const } }
};

const ratingCategoryOrder = [
  "Wirtschaftliche Faktoren",
  "Mikrolage",
  "Instandhaltungsaufwand",
  "Immobilie",
  "Energieausweis"
];

const roofCriterionId = "rating_crit_maintenance_roof_v1";
const flatRoofCriterionId = "rating_crit_maintenance_flat_roof_v1";
const investmentThreshold = 2.5;

export type InvestmentTreatmentKey =
  | "standard_approval"
  | "additional_review"
  | "below_acquisition_threshold"
  | "not_acquirable";

export type RatingReviewAfterAppraisalStatus =
  | "not_required"
  | "required"
  | "in_review"
  | "confirmed"
  | "adjusted"
  | "approved";

export type RatingInvestmentFilter = {
  score?: number;
  scoreBand?: 1 | 2 | 3 | 4 | 5 | 6;
  scoreBandLabel: string;
  treatmentKey: InvestmentTreatmentKey;
  treatmentLabel: string;
  targetReturnLabel: string;
  acquisitionThresholdPassed: boolean;
  nextAction: string;
  canProceedToOffer: boolean;
  blockReason?: string;
};

export type RatingGateStage = "indicative" | "binding";

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function latestRating(ratings: ObjectRating[] | undefined): ObjectRating | undefined {
  return ratings?.[0];
}

function scoreBand(score: number | undefined): RatingInvestmentFilter["scoreBand"] | undefined {
  if (score === undefined) return undefined;
  if (score >= 5.5) return 6;
  if (score >= 4.5) return 5;
  if (score >= 3.5) return 4;
  if (score >= 2.5) return 3;
  if (score >= 1.5) return 2;
  return 1;
}

export function deriveInvestmentFilter(rating?: Pick<ObjectRating, "totalScore" | "status"> | null): RatingInvestmentFilter {
  const score = toNumber(rating?.totalScore);
  const band = scoreBand(score);

  if (score === undefined || !rating) {
    return {
      scoreBandLabel: "Nicht bewertet",
      treatmentKey: "additional_review",
      treatmentLabel: "Rating erforderlich",
      targetReturnLabel: "Noch nicht final parametrisiert",
      acquisitionThresholdPassed: false,
      nextAction: "Objektrating abschließen",
      canProceedToOffer: false,
      blockReason: "Bitte schließen Sie zuerst das Objektrating ab."
    };
  }

  if (score < investmentThreshold) {
    return {
      score,
      scoreBand: band,
      scoreBandLabel: band === 1 ? "1 · Ungeeignet" : "2 · Unter Schwelle",
      treatmentKey: band === 1 ? "not_acquirable" : "below_acquisition_threshold",
      treatmentLabel: band === 1 ? "Nicht ankauffähig" : "Unterhalb der Ankaufsschwelle",
      targetReturnLabel: "Kein Angebot",
      acquisitionThresholdPassed: false,
      nextAction: "Ablehnung vorbereiten oder zurückstellen",
      canProceedToOffer: false,
      blockReason: "Objekt liegt unterhalb der Ankaufsschwelle."
    };
  }

  if (band === 3) {
    return {
      score,
      scoreBand: band,
      scoreBandLabel: "3 · Grenzfall",
      treatmentKey: "additional_review",
      treatmentLabel: "Zusätzliche Prüfung erforderlich",
      targetReturnLabel: "Erhöhte Zielrendite aus Ratingkurve",
      acquisitionThresholdPassed: true,
      nextAction: rating.status === "approved" ? "Angebotsstrecke mit erhöhter Prüfung fortsetzen" : "Rating intern prüfen und freigeben",
      canProceedToOffer: rating.status === "approved"
    };
  }

  const scoreBandLabel = band === 6
    ? "6 · Top-Objekt"
    : band === 5
      ? "5 · Starkes Objekt"
      : "4 · Solides Objekt";
  const targetReturnLabel = band === 6
    ? "Niedrigste Zielrendite aus Ratingkurve"
    : band === 5
      ? "Reduzierte Zielrendite aus Ratingkurve"
      : "Normale Zielrendite aus Ratingkurve";

  return {
    score,
    scoreBand: band,
    scoreBandLabel,
    treatmentKey: "standard_approval",
    treatmentLabel: "Standardfreigabe",
    targetReturnLabel,
    acquisitionThresholdPassed: true,
    nextAction: rating.status === "approved" ? "Angebotsstrecke fortsetzen" : "Rating freigeben",
    canProceedToOffer: rating.status === "approved"
  };
}

export function isObjectRatingComplete(rating?: ObjectRating | null): boolean {
  if (!rating) return false;
  return !rating.scores.some((score) => scoreIsRequiredForApproval(rating.scores, score) && !score.finalScore);
}

export function missingObjectRatingCriteria(rating?: ObjectRating | null): string[] {
  if (!rating) return [];
  return rating.scores
    .filter((score) => scoreIsRequiredForApproval(rating.scores, score) && !score.finalScore)
    .map((score) => score.criterion?.name || score.criterionId);
}

function objectRatingGateReason(rating: ObjectRating | undefined, complete: boolean, approved: boolean): string {
  if (!rating) return "Bitte erstellen Sie zuerst das Objektrating.";
  if (!complete) {
    const missing = missingObjectRatingCriteria(rating);
    return missing.length
      ? `Bitte schließen Sie zuerst das Objektrating ab. Fehlende Kriterien: ${missing.slice(0, 5).join(", ")}.`
      : "Bitte schließen Sie zuerst das Objektrating ab.";
  }
  if (!approved) return "Bitte geben Sie zuerst das Objektrating frei.";
  return "Bitte schließen Sie zuerst das Objektrating ab.";
}

function asDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function ratingReviewAfterAppraisalStatus(
  rating: ObjectRating | undefined,
  property: Pick<Property, "expertOpinionReceivedAt">
): { status: RatingReviewAfterAppraisalStatus; label: string; required: boolean; satisfied: boolean } {
  const appraisalReceivedAt = asDate(property.expertOpinionReceivedAt);
  if (!appraisalReceivedAt) {
    return { status: "not_required", label: "Noch nicht erforderlich", required: false, satisfied: true };
  }
  if (!rating) {
    return { status: "required", label: "Erforderlich", required: true, satisfied: false };
  }
  if (rating.status !== "approved") {
    return { status: "in_review", label: "In Prüfung", required: true, satisfied: false };
  }
  const approvedAt = asDate(rating.approvedAt);
  if (!approvedAt || approvedAt < appraisalReceivedAt) {
    return { status: "required", label: "Erforderlich", required: true, satisfied: false };
  }
  const adjustedAfterAppraisal = rating.auditLogs?.some((entry) =>
    entry.action === "score_changed" && asDate(entry.timestamp) && asDate(entry.timestamp)! >= appraisalReceivedAt
  );
  return {
    status: adjustedAfterAppraisal ? "adjusted" : "confirmed",
    label: adjustedAfterAppraisal ? "Angepasst" : "Bestätigt",
    required: true,
    satisfied: true
  };
}

export function evaluateRatingGate(
  ratings: ObjectRating[] | undefined,
  property: Pick<Property, "expertOpinionReceivedAt">,
  stage: RatingGateStage
) {
  const rating = latestRating(ratings);
  const investment = deriveInvestmentFilter(rating);
  const complete = isObjectRatingComplete(rating);
  const approved = rating?.status === "approved";
  const review = ratingReviewAfterAppraisalStatus(rating, property);

  if (!rating || !complete || !approved) {
    return {
      allowed: false,
      rating,
      investment,
      review,
      reason: objectRatingGateReason(rating, complete, approved)
    };
  }

  if (!investment.acquisitionThresholdPassed) {
    return {
      allowed: false,
      rating,
      investment,
      review,
      reason: investment.blockReason ?? "Objekt liegt unterhalb der Ankaufsschwelle."
    };
  }

  if (stage === "binding" && !review.satisfied) {
    return {
      allowed: false,
      rating,
      investment,
      review,
      reason: "Bitte schließen Sie zuerst das Rating-Review nach Gutachten ab."
    };
  }

  return { allowed: true, rating, investment, review };
}

export function assertRatingAllowsOffer(
  ratings: ObjectRating[] | undefined,
  property: Pick<Property, "expertOpinionReceivedAt">,
  stage: RatingGateStage
) {
  const gate = evaluateRatingGate(ratings, property, stage);
  if (!gate.allowed) throw new Error(gate.reason);
  return gate;
}

function getPathValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function documentStatus(property: { documents?: Array<{ category?: string; status?: string }> }, category: string): string | undefined {
  return property.documents?.find((document) => document.category === category)?.status;
}

function ratingCategorySortValue(category: { name?: string | null }) {
  const index = ratingCategoryOrder.indexOf(String(category.name ?? ""));
  return index === -1 ? ratingCategoryOrder.length : index;
}

function resolveRoofCriterionMode(scores: Array<{ criterionId: string; finalScore?: number | null }>) {
  const roof = scores.find((score) => score.criterionId === roofCriterionId);
  const flatRoof = scores.find((score) => score.criterionId === flatRoofCriterionId);
  const hasRoof = Number.isFinite(toNumber(roof?.finalScore));
  const hasFlatRoof = Number.isFinite(toNumber(flatRoof?.finalScore));
  if (hasRoof && !hasFlatRoof) return "roof";
  if (hasFlatRoof && !hasRoof) return "flat_roof";
  return undefined;
}

export function scoreFromRule(value: unknown, mappingRule: unknown, property: { documents?: Array<{ category?: string; status?: string }> } = {}): number | undefined {
  const rule = mappingRule && typeof mappingRule === "object" ? mappingRule as Record<string, unknown> : {};
  const type = String(rule.type ?? "presence");
  if (type === "boolean") {
    if (typeof value !== "boolean") return undefined;
    return Number(value ? rule.trueScore : rule.falseScore);
  }
  if (type === "enum") {
    const score = (rule.scores as Record<string, unknown> | undefined)?.[String(value)];
    return toNumber(score ?? rule.defaultScore);
  }
  if (type === "range") {
    const n = toNumber(value);
    if (n === undefined) return undefined;
    const ranges = Array.isArray(rule.ranges) ? rule.ranges as Array<Record<string, unknown>> : [];
    const matched = ranges.find((range) => {
      const min = toNumber(range.min);
      const max = toNumber(range.max);
      return (min === undefined || n >= min) && (max === undefined || n <= max);
    });
    return toNumber(matched?.score ?? rule.defaultScore);
  }
  if (type === "document_status") {
    const category = String(rule.category ?? value ?? "");
    const status = documentStatus(property, category);
    if (!status) return toNumber(rule.missingScore);
    const scores = rule.scores as Record<string, unknown> | undefined;
    return toNumber(scores?.[status] ?? rule.defaultScore);
  }
  if (value === undefined || value === null || value === "") return toNumber(rule.missingScore);
  return toNumber(rule.presentScore ?? rule.defaultScore ?? 4);
}

function confidenceFromRule(value: unknown, confidenceRule: unknown, score?: number): number {
  const rule = confidenceRule && typeof confidenceRule === "object" ? confidenceRule as Record<string, unknown> : {};
  if (score === undefined) return toNumber(rule.missing) ?? 0.2;
  if (value === undefined || value === null || value === "") return toNumber(rule.missing) ?? 0.35;
  return toNumber(rule.default) ?? 0.8;
}

function criterionWeight(criterion: { weight: unknown; weightOverrides?: unknown }, context?: { propertyType?: string | null }): number {
  const overrides = criterion.weightOverrides && typeof criterion.weightOverrides === "object"
    ? criterion.weightOverrides as Record<string, unknown>
    : undefined;
  const propertyType = context?.propertyType;
  const overrideKey = propertyType === "apartment" ? "apartment" : propertyType ? "house" : "";
  return toNumber(overrides?.[overrideKey]) ?? toNumber(criterion.weight) ?? 0;
}

function targetReturnFromCurve(curve: { baseTargetReturn: unknown; returnRule?: unknown }, totalScore?: number): number | undefined {
  if (totalScore === undefined) return undefined;
  const rule = curve.returnRule && typeof curve.returnRule === "object" ? curve.returnRule as Record<string, unknown> : undefined;
  if (rule?.type === "linear") {
    const minScore = toNumber(rule.minScore);
    const maxScore = toNumber(rule.maxScore);
    const minReturn = toNumber(rule.minReturn);
    const maxReturn = toNumber(rule.maxReturn);
    if (minScore !== undefined && maxScore !== undefined && minReturn !== undefined && maxReturn !== undefined && maxScore !== minScore) {
      const ratio = Math.min(1, Math.max(0, (totalScore - minScore) / (maxScore - minScore)));
      return Number((minReturn + ratio * (maxReturn - minReturn)).toFixed(4));
    }
  }
  return toNumber(curve.baseTargetReturn);
}

function returnBoundsFromCurve(curve: { lowerReturnBound: unknown; upperReturnBound: unknown; returnRule?: unknown }, targetReturn?: number) {
  const rule = curve.returnRule && typeof curve.returnRule === "object" ? curve.returnRule as Record<string, unknown> : undefined;
  const adjustmentBounds = rule?.adjustmentBounds && typeof rule.adjustmentBounds === "object"
    ? rule.adjustmentBounds as Record<string, unknown>
    : undefined;
  if (targetReturn !== undefined && adjustmentBounds) {
    const lowerAdjustment = toNumber(adjustmentBounds.lower) ?? 0;
    const upperAdjustment = toNumber(adjustmentBounds.upper) ?? 0;
    return {
      lower: Number((targetReturn + lowerAdjustment).toFixed(4)),
      upper: Number((targetReturn + upperAdjustment).toFixed(4))
    };
  }
  return {
    lower: toNumber(curve.lowerReturnBound),
    upper: toNumber(curve.upperReturnBound)
  };
}

function weightedAverage(items: Array<{ value?: number; weight: number }>): number | undefined {
  const usable = items.filter((item) => Number.isFinite(item.value) && item.weight > 0) as Array<{ value: number; weight: number }>;
  const totalWeight = usable.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return undefined;
  return Number((usable.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight).toFixed(2));
}

export function calculateRating(config: Awaited<ReturnType<typeof getActiveRatingVersion>>, scores: Array<{ criterionId: string; finalScore?: number }>, context?: { propertyType?: string | null }) {
  if (!config) throw new Error("No active rating version configured");
  const scoreByCriterion = new Map(scores.map((score) => [score.criterionId, score.finalScore]));
  const roofMode = resolveRoofCriterionMode(scores);
  const sortedCategories = [...config.categories].sort((a, b) => ratingCategorySortValue(a) - ratingCategorySortValue(b));
  const categoryScores = sortedCategories.map((category) => {
    const criteria = config.criteria.filter((criterion) => criterion.categoryId === category.id);
    return {
      category,
      score: weightedAverage(criteria.map((criterion) => ({
        value: scoreByCriterion.get(criterion.id),
        weight: criterion.id === roofCriterionId
          ? roofMode === "roof" ? criterionWeight(criterion, context) : 0
          : criterion.id === flatRoofCriterionId
            ? roofMode === "flat_roof" ? criterionWeight(criterion, context) : 0
            : criterionWeight(criterion, context)
      })))
    };
  });
  const totalScore = weightedAverage(categoryScores.map((item) => ({
    value: item.score,
    weight: toNumber(item.category.weight) ?? 0
  })));
  const curve = config.returnCurves.find((item) => {
    const min = toNumber(item.minScore) ?? 0;
    const max = toNumber(item.maxScore) ?? 0;
    return totalScore !== undefined && totalScore >= min && totalScore <= max;
  });
  return {
    categoryScores,
    totalScore,
    curve,
    targetReturn: curve ? targetReturnFromCurve(curve, totalScore) : undefined,
    returnBounds: curve ? returnBoundsFromCurve(curve, targetReturnFromCurve(curve, totalScore)) : { lower: undefined, upper: undefined }
  };
}

export async function getActiveRatingVersion() {
  return prisma.ratingVersion.findFirst({
    where: { active: true },
    orderBy: { versionNumber: "desc" },
    include: ratingConfigInclude
  });
}

export async function createDraftObjectRating(propertyId: string, userId?: string): Promise<ObjectRating | undefined> {
  const config = await getActiveRatingVersion();
  if (!config) return undefined;
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { documents: true, objectRatings: { where: { configVersionId: config.id }, include: ratingInclude } }
  });
  if (!property) throw new Error("Property not found");
  const existing = property.objectRatings[0];
  if (existing?.status === "approved") return existing as unknown as ObjectRating;

  const preparedScores = config.criteria.map((criterion) => {
    const mapping = criterion.fieldMappings[0];
    const rawValue = mapping?.sourceType === "document"
      ? mapping.sourceField
      : getPathValue({ property }, mapping?.sourceField || "");
    const prefilledScore = mapping ? scoreFromRule(rawValue, mapping.mappingRule, property) : undefined;
    const confidence = mapping ? confidenceFromRule(rawValue, mapping.confidenceRule, prefilledScore) : 0.2;
    return {
      criterionId: criterion.id,
      prefilledScore,
      analystScore: null,
      finalScore: prefilledScore ?? null,
      source: mapping?.sourceType ?? criterion.sourceType,
      confidence
    };
  });
  const computed = calculateRating(config, preparedScores.map((score) => ({ criterionId: score.criterionId, finalScore: score.finalScore ?? undefined })), { propertyType: property.propertyType });
  const openReview = preparedScores.some((score) => score.prefilledScore === undefined || score.confidence < 0.65);
  const ratingData = {
    totalScore: computed.totalScore,
    ratingClass: computed.curve?.ratingClass,
    baseTargetReturn: computed.targetReturn ?? computed.curve?.baseTargetReturn,
    lowerReturnBound: computed.returnBounds.lower ?? computed.curve?.lowerReturnBound,
    upperReturnBound: computed.returnBounds.upper ?? computed.curve?.upperReturnBound,
    finalTargetReturn: computed.targetReturn ?? computed.curve?.baseTargetReturn,
    status: openReview ? "analyst_review" as const : "draft" as const
  };
  const rating = existing
    ? await prisma.objectRating.update({
      where: { id: existing.id },
      data: ratingData,
      include: ratingInclude
    })
    : await prisma.objectRating.create({
      data: {
        objectId: propertyId,
        configVersionId: config.id,
        ...ratingData,
        scores: { create: preparedScores }
      },
      include: ratingInclude
    });

  if (existing) {
    const activeCriterionIds = preparedScores.map((score) => score.criterionId);
    await prisma.objectRatingScore.deleteMany({
      where: {
        objectRatingId: rating.id,
        criterionId: { notIn: activeCriterionIds }
      }
    });
    await Promise.all(preparedScores.map((score) => prisma.objectRatingScore.upsert({
      where: { objectRatingId_criterionId: { objectRatingId: rating.id, criterionId: score.criterionId } },
      create: { objectRatingId: rating.id, ...score },
      update: { prefilledScore: score.prefilledScore, finalScore: score.finalScore, source: score.source, confidence: score.confidence }
    })));
  }

  await prisma.ratingAuditLog.create({
    data: {
      objectRatingId: rating.id,
      entityType: "rating",
      action: existing ? "rating_recalculated" : "rating_created",
      newValue: { totalScore: computed.totalScore, ratingClass: computed.curve?.ratingClass },
      userId: userId ?? null,
      comment: "Automatisches Objektrating nach Einreichung erzeugt."
    }
  });
  if (userId) {
    await addDbActivity(propertyId, userId, "object_rating_created", "Vorläufiges Objektrating wurde erzeugt.", {
      source: "system",
      entityType: "rating",
      entityId: rating.id,
      metadata: { visibility: "internal" }
    });
  }
  return getObjectRating(rating.id) as Promise<ObjectRating>;
}

export async function getObjectRating(ratingId: string) {
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId }, include: ratingInclude });
  if (!rating) return undefined;
  return rating as unknown as ObjectRating;
}

export async function getLatestObjectRating(propertyId: string) {
  const rating = await prisma.objectRating.findFirst({ where: { objectId: propertyId }, orderBy: { createdAt: "desc" }, include: ratingInclude });
  return rating as unknown as ObjectRating | undefined;
}

export async function summarizeObjectRating(ratingId: string) {
  const rating = await prisma.objectRating.findUnique({
    where: { id: ratingId },
    include: { ...ratingInclude, object: { select: { propertyType: true, expertOpinionReceivedAt: true } }, configVersion: { include: ratingConfigInclude } }
  });
  if (!rating) return undefined;
  const computed = calculateRating(rating.configVersion, rating.scores.map((score) => ({
    criterionId: score.criterionId,
    finalScore: score.finalScore ?? undefined
  })), { propertyType: rating.object.propertyType });
  const openChecks = rating.scores.filter((score) => !score.finalScore || Number(score.confidence ?? 0) < 0.65);
  const investment = deriveInvestmentFilter(rating as unknown as ObjectRating);
  const reviewAfterAppraisal = ratingReviewAfterAppraisalStatus(rating as unknown as ObjectRating, { expertOpinionReceivedAt: rating.object.expertOpinionReceivedAt?.toISOString() });
  return { rating, categoryScores: computed.categoryScores, openChecks, investment, reviewAfterAppraisal };
}

export async function updateObjectRatingScore(ratingId: string, scoreId: string, userId: string, input: { analystScore?: number | null; finalScore?: number | null; comment?: string | null }) {
  const updated = await updateObjectRatingScores(ratingId, userId, [{
    scoreId,
    analystScore: input.analystScore,
    finalScore: input.finalScore,
    comment: input.comment
  }]);
  return updated[0];
}

function scoreNeedsComment(prefilledScore: unknown, finalScore: number | null | undefined): boolean {
  if (finalScore === null || finalScore === undefined) return false;
  const autoScore = toNumber(prefilledScore);
  return autoScore !== undefined && Number(finalScore) !== autoScore;
}

function normalizedScoreValue(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 6) throw new Error("Score required");
  return parsed;
}

export async function updateObjectRatingScores(
  ratingId: string,
  userId: string,
  updates: Array<{ scoreId: string; analystScore?: number | null; finalScore?: number | null; comment?: string | null }>
) {
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId }, include: ratingInclude });
  if (!rating) throw new Error("Rating not found");
  if (rating.status === "approved") throw new Error("Freigegebene Ratings sind schreibgeschützt.");

  const byId = new Map(rating.scores.map((score) => [score.id, score]));
  const expandedUpdates = [...updates];
  for (const update of updates) {
    const current = byId.get(update.scoreId);
    if (!current) throw new Error("Rating score not found");
    const requestedScore = normalizedScoreValue(update.finalScore ?? update.analystScore);
    if (requestedScore === undefined || requestedScore === null) continue;
    const mutuallyExcludedCriterionId = current.criterionId === roofCriterionId
      ? flatRoofCriterionId
      : current.criterionId === flatRoofCriterionId
        ? roofCriterionId
        : undefined;
    if (!mutuallyExcludedCriterionId) continue;
    const excluded = rating.scores.find((score) => score.criterionId === mutuallyExcludedCriterionId);
    if (excluded && !expandedUpdates.some((item) => item.scoreId === excluded.id)) {
      expandedUpdates.push({ scoreId: excluded.id, analystScore: null, finalScore: null, comment: null });
    }
  }

  const updatedScores = [];
  for (const update of expandedUpdates) {
    const current = byId.get(update.scoreId);
    if (!current) throw new Error("Rating score not found");
    const requestedScore = normalizedScoreValue(update.finalScore ?? update.analystScore);
    const finalScore = requestedScore === undefined
      ? toNumber(current.finalScore ?? current.analystScore ?? current.prefilledScore) ?? null
      : requestedScore;
    const comment = String(update.comment ?? current.comment ?? "").trim();
    if (scoreNeedsComment(current.prefilledScore, finalScore) && !comment) {
      throw new Error("Bitte begründen Sie die manuelle Änderung.");
    }
    const nextData = finalScore === null
      ? {
          analystScore: null,
          finalScore: null,
          comment: null,
          changedByUserId: userId,
          changedAt: new Date(),
          confidence: 0.2
        }
      : {
          analystScore: finalScore,
          finalScore,
          comment: comment || null,
          changedByUserId: userId,
          changedAt: new Date(),
          confidence: scoreNeedsComment(current.prefilledScore, finalScore) ? 1 : current.confidence
        };
    const updated = await prisma.objectRatingScore.update({
      where: { id: update.scoreId },
      data: nextData
    });
    updatedScores.push(updated);
    const changed =
      toNumber(current.finalScore) !== toNumber(finalScore) ||
      (current.comment ?? "") !== (nextData.comment ?? "");
    if (changed) {
      await prisma.ratingAuditLog.create({
        data: {
          objectRatingId: ratingId,
          entityType: "score",
          entityId: update.scoreId,
          action: "score_changed",
          oldValue: { finalScore: current.finalScore, analystScore: current.analystScore, comment: current.comment },
          newValue: { finalScore, analystScore: finalScore, comment: nextData.comment },
          comment: nextData.comment,
          userId
        }
      });
    }
  }

  await recalculateObjectRating(ratingId);
  return updatedScores;
}

export async function updateObjectRatingReturn(ratingId: string, userId: string, finalTargetReturn: number) {
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId } });
  if (!rating) throw new Error("Rating not found");
  if (rating.status === "approved") throw new Error("Freigegebene Ratings sind schreibgeschützt.");
  const lower = toNumber(rating.lowerReturnBound);
  const upper = toNumber(rating.upperReturnBound);
  if (lower !== undefined && finalTargetReturn < lower || upper !== undefined && finalTargetReturn > upper) {
    throw new Error("Finale Zielrendite muss innerhalb des zulässigen Korridors liegen.");
  }
  const updated = await prisma.objectRating.update({ where: { id: ratingId }, data: { finalTargetReturn } });
  await prisma.ratingAuditLog.create({
    data: {
      objectRatingId: ratingId,
      entityType: "rating",
      action: "target_return_changed",
      oldValue: { finalTargetReturn: rating.finalTargetReturn },
      newValue: { finalTargetReturn },
      userId
    }
  });
  return updated;
}

function scoreIsRequiredForApproval(scores: Array<{ criterionId: string; finalScore?: number | null }>, score: { criterionId: string }) {
  const roofMode = resolveRoofCriterionMode(scores);
  if (score.criterionId === roofCriterionId && roofMode === "flat_roof") return false;
  if (score.criterionId === flatRoofCriterionId && roofMode === "roof") return false;
  return true;
}

function formatReturnForActivity(value: unknown) {
  const parsed = toNumber(value);
  if (parsed === undefined) return "-";
  return `${(parsed * 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} %`;
}

export async function approveObjectRating(ratingId: string, userId: string) {
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId }, include: { scores: true } });
  if (!rating) throw new Error("Rating not found");
  const missingFinalScore = rating.scores.some((score) => scoreIsRequiredForApproval(rating.scores, score) && !score.finalScore);
  if (missingFinalScore) {
    throw new Error("Alle aktiven Kriterien benötigen einen finalen Score.");
  }
  const missingManualComment = rating.scores.some((score) =>
    scoreIsRequiredForApproval(rating.scores, score) &&
    scoreNeedsComment(score.prefilledScore, score.finalScore) &&
    !String(score.comment ?? "").trim()
  );
  if (missingManualComment) {
    throw new Error("Bitte begründen Sie die manuelle Änderung.");
  }
  const investment = deriveInvestmentFilter(rating as unknown as ObjectRating);
  const updated = await prisma.objectRating.update({
    where: { id: ratingId },
    data: { status: "approved", approvedAt: new Date(), approvedByUserId: userId }
  });
  await prisma.ratingAuditLog.create({
    data: {
      objectRatingId: ratingId,
      entityType: "rating",
      action: "rating_approved",
      newValue: {
        status: "approved",
        finalTargetReturn: rating.finalTargetReturn,
        investmentTreatment: investment.treatmentKey,
        investmentTreatmentLabel: investment.treatmentLabel,
        acquisitionThresholdPassed: investment.acquisitionThresholdPassed
      },
      userId,
      comment: `Objektrating freigegeben. Rating: ${toNumber(rating.totalScore)?.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) ?? "-"}. Behandlung: ${investment.treatmentLabel}.`
    }
  });
  await addDbActivity(rating.objectId, userId, "object_rating_approved", `Objektrating freigegeben. Rating: ${toNumber(rating.totalScore)?.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) ?? "-"}. Behandlung: ${investment.treatmentLabel}.`, {
    source: "admin",
    entityType: "rating",
    entityId: ratingId,
    metadata: {
      visibility: "internal",
      finalTargetReturn: toNumber(rating.finalTargetReturn),
      investmentTreatment: investment.treatmentKey,
      investmentTreatmentLabel: investment.treatmentLabel,
      acquisitionThresholdPassed: investment.acquisitionThresholdPassed
    }
  });
  return updated;
}

export async function unlockObjectRating(ratingId: string, userId: string, reason: string) {
  const trimmedReason = reason.trim();
  if (!trimmedReason) throw new Error("Bitte geben Sie einen Grund für die Freischaltung an.");
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId } });
  if (!rating) throw new Error("Rating not found");
  if (rating.status !== "approved") return rating;
  const updated = await prisma.objectRating.update({
    where: { id: ratingId },
    data: {
      status: "analyst_review",
      approvedAt: null,
      approvedByUserId: null
    }
  });
  await prisma.ratingAuditLog.create({
    data: {
      objectRatingId: ratingId,
      entityType: "rating",
      action: "rating_unlocked",
      oldValue: { status: rating.status, approvedAt: rating.approvedAt, approvedByUserId: rating.approvedByUserId },
      newValue: { status: "analyst_review" },
      userId,
      comment: `Objektrating wurde durch Admin wieder freigeschaltet. Grund: ${trimmedReason}`
    }
  });
  await addDbActivity(rating.objectId, userId, "object_rating_unlocked", `Objektrating wurde durch Admin wieder freigeschaltet. Grund: ${trimmedReason}`, {
    source: "admin",
    entityType: "rating",
    entityId: ratingId,
    metadata: { visibility: "internal", reason: trimmedReason }
  });
  return updated;
}

export async function recalculateObjectRating(ratingId: string) {
  const rating = await prisma.objectRating.findUnique({
    where: { id: ratingId },
    include: { scores: true, configVersion: { include: ratingConfigInclude } }
  });
  if (!rating) throw new Error("Rating not found");
  const property = await prisma.property.findUnique({ where: { id: rating.objectId }, select: { propertyType: true } });
  const computed = calculateRating(rating.configVersion, rating.scores.map((score) => ({ criterionId: score.criterionId, finalScore: score.finalScore ?? undefined })), { propertyType: property?.propertyType });
  return prisma.objectRating.update({
    where: { id: ratingId },
    data: {
      totalScore: computed.totalScore,
      ratingClass: computed.curve?.ratingClass,
      baseTargetReturn: computed.targetReturn ?? computed.curve?.baseTargetReturn,
      lowerReturnBound: computed.returnBounds.lower ?? computed.curve?.lowerReturnBound,
      upperReturnBound: computed.returnBounds.upper ?? computed.curve?.upperReturnBound,
      finalTargetReturn: computed.targetReturn ?? computed.curve?.baseTargetReturn,
      status: "analyst_review"
    }
  });
}

async function updateObjectRatingScoreLegacy(ratingId: string, scoreId: string, userId: string, input: { analystScore?: number; finalScore?: number; comment: string }) {
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId }, include: ratingInclude });
  if (!rating) throw new Error("Rating not found");
  if (rating.status === "approved") throw new Error("Freigegebene Ratings sind schreibgeschützt.");
  const current = rating.scores.find((score) => score.id === scoreId);
  if (!current) throw new Error("Rating score not found");
  const analystScore = input.analystScore ?? input.finalScore ?? undefined;
  if (!analystScore) throw new Error("Score required");
  const updated = await prisma.objectRatingScore.update({
    where: { id: scoreId },
    data: {
      analystScore,
      finalScore: analystScore,
      comment: input.comment,
      changedByUserId: userId,
      changedAt: new Date(),
      confidence: 1
    }
  });
  const mutuallyExcludedCriterionId = current.criterionId === roofCriterionId
    ? flatRoofCriterionId
    : current.criterionId === flatRoofCriterionId
      ? roofCriterionId
      : undefined;
  if (mutuallyExcludedCriterionId) {
    await prisma.objectRatingScore.updateMany({
      where: { objectRatingId: ratingId, criterionId: mutuallyExcludedCriterionId },
      data: {
        analystScore: null,
        finalScore: null,
        comment: null,
        changedByUserId: userId,
        changedAt: new Date(),
        confidence: 0.2
      }
    });
  }
  await prisma.ratingAuditLog.create({
    data: {
      objectRatingId: ratingId,
      entityType: "score",
      entityId: scoreId,
      action: "score_changed",
      oldValue: { finalScore: current.finalScore, analystScore: current.analystScore },
      newValue: { finalScore: analystScore, analystScore },
      comment: input.comment,
      userId
    }
  });
  await recalculateObjectRating(ratingId);
  return updated;
}

async function updateObjectRatingReturnLegacy(ratingId: string, userId: string, finalTargetReturn: number) {
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId } });
  if (!rating) throw new Error("Rating not found");
  if (rating.status === "approved") throw new Error("Freigegebene Ratings sind schreibgeschützt.");
  const lower = toNumber(rating.lowerReturnBound);
  const upper = toNumber(rating.upperReturnBound);
  if (lower !== undefined && finalTargetReturn < lower || upper !== undefined && finalTargetReturn > upper) {
    throw new Error("Finale Zielrendite muss innerhalb des zulässigen Korridors liegen.");
  }
  const updated = await prisma.objectRating.update({ where: { id: ratingId }, data: { finalTargetReturn } });
  await prisma.ratingAuditLog.create({
    data: {
      objectRatingId: ratingId,
      entityType: "rating",
      action: "target_return_changed",
      oldValue: { finalTargetReturn: rating.finalTargetReturn },
      newValue: { finalTargetReturn },
      userId
    }
  });
  return updated;
}

async function approveObjectRatingLegacy(ratingId: string, userId: string) {
  const rating = await prisma.objectRating.findUnique({ where: { id: ratingId }, include: { scores: true } });
  if (!rating) throw new Error("Rating not found");
  if (rating.scores.some((score) => !score.finalScore)) {
    throw new Error("Alle Kriterien benötigen einen finalen Score.");
  }
  const updated = await prisma.objectRating.update({
    where: { id: ratingId },
    data: { status: "approved", approvedAt: new Date(), approvedByUserId: userId }
  });
  await prisma.ratingAuditLog.create({
    data: {
      objectRatingId: ratingId,
      entityType: "rating",
      action: "rating_approved",
      newValue: { status: "approved" },
      userId,
      comment: "Objektrating freigegeben."
    }
  });
  return updated;
}

async function recalculateObjectRatingLegacy(ratingId: string) {
  const rating = await prisma.objectRating.findUnique({
    where: { id: ratingId },
    include: { scores: true, configVersion: { include: ratingConfigInclude } }
  });
  if (!rating) throw new Error("Rating not found");
  const property = await prisma.property.findUnique({ where: { id: rating.objectId }, select: { propertyType: true } });
  const computed = calculateRating(rating.configVersion, rating.scores.map((score) => ({ criterionId: score.criterionId, finalScore: score.finalScore ?? undefined })), { propertyType: property?.propertyType });
  return prisma.objectRating.update({
    where: { id: ratingId },
    data: {
      totalScore: computed.totalScore,
      ratingClass: computed.curve?.ratingClass,
      baseTargetReturn: computed.targetReturn ?? computed.curve?.baseTargetReturn,
      lowerReturnBound: computed.returnBounds.lower ?? computed.curve?.lowerReturnBound,
      upperReturnBound: computed.returnBounds.upper ?? computed.curve?.upperReturnBound,
      finalTargetReturn: computed.targetReturn ?? computed.curve?.baseTargetReturn,
      status: "analyst_review"
    }
  });
}
