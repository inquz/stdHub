import { weekLabels, compactLessonKind, compactLessonRoom, pairEntries } from "./view.js";
import { chatGrid } from "./chat-layout.js";
import { bellSchedule, scheduleCards } from "./bell-schedule.js";

/* example:element:start */
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function lessonCard(entry, { compact, showTeachers, week }) {
  const { lesson } = entry;
  const card = element("div", "lesson");
  card.dataset.week = entry.week;
  if (!compact || (week === "both" && entry.week !== "both")) {
    card.append(element("span", "week-badge", weekLabels[entry.week]));
  }
  if (!lesson) {
    card.dataset.empty = "true";
    card.append(element("p", "empty-pair", "Окно"));
    return card;
  }
  card.append(element("p", "lesson-title", lesson.subject));
  const meta = element("p", "lesson-meta", compact ? undefined : lesson.kind);
  if (compact) {
    const room = element("span", "compact-room", compactLessonRoom(lesson));
    room.setAttribute("aria-label", `Аудитория: ${lesson.room || "не указана"}`);
    meta.append(room, element("span", "compact-kind", compactLessonKind(lesson)));
  } else meta.append(element("span", "", lesson.room || "Аудитория не указана"));
  card.append(meta);
  if (lesson.notes) card.append(element("p", "lesson-notes", lesson.notes));
  if (!compact || showTeachers) card.append(element("p", "lesson-teacher", lesson.teacher || "Преподаватель не указан"));
  return card;
}
/* example:element:end */

/* example:render:start */
export function renderSchedule(schedule, { compact = false, showTeachers = false, week = "both" } = {}) {
  const days = document.createDocumentFragment();
  const cards = scheduleCards(schedule.days);
  const grid = chatGrid(cards.length);
  for (const [index, item] of cards.entries()) {
    const section = element("section", "day-card");
    if (compact) {
      const slot = grid.slots[index];
      section.style.gridColumn = String(slot.column + 1);
      section.style.gridRow = String(slot.row + 1);
    }
    if (item.type === "bells") {
      section.classList.add("bell-card");
      section.setAttribute("aria-labelledby", "bell-schedule-title");
      const header = element("header", "day-heading");
      const heading = element("h3", "", bellSchedule.title);
      heading.id = "bell-schedule-title";
      header.append(heading);
      const times = element("dl", "bell-times");
      for (const pair of bellSchedule.pairs) {
        const row = element("div");
        const time = element("dd");
        const start = element("time", "", pair.start);
        start.dateTime = pair.start;
        const end = element("time", "", pair.end);
        end.dateTime = pair.end;
        time.append(start, " — ", end);
        row.append(element("dt", "", `${pair.number} пара`), time);
        times.append(row);
      }
      section.append(header, element("p", "bell-weekdays", bellSchedule.days), times);
      days.append(section);
      continue;
    }
    const day = item.day;
    section.id = `weekday-${day.dayIndex}`;
    section.setAttribute("aria-labelledby", `day-${day.dayIndex}`);
    const header = element("header", "day-heading");
    const heading = element("h3", "", day.day);
    heading.id = `day-${day.dayIndex}`;
    header.append(element("span", "day-number", String(day.dayIndex + 1).padStart(2, "0")), heading);
    const body = element("div", "day-body");
    body.id = `pairs-${day.dayIndex}`;
    const list = element("ol", "pair-list");
    list.setAttribute("aria-label", `Пары: ${day.day}`);
    for (const pair of day.pairs) {
      const row = element("li", "pair");
      row.value = pair.number;
      const number = element("span", "pair-number");
      number.append(element("strong", "", String(pair.number).padStart(2, "0")), element("span", "", "пара"));
      const lessons = element("div", "pair-lessons");
      for (const entry of pairEntries(pair, week)) lessons.append(lessonCard(entry, { compact, showTeachers, week }));
      row.append(number, lessons);
      list.append(row);
    }
    body.append(list);
    if (!day.pairs.length) body.append(element("p", "preview-caption", "Пар нет. Можно выдохнуть"));
    section.append(header, body);
    days.append(section);
  }
  const container = document.querySelector(".schedule-days");
  container.dataset.compact = String(compact);
  container.style.setProperty("--chat-columns", String(grid.columns));
  container.tabIndex = compact ? 0 : -1;
  container.setAttribute("role", "region");
  container.setAttribute("aria-label", compact ? "Расписание для чата, доступна горизонтальная прокрутка" : "Дни расписания");
  container.replaceChildren(days);
  document.querySelector("#schedule-title").textContent = schedule.group;
  document.querySelector("#empty-state").hidden = schedule.days.length > 0;
}
/* example:render:end */
