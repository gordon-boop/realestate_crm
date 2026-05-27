import { prisma } from "./prisma.ts";

export async function nextSequenceValue(key: string): Promise<number> {
  return prisma.$transaction(async (tx) => {
    await tx.numberSequence.upsert({
      where: { key },
      create: { key, value: 0 },
      update: {}
    });

    const sequence = await tx.numberSequence.update({
      where: { key },
      data: { value: { increment: 1 } }
    });

    return sequence.value;
  });
}
