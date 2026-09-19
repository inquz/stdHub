import type { Lab } from "./labs/types";
import { lab01 } from "./labs/lab01";
import { lab02 } from "./labs/lab02";

export type { Lab } from "./labs/types";

export const labs: Lab[] = [
  lab01,
  lab02,
  { id: 3, title: "CSS. Способы применения каскадных таблиц к HTML-странице", topic: "CSS", status: "planned" },
  { id: 4, title: "Особенности использования селекторов CSS. Псевдоклассы и псевдоэлементы. Блочная модель", topic: "CSS", status: "planned" },
  { id: 5, title: "CSS. Создание динамического меню навигации", topic: "CSS", status: "planned" },
  { id: 6, title: "Виды вёрстки: плоская, табличная, блочная. Изучение особенностей табличной и блочной вёрстки", topic: "Вёрстка", status: "planned" },
  { id: 7, title: "Типы JavaScript. Изучение синтаксиса языка. Работа с диалоговыми окнами", topic: "JavaScript", status: "planned" },
  { id: 8, title: "Объекты JavaScript. Дата-время. Работа с массивами", topic: "JavaScript", status: "planned" },
  { id: 9, title: "JavaScript. Объектная модель документа — Document Object Model (DOM) (4 ч.)", topic: "JavaScript", status: "planned" },
  { id: 10, title: "Динамический HTML. События. Программирование обработки событий", topic: "JavaScript", status: "planned" },
];

export function getLab(id: string) {
  return labs.find((lab) => String(lab.id) === id);
}
