import { error, json } from "@/lib/api";
import { getFederalStateByPostalCode, normalizeGermanPostalCode } from "@/lib/openplz";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const postalCode = normalizeGermanPostalCode(searchParams.get("postalCode") || searchParams.get("q"));

  if (!postalCode) {
    return error("Bitte geben Sie eine gültige deutsche PLZ an.", 400);
  }

  const result = getFederalStateByPostalCode(postalCode, searchParams.get("city"));
  return json({
    ...result,
    entry: result.status === "FOUND" ? {
      postalCode: result.postalCode,
      city: result.city,
      federalState: result.federalState,
      countyName: result.countyName ?? null,
      countyCode: result.countyCode ?? null
    } : null
  });
}
