import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createDemoTasks, subjects } from "../src/data/planner.ts";

// Explicit date keeps earlier lab snapshots reproducible and unchanged by builds.
const snapshot = process.argv[2];
if (!snapshot || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot)) {
  throw new Error("Укажите дату снимка: npm run labs:generate -- 2026-09-13");
}
const [year, month, day] = snapshot.split("-").map(Number);
const today = new Date(year, month - 1, day, 12);
if (today.getFullYear() !== year || today.getMonth() !== month - 1 || today.getDate() !== day) {
  throw new Error("Несуществующая календарная дата");
}
const tasks = createDemoTasks(today);
const escape = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);
const dateLabel = (date) => date.split("-").reverse().join(".");
const subjectName = (id) => subjects.find((subject) => subject.id === id).name;
const status = (task) => task.completed ? "Выполнена" : task.dueDate < snapshot ? "Просрочена" : "В работе";
const time = (date) => `<time datetime="${date}">${dateLabel(date)}</time>`;
const subjectsHtml = `<!-- example:subjects:start -->
    <section id="subjects" aria-labelledby="subjects-title">
      <h2 id="subjects-title">Предметы</h2>
      <ul>
${subjects.map((subject) => `        <li>${escape(subject.name)}</li>`).join("\n")}
      </ul>
    </section>
<!-- example:subjects:end -->`;

function documentStart(lab, extraLink = "") {
  return `<!-- example:document:start -->
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Планировщик студента — ЛР ${lab}</title>
</head>
<body id="top">
  <header>
    <p>Учебный проект · лабораторная работа ${lab}</p>
    <h1>Планировщик студента</h1>
    <p>Предметы, задачи и сроки сдачи в одном месте.</p>
  </header>
  <nav aria-label="Разделы планировщика">
    <ul>
      <li><a href="#about">О планировщике</a></li>
      <li><a href="#subjects">Предметы</a></li>
      <li><a href="#tasks">Учебные задачи</a></li>${extraLink}
    </ul>
  </nav>
<!-- example:document:end -->
  <main>
    <section id="about" aria-labelledby="about-title">
      <h2 id="about-title">О планировщике</h2>
      <p>Планировщик помогает собрать учебные задания и увидеть сроки сдачи.
        На этом этапе показан статический пример; изменение задач появится позже.</p>
      <p>Снимок учебных данных на ${time(snapshot)}.
        Все предметы и задачи в примере вымышлены.</p>
    </section>
${subjectsHtml}`;
}

const end = `
  </main>
  <footer>
    <p>Учебный проект по дисциплине «Web-технологии».</p>
    <a href="#top">К началу страницы</a>
  </footer>
</body>
</html>
`;

const lab01 = `${documentStart(1)}
    <section id="tasks" aria-labelledby="tasks-title">
      <h2 id="tasks-title">Учебные задачи</h2>
      <ol>
${tasks.map((task) => `        <li>
          <strong>${escape(task.title)}</strong> — ${escape(subjectName(task.subjectId))}.
          Срок: ${time(task.dueDate)}. ${status(task)}.
        </li>`).join("\n")}
      </ol>
    </section>${end}`;

const tableRow = (task) => `          <tr>
            <th scope="row">${escape(task.title)}<br><small>${escape(subjectName(task.subjectId))}</small></th>
            <td>${time(task.dueDate)}</td>
            <td>${status(task)}</td>
          </tr>`;

const lab02 = `${documentStart(2, '\n      <li><a href="#new-task">Форма задачи</a></li>')}
    <section id="tasks" aria-labelledby="tasks-title">
      <h2 id="tasks-title">Учебные задачи</h2>
<!-- example:table:start -->
      <table>
        <caption>Задачи и сроки на ${dateLabel(snapshot)}</caption>
        <thead>
          <tr>
            <th scope="col">Задача и предмет</th>
            <th scope="col">Срок</th>
            <th scope="col">Состояние</th>
          </tr>
        </thead>
        <tbody>
${tableRow(tasks[0])}
<!-- example:table:end -->
${tasks.slice(1).map(tableRow).join("\n")}
        </tbody>
      </table>
    </section>
    <section id="new-task" aria-labelledby="form-title">
      <h2 id="form-title">Форма учебной задачи</h2>
      <p id="form-note">Это учебная форма. Браузер проверит обязательные поля
        и откроет страницу результата. Задача не будет сохранена.</p>
<!-- example:form:start -->
      <form class="task-form" action="form-result.html" method="get" aria-describedby="form-note">
        <fieldset>
          <legend>Новая задача</legend>
          <p>
            <label for="task-title">Название (обязательно)</label><br>
            <input id="task-title" name="title" type="text" size="20"
              required maxlength="100" aria-describedby="title-hint">
            <br><small id="title-hint">Не более 100 символов.</small>
          </p>
          <p>
            <label for="task-subject">Предмет (обязательно)</label><br>
            <select id="task-subject" name="subjectId" required>
              <option value="">Выберите предмет</option>
${subjects.map((subject) => `              <option value="${subject.id}">${escape(subject.name)}</option>`).join("\n")}
            </select>
          </p>
          <p>
            <label for="task-date">Срок сдачи (обязательно)</label><br>
            <input id="task-date" name="dueDate" type="date" required>
          </p>
          <button type="submit">Проверить форму</button>
          <button type="reset">Очистить</button>
        </fieldset>
      </form>
<!-- example:form:end -->
    </section>
    <section aria-labelledby="week-title">
      <h2 id="week-title">Как распределить учебную неделю</h2>
<!-- example:image:start -->
      <figure>
        <img src="../../images/study-week.svg" width="220" height="132"
          alt="Учебная неделя: понедельник — HTML, вторник — математика, среда — английский, четверг — алгоритмы, пятница — отчёт.">
        <figcaption>Пример распределения занятий по пяти дням недели.</figcaption>
      </figure>
<!-- example:image:end -->
    </section>${end}`;

const result = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Результат учебной формы — ЛР 2</title>
</head>
<body>
  <main>
    <h1>Результат учебной формы</h1>
    <p>Эта страница открывается после отправки формы с заполненными обязательными полями.</p>
    <p><strong>Задача не сохранена.</strong> Добавление задач появится в лабораторных по JavaScript.</p>
    <p><a href="index.html#new-task">Вернуться к форме</a></p>
    <p><a href="index.html#tasks">Посмотреть учебные задачи</a></p>
  </main>
</body>
</html>
`;

for (const [file, content] of Object.entries({
  "01/index.html": lab01, "02/index.html": lab02, "02/form-result.html": result,
})) {
  const target = new URL(`../public/labs/${file}`, import.meta.url);
  await mkdir(fileURLToPath(new URL(".", target)), { recursive: true });
  await writeFile(target, content, "utf8");
  console.log(`Записан public/labs/${file} (снимок ${snapshot})`);
}
