import { nextSequenceValue } from "./sequence.ts";

export async function nextPropertyCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const sequenceValue = await nextSequenceValue(`case:${year}`);
  return `WK-${year}-${String(sequenceValue).padStart(3, "0")}`;
}
