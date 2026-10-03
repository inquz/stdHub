import { selectSchedule, weekLabels } from "./view.js";

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

// Layout and paint use the same measured lines, including teachers and subgroups.
export function createScheduleCanvas(schedule, { week = "both", compact = false } = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Браузер не поддерживает создание изображения");
  const width = 1440;
  const margin = 40;
  const gap = 24;
  const column = (width - margin * 2 - gap) / 2;
  const commands = [];
  const font = (size, bold) => `${bold ? 600 : 400} ${size}px "Segoe UI", Arial, sans-serif`;
  function text(value, x, y, w, size = 20, bold = false, fill = "#203b35") {
    ctx.font = font(size, bold);
    const lines = wrapText(value, w, (line) => ctx.measureText(line).width);
    const lineHeight = Math.ceil(size * 1.4);
    commands.push({ type: "text", lines, x, y, size, bold, fill, lineHeight });
    return y + lines.length * lineHeight;
  }
  let top = text(`Экспарс · ${schedule.group}`, margin, 35, width - margin * 2, 38, true);
  top = text(`${weekLabels[week]}${schedule.heading ? ` · ${schedule.heading}` : ""}`, margin, top + 10, width - margin * 2, 20);
  top += 30;
  const days = selectSchedule(schedule, { week }).days;
  function dayCard(day, x, y) {
    const background = { type: "rect", x, y, w: column, h: 0, fill: "#ffffff" };
    commands.push(background);
    let cursor = text(day.day, x + 20, y + 18, column - 40, 26, true) + 16;
    if (!day.pairs.length) cursor = text("Пар нет", x + 20, cursor, column - 40) + 16;
    for (const pair of day.pairs) {
      cursor = text(`Пара ${pair.number}`, x + 20, cursor, column - 40, 18, true) + 6;
      if (!pair.lessons.length) cursor = text("Пары нет", x + 20, cursor, column - 40, 18) + 12;
      for (const lesson of pair.lessons) {
        const block = { type: "rect", x: x + 12, y: cursor, w: column - 24, h: 0,
          fill: { upper: "#edf1ff", lower: "#fff0e3", both: "#f2f5ec" }[lesson.week] };
        commands.push(block);
        let line = cursor + (compact ? 8 : 14);
        const tx = x + 24;
        const tw = column - 48;
        line = text(weekLabels[lesson.week], tx, line, tw, 16, false, "#52645b");
        line = text(lesson.subject, tx, line + 4, tw, 22, true);
        line = text([lesson.kind, lesson.room || "Аудитория не указана"].filter(Boolean).join(" · "), tx, line + 4, tw, 18);
        if (lesson.notes) line = text(lesson.notes, tx, line + 4, tw, 18);
        line = text(lesson.teacher || "Преподаватель не указан", tx, line + 4, tw, 19, true);
        block.h = line - cursor + (compact ? 8 : 14);
        cursor += block.h + (compact ? 8 : 14);
      }
      cursor += compact ? 4 : 10;
    }
    background.h = cursor - y + 8;
    return cursor + 8;
  }
  for (let i = 0; i < days.length; i += 2) {
    const left = dayCard(days[i], margin, top);
    const right = days[i + 1] ? dayCard(days[i + 1], margin + column + gap, top) : top;
    top = Math.max(left, right) + gap;
  }
  if (!days.length) top = text("На этой неделе занятий нет", margin, top, width - margin * 2);
  top = text("Предметы, аудитории, преподаватели и подгруппы — из расписания", margin, top + 8, width - margin * 2, 17);
  const height = Math.ceil(top + 30);
  if (height > 16000) throw new Error("Расписание слишком большое для одной картинки. Выбери верхнюю или нижнюю неделю отдельно");
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = "#f6f7f2";
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

/* example:download:start */
export async function downloadSchedule(schedule, options) {
  const canvas = createScheduleCanvas(schedule, options);
  const blob = await new Promise((resolve, reject) => canvas.toBlob((result) => {
    if (result) resolve(result);
    else reject(new Error("Не удалось создать PNG. Попробуй ещё раз"));
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
