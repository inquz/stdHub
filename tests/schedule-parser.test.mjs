import test from "node:test";
import assert from "node:assert/strict";
import { parseWorkbook as parsePythonWorkbook } from "../src/lib/python-parser.ts";
import { scheduleStats, formatImportDate } from "../public/labs/08/js/schedule.js";
import { validateFile, MAX_FILE_BYTES } from "../public/labs/shared/files.js";
import { makeScheduleSheet, makeAnnotatedScheduleSheet, makeSubgroupScheduleSheet, workbookBytes } from "./fixtures/schedule-fixture.mjs";

const parseWorkbook = (bytes) => parsePythonWorkbook(new Uint8Array(bytes));
const parseSheet = async (sheet) => (await parseWorkbook(workbookBytes({ Test: sheet }))).schedules[0];

test("file checks accept case-insensitive Excel extensions and enforce size boundaries", () => {
  assert.ok(validateFile(null));
  assert.ok(validateFile({ name: "file.exe", size: 40 }));
  assert.ok(validateFile({ name: "file.xls", size: 0 }));
  assert.ok(validateFile({ name: "file.xlsx", size: MAX_FILE_BYTES + 1 }));
  assert.equal(validateFile({ name: "file.XLS", size: MAX_FILE_BYTES }), "");
});

for (const format of ["xlsx", "biff8"]) {
  test(`Python reads ${format}: merged lessons retain their teachers, weeks and internal gaps`, async () => {
    const { schedules } = await parseWorkbook(workbookBytes({ Schedule: makeScheduleSheet() }, format));
    const schedule = schedules[0];
    assert.equal(schedule.group, "ТЕСТ-24");
    const pairs = schedule.days[0].pairs;
    assert.deepEqual(pairs.map((pair) => pair.number), [2,3,4,5]);
    assert.deepEqual(pairs[0].lessons.map(({ teacher, week }) => ({ teacher, week })), [
      { teacher: "Верхний А.А.", week: "upper" }, { teacher: "Нижний Б.Б.", week: "lower" },
    ]);
    assert.equal(pairs[1].lessons[0].week, "both");
    assert.equal(pairs[1].lessons[0].teacher, "Общий В.В.");
    assert.deepEqual(pairs[2].lessons, []);
    assert.equal(pairs[3].lessons[0].week, "lower");
    assert.equal(scheduleStats(schedule,"both").lessons,4);
    assert.equal(scheduleStats(schedule,"upper").lessons,2);
    assert.equal(scheduleStats(schedule,"lower").lessons,3);
    assert.equal(scheduleStats(schedule,"both").subjects,3);
    assert.equal(scheduleStats(schedule,"both").teachers,4);
  });

  test(`Python reads ${format}: compact pairs cover both weeks and metadata is not a subject`, async () => {
    const { schedules } = await parseWorkbook(workbookBytes({ Schedule: makeAnnotatedScheduleSheet() }, format));
    const schedule = schedules[0];
    const pairs = schedule.days[0].pairs;
    assert.deepEqual(pairs.map((pair) => pair.number), [2,3,4,5,6]);
    assert.deepEqual(pairs[0].lessons.map(({ notes, week }) => ({ notes, week })), [
      { notes: "1 подгруппа", week: "upper" }, { notes: "2 подгруппа", week: "lower" },
    ]);
    assert.equal(pairs[1].lessons[0].notes, "+ ТЕСТ-25");
    assert.equal(pairs[3].lessons[0].notes, "2 подгруппа");
    assert.deepEqual(pairs[4].lessons, [{
      subject: "Физкультура", kind: "практика", room: "11.228, 11.243",
      teacher: "Общий В.В., Поздний Г.Г.", notes: "+ ТЕСТ-26", week: "both",
    }]);
    assert.equal(scheduleStats(schedule,"both").lessons,5);
    assert.equal(scheduleStats(schedule,"upper").lessons,3);
    assert.equal(scheduleStats(schedule,"lower").lessons,4);
    assert.equal(scheduleStats(schedule,"both").teachers,4);
    assert.deepEqual(schedule.warnings, []);
  });

  test(`Python reads ${format}: two subgroups in the same week and consultations survive`, async () => {
    const { schedules: [schedule] } = await parseWorkbook(workbookBytes({ Schedule: makeSubgroupScheduleSheet() }, format));
    const pair = schedule.days[0].pairs[0];
    assert.deepEqual(pair.lessons.slice(0,2), [
      { subject: "HTML", kind: "лабораторная", room: "4.037", teacher: "Первый А.А.", notes: "1 подгруппа", week: "upper" },
      { subject: "SQL", kind: "лабораторная", room: "4.014", teacher: "Второй Б.Б.", notes: "2 подгруппа", week: "upper" },
    ]);
    assert.equal(pair.lessons[2].week, "lower");
    assert.equal(pair.lessons[2].teacher, "Нижний Б.Б.");
    assert.equal(schedule.days[0].pairs[1].lessons[0].kind, "консультация");
    assert.equal(scheduleStats(schedule,"both").lessons,5);
    assert.equal(scheduleStats(schedule,"upper").lessons,3);
    assert.equal(scheduleStats(schedule,"lower").lessons,3);
  });
}

test("missing teacher stays empty and is reported, never copied from another lesson", async () => {
  const sheet = makeScheduleSheet(); delete sheet.L11;
  const schedule = await parseSheet(sheet);
  assert.equal(schedule.days[0].pairs[0].lessons[1].teacher, "");
  assert.equal(schedule.warnings.length,1);
});

test("multiple valid sheets survive and unsupported sheets are explicitly reported", async () => {
  const result = await parseWorkbook(workbookBytes({ Notes: {"!ref":"A1", A1:{t:"s",v:"notes"}}, First:makeScheduleSheet(), Second:makeScheduleSheet() }));
  assert.equal(result.schedules.length,2);
  assert.equal(result.skipped.length,1);
});

test("rejects renamed text, unsupported layouts and conflicting merged lessons", async () => {
  await assert.rejects(() => parseWorkbook(new TextEncoder().encode("not excel")), /Excel/);
  await assert.rejects(() => parseSheet({"!ref":"A1"}), /дни/);
  const invalid = makeScheduleSheet(); invalid.D8.v = "неизвестно";
  await assert.rejects(() => parseSheet(invalid), /тип занятия/);
  const conflict = makeScheduleSheet();
  conflict["!merges"].find(({ s }) => s.r === 7 && s.c === 5).e.r = 10;
  await assert.rejects(() => parseSheet(conflict), /границы/);
  const duplicate = makeSubgroupScheduleSheet(); duplicate.F9.v = "1 подгруппа";
  await assert.rejects(() => parseSheet(duplicate), /подгрупп/);
});

test("missing inline teacher does not inherit the other subgroup's name", async () => {
  const sheet = makeSubgroupScheduleSheet(); delete sheet.N9;
  const schedule = await parseSheet(sheet);
  assert.equal(schedule.days[0].pairs[0].lessons[1].teacher, "");
  assert.equal(schedule.warnings.length,1);
});

test("Date formatting preserves the local import date, not an inferred week parity", () => {
  assert.match(formatImportDate(new Date(2026,8,28,13,45)), /28\.09\.2026/);
  assert.match(formatImportDate(new Date(2026,8,28,13,45)), /13:45/);
});
