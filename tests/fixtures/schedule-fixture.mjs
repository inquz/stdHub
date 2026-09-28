import * as XLSX from "../vendor/xlsx.mjs";

export function makeScheduleSheet() {
  const sheet = { "!ref": "A1:R25", "!merges": [] };
  const set = (address, value) => { sheet[address] = { t: "s", v: value }; };
  const merge = (range) => sheet["!merges"].push(XLSX.utils.decode_range(range));
  set("C6", "Расписание гр.ТЕСТ-24 на семестр");
  set("B8", "Понедельник"); merge("B8:B25");
  for (const [number, row, end] of [[2,8,11],[3,12,15],[4,16,19],[5,20,23],[6,24,25]]) {
    set(`C${row}`, String(number)); merge(`C${row}:C${end}`);
  }
  function lesson(row, end, subject, teacher) {
    set(`F${row}`, subject); merge(`F${row}:R${end}`);
    set(`D${row}`, "лекц");
    set(`D${end+1}`, "4.014"); set(`L${end+1}`, teacher);
  }
  // Same subject, different teachers: keep separate week halves.
  lesson(8,8,"HTML","Верхний А.А.");
  lesson(10,10,"HTML","Нижний Б.Б.");
  lesson(12,14,"CSS","Общий В.В.");
  lesson(22,22,"JavaScript","Поздний Г.Г.");
  return sheet;
}

// Same layout as the second sample: subgroup notes and an occupied two-row pair.
export function makeAnnotatedScheduleSheet() {
  const sheet = makeScheduleSheet();
  const set = (address, value) => { sheet[address] = { t: "s", v: value }; };
  for (const [row, notes] of [[9, "1 подгруппа"], [11, "2 подгруппа"], [15, "+ ТЕСТ-25"], [23, "2 подгруппа"], [25, "+ ТЕСТ-26"]]) {
    set(`F${row}`, notes);
    sheet["!merges"].push(XLSX.utils.decode_range(`F${row}:K${row}`));
  }
  set("F24", "Физкультура");
  sheet["!merges"].push(XLSX.utils.decode_range("F24:R24"));
  set("D24", "пр");
  set("D25", "11.228, 11.243");
  set("L25", "Общий В.В., Поздний Г.Г.");
  return sheet;
}

export function makeSubgroupScheduleSheet() {
  const sheet = makeScheduleSheet();
  delete sheet.L9;
  sheet["!merges"] = sheet["!merges"].filter(({ s }) => !(s.r === 7 && s.c === 5));
  for (const [row, group, subject, room, teacher] of [
    [8, 1, "HTML", "4.037", "Первый А.А."], [9, 2, "SQL", "4.014", "Второй Б.Б."],
  ]) {
    for (const [column, value] of [["D", `лб ${room}`], ["F", `${group} подгруппа`], ["H", subject], ["N", teacher]]) {
      sheet[`${column}${row}`] = { t: "s", v: value };
    }
    for (const range of [`D${row}:E${row}`, `F${row}:G${row}`, `H${row}:M${row}`, `N${row}:R${row}`]) {
      sheet["!merges"].push(XLSX.utils.decode_range(range));
    }
  }
  sheet.D12.v = "конс";
  return sheet;
}

export function workbookBytes(sheets, bookType = "xlsx") {
  const book = XLSX.utils.book_new();
  for (const [name, sheet] of Object.entries(sheets)) XLSX.utils.book_append_sheet(book, sheet, name);
  return XLSX.write(book, { type: "array", bookType });
}
