import { validateFile, fileSummary } from "../../shared/files.js";
import { scheduleStats, formatImportDate } from "./schedule.js";
import { requestSchedule } from "./api.js";
import { renderSchedule } from "./render.js";
import { selectSchedule } from "./view.js";
import { demo } from "./demo.js";

const $ = (selector) => document.querySelector(selector);
const form = $("#schedule-form");
const fileInput = $("#schedule-file");
const feedback = $("#feedback");
const sheetSelect = $("#sheet-select");
const daySelect = $("#day-filter");
const search = $("#lesson-search");
const compact = $("#compact-view");
const showTeachers = $("#show-teachers");
let current = demo;
let schedules = [];
let requestId = 0;
let importController;

function setFeedback(message, state = "idle") {
  feedback.textContent = message;
  feedback.dataset.state = state;
}

function refresh() {
  const week = new FormData(form).get("week");
  const view = selectSchedule(current, {
    week, query: search.value, day: daySelect.value,
  });
  renderSchedule(view, { compact: compact.checked, showTeachers: showTeachers.checked, week });
  $("#teachers-option").hidden = !compact.checked;
  $("#compact-note").hidden = !compact.checked;
  const stats = scheduleStats(view, "both");
  $("#schedule-stats").textContent = `Занятий: ${stats.lessons} · Предметов: ${stats.subjects} · Преподавателей: ${stats.teachers}`;
  $("#filter-summary").textContent = `Показано дней: ${view.days.length} из ${current.days.length} · Занятий: ${stats.lessons}`;
}

function show(schedule) {
  current = schedule;
  daySelect.replaceChildren(new Option("Все дни", "all"), ...schedule.days.map((day) => new Option(day.day, String(day.dayIndex))));
  $("#import-warnings").textContent = schedule.warnings.join(" ");
  refresh();
}

async function importFile() {
  const ticket = ++requestId;
  importController?.abort();
  importController = new AbortController();
  const file = fileInput.files[0];
  form.removeAttribute("aria-busy");
  const error = validateFile(file);
  if (error) { setFeedback(`${error} Прежнее расписание сохранено`, "error"); return; }
  setFeedback("Читаем Excel… Ячейки, по местам", "loading");
  form.setAttribute("aria-busy", "true");
  try {
    const parsed = await requestSchedule(file, importController.signal);
    if (ticket !== requestId) return;
    schedules = parsed.schedules;
    sheetSelect.replaceChildren(...schedules.map((schedule, index) => new Option(schedule.sheetName, String(index))));
    $("#sheet-field").hidden = schedules.length < 2;
    search.value = "";
    show(schedules[0]);
    $("#source-label").textContent = `Источник: ${fileSummary(file)}`;
    const now = new Date();
    $("#imported-at").dateTime = now.toISOString();
    $("#imported-at").textContent = `Прочитано: ${formatImportDate(now)}`;
    $("#imported-at").hidden = false;
    setFeedback(`Расписание прочитано. Excel побеждён.${parsed.skipped.length ? ` Пропущены листы: ${parsed.skipped.join("; ")}` : ""}`, "success");
  } catch (error) {
    if (ticket === requestId) setFeedback(`${error.message} Прежнее расписание сохранено`, "error");
  } finally {
    if (ticket === requestId) form.removeAttribute("aria-busy");
  }
}

/* example:controls:start */
fileInput.addEventListener("change", importFile);
form.addEventListener("submit", (event) => { event.preventDefault(); importFile(); });
form.addEventListener("change", (event) => { if (event.target.name === "week") refresh(); });
search.addEventListener("input", refresh);
daySelect.addEventListener("change", refresh);
compact.addEventListener("change", refresh);
showTeachers.addEventListener("change", refresh);
$("#clear-filters").addEventListener("click", () => {
  search.value = "";
  daySelect.value = "all";
  refresh();
  search.focus();
});
sheetSelect.addEventListener("change", () => show(schedules[Number(sheetSelect.value)]));
/* example:controls:end */
form.addEventListener("reset", () => {
  requestId++;
  importController?.abort();
  schedules = [];
  form.removeAttribute("aria-busy");
  sheetSelect.replaceChildren();
  search.value = "";
  $("#sheet-field").hidden = true;
  $("#imported-at").hidden = true;
  $("#source-label").textContent = "Источник: учебный пример КИ-24";
  setFeedback("Пример снова на месте. Можно заходить с новым Excel", "success");
  // Read the controls after the browser has restored their native defaults.
  setTimeout(() => show(demo), 0);
});
show(demo);
