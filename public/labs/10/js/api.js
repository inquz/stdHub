/* example:request:start */
export async function requestSchedule(file, signal) {
  let response;
  try {
    response = await fetch(`/api/schedule?filename=${encodeURIComponent(file.name)}`, {
      method: "POST", body: file, signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Не удалось связаться с сервером. Проверь соединение и попробуй снова.");
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error("Сервис разбора расписания недоступен. Попробуй позже."); }
  if (!response.ok) throw new Error(result.error || "Не удалось прочитать расписание.");
  return result;
}
/* example:request:end */
