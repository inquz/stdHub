import type { Metadata } from "next";
import Link from "next/link";
import { Demo } from "@/components/Demo";
import { Icon } from "@/components/Icon";
import { lab02 } from "@/data/labs/lab02";

export const metadata: Metadata = { title: "Планировщик студента" };

export default function ProjectPage() {
  return (
    <div className="page-enter">
      <div className="page-heading"><div><p className="eyebrow">Из учебной идеи — в полезный инструмент</p><h1>Твой планировщик<span className="accent-text">.</span></h1></div><span className="version-label">Версия 0.1</span></div>
      <p className="lead">Место для предметов, задач и дедлайнов. Здесь можно посмотреть, каким планировщик стал на текущем этапе.</p>
      <ol className="project-stages" aria-label="Этапы планировщика">
        <li className="is-ready"><span><Icon name="check" size={15} /></span><div><strong>HTML-основа</strong><small>Готова · ЛР 1–2</small></div></li>
        <li><span>02</span><div><strong>Оформление</strong><small>Далее · ЛР 3–6</small></div></li>
        <li><span>03</span><div><strong>Взаимодействие</strong><small>ЛР 7–10</small></div></li>
      </ol>
      <section className="project-demo-section" aria-labelledby="current-version">
        <div className="section-heading"><h2 id="current-version">Всё начинается с основы</h2><Link className="text-link" href="/labs/2">Разобрать этот этап <Icon name="arrow-up-right" size={16} /></Link></div>
        <div className="stage-note"><Icon name="code" size={21} /><div><strong>Сейчас — самостоятельный HTML-пример</strong><p>Форма проверяет обязательные поля и открывает страницу результата. Добавление и сохранение задач появятся на этапе JavaScript.</p></div></div>
        <Demo demo={lab02.demo} />
      </section>
      <Link className="project-next" href="/labs/3"><span className="stat-icon"><Icon name="layers" size={22} /></span><div><span className="eyebrow">Дальше — интереснее</span><h3>Добавим цвет, форму и характер</h3><p>Следующий этап: базовое оформление с помощью CSS.</p></div><Icon name="arrow-right" size={22} /></Link>
    </div>
  );
}
