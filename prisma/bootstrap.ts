import { bootstrapBaseData, disconnectSeedPrisma } from "./seed.ts";

async function main() {
  const result = await bootstrapBaseData();
  console.log("Bootstrap abgeschlossen.");
  console.log(`Admin-User: ${result.adminId}`);
  console.log(`Partner: ${result.partnerId}`);
  console.log("Rating-Konfiguration wurde aktualisiert.");
}

main()
  .finally(async () => {
    await disconnectSeedPrisma();
  })
  .catch(async (error) => {
    console.error(error);
    await disconnectSeedPrisma();
    process.exit(1);
  });
