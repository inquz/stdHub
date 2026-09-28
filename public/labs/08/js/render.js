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
  card.append(element("span", "week-badge", { upper: "Верхняя", lower: "Нижняя", both: "Обе недели" }[week]));
  card.append(element("p", "lesson-title", lesson?.subject ?? "Пары нет"));
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
  for (const day of schedule.days) {
    const section = element("section", "day-card");
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
    if (!day.pairs.length) section.append(element("p", "preview-caption", "Пар нет. Можно выдохнуть."));
    days.append(section);
    const item = element("li");
    const link = element("a", "", day.day);
    link.href = `#${section.id}`;
    item.append(link);
    links.append(item);
  }
  document.querySelector(".schedule-days").replaceChildren(days);
  document.querySelector(".nav-dropdown:nth-child(2) .dropdown-list").replaceChildren(links);
  document.querySelector("#schedule-title").textContent = schedule.group;
}
