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
const submit = form.querySelector("[type=submit]");
let current = demo;
let schedules = [];
let requestId = 0;
let importController;

function refresh() {
  const view = selectSchedule(current, {
    week: new FormData(form).get("week"), query: search.value, day: daySelect.value,
  });
  renderSchedule(view);
  const stats = scheduleStats(view, "both");
  $("#schedule-stats").textContent = `Занятий: ${stats.lessons} · Предметов: ${stats.subjects} · Преподавателей: ${stats.teachers}`;
  $("#filter-summary").textContent = `Показано дней: ${view.days.length} из ${current.days.length}. Занятий: ${stats.lessons}.`;
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
  submit.disabled = false;
  form.removeAttribute("aria-busy");
  const error = validateFile(file);
  if (error) { feedback.textContent = `${error} Прежнее расписание сохранено.`; return; }
  feedback.textContent = "Читаем Excel…";
  submit.disabled = true;
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
    feedback.textContent = `Расписание прочитано.${parsed.skipped.length ? ` Пропущены листы: ${parsed.skipped.join("; ")}` : ""}`;
  } catch (error) {
    if (ticket === requestId) feedback.textContent = `${error.message} Прежнее расписание сохранено.`;
  } finally {
    if (ticket === requestId) { submit.disabled = false; form.removeAttribute("aria-busy"); }
  }
}

/* example:controls:start */
fileInput.addEventListener("change", importFile);
form.addEventListener("submit", (event) => { event.preventDefault(); importFile(); });
form.addEventListener("change", (event) => { if (event.target.name === "week") refresh(); });
search.addEventListener("input", refresh);
daySelect.addEventListener("change", refresh);
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
  submit.disabled = false;
  form.removeAttribute("aria-busy");
  sheetSelect.replaceChildren();
  search.value = "";
  $("#sheet-field").hidden = true;
  $("#imported-at").hidden = true;
  $("#source-label").textContent = "Источник: учебный пример КИ-24";
  feedback.textContent = "Пример восстановлен. Можно выбрать новый Excel.";
  queueMicrotask(() => show(demo));
});
show(demo);
