export const STORAGE_KEY = "xlsparse:workspace:v1";
const MAX_LENGTH = 2_000_000;
const text = (value) => typeof value === "string" && value.length <= 10000;
const array = (value, max, check) => Array.isArray(value) && value.length <= max && value.every(check);
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const week = (value) => ["both", "upper", "lower"].includes(value);

function validSchedule(schedule) {
  return schedule && text(schedule.group) && text(schedule.sheetName) && text(schedule.heading) &&
    array(schedule.warnings, 1000, text) && array(schedule.days, 7, (day) =>
      day && text(day.day) && integer(day.dayIndex, 0, 6) && array(day.pairs, 30, (pair) =>
        pair && integer(pair.number, 1, 30) && array(pair.lessons, 30, (lesson) =>
          lesson && [lesson.subject, lesson.kind, lesson.room, lesson.teacher].every(text) &&
          (lesson.notes === undefined || text(lesson.notes)) && week(lesson.week)))) &&
    new Set(schedule.days.map((day) => day.dayIndex)).size === schedule.days.length;
}

export function validState(state) {
  return Boolean(state && state.version === 1 &&
    array(state.schedules, 50, validSchedule) && state.schedules.length > 0 &&
    integer(state.selected, 0, state.schedules.length - 1) && text(state.source) &&
    (state.importedAt === null || (text(state.importedAt) && Number.isFinite(Date.parse(state.importedAt)))) &&
    state.options && week(state.options.week) && typeof state.options.compact === "boolean" &&
    (state.options.showTeachers === undefined || typeof state.options.showTeachers === "boolean") &&
    typeof state.options.query === "string" && state.options.query.length <= 100 &&
    (state.options.day === "all" || state.schedules[state.selected].days.some((day) => String(day.dayIndex) === state.options.day)));
}

/* example:storage:start */
export function loadState(getStorage = () => window.localStorage) {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (raw === null) return { state: null, message: "Этот браузер запомнит расписание и настройки. Одной заботой меньше" };
    if (raw.length > MAX_LENGTH) throw new Error("size");
    const state = JSON.parse(raw);
    if (!validState(state)) throw new Error("shape");
    return { state, message: "Расписание вернулось из памяти браузера. Пришёл новый Excel? Выбери его снова" };
  } catch (error) {
    return { state: null, message: error.name === "SecurityError"
      ? "Хранилище недоступно. Браузер сегодня без автосейва: работа и PNG доступны, но после закрытия данные могут потеряться"
      : "Сохранение не прочиталось — бывает и у браузера. Сейчас показан учебный пример. Нажми «Восстановить пример», чтобы сбросить сохранение" };
  }
}

export function saveState(state, getStorage = () => window.localStorage) {
  try {
    const raw = JSON.stringify(state);
    if (raw.length > MAX_LENGTH || !validState(state)) throw new Error("size or shape");
    getStorage().setItem(STORAGE_KEY, raw);
    return "Сохранено в этом браузере. Ctrl+S за тебя уже нажали";
  } catch {
    return "Не удалось сохранить изменения в браузере. До перезагрузки всё работает; скачай PNG, чтобы унести расписание с собой";
  }
}
/* example:storage:end */
