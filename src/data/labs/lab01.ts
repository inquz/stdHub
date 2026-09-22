import type { Lab } from "./types";

export const lab01: Lab = {
  id: 1,
  title: "Введение в HTML (XHTML). Структура HTML-документа. Элементы разметки",
  topic: "HTML",
  status: "done",
  contribution: "Первая страница StudHub: четыре предмета, десять задач и переходы между разделами. Пока только HTML.",
  task: "Собрать страницу «Планировщик студента» без CSS и JavaScript. Добавить описание, навигацию, списки предметов и задач, подвал со ссылкой наверх.",
  steps: [
    "В public/labs/01/index.html задан каркас документа: DOCTYPE, язык ru, кодировка UTF-8, название вкладки и viewport.",
    "Внутри body размещены header, nav, main и footer. В main — три раздела: о планировщике, предметы и задачи.",
    "Предметы записаны в ul, задачи — в ol. У каждой задачи есть предмет, срок и состояние. Данные демонстрационные, на 13 сентября 2026 года.",
    "Разделам присвоены id. Ссылки в меню ведут к ним, а ссылка в подвале — к началу страницы.",
  ],
  sourceExamples: [
    { file: "lab01", section: "document", title: "Каркас страницы и навигация" },
    { file: "lab01", section: "subjects", title: "Список предметов" },
  ],
  demo: { src: "/labs/01/index.html", title: "ЛР 1 · страница без стилей" },
  result: "Страница открывается отдельным HTML-файлом. Ссылки переводят к разделам, предметы и задачи отображаются списками. Внешний вид задаёт браузер; редактирования задач пока нет.",
  checks: [
    "Пункты меню открывают нужные разделы, ссылка в подвале возвращает наверх.",
    "На странице четыре предмета и десять задач со сроками.",
    "Один заголовок h1 и один main; у каждого раздела свой h2.",
  ],
  sources: [
    { title: "MDN · Структура документа", href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents" },
    { title: "WHATWG · Синтаксис XHTML", href: "https://html.spec.whatwg.org/multipage/xhtml.html" },
  ],
};