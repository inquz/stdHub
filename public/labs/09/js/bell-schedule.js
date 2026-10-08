// Monday–Friday bell times supplied for this timetable.
export const bellSchedule = {
  title: "Расписание звонков",
  days: "Понедельник — пятница",
  pairs: [
    { number: 1, start: "08:00", end: "09:35" },
    { number: 2, start: "09:55", end: "11:30" },
    { number: 3, start: "11:50", end: "13:25" },
    { number: 4, start: "13:45", end: "15:20" },
    { number: 5, start: "15:30", end: "17:05" },
    { number: 6, start: "17:15", end: "18:50" },
    { number: 7, start: "19:00", end: "20:35" },
  ],
};

export function scheduleCards(days) {
  const ordered = [...days].sort((a, b) => a.dayIndex - b.dayIndex);
  return [
    ...ordered.filter((day) => day.dayIndex < 5).map((day) => ({ type: "day", day })),
    { type: "bells" },
    ...ordered.filter((day) => day.dayIndex >= 5).map((day) => ({ type: "day", day })),
  ];
}
