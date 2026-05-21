import assert from "node:assert/strict";
import test from "node:test";
import { createFollowUpDueAt, hasOpenFollowUp } from "../lib/follow-up.ts";

test("open follow-up exists until customer feedback is received", () => {
  assert.equal(hasOpenFollowUp({ followUpRequired: true }), true);
  assert.equal(hasOpenFollowUp({ followUpRequired: true, customerFeedbackReceivedAt: "2026-05-19T12:00:00.000Z" }), false);
  assert.equal(hasOpenFollowUp({ followUpRequired: false }), false);
});

test("follow-up reminder defaults to two days later", () => {
  assert.equal(createFollowUpDueAt(new Date("2026-05-19T10:00:00.000Z")), "2026-05-21T10:00:00.000Z");
});
