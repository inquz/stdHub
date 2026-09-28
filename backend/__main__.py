"""Read workbook bytes from stdin (or a local CLI path), return UTF-8 JSON."""

import argparse
import json
import sys
import traceback

from .excel import MAX_FILE_BYTES, ParseError
from .schedule_parser import parse_workbook


def main() -> int:
    arguments = argparse.ArgumentParser(description="Разбор расписания Excel в JSON")
    arguments.add_argument("file", nargs="?", help="Файл .xls/.xlsx; без аргумента читается stdin")
    args = arguments.parse_args()
    try:
        if args.file:
            with open(args.file, "rb") as source:
                data = source.read(MAX_FILE_BYTES + 1)
        else:
            data = sys.stdin.buffer.read(MAX_FILE_BYTES + 1)
        result = parse_workbook(data)
        code = 0
    except (ParseError, OSError) as error:
        result, code = {"error": str(error)}, 2
    except Exception:
        traceback.print_exc(file=sys.stderr)
        result, code = {"error": "Внутренняя ошибка парсера расписания."}, 1
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
