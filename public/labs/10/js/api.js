/* example:request:start */
export async function requestSchedule(file, signal) {
  let response;
  try {
    response = await fetch(`/api/schedule?filename=${encodeURIComponent(file.name)}`, {
      method: "POST", body: file, signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("До сервера не достучались. Проверь интернет и выбери файл ещё раз.");
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error("Сервис разбора не ответил как надо. Попробуй чуть позже — Excel никуда не денется."); }
  if (!response.ok) throw new Error(result.error || "Не удалось разобрать расписание. Попробуй другой Excel с тем же шаблоном.");
  return result;
}
/* example:request:end */
