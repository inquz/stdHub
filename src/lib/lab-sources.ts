import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Lab } from "@/data/labs/types";

// Explicit allowlist: request parameters never become filesystem paths.
const files = {
  lab01: "labs/01/index.html",
  lab02: "labs/02/index.html",
};

export async function readLabSources(examples: NonNullable<Lab["sourceExamples"]>) {
  return Promise.all(examples.map(async ({ file, section, title }) => {
    const sourcePath = files[file];
    const html = await readFile(path.join(process.cwd(), "public", sourcePath), "utf8");
    const startMarker = `<!-- example:${section}:start -->`;
    const endMarker = `<!-- example:${section}:end -->`;
    const start = html.indexOf(startMarker);
    const end = html.indexOf(endMarker, start + startMarker.length);
    if (start < 0 || end < 0) throw new Error(`Не найден пример ${section} в ${sourcePath}`);
    return {
      language: "HTML",
      title,
      href: `/${sourcePath}`,
      source: html.slice(start + startMarker.length, end).trim(),
    };
  }));
}
