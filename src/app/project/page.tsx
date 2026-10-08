import type { Metadata } from "next";
import Link from "next/link";
import { Demo } from "@/components/Demo";
import { Icon } from "@/components/Icon";
import { labs } from "@/data/labs";
import { labPresentation } from "@/data/lab-presentation";
import { getProjectStages } from "@/data/project-stages";

export const metadata: Metadata = {
  title: "Экспарс",
  description: "В чат снова прислали Excel? Загрузи расписание, выбери неделю и забери PNG. Пар меньше не станет, читать станет проще.",
};

export default function ProjectPage() {
  const available = labs.filter((lab) => lab.status === "done" && lab.demo);
  const current = available[available.length - 1];
  const next = labs.find((lab) => lab.status !== "done");
  const stages = getProjectStages(labs);

  return (
    <div className="page-enter">
      <div className="page-heading"><div><p className="eyebrow">XlsParse / наш проект</p><h1>Экспарс</h1></div>{current && <span className="version-label">ЛР {String(current.id).padStart(2, "0")} / {labs.length}</span>}</div>
      <p className="lead">Excel из чата группы снова проверяет твою силу воли? Закидывай его сюда. <br />Здесь готовый Экспарс; весь путь от первой странички до «о, работает» — в лабораторных</p>
      <ol className="project-stages" aria-label="Этапы Экспарса">
        {stages.map((stage, index) => <li className={stage.done ? "is-ready" : undefined} key={stage.technology}>
          <span>{stage.done ? <Icon name="check" size={15} /> : String(index + 1).padStart(2, "0")}</span>
          <div><strong>{stage.title}</strong><small>{stage.done ? "Готово" : `${stage.completed} из ${stage.total}`} · ЛР {stage.from}–{stage.to}</small></div>
        </li>)}
      </ol>
      {current && <section className="project-demo-section" aria-labelledby="current-version">
        <div className="section-heading"><h2 id="current-version">{labPresentation[current.id]?.title ?? current.title}</h2><Link className="text-link" href={`/labs/${current.id}`}>К отчёту и коду <Icon name="arrow-up-right" size={16} /></Link></div>
        <div className="stage-note"><Icon name="code" size={21} /><div><strong>Финальная сборка. Да, до неё дошли</strong><p>{current.result}</p></div></div>
        <Demo demo={current.demo} />
      </section>}
      {next && <Link className="project-next" href={`/labs/${next.id}`}><span className="stat-icon"><Icon name="layers" size={22} /></span><div><span className="eyebrow">Следующая работа · ЛР {next.id}</span><h3>{labPresentation[next.id]?.title ?? next.title}</h3><p>{labPresentation[next.id]?.description}</p></div><Icon name="arrow-right" size={22} /></Link>}
    </div>
  );
}
