import { error, json } from "@/lib/api";
import { getFederalStateByPostalCode, normalizeGermanPostalCode } from "@/lib/openplz";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const postalCode = normalizeGermanPostalCode(searchParams.get("postalCode") || searchParams.get("q"));

  if (!postalCode) {
    return error("Bitte geben Sie eine gültige deutsche PLZ an.", 400);
  }

  return json(getFederalStateByPostalCode(postalCode, searchParams.get("city")));
}
