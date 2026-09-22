import type { LabSourceFile } from "../lab-source-files";

export type Lab = {
  id: number;
  title: string;
  topic: "HTML" | "CSS" | "Вёрстка" | "JavaScript";
  status: "planned" | "in-progress" | "done";
  contribution?: string;
  task?: string;
  steps?: string[];
  sourceExamples?: { file: LabSourceFile; section: string; title: string }[];
  demo?: { src: string; title: string };
  demoVariants?: { src: string; title: string }[];
  figures?: { src: string; caption: string; width: number; height: number }[];
  comparison?: { columns: string[]; rows: string[][] };
  result?: string;
  checks?: string[];
  sources?: { title: string; href: string }[];
};

export const labStatusLabels: Record<Lab["status"], string> = {
  planned: "Запланирована",
  "in-progress": "В работе",
  done: "Готова",
};
