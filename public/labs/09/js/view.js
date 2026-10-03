export const weekLabels = { both: "Обе недели", upper: "Верхняя неделя", lower: "Нижняя неделя" };

/* example:filter:start */
export function selectSchedule(schedule, { week = "both", query = "", day = "all" } = {}) {
  const needle = query.trim().toLocaleLowerCase("ru");
  const searching = needle.length > 0;
  return {
    ...schedule,
    days: schedule.days.filter((item) => day === "all" || String(item.dayIndex) === day).map((item) => ({
      ...item,
      pairs: item.pairs.map((pair) => ({
        ...pair,
        lessons: pair.lessons.filter((lesson) =>
          (week === "both" || lesson.week === "both" || lesson.week === week) &&
          (!searching || [lesson.subject, lesson.kind, lesson.room, lesson.teacher, lesson.notes]
            .filter(Boolean).join(" ").toLocaleLowerCase("ru").includes(needle))),
      })).filter((pair) => !searching || pair.lessons.length > 0),
    })).filter((item) => !searching || item.pairs.length > 0),
  };
}
/* example:filter:end */
