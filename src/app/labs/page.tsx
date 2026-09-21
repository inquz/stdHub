import type { Metadata } from "next";
import { LabsExplorer } from "@/components/LabsExplorer";
import { Icon } from "@/components/Icon";
import { labs } from "@/data/labs";

export const metadata: Metadata = { title: "Лабораторные работы" };

export default function LabsPage() {
  const completed = labs.filter((lab) => lab.status === "done").length;
  return (
    <div className="page-enter">
      <div className="page-heading"><div><p className="eyebrow">Практика, которая складывается в продукт</p><h1>Лабораторные работы<span className="accent-text">.</span></h1></div><span className="page-icon"><Icon name="layers" size={26} /></span></div>
      <p className="lead">От первой строки HTML до своего планировщика. Изучай, пробуй и наблюдай, как проект становится больше.</p>
      <div className="course-banner"><div className="course-banner-icon"><Icon name="code" size={24} /></div><div className="course-banner-copy"><strong>Один курс. Десять шагов вперёд.</strong><span>HTML → CSS → JavaScript</span></div><div className="course-progress"><div><span>Твой прогресс</span><strong>{completed} <span>/ {labs.length}</span></strong></div><progress value={completed} max={labs.length} aria-label="Выполненные лабораторные" /></div></div>
      <LabsExplorer items={labs.map(({ id, title, topic, status }) => ({ id, title, topic, status }))} />
    </div>
  );
}
