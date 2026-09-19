export type Lab = {
  id: number;
  title: string;
  topic: "HTML" | "CSS" | "Вёрстка" | "JavaScript";
  status: "planned" | "in-progress" | "done";
  contribution?: string;
  goal?: string;
  task?: string;
  theory?: string[];
  steps?: string[];
  sourceExamples?: { file: "lab01" | "lab02"; section: string; title: string }[];
  demo?: { src: string; title: string };
  result?: string;
  checks?: string[];
  conclusion?: string;
  sources?: { title: string; href: string }[];
};

export const labStatusLabels: Record<Lab["status"], string> = {
  planned: "Запланирована",
  "in-progress": "В работе",
  done: "Готова",
};
