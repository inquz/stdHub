"""Recognize lesson blocks and subgroup rows from the faculty's Excel layouts."""

import re

from .excel import MAX_COLUMNS, MAX_ROWS, ParseError, Sheet, read_workbook

DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
KINDS = {"лекц": "лекция", "лб": "лабораторная", "пр": "практика", "конс": "консультация"}
KIND_PATTERN = re.compile(r"^(лекц|лб|пр|конс)\.?(?:\s+(.*))?$", re.I)
SUBGROUP_PATTERN = re.compile(r"\b(\d+)\s*подгр", re.I)


def parse_pair(sheet: Sheet, start: int, end: int, kind_column: int) -> list[dict]:
    height = end - start
    if height not in (2, 4):
        raise ParseError(f"Строка {start + 1}: неизвестная высота блока пары ({height}).")
    middle = start + height // 2
    notes_column = kind_column + 2
    lessons = []
    row = start
    while row < end:
        value = sheet.text(row, notes_column)
        raw_kind = sheet.text(row, kind_column)
        if not value and not raw_kind:
            row += 1
            continue
        match = KIND_PATTERN.fullmatch(raw_kind)
        if not match:
            raise ParseError(f"Не распознан тип занятия в строке {row + 1}: {raw_kind or 'не указан'}.")
        kind = KINDS[match[1].lower()]
        notes_merge = sheet.merge_at(row, notes_column)
        # Inline subgroups: D:E = kind/room, F:G = notes, H:M = subject, N:R = teacher.
        inline = (notes_merge is not None and notes_merge[0] == row
                  and notes_merge[3] < sheet.width and bool(sheet.text(row, notes_merge[3])))
        if inline and notes_merge is not None:
            subject_column = notes_merge[3]
            subject_merge = sheet.merge_at(row, subject_column)
            if subject_merge is None or subject_merge[1] != row + 1:
                raise ParseError(f"Не распознаны границы занятия подгруппы в строке {row + 1}.")
            subject = sheet.text(row, subject_column)
            teacher = sheet.text(row, subject_merge[3])
            room = match[2] or ""
            notes = value
            week = "both" if height == 2 else "upper" if row < middle else "lower"
            next_row = row + 1
        else:
            if not value or match[2]:
                raise ParseError(f"Не распознано название или расположение занятия в строке {row + 1}.")
            subject = value
            metadata_row = notes_merge[1] if notes_merge else row + 1
            if metadata_row >= end:
                raise ParseError(f"Название занятия выходит за границы пары в строке {row + 1}.")
            shared = height == 2 or (row < middle < metadata_row)
            week = "both" if shared else "upper" if row < middle else "lower"
            if week == "upper" and metadata_row >= middle:
                raise ParseError(f"Не удалось разделить недели в строке {row + 1}.")
            room = sheet.text(metadata_row, kind_column)
            teacher = sheet.text(metadata_row, kind_column + 8)
            notes = sheet.text(metadata_row, notes_column)
            next_row = metadata_row + 1
        lessons.append({"subject": subject, "kind": kind, "room": room,
                        "teacher": teacher, "notes": notes, "week": week})
        row = next_row

    # Parallel lessons are valid only when the sheet explicitly identifies subgroups.
    for week in ("upper", "lower"):
        active = [lesson for lesson in lessons if lesson["week"] in (week, "both")]
        if len(active) > 1:
            matches = [SUBGROUP_PATTERN.search(lesson["notes"]) for lesson in active]
            groups = [match[1] if match else None for match in matches]
            if not all(groups) or len(set(groups)) != len(groups):
                raise ParseError(f"Строка {start + 1}: пересекающиеся занятия без разных подгрупп.")
    return lessons


def parse_sheet(sheet: Sheet) -> dict:
    if sheet.height > MAX_ROWS or sheet.width > MAX_COLUMNS:
        raise ParseError("Лист слишком большой для расписания одной группы.")
    day_names = {name.lower(): i for i, name in enumerate(DAYS)}
    anchors = sorted((r, c, day_names[value.lower()]) for (r, c), value in sheet.cells.items()
                     if value.lower() in day_names)
    if not anchors:
        raise ParseError("Не найдены дни недели. Нужен шаблон расписания как в КИ-23, КИ-24 или КИ-25.")
    if len({c for _, c, _ in anchors}) != 1 or len({day for _, _, day in anchors}) != len(anchors):
        raise ParseError("Несколько расписаний на одном листе пока не поддерживаются.")
    days = []
    warnings = []
    for index, (start, day_column, day_index) in enumerate(anchors):
        merge = sheet.merge_at(start, day_column)
        next_start = anchors[index + 1][0] if index + 1 < len(anchors) else sheet.height
        end = min(merge[1] if merge else sheet.height, next_start)
        pairs = []
        row = start
        while row < end:
            number_text = sheet.text(row, day_column + 1)
            if not re.fullmatch(r"\d{1,2}", number_text):
                row += 1
                continue
            number = int(number_text)
            block = sheet.merge_at(row, day_column + 1)
            if block is None or block[0] != row or block[1] > end:
                raise ParseError(f"Не распознан блок пары {number} в строке {row + 1}.")
            if any(pair["number"] == number for pair in pairs):
                raise ParseError("Повторяется номер пары в одном дне.")
            lessons = parse_pair(sheet, row, block[1], day_column + 2)
            for lesson in lessons:
                if not lesson["teacher"]:
                    warnings.append(f"{DAYS[day_index]}, пара {number}: преподаватель не указан.")
            pairs.append({"number": number, "lessons": lessons})
            row = block[1]
        filled = [i for i, pair in enumerate(pairs) if pair["lessons"]]
        days.append({"dayIndex": day_index, "day": DAYS[day_index],
                     "pairs": pairs[filled[0]:filled[-1] + 1] if filled else []})
    if not any(day["pairs"] for day in days):
        raise ParseError("Дни найдены, но занятия не распознаны.")
    heading = next((value for (r, _), value in sorted(sheet.cells.items())
                    if r < anchors[0][0] and re.search(r"\bгр\.?\s*\S+", value, re.I)), "")
    group = re.search(r"\bгр\.?\s*([^\s]+)", heading, re.I)
    return {"group": group[1] if group else sheet.name.strip(), "heading": heading,
            "sheetName": sheet.name, "days": sorted(days, key=lambda day: day["dayIndex"]), "warnings": warnings}


def parse_workbook(data: bytes) -> dict:
    schedules, skipped = [], []
    for sheet in read_workbook(data):
        try:
            schedules.append(parse_sheet(sheet))
        except ParseError as error:
            skipped.append(f"{sheet.name}: {error}")
    if not schedules:
        raise ParseError(skipped[0] if skipped else "Книга не содержит листов с расписанием.")
    return {"schedules": schedules, "skipped": skipped}
