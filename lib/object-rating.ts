import type { ObjectRating } from "./domain.ts";
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
  scores: { include: { criterion: { include: { category: true } } } },
  auditLogs: { orderBy: { timestamp: "desc" as const } }
};

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  const categoryScores = config.categories.map((category) => {
    const criteria = config.criteria.filter((criterion) => criterion.categoryId === category.id);
    return {
      category,
      score: weightedAverage(criteria.map((criterion) => ({
        value: scoreByCriterion.get(criterion.id),
        weight: criterionWeight(criterion, context)
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
    include: { ...ratingInclude, object: { select: { propertyType: true } }, configVersion: { include: ratingConfigInclude } }
  });
  if (!rating) return undefined;
  const computed = calculateRating(rating.configVersion, rating.scores.map((score) => ({
    criterionId: score.criterionId,
    finalScore: score.finalScore ?? undefined
  })), { propertyType: rating.object.propertyType });
  const openChecks = rating.scores.filter((score) => !score.finalScore || Number(score.confidence ?? 0) < 0.65);
  return { rating, categoryScores: computed.categoryScores, openChecks };
}

export async function updateObjectRatingScore(ratingId: string, scoreId: string, userId: string, input: { analystScore?: number; finalScore?: number; comment: string }) {
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

export async function approveObjectRating(ratingId: string, userId: string) {
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

async function recalculateObjectRating(ratingId: string) {
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
