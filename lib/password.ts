import bcrypt from "bcryptjs";

const bcryptCost = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, bcryptCost);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash || !hash.startsWith("$2")) return false;
  return bcrypt.compare(plain, hash);
}
