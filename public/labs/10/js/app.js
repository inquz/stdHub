import { validateFile, fileSummary } from "../../shared/files.js";
import { scheduleStats, formatImportDate } from "./schedule.js";
import { requestSchedule } from "./api.js";
import { renderSchedule } from "./render.js";
import { selectSchedule } from "./view.js";
import { demo } from "./demo.js";
import { loadState, saveState } from "./storage.js";
import { downloadSchedule } from "./export.js";

const $ = (selector) => document.querySelector(selector);
const form = $("#schedule-form");
const fileInput = $("#schedule-file");
const feedback = $("#feedback");
const sheetSelect = $("#sheet-select");
const daySelect = $("#day-filter");
const search = $("#lesson-search");
const compact = $("#compact-view");
const submit = form.querySelector("[type=submit]");
const exportButton = $("#export-png");
const collapsed = new Set();
const initialState = () => ({ version: 1, schedules: [demo], selected: 0, source: "учебный пример КИ-24", importedAt: null,
  options: { week: "both", query: "", day: "all", compact: false } });
const restored = loadState();
let state = restored.state ?? initialState();
let requestId = 0;
let importController;
const current = () => state.schedules[state.selected];

function persist() { $("#storage-status").textContent = saveState(state); }

function refresh(save = true) {
  state.options = { week: new FormData(form).get("week"), query: search.value, day: daySelect.value, compact: compact.checked };
  const view = selectSchedule(current(), state.options);
  renderSchedule(view, { collapsible: true, collapsed });
  const stats = scheduleStats(view, "both");
  $("#schedule-stats").textContent = `Занятий: ${stats.lessons} · Предметов: ${stats.subjects} · Преподавателей: ${stats.teachers}`;
  $("#filter-summary").textContent = `Показано дней: ${view.days.length} из ${current().days.length} · Занятий: ${stats.lessons}`;
  $("#export-status").textContent = "";
  if (save) persist();
}

function syncControls() {
  sheetSelect.replaceChildren(...state.schedules.map((schedule, index) => new Option(schedule.sheetName, String(index))));
  sheetSelect.value = String(state.selected);
  $("#sheet-field").hidden = state.schedules.length < 2;
  daySelect.replaceChildren(new Option("Все дни", "all"), ...current().days.map((day) => new Option(day.day, String(day.dayIndex))));
  daySelect.value = state.options.day;
  search.value = state.options.query;
  compact.checked = state.options.compact;
  $(`#week-${state.options.week}`).checked = true;
  $("#source-label").textContent = `Источник: ${state.source}`;
  $("#import-warnings").textContent = current().warnings.join(" ");
  $("#imported-at").hidden = !state.importedAt;
  if (state.importedAt) {
    $("#imported-at").dateTime = state.importedAt;
    $("#imported-at").textContent = `Прочитано: ${formatImportDate(new Date(state.importedAt))}`;
  }
  refresh(false);
}

function setBusy(busy) {
  submit.disabled = busy;
  exportButton.disabled = busy;
  form.setAttribute("aria-busy", String(busy));
}

async function importFile() {
  const ticket = ++requestId;
  importController?.abort();
  importController = new AbortController();
  const file = fileInput.files[0];
  setBusy(false);
  const error = validateFile(file);
  if (error) {
    feedback.textContent = `${error} Прежнее расписание сохранено`;
    fileInput.setAttribute("aria-invalid", "true");
    fileInput.focus();
    return;
  }
  fileInput.removeAttribute("aria-invalid");
  feedback.textContent = "Читаем Excel…";
  setBusy(true);
  try {
    const parsed = await requestSchedule(file, importController.signal);
    if (ticket !== requestId) return;
    state = { ...state, schedules: parsed.schedules, selected: 0, source: fileSummary(file), importedAt: new Date().toISOString(),
      options: { ...state.options, query: "", day: "all" } };
    collapsed.clear();
    syncControls();
    persist();
    feedback.textContent = `Расписание прочитано.${parsed.skipped.length ? ` Пропущены листы: ${parsed.skipped.join("; ")}` : ""}`;
  } catch (error) {
    if (ticket === requestId) feedback.textContent = `${error.message} Прежнее расписание сохранено`;
  } finally {
    if (ticket === requestId) setBusy(false);
  }
}

/* example:events:start */
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Import without navigation or reloading the document.
  importFile();
});
fileInput.addEventListener("change", importFile);
fileInput.addEventListener("invalid", () => {
  feedback.textContent = "Сначала выбери файл .xls или .xlsx";
});
form.addEventListener("change", (event) => {
  if (event.target.name === "week") { collapsed.clear(); refresh(); }
});
search.addEventListener("input", () => { collapsed.clear(); refresh(); });
daySelect.addEventListener("change", () => refresh());
compact.addEventListener("change", () => refresh());
sheetSelect.addEventListener("change", () => {
  state.selected = Number(sheetSelect.value);
  state.options.day = "all";
  collapsed.clear();
  syncControls();
  persist();
});
$("#clear-filters").addEventListener("click", () => {
  search.value = "";
  daySelect.value = "all";
  collapsed.clear();
  refresh();
  search.focus();
});
/* example:events:end */

/* example:delegation:start */
$(".schedule-days").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='toggle-day']");
  if (!button || !event.currentTarget.contains(button)) return;
  const day = Number(button.dataset.day);
  const closing = button.getAttribute("aria-expanded") === "true";
  if (closing) collapsed.add(day); else collapsed.delete(day);
  button.setAttribute("aria-expanded", String(!closing));
  button.querySelector(".toggle-symbol").textContent = closing ? "+" : "−";
  document.getElementById(button.getAttribute("aria-controls")).hidden = closing;
});
/* example:delegation:end */

form.addEventListener("reset", (event) => {
  event.preventDefault();
  if (!window.confirm("Восстановить учебный пример? Загруженное расписание и настройки в этом браузере будут заменены")) return;
  requestId++;
  importController?.abort();
  setBusy(false);
  fileInput.value = "";
  fileInput.removeAttribute("aria-invalid");
  state = initialState();
  collapsed.clear();
  syncControls();
  persist();
  feedback.textContent = "Пример восстановлен. Можно выбрать новый Excel";
});

exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  $("#export-status").textContent = "Готовим картинку всей недели…";
  try {
    await downloadSchedule(current(), { ...state.options });
    $("#export-status").textContent = "PNG готов и передан браузеру для скачивания";
  } catch (error) {
    $("#export-status").textContent = error.message || "Не удалось создать PNG. Попробуй ещё раз";
  } finally { exportButton.disabled = form.getAttribute("aria-busy") === "true"; }
});

syncControls();
$("#storage-status").textContent = restored.message;
if (restored.state) feedback.textContent = "Сохранённое расписание готово. Можно скачать PNG или выбрать новый Excel";
