import type { Metadata } from "next";
import { LabCard } from "@/components/LabCard";
import { labs } from "@/data/labs";

export const metadata: Metadata = { title: "Лабораторные работы" };

export default function LabsPage() {
  const completed = labs.filter((lab) => lab.status === "done").length;
  return (
    <>
      <p className="eyebrow">Содержание курса</p>
      <h1>Лабораторные работы</h1>
      <p className="lead">Разрабатываем планировщик по шагам: HTML → CSS → JavaScript.
        Готово {completed} из {labs.length} работ. Итоговая аттестация — зачёт.</p>
      <ol className="lab-grid">{labs.map((lab) => <LabCard key={lab.id} lab={lab} />)}</ol>
    </>
  );
}
