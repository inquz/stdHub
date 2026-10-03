import type { ReactNode } from "react";
import type { Lab } from "@/data/labs";
import { CodeBlock } from "@/components/CodeBlock";
import { Demo } from "@/components/Demo";
import { LabResultExtras } from "@/components/LabResultExtras";
import { Icon } from "@/components/Icon";
import { labPresentation } from "@/data/lab-presentation";
import { labStatusLabels } from "@/data/labs/types";
import { readLabSources } from "@/lib/lab-sources";

function ReportSection({ id, number, title, combined, children }: {
  id: string;
  number: string;
  title: string;
  combined: boolean;
  children: ReactNode;
}) {
  const Title = combined ? "h3" : "h2";
  return (
    <section className="report-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="report-section-heading">
        <span className="report-section-number" aria-hidden="true">{number}</span>
        <Title id={`${id}-title`}>{title}</Title>
      </div>
      <div className="report-section-content">{children}</div>
    </section>
  );
}

export async function LabReport({ lab, combined = false }: { lab: Lab; combined?: boolean }) {
  const Title = combined ? "h2" : "h1";
  const Subheading = combined ? "h4" : "h3";
  const codeExamples = await readLabSources(lab.sourceExamples ?? []);
  const upcoming = lab.status === "planned" && !lab.task;
  const presentation = labPresentation[lab.id];
  const sectionId = (name: string) => `lab-${lab.id}-${name}`;
  const links = [
    ["task", "Задание"], ["steps", "Ход работы"],
    ["code", "Исходный код"], ["result", "Демо и результат"],
  ];

  return (
    <article className={`lab-report${upcoming ? " upcoming-report" : ""}`} id={`lab-${lab.id}`}>
      <header className="lab-report-header">
        <div className="lab-report-topline">
          <p className="report-kicker">Лабораторная {String(lab.id).padStart(2, "0")} <span aria-hidden="true">/</span> {lab.topic}</p>
          <span className={`status-badge status-${lab.status}`}>
            <Icon name={lab.status === "done" ? "check" : "clock"} size={14} />
            {labStatusLabels[lab.status]}
          </span>
        </div>
        <Title>{presentation?.title ?? lab.title}</Title>
        {presentation?.title !== lab.title && <p className="report-course-title">{lab.title}</p>}
        {lab.contribution && <p className="report-summary">{lab.contribution}</p>}
        {!combined && lab.demo && (
          <div className="report-actions no-print">
            <a className="report-demo-link" href={`#${sectionId("result")}`}>Посмотреть демо <Icon name="chevron-down" size={16} /></a>
            <a href={lab.demo.src} target="_blank" rel="noopener noreferrer">Открыть HTML-страницу <Icon name="external" size={15} /></a>
          </div>
        )}
      </header>

      {upcoming ? (
        <section className="upcoming-preview" aria-label="План работы">
          <Icon name="clock" size={23} />
          <div className="upcoming-copy">
            {combined ? <h3>Работа ещё не выполнена</h3> : <h2>Работа ещё не выполнена</h2>}
            <p>{presentation?.description ?? "Задание и материалы пока не добавлены"}</p>
          </div>
        </section>
      ) : (
        <>
          {!combined && (
            <nav className="report-jump no-print" aria-label="Разделы лабораторной">
              {links.map(([id, label], index) => (
                <a href={`#${sectionId(id)}`} key={id}><span aria-hidden="true">0{index + 1}</span>{label}</a>
              ))}
            </nav>
          )}
          <ReportSection id={sectionId("task")} number="01" title="Задание" combined={combined}>
            <p className={lab.task ? "text-content" : "placeholder"}>{lab.task ?? "Условие работы пока не добавлено"}</p>
          </ReportSection>
          <ReportSection id={sectionId("steps")} number="02" title="Ход работы" combined={combined}>
            {lab.steps?.length ? (
              <ol className="report-steps">{lab.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            ) : <p className="placeholder">Шаги работы пока не описаны</p>}
          </ReportSection>
          <ReportSection id={sectionId("code")} number="03" title="Исходный код" combined={combined}>
            {codeExamples.length ? (
              <div className="report-source-list">{codeExamples.map((code, index) => (
                <details className="report-source" key={code.title} open={combined || index === 0}>
                  <summary><span>{code.title}</span><span className="report-source-language">{code.language}</span><Icon name="chevron-down" size={16} /></summary>
                  <CodeBlock {...code} />
                </details>
              ))}</div>
            ) : <p className="placeholder">Исходный код пока не добавлен</p>}
          </ReportSection>
          <ReportSection id={sectionId("result")} number="04" title="Демо и результат" combined={combined}>
            <Demo demo={lab.demo} result={lab.result} />
            <LabResultExtras lab={lab} />
            {lab.checks?.length ? (
              <div className="report-verification" id={sectionId("checks")}>
                <Subheading>Что проверить в демо</Subheading>
                <ul className="report-checks">{lab.checks.map((check) => <li key={check}><Icon name="check" size={16} /><span>{check}</span></li>)}</ul>
              </div>
            ) : null}
          </ReportSection>
          {lab.sources?.length ? (
            <footer className="report-references" id={sectionId("sources")}>
              <p>Документация к работе</p>
              <ul className="report-sources">{lab.sources.map((source) => (
                <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer"><span>{source.title}</span><Icon name="external" size={14} /></a></li>
              ))}</ul>
            </footer>
          ) : null}
        </>
      )}
    </article>
  );
}
