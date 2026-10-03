import type { Lab } from "./labs/types";
import { lab01 } from "./labs/lab01";
import { lab02 } from "./labs/lab02";
import { lab03 } from "./labs/lab03";
import { lab04 } from "./labs/lab04";
import { lab05 } from "./labs/lab05";
import { lab06 } from "./labs/lab06";
import { lab07 } from "./labs/lab07";
import { lab08 } from "./labs/lab08";
import { lab09 } from "./labs/lab09";
import { lab10 } from "./labs/lab10";

export type { Lab } from "./labs/types";

export const labs: Lab[] = [
  lab01,
  lab02,
  lab03,
  lab04,
  lab05,
  lab06,
  lab07,
  lab08,
  lab09,
  lab10,
];

export function getLab(id: string) {
  return labs.find((lab) => String(lab.id) === id);
}
