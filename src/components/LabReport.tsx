import type { ReactNode } from "react";
import type { Lab } from "@/data/labs";
import { CodeBlock } from "@/components/CodeBlock";
import { Demo } from "@/components/Demo";
import { Icon } from "@/components/Icon";
import { labStatusLabels } from "@/data/labs/types";
import { readLabSources } from "@/lib/lab-sources";

const upcomingTopics: Record<number, { description: string; skills: string[] }> = {
  3: { description: "Следующий шаг — оформить HTML-планировщик: выбрать цвета и шрифты, настроить отступы, привести форму и таблицу к единому стилю.", skills: ["Подключение CSS", "Типографика", "Цвет и отступы"] },
  4: { description: "Разберём, как точечно оформлять элементы и их состояния. Научимся управлять размерами, границами и внутренними отступами карточек.", skills: ["Селекторы", "Псевдоклассы", "Блочная модель"] },
  5: { description: "Соберём раскрываемую навигацию средствами HTML и CSS. Проверим удобство меню на небольшом экране и при работе с клавиатурой.", skills: ["Навигация", "Состояния меню", "Доступность"] },
  6: { description: "Сравним способы компоновки страницы и подготовим адаптивную структуру планировщика для разных размеров экрана.", skills: ["Табличная вёрстка", "Блочная вёрстка", "Адаптивность"] },
  7: { description: "Перейдём от оформления к поведению: познакомимся с типами данных, условиями и диалоговыми окнами JavaScript.", skills: ["Типы данных", "Синтаксис", "Диалоговые окна"] },
  8: { description: "Представим учебные задачи в виде объектов, поработаем с массивами и датами и подготовим вычисление статистики планировщика.", skills: ["Объекты", "Массивы", "Дата и время"] },
  9: { description: "Свяжем данные с интерфейсом: научимся находить, создавать и обновлять элементы страницы через объектную модель документа.", skills: ["DOM", "Создание элементов", "Обновление страницы"] },
  10: { description: "Объединим интерфейс и логику: обработаем добавление и изменение задач, поиск и фильтры, а затем сохранение данных в браузере.", skills: ["События", "Работа с формой", "Сохранение задач"] },
};

function ReportSection({ id, number, title, combined, children, className = "" }: {
  id: string;
  number: string;
  title: string;
  combined: boolean;
  children: ReactNode;
  className?: string;
}) {
  const Title = combined ? "h3" : "h2";
  return (
    <section className={`report-section ${className}`} id={id} aria-labelledby={`${id}-title`}>
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
  const codeExamples = await readLabSources(lab.sourceExamples ?? []);
  const upcoming = lab.status === "planned" && !lab.goal;
  const preview = upcomingTopics[lab.id];
  const sectionId = (name: string) => `lab-${lab.id}-${name}`;
  const links = [
    ["goal", "Цель"], ["theory", "Теория"], ["steps", "Ход работы"],
    ["code", "Код"], ["result", "Результат"], ["conclusion", "Вывод"],
  ];

  return (
    <article className={`lab-report${upcoming ? " upcoming-report" : ""}`} id={`lab-${lab.id}`}>
      <header className="lab-report-header">
        <div className="lab-report-topline">
          <p className="eyebrow">Лабораторная {String(lab.id).padStart(2, "0")} <span aria-hidden="true">/</span> {lab.topic}</p>
          <span className={`status-badge status-${lab.status}`}>
            <Icon name={lab.status === "done" ? "check" : "clock"} size={13} />
            {labStatusLabels[lab.status]}
          </span>
        </div>
        <Title>{lab.title}</Title>
        {lab.contribution && (
          <div className="report-contribution">
            <Icon name="layers" size={20} />
            <div><span>Что добавлено в проект</span><p>{lab.contribution}</p></div>
          </div>
        )}
      </header>

      {upcoming ? (
        <section className="upcoming-preview" aria-label="План работы">
          <div className="upcoming-icon" aria-hidden="true"><Icon name="clock" size={26} /></div>
          <div className="upcoming-copy">
            <p className="eyebrow">Впереди по курсу</p>
            {combined ? <h3>Эта глава ещё впереди</h3> : <h2>Здесь начнётся следующий этап</h2>}
            <p>{preview?.description ?? "Материалы, исходный код и результат появятся здесь по мере выполнения лабораторной работы."}</p>
            {preview && <ul className="upcoming-skills" aria-label="Темы работы">{preview.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>}
            <p className="upcoming-note">План работы предварительный. Задание будет уточнено по методическим указаниям.</p>
          </div>
        </section>
      ) : (
        <>
          {!combined && (
            <nav className="report-jump no-print" aria-label="На этой странице">
              <span>На этой странице</span>
              <div>{links.map(([id, label]) => <a href={`#${sectionId(id)}`} key={id}>{label}</a>)}</div>
            </nav>
          )}
          <div className="report-objectives">
            <ReportSection id={sectionId("goal")} number="01" title="Цель работы" combined={combined}>
              <p className={lab.goal ? "text-content" : "placeholder"}>{lab.goal ?? "Будет уточнена по методическим указаниям."}</p>
            </ReportSection>
            <ReportSection id={sectionId("task")} number="02" title="Задание" combined={combined}>
              <p className={lab.task ? "text-content" : "placeholder"}>{lab.task ?? "Подробное условие ещё не добавлено. В исходном списке указана только тема."}</p>
            </ReportSection>
          </div>
          <ReportSection id={sectionId("theory")} number="03" title="Краткая теория" combined={combined}>
            {lab.theory?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ?? <p className="placeholder">Будет добавлена при выполнении работы.</p>}
          </ReportSection>
          <ReportSection id={sectionId("steps")} number="04" title="Ход работы" combined={combined}>
            {lab.steps?.length ? (
              <ol className="report-steps">{lab.steps.map((step, index) => <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
            ) : <p className="placeholder">Этапы выполнения ещё не описаны.</p>}
          </ReportSection>
          <ReportSection id={sectionId("code")} number="05" title="Исходный код" combined={combined}>
            {codeExamples.length ? codeExamples.map((code) => <CodeBlock key={code.title} {...code} />)
              : <p className="placeholder">Код решения ещё не добавлен.</p>}
          </ReportSection>
          <ReportSection id={sectionId("result")} number="06" title="Демонстрация и результат" combined={combined}>
            <Demo demo={lab.demo} result={lab.result} />
          </ReportSection>
          {lab.checks && <ReportSection id={sectionId("checks")} number="07" title="Проверка результата" combined={combined}>
            <ul className="report-checks">{lab.checks.map((check) => <li key={check}><Icon name="check" size={16} /><span>{check}</span></li>)}</ul>
          </ReportSection>}
          <ReportSection id={sectionId("conclusion")} number="08" title="Вывод" combined={combined} className="report-conclusion">
            <p className={lab.conclusion ? "text-content" : "placeholder"}>{lab.conclusion ?? "Будет сформулирован после выполнения работы."}</p>
          </ReportSection>
          {lab.sources && <ReportSection id={sectionId("sources")} number="09" title="Источники" combined={combined}>
            <ul className="report-sources">{lab.sources.map((source) => (
              <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer"><span>{source.title}</span><Icon name="external" size={15} /></a></li>
            ))}</ul>
          </ReportSection>}
        </>
      )}
    </article>
  );
}
