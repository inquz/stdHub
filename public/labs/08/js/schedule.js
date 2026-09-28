/* example:statistics:start */
export function scheduleStats(schedule, week) {
  const lessons = schedule.days.flatMap((day) => day.pairs.flatMap((pair) => pair.lessons))
    .filter((lesson) => week === "both" || lesson.week === "both" || lesson.week === week);
  return {
    lessons: lessons.length,
    subjects: new Set(lessons.map((lesson) => lesson.subject)).size,
    teachers: new Set(lessons.flatMap((lesson) => lesson.teacher.split(",").map((name) => name.trim())).filter(Boolean)).size,
  };
}

export function formatImportDate(date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(date);
}
/* example:statistics:end */
