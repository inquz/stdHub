import { readFile, writeFile, mkdir, cp, access } from "node:fs/promises";

// HTML is reproducible. Existing CSS/JS snapshots are never overwritten.
const base = (await readFile(new URL("../public/labs/08/index.html", import.meta.url), "utf8")).replaceAll("\r\n", "\n");
for (const lab of [9, 10]) {
  const number = String(lab).padStart(2, "0");
  const dir = new URL(`../public/labs/${number}/`, import.meta.url);
  await mkdir(new URL("js/", dir), { recursive: true });
  for (const file of ["css", "styles.css", "js/api.js", "js/demo.js", "js/schedule.js"]) {
    try { await access(new URL(file, dir)); }
    catch { await cp(new URL(`../public/labs/08/${file}`, import.meta.url), new URL(file, dir), { recursive: true }); }
  }
  let html = base.replaceAll("ЛР 08", `ЛР ${number}`).replaceAll("ЛР 8", `ЛР ${lab}`)
    .replace('action="form-result.html" method="get"', 'action="#schedule" method="get"')
    .replace('</head>', '  <link rel="stylesheet" href="workspace.css">\n</head>')
    .replace('class="dropdown-list">\n          <li><a href="#weekday-0"', 'class="dropdown-list" id="day-links">\n          <li><a href="#weekday-0"')
    .replace('Пример расписания</p>', 'Твоё расписание</p>')
    .replace('Начать заново</button>', 'Восстановить пример</button>')
    .replace('PNG появится в следующих лабах.', lab === 9 ? 'Поиск и выбор дня обновляют карточки. PNG — в ЛР 10.' : 'Выбери неделю и скачай PNG всего расписания.')
    .replace(/<!-- example:cards:start -->[\s\S]*?<!-- example:cards:end -->/, `<!-- example:workspace:start -->
        <div class="schedule-filters" role="search" aria-label="Найти занятие">
          <div><label for="lesson-search">Поиск по расписанию</label><input id="lesson-search" type="search" maxlength="100" placeholder="Предмет, преподаватель, аудитория"></div>
          <div><label for="day-filter">День недели</label><select id="day-filter"><option value="all">Все дни</option></select></div>
          <button id="clear-filters" type="button" class="filter-reset">Сбросить поиск</button>
        </div>
        <p id="filter-summary" class="preview-caption" role="status" aria-live="polite"></p>
        <div id="empty-state" class="empty-state" hidden><strong>Ничего не найдено</strong><p>Попробуй другую неделю, день или поисковый запрос</p></div>
        <div class="schedule-days"></div>
<!-- example:workspace:end -->`)
    .replace(/<noscript>[\s\S]*?<\/noscript>/, '<noscript><p>Включи JavaScript для импорта и просмотра расписания</p></noscript>')
    .replace(/<div class="study-content"><p>[\s\S]*?<\/p><\/div>/, `<div class="study-content"><p>${lab === 9 ? 'Карточки строятся из объектов через createElement, textContent и DocumentFragment. Поиск, день и неделя применяются вместе; replaceChildren заменяет результат без дубликатов.' : 'submit, input, change и делегированный click управляют интерфейсом. Расписание и настройки восстанавливаются из localStorage. Canvas формирует PNG всей выбранной недели, включая преподавателей и подгруппы.'}</p></div>`);
  if (lab === 10) {
    html = html.replace(/<nav class="dropdown-nav"[\s\S]*?<\/nav>/, `<nav class="workspace-nav" aria-label="Навигация по Экспарсу">
      <a href="#upload-title">Загрузить Excel</a>
      <a href="#schedule">Расписание</a>
    </nav>`)
      .replace(/    <span class="version-chip">[\s\S]*?<\/span> JavaScript<\/span>\r?\n/, '')
      .replace('<p class="privacy-note">', '<p id="storage-status" class="stage-note" role="status"></p>\n        <p class="privacy-note">')
      .replace('На диск не сохраняется.', 'Исходный файл на диск не сохраняется.<br>Расписание и настройки остаются в этом браузере.')
      .replace('<p id="table-note"', `<div class="export-tools"><button id="export-png" class="button button-primary" type="button" aria-describedby="export-note">Скачать PNG</button><p id="export-note">В картинку попадёт вся выбранная неделя. Поиск, выбор дня и свёрнутые карточки на PNG не влияют.</p><p id="export-status" role="status" aria-live="polite"></p></div>\n        <p id="table-note"`);
  }
  await writeFile(new URL("index.html", dir), html, "utf8");
}
console.log("Generated labs 9 and 10 HTML; existing JS and CSS preserved.");
