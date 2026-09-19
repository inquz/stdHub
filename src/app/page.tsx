import Link from "next/link";
import { labs } from "@/data/labs";
import { report } from "@/data/report";

export default function Home() {
  const completed = labs.filter((lab) => lab.status === "done").length;
  return (
    <>
      <p className="eyebrow">Web-технологии · учебный проект</p>
      <h1>Учебные задачи.<br />Всё по порядку.</h1>
      <p className="lead">
        «Планировщик студента» объединяет предметы, задания и сроки сдачи.
        Мы разрабатываем его в десяти лабораторных: от первой HTML-страницы
        до списка задач с поиском и сохранением.
      </p>
      <div className="actions">
        <Link className="button" href="/project">Открыть планировщик</Link>
        <Link className="button secondary" href="/labs">Лабораторные работы</Link>
        <Link className="button secondary" href="/report">Единый отчёт</Link>
      </div>
      <dl className="project-facts">
        <div><dt>Учебных предметов</dt><dd>4</dd></div>
        <div><dt>Задач в примере</dt><dd>10</dd></div>
        <div><dt>Работ готово</dt><dd>{completed} / {labs.length}</dd></div>
      </dl>
      <section className="panel">
        <h2>Один продукт — десять этапов</h2>
        <ol className="steps">
          <li><strong>HTML · работы 1–2.</strong> Структура, предметы, таблица сроков и форма.</li>
          <li><strong>CSS · работы 3–6.</strong> Оформление, состояния, меню и адаптивная вёрстка.</li>
          <li><strong>JavaScript · работы 7–10.</strong> Даты, задачи, поиск, события и сохранение.</li>
        </ol>
      </section>
      <section className="panel">
        <h2>Сейчас готова основа на HTML</h2>
        <p>Доступны две самостоятельные демонстрации и их главы отчёта.
          Форма проверяет поля, но пока не сохраняет задачи. Оформление и действия
          будут добавлены в следующих лабораторных.</p>
        <p><Link href="/labs/2">Посмотреть последнюю выполненную работу →</Link></p>
      </section>
      <section className="panel">
        <h2>О проекте</h2>
        <p>Автор: {report.author} · Группа: {report.group}.</p>
        <p>Оболочка: Next.js, React, TypeScript и Tailwind CSS.
          Учебные примеры: самостоятельные HTML-страницы, затем CSS и JavaScript.</p>
      </section>
    </>
  );
}
