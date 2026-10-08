import { selectSchedule, weekLabels, compactLessonKind, compactLessonRoom, pairEntries } from "./view.js";
import { chatGrid, positionChatCards } from "./chat-layout.js";
import { bellSchedule, scheduleCards } from "./bell-schedule.js";

// Split long unbroken strings as well as ordinary words; never truncate Excel text.
export function wrapText(text, maxWidth, measure) {
  const lines = [];
  for (const paragraph of String(text).split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) <= maxWidth) { line = candidate; continue; }
      if (line) { lines.push(line); line = ""; }
      for (const char of word) {
        if (line && measure(line + char) > maxWidth) { lines.push(line); line = ""; }
        line += char;
      }
    }
    lines.push(line);
  }
  return lines;
}

export function exportFilename(group, week) {
  const name = group.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/[. ]+$/g, "").slice(0, 70) || "schedule";
  return `${name}-${week}.png`;
}

function drawBellRows(text, rect, x, y, width, size = 24) {
  let cursor = text(bellSchedule.days, x, y, width, size - 2) + 14;
  for (const [index, pair] of bellSchedule.pairs.entries()) {
    const labelBottom = text(`${pair.number} пара`, x, cursor, width * .3, size);
    const timeBottom = text(`${pair.start} — ${pair.end}`, x + width * .34, cursor, width * .66, size, true);
    cursor = Math.max(labelBottom, timeBottom) + 12;
    if (index < bellSchedule.pairs.length - 1) {
      rect(x, cursor, width, 1, "#e3e8e5");
      cursor += 12;
    }
  }
  return cursor;
}

// Layout and paint use the same measured lines; text is wrapped, never truncated.
export function createScheduleCanvas(schedule, { week = "both", compact = false, showTeachers = false } = {}) {
  if (compact) return createChatCanvas(schedule, { week, showTeachers });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Этот браузер не умеет собрать картинку. Попробуй открыть Экспарс в другом браузере");
  const width = 1440;
  const margin = 40;
  const gap = 24;
  const column = (width - margin * 2 - gap) / 2;
  const commands = [];
  const font = (size, bold) => `${bold ? 600 : 400} ${size}px "Segoe UI", Arial, sans-serif`;
  function text(value, x, y, w, size = 20, bold = false, fill = "#14251e") {
    ctx.font = font(size, bold);
    const lines = wrapText(value, w, (line) => ctx.measureText(line).width);
    const lineHeight = Math.ceil(size * 1.4);
    commands.push({ type: "text", lines, x, y, size, bold, fill, lineHeight });
    return y + lines.length * lineHeight;
  }
  function rect(x, y, w, h, fill) { commands.push({ type: "rect", x, y, w, h, fill }); }
  let top = text(`Экспарс · ${schedule.group}`, margin, 35, width - margin * 2, 38, true);
  top = text(`${weekLabels[week]}${schedule.heading ? ` · ${schedule.heading}` : ""}`, margin, top + 10, width - margin * 2, 20);
  top += 30;
  const days = selectSchedule(schedule, { week }).days;
  const items = scheduleCards(days);
  function dayCard(item, x, y) {
    const background = { type: "rect", x, y, w: column, h: 0, fill: "#ffffff" };
    commands.push(background);
    let cursor = text(item.type === "bells" ? bellSchedule.title : item.day.day, x + 20, y + 18, column - 40, 26, true) + 16;
    if (item.type === "bells") {
      cursor = drawBellRows(text, rect, x + 20, cursor, column - 40);
      background.h = cursor - y + 8;
      return cursor + 8;
    }
    const day = item.day;
    if (!day.pairs.length) cursor = text("Пар нет", x + 20, cursor, column - 40) + 16;
    for (const pair of day.pairs) {
      cursor = text(`Пара ${pair.number}`, x + 20, cursor, column - 40, 18, true) + 6;
      for (const entry of pairEntries(pair, week)) {
        const { lesson } = entry;
        const block = { type: "rect", x: x + 12, y: cursor, w: column - 24, h: 0,
          fill: lesson ? { upper: "#dce1eb", lower: "#a8f7d1", both: "#eefcf5" }[entry.week] : "#f4f7f5" };
        commands.push(block);
        let line = cursor + 14;
        const tx = x + 24;
        const tw = column - 48;
        line = text(weekLabels[entry.week], tx, line, tw, 16, false, "#2d5f49");
        if (lesson) {
          line = text(lesson.subject, tx, line + 4, tw, 22, true);
          line = text([lesson.kind, lesson.room || "Аудитория не указана"].filter(Boolean).join(" · "), tx, line + 4, tw, 18);
          if (lesson.notes) line = text(lesson.notes, tx, line + 4, tw, 18);
          line = text(lesson.teacher || "Преподаватель не указан", tx, line + 4, tw, 19, true);
        } else line = text("Окно", tx, line + 4, tw, 20, false, "#43534b");
        block.h = line - cursor + 14;
        cursor += block.h + 14;
      }
      cursor += 10;
    }
    background.h = cursor - y + 8;
    return cursor + 8;
  }
  for (let i = 0; i < items.length; i += 2) {
    const left = dayCard(items[i], margin, top);
    const right = items[i + 1] ? dayCard(items[i + 1], margin + column + gap, top) : top;
    top = Math.max(left, right) + gap;
  }
  if (!days.length) top = text("На этой неделе занятий нет", margin, top, width - margin * 2);
  top = text("Предметы, аудитории, преподаватели и подгруппы — из расписания", margin, top + 8, width - margin * 2, 17);
  const height = Math.ceil(top + 30);
  if (height > 16000) throw new Error("Расписание не влезает в одну картинку — вот это нагрузка. Выбери верхнюю или нижнюю неделю отдельно");
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = "#eefcf5";
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "top";
  for (const command of commands) {
    ctx.fillStyle = command.fill;
    if (command.type === "rect") ctx.fillRect(command.x, command.y, command.w, command.h);
    else {
      ctx.font = font(command.size, command.bold);
      command.lines.forEach((line, index) => ctx.fillText(line, command.x, command.y + index * command.lineHeight));
    }
  }
  return canvas;
}

function createChatCanvas(schedule, { week, showTeachers }) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Этот браузер не умеет собрать картинку. Попробуй открыть Экспарс в другом браузере");
  const days = selectSchedule(schedule, { week }).days;
  const items = scheduleCards(days);
  const { columns } = chatGrid(items.length);
  const cardWidth = 560;
  const margin = 32;
  const gap = 20;
  const width = cardWidth * columns + gap * (columns - 1) + margin * 2;
  const contentWidth = width - margin * 2;
  const textX = 54;
  const detailsWidth = 76;
  const detailsX = cardWidth - detailsWidth - 16;
  const textWidth = detailsX - textX - 14;
  const rowWidth = cardWidth - textX - 16;
  let commands = [];
  const font = (size, bold) => `${bold ? 600 : 400} ${size}px "Segoe UI", Arial, sans-serif`;
  function text(value, x, y, w, size = 22, bold = false, fill = "#43534b") {
    ctx.font = font(size, bold);
    const lines = wrapText(value, w, (line) => ctx.measureText(line).width);
    const lineHeight = Math.ceil(size * 1.22);
    commands.push({ type: "text", lines, x, y, size, bold, fill, lineHeight });
    return y + lines.length * lineHeight;
  }
  function rect(x, y, w, h, fill) { commands.push({ type: "rect", x, y, w, h, fill }); }

  let top = text(`${schedule.group} · ${weekLabels[week]}`, margin, 24, contentWidth, 36, true, "#14251e");
  if (schedule.heading) top = text(schedule.heading, margin, top + 2, contentWidth, 23);
  top += 20;
  const pageCommands = commands;
  const cards = items.map((item) => {
    commands = [];
    const background = { type: "rect", x: 0, y: 0, w: cardWidth, h: 0, fill: "#ffffff" };
    const heading = { type: "rect", x: 0, y: 0, w: cardWidth, h: 0, fill: "#e3eee7" };
    commands.push(background, heading);
    let cursor = text(item.type === "bells" ? bellSchedule.title : item.day.day, 16, 12, cardWidth - 32, 28, true, "#18392b");
    heading.h = cursor + 12;
    cursor = heading.h + 14;
    if (item.type === "bells") cursor = drawBellRows(text, rect, 20, cursor, cardWidth - 40, 26);
    else if (!item.day.pairs.length) cursor = text("Пар нет", textX, cursor, rowWidth) + 10;
    const pairs = item.type === "day" ? item.day.pairs : [];
    for (let index = 0; index < pairs.length; index++) {
      const pair = pairs[index];
      const numberBottom = text(String(pair.number).padStart(2, "0"), 14, cursor, 34, 23, true);
      for (const [lessonIndex, entry] of pairEntries(pair, week).entries()) {
        const { lesson } = entry;
        if (lessonIndex > 0) cursor += 10;
        if (week === "both" && entry.week !== "both") {
          cursor = text(weekLabels[entry.week], textX, cursor, rowWidth, 20, true, "#326448") + 3;
        }
        if (!lesson) {
          cursor = text("Окно", textX, cursor, rowWidth);
          continue;
        }
        const subjectBottom = text(lesson.subject, textX, cursor, textWidth, 26, true, "#14251e");
        let detailsBottom = text(compactLessonRoom(lesson), detailsX, cursor, detailsWidth, 23, true, "#14251e");
        detailsBottom = text(compactLessonKind(lesson), detailsX, detailsBottom + 3, detailsWidth, 20);
        cursor = Math.max(subjectBottom, detailsBottom);
        if (lesson.notes) cursor = text(lesson.notes, textX, cursor + 4, rowWidth, 21);
        if (showTeachers) cursor = text(lesson.teacher || "Преподаватель не указан", textX, cursor + 4, rowWidth, 21);
      }
      cursor = Math.max(cursor, numberBottom) + 10;
      if (index < pairs.length - 1) {
        rect(14, cursor, cardWidth - 28, 1, "#e3e8e5");
        cursor += 10;
      }
    }
    background.h = cursor + 6;
    commands.push({ type: "border", x: 0, y: 0, w: cardWidth, h: background.h, fill: "#c7d8cd" });
    return { commands, height: background.h };
  });
  commands = pageCommands;
  const layout = positionChatCards(cards.map((card) => card.height), gap);
  cards.forEach((card, index) => {
    const { column, top: offset, height } = layout.placements[index];
    for (const [commandIndex, command] of card.commands.entries()) {
      const placed = { ...command, x: command.x + margin + column * (cardWidth + gap), y: command.y + top + offset };
      if (commandIndex === 0 || command.type === "border") placed.h = height;
      commands.push(placed);
    }
  });
  top += layout.height + 20;
  if (!days.length) top = text("На этой неделе занятий нет", margin, top, contentWidth);
  top = text("Экспарс · расписание на неделю", margin, top + 4, contentWidth, 22);
  const height = Math.ceil(top + 24);
  if (height > 16000) throw new Error("Расписание не влезает в одну картинку — вот это нагрузка. Выбери верхнюю или нижнюю неделю отдельно");
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = "#f4f7f5";
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "top";
  for (const command of commands) {
    ctx.fillStyle = command.fill;
    if (command.type === "rect") ctx.fillRect(command.x, command.y, command.w, command.h);
    else if (command.type === "border") {
      ctx.strokeStyle = command.fill;
      ctx.lineWidth = 1;
      ctx.strokeRect(command.x + .5, command.y + .5, command.w - 1, command.h - 1);
    }
    else {
      ctx.font = font(command.size, command.bold);
      command.lines.forEach((line, index) => ctx.fillText(line, command.x, command.y + index * command.lineHeight));
    }
  }
  return canvas;
}

/* example:download:start */
export async function downloadSchedule(schedule, options) {
  const canvas = createScheduleCanvas(schedule, options);
  const blob = await new Promise((resolve, reject) => canvas.toBlob((result) => {
    if (result) resolve(result);
    else reject(new Error("PNG не собрался с первого раза. Попробуй ещё раз — расписание на месте"));
  }, "image/png"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFilename(schedule.group, options.week);
  document.body.append(link);
  link.click();
  link.remove();
  // Leave time for the browser to consume the object URL before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
/* example:download:end */
