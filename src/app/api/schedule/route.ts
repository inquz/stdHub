import { parseWorkbook, ParserError } from "@/lib/python-parser";
import { MAX_FILE_BYTES, validateFile } from "../../../../public/labs/shared/files.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const name = new URL(request.url).searchParams.get("filename") ?? "";
    const extensionError = validateFile({ name, size: 1 });
    if (extensionError) throw new ParserError(extensionError, 400);
    if (!request.body) throw new ParserError("Файл не передан.", 400);
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_FILE_BYTES) {
          await reader.cancel();
          throw new ParserError("Файл больше 5 МБ. Выбери расписание одной группы.", 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const error = validateFile({ name, size });
    if (error) throw new ParserError(error, 400);
    const result = await parseWorkbook(Buffer.concat(chunks), request.signal);
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof ParserError) return Response.json({ error: error.message }, { status: error.status, headers });
    console.error("Schedule import failed:", error);
    return Response.json({ error: "Не удалось обработать файл. Попробуй ещё раз." }, { status: 500, headers });
  }
}
