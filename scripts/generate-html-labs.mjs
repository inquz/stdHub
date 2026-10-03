import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { schedule } from "./data/schedule-example.mjs";

const escape = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

function documentStart(lab) {
  return `<!-- example:document:start -->
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Экспарс — ЛР ${lab}</title>
</head>
<body id="top">
  <header>
    <p>Учебный проект · лабораторная работа ${lab}</p>
    <h1>Экспарс</h1>
    <p><strong>Расписание прислали — разбираться опять нам</strong></p>
    <p>Закинь Excel — получи картинку, которую можно прочитать без высшего образования</p>
  </header>
  <nav aria-label="Разделы Экспарса">
    <ul>
      <li><a href="#about">Что это за зверь</a></li>
      <li><a href="#how-it-works">Три шага до картинки</a></li>
      <li><a href="#schedule">Пример расписания</a></li>${lab === 2 ? '\n      <li><a href="#upload">Загрузить Excel</a></li>' : ''}
    </ul>
  </nav>
<!-- example:document:end -->
  <main>
    <section id="about" aria-labelledby="about-title">
      <h2 id="about-title">Что это за зверь</h2>
      <p>Экспарс превращает расписание из Excel в картинку для чата группы.
        Выбираешь верхнюю, нижнюю или обе недели — и больше не объясняешь, где смотреть пары.</p>
      <p>Здесь показана HTML-заготовка: пример расписания уже есть,
        чтение файла и создание PNG появятся в лабораторных по JavaScript.</p>
    </section>
<!-- example:steps:start -->
    <section id="how-it-works" aria-labelledby="steps-title">
      <h2 id="steps-title">Три шага до картинки</h2>
      <ol>
        <li>Загрузить Excel с расписанием</li>
        <li>Выбрать верхнюю, нижнюю или обе недели</li>
        <li>Скачать картинку со всей неделей и отправить её в чат группы</li>
      </ol>
      <p>Варианты недели:</p>
      <ul>
        <li><strong>Верхняя</strong> — занятия из верхних блоков и общие пары</li>
        <li><strong>Нижняя</strong> — занятия из нижних блоков и общие пары</li>
        <li><strong>Обе</strong> — различия видны рядом, общие занятия показаны один раз</li>
      </ul>
    </section>
<!-- example:steps:end -->`;
}

const end = `
  </main>
  <footer>
    <p>Экспарс · расписание понятнее, пар меньше не стало</p>
    <a href="#top">К началу страницы</a>
  </footer>
</body>
</html>
`;

const lab01 = `${documentStart(1)}
    <section id="schedule" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Пример: понедельник КИ-24</h2>
      <p>Фрагмент расписания на осенний семестр 2026–2027 из файла КИ-24.xls.
        В исходнике указаны номера пар, а не время звонков.</p>
      <ul>
${schedule[0].pairs.map((pair) => `        <li><strong>${pair.number}-я пара</strong>
          <ul>
${pair.both ? `            <li>Обе недели: ${escape(pair.both)}</li>` : `            <li>Верхняя неделя: ${escape(pair.upper)}</li>
            <li>Нижняя неделя: ${escape(pair.lower)}</li>`}
          </ul>
        </li>`).join("\n")}
      </ul>
      <p>Первая пара свободна — будильник одобряет</p>
    </section>${end}`;

const tableDays = schedule.map(({ day, pairs }) => `        <tbody>
${pairs.map((pair, index) => `          <tr>
${index === 0 ? `            <th scope="rowgroup" rowspan="${pairs.length}">${escape(day)}</th>\n` : ''}            <th scope="row">${pair.number}</th>
${pair.both ? `            <td colspan="2">${escape(pair.both)}</td>` : `            <td>${escape(pair.upper ?? "Пары нет")}</td>
            <td>${escape(pair.lower ?? "Пары нет")}</td>`}
          </tr>`).join("\n")}
        </tbody>`).join("\n");

const lab02 = `${documentStart(2)}
    <section id="upload" aria-labelledby="form-title">
      <h2 id="form-title">Загрузить Excel</h2>
      <p id="form-note">Это макет на HTML. Кнопка «Скачать картинку» пока открывает
        пояснение: файл не читается и PNG не создаётся. При отправке передаются
        только имя файла и выбранный вариант недели, содержимое Excel не загружается.</p>
<!-- example:form:start -->
      <form action="form-result.html" method="get" aria-describedby="form-note">
        <p>
          <label for="schedule-file">Файл расписания (обязательно)</label><br>
          <input id="schedule-file" name="schedule" type="file" accept=".xls,.xlsx"
            required aria-describedby="file-hint">
          <br><small id="file-hint">Excel: .xls или .xlsx · Образец — расписание КИ-24</small>
        </p>
        <fieldset>
          <legend>Какая неделя?</legend>
          <p><input id="week-upper" type="radio" name="week" value="upper" required>
            <label for="week-upper">Верхняя</label></p>
          <p><input id="week-lower" type="radio" name="week" value="lower" required>
            <label for="week-lower">Нижняя</label></p>
          <p><input id="week-both" type="radio" name="week" value="both" required checked>
            <label for="week-both">Обе</label></p>
        </fieldset>
        <p>
          <button type="submit">Скачать картинку</button>
          <button type="reset">Начать заново</button>
        </p>
      </form>
<!-- example:form:end -->
    </section>
    <section id="schedule" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Пример расписания</h2>
      <p id="table-note">Статический пример из КИ-24.xls, обе недели. Выбор в форме пока
        не меняет таблицу. Общие занятия занимают две колонки; пустая половина означает,
        что на этой неделе пары нет. Свободные пары в начале и конце дня опущены,
        окно между занятиями сохранено. Времени звонков в исходном файле нет.</p>
<!-- example:table:start -->
      <table aria-describedby="table-note">
        <caption>КИ-24 · осенний семестр 2026–2027 · верхняя и нижняя недели</caption>
        <thead>
          <tr>
            <th scope="col">День</th>
            <th scope="col">Пара</th>
            <th scope="col">Верхняя неделя</th>
            <th scope="col">Нижняя неделя</th>
          </tr>
        </thead>
${tableDays}
      </table>
<!-- example:table:end -->
    </section>
    <section aria-labelledby="image-title">
      <h2 id="image-title">Из Excel — в чат группы</h2>
<!-- example:image:start -->
      <figure>
        <img src="../../images/paroscope-flow.svg" width="280" height="180"
          alt="Три шага: загрузить Excel, выбрать верхнюю, нижнюю или обе недели, скачать PNG для чата группы.">
        <figcaption>Будущий сценарий Экспарса; пересылка в Telegram — уже на твоей совести</figcaption>
      </figure>
<!-- example:image:end -->
    </section>${end}`;

const result = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Экспарс — результат учебной формы</title>
</head>
<body>
  <main>
    <h1>Картинка пока на паре</h1>
    <p>Браузер проверил, что файл выбран, и отправил имя файла и вариант недели.</p>
    <p><strong>Excel не обработан, PNG не создан.</strong> Это HTML-этап проекта:
      чтение расписания, переключение недель и скачивание появятся в лабораторных по JavaScript.</p>
    <p>Содержимое файла не отправлялось. Расписание в примере осталось прежним.</p>
    <p><a href="index.html#upload">Вернуться к форме</a></p>
    <p><a href="index.html#schedule">Посмотреть пример расписания</a></p>
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
  console.log(`Записан public/labs/${file} (Экспарс)`);
}
