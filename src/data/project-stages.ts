import type { Lab } from "./labs/types";

const stages = [
  { title: "Структура", technology: "HTML", from: 1, to: 2, description: "Разделы страницы, списки, форма и таблица" },
  { title: "Оформление", technology: "CSS", from: 3, to: 6, description: "Стили, состояния, меню и адаптивная вёрстка" },
  { title: "Взаимодействие", technology: "JavaScript", from: 7, to: 10, description: "Чтение Excel, выбор недели и экспорт PNG" },
];

export function getProjectStages(labs: Pick<Lab, "id" | "status">[]) {
  let currentFound = false;
  return stages.map((stage) => {
    const total = stage.to - stage.from + 1;
    const completed = labs.filter((lab) => lab.id >= stage.from && lab.id <= stage.to && lab.status === "done").length;
    const done = completed === total;
    const current = !done && !currentFound;
    if (current) currentFound = true;
    return { ...stage, completed, total, done, current };
  });
}
