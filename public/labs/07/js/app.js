import { validateFile, fileSummary } from "../../shared/files.js";

const form = document.querySelector("#schedule-form");
const fileInput = document.querySelector("#schedule-file");
const feedback = document.querySelector("#feedback");
const title = document.querySelector("#schedule-title");
const originalTitle = title.textContent;
const weekLabels = { upper: "верхняя", lower: "нижняя", both: "обе" };

fileInput.addEventListener("change", () => {
  fileInput.setCustomValidity("");
  feedback.textContent = "Выбранный файл пока не прочитан. На экране учебный пример";
});

/* example:submit:start */
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const file = fileInput.files[0];
  const error = validateFile(file);
  if (error) {
    fileInput.setCustomValidity(error);
    feedback.textContent = error;
    fileInput.reportValidity();
    return;
  }
  const week = new FormData(form).get("week");
  const message = `${fileSummary(file)}. Неделя: ${weekLabels[week]}.`;
  feedback.textContent = `${message} Имя и размер проверены; содержимое ещё не читали`;
  window.alert(`${message}\nФормат по расширению подходит. Чтение Excel — в ЛР 8`);
});
/* example:submit:end */

/* example:dialogs:start */
document.querySelector("#rename-group").addEventListener("click", () => {
  const answer = window.prompt("Как подписать группу в примере?", title.textContent);
  if (answer === null) return;
  const group = answer.trim();
  if (!group || group.length > 40) {
    window.alert("Название должно содержать от 1 до 40 символов");
    return;
  }
  title.textContent = group;
});

form.addEventListener("reset", (event) => {
  if (!window.confirm("Очистить файл и вернуть учебный пример?")) {
    event.preventDefault();
    return;
  }
  fileInput.setCustomValidity("");
  title.textContent = originalTitle;
  feedback.textContent = "Учебный пример восстановлен. Excel не обработан, PNG пока не создаётся";
});
/* example:dialogs:end */
