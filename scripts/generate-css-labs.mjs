import { mkdir, readFile, writeFile } from "node:fs/promises";
import { schedule } from "./data/schedule-example.mjs";
import { teachersByDay } from "./data/teachers-example.mjs";

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const lab02 = await readFile(new URL("../public/labs/02/index.html", import.meta.url), "utf8");
const table = lab02.match(/<table[\s\S]*?<\/table>/)?.[0];
if (!table) throw new Error("Run npm run labs:generate first: the schedule table is missing.");

const icon = (name) => {
  const paths = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
    upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
  };
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};

function head(lab, result = false) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Экспарс · ${result ? "Результат формы" : `ЛР ${lab}`}</title>
<!-- example:connections:start -->
  <link rel="stylesheet" href="styles.css">${lab === 3 && !result ? `
  <style>
    /* Same specificity as the external rule: the later declaration wins. */
    .cascade-internal { color: #595f61; }
  </style>` : ''}
<!-- example:connections:end -->
</head>`;
}

const footer = `  <footer class="site-footer container">
    <span>Экспарс <span aria-hidden="true">✳</span> Пары те же, боли меньше</span>
    <a href="#top">Наверх ↑</a>
  </footer>
</body>
</html>
`;

function lesson(text, week, teacher) {
  const [title, kind, room] = (text ?? "Пары нет").split(" · ");
  const empty = !text || text.startsWith("Окно.");
  return `<div class="lesson" data-week="${week}"${empty ? ' data-empty="true"' : ''}>
                  <span class="week-badge">${{upper:"Верхняя",lower:"Нижняя",both:"Обе недели"}[week]}</span>
                  <p class="lesson-title">${escape(title)}</p>
                  ${kind ? `<p class="lesson-meta">${escape(kind)} <span>${escape(room)}</span></p>` : ''}${teacher ? `\n                  <p class="lesson-teacher"><span class="visually-hidden">Преподаватель: </span>${escape(teacher)}</p>` : ''}
                </div>`;
}

const renderCards = (withTeachers) => schedule.map(({day,pairs}, index) => `          <section class="day-card"${withTeachers ? ` id="weekday-${index}"` : ''} aria-labelledby="day-${index}">
            <header class="day-heading"><span class="day-number">0${index+1}</span><h3 id="day-${index}">${escape(day)}</h3></header>
            <ol class="pair-list" aria-label="Пары: ${escape(day)}">
${pairs.map(pair => `              <li class="pair" value="${pair.number}">
                <span class="pair-number"><strong>${String(pair.number).padStart(2,"0")}</strong><span>пара</span></span>
                <div class="pair-lessons">
                ${pair.both ? lesson(pair.both,"both",withTeachers ? teachersByDay[index][pair.number]?.both : undefined) : `${lesson(pair.upper,"upper",withTeachers ? teachersByDay[index][pair.number]?.upper : undefined)}\n                ${lesson(pair.lower,"lower",withTeachers ? teachersByDay[index][pair.number]?.lower : undefined)}`}
                </div>
              </li>`).join("\n")}
            </ol>
          </section>`).join("\n");

const cascade = `
      <p>Три способа задать цвет — каскад решает, кто тут главный</p>
<!-- example:samples:start -->
      <div class="sample-grid">
        <p class="cascade-external"><code>Внешний CSS</code><strong>Я из файла</strong><span>#5c74a3</span></p>
        <p class="cascade-internal"><code>Блок &lt;style&gt;</code><strong>А я пришёл позже</strong><span>#595f61</span></p>
        <p class="cascade-internal" style="color: #2d5f49"><code>Атрибут style</code><strong>У меня VIP-пропуск</strong><span>#2d5f49</span></p>
      </div>
<!-- example:samples:end -->
      <p class="study-note">Внешнее правило и блок style имеют одинаковую специфичность.
        Позднее правило побеждает. У третьего примера обычный inline-стиль сильнее этих правил.
        В примере нет !important и слоёв каскада.</p>`;

const boxModel = `
      <p>У обоих блоков width: 160px, padding: 16px, border: 4px и margin: 8px. Результат — разный.</p>
<!-- example:boxes:start -->
      <div class="box-comparison">
        <figure><div class="box-sample content-box">content-box</div><figcaption>160 + 32 + 8 = <strong>200 px</strong></figcaption></figure>
        <figure><div class="box-sample border-box">border-box</div><figcaption>Всё включено: <strong>160 px</strong></figcaption></figure>
      </div>
<!-- example:boxes:end -->
      <p class="study-note">Margin находится снаружи и не входит в указанную ширину рамки. Именно поэтому «я же поставил 160» иногда превращается в 200.</p>
      <div class="state-demo"><button class="button" type="button" disabled>Автопилот старосты</button><span>Недоступная кнопка: пример :disabled. Староста пока работает вручную.</span></div>`;

const dropdownMenu = `<!-- example:menu:start -->
    <nav class="dropdown-nav" aria-label="Навигация по Экспарсу">
      <details class="nav-dropdown" name="site-menu">
        <summary>Разделы <span class="menu-plus" aria-hidden="true">+</span></summary>
        <ul class="dropdown-list">
          <li><a href="#how-it-works">Как это работает</a></li>
          <li><a href="#upload-title">Загрузить Excel</a></li>
          <li><a href="#schedule">Расписание</a></li>
          <li><a href="#css-lab">Под капотом</a></li>
        </ul>
      </details>
      <details class="nav-dropdown" name="site-menu">
        <summary>Дни недели <span class="menu-plus" aria-hidden="true">+</span></summary>
        <ul class="dropdown-list">
${schedule.map(({day},index)=>`          <li><a href="#weekday-${index}">${escape(day)}</a></li>`).join("\n")}
        </ul>
      </details>
    </nav>
<!-- example:menu:end -->`;

const menuStudy = `<p>Меню открывается через details/summary — мышью, касанием, Enter или пробелом. Tab ведёт к ссылкам. Одинаковый атрибут name оставляет открытым одно меню.</p>
      <p class="study-note">На узком экране список входит в поток страницы, на широком выпадает под заголовком. Выбранный день отмечается через :target. Чтобы закрыть меню, нажми на его заголовок ещё раз: автоматического закрытия по ссылке или клику снаружи пока нет.</p>`;
const layoutStudy = `<p>Один Экспарс — три компоновки. Содержание, преподаватели и переключение недель одинаковые.</p>
      <ul><li><strong>Поток:</strong> форма и расписание идут друг за другом.</li><li><strong>Таблица:</strong> две ячейки удерживают колонки; на телефоне контейнер прокручивается.</li><li><strong>Grid:</strong> две колонки на широком экране, одна — на узком. Этот вариант продолжаем развивать.</li></ul>
      <p class="study-note">Таблица компоновки имеет role="presentation". Она нужна для сравнения способов вёрстки, а не для данных расписания. Плоская вёрстка здесь — обычный последовательный поток документа.</p>`;

function layoutLinks(active) {
  return `<!-- example:layouts:start -->
    <nav class="layout-switch" aria-label="Вариант вёрстки">
      <span>Один сайт, три способа:</span>
${[["flow","flow.html","01 · Поток"],["table","table.html","02 · Таблица"],["grid","index.html","03 · Grid"]].map(([key,href,label])=>`      <a href="${href}"${key===active ? ' aria-current="page"' : ''}>${label}</a>`).join("\n")}
    </nav>
<!-- example:layouts:end -->`;
}

for (const lab of [3,4,5,6]) {
  const isCards = lab >= 4;
  const html = `${head(lab)}
<body id="top">
  <a class="skip-link" href="#main">К содержимому</a>
  <header class="site-header container">
    <a class="brand" href="#top" aria-label="Экспарс — наверх"><span class="brand-mark">${icon("calendar")}</span>Экспарс</a>
    ${lab >= 5 ? dropdownMenu : '<nav aria-label="Навигация"><a href="#how-it-works">Как это работает</a><a href="#schedule">Расписание</a></nav>'}
    <span class="version-chip">ЛР 0${lab} <span aria-hidden="true">/</span> CSS</span>
  </header>
  <main id="main" class="container">
    <section class="hero" aria-labelledby="hero-title">
      <div>
        <p class="eyebrow"><span class="status-dot" aria-hidden="true"></span>Для тех, кому снова прислали Excel</p>
        <h1 id="hero-title">Расписание прислали —<br><span>разбираться опять нам</span></h1>
        <p class="hero-description">Превратим клетчатый хаос в понятную картинку<br>В чат группы — с заботой, в деканат — с вопросами</p>
      </div>
      <aside class="hero-note"><span aria-hidden="true">✳</span><p>Увеличивает<br><strong>читаемость,</strong><br>не посещаемость</p></aside>
    </section>
    <ol id="how-it-works" class="steps" aria-label="Как это работает">
      <li><span>01</span><div><strong>Загрузи Excel</strong><small>Тот самый, из чата</small></div></li>
      <li><span>02</span><div><strong>Выбери неделю</strong><small>Верхняя, нижняя или обе</small></div></li>
      <li><span>03</span><div><strong>Скачай картинку</strong><small>И стань легендой группы</small></div></li>
    </ol>
    ${lab === 6 ? layoutLinks("grid") + '\n    ' : ''}<div class="workspace${lab === 6 ? ' layout-grid' : ''}">
      <section class="upload-panel" aria-labelledby="upload-title">
        <p class="eyebrow">Из таблицы в люди</p>
        <h2 id="upload-title">Разберём твой Excel</h2>
        <p class="panel-description">Один файл, одна неделя<br>Без приближения двумя пальцами</p>
<!-- example:form:start -->
        <form id="schedule-form" action="form-result.html" method="get" aria-describedby="stage-note">
          <div class="file-field">
            <span class="upload-icon">${icon("upload")}</span>
            <label for="schedule-file">Выбери расписание</label>
            <span class="file-hint" id="file-hint">Excel · .xls или .xlsx</span>
            <input id="schedule-file" name="schedule" type="file" accept=".xls,.xlsx" required aria-describedby="file-hint">
          </div>
          <fieldset class="week-picker">
            <legend>Какая неделя?</legend>
            <div class="week-options">
              <input class="visually-hidden" id="week-upper" type="radio" name="week" value="upper" required><label for="week-upper">Верхняя</label>
              <input class="visually-hidden" id="week-lower" type="radio" name="week" value="lower" required><label for="week-lower">Нижняя</label>
              <input class="visually-hidden" id="week-both" type="radio" name="week" value="both" required checked><label for="week-both">Обе</label>
            </div>
          </fieldset>
          <button class="button button-primary" type="submit">Скачать картинку ${icon("arrow")}</button>
          <button class="button-reset" type="reset">Начать заново</button>
          <p id="stage-note" class="stage-note">Пока показываем пример КИ-24. ${isCards ? "Недели в примере уже переключаются." : "Выбор недели пока не меняет таблицу."} Чтение Excel и PNG — на этапе JavaScript. Кнопка откроет пояснение.</p>
        </form>
<!-- example:form:end -->
        <p class="privacy-note">Содержимое Excel не отправляется.<br>Деканат ничего не узнает.</p>
      </section>
      <section id="schedule" class="preview-panel" aria-labelledby="schedule-title">
        <div class="preview-heading"><div><p class="eyebrow">Пример расписания</p><h2 id="schedule-title">КИ-24 <span>на связи</span></h2></div><span class="preview-icon">${icon("image")}</span></div>
        <div class="preview-meta"><span>Осень 2026–2027</span><span class="mode-label mode-both">Обе недели</span>${isCards ? '<span class="mode-label mode-upper">Верхняя неделя</span><span class="mode-label mode-lower">Нижняя неделя</span>' : ''}</div>
        <p id="table-note" class="preview-caption">${lab >= 5 ? "Предметы, аудитории и преподаватели" : "Номера пар и аудитории"} — из расписания, время звонков не выдумываем</p>
        ${isCards ? `<label class="compact-toggle"><input id="compact-view" type="checkbox" form="schedule-form"> Компактный вид для телефона</label>
<!-- example:cards:start -->
        <div class="schedule-days">
${renderCards(lab >= 5)}
        </div>
<!-- example:cards:end -->` : `<div class="table-scroll" role="region" aria-label="Расписание КИ-24, прокручиваемая таблица" tabindex="0">
${table}
        </div>`}
        <p class="preview-footnote">${isCards ? "Общие занятия показаны один раз, окна между парами сохранены" : "Общие пары занимают обе колонки, разные недели стоят рядом"}<br>Красивое расписание не является уважительной причиной прогула</p>
      </section>
    </div>
    <details class="study-panel" id="css-lab">
      <summary><span class="eyebrow">Под капотом · ЛР 0${lab}</span><span>${lab === 6 ? "Три способа расставить блоки" : lab === 5 ? "Меню открывается без JavaScript" : isCards ? "Почему блок внезапно толще?" : "Кто покрасил этот текст?"}</span></summary>
      <div class="study-content">${lab === 6 ? layoutStudy : lab === 5 ? menuStudy : isCards ? boxModel : cascade}
      </div>
    </details>
  </main>
${footer}`;
  const result = `${head(lab,true)}
<body id="top">
  <main class="result-page container">
    <a class="brand" href="index.html"><span class="brand-mark">${icon("calendar")}</span>Экспарс</a>
    <section class="result-card">
      <p class="eyebrow">Форма дошла, картинка задерживается</p>
      <h1>PNG пока<br><span>на другой паре</span></h1>
      <p>Это этап HTML и CSS. Браузер проверил выбор файла и передал его имя и вариант недели.</p>
      <p><strong>Excel не обработан, PNG не создан.</strong> Содержимое файла не отправлялось. Настоящее скачивание добавим в лабораторных по JavaScript.</p>
      <a class="button button-primary" href="index.html#upload-title">Вернуться к форме ${icon("arrow")}</a>
      <a class="result-link" href="index.html#schedule">Посмотреть расписание</a>
    </section>
  </main>
${footer}`;
  const dir = new URL(`../public/labs/0${lab}/`,import.meta.url);
  await mkdir(dir,{recursive:true});
  await writeFile(new URL("index.html",dir),html.replace(/ +$/gm, ""),"utf8");
  await writeFile(new URL("form-result.html",dir),result,"utf8");
  if (lab === 6) {
    const flow = html.replace(layoutLinks("grid"),layoutLinks("flow")).replace('workspace layout-grid','workspace layout-flow');
    const formStart = html.indexOf('      <section class="upload-panel"');
    const previewStart = html.indexOf('      <section id="schedule"');
    const workspaceEnd = html.indexOf('    </div>\n    <details class="study-panel"');
    if (formStart < 0 || previewStart < 0 || workspaceEnd < 0) throw new Error("Layout boundaries not found");
    const tableWorkspace = `<!-- example:table-layout:start -->
      <div class="layout-table-scroll" role="region" aria-label="Табличная компоновка, прокручиваемая область" tabindex="0">
        <table class="layout-table" role="presentation">
          <tbody><tr>
            <td class="layout-cell-form">
<!-- example:table-layout:end -->
${html.slice(formStart,previewStart)}
            </td><td class="layout-cell-preview">
${html.slice(previewStart,workspaceEnd)}
            </td>
          </tr></tbody>
        </table>
      </div>
`;
    const tablePage = (html.slice(0,formStart) + tableWorkspace + html.slice(workspaceEnd))
      .replace(layoutLinks("grid"),layoutLinks("table")).replace('workspace layout-grid','workspace layout-table-wrapper');
    await writeFile(new URL("flow.html",dir),flow.replace(/ +$/gm,""),"utf8");
    await writeFile(new URL("table.html",dir),tablePage.replace(/ +$/gm,""),"utf8");
  }
  console.log(`Generated Paroscope lab ${lab}`);
}
