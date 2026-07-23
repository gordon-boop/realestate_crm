import assert from "node:assert/strict";
import test from "node:test";
import { createLatestTaskQueue } from "../lib/latest-task-queue.ts";

test("zehn aufeinanderfolgende Autosaves laufen strikt nacheinander", async () => {
  const saved: number[] = [];
  let active = 0;
  let maximumActive = 0;
  const queue = createLatestTaskQueue<number, number>(async (version) => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await Promise.resolve();
    saved.push(version);
    active -= 1;
    return version;
  });

  for (let version = 1; version <= 10; version += 1) {
    assert.equal(await queue.enqueue(version), version);
  }

  assert.deepEqual(saved, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(maximumActive, 1);
});

test("während eines Saves bleibt nur der neueste wartende Stand erhalten", async () => {
  const saved: number[] = [];
  let releaseFirstSave!: () => void;
  const firstSaveBlocked = new Promise<void>((resolve) => {
    releaseFirstSave = resolve;
  });
  const queue = createLatestTaskQueue<number, number>(async (version) => {
    saved.push(version);
    if (version === 1) await firstSaveBlocked;
    return version;
  });

  const results = [queue.enqueue(1)];
  for (let version = 2; version <= 10; version += 1) results.push(queue.enqueue(version));
  releaseFirstSave();

  assert.deepEqual(await Promise.all(results), Array(10).fill(10));
  assert.deepEqual(saved, [1, 10]);
});
