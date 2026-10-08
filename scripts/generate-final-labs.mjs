import { readFile, writeFile, mkdir, cp, access } from "node:fs/promises";

// HTML is reproducible. Existing CSS/JS snapshots are never overwritten.
const base = (await readFile(new URL("../public/labs/08/index.html", import.meta.url), "utf8")).replaceAll("\r\n", "\n");
const selectedLab = process.argv[2];
if (selectedLab && !["9", "10"].includes(selectedLab)) throw new Error("Expected lab number 9 or 10");
for (const lab of [9, 10]) {
  if (selectedLab && Number(selectedLab) !== lab) continue;
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
    .replace(/        <!-- example:menu:start -->[\s\S]*?<!-- example:menu:end -->\n/, '')
    .replace(/<nav class="workspace-nav"[^>]*>[^\n]*<\/nav>/, `<!-- example:menu:start -->
    <nav class="workspace-nav" aria-label="Навигация по Экспарсу">
      <a href="#upload-title">Загрузить Excel</a>
      <a href="#schedule">Расписание</a>
    </nav>
<!-- example:menu:end -->`)
    .replace('Пример расписания</p>', 'Твоё расписание</p>')
    .replace('Начать заново</button>', 'Восстановить пример</button>')
    .replace('PNG появится в ЛР 10.', lab === 9 ? 'Нужную пару уже можно найти поиском. До PNG осталась одна лаба.' : 'Выбери неделю и забирай PNG в чат.')
    .replace(/<div class="view-tools">[\s\S]*?<\/div>/, `<div class="view-tools">
          <label class="chat-view-switch"><input id="compact-view" class="visually-hidden" type="checkbox" role="switch" form="schedule-form" aria-describedby="compact-note"><span class="switch-track" aria-hidden="true"></span><span>Вид для чата</span></label>
          <label id="teachers-option" class="compact-toggle" hidden><input id="show-teachers" type="checkbox" form="schedule-form"> Показывать преподавателей</label>
          <p id="compact-note" class="view-note" hidden>Пн–Вт–Ср сверху, Чт–Пт–звонки снизу${lab === 10 ? ' — на экране и в PNG' : ''}. На телефоне листай вбок: пятницу никто не потерял.</p>
        </div>`)
    .replace(/<!-- example:cards:start -->[\s\S]*?<!-- example:cards:end -->/, `<!-- example:workspace:start -->
        <div class="schedule-filters" role="search" aria-label="Найти занятие">
          <div><label for="lesson-search">Поиск по расписанию</label><input id="lesson-search" type="search" maxlength="100" placeholder="Предмет, препод или аудитория"></div>
          <div><label for="day-filter">День недели</label><select id="day-filter"><option value="all">Все дни</option></select></div>
          <button id="clear-filters" type="button" class="filter-reset">Сбросить поиск</button>
        </div>
        <p id="filter-summary" class="preview-caption" role="status" aria-live="polite"></p>
        <div id="empty-state" class="empty-state" hidden><strong>Ничего не найдено</strong><p>Пара играет в прятки. Попробуй другую неделю, день или запрос покороче</p></div>
        <div class="schedule-days"></div>
<!-- example:workspace:end -->`)
    .replace(/<noscript>[\s\S]*?<\/noscript>/, '<noscript><p>Включи JavaScript для импорта и просмотра расписания. Без него Экспарс сегодня на дистанционке — и без связи.</p></noscript>')
    .replace(/<div class="study-content"><p>[\s\S]*?<\/p><\/div>/, `<div class="study-content"><p>${lab === 9 ? 'createElement, textContent и DocumentFragment собирают карточки из объектов. Поиск, день и неделя работают вместе, replaceChildren убирает старую выдачу. Можно переключать сколько угодно: пары от этого не размножатся.' : 'submit, input, change и делегированный click отвечают за действия. localStorage помнит расписание и настройки, Canvas рисует PNG всей выбранной недели. Преподаватели и подгруппы на месте. Автосейв есть, автопосещения пока нет.'}</p></div>`);
  if (lab === 10) {
    html = html.replace(/<p id="stage-note"[^>]*>[\s\S]*?<\/p>/, '<p id="stage-note" class="stage-note">Excel до 5 МБ, структура как в КИ-23, КИ-24 и КИ-25. Выбери неделю и забирай PNG. Чат группы ждёт своего героя.</p>')
      .replace('<p class="privacy-note">', '<p id="storage-status" class="stage-note" role="status"></p>\n        <p class="privacy-note">')
      .replace('На диск не сохраняется.', 'Исходный файл на диск не сохраняется.<br>Расписание и настройки остаются в этом браузере.')
      .replace('<p id="table-note"', `<div class="export-tools"><button id="export-png" class="button button-primary" type="button" aria-describedby="export-note">Скачать PNG</button><p id="export-note">В PNG попадёт вся выбранная неделя. Поиск, день и свёрнутые карточки её не обрежут — тайно убрать понедельник не получится.</p><p id="export-status" role="status" aria-live="polite"></p></div>\n        <p id="table-note"`);
  }
  await writeFile(new URL("index.html", dir), html, "utf8");
}
console.log(`Generated lab ${selectedLab ?? "9 and 10"} HTML; existing JS and CSS preserved.`);
