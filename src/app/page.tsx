import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { labs } from "@/data/labs";
import { subjects, createDemoTasks } from "@/data/planner";
import { labPresentation } from "@/data/lab-presentation";
import { getProjectStages } from "@/data/project-stages";

export default function Home() {
  const completed = labs.filter((lab) => lab.status === "done");
  const nextLab = labs.find((lab) => lab.status !== "done");
  const progress = Math.round(completed.length / labs.length * 100);
  const tasks = createDemoTasks(new Date(2026, 8, 13));
  const stages = getProjectStages(labs);
  const latest = completed[completed.length - 1];

  return (
    <div className="overview page-enter">
      <div className="page-heading">
        <div><p className="eyebrow">Шедевры Web-дева</p><h1>Лабохранилище<span className="accent-text"></span></h1></div>
        <span className="semester-label"><span className="status-dot" />Web-технологии</span>
      </div>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-kicker"><Icon name="sparkles" size={15} />Восьмое Чудо света</span>
          <h2 id="hero-title">Чем ближе дедлайн...<br /><span>Тем ближе отчисление.</span></h2>
          <p>В связи с тем, что я понятия не имею как задоджить бесконечные эвакуации и сдать хоть что-то, я принял волевое решение создать данный продукт.</p>
          <div className="hero-actions">
            <Link className="button" href="/project">Открыть Пароскоп <Icon name="arrow-up-right" size={17} /></Link>
            <a className="text-link" href="#project-path">Как устроен проект <Icon name="arrow-right" size={16} /></a>
          </div>
        </div>
        <div className="hero-art" aria-label="Готовность лаб по HTML, CSS и JS">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <Image className="floating-sun" src="/trump-sun.png" alt="Улыбающееся солнышко с лицом Трампа" width={104} height={104} sizes="(max-width: 680px) 88px, 104px" />
          <div className="preview-board">
            <div className="preview-top"><span className="preview-mark"><Icon name="calendar" size={17} /></span><span>Туду-лист<small>Тут будет весь предмет</small></span><span className="preview-dots">•••</span></div>
            <div className="preview-subhead"><span>Чеклист</span><span>03</span></div>
            {stages.map((stage, index) => (
              <div className={`preview-task ${stage.done ? "is-complete" : ""}`} key={stage.technology}>
                <span className="preview-check"><Icon name={stage.done ? "check" : "close"} size={12} /><span className="sr-only">{stage.done ? "Выполнено" : "Не выполнено"}</span></span>
                <div><span>Лабы по {stage.technology === "JavaScript" ? "JS" : stage.technology}</span><small><i className={`subject-dot subject-${index}`} />{stage.completed} из {stage.total} · {stage.done ? "Можно выдохнуть" : "Сами себя не сдадут"}</small></div>
              </div>
            ))}
            <div className="preview-bottom"><span>Вот такой проект, собачка...</span><Icon name="arrow-up-right" size={15} /></div>
          </div>
          {latest && <div className="floating-progress"><span className="small-check"><Icon name="check" size={15} /></span><span><strong>Чекпоинт</strong><small>ЛР {latest.id} · {latest.topic}</small></span></div>}
        </div>
      </section>
      <dl className="stat-grid">
        <div className="stat-card"><span className="stat-icon stat-icon-success"><Icon name="layers" size={21} /></span><div><dt>Лабораторные готовы</dt><dd>{String(completed.length).padStart(2, "0")} <span>/ {labs.length}</span></dd></div><span className="stat-caption">Начало положено</span><div className="mini-progress" role="progressbar" aria-label="Готовность лабораторных" aria-valuenow={completed.length} aria-valuemin={0} aria-valuemax={labs.length}><span style={{ width: `${progress}%` }} /></div></div>
        <div className="stat-card"><span className="stat-icon stat-icon-peach"><Icon name="book" size={21} /></span><div><dt>Учебных предметов</dt><dd>{String(subjects.length).padStart(2, "0")}</dd></div><span className="stat-caption">Разные предметы. Один план.</span></div>
        <div className="stat-card"><span className="stat-icon stat-icon-lilac"><Icon name="calendar" size={21} /></span><div><dt>Задач в примере</dt><dd>{String(tasks.length).padStart(2, "0")}</dd></div><span className="stat-caption">От первой строки до результата</span></div>
      </dl>
      <div className="dashboard-columns">
        <section className="next-section">
          <div className="section-heading"><h2>Продолжим создавать</h2><span className="subtle-label">Следующий шаг</span></div>
          {nextLab && <Link className="next-card" href={`/labs/${nextLab.id}`}>
            <div className="next-card-top"><span className="next-label">Лабораторная {String(nextLab.id).padStart(2, "0")}</span><Icon name="arrow-up-right" size={23} /></div>
            <h3>{labPresentation[nextLab.id].title}</h3>
            <p>{labPresentation[nextLab.id].description}</p>
            <div className="next-card-bottom"><span className="next-chip">{nextLab.topic}</span><span>Посмотреть этап <Icon name="arrow-right" size={16} /></span></div>
            <span className="next-decoration" aria-hidden="true">*</span>
          </Link>}
        </section>
        <section id="project-path" className="path-section">
          <div className="section-heading"><h2>От идеи к результату</h2><span className="subtle-label">3 технологии</span></div>
          <ol className="learning-path">
            {stages.map((stage, index) => <li className={stage.done ? "path-done" : stage.current ? "path-current" : undefined} key={stage.technology}>
              <span className="path-node">{stage.done ? <Icon name="check" size={17} /> : String(index + 1).padStart(2, "0")}</span>
              <div><div className="path-title"><h3>{stage.title}</h3><span>{stage.technology}</span></div><p>{stage.description}</p><small>Работы {String(stage.from).padStart(2, "0")}–{String(stage.to).padStart(2, "0")} <span>· {stage.done ? "Готово" : `${stage.completed} из ${stage.total}`}</span></small></div>
            </li>)}
          </ol>
        </section>
      </div>
      <section className="completed-section">
        <div className="section-heading"><h2>Уже в копилке</h2><Link className="text-link" href="/labs">Все лабораторные <Icon name="arrow-right" size={16} /></Link></div>
        <div className="completed-grid">{completed.map((lab) => <Link className="completed-card" key={lab.id} href={`/labs/${lab.id}`}>
          <span className="completed-number">{String(lab.id).padStart(2, "0")}</span><div><span className="eyebrow">{lab.topic} · Лабораторная работа</span><h3>{labPresentation[lab.id].title}</h3><span className="completed-caption"><Icon name="check" size={13} /> Работа и отчёт готовы</span></div><Icon name="arrow-up-right" size={20} />
        </Link>)}</div>
      </section>
      <div className="overview-note"><Icon name="code" size={18} /><p>Один проект, десять лабораторных и понятный путь от HTML до JavaScript.</p><Link href="/report">К отчёту <Icon name="arrow-right" size={15} /></Link></div>
    </div>
  );
}
