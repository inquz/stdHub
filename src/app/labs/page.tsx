import type { Metadata } from "next";
import { LabsExplorer } from "@/components/LabsExplorer";
import { Icon } from "@/components/Icon";
import { labs } from "@/data/labs";

export const metadata: Metadata = { title: "Лабораторные работы" };

export default function LabsPage() {
  const completed = labs.filter((lab) => lab.status === "done").length;
  return (
    <div className="page-enter">
      <div className="page-heading"><div><p className="eyebrow">Web-технологии</p><h1>Лабораторные работы</h1></div><span className="page-icon"><Icon name="layers" size={26} /></span></div>
      <p className="lead">Задания, ход работы и исходники. В каждой готовой работе можно открыть результат в браузере</p>
      <div className="course-banner"><div className="course-banner-icon"><Icon name="code" size={24} /></div><div className="course-banner-copy"><strong>Планировщик студента</strong><span>10 работ · HTML, CSS и JavaScript</span></div><div className="course-progress"><div><span>Выполнено</span><strong>{completed} <span>/ {labs.length}</span></strong></div><progress value={completed} max={labs.length} aria-label="Выполненные лабораторные" /></div></div>
      <LabsExplorer items={labs.map(({ id, title, topic, status }) => ({ id, title, topic, status }))} />
    </div>
  );
}
