import { prisma } from "./prisma.ts";

const caseNumberPattern = /^WK-2026-(\d+)$/;

export async function nextPropertyCaseNumber(): Promise<string> {
  const properties = await prisma.property.findMany({
    select: { caseNumber: true },
    where: { caseNumber: { startsWith: "WK-2026-" } }
  });

  const maxNumber = properties.reduce((max, property) => {
    const match = property.caseNumber?.match(caseNumberPattern);
    const parsed = match ? Number(match[1]) : 0;
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);

  return `WK-2026-${String(maxNumber + 1).padStart(3, "0")}`;
}
