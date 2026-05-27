import { GERMANY_CENTER, PLZ_REGION_CENTROIDS } from "./plz-region-centroids";

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  source: "plz_region" | "germany_center";
};

/**
 * Liefert ungefähre Koordinaten für eine deutsche Postleitzahl.
 * Nutzt die zweistellige PLZ-Leitregion als Centroid und addiert einen
 * deterministischen Jitter (basierend auf einer Hash der vollen PLZ + propertyId),
 * damit mehrere Objekte derselben Region nicht exakt aufeinander liegen.
 *
 * Bewusst keine externe API: Datenschutz, keine Rate-Limits, offline-fähig.
 * Für präzisere Geocodings (echte Adresse) später optional Nominatim ergänzen
 * und das Feld geocodingSource auf "nominatim" setzen.
 */
export function geocodePostalCode(
  postalCode: string | null | undefined,
  jitterSeed: string = ""
): GeocodeResult {
  const cleaned = (postalCode ?? "").replace(/\D/g, "");
  if (cleaned.length < 2) {
    return { ...GERMANY_CENTER, source: "germany_center" };
  }

  const region = cleaned.slice(0, 2);
  const centroid = PLZ_REGION_CENTROIDS[region];
  if (!centroid) {
    return { ...GERMANY_CENTER, source: "germany_center" };
  }

  // Jitter: ±0.04 Grad (~3-4 km), deterministisch aus Seed.
  const jitter = deterministicJitter(`${cleaned}:${jitterSeed}`);

  return {
    latitude: centroid.lat + jitter.lat,
    longitude: centroid.lng + jitter.lng,
    source: "plz_region",
  };
}

function deterministicJitter(seed: string): { lat: number; lng: number } {
  // Einfacher Hash → zwei Werte in [-1, 1], skaliert auf ±0.04 Grad.
  let h1 = 2166136261;
  let h2 = 5381;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = ((h2 << 5) + h2 + c) >>> 0;
  }
  const normalize = (n: number) => ((n >>> 0) / 0xffffffff) * 2 - 1;
  return {
    lat: normalize(h1) * 0.04,
    lng: normalize(h2) * 0.04,
  };
}
