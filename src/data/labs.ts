import type { Lab } from "./labs/types";
import { lab01 } from "./labs/lab01";
import { lab02 } from "./labs/lab02";
import { lab03 } from "./labs/lab03";
import { lab04 } from "./labs/lab04";
import { lab05 } from "./labs/lab05";
import { lab06 } from "./labs/lab06";

export type { Lab } from "./labs/types";

export const labs: Lab[] = [
  lab01,
  lab02,
  lab03,
  lab04,
  lab05,
  lab06,
  { id: 7, title: "Типы JavaScript. Изучение синтаксиса языка. Работа с диалоговыми окнами", topic: "JavaScript", status: "planned" },
  { id: 8, title: "Объекты JavaScript. Дата-время. Работа с массивами", topic: "JavaScript", status: "planned" },
  { id: 9, title: "JavaScript. Объектная модель документа — Document Object Model (DOM) (4 ч.)", topic: "JavaScript", status: "planned" },
  { id: 10, title: "Динамический HTML. События. Программирование обработки событий", topic: "JavaScript", status: "planned" },
];

export function getLab(id: string) {
  return labs.find((lab) => String(lab.id) === id);
}
