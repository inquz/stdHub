# Парсер расписания на Python

`excel.py` читает `.xls` (xlrd) и `.xlsx` (openpyxl) в единую модель ячеек
и объединений. `schedule_parser.py` выделяет дни, пары, недели и подгруппы.
`__main__.py` принимает байты через stdin и возвращает JSON в UTF-8.

Из корня репозитория:

```powershell
npm run setup:python
npm run dev
```

Для первой настройки нужен [uv](https://docs.astral.sh/uv/getting-started/installation/).
Если Python уже установлен, можно обойтись без uv: `python -m venv .venv`, затем
`.venv\Scripts\python.exe -m pip install -r backend/requirements.txt`.
Linux/macOS используют `.venv/bin/python`.

Проверка отдельного файла без сайта:

```powershell
.venv\Scripts\python.exe -X utf8 -m backend "C:\путь\КИ-23.xls"
```

`npm test` создаёт синтетические XLS/XLSX и запускает настоящий Python-парсер.
Оригинальные файлы пользователей в репозиторий не добавляются.

Сайт вызывает `POST /api/schedule?filename=...` с содержимым файла в теле.
Next.js проверяет расширение и предел 5 МБ, запускает Python без shell,
передаёт байты через stdin. У процесса есть таймаут 15 секунд; отмена запроса
останавливает процесс. Файлы не сохраняются, stdout содержит только JSON.
Код выхода 0 означает успех, 2 — неподдерживаемый/неверный файл, 1 — внутреннюю ошибку.
При нескольких листах возвращаются `schedules` и сообщения `skipped`.

Проверены КИ-23, КИ-24, КИ-25: пары из двух/четырёх строк, общие занятия,
разные недели, консультации, несколько преподавателей, подгруппы в отдельных
строках одной половины пары. Неизвестные типы, пересечения без разных подгрупп
и неизвестные размеры блоков дают ошибку с номером строки. Произвольные
университетские шаблоны пока не поддерживаются — Python не угадывает их смысл.

Документация библиотек: [xlrd](https://xlrd.readthedocs.io/en/stable/api.html),
[openpyxl](https://openpyxl.readthedocs.io/en/stable/api/openpyxl.reader.excel.html).
