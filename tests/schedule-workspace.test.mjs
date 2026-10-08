import test from "node:test";
import assert from "node:assert/strict";
import { selectSchedule, pairEntries } from "../public/labs/10/js/view.js";
import { selectSchedule as selectLab9, pairEntries as pairEntriesLab9 } from "../public/labs/09/js/view.js";
import { scheduleStats } from "../public/labs/10/js/schedule.js";
import { demo } from "../public/labs/10/js/demo.js";
import { loadState, saveState, validState, STORAGE_KEY } from "../public/labs/10/js/storage.js";
import { wrapText, exportFilename } from "../public/labs/10/js/export.js";
import { positionChatCards } from "../public/labs/10/js/chat-layout.js";
import { scheduleCards } from "../public/labs/10/js/bell-schedule.js";

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

for (const [lab, select, makeEntries] of [[9, selectLab9, pairEntriesLab9], [10, selectSchedule, pairEntries]]) {
test(`lab ${lab}: week gaps show the missing week in order without changing lesson counts or source data`, () => {
  const lesson = (week, subject) => ({ week, subject, kind: "лекция", room: "101", teacher: "Иванов" });
  const schedules = { ...demo, days: [{ day: "Понедельник", dayIndex: 0, pairs: [
    { number: 1, lessons: [lesson("lower", "Математика")] },
    { number: 2, lessons: [lesson("upper", "Физика")] },
    { number: 3, lessons: [lesson("both", "Химия")] },
    { number: 4, lessons: [] },
    { number: 5, lessons: [lesson("upper", "Первая подгруппа"), lesson("upper", "Вторая подгруппа")] },
  ] }] };
  const original = JSON.stringify(schedules);
  const view = select(schedules, { week: "both" });
  const entries = view.days[0].pairs.map((pair) => makeEntries(pair).map((entry) => [entry.week, entry.lesson?.subject ?? "Окно"]));
  assert.deepEqual(entries, [
    [["upper", "Окно"], ["lower", "Математика"]],
    [["upper", "Физика"], ["lower", "Окно"]],
    [["both", "Химия"]],
    [["both", "Окно"]],
    [["upper", "Первая подгруппа"], ["upper", "Вторая подгруппа"], ["lower", "Окно"]],
  ]);
  assert.equal(scheduleStats(view, "both").lessons, 5);
  assert.equal(JSON.stringify(schedules), original);
  const upper = select(schedules, { week: "upper" });
  assert.deepEqual(makeEntries(upper.days[0].pairs[0], "upper"), [{ week: "upper", lesson: null }]);
});

test(`lab ${lab}: search cannot turn a hidden lesson into an empty week`, () => {
  const source = { ...demo, days: [{ day: "Понедельник", dayIndex: 0, pairs: [{ number: 1, lessons: [
    { week: "upper", subject: "Физика", teacher: "Иванов", kind: "лекция", room: "101" },
    { week: "lower", subject: "Математика", teacher: "Петров", kind: "лекция", room: "102" },
  ] }] }] };
  const view = select(source, { query: "Математика" });
  const entries = makeEntries(view.days[0].pairs[0]);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].lesson.subject, "Математика");
  assert.equal(select(source, { query: "Математика", week: "upper" }).days.length, 0);
});
}
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
    (v) => { v.options.showTeachers = "false"; },
    (v) => { v.schedules[0].days[0].pairs[0].lessons[0].teacher = {}; },
    (v) => { v.schedules[0].days.push(v.schedules[0].days[0]); },
  ]) {
    const value = state();
    corrupt(value);
    assert.equal(validState(value), false);
  }
});

test("chat view teacher preference round trips and older saved settings remain valid", () => {
  const value = state();
  assert.equal(validState(value), true);
  const storage = memory();
  for (const showTeachers of [false, true]) {
    value.options.showTeachers = showTeachers;
    saveState(value, () => storage);
    assert.equal(loadState(() => storage).state.options.showTeachers, showTeachers);
  }
});

test("PNG text wraps long words, Cyrillic, line breaks and keeps all content", () => {
  const lines = wrapText("Параллельные вычисления\nПреподавательАА", 12, (line) => Array.from(line).length);
  assert.ok(lines.every((line) => Array.from(line).length <= 12));
  assert.equal(lines.join("").replaceAll(" ", ""), "ПараллельныевычисленияПреподавательАА");
  assert.deepEqual(wrapText("a\n\nb", 10, (line) => line.length), ["a", "", "b"]);
  assert.equal(exportFilename('КИ/24:*?', "upper"), "КИ_24___-upper.png");
});

test("chat layout aligns weekdays and bells in three columns and two rows", () => {
  const heights = [180, 240, 200, 220, 300, 410];
  const { placements: p, height, columns } = positionChatCards(heights, 20);
  assert.equal(columns, 3);
  assert.equal(p[0].top, p[1].top);
  assert.equal(p[0].top, p[2].top);
  assert.equal(p[3].top, p[4].top);
  assert.equal(p[3].top, p[5].top);
  for (let column = 0; column < 3; column++) {
    assert.equal(p[column].column, column);
    assert.equal(p[column + 3].column, column);
    assert.equal(p[column].height, Math.max(...heights.slice(0, 3)));
    assert.equal(p[column + 3].top + p[column + 3].height, height);
  }
  assert.ok(p[3].top >= Math.max(...heights.slice(0, 3)) + 20);
});

test("chat layout accommodates tall cards and extra weekend days without overlaps", () => {
  for (const heights of [[], [80], [180, 150], [100, 500, 120], [90, 110, 230, 70], [100, 100, 100, 100, 800], [90, 110, 130, 150, 170, 190], [90, 110, 130, 150, 170, 190, 210], [90, 110, 130, 150, 170, 190, 210, 300]]) {
    const layout = positionChatCards(heights, 20);
    assert.equal(layout.placements.length, heights.length);
    layout.placements.forEach((p, index) => {
      assert.ok(p.top >= 0 && p.top + heights[index] <= layout.height);
      assert.ok(p.column >= 0 && p.column < layout.columns);
      for (let other = 0; other < index; other++) {
        const q = layout.placements[other];
        if (p.column === q.column) assert.ok(p.top >= q.top + heights[other] + 20 || q.top >= p.top + heights[index] + 20);
      }
    });
  }
});

test("bells are always present after weekdays, and extra days are preserved without mutating input", () => {
  const days = [6, 2, 0, 4, 5, 1, 3].map((dayIndex) => ({ dayIndex, pairs: [] }));
  const original = JSON.stringify(days);
  const cards = scheduleCards(days);
  assert.deepEqual(cards.map((card) => card.type === "bells" ? "bells" : card.day.dayIndex), [0, 1, 2, 3, 4, "bells", 5, 6]);
  assert.deepEqual(scheduleCards([]), [{ type: "bells" }]);
  assert.equal(scheduleCards([days[0]]).filter((card) => card.type === "bells").length, 1);
  assert.equal(JSON.stringify(days), original);
});
