import { validateFile, fileSummary } from "../../shared/files.js";
import { scheduleStats, formatImportDate } from "./schedule.js";
import { requestSchedule } from "./api.js";
import { renderSchedule } from "./render.js";
import { demo } from "./demo.js";

const form = document.querySelector("#schedule-form");
const fileInput = document.querySelector("#schedule-file");
const feedback = document.querySelector("#feedback");
const source = document.querySelector("#source-label");
const sheetSelect = document.querySelector("#sheet-select");
let current = demo;
let schedules = [];
let requestId = 0;
let importController;

function setFeedback(message, state = "idle") {
  feedback.textContent = message;
  feedback.dataset.state = state;
}

function refreshStats() {
  const week = new FormData(form).get("week") ?? "both";
  const stats = scheduleStats(current, week);
  document.querySelector("#schedule-stats").textContent = `Занятий: ${stats.lessons} · Предметов: ${stats.subjects} · Преподавателей: ${stats.teachers}`;
}

function show(schedule) {
  current = schedule;
  renderSchedule(schedule);
  refreshStats();
  document.querySelector("#import-warnings").textContent = schedule.warnings.join(" ");
}

/* example:import:start */
async function importFile() {
  const ticket = ++requestId;
  importController?.abort();
  importController = new AbortController();
  const file = fileInput.files[0];
  fileInput.setCustomValidity("");
  form.removeAttribute("aria-busy");
  const error = validateFile(file);
  if (error) {
    setFeedback(`${error} На экране остаётся прежнее расписание`, "error");
    return;
  }
  setFeedback("Читаем Excel… Ячейки, по местам", "loading");
  form.setAttribute("aria-busy", "true");
  try {
    const parsed = await requestSchedule(file, importController.signal);
    if (ticket !== requestId) return;
    schedules = parsed.schedules;
    sheetSelect.replaceChildren(...schedules.map((schedule, index) => new Option(schedule.sheetName, String(index))));
    document.querySelector("#sheet-field").hidden = schedules.length < 2;
    show(schedules[0]);
    source.textContent = `Источник: ${fileSummary(file)}`;
    const importedAt = new Date();
    const time = document.querySelector("#imported-at");
    time.dateTime = importedAt.toISOString();
    time.textContent = `Прочитано: ${formatImportDate(importedAt)}`;
    time.hidden = false;
    setFeedback(`Расписание прочитано. Excel побеждён.${parsed.skipped.length ? ` Пропущены листы: ${parsed.skipped.join("; ")}` : ""}`, "success");
  } catch (error) {
    if (ticket === requestId) setFeedback(`${error.message} На экране остаётся прежнее расписание; новый файл не применён`, "error");
  } finally {
    if (ticket === requestId) form.removeAttribute("aria-busy");
  }
}
/* example:import:end */

fileInput.addEventListener("change", importFile);
form.addEventListener("submit", (event) => { event.preventDefault(); importFile(); });
form.addEventListener("change", (event) => { if (event.target.name === "week") refreshStats(); });
sheetSelect.addEventListener("change", () => show(schedules[Number(sheetSelect.value)]));
form.addEventListener("reset", () => {
  requestId++;
  importController?.abort();
  schedules = [];
  form.removeAttribute("aria-busy");
  fileInput.setCustomValidity("");
  sheetSelect.replaceChildren();
  document.querySelector("#sheet-field").hidden = true;
  document.querySelector("#imported-at").hidden = true;
  source.textContent = "Источник: учебный пример КИ-24";
  setFeedback("Пример снова на месте. Можно заходить с новым Excel", "success");
  // A browser event can flush microtasks before the native reset applies defaults.
  setTimeout(() => show(demo), 0);
});
show(demo);
