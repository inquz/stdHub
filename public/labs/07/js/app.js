import { validateFile, fileSummary } from "../../shared/files.js";

const form = document.querySelector("#schedule-form");
const fileInput = document.querySelector("#schedule-file");
const feedback = document.querySelector("#feedback");
const title = document.querySelector("#schedule-title");
const originalTitle = title.textContent;
const weekLabels = { upper: "верхняя", lower: "нижняя", both: "обе" };

function setFeedback(message, state = "idle") {
  feedback.textContent = message;
  feedback.dataset.state = state;
}

fileInput.addEventListener("change", () => {
  fileInput.setCustomValidity("");
  setFeedback("Файл на месте. Жми «Проверить файл» — познакомимся. На экране пока пример");
});

/* example:submit:start */
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const file = fileInput.files[0];
  const error = validateFile(file);
  if (error) {
    fileInput.setCustomValidity(error);
    setFeedback(error, "error");
    fileInput.reportValidity();
    return;
  }
  const week = new FormData(form).get("week");
  const message = `${fileSummary(file)}. Неделя: ${weekLabels[week]}.`;
  setFeedback(`${message} Имя и размер в порядке. Внутрь ещё не заглядывали`, "success");
  window.alert(`${message}\nРасширение подходит, размер тоже. Сам Excel прочитаем в ЛР 8 — прокачиваемся по порядку`);
});
/* example:submit:end */

/* example:dialogs:start */
document.querySelector("#rename-group").addEventListener("click", () => {
  const answer = window.prompt("Как подписать группу в примере?", title.textContent);
  if (answer === null) return;
  const group = answer.trim();
  if (!group || group.length > 40) {
    window.alert("Нужно от 1 до 40 символов. Название группы, а не тема диплома");
    return;
  }
  title.textContent = group;
});

form.addEventListener("reset", (event) => {
  if (!window.confirm("Вернуть учебный пример? Выбранный файл, подпись группы и настройки сбросятся. Если нажал случайно — жми «Отмена»")) {
    event.preventDefault();
    return;
  }
  fileInput.setCustomValidity("");
  title.textContent = originalTitle;
  setFeedback("Вернулись к примеру. Можно выбрать новый файл — попытки не ограничены");
});
/* example:dialogs:end */
