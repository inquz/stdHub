import test from "node:test";
import assert from "node:assert/strict";
import { selectSchedule } from "../public/labs/10/js/view.js";
import { selectSchedule as selectLab9 } from "../public/labs/09/js/view.js";
import { scheduleStats } from "../public/labs/10/js/schedule.js";
import { demo } from "../public/labs/10/js/demo.js";
import { loadState, saveState, validState, STORAGE_KEY } from "../public/labs/10/js/storage.js";
import { wrapText, exportFilename } from "../public/labs/10/js/export.js";

for (const [lab, select] of [[9, selectLab9], [10, selectSchedule]]) {
  test(`lab ${lab}: day, search and week combine without mutating the source`, () => {
    const original = JSON.stringify(demo);
    const upper = select(demo, { week: "upper", day: "0", query: "  ПАВЛОВА  " });
    assert.equal(scheduleStats(upper, "both").lessons, 1);
    assert.equal(upper.days[0].pairs[0].lessons[0].subject, "Психология");
    assert.deepEqual(select(demo, { week: "lower", day: "0", query: "павлова" }).days, []);
    assert.equal(scheduleStats(select(demo, { query: "Чередникова" }), "both").lessons, 1);
    assert.equal(JSON.stringify(demo), original);
  });
  test(`lab ${lab}: week counts and empty pairs survive filtering`, () => {
    assert.equal(scheduleStats(select(demo, { week: "upper" }), "both").lessons, 16);
    assert.equal(scheduleStats(select(demo, { week: "lower" }), "both").lessons, 13);
    assert.equal(scheduleStats(select(demo, { week: "both" }), "both").lessons, 20);
    const view = select(demo, { week: "upper", day: "1" });
    assert.ok(view.days[0].pairs.some((pair) => !pair.lessons.length));
    assert.equal(select(demo, { query: "несуществующая аудитория" }).days.length, 0);
    assert.equal(select(demo, { query: "   " }).days.length, demo.days.length);
  });
}

const state = () => ({ version: 1, schedules: [structuredClone(demo)], selected: 0, source: "test.xls", importedAt: "2026-10-01T12:00:00.000Z",
  options: { week: "lower", query: "преподаватель", day: "0", compact: true } });
const memory = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
};
test("saved workbook, selected sheet and filters round trip; empty schedules are valid", () => {
  const storage = memory();
  assert.equal(loadState(() => storage).state, null);
  const value = state();
  saveState(value, () => storage);
  assert.deepEqual(loadState(() => storage).state, value);
  value.schedules[0].days = [];
  value.options.day = "all";
  saveState(value, () => storage);
  assert.deepEqual(loadState(() => storage).state.schedules[0].days, []);
});
test("corrupt, incompatible and inaccessible storage falls back without throwing", () => {
  for (const raw of ["{broken", "null", "{}", '{"version":0}', " ".repeat(2_000_001)]) {
    const storage = memory();
    storage.setItem(STORAGE_KEY, raw);
    assert.equal(loadState(() => storage).state, null);
    assert.match(loadState(() => storage).message, /учебный пример/);
  }
  const denied = () => { throw new DOMException("denied", "SecurityError"); };
  assert.match(loadState(denied).message, /Хранилище недоступно/);
  assert.match(saveState(state(), denied), /Не удалось сохранить/);
  assert.match(saveState(state(), () => ({ setItem() { throw new DOMException("full", "QuotaExceededError"); } })), /Не удалось сохранить/);
});
test("persisted values are checked down to lessons and active options", () => {
  for (const corrupt of [
    (v) => { v.selected = 99; }, (v) => { v.options.week = "other"; },
    (v) => { v.options.day = "99"; }, (v) => { v.importedAt = "invalid"; },
    (v) => { v.schedules[0].days[0].pairs[0].lessons[0].teacher = {}; },
    (v) => { v.schedules[0].days.push(v.schedules[0].days[0]); },
  ]) {
    const value = state();
    corrupt(value);
    assert.equal(validState(value), false);
  }
});
test("PNG text wraps long words, Cyrillic, line breaks and keeps all content", () => {
  const lines = wrapText("Параллельные вычисления\nПреподавательАА", 12, (line) => Array.from(line).length);
  assert.ok(lines.every((line) => Array.from(line).length <= 12));
  assert.equal(lines.join("").replaceAll(" ", ""), "ПараллельныевычисленияПреподавательАА");
  assert.deepEqual(wrapText("a\n\nb", 10, (line) => line.length), ["a", "", "b"]);
  assert.equal(exportFilename('КИ/24:*?', "upper"), "КИ_24___-upper.png");
});
