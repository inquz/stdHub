import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Lab } from "@/data/labs/types";
import { labSourceFiles } from "@/data/lab-source-files";

export async function readLabSources(examples: NonNullable<Lab["sourceExamples"]>) {
  return Promise.all(examples.map(async ({ file, section, title }) => {
    const { path: sourcePath, language } = labSourceFiles[file];
    const source = await readFile(path.join(process.cwd(), "public", sourcePath), "utf8");
    const marker = (boundary: string) => language === "HTML"
      ? `<!-- example:${section}:${boundary} -->`
      : `/* example:${section}:${boundary} */`;
    const startMarker = marker("start");
    const endMarker = marker("end");
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker, start + startMarker.length);
    if (start < 0 || end < 0) throw new Error(`Не найден пример ${section} в ${sourcePath}`);
    return {
      language,
      title,
      href: `/${sourcePath}`,
      source: source.slice(start + startMarker.length, end).trim(),
    };
  }));
}
