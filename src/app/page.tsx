import Link from "next/link";
import { Icon } from "@/components/Icon";
import { labs } from "@/data/labs";
import { subjects, createDemoTasks } from "@/data/planner";
import { labPresentation } from "@/data/lab-presentation";

export default function Home() {
  const completed = labs.filter((lab) => lab.status === "done");
  const nextLab = labs.find((lab) => lab.status !== "done");
  const progress = Math.round(completed.length / labs.length * 100);
  const tasks = createDemoTasks(new Date(2026, 8, 13));

  return (
    <div className="overview page-enter">
      <div className="page-heading">
        <div><p className="eyebrow">Личное учебное пространство</p><h1>Всё идёт по плану<span className="accent-text">.</span></h1></div>
        <span className="semester-label"><span className="status-dot" /> Web-технологии</span>
      </div>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="hero-kicker"><Icon name="sparkles" size={15} /> От идеи до своего продукта</span>
          <h2 id="hero-title">Меньше хаоса.<br /><span>Больше смысла.</span></h2>
          <p>Предметы, задачи и дедлайны — в одном месте. Создаём свой планировщик и изучаем веб на практике.</p>
          <div className="hero-actions">
            <Link className="button" href="/project">Открыть планировщик <Icon name="arrow-up-right" size={17} /></Link>
            <a className="text-link" href="#project-path">Как устроен проект <Icon name="arrow-right" size={16} /></a>
          </div>
        </div>
        <div className="hero-art" aria-label="Учебный пример: предметы и задачи планировщика">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="floating-note"><span className="note-star">✳</span> Шаг за шагом<br /><strong>к большим идеям</strong></div>
          <div className="preview-board">
            <div className="preview-top"><span className="preview-mark"><Icon name="calendar" size={17} /></span><span>Мой планировщик<small>Учебный пример</small></span><span className="preview-dots">•••</span></div>
            <div className="preview-subhead"><span>Немного фокуса на важном</span><span>03</span></div>
            {tasks.slice(0, 3).map((task, index) => (
              <div className={`preview-task ${task.completed ? "is-complete" : ""}`} key={task.id}>
                <span className="preview-check">{task.completed && <Icon name="check" size={12} />}</span>
                <div><span>{task.title}</span><small><i className={`subject-dot subject-${index}`} />{subjects.find((subject) => subject.id === task.subjectId)?.name}</small></div>
              </div>
            ))}
            <div className="preview-bottom"><span>Есть план — есть начало</span><Icon name="arrow-up-right" size={15} /></div>
          </div>
          <div className="floating-progress"><span className="small-check"><Icon name="check" size={15} /></span><span><strong>Основа готова</strong><small>HTML — первый шаг сделан</small></span></div>
        </div>
      </section>
      <dl className="stat-grid">
        <div className="stat-card"><span className="stat-icon"><Icon name="layers" size={21} /></span><div><dt>Лабораторные готовы</dt><dd>{String(completed.length).padStart(2, "0")} <span>/ {labs.length}</span></dd></div><span className="stat-caption">Начало положено</span><div className="mini-progress" role="progressbar" aria-label="Готовность лабораторных" aria-valuenow={completed.length} aria-valuemin={0} aria-valuemax={labs.length}><span style={{ width: `${progress}%` }} /></div></div>
        <div className="stat-card"><span className="stat-icon stat-icon-peach"><Icon name="book" size={21} /></span><div><dt>Учебных предметов</dt><dd>{String(subjects.length).padStart(2, "0")}</dd></div><span className="stat-caption">Разные предметы. Один план.</span></div>
        <div className="stat-card"><span className="stat-icon stat-icon-lilac"><Icon name="calendar" size={21} /></span><div><dt>Задач в примере</dt><dd>{String(tasks.length).padStart(2, "0")}</dd></div><span className="stat-caption">От первой строки до результата</span></div>
      </dl>
      <div className="dashboard-columns">
        <section className="next-section">
          <div className="section-heading"><h2>Продолжим создавать</h2><span className="subtle-label">Следующий шаг</span></div>
          {nextLab && <Link className="next-card" href={`/labs/${nextLab.id}`}>
            <div className="next-card-top"><span className="next-label">Лабораторная {String(nextLab.id).padStart(2, "0")}</span><Icon name="arrow-up-right" size={23} /></div>
            <h3>Основа есть.<br />Добавим характер.</h3>
            <p>{labPresentation[nextLab.id].description}</p>
            <div className="next-card-bottom"><span className="next-chip">{nextLab.topic}</span><span>Посмотреть этап <Icon name="arrow-right" size={16} /></span></div>
            <span className="next-decoration" aria-hidden="true">*</span>
          </Link>}
        </section>
        <section id="project-path" className="path-section">
          <div className="section-heading"><h2>От идеи к результату</h2><span className="subtle-label">3 технологии</span></div>
          <ol className="learning-path">
            <li className="path-done"><span className="path-node"><Icon name="check" size={17} /></span><div><div className="path-title"><h3>Структура</h3><span>HTML</span></div><p>Содержание, форма и первые задачи</p><small>Работы 01–02 <span>· Готово</span></small></div></li>
            <li className="path-current"><span className="path-node">02</span><div><div className="path-title"><h3>Внешний вид</h3><span>CSS</span></div><p>Стили, детали и адаптивная вёрстка</p><small>Работы 03–06 <span>· Впереди</span></small></div></li>
            <li><span className="path-node">03</span><div><div className="path-title"><h3>Взаимодействие</h3><span>JavaScript</span></div><p>Живой список задач и сохранение</p><small>Работы 07–10 <span>· Впереди</span></small></div></li>
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
