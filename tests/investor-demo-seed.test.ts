import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertInvestorDemoEnvironment,
  INVESTOR_DEMO_ABORT_MESSAGE,
  INVESTOR_DEMO_IDS,
  investorDemoExpectedCounts,
  isInvestorDemoEnvironmentAllowed
} from "../lib/investor-demo-seed.ts";

const validEnvironment = {
  APP_ENV: "english",
  DATABASE_URL: "postgresql://demo:demo@db:5432/wohnkapital_english",
  ALLOW_INVESTOR_DEMO_SEED: "true"
};

test("investor demo seed requires all three environment safeguards", () => {
  assert.equal(isInvestorDemoEnvironmentAllowed(validEnvironment), true);
  assert.equal(isInvestorDemoEnvironmentAllowed({ ...validEnvironment, APP_ENV: "test" }), false);
  assert.equal(isInvestorDemoEnvironmentAllowed({ ...validEnvironment, DATABASE_URL: "postgresql://db/wohnkapital" }), false);
  assert.equal(isInvestorDemoEnvironmentAllowed({ ...validEnvironment, ALLOW_INVESTOR_DEMO_SEED: "false" }), false);
  assert.doesNotThrow(() => assertInvestorDemoEnvironment(validEnvironment));
});

test("investor demo seed exposes the exact abort message outside the English investor environment", () => {
  assert.throws(
    () => assertInvestorDemoEnvironment({ APP_ENV: "english", DATABASE_URL: "postgresql://db/wohnkapital_english" }),
    (error: unknown) => error instanceof Error && error.message === INVESTOR_DEMO_ABORT_MESSAGE
  );
});

test("investor demo identifiers are stable, unique and describe eight demo records", () => {
  const expected = investorDemoExpectedCounts();
  assert.deepEqual(expected, { leads: 2, customers: 6, properties: 6, offers: 6 });
  assert.equal(expected.leads + expected.properties, 8);
  const allIds = [...INVESTOR_DEMO_IDS.leads, ...INVESTOR_DEMO_IDS.customers, ...INVESTOR_DEMO_IDS.properties, ...INVESTOR_DEMO_IDS.offers];
  assert.equal(new Set(allIds).size, allIds.length);
  assert.ok(allIds.every((id) => id.startsWith("investor_demo_")));
  assert.equal(new Set(INVESTOR_DEMO_IDS.caseNumbers).size, 6);
  assert.equal(new Set(INVESTOR_DEMO_IDS.offerNumbers).size, 6);
});

test("synthetic investor demo photos are valid JPEG assets", async () => {
  for (const fileName of ["property-photo-front-demo.jpg", "property-photo-interior-demo.jpg"]) {
    const bytes = await readFile(new URL(`../prisma/demo-assets/${fileName}`, import.meta.url));
    assert.equal(bytes[0], 0xff);
    assert.equal(bytes[1], 0xd8);
    assert.equal(bytes.at(-2), 0xff);
    assert.equal(bytes.at(-1), 0xd9);
    assert.ok(bytes.length > 10_000);
  }
});

test("package script invokes only the manual investor demo seed", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts["db:seed:investor-demo"], "tsx prisma/seed-investor-demo.ts");
  assert.doesNotMatch(packageJson.scripts.start, /seed-investor-demo|db:seed:investor-demo/);
});
