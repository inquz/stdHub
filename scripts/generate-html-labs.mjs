import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { schedule } from "./data/schedule-example.mjs";
import { bellMarkup } from "./data/bell-schedule.mjs";

const selectedLab = process.argv[2];
if (selectedLab && !["1", "2"].includes(selectedLab)) throw new Error("Expected lab number 1 or 2");

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
    <h1>Экспарс</h1>
    <p><strong>Расписание прислали — разбираться опять нам</strong></p>
    <p>Закинь Excel — получи картинку, которую можно прочитать без высшего образования</p>
  </header>
  <nav aria-label="Разделы Экспарса">
    <ul>
      ${lab === 2 ? '<li><a href="#upload">Загрузить Excel</a></li>' : '<li><a href="#about">О сервисе</a></li>'}
      <li><a href="#schedule">Расписание</a></li>
      <li><a href="#bell-schedule">Звонки</a></li>
    </ul>
  </nav>
<!-- example:document:end -->
  <main>
    <section id="about" aria-labelledby="about-title">
      <h2 id="about-title">Из Excel — в чат группы</h2>
      <p>В чат опять прилетел Excel, и теперь вторую пару надо найти среди объединённых ячеек.
        План Экспарса простой: выбираешь верхнюю, нижнюю или обе недели и забираешь картинку для группы.</p>
      <p><small>ЛР ${lab} · пока знакомимся с HTML и смотрим пример.
        Читать Excel и делать PNG научимся дальше. Легендой группы становимся постепенно.</small></p>
    </section>
<!-- example:steps:start -->
    <section id="how-it-works" aria-labelledby="steps-title">
      <h2 id="steps-title">Три шага до картинки</h2>
      <ol>
        <li>Загрузить Excel с расписанием — тот самый, из чата</li>
        <li>Выбрать верхнюю, нижнюю или обе недели и перестать их путать</li>
        <li>Скачать всю неделю картинкой и отправить группе. Минутка славы обеспечена</li>
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
        Обе недели; общие занятия показаны один раз. Лишних пар не подкидываем.</p>
      <ul>
${schedule[0].pairs.map((pair) => `        <li><strong>${pair.number}-я пара</strong>
          <ul>
${pair.both ? `            <li>Обе недели: ${escape(pair.both)}</li>` : `            <li>Верхняя неделя: ${escape(pair.upper)}</li>
            <li>Нижняя неделя: ${escape(pair.lower)}</li>`}
          </ul>
        </li>`).join("\n")}
      </ul>
      <p>Первая пара свободна — будильник одобряет</p>
    </section>
    ${bellMarkup()}${end}`;

const tableDays = schedule.map(({ day, pairs }) => `        <tbody>
${pairs.map((pair, index) => `          <tr>
${index === 0 ? `            <th scope="rowgroup" rowspan="${pairs.length}">${escape(day)}</th>\n` : ''}            <th scope="row">${pair.number}</th>
${pair.both ? `            <td colspan="2">${escape(pair.both.startsWith("Окно.") ? "Окно" : pair.both)}</td>` : `            <td>${escape(pair.upper ?? "Окно")}</td>
            <td>${escape(pair.lower ?? "Окно")}</td>`}
          </tr>`).join("\n")}
        </tbody>`).join("\n");

const lab02 = `${documentStart(2)}
    <section id="upload" aria-labelledby="form-title">
      <h2 id="form-title">Загрузить Excel</h2>
      <p id="form-note"><small>Выбери файл и неделю — браузер проверит заполнение формы.
        Сам Excel пока не читаем: это следующий уровень. На экране учебный пример.</small></p>
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
          <button type="submit">Проверить форму</button>
          <button type="reset">Начать заново</button>
        </p>
      </form>
<!-- example:form:end -->
    </section>
    <section id="schedule" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Пример расписания</h2>
      <p id="table-note"><small>КИ-24.xls · обе недели. Выбор в форме пока не меняет таблицу.
        Общие занятия показаны один раз, свободная половина подписана «Окно». Можно выдохнуть.</small></p>
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
    ${bellMarkup()}
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
    <h1>Форма проверена. Первый квест закрыт</h1>
    <p>Браузер убедился, что файл выбран, и передал его имя вместе с вариантом недели. С этой частью разобрались.</p>
    <p><strong>Excel ещё не обработан, PNG не создан.</strong> Сейчас учим страницу HTML:
      чтение файла, переключение недель и скачивание появятся в JS-лабах. До финального босса ещё дойдём.</p>
    <p>Содержимое файла никуда не отправлялось, пример расписания остался прежним. Можно вернуться и потыкать ещё.</p>
    <p><a href="index.html#upload">Вернуться к форме</a></p>
    <p><a href="index.html#schedule">Посмотреть пример расписания</a></p>
  </main>
</body>
</html>
`;

for (const [file, content] of Object.entries({
  "01/index.html": lab01, "02/index.html": lab02, "02/form-result.html": result,
})) {
  if (selectedLab && Number(file.slice(0, 2)) !== Number(selectedLab)) continue;
  const target = new URL(`../public/labs/${file}`, import.meta.url);
  await mkdir(fileURLToPath(new URL(".", target)), { recursive: true });
  await writeFile(target, content, "utf8");
  console.log(`Записан public/labs/${file} (Экспарс)`);
}
