import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { LabReport } from "@/components/LabReport";
import { PrintButton } from "@/components/PrintButton";
import { labs } from "@/data/labs";
import { labStatusLabels } from "@/data/labs/types";
import { report } from "@/data/report";

export const metadata: Metadata = {
  title: "Единый отчёт",
  description: "Как Экспарс приручил Excel за десять лаб: HTML, CSS, JavaScript, исходники и результаты. Есть что показать на защите.",
};

export default function ReportPage() {
  const completed = labs.filter((lab) => lab.status === "done").length;
  const progress = Math.round(completed / labs.length * 100);

  return (
    <div className="combined-report">
      <header className="report-cover">
        <div className="report-cover-main">
          <p className="eyebrow">Как это вообще заработало <span aria-hidden="true">/</span> Web-технологии</p>
          <h1>Отчёт по<br /><span>лабораторным</span></h1>
          <p className="lead">{report.title}. Десять лаб, исходники и доказательства, что кнопки здесь для дела. Можно читать по порядку или сразу идти к интересному</p>
          <div className="report-cover-actions no-print"><PrintButton /><span>В окне печати выбери «Сохранить как PDF»<br />Бумага может пока выдохнуть</span></div>
        </div>
        <div className="report-cover-document">
          <div className="report-document-top"><Icon name="file" size={26} /><span>XlsParse / ОТЧЁТ</span></div>
          <p className="report-document-title">{report.title}</p>
          <p className="report-document-subtitle">HTML · CSS · JavaScript</p>
          <div className="report-completion"><strong>{String(completed).padStart(2, "0")}<span> / {labs.length}</span></strong><span>глав готово</span></div>
          <progress className="report-progress" value={completed} max={labs.length} aria-label={`Заполнено ${completed} из ${labs.length} глав`} />
          <div className="report-document-bottom"><span>Черновик перед сдачей</span><span>{progress}%</span></div>
        </div>
      </header>

      <div className="report-meta-panel">
        <dl className="report-details">
          <div><dt>Выполнил</dt><dd>{report.author}</dd></div>
          <div><dt>Группа</dt><dd>{report.group}</dd></div>
          <div><dt>Проверил</dt><dd>{report.teacher}</dd></div>
          <div><dt>Дисциплина</dt><dd>Web-технологии</dd></div>
        </dl>
        <p className="report-draft-note"><Icon name="file" size={15} /><span>Заполнено {completed} из {labs.length} работ. Перед сдачей впиши имена и группу, затем сверься с методичкой: у неё своя атмосфера</span></p>
      </div>

      <nav className="report-toc" aria-label="Оглавление отчёта">
        <div className="report-toc-heading"><div><p className="eyebrow">Структура документа</p><h2>Оглавление</h2></div><span>{labs.length} лабораторных работ</span></div>
        <ol>{labs.map((lab) => (
          <li key={lab.id}>
            <a className={`report-toc-status-${lab.status}`} href={`#lab-${lab.id}`}>
              <span className="report-toc-number">{String(lab.id).padStart(2, "0")}</span>
              <span className="report-toc-copy"><span>{lab.title}</span><small>{lab.topic} <span aria-hidden="true">·</span> {labStatusLabels[lab.status]}</small></span>
              <Icon name={lab.status === "done" ? "check" : "arrow-up-right"} size={17} />
            </a>
          </li>
        ))}</ol>
      </nav>

      <section id="about-project" className="report-introduction" aria-labelledby="report-introduction-title">
        <div className="report-introduction-icon" aria-hidden="true"><Icon name="book" size={22} /></div>
        <div><p className="eyebrow">О проекте</p><h2 id="report-introduction-title">Десять лаб спустя: Excel приручён</h2><p>{report.introduction}</p></div>
      </section>
      {labs.map((lab) => <LabReport key={lab.id} lab={lab} combined />)}
    </div>
  );
}
