export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/* example:validation:start */
export function validateFile(file) {
  if (!file) return "Сначала выбери Excel. Силой мысли пока не читаем.";
  const extension = file.name.split(".").pop().toLowerCase();
  const supported = extension === "xls" || extension === "xlsx";
  if (!supported) return "Нужен файл .xls или .xlsx. Скрин из чата пока не прочитаем.";
  if (file.size === 0) return "Файл пустой. Даже расписание решило прогулять.";
  if (file.size > MAX_FILE_BYTES) return "Файл больше 5 МБ. Целый факультет пока не осилим — выбери расписание одной группы.";
  return "";
}

export function fileSummary(file) {
  return `${file.name} · ${(file.size / 1024).toFixed(1)} КБ`;
}
/* example:validation:end */
