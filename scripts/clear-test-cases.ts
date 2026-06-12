import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAFETY_ABORT_MESSAGE = "Abbruch: Cleanup darf nur in der Testumgebung ausgeführt werden.";

type CleanupResult = {
  label: string;
  count: number;
};

function isAllowedTestEnvironment() {
  const appEnv = process.env.APP_ENV ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const databaseUrl = process.env.DATABASE_URL ?? "";

  return (
    appEnv === "test" ||
    appUrl.includes("test.wohn-kapital.de") ||
    databaseUrl.includes("wohnkapital_test") ||
    databaseUrl.includes("db_test")
  );
}

async function main() {
  if (!isAllowedTestEnvironment()) {
    throw new Error(SAFETY_ABORT_MESSAGE);
  }

  const results: CleanupResult[] = [];

  await prisma.$transaction(async (tx) => {
    async function record(label: string, cleanup: () => Promise<{ count: number }>) {
      const result = await cleanup();
      results.push({ label, count: result.count });
    }

    await record("Chat-Lesestände gelöscht", () => tx.chatMessageRead.deleteMany({}));
    await record("Chat-Anhänge gelöscht", () => tx.chatAttachment.deleteMany({}));
    await record("Kommunikationseinträge gelöscht", () => tx.chatMessage.deleteMany({}));

    await record("Benachrichtigungs-Lesestände gelöscht", () => tx.caseNotificationRead.deleteMany({}));
    await record("Benachrichtigungen gelöscht", () => tx.caseNotification.deleteMany({}));

    await record("Aufgaben/Wiedervorlagen gelöscht", () => tx.reminder.deleteMany({}));

    await record("Aktivitätsversionen gelöscht", () => tx.activityVersion.deleteMany({}));
    await record("Aktivitäten gelöscht", () => tx.activity.deleteMany({}));

    await record("Dokumentversionen gelöscht", () => tx.documentVersion.deleteMany({}));
    await record("Dokumente gelöscht", () => tx.document.deleteMany({}));

    await record("Angebotsversionen gelöscht", () => tx.offerVersion.deleteMany({}));
    await record("Angebote gelöscht", () => tx.offer.deleteMany({}));

    await record("Bewertungen gelöscht", () => tx.valuation.deleteMany({}));

    await record("Rating-Audit-Logs gelöscht", () => tx.ratingAuditLog.deleteMany({}));
    await record("Objektrating-Scores gelöscht", () => tx.objectRatingScore.deleteMany({}));
    await record("Objektratings gelöscht", () => tx.objectRating.deleteMany({}));

    await record("Verkaufsprozesse gelöscht", () => tx.propertyExitProcess.deleteMany({}));

    await record("Leads gelöscht", () => tx.lead.deleteMany({}));
    await record("Objekte/Fälle gelöscht", () => tx.property.deleteMany({}));
    await record("Kunden gelöscht", () => tx.customer.deleteMany({}));
  });

  console.log("Cleanup abgeschlossen.");
  for (const result of results) {
    console.log(`${result.label}: ${result.count}`);
  }
  console.log("Behalten: User, Rollen, Partner, Nummernkreise, Systemkonfiguration und Rating-Konfiguration.");
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
