import assert from "node:assert/strict";
import { test } from "node:test";
import { createDemoTasks, subjects } from "../src/data/planner.ts";

test("seed includes all subjects, completed, overdue, today and future tasks", () => {
  const tasks = createDemoTasks(new Date(2026, 8, 13));
  assert.equal(tasks.length, 10);
  assert.equal(new Set(tasks.map(({ id }) => id)).size, 10);
  assert.equal(new Set(tasks.map(({ subjectId }) => subjectId)).size, 4);
  assert.ok(tasks.every(({ subjectId }) => subjects.some(({ id }) => id === subjectId)));
  assert.ok(tasks.some(({ completed }) => completed));
  assert.ok(tasks.some(({ dueDate, completed }) => dueDate < "2026-09-13" && !completed));
  assert.ok(tasks.some(({ dueDate }) => dueDate === "2026-09-13"));
  assert.ok(tasks.some(({ dueDate }) => dueDate === "2026-09-14"));
});

test("seed crosses year and leap-month boundaries using calendar days", () => {
  const january = createDemoTasks(new Date(2027, 0, 1, 23, 59));
  assert.equal(january.find(({ id }) => id === "task-02").dueDate, "2026-12-31");
  assert.equal(january.find(({ id }) => id === "task-03").dueDate, "2027-01-01");
  const march = createDemoTasks(new Date(2028, 2, 1));
  assert.equal(march.find(({ id }) => id === "task-02").dueDate, "2028-02-29");
});

test("seed does not mutate the supplied date or share mutable task objects", () => {
  const now = new Date(2026, 8, 13, 21, 30);
  const timestamp = now.getTime();
  createDemoTasks(now)[0].title = "Changed";
  assert.equal(now.getTime(), timestamp);
  assert.notEqual(createDemoTasks(now)[0].title, "Changed");
  assert.throws(() => createDemoTasks(new Date("invalid")), /Некорректная дата/);
});
