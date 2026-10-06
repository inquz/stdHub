import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import styles from "./HomeOverview.module.css";

const features: { lab: number; title: string; description: string; technology: string; icon: IconName }[] = [
  { lab: 6, title: "Собрать адаптивный интерфейс", description: "Поток, таблица и Grid — три способа сверстать одно расписание", technology: "CSS / Grid", icon: "grid" },
  { lab: 8, title: "Прочитать Excel", description: "Отправка файла парсеру, выбор листа и обработка ошибок импорта", technology: "JavaScript / Fetch", icon: "file" },
  { lab: 9, title: "Оживить расписание", description: "Карточки из данных, поиск по преподавателю и фильтры дня и недели", technology: "JavaScript / DOM", icon: "calendar" },
  { lab: 10, title: "Сохранить и поделиться", description: "События, восстановление настроек и экспорт всей недели в PNG", technology: "Storage / Canvas", icon: "download" },
];

export function HomeOverview() {
  return (
    <div className={styles.overview}>
      <section id="project-path" className={styles.project} aria-labelledby="project-flow-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Что получилось</p>
            <h2 id="project-flow-title">Из Excel — в png-шку</h2>
          </div>
          <p className={styles.intro}>Экспарс превращает таблицу с парами в понятный план недели, которым можно поделиться с группой</p>
        </div>

        <ol className={styles.workflow}>
          <li className={styles.step}>
            <div className={`${styles.scene} ${styles.importScene}`} aria-hidden="true">
              <div className={styles.sheet}>
                <div className={styles.sheetTop}><Icon name="grid" size={16} /><span>расписание.xls</span></div>
                <div className={styles.sheetGrid}>{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div>
              </div>
              <span className={styles.format}>.xls / .xlsx</span>
            </div>
            <div className={styles.stepHeading}><span>01</span><h3>Загрузи таблицу</h3></div>
            <p>Добавь файл расписания и выбери нужный лист. Предметы, аудитории и преподаватели соберутся вместе</p>
          </li>
          <li className={styles.step}>
            <div className={`${styles.scene} ${styles.scheduleScene}`} aria-hidden="true">
              <div className={styles.schedule}>
                <div className={styles.scheduleTop}><span>Понедельник</span><span>Нижняя неделя</span></div>
                <div className={styles.lesson}><span>02</span><div><strong>Веб-технологии</strong><small>Лекция · 4.014</small></div></div>
                <div className={styles.lesson}><span>03</span><div><strong>Операционные системы</strong><small>Лекция · 2.234</small></div></div>
              </div>
            </div>
            <div className={styles.stepHeading}><span>02</span><h3>Оставь нужное</h3></div>
            <p>Переключай недели и дни. Найди пару по предмету, преподавателю или аудитории</p>
          </li>
          <li className={styles.step}>
            <div className={`${styles.scene} ${styles.exportScene}`} aria-hidden="true">
              <div className={styles.exportPage}>
                <div className={styles.exportTop}><span>Моя неделя</span><Icon name="calendar" size={13} /></div>
                <div className={styles.exportDays}>{["ПН", "ВТ", "СР", "ЧТ", "ПТ"].map((day) => <div key={day}><span>{day}</span><i /><i /><i /></div>)}</div>
                <span className={styles.exportCaption}>Вся неделя · PNG</span>
              </div>
              <span className={styles.exportBadge}><Icon name="download" size={13} />PNG</span>
            </div>
            <div className={styles.stepHeading}><span>03</span><h3>Отправь в чат группы</h3></div>
            <p>Скачай картинку всей выбранной недели. Расписание и настройки сохранятся для следующего раза</p>
          </li>
        </ol>
        <div className={styles.tryProject}>
          <span><Icon name="sparkles" size={16} />Присутствует учебный пример для моделирования*</span>
          <Link href="/project#current-version">Попробовать <Icon name="arrow-up-right" size={17} /></Link>
        </div>
      </section>

      <section className={styles.guide} aria-labelledby="project-guide-title">
        <div className={styles.guideIntro}>
          <p className={styles.eyebrow}>Внутри проекта</p>
          <h2 id="project-guide-title">Научись так же</h2>
          <p>Каждая возможность выросла из лабораторной. Здесь короткий путь к её реализации</p>
          <Link className={styles.catalogLink} href="/labs" data-nav-cue="labs">Все лабораторные <Icon name="arrow-right" size={16} /></Link>
        </div>
        <ul className={styles.features}>
          {features.map((feature) => (
            <li key={feature.lab}>
              <Link className={styles.feature} href={`/labs/${feature.lab}#lab-${feature.lab}-code`} data-nav-cue="labs">
                <span className={styles.featureIcon}><Icon name={feature.icon} size={21} /></span>
                <div className={styles.featureCopy}>
                  <span className={styles.featureMeta}>ЛР {String(feature.lab).padStart(2, "0")}<span aria-hidden="true">/</span><span className="technology-label" data-technology={feature.technology.split(" / ")[0]}>{feature.technology}</span></span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <span className={styles.featureArrow}><Icon name="arrow-up-right" size={19} /><span className="sr-only">Открыть исходный код</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.start}>
        <span><Icon name="code" size={18} />Хочешь пройти весь путь с нуля?</span>
        <Link href="/labs/1" data-nav-cue="labs">Начать с первой страницы <Icon name="arrow-right" size={16} /></Link>
      </div>
    </div>
  );
}
