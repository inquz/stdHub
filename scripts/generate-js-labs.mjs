import { readFile, mkdir, writeFile } from "node:fs/promises";
import { schedule } from "./data/schedule-example.mjs";
import { teachersByDay } from "./data/teachers-example.mjs";

const base = await readFile(new URL("../public/labs/06/index.html", import.meta.url), "utf8");
const selectedLab = process.argv[2];
if (selectedLab && !["7", "8"].includes(selectedLab)) throw new Error("Expected lab number 7 or 8");
for (const lab of [7, 8]) {
  if (selectedLab && Number(selectedLab) !== lab) continue;
  let html = base.replaceAll("ЛР 6", `ЛР ${lab}`).replaceAll("ЛР 06", `ЛР 0${lab}`)
    .replace('action="form-result.html"', 'action="#schedule"')
    .replace(/<!-- example:layouts:start -->[\s\S]*?<!-- example:layouts:end -->/, "")
    .replace(/<details class="study-panel"[\s\S]*?<\/details>/, `<details class="study-panel" id="css-lab"><summary>Под капотом · ЛР 0${lab}</summary><div class="study-content"><p>${lab === 7 ? "JavaScript вышел на смену: строки, числа, условия и функции проверяют имя и размер файла. alert сообщает результат, prompt спрашивает про группу, confirm страхует сброс. Сам Excel прочитаем в следующей лабе — сегодня знакомимся." : "Python с xlrd и openpyxl разбирает Excel, JavaScript получает объекты, считает статистику и собирает карточки со всеми подгруппами. КИ-23, КИ-24 и КИ-25 проверку прошли. У каждого свой участок работы, как у идеальной команды перед дедлайном."}</p></div></details>`)
    .replace(/<p id="stage-note"[^>]*>[\s\S]*?<\/p>/, `<p id="stage-note" class="stage-note">${lab === 7 ? "Проверяем имя и размер. На экране пример; внутрь Excel заглянем в ЛР 8. Всему свой семестр. Ладно, своя лаба." : "Выбери Excel до 5 МБ — дальше мы сами. Подходит структура КИ-23, КИ-24 и КИ-25. PNG появится в ЛР 10."}</p>`)
    .replace(/<button class="button button-primary"[\s\S]*?<\/button>/, `${lab === 7 ? '<button class="button button-primary" type="submit">Проверить файл</button>\n          <button id="rename-group" class="button-reset" type="button">Подписать группу</button>\n          ' : ''}<p id="feedback" class="stage-note" data-state="${lab === 7 ? 'idle' : 'success'}" role="status" aria-live="polite">${lab === 7 ? 'Выбирай файл — устроим ему маленькую проверку' : 'Пример готов. Закидывай свой Excel, разберёмся и с ним'}</p>`)
    .replace('<p class="privacy-note">', '<noscript><p>Включи JavaScript, чтобы заработала обработка файла. Пока он отдыхает, показываем учебный пример.</p></noscript>\n        <p class="privacy-note">')
    .replace('</head>', '  <script type="module" src="js/app.js"></script>\n</head>');
  if (lab === 8) {
    html = html.replace('<div class="preview-meta">', '<div class="import-info"><p id="source-label">Источник: учебный пример КИ-24</p><time id="imported-at" hidden></time><p id="schedule-stats" role="status"></p><p id="import-warnings"></p><div id="sheet-field" hidden><label for="sheet-select">Лист с расписанием</label><select id="sheet-select"></select></div></div>\n        <div class="preview-meta">')
      .replace('<span>Осень 2026–2027</span>', '<span>Расписание на неделю</span>')
      .replace('Начать заново</button>', 'Восстановить пример</button>')
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
if (!selectedLab || selectedLab === "8") {
  await writeFile(new URL("../public/labs/08/js/demo.js", import.meta.url), `export const demo = ${JSON.stringify(demo, null, 2)};\n`, "utf8");
}
console.log(`Generated lab ${selectedLab ?? "7 and 8"}; existing CSS and logic are preserved.`);
