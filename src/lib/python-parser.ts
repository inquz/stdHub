import { execFile } from "node:child_process";
import path from "node:path";

export class ParserError extends Error {
  status: number;

  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}

export type Schedule = {
  group: string;
  heading: string;
  sheetName: string;
  warnings: string[];
  days: { dayIndex: number; day: string; pairs: { number: number; lessons: {
    subject: string; kind: string; room: string; teacher: string; notes: string;
    week: "upper" | "lower" | "both";
  }[] }[] }[];
};

export function parseWorkbook(data: Uint8Array, signal?: AbortSignal): Promise<{ schedules: Schedule[]; skipped: string[] }> {
  const root = process.cwd();
  const python = process.env.SCHEDULE_PYTHON || path.join(root, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  return new Promise((resolve, reject) => {
    // No shell, temporary upload file, or user-controlled process arguments.
    // Python is provisioned separately; next.config.ts includes only backend source.
    const child = execFile(/* turbopackIgnore: true */ python, ["-X", "utf8", "-m", "backend"], {
      cwd: root, windowsHide: true, timeout: 15_000, maxBuffer: 1024 * 1024, encoding: "utf8", signal,
    }, (error, stdout, stderr) => {
      if (error?.code === "ENOENT") {
        reject(new ParserError("Сервис разбора Excel ещё не настроен на сервере.", 503));
        return;
      }
      if (signal?.aborted) {
        reject(new ParserError("Загрузка отменена.", 499));
        return;
      }
      if (error?.killed) {
        reject(new ParserError("Разбор Excel занял слишком много времени. Попробуй файл поменьше.", 504));
        return;
      }
      if (error && error.code !== 2) {
        console.error("Python parser failed:", stderr || error.message);
        reject(new ParserError("Сервис разбора Excel недоступен. Попробуй позже.", 500));
        return;
      }
      try {
        const result = JSON.parse(stdout);
        if (error?.code === 2) throw new ParserError(result.error || "Не удалось прочитать расписание.");
        if (!Array.isArray(result.schedules) || !result.schedules.length || !Array.isArray(result.skipped)) {
          throw new Error("Invalid parser response");
        }
        resolve(result);
      } catch (failure) {
        reject(failure instanceof ParserError ? failure : new ParserError("Сервис вернул некорректный ответ.", 500));
      }
    });
    // Early process exit is handled by the callback above, including missing dependencies.
    child.stdin?.on("error", () => {});
    child.stdin?.end(data);
  });
}
