import Link from "next/link";
import { Icon } from "@/components/Icon";
import { labs } from "@/data/labs";
import { labStatusLabels } from "@/data/labs/types";
import { labPresentation } from "@/data/lab-presentation";
import { getProjectStages } from "@/data/project-stages";
import styles from "./HomeHero.module.css";

export function HomeHero() {
  const completed = labs.filter((lab) => lab.status === "done").length;
  const nextLab = labs.find((lab) => lab.status !== "done");
  const stages = getProjectStages(labs);
  const allDone = completed === labs.length;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <span className={styles.kicker}><Icon name="sparkles" size={15} />Восьмое чудо света</span>
        <h2 id="hero-title">Чем ближе дедлайн…<span>Тем ближе отчисление</span></h2>
        <p>В связи с тем, что я понятия не имею как задоджить бесконечные эвакуации и сдать хоть что-то, я принял волевое решение создать данный продукт</p>
        <div className={styles.actions}>
          <Link className={`button ${styles.primaryAction}`} href="/project" data-nav-cue="project">Открыть Экспарс <Icon name="arrow-up-right" size={17} /></Link>
          <Link className={styles.pathLink} href="/report#about-project" data-nav-cue="report">Как устроен проект <Icon name="arrow-right" size={16} /></Link>
        </div>
        <div className={styles.postscript}><span aria-hidden="true">*</span>Копирайт фри, можно использовать как учебный проект</div>
      </div>

      <section className={styles.panel} aria-labelledby="semester-progress-title">
        <div className={styles.panelHeading}>
          <h3 id="semester-progress-title">Ровно вооот столько:</h3>
          <span className={styles.status} data-complete={allDone}><span />{allDone ? "Всё собрано" : "В процессе"}</span>
        </div>

        <div className={styles.summary}>
          <div>
            <p className={styles.total} aria-label={`Готово ${completed} из ${labs.length} лабораторных`}>
              {String(completed).padStart(2, "0")}<span>/ {String(labs.length).padStart(2, "0")}</span>
            </p>
            <p className={styles.totalCaption}>лабораторных готово</p>
          </div>
          <div className={styles.stamp} data-complete={allDone} aria-hidden="true">
            <Icon name={allDone ? "check" : "code"} size={31} />
            <span>{allDone ? "ПОБЕДА" : "В РАБОТЕ"}</span>
          </div>
        </div>

        <ol className={styles.labGrid} aria-label="Лабораторные работы">
          {labs.map((lab) => (
            <li key={lab.id}>
              <Link
                className={styles.lab}
                href={`/labs/${lab.id}`}
                data-status={lab.status}
                aria-label={`Лабораторная ${lab.id}: ${labPresentation[lab.id].title}. ${labStatusLabels[lab.status]}`}
                title={`${labPresentation[lab.id].title} · ${labStatusLabels[lab.status]}`}
              >
                <span className={styles.labNumber}>{String(lab.id).padStart(2, "0")}</span>
                <Icon name={lab.status === "done" ? "check" : lab.status === "in-progress" ? "clock" : "arrow-up-right"} size={12} />
                <span className={`${styles.labTopic} technology-label`} data-technology={lab.topic}>{lab.topic === "JavaScript" ? "JS" : lab.topic === "Вёрстка" ? "CSS" : lab.topic}</span>
              </Link>
            </li>
          ))}
        </ol>

        <ul className={styles.stages} aria-label="Готовность по технологиям">
          {stages.map((stage) => (
            <li key={stage.technology} data-complete={stage.done}>
              <span className={styles.stageDot} />
              <span className="technology-label" data-technology={stage.technology}>{stage.technology === "JavaScript" ? "JS" : stage.technology}</span>
              <span className={styles.stageCount}>{stage.completed}/{stage.total}</span>
            </li>
          ))}
        </ul>

        <Link className={styles.nextStep} href={nextLab ? `/labs/${nextLab.id}` : "/report"}>
          <span className={styles.nextIcon}><Icon name={nextLab ? "code" : "file"} size={20} /></span>
          <span className={styles.nextCopy}>
            <small>{nextLab ? "Следующий шаг" : "Финальный штрих"}</small>
            <strong>{nextLab ? `Продолжить лабораторную ${String(nextLab.id).padStart(2, "0")}` : "Проверить итоговый отчёт"}</strong>
          </span>
          <Icon name="arrow-up-right" size={20} />
        </Link>
      </section>
    </section>
  );
}
