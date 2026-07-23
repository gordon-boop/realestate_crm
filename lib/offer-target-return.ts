export type OfferTargetReturnRating = {
  id?: string;
  configVersionId?: string;
  ratingClass?: string;
  baseTargetReturn?: number;
  lowerReturnBound?: number;
  upperReturnBound?: number;
  finalTargetReturn?: number;
};

function finiteNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export function resolveOfferTargetReturn(
  rating: OfferTargetReturnRating | undefined,
  requestedTargetReturn?: number
): number | undefined {
  const requested = finiteNumber(requestedTargetReturn);
  const fallback = finiteNumber(rating?.finalTargetReturn) ?? finiteNumber(rating?.baseTargetReturn);
  const selected = requested ?? fallback;
  if (selected === undefined) return undefined;

  const lower = finiteNumber(rating?.lowerReturnBound);
  const upper = finiteNumber(rating?.upperReturnBound);
  const tolerance = 0.0000001;
  if (lower !== undefined && selected < lower - tolerance) {
    throw new Error("Die Ziel-IRR liegt unterhalb des zulässigen Ratingkorridors.");
  }
  if (upper !== undefined && selected > upper + tolerance) {
    throw new Error("Die Ziel-IRR liegt oberhalb des zulässigen Ratingkorridors.");
  }
  return selected;
}

export function buildOfferRatingSnapshot(
  rating: OfferTargetReturnRating | undefined,
  selectedTargetReturn: number | undefined
) {
  if (!rating) return undefined;
  return {
    ratingId: rating.id,
    configVersionId: rating.configVersionId,
    ratingClass: rating.ratingClass,
    baseTargetReturn: finiteNumber(rating.baseTargetReturn),
    lowerReturnBound: finiteNumber(rating.lowerReturnBound),
    upperReturnBound: finiteNumber(rating.upperReturnBound),
    finalTargetReturn: finiteNumber(rating.finalTargetReturn),
    selectedTargetReturn: finiteNumber(selectedTargetReturn)
  };
}
