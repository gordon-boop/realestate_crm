/**
 * Backfill von Latitude/Longitude für bestehende Properties.
 *
 * Logik:
 * - Holt alle Properties ohne Koordinaten.
 * - Für jede: Geocode über PLZ-Centroid + deterministischer Jitter (Seed = property.id).
 * - Schreibt latitude, longitude, geocodingSource zurück.
 *
 * Idempotent: Wer das Skript zweimal laufen lässt, ändert nichts an bereits
 * gefüllten Datensätzen.
 *
 * Aufruf: `npx tsx scripts/backfill-coordinates.ts`
 */

import { PrismaClient } from "@prisma/client";
import { geocodePostalCode } from "../lib/postal-code-geocoding";

async function main() {
  const prisma = new PrismaClient();
  try {
    const properties = await prisma.property.findMany({
      where: { OR: [{ latitude: null }, { longitude: null }] },
      select: { id: true, postalCode: true },
    });

    if (properties.length === 0) {
      console.log("Keine Properties ohne Koordinaten gefunden. Nichts zu tun.");
      return;
    }

    console.log(`Backfill für ${properties.length} Properties …`);
    let updated = 0;
    let fallbackCount = 0;

    for (const p of properties) {
      const coords = geocodePostalCode(p.postalCode, p.id);
      if (coords.source === "germany_center") fallbackCount++;

      await prisma.property.update({
        where: { id: p.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          geocodingSource: coords.source,
        },
      });
      updated++;
    }

    console.log(`Fertig. ${updated} Properties aktualisiert.`);
    if (fallbackCount > 0) {
      console.warn(
        `${fallbackCount} Properties hatten keine gültige PLZ — auf Deutschland-Mitte gesetzt. Bitte prüfen.`
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
