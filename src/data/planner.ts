export type Subject = { id: string; name: string };
export type Task = {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  completed: boolean;
};

export const subjects: Subject[] = [
  { id: "web", name: "Web-технологии" },
  { id: "math", name: "Математика" },
  { id: "english", name: "Английский язык" },
  { id: "algorithms", name: "Алгоритмы" },
];

const templates = [
  { id: "task-01", title: "Разметить страницу планировщика", subjectId: "web", offset: -2, completed: true },
  { id: "task-02", title: "Решить задачи по матрицам", subjectId: "math", offset: -1, completed: false },
  { id: "task-03", title: "Добавить форму учебной задачи", subjectId: "web", offset: 0, completed: false },
  { id: "task-04", title: "Прочитать текст о технологиях", subjectId: "english", offset: 1, completed: false },
  { id: "task-05", title: "Разобрать линейный поиск", subjectId: "algorithms", offset: 2, completed: false },
  { id: "task-06", title: "Подготовить примеры производных", subjectId: "math", offset: 3, completed: false },
  { id: "task-07", title: "Оформить карточки задач", subjectId: "web", offset: 4, completed: false },
  { id: "task-08", title: "Повторить технические термины", subjectId: "english", offset: -3, completed: true },
  { id: "task-09", title: "Сравнить способы сортировки", subjectId: "algorithms", offset: 6, completed: false },
  { id: "task-10", title: "Собрать отчёт по HTML", subjectId: "web", offset: 7, completed: false },
];

/** Local calendar dates; no UTC conversion or assumptions about day duration. */
export function createDemoTasks(today = new Date()): Task[] {
  if (Number.isNaN(today.getTime())) throw new Error("Некорректная дата учебного примера");

  return templates.map(({ offset, ...task }) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
    date.setDate(date.getDate() + offset);
    const dueDate = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")].join("-");
    return { ...task, dueDate };
  });
}
