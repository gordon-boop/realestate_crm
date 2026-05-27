import { InternalUserRole, PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/password.ts";

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required. Set ${name} before running npm run admin:create.`);
  }
  return value;
}

function validatePassword(password: string): void {
  const forbiddenPasswords = new Set(["demo1234", "password", "admin"]);
  const normalized = password.trim().toLowerCase();

  if (!password.trim()) {
    throw new Error("ADMIN_PASSWORD must not be empty.");
  }
  if (forbiddenPasswords.has(normalized)) {
    throw new Error('ADMIN_PASSWORD must not be "demo1234", "password" or "admin".');
  }
  if (process.env.NODE_ENV === "production" && password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters when NODE_ENV=production.");
  }
}

async function main() {
  const email = requiredEnv("ADMIN_EMAIL").toLowerCase();
  const password = requiredEnv("ADMIN_PASSWORD");
  const name = requiredEnv("ADMIN_NAME");

  validatePassword(password);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.admin,
      internalRole: InternalUserRole.super_admin,
      partnerId: null,
      deletedAt: null
    },
    create: {
      email,
      name,
      passwordHash,
      role: UserRole.admin,
      internalRole: InternalUserRole.super_admin
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      internalRole: true
    }
  });

  console.log(`Admin user ready: ${user.email} (${user.internalRole})`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
