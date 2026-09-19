import type { Metadata } from "next";
import Link from "next/link";
import { Demo } from "@/components/Demo";
import { lab02 } from "@/data/labs/lab02";

export const metadata: Metadata = { title: "Планировщик студента" };

export default function ProjectPage() {
  return (
    <>
      <p className="eyebrow">Текущая версия · этап 1 из 4</p>
      <h1>Планировщик студента</h1>
      <p className="lead">Предметы, задачи и сроки сдачи. Начинаем с HTML-структуры
        и формы, затем добавим оформление и работу с задачами.</p>
      <div className="stage-note">
        <strong>Версия после лабораторной № 2</strong>
        <p>Это статический учебный пример без оформления. Форма проверяет обязательные поля
          и открывает локальную страницу результата. Добавление и сохранение задач появятся позже.</p>
        <Link href="/labs/2">Задание, код и результат этого этапа →</Link>
      </div>
      <Demo demo={lab02.demo} />
    </>
  );
}
