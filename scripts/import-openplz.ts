import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type OpenPlzEntry = {
  postalCode: string;
  city: string;
  federalState: string;
  countyName: string | null;
  countyCode: string | null;
};

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? path.join("data", "openplz-de-postal-codes.json");

if (!inputPath) {
  console.error("Bitte OpenPLZ-CSV angeben, z. B.: tsx scripts/import-openplz.ts data/openplz-de.csv");
  process.exit(1);
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      i += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function pick(row: Record<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const value = row[alias];
    if (value) return value;
  }
  return "";
}

const raw = await readFile(inputPath, "utf8");
const lines = raw.split(/\r?\n/).filter((line) => line.trim());
const delimiter = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
const headers = parseCsvLine(lines[0], delimiter).map((header) => header.trim());

const rows = lines.slice(1)
  .map((line) => parseCsvLine(line, delimiter))
  .map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));

const entries = rows.map((row): OpenPlzEntry | undefined => {
  const postalCode = pick(row, ["postalCode", "postal_code", "plz", "PLZ", "Postleitzahl"]).replace(/\D/g, "");
  const city = pick(row, ["city", "City", "ort", "Ort", "name", "Name", "locality"]);
  const federalState = pick(row, ["federalState", "federal_state", "Bundesland", "state", "State"]);
  if (postalCode.length !== 5 || !city || !federalState) return undefined;
  return {
    postalCode,
    city,
    federalState,
    countyName: pick(row, ["countyName", "county_name", "Kreis", "kreis", "county"]) || null,
    countyCode: pick(row, ["countyCode", "county_code", "Kreisschlüssel", "kreisCode", "AGS"]) || null
  };
}).filter((entry): entry is OpenPlzEntry => Boolean(entry));

const deduped = Array.from(
  new Map(entries.map((entry) => [`${entry.postalCode}:${entry.city}:${entry.federalState}`, entry])).values()
).sort((a, b) => a.postalCode.localeCompare(b.postalCode) || a.city.localeCompare(b.city, "de-DE"));

await writeFile(outputPath, `${JSON.stringify(deduped, null, 2)}\n`, "utf8");
console.log(`OpenPLZ-Lookup geschrieben: ${outputPath} (${deduped.length} Einträge)`);
