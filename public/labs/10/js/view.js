export const weekLabels = { both: "Обе недели", upper: "Верхняя неделя", lower: "Нижняя неделя" };

export function compactLessonKind(lesson) {
  const kinds = { "лекция": "лек.", "практика": "практ.", "лабораторная": "лаб.", "семинар": "сем." };
  return kinds[lesson.kind.toLocaleLowerCase("ru")] ?? lesson.kind;
}

export function compactLessonRoom(lesson) {
  return !lesson.room || /^(?:аудитория\s+)?не указана$/i.test(lesson.room.trim()) ? "—" : lesson.room;
}

function missingWeeks(lessons) {
  return ["upper", "lower"].filter((week) => !lessons.some((lesson) => lesson.week === week || lesson.week === "both"));
}

// Empty slots are presentation data, not lessons: statistics and saved source stay intact.
export function pairEntries(pair, week = "both") {
  const entries = pair.lessons.map((lesson) => ({ week: lesson.week, lesson }));
  if (week !== "both") return entries.length ? entries : [{ week, lesson: null }];
  const emptyWeeks = pair.emptyWeeks ?? missingWeeks(pair.lessons);
  if (emptyWeeks.length === 2) return [{ week: "both", lesson: null }];
  for (const emptyWeek of emptyWeeks) entries.push({ week: emptyWeek, lesson: null });
  const order = { both: 0, upper: 1, lower: 2 };
  return entries.sort((a, b) => order[a.week] - order[b.week]);
}

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
        // Check the original lessons so search results cannot invent an empty week.
        emptyWeeks: missingWeeks(pair.lessons),
        lessons: pair.lessons.filter((lesson) =>
          (week === "both" || lesson.week === "both" || lesson.week === week) &&
          (!searching || [lesson.subject, lesson.kind, lesson.room, lesson.teacher, lesson.notes]
            .filter(Boolean).join(" ").toLocaleLowerCase("ru").includes(needle))),
      })).filter((pair) => !searching || pair.lessons.length > 0),
    })).filter((item) => !searching || item.pairs.length > 0),
  };
}
/* example:filter:end */
