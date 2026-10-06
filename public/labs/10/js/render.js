import { weekLabels } from "./view.js";

/* example:element:start */
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function lessonCard(lesson) {
  const card = element("div", "lesson");
  card.dataset.week = lesson.week;
  card.append(element("span", "week-badge", weekLabels[lesson.week]));
  card.append(element("p", "lesson-title", lesson.subject));
  const meta = element("p", "lesson-meta", lesson.kind);
  meta.append(element("span", "", lesson.room || "Аудитория не указана"));
  card.append(meta);
  if (lesson.notes) card.append(element("p", "lesson-notes", lesson.notes));
  card.append(element("p", "lesson-teacher", lesson.teacher || "Преподаватель не указан"));
  return card;
}
/* example:element:end */

/* example:render:start */
export function renderSchedule(schedule, { collapsible = false, collapsed = new Set() } = {}) {
  const days = document.createDocumentFragment();
  for (const day of schedule.days) {
    const section = element("section", "day-card");
    section.id = `weekday-${day.dayIndex}`;
    section.setAttribute("aria-labelledby", `day-${day.dayIndex}`);
    const header = element("header", "day-heading");
    const heading = element("h3", "", day.day);
    heading.id = `day-${day.dayIndex}`;
    if (collapsible) {
      const button = element("button", "day-toggle");
      button.type = "button";
      button.dataset.action = "toggle-day";
      button.dataset.day = String(day.dayIndex);
      button.setAttribute("aria-expanded", String(!collapsed.has(day.dayIndex)));
      button.setAttribute("aria-controls", `pairs-${day.dayIndex}`);
      button.append(element("span", "", day.day), element("span", "toggle-symbol", collapsed.has(day.dayIndex) ? "+" : "−"));
      heading.replaceChildren(button);
    }
    header.append(element("span", "day-number", String(day.dayIndex + 1).padStart(2, "0")), heading);
    const body = element("div", "day-body");
    body.id = `pairs-${day.dayIndex}`;
    body.hidden = collapsed.has(day.dayIndex);
    const list = element("ol", "pair-list");
    list.setAttribute("aria-label", `Пары: ${day.day}`);
    for (const pair of day.pairs) {
      const row = element("li", "pair");
      row.value = pair.number;
      const number = element("span", "pair-number");
      number.append(element("strong", "", String(pair.number).padStart(2, "0")), element("span", "", "пара"));
      const lessons = element("div", "pair-lessons");
      for (const lesson of pair.lessons) lessons.append(lessonCard(lesson));
      if (!pair.lessons.length) lessons.append(element("p", "empty-pair", "Пары нет"));
      row.append(number, lessons);
      list.append(row);
    }
    body.append(list);
    if (!day.pairs.length) body.append(element("p", "preview-caption", "Пар нет. Можно выдохнуть"));
    section.append(header, body);
    days.append(section);
  }
  document.querySelector(".schedule-days").replaceChildren(days);
  document.querySelector("#schedule-title").textContent = schedule.group;
  document.querySelector("#empty-state").hidden = schedule.days.length > 0;
}
/* example:render:end */
