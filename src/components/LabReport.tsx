import type { Lab } from "@/data/labs";
import { CodeBlock } from "@/components/CodeBlock";
import { Demo } from "@/components/Demo";
import { labStatusLabels } from "@/data/labs/types";
import { readLabSources } from "@/lib/lab-sources";

export async function LabReport({ lab, combined = false }: { lab: Lab; combined?: boolean }) {
  const Title = combined ? "h2" : "h1";
  const SectionTitle = combined ? "h3" : "h2";
  const codeExamples = await readLabSources(lab.sourceExamples ?? []);

  return (
    <article className="lab-report" id={`lab-${lab.id}`}>
      <header>
        <p className="eyebrow">Лабораторная работа № {lab.id} · {lab.topic}</p>
        <Title>{lab.title}</Title>
        <p className={`status-badge status-${lab.status}`}>{labStatusLabels[lab.status]}</p>
        {lab.contribution && <p className="contribution">{lab.contribution}</p>}
      </header>
      <section className="report-section">
        <SectionTitle>Цель работы</SectionTitle>
        <p className={lab.goal ? "text-content" : "placeholder"}>{lab.goal ?? "Будет уточнена по методическим указаниям."}</p>
      </section>
      <section className="report-section">
        <SectionTitle>Задание</SectionTitle>
        <p className={lab.task ? "text-content" : "placeholder"}>{lab.task ?? "Подробное условие ещё не добавлено. В исходном списке указана только тема."}</p>
      </section>
      <section className="report-section">
        <SectionTitle>Краткая теория</SectionTitle>
        {lab.theory?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ?? <p className="placeholder">Будет добавлена при выполнении работы.</p>}
      </section>
      <section className="report-section">
        <SectionTitle>Ход работы</SectionTitle>
        {lab.steps?.length ? (
          <ol className="steps">{lab.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>
        ) : <p className="placeholder">Этапы выполнения ещё не описаны.</p>}
      </section>
      <section className="report-section">
        <SectionTitle>Исходный код</SectionTitle>
        {codeExamples.length ? codeExamples.map((code) => <CodeBlock key={code.title} {...code} />)
          : <p className="placeholder">Код решения ещё не добавлен.</p>}
      </section>
      <section className="report-section">
        <SectionTitle>Демонстрация и результат</SectionTitle>
        <Demo demo={lab.demo} result={lab.result} />
      </section>
      {lab.checks && <section className="report-section">
        <SectionTitle>Проверка результата</SectionTitle>
        <ul className="check-list">{lab.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      </section>}
      <section className="report-section">
        <SectionTitle>Вывод</SectionTitle>
        <p className={lab.conclusion ? "text-content" : "placeholder"}>{lab.conclusion ?? "Будет сформулирован после выполнения работы."}</p>
      </section>
      {lab.sources && <section className="report-section">
        <SectionTitle>Источники</SectionTitle>
        <ul className="check-list">{lab.sources.map((source) => (
          <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.title}</a></li>
        ))}</ul>
      </section>}
    </article>
  );
}
