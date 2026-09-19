import type { Metadata } from "next";
import { LabReport } from "@/components/LabReport";
import { PrintButton } from "@/components/PrintButton";
import { labs } from "@/data/labs";
import { report } from "@/data/report";

export const metadata: Metadata = { title: "Единый отчёт" };

export default function ReportPage() {
  const completed = labs.filter((lab) => lab.status === "done").length;
  return (
    <div className="combined-report">
      <header className="report-cover">
        <p className="eyebrow">Отчёт по лабораторным работам</p>
        <h1>{report.title}</h1>
        <p className="lead">Дисциплина «Web-технологии» · HTML, CSS и JavaScript</p>
        <dl className="report-details">
          <div><dt>Выполнил</dt><dd>{report.author}</dd></div>
          <div><dt>Группа</dt><dd>{report.group}</dd></div>
          <div><dt>Проверил</dt><dd>{report.teacher}</dd></div>
        </dl>
        <p className="placeholder">Черновик: заполнено {completed} из {labs.length} лабораторных работ.
          Конкретные задания составлены по темам курса; требования методички ещё предстоит уточнить.</p>
        <PrintButton />
      </header>
      <nav className="report-toc panel" aria-label="Оглавление отчёта">
        <h2>Оглавление</h2>
        <ol>{labs.map((lab) => <li key={lab.id}><a href={`#lab-${lab.id}`}>{lab.title}</a></li>)}</ol>
      </nav>
      <section className="report-section report-introduction">
        <h2>Введение</h2>
        <p>{report.introduction}</p>
      </section>
      {labs.map((lab) => <LabReport key={lab.id} lab={lab} combined />)}
    </div>
  );
}
