import { bellSchedule, scheduleCards } from "./bell-schedule.js";

// Imported Excel text is always assigned via textContent, never interpreted as HTML.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function lessonCard(lesson, week) {
  const card = element("div", "lesson");
  card.dataset.week = week;
  if (!lesson) card.dataset.empty = "true";
  card.append(element("span", "week-badge", { upper: "Верхняя неделя", lower: "Нижняя неделя", both: "Обе недели" }[week]));
  card.append(element("p", "lesson-title", lesson?.subject ?? "Окно"));
  if (lesson) {
    const meta = element("p", "lesson-meta", lesson.kind);
    meta.append(element("span", "", lesson.room || "Аудитория не указана"));
    card.append(meta);
    if (lesson.notes) card.append(element("p", "lesson-notes", lesson.notes));
    card.append(element("p", "lesson-teacher", lesson.teacher || "Преподаватель не указан"));
  }
  return card;
}

export function renderSchedule(schedule) {
  const days = document.createDocumentFragment();
  const links = document.createDocumentFragment();
  for (const item of scheduleCards(schedule.days)) {
    const section = element("section", "day-card");
    if (item.type === "bells") {
      section.id = "bell-schedule";
      section.classList.add("bell-card");
      section.setAttribute("aria-labelledby", "bell-title");
      const heading = element("h3", "", bellSchedule.title);
      heading.id = "bell-title";
      const header = element("header", "day-heading");
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
    const list = element("ol", "pair-list");
    list.setAttribute("aria-label", `Пары: ${day.day}`);
    for (const pair of day.pairs) {
      const row = element("li", "pair");
      row.value = pair.number;
      const number = element("span", "pair-number");
      number.append(element("strong", "", String(pair.number).padStart(2, "0")), element("span", "", "пара"));
      const lessons = element("div", "pair-lessons");
      const common = pair.lessons.filter((lesson) => lesson.week === "both");
      if (!pair.lessons.length) lessons.append(lessonCard(undefined, "both"));
      else {
        for (const lesson of common) lessons.append(lessonCard(lesson, "both"));
        for (const week of ["upper", "lower"]) {
          const entries = pair.lessons.filter((lesson) => lesson.week === week);
          for (const lesson of entries) lessons.append(lessonCard(lesson, week));
          if (!entries.length && !common.length) lessons.append(lessonCard(undefined, week));
        }
      }
      row.append(number, lessons);
      list.append(row);
    }
    section.append(header, list);
    if (!day.pairs.length) section.append(element("p", "preview-caption", "Пар нет. Можно выдохнуть"));
    days.append(section);
    const menuItem = element("li");
    const link = element("a", "", day.day);
    link.href = `#${section.id}`;
    menuItem.append(link);
    links.append(menuItem);
  }
  document.querySelector(".schedule-days").replaceChildren(days);
  const bellLink = element("a", "", bellSchedule.title);
  bellLink.href = "#bell-schedule";
  const bellItem = element("li");
  bellItem.append(bellLink);
  links.append(bellItem);
  document.querySelector("#day-links").replaceChildren(links);
  document.querySelector("#schedule-title").textContent = schedule.group;
}
