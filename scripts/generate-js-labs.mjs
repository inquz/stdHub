import { readFile, mkdir, writeFile } from "node:fs/promises";
import { schedule } from "./data/schedule-example.mjs";
import { teachersByDay } from "./data/teachers-example.mjs";

const base = await readFile(new URL("../public/labs/06/index.html", import.meta.url), "utf8");
for (const lab of [7, 8]) {
  let html = base.replaceAll("ЛР 6", `ЛР ${lab}`).replaceAll("ЛР 06", `ЛР 0${lab}`)
    .replace('<span aria-hidden="true">/</span> CSS', '<span aria-hidden="true">/</span> JavaScript')
    .replace(/<!-- example:layouts:start -->[\s\S]*?<!-- example:layouts:end -->/, "")
    .replace(/<details class="study-panel"[\s\S]*?<\/details>/, `<details class="study-panel" id="css-lab"><summary>Под капотом · ЛР 0${lab}</summary><div class="study-content"><p>${lab === 7 ? "Строки, числа, логические значения, условия, функции и диалоги alert / prompt / confirm. Проверяется только файл по имени и размеру; содержимое прочитаем в следующей лабе." : "Python разбирает Excel через xlrd и openpyxl. JavaScript отправляет файл в API, получает объекты, сохраняет все подгруппы в карточках и считает статистику. Проверено на КИ-23, КИ-24 и КИ-25; PNG появится позже."}</p></div></details>`)
    .replace(/<p id="stage-note"[^>]*>[\s\S]*?<\/p>/, `<p id="stage-note" class="stage-note">${lab === 7 ? "ЛР 7: проверим имя и размер файла. Сам Excel ещё не читается, на экране пример. PNG появится позже." : "Поддерживается структура как в КИ-23.xls, КИ-24.xls и КИ-25.xls. Файл до 5 МБ. PNG появится в следующих лабах."}</p>
          <p id="feedback" class="stage-note" role="status" aria-live="polite">${lab === 7 ? "Выбери файл для проверки" : "Выбери файл — расписание обновится автоматически"}</p>`)
    .replace(/<button class="button button-primary"[\s\S]*?<\/button>/, `<button class="button button-primary" type="submit">${lab === 7 ? "Проверить файл" : "Прочитать Excel"}</button>${lab === 7 ? '\n          <button id="rename-group" class="button-reset" type="button">Подписать группу</button>' : ''}`)
    .replace('<p class="privacy-note">', '<noscript><p>Включи JavaScript, чтобы обработать файл. Сейчас показан статический пример.</p></noscript>\n        <p class="privacy-note">')
    .replace('</head>', '  <script type="module" src="js/app.js"></script>\n</head>');
  if (lab === 8) {
    html = html.replace('<div class="preview-meta">', '<div class="import-info"><p id="source-label">Источник: учебный пример КИ-24</p><time id="imported-at" hidden></time><p id="schedule-stats" role="status"></p><p id="import-warnings"></p><div id="sheet-field" hidden><label for="sheet-select">Лист с расписанием</label><select id="sheet-select"></select></div></div>\n        <div class="preview-meta">')
      .replace('<span>Осень 2026–2027</span>', '<span>Расписание на неделю</span>')
      .replace('Содержимое Excel не отправляется.<br>Деканат ничего не узнает.', 'Файл отправляется на сервер для разбора.<br>На диск не сохраняется.');
  }
  const dir = new URL(`../public/labs/0${lab}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL("index.html", dir), html.replace(/ +$/gm, ""), "utf8");
}

const demo = {
  group: "КИ-24", sheetName: "Учебный пример", heading: "Осень 2026–2027", warnings: [],
  days: schedule.map(({ day, pairs }, dayIndex) => ({
    day, dayIndex,
    pairs: pairs.map((pair) => ({ number: pair.number, lessons: ["upper", "lower", "both"].flatMap((week) => {
      if (!pair[week] || pair[week].startsWith("Окно.")) return [];
      const [subject, kind, room] = pair[week].split(" · ");
      return [{ subject, kind, room, teacher: teachersByDay[dayIndex][pair.number]?.[week] ?? "", week }];
    }) })),
  })),
};
await writeFile(new URL("../public/labs/08/js/demo.js", import.meta.url), `export const demo = ${JSON.stringify(demo, null, 2)};\n`, "utf8");
console.log("Generated labs 7 and 8; existing names and CSS are preserved.");
